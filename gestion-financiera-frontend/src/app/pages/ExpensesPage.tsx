import { useState } from 'react';
import { Plus, TrendingDown, Calendar, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import type { ScheduledTransaction } from '../types';

const ITEMS_PER_PAGE = 10;

export function ExpensesPage() {
  const { scheduledTransactions, addScheduledTransaction, updateScheduledTransaction, deleteScheduledTransaction, categories, transactions } = useApp();

  const [activeTab, setActiveTab] = useState<'scheduled' | 'recent'>('scheduled');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ScheduledTransaction | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ScheduledTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const scheduledExpenses = scheduledTransactions.filter(t => t.type === 'expense');
  const recentExpenses = transactions.filter(t => t.type === 'expense').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredExpenses = dateFilter.start && dateFilter.end
    ? recentExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= new Date(dateFilter.start) && expenseDate <= new Date(dateFilter.end);
      })
    : recentExpenses;

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!description) newErrors.description = 'Este campo es requerido';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!categoryId) newErrors.categoryId = 'Selecciona una categoría';
    if (!startDate) newErrors.startDate = 'Este campo es requerido';
    if (!endDate) newErrors.endDate = 'Este campo es requerido';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'La fecha final debe ser posterior a la inicial';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expenseData = {
      description,
      amount: parseFloat(amount),
      type: 'expense' as const,
      categoryId,
      startDate,
      endDate,
      frequency,
    };

    if (editingExpense) {
      updateScheduledTransaction(editingExpense.id, expenseData);
      toast.success('Gasto programado actualizado');
      setEditingExpense(null);
    } else {
      addScheduledTransaction(expenseData);
      toast.success('Gasto programado creado. Se aplicará automáticamente en las fechas programadas.');
    }

    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    setFrequency('monthly');
    setErrors({});
    setShowForm(false);
  };

  const handleEdit = (expense: ScheduledTransaction) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategoryId(expense.categoryId);
    setStartDate(expense.startDate);
    setEndDate(expense.endDate);
    setFrequency(expense.frequency);
    setShowForm(true);
  };

  const confirmDelete = () => {
    if (!deletingExpense) return;
    deleteScheduledTransaction(deletingExpense.id);
    toast.success('Gasto programado eliminado');
    setDeletingExpense(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFrequencyLabel = (freq: string) => {
    const labels = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    };
    return labels[freq as keyof typeof labels] || freq;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">Gastos</h1>
          <p className="text-muted-foreground">
            Gestiona tus gastos programados y revisa el historial
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingExpense(null);
              resetForm();
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Gasto Programado</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-foreground mb-4">
            {editingExpense ? 'Editar Gasto Programado' : 'Nuevo Gasto Programado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="description" className="block text-foreground mb-2">
                  Descripción
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors({ ...errors, description: '' });
                  }}
                  className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.description ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Ej: Arriendo, Servicios públicos"
                />
                {errors.description && (
                  <p className="text-destructive text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="block text-foreground mb-2">
                  Monto (COP)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors({ ...errors, amount: '' });
                  }}
                  className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.amount ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="0"
                />
                {errors.amount && (
                  <p className="text-destructive text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-foreground mb-2">
                  Categoría
                </label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setErrors({ ...errors, categoryId: '' });
                  }}
                  className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.categoryId ? 'border-destructive' : 'border-border'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-destructive text-sm mt-1">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <label htmlFor="frequency" className="block text-foreground mb-2">
                  Frecuencia
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-foreground mb-2">
                  Fecha inicial
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setErrors({ ...errors, startDate: '' });
                  }}
                  className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.startDate ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-destructive text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-foreground mb-2">
                  Fecha final
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrors({ ...errors, endDate: '' });
                  }}
                  className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.endDate ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-destructive text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-foreground text-sm">
                El sistema aplicará automáticamente este gasto en la fecha programada.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingExpense ? 'Actualizar' : 'Crear Gasto Programado'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingExpense(null);
                }}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
            activeTab === 'scheduled'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Gastos Programados
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
            activeTab === 'recent'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Gastos Recientes
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'scheduled' ? (
        <div>
          <h2 className="text-foreground mb-4">Gastos Programados</h2>
          {scheduledExpenses.length === 0 ? (
            <div className="bg-card p-8 rounded-xl border border-border text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground mb-2">No hay gastos programados</h3>
              <p className="text-muted-foreground">
                Crea tu primer gasto programado para automatizar tus registros
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledExpenses.map((expense) => {
                const category = categories.find(c => c.id === expense.categoryId);
                return (
                  <div
                    key={expense.id}
                    className="bg-card p-4 rounded-xl border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center text-xl shrink-0">
                          {category?.icon || '📋'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-foreground">{expense.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category?.name || 'Sin categoría'} • {getFrequencyLabel(expense.frequency)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Del {formatDate(expense.startDate)} al {formatDate(expense.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-destructive">{formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(expense)}
                          className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="startFilter" className="block text-foreground mb-2 text-sm">
                Desde
              </label>
              <input
                id="startFilter"
                type="date"
                value={dateFilter.start}
                onChange={(e) => {
                  setDateFilter({ ...dateFilter, start: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endFilter" className="block text-foreground mb-2 text-sm">
                Hasta
              </label>
              <input
                id="endFilter"
                type="date"
                value={dateFilter.end}
                onChange={(e) => {
                  setDateFilter({ ...dateFilter, end: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {(dateFilter.start || dateFilter.end) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateFilter({ start: '', end: '' });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors whitespace-nowrap h-[42px]"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          <h2 className="text-foreground mb-4">Gastos Recientes</h2>
          {filteredExpenses.length === 0 ? (
            <div className="bg-card p-8 rounded-xl border border-border text-center">
              <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground mb-2">No hay gastos registrados</h3>
              <p className="text-muted-foreground">
                Los gastos que registres aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedExpenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <div
                      key={expense.id}
                      className="bg-card p-4 rounded-xl border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center text-xl shrink-0">
                          {category?.icon || '📋'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-foreground">{expense.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category?.name || 'Sin categoría'} • {formatDate(expense.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-destructive">{formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card p-6 rounded-xl shadow-xl border border-border max-w-md w-full">
            <h2 className="text-foreground mb-4">¿Eliminar gasto programado?</h2>
            <p className="text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar "{deletingExpense.description}"? Esta acción no generará futuros gastos asociados.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeletingExpense(null)}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
