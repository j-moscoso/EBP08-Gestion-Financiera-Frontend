export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
}

export interface ScheduledTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  /** Categorías del sistema / globales del backend (no editables vía API) */
  readonly?: boolean;
  /** Solo uso interno: descripción sincronizada con el backend al editar */
  descripcionBackend?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId?: string; // undefined = presupuesto global
  month: string; // formato: "2026-03" (YYYY-MM)
  /** Texto informativo del API (ej. `mensaje` del resumen global). */
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}
