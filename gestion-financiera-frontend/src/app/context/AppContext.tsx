import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Transaction, Category, Budget, User, ScheduledTransaction } from '../types';
import type {
  BackendCategoria,
  BackendTransaccion,
  BackendTransaccionProgramada,
  FrecuenciaTransaccionApi,
  ResumenPresupuestoCategoria,
  ResumenPresupuestoGlobal,
  TipoTransaccionApi,
} from '../services/api';
import * as api from '../services/api';
import { apiDateToLocalYmd } from '../lib/calendarDate';

const ICON_FALLBACK = ['📁', '💼', '🏠', '🍔', '💳', '🎯', '📌', '🧾'];

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function pickIconForName(name: string): string {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ICON_FALLBACK[hash % ICON_FALLBACK.length] ?? '📁';
}

function mapBackendCategory(c: BackendCategoria): Category {
  const isGlobal = c.usuario == null;
  const isDefaultCat = c.nombre.trim().toUpperCase() === 'OTROS';
  return {
    id: String(c.id),
    name: c.nombre,
    descripcionBackend: c.descripcion,
    icon: isGlobal ? '🌐' : pickIconForName(c.nombre),
    isDefault: isDefaultCat,
    readonly: isGlobal,
  };
}

function mapBackendTransaction(tx: BackendTransaccion): Transaction {
  const dateSlice = apiDateToLocalYmd(tx.fecha ?? null);
  const categoryId =
    tx.categoria?.id !== undefined ? String(tx.categoria.id) : '';

  const kind: Transaction['type'] =
    tx.tipo === 'INGRESO' ? 'income' : 'expense';

  return {
    id: String(tx.id),
    description: tx.descripcion?.trim() || '—',
    amount: toNumber(tx.monto),
    type: kind,
    categoryId,
    date: dateSlice,
  };
}

function mapFrequencyToFrontend(
  f: FrecuenciaTransaccionApi,
): ScheduledTransaction['frequency'] {
  switch (f) {
    case 'DIARIA':
      return 'daily';
    case 'SEMANAL':
      return 'weekly';
    case 'MENSUAL':
    default:
      return 'monthly';
  }
}

function mapFrequencyToApi(
  f: ScheduledTransaction['frequency'],
): FrecuenciaTransaccionApi {
  switch (f) {
    case 'daily':
      return 'DIARIA';
    case 'weekly':
      return 'SEMANAL';
    case 'yearly':
    case 'monthly':
    default:
      return 'MENSUAL';
  }
}

function mapScheduledFromApi(p: BackendTransaccionProgramada): ScheduledTransaction {
  const start = p.fechaInicio ? apiDateToLocalYmd(p.fechaInicio) : '';
  const fin = p.fechaFin ? apiDateToLocalYmd(p.fechaFin) : start;
  return {
    id: String(p.id),
    description: p.descripcion?.trim() || '—',
    amount: toNumber(p.monto),
    type: p.tipo === 'INGRESO' ? 'income' : 'expense',
    categoryId: String(p.categoria?.id ?? ''),
    startDate: start,
    endDate: fin,
    frequency: mapFrequencyToFrontend(p.frecuencia),
  };
}

function buildBudgetsFromApi(
  global: ResumenPresupuestoGlobal,
  categorias: ResumenPresupuestoCategoria[],
): Budget[] {
  const list: Budget[] = [];

  const msgGlobal = global.mensaje?.trim();

  if (global.presupuestoDefinido && global.montoLimite != null && global.fechaLimite) {
    const monthSlice = apiDateToLocalYmd(global.fechaLimite).slice(0, 7);
    list.push({
      id: `global-${monthSlice}`,
      name: 'Presupuesto mensual global',
      amount: toNumber(global.montoLimite),
      spent: toNumber(global.gastado),
      categoryId: undefined,
      month: monthSlice,
      description: msgGlobal || undefined,
    });
  }

  for (const row of categorias) {
    if (!row.fechaLimite) continue;
    const monthSlice = apiDateToLocalYmd(row.fechaLimite).slice(0, 7);
    list.push({
      id: `cat-${row.idCategoria}-${monthSlice}`,
      name: `${row.nombreCategoria}`,
      amount: toNumber(row.montoLimite),
      spent: toNumber(row.gastado),
      categoryId: String(row.idCategoria),
      month: monthSlice,
    });
  }

  return list;
}

function mapUsuarioRegistro(u: api.BackendUsuario): User {
  return {
    id: String(u.id),
    name: u.nombre,
    email: u.correo,
  };
}

