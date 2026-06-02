import { AlertTriangle, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import type { Transaction, Budget } from '../types';

interface BudgetAlertBannerProps {
  transactions: Transaction[];
  budgets: Budget[];
  month: string;
}

/**
 * Banner de alerta de presupuesto — HU 3.3.3
 *
 * Estado A (presupuesto definido y sobrepasado):
 *   Muestra un banner de alerta cuando porcentajeUso >= 100,
 *   mapeado desde ResumenPresupuestoGlobalResponse del backend.
 *
 * Estado B (sin presupuesto o dentro del límite):
 *   No renderiza nada. El diseño original permanece limpio.
 *
 * Campos del backend usados: presupuestoDefinido, montoLimite,
 *   gastado, disponible, porcentajeUso, mensaje.
 */
export function BudgetAlertBanner({ transactions, budgets, month }: BudgetAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // ── Cálculo local (mock hasta integración con backend) ──────────────────────
  // En producción: leer de GET /api/presupuestos/global/usuario
  // y GET /api/alertas/usuario (tipo === 'SOBREPASO')

  const globalBudget = budgets.find(b => b.month === month && !b.categoryId);

  // Estado B: sin presupuesto definido → presupuestoDefinido: false
  if (!globalBudget) return null;

  const montoLimite = globalBudget.amount;
  const gastado = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const disponible = montoLimite - gastado;
  const porcentajeUso = montoLimite > 0 ? (gastado / montoLimite) * 100 : 0;

  // Estado B: dentro del límite → no mostrar nada
  if (porcentajeUso < 100 || dismissed) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));

  // Estado A: sobrepaso (tipo: SOBREPASO en AlertaResumenResponse)
  return (
    <div
      role="alert"
      className="relative flex items-start gap-4 px-5 py-4 bg-destructive/10 border border-destructive/30 rounded-xl overflow-hidden"
    >
      {/* Borde izquierdo de acento */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-xl" />

      <div className="w-9 h-9 bg-destructive/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-destructive" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Título — tipo: SOBREPASO */}
        <p className="text-destructive font-medium mb-1">
          Presupuesto mensual sobrepasado
        </p>

        {/* Detalle: montoLimite, gastado, disponible, porcentajeUso */}
        <p className="text-destructive/80 text-sm mb-3">
          Llevas{' '}
          <span className="font-semibold">{formatCurrency(gastado)}</span>{' '}
          gastados de un límite de{' '}
          <span className="font-semibold">{formatCurrency(montoLimite)}</span>.{' '}
          Tu presupuesto está{' '}
          <span className="font-semibold">{formatCurrency(-disponible)}</span>{' '}
          por encima del límite.
        </p>

        {/* Barra de progreso — porcentajeUso */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-destructive/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full transition-all"
              style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            <span className="text-destructive text-xs font-semibold">
              {Math.round(porcentajeUso)}% usado
            </span>
          </div>
        </div>
      </div>

      {/* Cerrar banner */}
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
