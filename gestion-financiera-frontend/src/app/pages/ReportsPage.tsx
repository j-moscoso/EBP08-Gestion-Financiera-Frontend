import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as api from '../services/api';
import { toast } from 'sonner';

type TabType = 'expenses' | 'incomes' | 'comparison';

export function ReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [loading, setLoading] = useState(false);

  // Estados para datos del backend
  const [expensesData, setExpensesData] = useState<Array<{
    idCategoria: number;
    nombreCategoria: string;
    totalGastado: number;
    cantidadTransacciones: number;
  }>>([]);
  const [incomesData, setIncomesData] = useState<Array<{
    idCategoria: number;
    nombreCategoria: string;
    totalIngresado: number;
    cantidadTransacciones: number;
  }>>([]);
  const [summary, setSummary] = useState<{
    totalIngresos: number;
    totalEgresos: number;
    balance: number;
    porcentajeAhorro: number;
    mes: number;
    anio: number;
  } | null>(null);

  // Cargar datos del backend cuando cambia el mes
  useEffect(() => {
    loadReportData();
  }, [selectedMonth]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);

      const [expensesResponse, incomesResponse, summaryResponse] = await Promise.all([
        api.getExpensesByCategory(month, year),
        api.getIncomeByCategory(month, year),
        api.getMonthlySummary(month, year),
      ]);

      setExpensesData(expensesResponse);
      setIncomesData(incomesResponse);
      setSummary(summaryResponse);
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar los datos de reportes');
      setExpensesData([]);
      setIncomesData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalIncome = summary?.totalIngresos || 0;
  const totalExpenses = summary?.totalEgresos || 0;
  const balance = summary?.balance || 0;

  // Preparar datos para gráficos
  const expensesByCategory = useMemo(() => {
    return expensesData.map(item => ({
      name: item.nombreCategoria,
      value: item.totalGastado,
      percentage: totalExpenses > 0 ? ((item.totalGastado / totalExpenses) * 100).toFixed(1) : '0'
    })).sort((a, b) => b.value - a.value);
  }, [expensesData, totalExpenses]);

  const incomesByCategory = useMemo(() => {
    return incomesData.map(item => ({
      name: item.nombreCategoria,
      value: item.totalIngresado,
      percentage: totalIncome > 0 ? ((item.totalIngresado / totalIncome) * 100).toFixed(1) : '0'
    })).sort((a, b) => b.value - a.value);
  }, [incomesData, totalIncome]);

  // Datos para gráfico comparativo
  const comparisonData = [
    { name: 'Ingresos', amount: totalIncome, fill: '#60e6b0' },
    { name: 'Gastos', amount: totalExpenses, fill: '#ef4444' }
  ];

  // Colores para gráficos de dona
  const COLORS = ['#60e6b0', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#10b981', '#14b8a6', '#6366f1'];

  // Generar opciones de mes
  const monthOptions = useMemo(() => {
    const options = [];
    const current = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  }, []);

  const hasData = expensesData.length > 0 || incomesData.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground mb-2">Reportes y análisis</h1>
        <p className="text-muted-foreground">
          Consulta el comportamiento de tus ingresos y gastos por periodo
        </p>
      </div>

      {/* Filtro de mes */}
      <div className="bg-card p-4 rounded-xl shadow-md border border-border">
        <div className="flex items-center gap-4">
          <label className="text-foreground">Periodo:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={loading}
            className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50"
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Tarjetas resumen */}
      {!loading && (
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                balance > 0 ? 'bg-primary/10' : balance < 0 ? 'bg-destructive/10' : 'bg-muted'
              }`}>
                <DollarSign className={`w-5 h-5 ${
                  balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`} />
              </div>
            </div>
            <p className={`text-2xl ${
              balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-foreground'
            }`}>
              ${Math.abs(balance).toLocaleString('es-CO')}
            </p>
            <p className={`text-xs mt-1 ${
              balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {balance > 0 ? 'Superávit' : balance < 0 ? 'Déficit' : 'Equilibrado'}
            </p>
          </div>
        </div>
      )}

      {/* Pestañas */}
      {!loading && (
        <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              <span>Gastos por categoría</span>
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'incomes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Ingresos por categoría</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Ingresos vs Gastos</span>
            </button>
          </div>

          <div className="p-6">
            {/* Sin datos */}
            {!hasData && (
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-foreground mb-2">No hay datos disponibles</h3>
                <p className="text-muted-foreground text-sm">
                  No hay transacciones registradas para el periodo seleccionado
                </p>
              </div>
            )}

            {/* Tab: Gastos por categoría */}
            {hasData && activeTab === 'expenses' && (
              <div className="space-y-6">
                {expensesByCategory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay gastos registrados en este periodo</p>
                  </div>
                ) : (
                  <>
                    {/* Gráfico de dona */}
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')} COP`} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>

                    {/* Lista de categorías */}
                    <div className="space-y-3">
                      <h3 className="text-foreground mb-4">Detalle por categoría</h3>
                      {expensesByCategory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground">${item.value.toLocaleString('es-CO')} COP</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab: Ingresos por categoría */}
            {hasData && activeTab === 'incomes' && (
              <div className="space-y-6">
                {incomesByCategory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay ingresos registrados en este periodo</p>
                  </div>
                ) : (
                  <>
                    {/* Gráfico de dona */}
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                          <Pie
                            data={incomesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {incomesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')} COP`} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>

                    {/* Lista de categorías */}
                    <div className="space-y-3">
                      <h3 className="text-foreground mb-4">Detalle por origen</h3>
                      {incomesByCategory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground">${item.value.toLocaleString('es-CO')} COP</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </div>
                      ))}
                      {incomesByCategory.length > 0 && (
                        <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                          <p className="text-sm text-foreground">
                            Tu principal fuente de ingresos este periodo es <strong>{incomesByCategory[0].name}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab: Ingresos vs Gastos */}
            {hasData && activeTab === 'comparison' && (
              <div className="space-y-6">
                {/* Gráfico de barras */}
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')} COP`} />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Análisis del balance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-lg border-2 ${
                    balance > 0
                      ? 'bg-primary/10 border-primary/30'
                      : balance < 0
                      ? 'bg-destructive/10 border-destructive/30'
                      : 'bg-muted border-border'
                  }`}>
                    <h3 className={`mb-2 ${
                      balance > 0 ? 'text-primary' : balance < 0 ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {balance > 0 ? 'Balance positivo' : balance < 0 ? 'Déficit del periodo' : 'Balance equilibrado'}
                    </h3>
                    <p className="text-2xl text-foreground mb-1">
                      ${Math.abs(balance).toLocaleString('es-CO')} COP
                    </p>
                    {balance > 0 && totalIncome > 0 && summary && (
                      <p className="text-sm text-muted-foreground">
                        Ahorro neto logrado: {summary.porcentajeAhorro.toFixed(1)}% del ingreso total
                      </p>
                    )}
                    {balance < 0 && (
                      <p className="text-sm text-muted-foreground">
                        Tus gastos superaron tus ingresos
                      </p>
                    )}
                  </div>

                  <div className="p-5 rounded-lg bg-muted/30">
                    <h3 className="text-foreground mb-4">Resumen del periodo</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de gastos:</span>
                        <span className="text-foreground">{expensesData.reduce((sum, e) => sum + e.cantidadTransacciones, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de ingresos:</span>
                        <span className="text-foreground">{incomesData.reduce((sum, i) => sum + i.cantidadTransacciones, 0)}</span>
                      </div>
                      {totalIncome > 0 && summary && (
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Tasa de ahorro:</span>
                          <span className={balance > 0 ? 'text-primary' : 'text-destructive'}>
                            {summary.porcentajeAhorro.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
