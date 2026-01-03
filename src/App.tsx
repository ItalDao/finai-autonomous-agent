import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Zap, Brain, DollarSign, CreditCard, PieChart } from 'lucide-react';

// Tipos de datos
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface Duplicate {
  name: string;
  count: number;
  saving: number;
}

interface Analysis {
  totalSpent: string;
  subscriptions: number;
  subscriptionCost: string;
  predictions: {
    nextMonth: string;
    savings: string;
  };
  insights: string[];
  duplicates: Duplicate[];
}

const FinAIAgent = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Datos de ejemplo
  const mockTransactions: Transaction[] = [
    { id: 1, date: '2026-01-01', description: 'Netflix', amount: -15.99, category: 'Suscripción' },
    { id: 2, date: '2026-01-01', description: 'Spotify Premium', amount: -9.99, category: 'Suscripción' },
    { id: 3, date: '2025-12-30', description: 'Amazon Prime', amount: -14.99, category: 'Suscripción' },
    { id: 4, date: '2025-12-29', description: 'Supermercado', amount: -85.50, category: 'Comida' },
    { id: 5, date: '2025-12-28', description: 'Gasolina', amount: -45.00, category: 'Transporte' },
    { id: 6, date: '2025-12-27', description: 'Disney+', amount: -10.99, category: 'Suscripción' },
    { id: 7, date: '2025-12-26', description: 'Restaurante', amount: -67.80, category: 'Comida' },
    { id: 8, date: '2025-12-25', description: 'Apple Music', amount: -10.99, category: 'Suscripción' },
    { id: 9, date: '2025-12-24', description: 'Uber', amount: -23.50, category: 'Transporte' },
    { id: 10, date: '2025-12-23', description: 'HBO Max', amount: -9.99, category: 'Suscripción' },
  ];

  useEffect(() => {
    setTimeout(() => {
      setTransactions(mockTransactions);
    }, 500);
  }, []);

  // 🔥 FUNCIÓN ACTUALIZADA - Conecta con el backend
  const analyzeFinances = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('📤 Enviando transacciones al backend...');
      
      // Llamada al backend
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: transactions
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Respuesta del backend:', data);

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        console.log(`🧠 Análisis completado. Tokens usados: ${data.tokensUsed}`);
      } else {
        throw new Error('No se recibió análisis válido');
      }

    } catch (error) {
      console.error('❌ Error al analizar:', error);
      alert('Error al analizar las transacciones. Verifica que el servidor esté corriendo en http://localhost:3000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalBalance = 2543.67;
  const monthlyIncome = 3500.00;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">FinAI Agent</h1>
            <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
              🔴 LIVE GPT-4
            </span>
          </div>
          <p className="text-gray-400">Tu asistente financiero autónomo con IA real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Balance Total</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${totalBalance}</p>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.5% este mes
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Ingresos Mensuales</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">${monthlyIncome}</p>
            <p className="text-gray-400 text-sm mt-2">Próximo pago: 15 Ene</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Gastos del Mes</span>
              <CreditCard className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ${analysis ? analysis.totalSpent : '...'} 
            </p>
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {transactions.length} transacciones
            </p>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={analyzeFinances}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analizando con GPT-4...' : '🧠 Analizar con GPT-4 Real'}
          </button>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Insights de GPT-4
              </h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 text-gray-300">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                Suscripciones Duplicadas
              </h3>
              <div className="space-y-4">
                {analysis.duplicates.map((dup, idx) => (
                  <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-semibold">{dup.name}</p>
                        <p className="text-gray-400 text-sm">{dup.count} servicios activos</p>
                      </div>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -${dup.saving}/mes
                      </span>
                    </div>
                    <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg w-full mt-2 transition-colors">
                      Cancelar automáticamente
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-semibold">
                  💰 Ahorro potencial: ${analysis.predictions.savings}/mes
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  = ${(parseFloat(analysis.predictions.savings) * 12).toFixed(2)}/año
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-400" />
            Transacciones Recientes
          </h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{tx.description}</p>
                  <p className="text-gray-400 text-sm">{tx.date} • {tx.category}</p>
                </div>
                <span className={`font-bold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinAIAgent;