import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface FinancialChartsProps {
  transactions: Transaction[];
}

const FinancialCharts = ({ transactions }: FinancialChartsProps) => {
  
  // DATOS PARA GRÁFICO DE CATEGORÍAS (Pie Chart)
  const categoryData = transactions.reduce((acc, t) => {
    const amount = Math.abs(t.amount);
    const existing = acc.find(item => item.name === t.category);
    
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: t.category, value: amount });
    }
    
    return acc;
  }, [] as { name: string; value: number }[]);

  //  Colores para las categorías
  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

  // DATOS PARA TENDENCIA (Line Chart)
  const trendData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      gasto: Math.abs(t.amount)
    }));

  //  DATOS PARA COMPARACIÓN (Bar Chart)
  const subscriptions = transactions.filter(t => t.category === 'Suscripción');
  const totalSpent = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
  const subscriptionCost = Math.abs(subscriptions.reduce((sum, t) => sum + t.amount, 0));
  const savings = subscriptionCost * 0.4;

  const comparisonData = [
    { name: 'Gasto Total', value: totalSpent },
    { name: 'Suscripciones', value: subscriptionCost },
    { name: 'Ahorro Potencial', value: savings }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 📊 GRÁFICO DE CATEGORÍAS */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4"> Gastos por Categoría</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number | string | undefined) => 
                typeof value === 'number' ? `$${value.toFixed(2)}` : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/*  TENDENCIA DE GASTOS */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4"> Tendencia de Gastos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
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
              formatter={(value: number | string | undefined) => 
                typeof value === 'number' ? `$${value.toFixed(2)}` : value
              }
            />
            <Line 
              type="monotone" 
              dataKey="gasto" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/*  COMPARACIÓN DE GASTOS */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 lg:col-span-2">
        <h3 className="text-xl font-bold text-white mb-4"> Análisis de Ahorro</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              style={{ fontSize: '14px' }}
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
              formatter={(value: number | string | undefined) => 
                typeof value === 'number' ? `$${value.toFixed(2)}` : value
              }
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill="#ec4899" />
              <Cell fill="#f59e0b" />
              <Cell fill="#10b981" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Gasto Total</p>
            <p className="text-pink-400 text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Suscripciones</p>
            <p className="text-orange-400 text-2xl font-bold">${subscriptionCost.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Puedes Ahorrar</p>
            <p className="text-green-400 text-2xl font-bold">${savings.toFixed(2)}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FinancialCharts;