function userFromJwtAndStored(jwtCorreo: string): User {
  const stored = api.getStoredUser();
  const emailNorm = jwtCorreo.trim().toLowerCase();
  if (stored && stored.email.trim().toLowerCase() === emailNorm) {
    return { id: stored.id, name: stored.name, email: stored.email };
  }
  const local = jwtCorreo.split('@')[0] || jwtCorreo;
  const pretty = local.length > 0 ? local.charAt(0).toUpperCase() + local.slice(1) : jwtCorreo;

  return { id: '0', name: pretty, email: jwtCorreo };
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  registerAndSignIn: (name: string, email: string, password: string) => Promise<User>;
  validateLogin: (email: string, password: string) => Promise<User | null>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  recoverPassword: (email: string, code: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  scheduledTransactions: ScheduledTransaction[];
  setScheduledTransactions: (transactions: ScheduledTransaction[]) => void;
  addScheduledTransaction: (transaction: Omit<ScheduledTransaction, 'id'>) => Promise<void>;
  updateScheduledTransaction: (
    id: string,
    transaction: Partial<ScheduledTransaction>,
  ) => Promise<void>;
  deleteScheduledTransaction: (id: string) => Promise<void>;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  /** Último resumen global del API (sirve sobre todo para `mensaje` cuando no hay presupuesto definido). */
  resumenPresupuestoGlobal: ResumenPresupuestoGlobal | null;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  refreshFromBackend: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function readStoredSessionUser(): User | null {
  const tok = api.getToken();
  const saved = api.getStoredUser();
  if (!tok || !saved) return null;
  return { id: saved.id, name: saved.name, email: saved.email };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredSessionUser());
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [resumenPresupuestoGlobal, setResumenPresupuestoGlobal] =
    useState<ResumenPresupuestoGlobal | null>(null);

  const syncFromBackend = useCallback(async () => {
    if (!api.getToken()) return;

    const [rawCats, rawTx, globalRes, catsB, incP, egP] = await Promise.all([
      api.listarCategoriasUsuario(),
      api.listarTransaccionesUsuario(),
      api.obtenerResumenPresupuestoGlobal(),
      api.obtenerResumenPresupuestosCategoria(),
      api.listarIngresosProgramadosApi(),
      api.listarEgresosProgramadosApi(),
    ]);

    setCategories(rawCats.map(mapBackendCategory));

    rawTx.sort((a, b) => {
      const da = String(a.fecha ?? '');
      const db = String(b.fecha ?? '');
      return db.localeCompare(da);
    });
    setTransactions(rawTx.map(mapBackendTransaction));
    setResumenPresupuestoGlobal(globalRes);
    setBudgets(buildBudgetsFromApi(globalRes, catsB));

    const combined = [...incP, ...egP].map(mapScheduledFromApi);
    setScheduledTransactions(combined);
  }, []);

  const refreshFromBackend = useCallback(async () => {
    try {
      await syncFromBackend();
    } catch {
      throw new Error('No se pudieron cargar los datos del servidor.');
    }
  }, [syncFromBackend]);

  useEffect(() => {
    if (!user || !api.getToken()) return;
    syncFromBackend().catch(() => {
      /** Error de red: no cerramos sesión automáticamente; el usuario puede reintentar al navegar */
    });
  }, [user, syncFromBackend]);

  const txToTipo = (kind: Transaction['type']): TipoTransaccionApi =>
    kind === 'income' ? 'INGRESO' : 'EGRESO';

  const addTransaction = async (payload: Omit<Transaction, 'id'>) => {
    const cid = payload.categoryId ? Number(payload.categoryId) : undefined;

    await api.crearTransaccion({
      idCategoria:
        cid !== undefined &&
        cid !== null &&
        !Number.isNaN(cid) &&
        payload.categoryId !== ''
          ? cid
          : undefined,
      tipo: txToTipo(payload.type),
      monto: payload.amount,
      descripcion: payload.description,
    });
    await syncFromBackend().catch(() => undefined);
  };

  const registerAndSignIn = async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const created = await api.registerUsuario(name.trim(), email.trim(), password);
    const token = await api.loginUsuario(email.trim(), password);
    api.saveAuthToken(token);
    api.saveRecoveryCodes(created.codigosRecuperacion);

    const appUser = mapUsuarioRegistro(created.usuario);
    api.saveUser({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
    });
    // Guardar usuario en estado; la sincronización con el backend
    // se realiza desde el efecto `useEffect` que escucha `user`.
    setUser(appUser);
    return appUser;
  };

  const validateLogin = async (
    email: string,
    password: string,
  ): Promise<User | null> => {
    const token = await api.loginUsuario(email.trim(), password);
    api.saveAuthToken(token);
    const sub = api.decodeJwtSubject(token);
    if (!sub) {
      api.clearAuth();
      return null;
    }
    const appUser = userFromJwtAndStored(sub);
    api.saveUser({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
    });
    // Guardar usuario en estado; `syncFromBackend` será lanzado
    // automáticamente por el efecto que escucha cambios en `user`.
    setUser(appUser);
    return appUser;
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      await api.actualizarClaveUsuario(oldPassword, newPassword);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error('No se pudo actualizar la contraseña. Intenta de nuevo.');
    }
  };

  const recoverPassword = async (email: string, code: string): Promise<string> => {
    return api.recuperarPasswordUsuario(email.trim(), code.trim());
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    await api.resetPasswordConTokenTemporal(token.trim(), newPassword);
    return true;
  };

  const addScheduledTransaction = async (t: Omit<ScheduledTransaction, 'id'>) => {
    const tipo: TipoTransaccionApi = t.type === 'income' ? 'INGRESO' : 'EGRESO';
    await api.crearTransaccionProgramada({
      monto: String(t.amount),
      descripcion: t.description,
      fechaInicio: t.startDate,
      fechaFin: t.endDate || null,
      frecuencia: mapFrequencyToApi(t.frequency),
      tipo,
      idCategoria: Number(t.categoryId),
    });
    await syncFromBackend().catch(() => undefined);
  };

  const updateScheduledTransaction = async (
    id: string,
    partial: Partial<ScheduledTransaction>,
  ) => {
    const body: Parameters<typeof api.actualizarTransaccionProgramada>[1] = {};
    if (partial.amount !== undefined) body.monto = String(partial.amount);
    if (partial.description !== undefined) body.descripcion = partial.description;
    if (partial.startDate !== undefined) body.fechaInicio = partial.startDate;
    if (partial.endDate !== undefined) body.fechaFin = partial.endDate || null;
    if (partial.frequency !== undefined) body.frecuencia = mapFrequencyToApi(partial.frequency);

    await api.actualizarTransaccionProgramada(Number(id), body);
    await syncFromBackend().catch(() => undefined);
  };

  const deleteScheduledTransaction = async (id: string) => {
    await api.eliminarTransaccionProgramada(Number(id));
    await syncFromBackend().catch(() => undefined);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const desc = category.name.trim();
    await api.crearCategoria(category.name.trim(), category.descripcionBackend || desc);
    await syncFromBackend();
  };

  const updateCategory = async (id: string, fields: Partial<Category>) => {
    const existing = categories.find((c) => c.id === id);
    const cid = Number(id);
    const name = (fields.name ?? existing?.name ?? '').trim();
    if (!name) throw new Error('Nombre inválido');
    const descripcion =
      (fields.descripcionBackend ?? existing?.descripcionBackend ?? name).trim() || name;
    await api.actualizarCategoriaPropia(cid, name, descripcion);
    await syncFromBackend().catch(() => undefined);
  };

  const deleteCategory = async (id: string) => {
    await api.eliminarCategoriaPropia(Number(id));
    await syncFromBackend().catch(() => undefined);
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    const limit = Number(budget.amount);
    if (!Number.isFinite(limit) || limit <= 0) throw new Error('Monto inválido');

    if (budget.categoryId) {
      await api.crearPresupuestoCategoriaApi(Number(budget.categoryId), limit);
    } else {
      await api.crearPresupuestoGlobalApi(limit);
    }
    await syncFromBackend().catch(() => undefined);
  };

  const updateBudget = (id: string, budgetUpdate: Partial<Budget>) => {
    setBudgets((budgets) => budgets.map((b) => (b.id === id ? { ...b, ...budgetUpdate } : b)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        registerAndSignIn,
        validateLogin,
        changePassword,
        recoverPassword,
        resetPassword,
        transactions,
        setTransactions,
        addTransaction,
        scheduledTransactions,
        setScheduledTransactions,
        addScheduledTransaction,
        updateScheduledTransaction,
        deleteScheduledTransaction,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        budgets,
        setBudgets,
        resumenPresupuestoGlobal,
        addBudget,
        updateBudget,
        refreshFromBackend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}
