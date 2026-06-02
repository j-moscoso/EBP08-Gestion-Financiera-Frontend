const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eko-mj59.onrender.com/api';

// ===== TIPOS DEL BACKEND =====

export interface BackendUser {
  id: number;
  nombre: string;
  correo: string;
  clave?: string;
  fechaRegistro?: string;
  estado?: string;
}

export interface BackendCategory {
  id: number;
  nombre: string;
  descripcion: string;
  usuario?: BackendUser | null;
}

export interface BackendTransaction {
  id: number;
  usuario?: BackendUser;
  categoria?: BackendCategory;
  tipo: 'INGRESO' | 'EGRESO';
  descripcion?: string;
  monto: number;
  fecha: string;
}

export interface BackendScheduledTransaction {
  id: number;
  usuario?: BackendUser;
  categoria?: BackendCategory;
  tipo: 'INGRESO' | 'EGRESO';
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
  estado?: 'ACTIVO' | 'INACTIVO';
  monto: number;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  ultimaEjecucion?: string | null;
}

export interface BackendBudget {
  id: number;
  usuario?: BackendUser;
  categoria?: BackendCategory | null;
  montoLimite: number;
  fechaLimite?: string;
}

export interface BackendBudgetSummary {
  presupuestoDefinido: boolean;
  idPresupuesto: number | null;
  montoLimite: number | null;
  gastado: number | null;
  disponible: number | null;
  porcentajeUso: number | null;
  fechaLimite: string | null;
  mensaje: string | null;
}

export interface BackendCategoryBudgetSummary {
  idPresupuesto: number;
  idCategoria: number;
  nombreCategoria: string;
  montoLimite: number;
  gastado: number;
  disponible: number;
  porcentajeUso: number;
  fechaLimite: string;
}

export interface BackendRegistrationResponse {
  usuario: BackendUser;
  codigosRecuperacion: string[];
}

// ===== HELPERS =====

export const getToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  console.log('[getToken] Token leído:', token ? `${token.substring(0, 20)}...` : 'NULL');
  return token;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[getAuthHeaders] Header construido con token:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.warn('[getAuthHeaders] ⚠️ No hay token - header sin Authorization');
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  console.log('[handleResponse] Status:', response.status, 'URL:', response.url);

  // Manejar errores de autenticación
  if (response.status === 401 || response.status === 403) {
    const token = localStorage.getItem('authToken');
    console.error('[handleResponse] ❌ Error de autenticación:', response.status);
    console.error('[handleResponse] Token existe?', !!token);
    console.error('[handleResponse] Path actual:', window.location.pathname);

    // Solo limpiar sesión si hay token guardado y no estamos en login
    if (token && !window.location.pathname.includes('/login')) {
      console.warn('[handleResponse] 🗑️ BORRANDO TOKEN por sesión expirada');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Leer el mensaje de error del backend
    let errorMessage = 'No autorizado';
    try {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    } catch {
      // Si no se puede leer el texto, usar mensaje por defecto
    }
    throw new Error(errorMessage);
  }

  // Manejar otros errores HTTP
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    try {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    } catch {
      // Si no se puede leer el texto, usar mensaje por defecto
    }
    throw new Error(errorMessage);
  }

  // Manejar respuestas exitosas sin contenido
  if (response.status === 204) {
    return null as T;
  }

  // Manejar respuestas de texto plano
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/plain')) {
    const text = await response.text();
    return text as T;
  }

  // Manejar respuestas JSON
  return response.json();
};

// ===== USUARIOS =====

