import { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, Category, Budget, User, ScheduledTransaction, PasswordResetToken } from '../types';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  registeredUsers: RegisteredUser[];
  registerUser: (user: RegisteredUser) => void;
  validateLogin: (email: string, password: string) => User | null;
  changePassword: (email: string, oldPassword: string, newPassword: string) => boolean;
  sendPasswordResetEmail: (email: string) => boolean;
  resetPassword: (token: string, newPassword: string) => boolean;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  scheduledTransactions: ScheduledTransaction[];
  setScheduledTransactions: (transactions: ScheduledTransaction[]) => void;
  addScheduledTransaction: (transaction: Omit<ScheduledTransaction, 'id'>) => void;
  updateScheduledTransaction: (id: string, transaction: Partial<ScheduledTransaction>) => void;
  deleteScheduledTransaction: (id: string) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Usuario de muestra
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    {
      id: '1',
      name: 'María García',
      email: 'maria@ejemplo.com',
      password: '12345678'
    }
  ]);

  const [passwordResetTokens, setPasswordResetTokens] = useState<PasswordResetToken[]>([]);

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Sin categoría', icon: '📋', isDefault: true },
    { id: '2', name: 'Alimentación', icon: '🍔' },
    { id: '3', name: 'Transporte', icon: '🚗' },
    { id: '4', name: 'Salud', icon: '⚕️' },
    { id: '5', name: 'Entretenimiento', icon: '🎬' },
    { id: '6', name: 'Educación', icon: '📚' },
    { id: '7', name: 'Vivienda', icon: '🏠' },
    { id: '8', name: 'Servicios', icon: '💡' },
    { id: '9', name: 'Gimnasio', icon: '🏋️' },
    { id: '10', name: 'Ropa', icon: '👔' },
    { id: '11', name: 'Salario', icon: '💰' },
    { id: '12', name: 'Freelance', icon: '💻' },
  ]);

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth();

  const [transactions, setTransactions] = useState<Transaction[]>([
    // Ingresos del mes actual
    { id: '101', description: 'Salario mensual', amount: 3500000, type: 'income', categoryId: '11', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-01` },
    { id: '102', description: 'Proyecto freelance web', amount: 1200000, type: 'income', categoryId: '12', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-15` },
    { id: '103', description: 'Consultoría', amount: 800000, type: 'income', categoryId: '12', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-08` },

    // Gastos del mes actual
    { id: '201', description: 'Arriendo apartamento', amount: 1200000, type: 'expense', categoryId: '7', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-05` },
    { id: '202', description: 'Mercado del mes', amount: 450000, type: 'expense', categoryId: '2', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-03` },
    { id: '203', description: 'Gasolina', amount: 180000, type: 'expense', categoryId: '3', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-07` },
    { id: '204', description: 'Mensualidad gimnasio', amount: 100000, type: 'expense', categoryId: '9', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-02` },
    { id: '205', description: 'Cine y cena', amount: 85000, type: 'expense', categoryId: '5', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-12` },
    { id: '206', description: 'Servicios públicos', amount: 320000, type: 'expense', categoryId: '8', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-10` },
    { id: '207', description: 'Internet y celular', amount: 120000, type: 'expense', categoryId: '8', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-11` },
    { id: '208', description: 'Restaurante', amount: 95000, type: 'expense', categoryId: '2', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-14` },
    { id: '209', description: 'Uber', amount: 45000, type: 'expense', categoryId: '3', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-16` },
    { id: '210', description: 'Farmacia', amount: 65000, type: 'expense', categoryId: '4', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-09` },
    { id: '211', description: 'Netflix y Spotify', amount: 48000, type: 'expense', categoryId: '5', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-13` },
    { id: '212', description: 'Curso online', amount: 250000, type: 'expense', categoryId: '6', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-06` },
    { id: '213', description: 'Supermercado', amount: 180000, type: 'expense', categoryId: '2', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-17` },
    { id: '214', description: 'Camisa nueva', amount: 120000, type: 'expense', categoryId: '10', date: `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-04` },
  ]);

  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([
    // Ingresos programados
    {
      id: 's101',
      description: 'Salario mensual',
      amount: 3500000,
      type: 'income',
      categoryId: '11',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      frequency: 'monthly'
    },
    {
      id: 's102',
      description: 'Consultoría recurrente',
      amount: 800000,
      type: 'income',
      categoryId: '12',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      frequency: 'monthly'
    },

    // Gastos programados
    {
      id: 's201',
      description: 'Arriendo apartamento',
      amount: 1200000,
      type: 'expense',
      categoryId: '7',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      frequency: 'monthly'
    },
    {
      id: 's202',
      description: 'Mensualidad gimnasio',
      amount: 100000,
      type: 'expense',
      categoryId: '9',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      frequency: 'monthly'
    },
    {
      id: 's203',
      description: 'Internet y celular',
      amount: 120000,
      type: 'expense',
      categoryId: '8',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      frequency: 'monthly'
    },
    {
      id: 's204',
      description: 'Netflix y Spotify',
      amount: 48000,
      type: 'expense',
      categoryId: '5',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      frequency: 'monthly'
    },
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    // Presupuesto global
    {
      id: 'b1',
      name: 'Presupuesto Mensual General',
      amount: 4500000,
      spent: 3378000,
      month: currentMonth
    },

    // Presupuestos por categoría con diferentes porcentajes
    {
      id: 'b2',
      name: 'Presupuesto Alimentación',
      amount: 800000,
      spent: 725000,
      categoryId: '2',
      month: currentMonth
    },
    {
      id: 'b3',
      name: 'Presupuesto Transporte',
      amount: 300000,
      spent: 225000,
      categoryId: '3',
      month: currentMonth
    },
    {
      id: 'b4',
      name: 'Presupuesto Entretenimiento',
      amount: 200000,
      spent: 228000,
      categoryId: '5',
      month: currentMonth
    },
    {
      id: 'b5',
      name: 'Presupuesto Vivienda',
      amount: 1500000,
      spent: 1200000,
      categoryId: '7',
      month: currentMonth
    },
    {
      id: 'b6',
      name: 'Presupuesto Servicios',
      amount: 500000,
      spent: 440000,
      categoryId: '8',
      month: currentMonth
    },
    {
      id: 'b7',
      name: 'Presupuesto Educación',
      amount: 300000,
      spent: 250000,
      categoryId: '6',
      month: currentMonth
    },
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const addScheduledTransaction = (transaction: Omit<ScheduledTransaction, 'id'>) => {
    const newTransaction: ScheduledTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setScheduledTransactions([...scheduledTransactions, newTransaction]);
  };

  const updateScheduledTransaction = (id: string, transactionUpdate: Partial<ScheduledTransaction>) => {
    setScheduledTransactions(scheduledTransactions.map(t => t.id === id ? { ...t, ...transactionUpdate } : t));
  };

  const deleteScheduledTransaction = (id: string) => {
    setScheduledTransactions(scheduledTransactions.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, categoryUpdate: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...categoryUpdate } : c));
  };

  const deleteCategory = (id: string) => {
    // Mover transacciones a categoría por defecto
    const defaultCategory = categories.find(c => c.isDefault);
    if (defaultCategory) {
      setTransactions(transactions.map(t =>
        t.categoryId === id ? { ...t, categoryId: defaultCategory.id } : t
      ));
      setScheduledTransactions(scheduledTransactions.map(t =>
        t.categoryId === id ? { ...t, categoryId: defaultCategory.id } : t
      ));
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, budgetUpdate: Partial<Budget>) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, ...budgetUpdate } : b));
  };

  const registerUser = (newUser: RegisteredUser) => {
    setRegisteredUsers([...registeredUsers, newUser]);
  };

  const validateLogin = (email: string, password: string): User | null => {
    const foundUser = registeredUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      return {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      };
    }

    return null;
  };

  const changePassword = (email: string, oldPassword: string, newPassword: string): boolean => {
    const userIndex = registeredUsers.findIndex(
      u => u.email === email && u.password === oldPassword
    );

    if (userIndex !== -1) {
      const updatedUsers = [...registeredUsers];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
      setRegisteredUsers(updatedUsers);
      return true;
    }

    return false;
  };

  const sendPasswordResetEmail = (email: string): boolean => {
    // Simular envío de correo - siempre retorna true para seguridad
    const token = Math.random().toString(36).substring(2);
    const newToken: PasswordResetToken = {
      email,
      token,
      expiresAt: Date.now() + 3600000, // 1 hora
      used: false,
    };
    setPasswordResetTokens([...passwordResetTokens, newToken]);
    return true;
  };

  const resetPassword = (token: string, newPassword: string): boolean => {
    const tokenIndex = passwordResetTokens.findIndex(
      t => t.token === token && !t.used && t.expiresAt > Date.now()
    );

    if (tokenIndex !== -1) {
      const resetToken = passwordResetTokens[tokenIndex];
      const userIndex = registeredUsers.findIndex(u => u.email === resetToken.email);

      if (userIndex !== -1) {
        const updatedUsers = [...registeredUsers];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
        setRegisteredUsers(updatedUsers);

        const updatedTokens = [...passwordResetTokens];
        updatedTokens[tokenIndex] = { ...updatedTokens[tokenIndex], used: true };
        setPasswordResetTokens(updatedTokens);

        return true;
      }
    }

    return false;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        registeredUsers,
        registerUser,
        validateLogin,
        changePassword,
        sendPasswordResetEmail,
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
        addBudget,
        updateBudget,
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