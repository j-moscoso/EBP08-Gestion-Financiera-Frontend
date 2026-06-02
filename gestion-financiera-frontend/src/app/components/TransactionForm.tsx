import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Transaction, Category } from '../types';
import { toast } from 'sonner';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  onClose?: () => void;
}

export function TransactionForm({ onAddTransaction, categories, onClose }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si no se seleccionó categoría, usar la por defecto
    const finalCategoryId = categoryId || categories.find(c => c.isDefault)?.id || categories[0]?.id;

    if (!finalCategoryId) {
      toast.error('No hay categorías disponibles');
      return;
    }

    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      categoryId: finalCategoryId,
      date: new Date().toISOString(),
    });

    toast.success(`${type === 'income' ? 'Ingreso' : 'Gasto'} agregado exitosamente`);

    // Reset form
    setDescription('');
    setAmount('');
    setType('expense');
    setCategoryId('');

    if (onClose) {
      onClose();
    }
  };

  // Mostrar todas las categorías (son de uso general)
  const availableCategories = categories;

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl shadow-md border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-foreground">Nueva Transacción</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-foreground mb-2">
            Descripción
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: Compra de supermercado"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-foreground mb-2">
            Monto
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

        <div>
          <label className="block text-foreground mb-2">
            Tipo
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                type === 'expense'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                type === 'income'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Ingreso
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-foreground mb-2">
            Categoría {!categoryId && <span className="text-muted-foreground">(opcional - se asignará por defecto)</span>}
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar categoría...</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name} {category.isDefault ? '(Por defecto)' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Transacción
        </button>
      </div>
    </form>
  );
}