import { TrendingUp, TrendingDown, Calendar, DollarSign, Zap, Target } from 'lucide-react';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface EnhancedWidgetsProps {
  transactions: Transaction[];
}

const EnhancedWidgets = ({ transactions }: EnhancedWidgetsProps) => {
  // Calcular gastos de hoy
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayTotal = Math.abs(todayTransactions.reduce((sum, t) => sum + t.amount, 0));

  // Calcular gastos de esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
  const weekTotal = Math.abs(weekTransactions.reduce((sum, t) => sum + t.amount, 0));

  // Top 3 categorías
  const categoryTotals = transactions.reduce((acc, t) => {
    const amount = Math.abs(t.amount);
    acc[t.category] = (acc[t.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Suscripciones próximas a vencer (simulado)
  const subscriptions = transactions.filter(t => t.category === 'Suscripción');
  const upcomingSubscriptions = subscriptions.slice(0, 3);

  // Gasto promedio diario
  const daysWithTransactions = new Set(transactions.map(t => t.date)).size;
  const totalSpent = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
  const averageDaily = daysWithTransactions > 0 ? totalSpent / daysWithTransactions : 0;

  // Comparación con promedio
  const isAboveAverage = todayTotal > averageDaily;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Widget: Gastos de Hoy */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500">Hoy</h4>
          <Calendar className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-2xl font-bold text-white dark:text-gray-100">
          ${todayTotal.toFixed(2)}
        </p>
        <div className={`flex items-center gap-1 mt-2 text-xs ${isAboveAverage ? 'text-red-400' : 'text-green-400'}`}>
          {isAboveAverage ? (
            <>
              <TrendingUp className="w-3 h-3" />
              <span>Por encima del promedio</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-3 h-3" />
              <span>Por debajo del promedio</span>
            </>
          )}
        </div>
      </div>

      {/* Widget: Esta Semana */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500">Esta Semana</h4>
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-white dark:text-gray-100">
          ${weekTotal.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {weekTransactions.length} transacciones
        </p>
      </div>

      {/* Widget: Promedio Diario */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500">Promedio/Día</h4>
          <Target className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white dark:text-gray-100">
          ${averageDaily.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Últimos {daysWithTransactions} días
        </p>
      </div>

      {/* Widget: Top Categoría */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500">Top Gasto</h4>
          <DollarSign className="w-4 h-4 text-orange-400" />
        </div>
        {topCategories.length > 0 ? (
          <>
            <p className="text-2xl font-bold text-white dark:text-gray-100">
              {topCategories[0][0]}
            </p>
            <p className="text-xs text-orange-400 mt-2">
              ${topCategories[0][1].toFixed(2)} gastado
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">Sin datos</p>
        )}
      </div>

      {/* Widget Grande: Próximas Suscripciones */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30 dark:border-purple-500/20 md:col-span-2">
        <h4 className="text-sm font-medium text-purple-400 dark:text-purple-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Próximas Renovaciones
        </h4>
        <div className="space-y-2">
          {upcomingSubscriptions.length > 0 ? (
            upcomingSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-white/5 dark:bg-white/3 rounded-lg p-2">
                <div>
                  <p className="text-white dark:text-gray-100 text-sm font-medium">{sub.description}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{sub.date}</p>
                </div>
                <span className="text-purple-400 dark:text-purple-300 text-sm font-semibold">
                  ${Math.abs(sub.amount).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
              No hay suscripciones registradas
            </p>
          )}
        </div>
      </div>

      {/* Widget Grande: Top 3 Categorías */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 dark:border-blue-500/20 md:col-span-2">
        <h4 className="text-sm font-medium text-blue-400 dark:text-blue-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Top 3 Categorías
        </h4>
        <div className="space-y-2">
          {topCategories.map(([category, amount], index) => {
            const percentage = (amount / totalSpent) * 100;
            const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-teal-500'];
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white dark:text-gray-100 text-sm font-medium">
                    {index + 1}. {category}
                  </span>
                  <span className="text-blue-400 dark:text-blue-300 text-sm font-semibold">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-white/10 dark:bg-white/5 rounded-full h-2">
                  <div
                    className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {topCategories.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
              Sin datos para mostrar
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default EnhancedWidgets; 