/** Base URL debe incluir el prefijo `/api`. */
const RAW_BASE =
  typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
  import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : 'https://ebp08-gestion-financiera-backend.onrender.com/api';

export const BASE_URL = RAW_BASE.replace(/\/+$/, '');

export type TipoTransaccionApi = 'INGRESO' | 'EGRESO';
export type FrecuenciaTransaccionApi = 'DIARIA' | 'SEMANAL' | 'MENSUAL';

export interface BackendUsuario {
  id: number;
  nombre: string;
  correo: string;
  clave?: string;
}

interface BackendUsuarioNested {
  id: number;
  nombre?: string;
  correo?: string;
}

export interface BackendCategoria {
  id: number;
  nombre: string;
  descripcion: string;
  usuario?: BackendUsuarioNested | null;
}

export interface BackendTransaccion {
  id: number;
  tipo: TipoTransaccionApi;
  monto: number | string;
  descripcion?: string;
  fecha?: string;
  categoria?: Pick<BackendCategoria, 'id' | 'nombre' | 'descripcion'> & {
    usuario?: BackendUsuarioNested | null;
  };
}

export interface BackendTransaccionProgramada {
  id: number;
  tipo: TipoTransaccionApi;
  frecuencia: FrecuenciaTransaccionApi;
  monto: number | string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string | null;
  estado?: string;
  categoria?: { id?: number };
}

export interface ResumenPresupuestoGlobal {
  presupuestoDefinido: boolean;
  montoLimite?: number | string | null;
  gastado?: number | string | null;
  disponible?: number | string | null;
  porcentajeUso?: number | string | null;
  fechaLimite?: string | null;
  mensaje?: string | null;
}

export interface ResumenPresupuestoCategoria {
  idCategoria: number;
  nombreCategoria: string;
  montoLimite: number | string;
  gastado: number | string;
  disponible?: number | string;
  porcentajeUso?: number | string;
  fechaLimite?: string | null;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const saveAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const saveUser = (user: StoredUserPayload): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export interface StoredUserPayload {
  id: string;
  name: string;
  email: string;
}

export const getStoredUser = (): StoredUserPayload | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as StoredUserPayload;
  } catch {
    return null;
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/** Decodifica el `sub` del JWT (solo para mostrar email tras login; no valida firma). */
export const decodeJwtSubject = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: string;
    };
    return json.sub ?? null;
  } catch {
    return null;
  }
};

const mergeHeaders = (headers?: HeadersInit): HeadersInit => {
  const merged: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    merged['Authorization'] = `Bearer ${token}`;
  }
  if (headers instanceof Headers) {
    headers.forEach((v, k) => {
      merged[k] = v;
    });
  } else if (Array.isArray(headers)) {
    for (const [k, v] of headers) merged[k] = v;
  } else if (headers && typeof headers === 'object') {
    Object.assign(merged, headers);
  }
  return merged;
};

function parseMaybeJsonMessage(text: string): string | null {
  try {
    const j = JSON.parse(text) as { message?: string; error?: string };
    return j.message || j.error || null;
  } catch {
    return null;
  }
}

async function handleJsonResponse<T>(response: Response, opts?: { allow401Navigate?: boolean }): Promise<T> {
  const allow401Navigate = opts?.allow401Navigate ?? true;

  if (response.status === 401 || response.status === 403) {
    if (allow401Navigate) {
      clearAuth();
      window.location.href = '/login';
    }
    const text = await response.text();
    const msg = parseMaybeJsonMessage(text) || text?.trim();
    throw new Error(msg || 'Sesión expirada o acceso denegado');
  }

  if (!response.ok) {
    const text = await response.text();
    const msg = parseMaybeJsonMessage(text) || text?.trim();
    throw new Error(msg || `Error ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('text/plain')) {
    const text = (await response.text()).trim().replace(/^"(.*)"$/, '$1');
    return text as T;
  }

  return response.json() as Promise<T>;
}

async function fetchAuthorized(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: mergeHeaders(init?.headers),
  });
}

// ——— Usuarios ———

export const registerUsuario = async (
  nombre: string,
  correo: string,
  clave: string,
): Promise<BackendUsuario> => {
  const response = await fetch(`${BASE_URL}/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, clave }),
  });
  const data = await handleJsonResponse<BackendUsuario>(response, { allow401Navigate: false });
  return data;
};

export const loginUsuario = async (correo: string, clave: string): Promise<string> => {
  const response = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, clave }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseMaybeJsonMessage(text) || text?.trim() || `Error ${response.status}`);
  }

  let tokenRaw: unknown;
  const ct = response.headers.get('content-type');
  if (ct?.includes('application/json')) {
    tokenRaw = await response.json();
  } else {
    tokenRaw = (await response.text()).trim().replace(/^"|"$/g, '');
  }

  const token =
    typeof tokenRaw === 'string'
      ? tokenRaw.replace(/^"|"$/g, '')
      : tokenRaw !== null && tokenRaw !== undefined
        ? String(tokenRaw)
        : '';

  if (!token) throw new Error('No se recibió token');

  return token;
};

