import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Transaction {
  date: string;
  amount: number;
  category: string;
}

interface TemporalComparisonProps {
  transactions: Transaction[];
}

const TemporalComparison = ({ transactions }: TemporalComparisonProps) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Agrupar transacciones por período
  const groupByPeriod = () => {
    const grouped: Record<string, number> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';

      if (viewMode === 'daily') {
        key = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      } else if (viewMode === 'weekly') {
        const weekNumber = Math.ceil(date.getDate() / 7);
        key = `Semana ${weekNumber} - ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
      } else {
        key = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      }

      grouped[key] = (grouped[key] || 0) + Math.abs(t.amount);
    });

    return Object.entries(grouped)
      .map(([period, amount]) => ({
        period,
        gasto: parseFloat(amount.toFixed(2))
      }))
      .slice(-10); // Últimos 10 períodos
  };

  // Comparación mes a mes
  const getMonthlyComparison = () => {
    const monthly: Record<string, { total: number; count: number }> = {};

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      if (!monthly[month]) {
        monthly[month] = { total: 0, count: 0 };
      }
      monthly[month].total += Math.abs(t.amount);
      monthly[month].count++;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        total: data.total,
        promedio: data.total / data.count,
        transacciones: data.count
      }))
      .slice(-6); // Últimos 6 meses
  };

  // Tendencia por categoría
  const getCategoryTrends = () => {
    const trends: Record<string, Record<string, number>> = {};

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('es-ES', { month: 'short' });
      if (!trends[t.category]) {
        trends[t.category] = {};
      }
      trends[t.category][month] = (trends[t.category][month] || 0) + Math.abs(t.amount);
    });

    const months = [...new Set(transactions.map(t => 
      new Date(t.date).toLocaleDateString('es-ES', { month: 'short' })
    ))].slice(-6);

    return months.map(month => {
      const data: Record<string, string | number> = { month };
      Object.keys(trends).forEach(category => {
        data[category] = trends[category][month] || 0;
      });
      return data;
    });
  };

  // Estadísticas comparativas
  const getComparisonStats = () => {
    const monthlyData = getMonthlyComparison();
    if (monthlyData.length < 2) return null;

    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];

    const change = ((current.total - previous.total) / previous.total) * 100;
    const avgChange = ((current.promedio - previous.promedio) / previous.promedio) * 100;

    return {
      currentMonth: current.month,
      previousMonth: previous.month,
      currentTotal: current.total,
      previousTotal: previous.total,
      change,
      avgChange,
      isIncreasing: change > 0
    };
  };

  const periodData = groupByPeriod();
  const monthlyData = getMonthlyComparison();
  const categoryTrends = getCategoryTrends();
  const stats = getComparisonStats();

  const categories = [...new Set(transactions.map(t => t.category))];
  const categoryColors = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f59e0b', // orange
    '#10b981', // green
    '#ef4444'  // red
  ];

  return (
    <div className="space-y-6">
      
      {/* Título y controles */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-7 h-7 text-blue-400 dark:text-blue-300" />
              Análisis Temporal
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Compara tus gastos en el tiempo
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'daily'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Estadísticas comparativas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-xl p-4 border ${
              stats.isIncreasing
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Cambio vs Mes Anterior</p>
              <div className="flex items-center gap-2">
                {stats.isIncreasing ? (
                  <TrendingUp className="w-5 h-5 text-red-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-400" />
                )}
                <span className={`text-2xl font-bold ${
                  stats.isIncreasing ? 'text-red-400' : 'text-green-400'
                }`}>
                  {Math.abs(stats.change).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Mes Actual</p>
              <p className="text-2xl font-bold text-blue-400">${stats.currentTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.currentMonth}</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Mes Anterior</p>
              <p className="text-2xl font-bold text-purple-400">${stats.previousTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.previousMonth}</p>
            </div>
          </div>
        )}

        {/* Gráfico de tendencia */}
        <div className="bg-white/5 dark:bg-white/3 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-300 dark:text-gray-400 mb-3">
            Tendencia de Gastos
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={periodData}>
              <defs>
                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="period" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number | undefined) => value ? [`$${value.toFixed(2)}`, 'Gasto'] : ['$0.00', 'Gasto']}
              />
              <Area 
                type="monotone" 
                dataKey="gasto" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fill="url(#colorGasto)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparación mensual */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
        <h4 className="text-lg font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Comparación Mes a Mes
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number | undefined) => value ? `$${value.toFixed(2)}` : '$0.00'}
            />
            <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tendencias por categoría */}
      {categories.length > 0 && (
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
          <h4 className="text-lg font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Tendencias por Categoría
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={categoryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number | undefined) => value ? `$${value.toFixed(2)}` : '$0.00'}
              />
              {categories.map((category, idx) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[idx % categoryColors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                />
                <span className="text-sm text-gray-300 dark:text-gray-400">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemporalComparison;