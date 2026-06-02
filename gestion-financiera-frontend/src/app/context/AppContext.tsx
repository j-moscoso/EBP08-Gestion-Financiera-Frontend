// AppContext - Gestión global del estado de la aplicación
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Transaction, Category, Budget, User, ScheduledTransaction } from '../types';
import * as api from '../services/api';
import {
  mapBackendCategory,
  mapBackendTransaction,
  mapBackendScheduledTransaction,
  mapBackendBudget,
  mapFrontendTransactionType,
  mapFrontendFrequency,
  getCategoryBackendId,
  mapBackendUser,
} from '../services/mappers';
import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loadUserData: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  scheduledTransactions: ScheduledTransaction[];
  addScheduledTransaction: (transaction: Omit<ScheduledTransaction, 'id'>) => Promise<void>;
  updateScheduledTransaction: (id: string, transaction: Partial<ScheduledTransaction>) => Promise<void>;
  deleteScheduledTransaction: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);


  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const token = api.getToken();
    const storedUser = api.getStoredUser();

    if (token && storedUser) {
      // Si hay token y usuario guardado, restaurar sesión
      setUser(mapBackendUser(storedUser));
    } else if (token) {
      // Si solo hay token, crear usuario temporal
      // Los datos se cargarán cuando entre al dashboard
      setUser({
        id: 'pending',
        name: 'Usuario',
        email: ''
      });
    }
  }, []);

  // Función para iniciar sesión
  const loginWithCredentials = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      // Obtener token del backend
      const token = await api.loginUser(email, password);

      // Guardar token (limpiar prefijo Bearer si existe)
      api.saveAuthToken(token.replace(/^Bearer\s+/i, '').trim());

      // Crear usuario temporal solo con el email
      // La información completa se obtendrá al cargar los datos en el dashboard
      const temporalUser: User = {
        id: 'pending', // Se actualizará al cargar los datos
        name: email.split('@')[0], // Nombre temporal del email
        email: email
      };

      // Guardar usuario temporal
      setUser(temporalUser);

      return temporalUser;
    } catch (error) {
      api.clearAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      await api.logoutUser();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      api.clearAuth();
      setUser(null);
      setCategories([]);
      setTransactions([]);
      setScheduledTransactions([]);
      setBudgets([]);
    }
  };

  // Función para cargar todos los datos del usuario
  const loadUserData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Cargar categorías
      const backendCategories = await api.getUserCategories();
      const mappedCategories = backendCategories.map(mapBackendCategory);
      setCategories(mappedCategories);

      // Extraer y actualizar información del usuario desde las categorías
      const backendUser = backendCategories.find(c => c.usuario)?.usuario;
      if (backendUser) {
        api.saveUser(backendUser);
        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
      }

      // Cargar transacciones
      const backendTransactions = await api.getUserTransactions();
      const mappedTransactions = backendTransactions.map(mapBackendTransaction);
      setTransactions(mappedTransactions);

      // Cargar transacciones programadas (ingresos + gastos)
      const [backendIncomes, backendExpenses] = await Promise.all([
        api.getScheduledIncomes(),
        api.getScheduledExpenses(),
      ]);
      const mappedScheduled = [
        ...backendIncomes.map(mapBackendScheduledTransaction),
        ...backendExpenses.map(mapBackendScheduledTransaction),
      ];
      setScheduledTransactions(mappedScheduled);

      // Cargar presupuestos (global + por categoría)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [globalBudget, categoryBudgets] = await Promise.all([
        api.getGlobalBudgetSummary(),
        api.getCategoryBudgetsSummary(),
      ]);

      const mappedBudgets: Budget[] = [];

      // Presupuesto global
      const globalMapped = mapBackendBudget(globalBudget, currentMonth);
      if (globalMapped) {
        mappedBudgets.push(globalMapped);
      }

      // Presupuestos por categoría
      categoryBudgets.forEach(catBudget => {
        const mapped = mapBackendBudget(catBudget, currentMonth);
        if (mapped) {
          mappedBudgets.push(mapped);
        }
      });

      setBudgets(mappedBudgets);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cambiar contraseña
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.changePassword(oldPassword, newPassword);
      toast.success('Contraseña actualizada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña');
      throw error;
    }
  };

  // ===== TRANSACCIONES =====

  const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<void> => {
    try {
      const categoryBackendId = getCategoryBackendId(transaction.categoryId, categories);
      const backendType = mapFrontendTransactionType(transaction.type);

      const result = await api.createTransaction(
        categoryBackendId,
        backendType,
        transaction.amount.toString(),
        transaction.description
      );

      const newTransaction = mapBackendTransaction(result.transaccion);
      setTransactions([newTransaction, ...transactions]);

      // Recargar presupuestos para reflejar el gasto
      await loadBudgets();

      toast.success('Transacción creada');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la transacción');
      throw error;
    }
  };

  const updateTransaction = async (id: string, transactionUpdate: Partial<Omit<Transaction, 'id'>>): Promise<void> => {
    try {
      const existing = transactions.find(t => t.id === id);
      if (!existing) throw new Error('Transacción no encontrada');

      const merged = { ...existing, ...transactionUpdate };
      const categoryBackendId = getCategoryBackendId(merged.categoryId, categories);
      const backendType = mapFrontendTransactionType(merged.type);

      const updated = await api.updateTransaction(
        parseInt(id),
        categoryBackendId,
        backendType,
        merged.amount.toString(),
        merged.description
      );

      const mappedTransaction = mapBackendTransaction(updated);
      setTransactions(transactions.map(t => t.id === id ? mappedTransaction : t));

      await loadBudgets();
      toast.success('Transacción actualizada');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la transacción');
      throw error;
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      await api.deleteTransaction(parseInt(id));
      setTransactions(transactions.filter(t => t.id !== id));

      await loadBudgets();
      toast.success('Transacción eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la transacción');
      throw error;
    }
  };

  // ===== TRANSACCIONES PROGRAMADAS =====

  const addScheduledTransaction = async (transaction: Omit<ScheduledTransaction, 'id'>): Promise<void> => {
    try {
      const categoryBackendId = getCategoryBackendId(transaction.categoryId, categories);
      const backendType = mapFrontendTransactionType(transaction.type);
      const backendFrequency = mapFrontendFrequency(transaction.frequency);

      const created = await api.createScheduledTransaction(
        transaction.amount.toString(),
        transaction.description,
        transaction.startDate,
        transaction.endDate,
        backendFrequency,
        backendType,
        categoryBackendId
      );

      const newScheduled = mapBackendScheduledTransaction(created);
      setScheduledTransactions([...scheduledTransactions, newScheduled]);
      toast.success('Transacción programada creada');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la transacción programada');
      throw error;
    }
  };

  const updateScheduledTransaction = async (id: string, transactionUpdate: Partial<ScheduledTransaction>): Promise<void> => {
    try {
      const existing = scheduledTransactions.find(t => t.id === id);
      if (!existing) throw new Error('Transacción programada no encontrada');

      const merged = { ...existing, ...transactionUpdate };
      const backendFrequency = mapFrontendFrequency(merged.frequency);

      const updated = await api.updateScheduledTransaction(
        parseInt(id),
        merged.amount.toString(),
        merged.description,
        merged.startDate,
        merged.endDate,
        backendFrequency,
        'ACTIVO'
      );

      const mappedScheduled = mapBackendScheduledTransaction(updated);
      setScheduledTransactions(scheduledTransactions.map(t => t.id === id ? mappedScheduled : t));
      toast.success('Transacción programada actualizada');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la transacción programada');
      throw error;
    }
  };

  const deleteScheduledTransaction = async (id: string): Promise<void> => {
    try {
      await api.deleteScheduledTransaction(parseInt(id));
      setScheduledTransactions(scheduledTransactions.filter(t => t.id !== id));
      toast.success('Transacción programada eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la transacción programada');
      throw error;
    }
  };

  // ===== CATEGORÍAS =====

  const addCategory = async (category: Omit<Category, 'id'>): Promise<void> => {
    try {
      const created = await api.createCategory(
        category.name,
        category.icon // Usamos icon como descripción por ahora
      );

      const newCategory = mapBackendCategory(created);
      setCategories([...categories, newCategory]);
      toast.success('Categoría creada');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la categoría');
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>): Promise<void> => {
    try {
      const existing = categories.find(c => c.id === id);
      if (!existing || !existing.backendId) throw new Error('Categoría no encontrada');
      if (existing.isDefault) throw new Error('No se pueden editar categorías predeterminadas');

      const merged = { ...existing, ...categoryUpdate };
      const updated = await api.updateCategory(
        existing.backendId,
        merged.name,
        merged.icon
      );

      const mappedCategory = mapBackendCategory(updated);
      setCategories(categories.map(c => c.id === id ? mappedCategory : c));
      toast.success('Categoría actualizada');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la categoría');
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const existing = categories.find(c => c.id === id);
      if (!existing || !existing.backendId) throw new Error('Categoría no encontrada');
      if (existing.isDefault) throw new Error('No se pueden eliminar categorías predeterminadas');

      await api.deleteCategory(existing.backendId);

      // El backend mueve las transacciones a categoría por defecto automáticamente
      setCategories(categories.filter(c => c.id !== id));

      // Recargar transacciones para ver las actualizadas
      await loadTransactions();
      toast.success('Categoría eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la categoría');
      throw error;
    }
  };

  // ===== PRESUPUESTOS =====

  const addBudget = async (budget: Omit<Budget, 'id'>): Promise<void> => {
    try {
      if (budget.categoryId) {
        // Presupuesto por categoría
        const categoryBackendId = getCategoryBackendId(budget.categoryId, categories);
        await api.createOrUpdateCategoryBudget(categoryBackendId, budget.amount);
      } else {
        // Presupuesto global
        await api.createOrUpdateGlobalBudget(budget.amount);
      }

      // Recargar presupuestos
      await loadBudgets();
      toast.success('Presupuesto creado');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el presupuesto');
      throw error;
    }
  };

  const updateBudget = async (id: string, budgetUpdate: Partial<Budget>): Promise<void> => {
    try {
      const existing = budgets.find(b => b.id === id);
      if (!existing) throw new Error('Presupuesto no encontrado');

      const merged = { ...existing, ...budgetUpdate };

      if (merged.categoryId) {
        const categoryBackendId = getCategoryBackendId(merged.categoryId, categories);
        await api.createOrUpdateCategoryBudget(categoryBackendId, merged.amount);
      } else {
        await api.createOrUpdateGlobalBudget(merged.amount);
      }

      await loadBudgets();
      toast.success('Presupuesto actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el presupuesto');
      throw error;
    }
  };

  // Helpers internos para recargar datos específicos
  const loadBudgets = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [globalBudget, categoryBudgets] = await Promise.all([
        api.getGlobalBudgetSummary(),
        api.getCategoryBudgetsSummary(),
      ]);

      const mappedBudgets: Budget[] = [];

      const globalMapped = mapBackendBudget(globalBudget, currentMonth);
      if (globalMapped) {
        mappedBudgets.push(globalMapped);
      }

      categoryBudgets.forEach(catBudget => {
        const mapped = mapBackendBudget(catBudget, currentMonth);
        if (mapped) {
          mappedBudgets.push(mapped);
        }
      });

      setBudgets(mappedBudgets);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const backendTransactions = await api.getUserTransactions();
      const mappedTransactions = backendTransactions.map(mapBackendTransaction);
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loginWithCredentials,
        logout,
        loadUserData,
        changePassword,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        scheduledTransactions,
        addScheduledTransaction,
        updateScheduledTransaction,
        deleteScheduledTransaction,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        budgets,
        addBudget,
        updateBudget,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}
