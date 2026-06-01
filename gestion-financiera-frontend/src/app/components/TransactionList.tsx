import { TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import type { Transaction, Category } from '../types';
import { formatYmdLocal } from '../lib/calendarDate';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };

  const formatDate = (dateString: string) =>
    formatYmdLocal(dateString, 'es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return type === 'income' ? `+${formatted}` : `-${formatted}`;
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
    <div className="space-y-3">
      <h2 className="text-foreground mb-4">Movimientos</h2>
      {transactions.map((transaction) => {
        const category = getCategoryById(transaction.categoryId);
        const isIncome = transaction.type === 'income';

        return (
          <div
            key={transaction.id}
            className="group relative bg-card p-4 rounded-xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isIncome ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}
                >
                  {isIncome ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1 truncate">{transaction.description}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span className="inline-flex items-center gap-1 bg-accent px-2 py-0.5 rounded-md text-accent-foreground text-sm">
                        <span>{category?.icon}</span>
                        <span className="truncate max-w-24">{category?.name}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isIncome ? 'text-primary' : 'text-destructive'
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}