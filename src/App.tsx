import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Zap, 
  Brain, 
  DollarSign, 
  CreditCard, 
  Plus,
  Trash2,
  AlertTriangle,
  Target,
  TrendingUpIcon,
  Tv,
  Car,
  Coffee,
  History,
  Database,
  Moon,
  Sun
} from 'lucide-react';
import FinancialCharts from './components/FinancialCharts';
import AnalysisHistory from './components/AnalysisHistory';
import EnhancedWidgets from './components/EnhancedWidgets';
import FinancialGoals from './components/FinancialGoals';
import TemporalComparison from './components/TemporalComparison';
import { ToastContainer } from './components/Toast';
import { showToast } from './utils/toast';
import { useTheme } from './hooks/useTheme';

const API_URL = 'http://localhost:3000';

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
  const { theme, toggleTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Suscripción',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/transactions`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        showToast(`${data.transactions.length} transacciones cargadas`, 'success');
      }
    } catch {
      console.error('❌ Error al cargar transacciones');
      showToast('Error al cargar transacciones', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) {
      showToast('Completa todos los campos', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newTransaction.description,
          amount: -Math.abs(parseFloat(newTransaction.amount)),
          category: newTransaction.category,
          date: newTransaction.date
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadTransactions();
        setNewTransaction({
          description: '',
          amount: '',
          category: 'Suscripción',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
        showToast('Transacción agregada correctamente', 'success');
      }
    } catch {
      showToast('Error al guardar la transacción', 'error');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('¿Eliminar esta transacción?')) return;

    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await loadTransactions();
        showToast('Transacción eliminada', 'info');
      }
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const analyzeFinances = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        showToast('Análisis completado con IA', 'success');
      }
    } catch {
      showToast('Error al analizar', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalBalance = 2543.67;
  const monthlyIncome = 3500.00;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suscripción': return <Tv className="w-4 h-4 text-purple-400" />;
      case 'Comida': return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'Transporte': return <Car className="w-4 h-4 text-blue-400" />;
      default: return <DollarSign className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-colors duration-300">
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400 dark:text-purple-300" />
              <h1 className="text-4xl font-bold text-white dark:text-gray-100">Agente FinAI</h1>
              <div className="flex gap-2">
                <span className="bg-green-500/20 text-green-400 dark:bg-green-500/10 dark:text-green-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  GROQ AI
                </span>
                <span className="bg-blue-500/20 text-blue-400 dark:bg-blue-500/10 dark:text-blue-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  SQLite
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 text-white p-2 rounded-lg transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nueva Transacción
              </button>
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500">
            Tu asistente financiero autónomo con IA real + Base de datos persistente
          </p>
        </div>

        {/* Formulario */}
        {showAddForm && (
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 mb-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-400 dark:text-purple-300" />
              Agregar Transacción
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Descripción"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-3 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
              <input
                type="number"
                placeholder="Monto"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-3 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-3 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
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
                className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-3 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddTransaction}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Widgets Mejorados */}
        {!isLoading && transactions.length > 0 && (
          <EnhancedWidgets transactions={transactions} />
        )}

        {/* Resumen financiero original */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 dark:text-gray-500">Balance Total</span>
              <DollarSign className="w-5 h-5 text-green-400 dark:text-green-300" />
            </div>
            <p className="text-3xl font-bold text-white dark:text-gray-100">${totalBalance}</p>
            <p className="text-green-400 dark:text-green-300 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.5% este mes
            </p>
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 dark:text-gray-500">Ingresos Mensuales</span>
              <TrendingUpIcon className="w-5 h-5 text-blue-400 dark:text-blue-300" />
            </div>
            <p className="text-3xl font-bold text-white dark:text-gray-100">${monthlyIncome}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Próximo pago: 15 Ene</p>
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 dark:text-gray-500">Gastos del Mes</span>
              <CreditCard className="w-5 h-5 text-red-400 dark:text-red-300" />
            </div>
            <p className="text-3xl font-bold text-white dark:text-gray-100">
              ${analysis ? analysis.totalSpent : '...'} 
            </p>
            <p className="text-red-400 dark:text-red-300 text-sm mt-2 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {transactions.length} transacciones
            </p>
          </div>
        </div>

        {/* Botón análisis */}
        <div className="mb-8">
          <button
            onClick={analyzeFinances}
            disabled={isAnalyzing || transactions.length === 0 || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analizando con IA...' : 'Analizar con IA'}
          </button>
        </div>

        {/* Gráficos */}
        {transactions.length > 0 && !isLoading && (
          <FinancialCharts transactions={transactions} />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 dark:border-purple-400"></div>
            <p className="text-gray-400 dark:text-gray-500 ml-4">Cargando...</p>
          </div>
        )}

        {/* Historial */}
        <div className="mb-8">
          <AnalysisHistory />
        </div>

        {/* Metas Financieras */}
        <div className="mb-8">
          <FinancialGoals transactions={transactions} />
        </div>

        {/* Análisis Temporal */}
        <div className="mb-8">
          <TemporalComparison transactions={transactions} />
        </div>

        {/* Análisis IA */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400 dark:text-purple-300" />
                Insights de IA
              </h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/5 dark:bg-white/3 rounded-lg p-4 text-gray-300 dark:text-gray-400 flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-400 dark:text-purple-300 flex-shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-400 dark:text-yellow-300" />
                Suscripciones Duplicadas
              </h3>
              <div className="space-y-4">
                {analysis.duplicates.map((dup, idx) => (
                  <div key={idx} className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/30 dark:border-red-500/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white dark:text-gray-100 font-semibold">{dup.name}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">{dup.count} servicios</p>
                      </div>
                      <span className="bg-red-500 dark:bg-red-600 text-white text-xs px-2 py-1 rounded">
                        -${dup.saving}/mes
                      </span>
                    </div>
                    <button className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg w-full mt-2 transition-colors flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Cancelar automáticamente
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-500/10 dark:bg-green-500/5 border border-green-500/30 dark:border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 dark:text-green-300 font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Ahorro potencial: ${analysis.predictions.savings}/mes
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  = ${(parseFloat(analysis.predictions.savings) * 12).toFixed(2)}/año
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transacciones */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
          <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400 dark:text-blue-300" />
            Transacciones ({transactions.length})
          </h3>
          
          {transactions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-600 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-gray-500">No hay transacciones</p>
            </div>
          )}

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between bg-white/5 dark:bg-white/3 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 dark:bg-purple-500/10 p-2 rounded-lg">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-white dark:text-gray-100 font-semibold">{tx.description}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${tx.amount < 0 ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300'}`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 dark:text-red-300 hover:text-red-300 dark:hover:text-red-200 transition-all"
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