export const logoutUsuarioRemoto = async (): Promise<void> => {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${BASE_URL}/usuarios/logout`, {
      method: 'POST',
      headers: mergeHeaders(),
    });
  } catch {
    /* ignore network errors on logout */
  }
};

export const actualizarClaveUsuario = async (claveAntigua: string, claveNueva: string): Promise<string> => {
  const response = await fetchAuthorized('/usuarios/actualizarClave', {
    method: 'PUT',
    body: JSON.stringify({ claveAntigua, claveNueva }),
  });
  return handleJsonResponse<string>(response, { allow401Navigate: false });
};

// ——— Categorías ———

export const crearCategoria = async (
  nombre: string,
  descripcion: string,
): Promise<BackendCategoria> => {
  const response = await fetchAuthorized('/categorias/crearCategoriaPropia', {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion }),
  });
  return handleJsonResponse<BackendCategoria>(response);
};

export const listarCategoriasUsuario = async (): Promise<BackendCategoria[]> => {
  const response = await fetchAuthorized('/categorias/usuario');
  return handleJsonResponse<BackendCategoria[]>(response);
};

export const actualizarCategoriaPropia = async (
  idCategoria: number,
  nombre: string,
  descripcion: string,
): Promise<BackendCategoria> => {
  const response = await fetchAuthorized(`/categorias/actualizarCategoriaPropia/${idCategoria}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre, descripcion }),
  });
  return handleJsonResponse<BackendCategoria>(response);
};

export const eliminarCategoriaPropia = async (idCategoria: number): Promise<void> => {
  const response = await fetchAuthorized(`/categorias/eliminarCategoriaPropia/${idCategoria}`, {
    method: 'DELETE',
  });
  await handleJsonResponse<null>(response);
};

// ——— Transacciones ———

export const crearTransaccion = async (params: {
  idCategoria?: number | null;
  tipo: TipoTransaccionApi;
  monto: number;
  descripcion?: string;
}): Promise<BackendTransaccion> => {
  const body: Record<string, unknown> = {
    tipo: params.tipo,
    monto: String(params.monto),
  };
  if (params.descripcion !== undefined && params.descripcion !== '') {
    body.descripcion = params.descripcion;
  }
  if (params.idCategoria != null && !Number.isNaN(params.idCategoria)) {
    body.idCategoria = params.idCategoria;
  }

  const response = await fetchAuthorized('/transacciones', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return handleJsonResponse<BackendTransaccion>(response);
};

export const listarTransaccionesUsuario = async (): Promise<BackendTransaccion[]> => {
  const response = await fetchAuthorized('/transacciones/usuario');
  return handleJsonResponse<BackendTransaccion[]>(response);
};

export const eliminarTransaccion = async (idTransaccion: number): Promise<void> => {
  const response = await fetchAuthorized(`/transacciones/${idTransaccion}/usuario`, {
    method: 'DELETE',
  });
  await handleJsonResponse<null>(response);
};

// ——— Transacciones programadas ———

export const crearTransaccionProgramada = async (body: {
  monto: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string | null;
  frecuencia: FrecuenciaTransaccionApi;
  tipo: TipoTransaccionApi;
  idCategoria: number;
}): Promise<BackendTransaccionProgramada> => {
  const payload = {
    ...body,
    fechaFin: body.fechaFin,
  };
  const response = await fetchAuthorized('/transacciones-programadas/usuario', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<BackendTransaccionProgramada>(response);
};

export const actualizarTransaccionProgramada = async (
  id: number,
  patch: Partial<{
    monto: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string | null;
    frecuencia: FrecuenciaTransaccionApi;
  }>,
): Promise<BackendTransaccionProgramada> => {
  const response = await fetchAuthorized(`/transacciones-programadas/usuario/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return handleJsonResponse<BackendTransaccionProgramada>(response);
};

export const eliminarTransaccionProgramada = async (id: number): Promise<void> => {
  const response = await fetchAuthorized(`/transacciones-programadas/usuario/${id}`, {
    method: 'DELETE',
  });
  await handleJsonResponse<null>(response);
};

export const listarIngresosProgramadosApi = (): Promise<BackendTransaccionProgramada[]> =>
  fetchAuthorized('/transacciones-programadas/usuario/ingresosProgramados').then((r) =>
    handleJsonResponse<BackendTransaccionProgramada[]>(r),
  );

export const listarEgresosProgramadosApi = (): Promise<BackendTransaccionProgramada[]> =>
  fetchAuthorized('/transacciones-programadas/usuario/egresosProgramados').then((r) =>
    handleJsonResponse<BackendTransaccionProgramada[]>(r),
  );

// ——— Presupuestos ———

export const crearPresupuestoGlobalApi = async (montoLimite: number): Promise<unknown> => {
  const response = await fetchAuthorized('/presupuestos/global', {
    method: 'POST',
    body: JSON.stringify({ montoLimite }),
  });
  return handleJsonResponse(response);
};

export const crearPresupuestoCategoriaApi = async (
  idCategoria: number,
  montoLimite: number,
): Promise<unknown> => {
  const response = await fetchAuthorized('/presupuestos/categoria', {
    method: 'POST',
    body: JSON.stringify({ idCategoria, montoLimite }),
  });
  return handleJsonResponse(response);
};

export const obtenerResumenPresupuestoGlobal = async (): Promise<ResumenPresupuestoGlobal> => {
  const response = await fetchAuthorized('/presupuestos/global/usuario');
  return handleJsonResponse<ResumenPresupuestoGlobal>(response);
};

export const obtenerResumenPresupuestosCategoria = async (): Promise<ResumenPresupuestoCategoria[]> => {
  const response = await fetchAuthorized('/presupuestos/categorias/usuario');
  return handleJsonResponse<ResumenPresupuestoCategoria[]>(response);
};
