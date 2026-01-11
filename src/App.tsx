import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Zap, 
  Brain, 
  DollarSign, 
  CreditCard, 
  PieChart,
  Plus,
  Trash2,
  AlertTriangle,
  Target,
  TrendingUpIcon,
  Tv,
  Car,
  Coffee,
  History,
  Database
} from 'lucide-react';
import FinancialCharts from './components/FinancialCharts';
import AnalysisHistory from './components/AnalysisHistory';

const API_URL = 'http://localhost:3000';

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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Estados del formulario
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Suscripción',
    date: new Date().toISOString().split('T')[0]
  });

  //  CARGAR TRANSACCIONES DESDE LA DB
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Cargando transacciones desde la DB...');
      
      const response = await fetch(`${API_URL}/api/transactions`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        console.log('✅ Transacciones cargadas:', data.transactions.length);
      }
    } catch (error) {
      console.error('❌ Error cargando transacciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //  AGREGAR TRANSACCIÓN A LA DB
  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      console.log('💾 Guardando transacción en DB...');

      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newTransaction.description,
          amount: -Math.abs(parseFloat(newTransaction.amount)),
          category: newTransaction.category,
          date: newTransaction.date
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Transacción guardada:', data.transaction.id);
        
        // Recargar transacciones
        await loadTransactions();
        
        // Resetear formulario
        setNewTransaction({
          description: '',
          amount: '',
          category: 'Suscripción',
          date: new Date().toISOString().split('T')[0]
        });
        
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('❌ Error guardando transacción:', error);
      alert('Error al guardar la transacción');
    }
  };

  //  ELIMINAR TRANSACCIÓN DE LA DB
  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta transacción?')) {
      return;
    }

    try {
      console.log(' Eliminando transacción:', id);

      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        console.log('Transacción eliminada');
        
        // Recargar transacciones
        await loadTransactions();
      }
    } catch (error) {
      console.error(' Error eliminando transacción:', error);
      alert('Error al eliminar la transacción');
    }
  };

  //  ANÁLISIS CON IA (se guarda automáticamente en DB)
  const analyzeFinances = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('📤 Enviando transacciones al backend...');
      
      const response = await fetch(`${API_URL}/api/analyze`, {
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
      
      console.log(' Respuesta del backend:', data);
      console.log('Análisis guardado en DB con ID:', data.savedId);

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('No se recibió análisis válido');
      }

    } catch (error) {
      console.error(' Error al analizar:', error);
      alert('Error al analizar las transacciones');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalBalance = 2543.67;
  const monthlyIncome = 3500.00;

  // Icono por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suscripción':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'Comida':
        return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'Transporte':
        return <Car className="w-4 h-4 text-blue-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Agente FinAI</h1>
              <div className="flex gap-2">
                <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  GROQ AI
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  SQLite
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Transacción
            </button>
          </div>
          <p className="text-gray-400">Tu asistente financiero autónomo con IA real + Base de datos persistente</p>
        </div>

        {/* Formulario para agregar transacción */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-400" />
              Agregar Transacción
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Descripción (ej: Netflix)"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="number"
                placeholder="Monto (ej: 15.99)"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Suscripción">Suscripción</option>
                <option value="Comida">Comida</option>
                <option value="Transporte">Transporte</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Otros">Otros</option>
              </select>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddTransaction}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Guardar en DB
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Resumen financiero */}
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
              <TrendingUpIcon className="w-5 h-5 text-blue-400" />
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

        {/* Botón de análisis */}
        <div className="mb-8">
          <button
            onClick={analyzeFinances}
            disabled={isAnalyzing || transactions.length === 0 || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analizando con IA...' : 'Analizar con IA'}
          </button>
        </div>

        {/* Gráficos */}
        {transactions.length > 0 && !isLoading && (
          <FinancialCharts transactions={transactions} />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 ml-4">Cargando desde la base de datos...</p>
          </div>
        )}

        {/* Historial de análisis */}
        <AnalysisHistory />

        {/* Análisis de IA */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Insights de IA
              </h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 text-gray-300 flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{insight}</span>
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
                    <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg w-full mt-2 transition-colors flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Cancelar automáticamente
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Ahorro potencial: ${analysis.predictions.savings}/mes
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  = ${(parseFloat(analysis.predictions.savings) * 12).toFixed(2)}/año
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transacciones */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Transacciones desde la Base de Datos ({transactions.length})
          </h3>
          
          {transactions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay transacciones aún</p>
              <p className="text-gray-500 text-sm mt-2">Agrega tu primera transacción para comenzar</p>
            </div>
          )}

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{tx.description}</p>
                    <p className="text-gray-400 text-sm">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                    title="Eliminar de la base de datos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinAIAgent;