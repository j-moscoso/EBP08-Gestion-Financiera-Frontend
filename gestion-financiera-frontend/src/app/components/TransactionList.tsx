import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Tag, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import type { Transaction, Category } from '../types';
import { toast } from 'sonner';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  /** PUT /api/transacciones/{idTransaccion}/usuario — ActualizarTransaccionRequest */
  onUpdate: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void;
  /** DELETE /api/transacciones/{idTransaccion}/usuario — responde 204 No Content */
  onDelete: (id: string) => void;
}

// ── Tipos del formulario de edición, alineados al DTO del backend ─────────────
// ActualizarTransaccionRequest: idCategoria, tipo, descripcion, monto
interface EditForm {
  descripcion: string;    // → transaction.description
  monto: string;          // → transaction.amount (string para el input)
  idCategoria: string;    // → transaction.categoryId
  tipo: 'INGRESO' | 'EGRESO'; // → transaction.type ('income'|'expense')
}

interface FieldError {
  descripcion?: string;
  monto?: string;
  idCategoria?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toBackendTipo(type: 'income' | 'expense'): 'INGRESO' | 'EGRESO' {
  return type === 'income' ? 'INGRESO' : 'EGRESO';
}

function toLocalType(tipo: 'INGRESO' | 'EGRESO'): 'income' | 'expense' {
  return tipo === 'INGRESO' ? 'income' : 'expense';
}

const formatCurrency = (amount: number, type: 'income' | 'expense') => {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Modal de Edición ──────────────────────────────────────────────────────────
interface EditModalProps {
  transaction: Transaction;
  categories: Category[];
  onSave: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void;
  onClose: () => void;
}

function EditModal({ transaction, categories, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<EditForm>({
    descripcion: transaction.description,
    monto: transaction.amount.toString(),
    idCategoria: transaction.categoryId,
    tipo: toBackendTipo(transaction.type),
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const next: FieldError = {};
    if (!form.descripcion.trim()) next.descripcion = 'Datos inválidos';
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0)
      next.monto = 'Datos inválidos';
    if (!form.idCategoria) next.idCategoria = 'Datos inválidos';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Mock: simular delay del servidor
    setTimeout(() => {
      onSave(transaction.id, {
        description: form.descripcion.trim(),
        amount: Number(form.monto),
        type: toLocalType(form.tipo),
        categoryId: form.idCategoria,
      });
      toast.success('Información actualizada');
      setLoading(false);
      onClose();
    }, 600);
  };

  const field = (key: keyof EditForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setErrors(err => ({ ...err, [key]: undefined }));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground">Editar transacción</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* descripcion — ActualizarTransaccionRequest.descripcion */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm">
              Descripción <span className="text-muted-foreground font-normal">(descripcion)</span>
            </label>
            <input
              type="text"
              {...field('descripcion')}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                errors.descripcion ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Ej: Compra de supermercado"
            />
            {errors.descripcion && (
              <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.descripcion}
              </p>
            )}
          </div>

          {/* monto — ActualizarTransaccionRequest.monto */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm">
              Monto <span className="text-muted-foreground font-normal">(monto)</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              {...field('monto')}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                errors.monto ? 'border-destructive' : 'border-border'
              }`}
              placeholder="0"
            />
            {errors.monto && (
              <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.monto}
              </p>
            )}
          </div>

          {/* tipo — TipoTransaccion: INGRESO | EGRESO */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm">
              Tipo <span className="text-muted-foreground font-normal">(tipo)</span>
            </label>
            <div className="flex gap-3">
              {(['EGRESO', 'INGRESO'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={`flex-1 py-2.5 rounded-lg transition-colors text-sm ${
                    form.tipo === t
                      ? t === 'INGRESO'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                </button>
              ))}
            </div>
          </div>

          {/* idCategoria — ActualizarTransaccionRequest.idCategoria */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm">
              Categoría <span className="text-muted-foreground font-normal">(idCategoria)</span>
            </label>
            <select
              {...field('idCategoria')}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                errors.idCategoria ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            {errors.idCategoria && (
              <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.idCategoria}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal de Confirmación de Eliminación ──────────────────────────────────────
interface DeleteModalProps {
  transaction: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteModal({ transaction, onConfirm, onCancel, loading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>

        <h2 className="text-foreground text-center mb-2">¿Estás seguro?</h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Eliminarás{' '}
          <span className="text-foreground font-medium">"{transaction.description}"</span>.
          Esta acción no se puede deshacer y el balance general se actualizará.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lista de transacciones ────────────────────────────────────────────────────
export function TransactionList({ transactions, categories, onUpdate, onDelete }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const handleConfirmDelete = () => {
    if (!deletingTransaction) return;
    setDeleteLoading(true);
    // Mock: simular delay del servidor (DELETE → 204 No Content)
    setTimeout(() => {
      onDelete(deletingTransaction.id);
      toast.success('Transacción eliminada');
      setDeleteLoading(false);
      setDeletingTransaction(null);
    }, 600);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-card p-8 rounded-xl border border-border shadow-md">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-foreground mb-2">No hay transacciones</h3>
          <p className="text-muted-foreground">
            Agrega tu primera transacción para comenzar a organizar tus finanzas
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-foreground mb-4">Movimientos</h2>

        {transactions.map((transaction) => {
          const category = getCategoryById(transaction.categoryId);
          const isIncome = transaction.type === 'income';

          return (
            // group activa las clases group-hover en los hijos
            <div
              key={transaction.id}
              className="group relative bg-card p-4 rounded-xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Icono tipo */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isIncome ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}
                >
                  {isIncome ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1 truncate">{transaction.description}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1 bg-accent px-2 py-0.5 rounded-md text-accent-foreground text-sm">
                      <span>{category?.icon}</span>
                      <span className="truncate max-w-24">{category?.name}</span>
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Monto + acciones hover */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`${isIncome ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(transaction.amount, transaction.type)}
                  </span>

                  {/* Botones — visibles solo en hover (opacity-0 → opacity-100) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      type="button"
                      onClick={() => setEditingTransaction(transaction)}
                      title="Editar transacción"
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTransaction(transaction)}
                      title="Eliminar transacción"
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición */}
      {editingTransaction && (
        <EditModal
          transaction={editingTransaction}
          categories={categories}
          onSave={onUpdate}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingTransaction && (
        <DeleteModal
          transaction={deletingTransaction}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTransaction(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
