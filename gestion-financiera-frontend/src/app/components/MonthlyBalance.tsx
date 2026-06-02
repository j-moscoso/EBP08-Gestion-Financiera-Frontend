import { TrendingUp, TrendingDown, Calendar, Sparkles } from 'lucide-react';
import type { Transaction } from '../types';

interface MonthlyBalanceProps {
  transactions: Transaction[];
  month: string;
}

export function MonthlyBalance({ transactions, month }: MonthlyBalanceProps) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;
  const isPositive = balance >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-6 sm:p-8 rounded-2xl border-2 border-primary/20 overflow-hidden shadow-xl">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-foreground">Balance Mensual Acumulado</h3>
              <p className="text-muted-foreground capitalize">{formatMonth(month)}</p>
            </div>
          </div>

          {isPositive && balance > 0 && (
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>

        {/* Balance Amount */}
        <div className="mb-6">
          <p className="text-muted-foreground mb-2">Balance total del mes</p>
          <p className={`text-5xl sm:text-6xl ${isPositive ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        {/* Income and Expenses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">Ingresos</span>
            </div>
            <p className="text-primary text-2xl">{formatCurrency(income)}</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-muted-foreground">Gastos</span>
            </div>
            <p className="text-destructive text-2xl">{formatCurrency(expenses)}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-primary' : 'bg-destructive'}`}></div>
          <span className={`${isPositive ? 'text-primary' : 'text-destructive'}`}>
            {isPositive ? 'Mes con superávit' : 'Mes con déficit'}
          </span>
        </div>
      </div>
    </div>
  );
}
