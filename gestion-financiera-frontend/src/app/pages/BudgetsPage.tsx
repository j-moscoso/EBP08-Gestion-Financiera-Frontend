import { useState, useEffect } from 'react';
import { Plus, Target, AlertCircle, Calendar, TrendingDown, CheckCircle2, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getCategoryBudgetsSummary } from '../services/api';
import type { BackendCategoryBudgetSummary } from '../services/api';

export function BudgetsPage() {
  const { budgets, addBudget, transactions, alerts, categories } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [budgetType, setBudgetType] = useState<'global' | 'category'>('global');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [categoryBudgetsSummary, setCategoryBudgetsSummary] = useState<BackendCategoryBudgetSummary[]>([]);

  // Cargar presupuestos de categorías desde el backend
  useEffect(() => {
    const loadCategoryBudgets = async () => {
      try {
        const budgetsSummary = await getCategoryBudgetsSummary();
        console.log('[BudgetsPage] Presupuestos por categoría cargados:', budgetsSummary.length);
        setCategoryBudgetsSummary(budgetsSummary);
      } catch (error: any) {
        console.error('[BudgetsPage] Error al cargar presupuestos:', error);
      }
    };

    loadCategoryBudgets();
  }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast.error('Por favor ingresa el monto límite');
      return;
    }

    if (budgetType === 'category' && !categoryId) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    addBudget({
      name: budgetType === 'global' ? 'Presupuesto Global' : 'Presupuesto de Categoría',
      amount: parseFloat(amount),
      spent: 0,
      categoryId: budgetType === 'category' ? categoryId : undefined,
      month: selectedMonth,
    });

    toast.success('Presupuesto creado exitosamente');

    // Reset form
    setAmount('');
    setCategoryId('');
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgress = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-destructive';
    if (progress >= 80) return 'bg-orange-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getStatusIcon = (progress: number) => {
    if (progress >= 100) return <AlertCircle className="w-5 h-5 text-destructive" />;
    if (progress >= 80) return <AlertCircle className="w-5 h-5 text-orange-500" />;
    return <CheckCircle2 className="w-5 h-5 text-primary" />;
  };

  const filteredBudgets = budgets.filter(b => b.month === selectedMonth);
  const globalBudget = filteredBudgets.find(b => !b.categoryId);

  // Categorías disponibles para asignar presupuesto
  // Incluye tanto categorías globales del sistema como personalizadas del usuario
  const availableCategories = categories;

  // Calcular gasto total del mes
  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalSpent = getTotalSpent();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">Presupuestos</h1>
          <p className="text-muted-foreground">
            Define y controla tus límites de gasto mensual
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-11 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Presupuesto</span>
          </button>
        </div>
      </div>

      {/* Formulario de Nuevo Presupuesto */}
      {showForm && (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">Crear Nuevo Presupuesto</h2>
            </div>

            {/* Tipo de Presupuesto */}
            <div>
              <label className="block text-foreground mb-2">
                Tipo de presupuesto
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBudgetType('global')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    budgetType === 'global'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('category')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    budgetType === 'category'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Por Categoría
                </button>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label htmlFor="amount" className="block text-foreground mb-2">
                Monto límite
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                required
              />
            </div>

            {/* Categoría (solo si es por categoría) */}
            {budgetType === 'category' && (
              <div>
                <label htmlFor="category" className="block text-foreground mb-2">
                  Categoría
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Presupuesto
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Presupuesto Global */}
      {globalBudget ? (
        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-6 rounded-2xl border-2 border-primary/20 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-foreground">{globalBudget.name}</h2>
                <p className="text-muted-foreground">Presupuesto mensual general</p>
              </div>
            </div>
            {getStatusIcon(getProgress(totalSpent, globalBudget.amount))}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Gastado</span>
              <span className="text-destructive text-2xl">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Límite</span>
              <span className="text-foreground text-2xl">{formatCurrency(globalBudget.amount)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Disponible</span>
              <span className="text-primary text-2xl">
                {formatCurrency(Math.max(globalBudget.amount - totalSpent, 0))}
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Progreso</span>
                <span className="text-foreground">
                  {getProgress(totalSpent, globalBudget.amount).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(getProgress(totalSpent, globalBudget.amount))} transition-all duration-500 rounded-full`}
                  style={{ width: `${getProgress(totalSpent, globalBudget.amount)}%` }}
                ></div>
              </div>
              {getProgress(totalSpent, globalBudget.amount) > 100 && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">
                    ¡Has superado tu presupuesto mensual!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-8 rounded-xl border border-border text-center shadow-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-foreground mb-2">Debes definir un presupuesto primero</h3>
          <p className="text-muted-foreground mb-4">
            Crea un presupuesto global para empezar a controlar tus gastos
          </p>
          <button
            onClick={() => {
              setBudgetType('global');
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Presupuesto Global
          </button>
        </div>
      )}

      {/* Presupuestos por Categoría */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground">Presupuestos por Categoría</h2>
          <button
            onClick={() => {
              setBudgetType('category');
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Añadir presupuesto
          </button>
        </div>

        {categoryBudgetsSummary.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border border-border text-center shadow-md">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No hay presupuestos por categoría</h3>
            <p className="text-muted-foreground mb-4">
              Añade presupuestos a tus categorías para controlar mejor tus gastos
            </p>
            <button
              onClick={() => {
                setBudgetType('category');
                setShowForm(true);
              }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir presupuesto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgetsSummary.map((budgetSummary) => {
              const budgetAlerts = alerts.filter(alert => alert.presupuestoId === budgetSummary.idPresupuesto);

              return (
                <div
                  key={budgetSummary.idCategoria}
                  className={`bg-card p-5 rounded-xl border-2 transition-all ${
                    budgetSummary.porcentajeUso >= 100
                      ? 'border-destructive/50 shadow-lg shadow-destructive/10'
                      : budgetSummary.porcentajeUso >= 75
                      ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'border-primary/20 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        budgetSummary.porcentajeUso >= 100 ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <Target className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-foreground">{budgetSummary.nombreCategoria}</h3>
                      </div>
                    </div>
                    {getStatusIcon(budgetSummary.porcentajeUso)}
                  </div>

                  {/* Alertas */}
                  {budgetAlerts.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {budgetAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2"
                        >
                          <Bell className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-orange-700 dark:text-orange-400 text-sm">
                              {alert.mensaje}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Límite</span>
                      <span className="text-foreground">{formatCurrency(budgetSummary.montoLimite)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Gastado</span>
                      <span className="text-destructive">{formatCurrency(budgetSummary.gastado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Disponible</span>
                      <span className="text-primary">{formatCurrency(budgetSummary.disponible)}</span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(budgetSummary.porcentajeUso)} transition-all duration-500`}
                      style={{ width: `${Math.min(budgetSummary.porcentajeUso, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">{budgetSummary.porcentajeUso.toFixed(0)}%</span>
                    {budgetSummary.porcentajeUso >= 100 && (
                      <span className="text-destructive text-xs">¡Límite superado!</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-accent/30 border border-accent p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-accent-foreground mb-1">Consejo</h3>
            <p className="text-accent-foreground text-sm">
              Define presupuestos realistas basados en tus gastos históricos. 
              Monitorea regularmente tu progreso para mantener el control de tus finanzas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
