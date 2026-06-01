import { useApp } from '../context/AppContext';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'alert' | 'warning' | 'success' | 'info';
  category: 'budget' | 'balance';
  title: string;
  message: string;
}

export function RecommendationsPage() {
  const { transactions, budgets, categories } = useApp();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(currentMonth));
  const totalIncome = monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = monthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = monthTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const recommendations: Recommendation[] = [];
  const currentMonthBudgets = budgets.filter((budget) => budget.month === currentMonth);

  if (currentMonthBudgets.length === 0) {
    recommendations.push({
      id: 'no-budget',
      type: 'info',
      category: 'budget',
      title: 'Sin presupuestos registrados',
      message: 'No tienes presupuestos registrados para este mes. Configura presupuestos para recibir recomendaciones personalizadas.',
    });
  } else {
    const generalBudget = currentMonthBudgets.find((budget) => !budget.categoryId);
    if (generalBudget) {
      const percentage = (totalExpenses / generalBudget.amount) * 100;

      if (totalExpenses > generalBudget.amount) {
        recommendations.push({
          id: 'budget-exceeded',
          type: 'alert',
          category: 'budget',
          title: 'Presupuesto mensual superado',
          message: `Has superado tu presupuesto mensual en $${(totalExpenses - generalBudget.amount).toLocaleString('es-CO')} COP.`,
        });
      } else if (percentage >= 80) {
        recommendations.push({
          id: 'budget-warning',
          type: 'warning',
          category: 'budget',
          title: 'Cerca del límite de presupuesto',
          message: `Estás usando el ${percentage.toFixed(0)}% de tu presupuesto mensual.`,
        });
      }
    }

    currentMonthBudgets
      .filter((budget) => budget.categoryId)
      .forEach((budget) => {
        const spent = expensesByCategory[budget.categoryId!] || 0;
        const percentage = (spent / budget.amount) * 100;
        const category = categories.find((entry) => entry.id === budget.categoryId);

        if (spent > budget.amount) {
          recommendations.push({
            id: `category-exceeded-${budget.id}`,
            type: 'alert',
            category: 'budget',
            title: `Presupuesto de ${category?.name} superado`,
            message: `Tus gastos en ${category?.name} superaron el presupuesto en $${(spent - budget.amount).toLocaleString('es-CO')} COP.`,
          });
        } else if (percentage >= 80) {
          recommendations.push({
            id: `category-warning-${budget.id}`,
            type: 'warning',
            category: 'budget',
            title: `Presupuesto de ${category?.name} cerca del límite`,
            message: `Has usado el ${percentage.toFixed(0)}% del presupuesto de ${category?.name}.`,
          });
        }
      });
  }

  if (totalIncome === 0 && totalExpenses === 0) {
    recommendations.push({
      id: 'no-data',
      type: 'info',
      category: 'balance',
      title: 'Sin información suficiente',
      message: 'Aún no hay transacciones registradas para este mes.',
    });
  } else if (balance < 0) {
    recommendations.push({
      id: 'negative-balance',
      type: 'alert',
      category: 'balance',
      title: 'Balance mensual negativo',
      message: `Tu balance del mes es negativo con un déficit de $${Math.abs(balance).toLocaleString('es-CO')} COP.`,
    });
  } else if (balance > 0) {
    recommendations.push({
      id: 'positive-balance',
      type: 'success',
      category: 'balance',
      title: 'Balance mensual positivo',
      message: `Tu balance del mes es positivo con $${balance.toLocaleString('es-CO')} COP.`,
    });
  } else {
    recommendations.push({
      id: 'zero-balance',
      type: 'info',
      category: 'balance',
      title: 'Balance equilibrado',
      message: 'Tus ingresos y gastos están equilibrados.',
    });
  }

  const budgetRecommendations = recommendations.filter((item) => item.category === 'budget');
  const balanceRecommendations = recommendations.filter((item) => item.category === 'balance');

  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getStyles = (type: Recommendation['type']) => {
    switch (type) {
      case 'alert':
        return { card: 'border-destructive/30 bg-destructive/5', icon: 'text-destructive', title: 'text-destructive' };
      case 'warning':
        return { card: 'border-yellow-500/30 bg-yellow-500/5', icon: 'text-yellow-600 dark:text-yellow-500', title: 'text-yellow-700 dark:text-yellow-500' };
      case 'success':
        return { card: 'border-primary/30 bg-primary/5', icon: 'text-primary', title: 'text-primary' };
      default:
        return { card: 'border-border bg-muted/30', icon: 'text-muted-foreground', title: 'text-foreground' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Recomendaciones financieras</h1>
        <p className="text-muted-foreground">Sugerencias basadas en tu presupuesto y balance mensual</p>
      </div>

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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${balance > 0 ? 'bg-primary/10' : balance < 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              {balance > 0 ? <TrendingUp className="w-5 h-5 text-primary" /> : balance < 0 ? <TrendingDown className="w-5 h-5 text-destructive" /> : <Info className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance del mes</p>
              <p className={`text-lg ${balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                ${balance.toLocaleString('es-CO')} COP
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-foreground mb-4">Según tu presupuesto</h2>
        <div className="space-y-4">
          {budgetRecommendations.map((recommendation) => {
            const styles = getStyles(recommendation.type);
            return (
              <div key={recommendation.id} className={`bg-card p-5 rounded-xl shadow-md border-2 ${styles.card}`}>
                <div className="flex gap-4">
                  <div className={styles.icon}>{getIcon(recommendation.type)}</div>
                  <div className="flex-1">
                    <h3 className={`${styles.title} mb-2`}>{recommendation.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{recommendation.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-foreground mb-4">Según tu balance</h2>
        <div className="space-y-4">
          {balanceRecommendations.map((recommendation) => {
            const styles = getStyles(recommendation.type);
            return (
              <div key={recommendation.id} className={`bg-card p-5 rounded-xl shadow-md border-2 ${styles.card}`}>
                <div className="flex gap-4">
                  <div className={styles.icon}>{getIcon(recommendation.type)}</div>
                  <div className="flex-1">
                    <h3 className={`${styles.title} mb-2`}>{recommendation.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{recommendation.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}