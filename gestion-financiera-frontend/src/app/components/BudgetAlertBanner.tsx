import { AlertTriangle, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import type { Transaction, Budget } from '../types';

interface BudgetAlertBannerProps {
  transactions: Transaction[];
  budgets: Budget[];
  month: string;
}

export function BudgetAlertBanner({ transactions, budgets, month }: BudgetAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const globalBudget = budgets.find((budget) => budget.month === month && !budget.categoryId);

  if (!globalBudget) return null;

  const montoLimite = globalBudget.amount;
  const gastado = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const disponible = montoLimite - gastado;
  const porcentajeUso = montoLimite > 0 ? (gastado / montoLimite) * 100 : 0;

  if (porcentajeUso < 100 || dismissed) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));

  return (
    <div
      role="alert"
      className="relative flex items-start gap-4 px-5 py-4 bg-destructive/10 border border-destructive/30 rounded-xl overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-xl" />

      <div className="w-9 h-9 bg-destructive/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-destructive" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-destructive font-medium mb-1">Presupuesto mensual sobrepasado</p>
        <p className="text-destructive/80 text-sm mb-3">
          Llevas <span className="font-semibold">{formatCurrency(gastado)}</span> gastados de un límite de{' '}
          <span className="font-semibold">{formatCurrency(montoLimite)}</span>. Tu presupuesto está{' '}
          <span className="font-semibold">{formatCurrency(-disponible)}</span> por encima del límite.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-destructive/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full transition-all"
              style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            <span className="text-destructive text-xs font-semibold">{Math.round(porcentajeUso)}% usado</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar alerta"
        className="shrink-0 p-1 rounded-md hover:bg-destructive/20 transition-colors text-destructive"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}