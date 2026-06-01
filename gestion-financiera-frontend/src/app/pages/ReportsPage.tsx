import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react';

type TabType = 'expenses' | 'incomes' | 'comparison';

export function ReportsPage() {
  const { transactions, categories } = useApp();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const totalIncome = useMemo(
    () => monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0),
    [monthTransactions],
  );

  const totalExpenses = useMemo(
    () => monthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0),
    [monthTransactions],
  );

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = useMemo(() => {
    const grouped = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => {
        const category = categories.find((entry) => entry.id === transaction.categoryId);
        const categoryName = category ? `${category.name} ${category.icon}` : 'Sin categoría';
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, categories]);

  const incomesByCategory = useMemo(() => {
    const grouped = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((acc, transaction) => {
        const category = categories.find((entry) => entry.id === transaction.categoryId);
        const categoryName = category ? `${category.name} ${category.icon}` : 'Sin categoría';
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, categories]);

  const comparisonData = [
    { name: 'Ingresos', amount: totalIncome, fill: '#60e6b0' },
    { name: 'Gastos', amount: totalExpenses, fill: '#ef4444' },
  ];

  const hasData = monthTransactions.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Reportes y análisis</h1>
        <p className="text-muted-foreground">Consulta el comportamiento de tus ingresos y gastos por periodo</p>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-md border border-border">
        <div className="flex items-center gap-4">
          <label className="text-foreground">Periodo:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-xl shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total ingresos</p>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl text-foreground">${totalIncome.toLocaleString('es-CO')}</p>
          <p className="text-xs text-muted-foreground mt-1">COP</p>
        </div>

        <div className="bg-card p-5 rounded-xl shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total gastos</p>
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <p className="text-2xl text-foreground">${totalExpenses.toLocaleString('es-CO')}</p>
          <p className="text-xs text-muted-foreground mt-1">COP</p>
        </div>

        <div className="bg-card p-5 rounded-xl shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Balance</p>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${balance > 0 ? 'bg-primary/10' : balance < 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <DollarSign className={`w-5 h-5 ${balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </div>
          <p className={`text-2xl ${balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
            ${Math.abs(balance).toLocaleString('es-CO')}
          </p>
          <p className={`text-xs mt-1 ${balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {balance > 0 ? 'Superávit' : balance < 0 ? 'Déficit' : 'Equilibrado'}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          <button onClick={() => setActiveTab('expenses')} className={`flex-1 min-w-44 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'expenses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <TrendingDown className="w-5 h-5" />
            <span>Gastos por categoría</span>
          </button>
          <button onClick={() => setActiveTab('incomes')} className={`flex-1 min-w-44 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'incomes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <TrendingUp className="w-5 h-5" />
            <span>Ingresos por categoría</span>
          </button>
          <button onClick={() => setActiveTab('comparison')} className={`flex-1 min-w-44 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'comparison' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <BarChart3 className="w-5 h-5" />
            <span>Ingresos vs Gastos</span>
          </button>
        </div>

        <div className="p-6">
          {!hasData && (
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground mb-2">No hay datos disponibles</h3>
              <p className="text-muted-foreground text-sm">No hay transacciones registradas para el periodo seleccionado</p>
            </div>
          )}

          {hasData && activeTab === 'expenses' && (
            <div className="space-y-4">
              {expensesByCategory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay gastos registrados en este periodo</p>
              ) : (
                expensesByCategory.map((entry) => (
                  <div key={entry.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{entry.name}</span>
                      <span className="text-muted-foreground">${entry.value.toLocaleString('es-CO')} COP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-destructive rounded-full" style={{ width: `${totalExpenses > 0 ? (entry.value / totalExpenses) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {hasData && activeTab === 'incomes' && (
            <div className="space-y-4">
              {incomesByCategory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay ingresos registrados en este periodo</p>
              ) : (
                incomesByCategory.map((entry) => (
                  <div key={entry.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{entry.name}</span>
                      <span className="text-muted-foreground">${entry.value.toLocaleString('es-CO')} COP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${totalIncome > 0 ? (entry.value / totalIncome) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {hasData && activeTab === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonData.map((item) => (
                <div key={item.name} className="bg-muted/30 rounded-xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">{item.name}</p>
                  <p className="text-2xl text-foreground mb-4">${item.amount.toLocaleString('es-CO')} COP</p>
                  <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
                    <div className="h-full rounded-full" style={{ width: '100%', background: item.fill }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}