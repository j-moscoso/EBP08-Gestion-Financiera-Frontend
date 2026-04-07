import { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, Category, Budget, User } from '../types';

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
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Sin categoría', icon: '📋', isDefault: true },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
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

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        registeredUsers,
        registerUser,
        validateLogin,
        transactions,
        setTransactions,
        addTransaction,
        categories,
        setCategories,
        addCategory,
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