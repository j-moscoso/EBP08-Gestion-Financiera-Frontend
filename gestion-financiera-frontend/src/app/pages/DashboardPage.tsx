import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Summary } from '../components/Summary';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { MonthlyBalance } from '../components/MonthlyBalance';
import { BudgetAlertBanner } from '../components/BudgetAlertBanner';

export function DashboardPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    budgets,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Filtrar transacciones por mes
  const filteredTransactions = transactions.filter(t => {
    const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
    return transactionMonth === selectedMonth;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona tus finanzas personales
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-11 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      {/* HU 3.3.3 — Alerta de sobrepaso de presupuesto
          Estado A: visible cuando porcentajeUso ≥ 100 (tipo: SOBREPASO)
          Estado B: oculto cuando no hay presupuesto o está dentro del límite */}
      <BudgetAlertBanner
        transactions={filteredTransactions}
        budgets={budgets}
        month={selectedMonth}
      />

      {/* Balance Mensual */}
      <MonthlyBalance transactions={filteredTransactions} month={selectedMonth} />

      {/* Summary Cards */}
      <Summary transactions={filteredTransactions} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-1">
          <TransactionForm
            onAddTransaction={(transaction) => addTransaction(transaction)}
            categories={categories}
          />
        </div>

        {/* Transaction List — HU 2.2.5 (ingresos) y HU 2.3.5 (gastos)
            Hover: botones editar/eliminar
            onUpdate → PUT /api/transacciones/{id}/usuario
            onDelete → DELETE /api/transacciones/{id}/usuario (204) */}
        <div className="lg:col-span-2">
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        </div>
      </div>
    </div>
  );
}