export const registerUser = async (
  nombre: string,
  correo: string,
  clave: string
): Promise<BackendRegistrationResponse> => {
  const response = await fetch(`${BASE_URL}/usuarios/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre, correo, clave }),
  });

  return handleResponse<BackendRegistrationResponse>(response);
};

export const loginUser = async (
  correo: string,
  clave: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, clave }),
  });

  return handleResponse<string>(response);
};

export const logoutUser = async (): Promise<void> => {
  console.log('[logoutUser] Iniciando logout...');
  const response = await fetch(`${BASE_URL}/usuarios/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  await handleResponse<void>(response);
  console.log('[logoutUser] ✅ Logout exitoso en backend');
  // NO borramos el token aquí porque AppContext lo hace con clearAuth()
};

export const changePassword = async (
  claveAntigua: string,
  claveNueva: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/usuarios/actualizarClave`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ claveAntigua, claveNueva }),
  });

  return handleResponse<string>(response);
};

export const recoverPassword = async (
  correo: string,
  codigo: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/usuarios/recover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, codigo }),
  });

  return handleResponse<string>(response);
};

export const resetPassword = async (
  tokenTemporal: string,
  nuevaClave: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/usuarios/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tokenTemporal, nuevaClave }),
  });

  return handleResponse<string>(response);
};

// ===== CATEGORÍAS =====

export const createCategory = async (
  nombre: string,
  descripcion: string
): Promise<BackendCategory> => {
  const response = await fetch(`${BASE_URL}/categorias/crearCategoriaPropia`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, descripcion }),
  });

  return handleResponse<BackendCategory>(response);
};

export const updateCategory = async (
  idCategoria: number,
  nombre: string,
  descripcion: string
): Promise<BackendCategory> => {
  const response = await fetch(`${BASE_URL}/categorias/actualizarCategoriaPropia/${idCategoria}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, descripcion }),
  });

  return handleResponse<BackendCategory>(response);
};

