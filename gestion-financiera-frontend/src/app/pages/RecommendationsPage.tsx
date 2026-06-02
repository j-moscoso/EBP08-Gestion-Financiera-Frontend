import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { getBalanceRecommendations, getAlertRecommendations } from '../services/api';
import { toast } from 'sonner';

export function RecommendationsPage() {
  const [balanceRecommendation, setBalanceRecommendation] = useState<string>('');
  const [alertRecommendation, setAlertRecommendation] = useState<string>('');
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingAlert, setLoadingAlert] = useState(true);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Cargar recomendaciones al montar el componente
  useEffect(() => {
    const loadBalanceRecommendation = async () => {
      setLoadingBalance(true);
      setErrorBalance(null);
      try {
        const recommendation = await getBalanceRecommendations();
        setBalanceRecommendation(recommendation);
      } catch (error: any) {
        console.error('[RecommendationsPage] Error al cargar recomendación de balance:', error);
        setErrorBalance(error.message || 'Error al cargar la recomendación');
        toast.error('Error al cargar recomendación de balance');
      } finally {
        setLoadingBalance(false);
      }
    };

    const loadAlertRecommendation = async () => {
      setLoadingAlert(true);
      setErrorAlert(null);
      try {
        const recommendation = await getAlertRecommendations();
        setAlertRecommendation(recommendation);
      } catch (error: any) {
        console.error('[RecommendationsPage] Error al cargar recomendación de alertas:', error);
        setErrorAlert(error.message || 'Error al cargar la recomendación');
        toast.error('Error al cargar recomendación de alertas');
      } finally {
        setLoadingAlert(false);
      }
    };

    loadBalanceRecommendation();
    loadAlertRecommendation();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground mb-2">Recomendaciones financieras</h1>
        <p className="text-muted-foreground">
          Sugerencias personalizadas generadas con inteligencia artificial
        </p>
      </div>

      {/* Recomendación de Balance */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-foreground">Recomendación sobre tu balance</h2>
        </div>

        {loadingBalance ? (
          <div className="bg-card p-8 rounded-xl shadow-md border border-border">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-foreground mb-1">Generando recomendaciones con IA...</p>
                <p className="text-muted-foreground text-sm">Esto puede tomar unos segundos</p>
              </div>
            </div>
          </div>
        ) : errorBalance ? (
          <div className="bg-card p-6 rounded-xl shadow-md border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
              <div>
                <h3 className="text-destructive mb-1">Error al cargar recomendación</h3>
                <p className="text-foreground text-sm">{errorBalance}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-6 rounded-xl shadow-md border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-3">Análisis de balance</h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {balanceRecommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recomendación de Alertas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-foreground">Recomendación sobre alertas y presupuestos</h2>
        </div>

        {loadingAlert ? (
          <div className="bg-card p-8 rounded-xl shadow-md border border-border">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-foreground mb-1">Generando recomendaciones con IA...</p>
                <p className="text-muted-foreground text-sm">Esto puede tomar unos segundos</p>
              </div>
            </div>
          </div>
        ) : errorAlert ? (
          <div className="bg-card p-6 rounded-xl shadow-md border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
              <div>
                <h3 className="text-destructive mb-1">Error al cargar recomendación</h3>
                <p className="text-foreground text-sm">{errorAlert}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-6 rounded-xl shadow-md border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-3">Análisis de presupuestos</h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {alertRecommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="bg-accent/30 border border-accent p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="text-accent-foreground mb-1">Impulsado por IA</h3>
            <p className="text-accent-foreground text-sm">
              Estas recomendaciones son generadas por inteligencia artificial basándose en tu historial financiero y patrones de gasto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
