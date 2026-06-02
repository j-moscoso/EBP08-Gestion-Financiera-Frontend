import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AlertsBanner() {
  const { alerts } = useApp();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  // Filtrar alertas del mes actual
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthAlerts = alerts.filter(alert => {
    const alertMonth = alert.fecha.slice(0, 7);
    return alertMonth === currentMonth;
  });

  const handleDismiss = (alertId: number) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const visibleAlerts = currentMonthAlerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-500/10 border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="space-y-2">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 bg-card rounded-lg p-3 border border-orange-500/20"
            >
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    {alert.tipo}:
                  </span>{' '}
                  {alert.mensaje}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                aria-label="Cerrar alerta"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
