import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Info, Loader2, Lightbulb } from 'lucide-react';
import * as api from '../services/api';
import { toast } from 'sonner';

export function RecommendationsPage() {
  const [loading, setLoading] = useState(false);
  const [balanceRecommendation, setBalanceRecommendation] = useState('');
  const [alertRecommendation, setAlertRecommendation] = useState('');
  const [summary, setSummary] = useState<{
    totalIngresos: number;
    totalEgresos: number;
    balance: number;
  } | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [balanceRec, alertRec, summaryData] = await Promise.all([
        api.getBalanceRecommendations(),
        api.getAlertRecommendations(),
        api.getMonthlySummary(month, year),
      ]);

      setBalanceRecommendation(balanceRec);
      setAlertRecommendation(alertRec);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error al cargar recomendaciones:', error);
      toast.error('Error al cargar las recomendaciones');
      setBalanceRecommendation('No se pudieron cargar las recomendaciones de balance.');
      setAlertRecommendation('No se pudieron cargar las recomendaciones de alertas.');
    } finally {
      setLoading(false);
    }
  };

  const balance = summary?.balance || 0;
  const totalIncome = summary?.totalIngresos || 0;
  const totalExpenses = summary?.totalEgresos || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Recomendaciones financieras</h1>
        <p className="text-muted-foreground">
          Sugerencias personalizadas basadas en tu comportamiento financiero
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* Resumen del mes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-xl shadow-md border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos del mes</p>
                  <p className="text-lg text-foreground">${totalIncome.toLocaleString('es-CO')} COP</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl shadow-md border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gastos del mes</p>
                  <p className="text-lg text-foreground">${totalExpenses.toLocaleString('es-CO')} COP</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl shadow-md border border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  balance > 0 ? 'bg-primary/10' : balance < 0 ? 'bg-destructive/10' : 'bg-muted'
                }`}>
                  {balance > 0 ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : balance < 0 ? (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  ) : (
                    <Info className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance del mes</p>
                  <p className={`text-lg ${
                    balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-foreground'
                  }`}>
                    ${balance.toLocaleString('es-CO')} COP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendación según balance mensual */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-foreground">Recomendación según tu balance</h2>
            </div>
            <div className={`bg-card p-6 rounded-xl shadow-md border-2 ${
              balance > 0
                ? 'border-primary/30 bg-primary/5'
                : balance < 0
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-border bg-muted/30'
            }`}>
              <div className="flex gap-4">
                <div className={balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                  {balance > 0 ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : balance < 0 ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <Info className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {balanceRecommendation || 'No hay recomendaciones disponibles en este momento.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendación según alertas de presupuesto */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-foreground">Recomendación según tus presupuestos</h2>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md border-2 border-amber-500/30 bg-amber-500/5">
              <div className="flex gap-4">
                <div className="text-amber-600 dark:text-amber-500">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {alertRecommendation || 'No hay recomendaciones disponibles en este momento.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-medium mb-1">
                  Recomendaciones personalizadas
                </p>
                <p className="text-muted-foreground text-sm">
                  Estas sugerencias se generan automáticamente analizando tu comportamiento financiero mensual,
                  tus presupuestos configurados y tus patrones de gasto e ingreso.
                </p>
              </div>
            </div>
          </div>

          {/* Botón para recargar */}
          <div className="flex justify-center">
            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Actualizar recomendaciones
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