export const deleteCategory = async (idCategoria: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/categorias/eliminarCategoriaPropia/${idCategoria}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

export const getUserCategories = async (): Promise<BackendCategory[]> => {
  const response = await fetch(`${BASE_URL}/categorias/usuario`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendCategory[]>(response);
};

// ===== TRANSACCIONES =====

export const createTransaction = async (
  idCategoria: number,
  tipo: 'INGRESO' | 'EGRESO',
  monto: string,
  descripcion?: string
): Promise<{ transaccion: BackendTransaction; alertasGeneradas: any[] }> => {
  const response = await fetch(`${BASE_URL}/transacciones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      idCategoria,
      tipo,
      monto,
      descripcion
    }),
  });

  return handleResponse<{ transaccion: BackendTransaction; alertasGeneradas: any[] }>(response);
};

export const getUserTransactions = async (): Promise<BackendTransaction[]> => {
  const response = await fetch(`${BASE_URL}/transacciones/usuario`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendTransaction[]>(response);
};

export const getIncomeTransactions = async (): Promise<BackendTransaction[]> => {
  const response = await fetch(`${BASE_URL}/transacciones/usuario/ingresos`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendTransaction[]>(response);
};

export const getExpenseTransactions = async (): Promise<BackendTransaction[]> => {
  const response = await fetch(`${BASE_URL}/transacciones/usuario/gastos`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendTransaction[]>(response);
};

export const updateTransaction = async (
  idTransaccion: number,
  idCategoria: number,
  tipo: 'INGRESO' | 'EGRESO',
  monto: string,
  descripcion?: string
): Promise<BackendTransaction> => {
  const response = await fetch(`${BASE_URL}/transacciones/${idTransaccion}/usuario`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      idCategoria,
      tipo,
      monto,
      descripcion
    }),
  });

  return handleResponse<BackendTransaction>(response);
};

export const deleteTransaction = async (idTransaccion: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/transacciones/${idTransaccion}/usuario`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// ===== TRANSACCIONES PROGRAMADAS =====

export const createScheduledTransaction = async (
  monto: string,
  descripcion: string,
  fechaInicio: string,
  fechaFin: string,
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL',
  tipo: 'INGRESO' | 'EGRESO',
  idCategoria: number
): Promise<BackendScheduledTransaction> => {
  const response = await fetch(`${BASE_URL}/transacciones-programadas/usuario`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      monto,
      descripcion,
      fechaInicio,
      fechaFin,
      frecuencia,
      tipo,
      idCategoria
    }),
  });

  return handleResponse<BackendScheduledTransaction>(response);
};

export const updateScheduledTransaction = async (
  id: number,
  monto: string,
  descripcion: string,
  fechaInicio: string,
  fechaFin: string,
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL',
  estado: 'ACTIVO' | 'INACTIVO'
): Promise<BackendScheduledTransaction> => {
  const response = await fetch(`${BASE_URL}/transacciones-programadas/usuario/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      monto,
      descripcion,
      fechaInicio,
      fechaFin,
      frecuencia,
      estado
    }),
  });

  return handleResponse<BackendScheduledTransaction>(response);
};

export const deleteScheduledTransaction = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/transacciones-programadas/usuario/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

export const getScheduledIncomes = async (): Promise<BackendScheduledTransaction[]> => {
  const response = await fetch(`${BASE_URL}/transacciones-programadas/usuario/ingresosProgramados`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendScheduledTransaction[]>(response);
};

export const getScheduledExpenses = async (): Promise<BackendScheduledTransaction[]> => {
  const response = await fetch(`${BASE_URL}/transacciones-programadas/usuario/egresosProgramados`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendScheduledTransaction[]>(response);
};

// ===== PRESUPUESTOS =====

export const createOrUpdateGlobalBudget = async (
  montoLimite: number
): Promise<BackendBudget> => {
  const response = await fetch(`${BASE_URL}/presupuestos/global`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ montoLimite }),
  });

  return handleResponse<BackendBudget>(response);
};

export const createOrUpdateCategoryBudget = async (
  idCategoria: number,
  montoLimite: number
): Promise<BackendBudget> => {
  const response = await fetch(`${BASE_URL}/presupuestos/categoria`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ idCategoria, montoLimite }),
  });

  return handleResponse<BackendBudget>(response);
};

export const getGlobalBudgetSummary = async (): Promise<BackendBudgetSummary> => {
  const response = await fetch(`${BASE_URL}/presupuestos/global/usuario`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendBudgetSummary>(response);
};

export const getCategoryBudgetsSummary = async (): Promise<BackendCategoryBudgetSummary[]> => {
  const response = await fetch(`${BASE_URL}/presupuestos/categorias/usuario`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendCategoryBudgetSummary[]>(response);
};

// ===== REPORTES =====

export const getExpensesByCategory = async (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await fetch(`${BASE_URL}/reports/expenses?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Array<{
    idCategoria: number;
    nombreCategoria: string;
    totalGastado: number;
    cantidadTransacciones: number;
  }>>(response);
};

export const getIncomeByCategory = async (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await fetch(`${BASE_URL}/reports/income?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Array<{
    idCategoria: number;
    nombreCategoria: string;
    totalIngresado: number;
    cantidadTransacciones: number;
  }>>(response);
};

export const getMonthlySummary = async (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await fetch(`${BASE_URL}/reports/summary?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<{
    totalIngresos: number;
    totalEgresos: number;
    balance: number;
    porcentajeAhorro: number;
    mes: number;
    anio: number;
  }>(response);
};

export const getMonthlyComparison = async (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await fetch(`${BASE_URL}/reports/monthly-comparison?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<{
    nombreUsuario: string;
    mes: number;
    anio: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    estadoBalance: string;
    montoDeficit: number;
    porcentajeAhorro: number;
    datosGrafico: {
      ingresos: number;
      gastos: number;
    };
    movimientosResumen: Array<{
      fecha: string;
      tipo: string;
      categoria: string;
      monto: number;
      descripcion: string;
    }>;
  }>(response);
};

// ===== ALERTAS =====

export const getUserAlerts = async () => {
  const response = await fetch(`${BASE_URL}/alertas/usuario`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Array<{
    id: number;
    presupuestoId: number;
    tipo: string;
    mensaje: string;
    fecha: string;
  }>>(response);
};

// ===== RECOMENDACIONES =====

export const getBalanceRecommendations = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/recomendaciones/balance`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<string>(response);
};

export const getAlertRecommendations = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/recomendaciones/alertas`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<string>(response);
};

// ===== HELPERS DE ALMACENAMIENTO =====

export const saveAuthToken = (token: string): void => {
  console.log('[saveAuthToken] Token recibido (primeros 20 chars):', token.substring(0, 20));
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  console.log('[saveAuthToken] Token limpio (primeros 20 chars):', cleanToken.substring(0, 20));
  localStorage.setItem('authToken', cleanToken);
  console.log('[saveAuthToken] ✅ Token guardado en localStorage');

  // Verificar inmediatamente que se guardó
  const verificacion = localStorage.getItem('authToken');
  console.log('[saveAuthToken] Verificación - Token en storage:', verificacion ? `${verificacion.substring(0, 20)}...` : 'NULL');
};

export const saveUser = (user: BackendUser): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = (): BackendUser | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const clearAuth = (): void => {
  console.warn('[clearAuth] 🗑️ BORRANDO token y usuario');
  console.trace('[clearAuth] Stack trace:');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('[clearAuth] ✅ Token y usuario borrados');
};
