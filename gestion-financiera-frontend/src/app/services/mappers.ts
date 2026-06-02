import type { Transaction, Category, Budget, User, ScheduledTransaction } from '../types';
import type {
  BackendTransaction,
  BackendCategory,
  BackendBudget,
  BackendUser,
  BackendScheduledTransaction,
  BackendBudgetSummary,
  BackendCategoryBudgetSummary
} from './api';

// ===== MAPPERS: BACKEND → FRONTEND =====

export function mapBackendUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id.toString(),
    name: backendUser.nombre,
    email: backendUser.correo,
  };
}

export function mapBackendCategory(backendCategory: BackendCategory): Category {
  const nombreCompleto = backendCategory.nombre;

  // Intentar extraer emoji y nombre usando el primer espacio como separador
  // Formato esperado: "emoji nombre" (ej: "🏋️ GIMNASIO")
  const firstSpaceIdx = nombreCompleto.indexOf(' ');

  let icon = '📋'; // icono por defecto
  let name = nombreCompleto;

  if (firstSpaceIdx > 0) {
    const possibleEmoji = nombreCompleto.slice(0, firstSpaceIdx);
    const possibleName = nombreCompleto.slice(firstSpaceIdx + 1).trim();

    // Verificar si el primer segmento parece un emoji
    // Los emojis tienen longitud de caracteres muy corta (generalmente 1-4 chars)
    if (possibleEmoji.length <= 4 && possibleName.length > 0) {
      icon = possibleEmoji;
      name = possibleName;
    }
  }

  // Mapeo de iconos por nombre para categorías predeterminadas (sin emoji en el nombre)
  const iconMap: Record<string, string> = {
    'Sin categoría': '📋',
    'Alimentación': '🍔',
    'Transporte': '🚗',
    'Salud': '⚕️',
    'Entretenimiento': '🎬',
    'Educación': '📚',
    'Vivienda': '🏠',
    'Servicios': '💡',
    'Gimnasio': '🏋️',
    'Ropa': '👔',
    'Salario': '💰',
    'Freelance': '💻',
  };

  // Si no se extrajo emoji, buscar en el mapa de predeterminadas
  if (icon === '📋' && iconMap[nombreCompleto]) {
    icon = iconMap[nombreCompleto];
    name = nombreCompleto;
  }

  return {
    id: backendCategory.id.toString(),
    name: name,
    description: backendCategory.descripcion,
    icon: icon,
    isDefault: backendCategory.usuario === null,
    backendId: backendCategory.id,
  };
}

export function mapBackendTransaction(backendTransaction: BackendTransaction): Transaction {
  return {
    id: backendTransaction.id.toString(),
    description: backendTransaction.descripcion || '',
    amount: backendTransaction.monto,
    type: backendTransaction.tipo === 'INGRESO' ? 'income' : 'expense',
    categoryId: backendTransaction.categoria?.id.toString() || '1',
    date: backendTransaction.fecha.split('T')[0], // YYYY-MM-DD
  };
}

export function mapBackendScheduledTransaction(backendScheduled: BackendScheduledTransaction): ScheduledTransaction {
  const frequencyMap: Record<string, 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
    'DIARIA': 'daily',
    'SEMANAL': 'weekly',
    'MENSUAL': 'monthly',
    'ANUAL': 'yearly',
  };

  return {
    id: backendScheduled.id.toString(),
    description: backendScheduled.descripcion || '',
    amount: backendScheduled.monto,
    type: backendScheduled.tipo === 'INGRESO' ? 'income' : 'expense',
    categoryId: backendScheduled.categoria?.id.toString() || '1',
    startDate: backendScheduled.fechaInicio,
    endDate: backendScheduled.fechaFin,
    frequency: frequencyMap[backendScheduled.frecuencia] || 'monthly',
  };
}

export function mapBackendBudget(
  backendBudget: BackendBudget | BackendBudgetSummary | BackendCategoryBudgetSummary,
  currentMonth: string
): Budget | null {
  // Si es BackendBudgetSummary y no hay presupuesto definido, retornar null
  if ('presupuestoDefinido' in backendBudget && !backendBudget.presupuestoDefinido) {
    return null;
  }

  // BackendCategoryBudgetSummary
  if ('idPresupuesto' in backendBudget && 'nombreCategoria' in backendBudget) {
    return {
      id: backendBudget.idPresupuesto.toString(),
      name: `Presupuesto ${backendBudget.nombreCategoria}`,
      amount: backendBudget.montoLimite,
      spent: backendBudget.gastado,
      categoryId: backendBudget.idCategoria.toString(),
      month: currentMonth,
    };
  }

  // BackendBudgetSummary (global)
  if ('presupuestoDefinido' in backendBudget && backendBudget.idPresupuesto) {
    return {
      id: backendBudget.idPresupuesto.toString(),
      name: 'Presupuesto Mensual General',
      amount: backendBudget.montoLimite || 0,
      spent: backendBudget.gastado || 0,
      month: currentMonth,
    };
  }

  // BackendBudget regular
  if ('id' in backendBudget) {
    return {
      id: backendBudget.id.toString(),
      name: backendBudget.categoria
        ? `Presupuesto ${backendBudget.categoria.nombre}`
        : 'Presupuesto Mensual General',
      amount: backendBudget.montoLimite,
      spent: 0, // El backend no devuelve spent en este formato
      categoryId: backendBudget.categoria?.id.toString(),
      month: currentMonth,
    };
  }

  return null;
}

// ===== MAPPERS: FRONTEND → BACKEND =====

export function mapFrontendTransactionType(type: 'income' | 'expense'): 'INGRESO' | 'EGRESO' {
  return type === 'income' ? 'INGRESO' : 'EGRESO';
}

export function mapFrontendFrequency(frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL' {
  const frequencyMap: Record<string, 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL'> = {
    'daily': 'DIARIA',
    'weekly': 'SEMANAL',
    'monthly': 'MENSUAL',
    'yearly': 'ANUAL',
  };
  return frequencyMap[frequency];
}

// Helper para obtener el ID numérico del backend desde el ID string del frontend
export function getCategoryBackendId(categoryId: string, categories: Category[]): number {
  const category = categories.find(c => c.id === categoryId);
  if (!category || !category.backendId) {
    throw new Error(`Categoría ${categoryId} no encontrada o sin backendId`);
  }
  return category.backendId;
}
