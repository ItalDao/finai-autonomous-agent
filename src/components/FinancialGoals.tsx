import { useState } from 'react';
import { Target, Plus, Trash2, Calendar, DollarSign, CheckCircle, AlertCircle, Zap, Save, X } from 'lucide-react';
import { showToast } from '../utils/toast';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  aiSuggestion?: string;
}

interface Transaction {
  amount: number;
  category: string;
}

interface FinancialGoalsProps {
  transactions: Transaction[];
}

const FinancialGoals = ({ transactions }: FinancialGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('financial-goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si hay error al parsear, usa ejemplos
        const exampleGoals: Goal[] = [
          {
            id: 1,
            name: 'Fondo de Emergencia',
            targetAmount: 5000,
            currentAmount: 1200,
            deadline: '2026-06-30',
            category: 'Ahorro',
            priority: 'high',
            aiSuggestion: 'Ahorra $633/mes para alcanzar tu meta a tiempo'
          },
          {
            id: 2,
            name: 'Vacaciones 2026',
            targetAmount: 2000,
            currentAmount: 450,
            deadline: '2026-07-15',
            category: 'Viaje',
            priority: 'medium',
            aiSuggestion: 'Reduce suscripciones innecesarias para ahorrar $258/mes'
          }
        ];
        localStorage.setItem('financial-goals', JSON.stringify(exampleGoals));
        return exampleGoals;
      }
    }
    const exampleGoals: Goal[] = [
      {
        id: 1,
        name: 'Fondo de Emergencia',
        targetAmount: 5000,
        currentAmount: 1200,
        deadline: '2026-06-30',
        category: 'Ahorro',
        priority: 'high',
        aiSuggestion: 'Ahorra $633/mes para alcanzar tu meta a tiempo'
      },
      {
        id: 2,
        name: 'Vacaciones 2026',
        targetAmount: 2000,
        currentAmount: 450,
        deadline: '2026-07-15',
        category: 'Viaje',
        priority: 'medium',
        aiSuggestion: 'Reduce suscripciones innecesarias para ahorrar $258/mes'
      }
    ];
    localStorage.setItem('financial-goals', JSON.stringify(exampleGoals));
    return exampleGoals;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Ahorro',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  // Guardar metas
  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('financial-goals', JSON.stringify(updatedGoals));
  };

  // Agregar meta con sugerencia de IA
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      showToast('Completa todos los campos', 'warning');
      return;
    }

    const target = parseFloat(newGoal.targetAmount);
    const current = parseFloat(newGoal.currentAmount || '0');
    const deadline = new Date(newGoal.deadline);
    const today = new Date();
    const monthsLeft = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyNeeded = (target - current) / monthsLeft;

    // Calcular gasto promedio por categoría
    const categorySpending = transactions
      .filter(t => t.category === newGoal.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const avgMonthlySpending = categorySpending / Math.max(1, transactions.length / 30);

    // Generar sugerencia de IA
    let aiSuggestion = '';
    if (monthlyNeeded <= avgMonthlySpending * 0.3) {
      aiSuggestion = `Fácil! Ahorra $${monthlyNeeded.toFixed(2)}/mes para lograrlo`;
    } else if (monthlyNeeded <= avgMonthlySpending * 0.6) {
      aiSuggestion = `Reduce gastos en ${newGoal.category} y ahorra $${monthlyNeeded.toFixed(2)}/mes`;
    } else {
      aiSuggestion = `Desafiante: Necesitas $${monthlyNeeded.toFixed(2)}/mes. Considera reducir otras categorías`;
    }

    const goal: Goal = {
      id: Date.now(),
      name: newGoal.name,
      targetAmount: target,
      currentAmount: current,
      deadline: newGoal.deadline,
      category: newGoal.category,
      priority: newGoal.priority,
      aiSuggestion
    };

    saveGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'Ahorro',
      priority: 'medium'
    });
    setShowAddForm(false);
    showToast(`Meta "${goal.name}" creada con éxito`, 'success');
  };

  // Actualizar progreso
  const updateProgress = (id: number, amount: number) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
    );
    saveGoals(updated);
    
    const goal = updated.find(g => g.id === id);
    if (goal && goal.currentAmount >= goal.targetAmount) {
      showToast(`🎉 ¡Meta "${goal.name}" completada!`, 'success', 5000);
    } else {
      showToast('Progreso actualizado', 'success');
    }
  };

  // Eliminar meta
  const deleteGoal = (id: number) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    const goal = goals.find(g => g.id === id);
    saveGoals(goals.filter(g => g.id !== id));
    showToast(`Meta "${goal?.name}" eliminada`, 'info');
  };

  // Calcular estadísticas
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const totalProgress = goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) / Math.max(1, goals.length);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-green-500/50 bg-green-500/10'
  };

  const priorityBadges = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-green-500 text-white'
  };

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white dark:text-gray-100 flex items-center gap-2">
            <Target className="w-7 h-7 text-purple-400 dark:text-purple-300" />
            Metas Financieras
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Con sugerencias inteligentes de IA
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Meta
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl p-4 border border-purple-500/30 dark:border-purple-500/20">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Total Metas</p>
          <p className="text-2xl font-bold text-white dark:text-gray-100">{goals.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl p-4 border border-green-500/30 dark:border-green-500/20">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Completadas</p>
          <p className="text-2xl font-bold text-green-400 dark:text-green-300">{completedGoals}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl p-4 border border-blue-500/30 dark:border-blue-500/20">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Progreso Total</p>
          <p className="text-2xl font-bold text-blue-400 dark:text-blue-300">{totalProgress.toFixed(0)}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-500/10 dark:to-red-500/10 rounded-xl p-4 border border-orange-500/30 dark:border-orange-500/20">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Ahorrado</p>
          <p className="text-2xl font-bold text-orange-400 dark:text-orange-300">${totalSaved.toFixed(0)}</p>
        </div>
      </div>

      {/* Formulario Agregar Meta */}
      {showAddForm && (
        <div className="bg-white/5 dark:bg-white/3 rounded-xl p-4 mb-6 border border-white/10 dark:border-white/5">
          <h4 className="text-lg font-semibold text-white dark:text-gray-100 mb-4">Nueva Meta Financiera</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre de la meta"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Meta ($)"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Progreso actual ($)"
              value={newGoal.currentAmount}
              onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            />
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            >
              <option value="Ahorro">Ahorro</option>
              <option value="Viaje">Viaje</option>
              <option value="Inversión">Inversión</option>
              <option value="Compra">Compra Grande</option>
              <option value="Educación">Educación</option>
            </select>
            <select
              value={newGoal.priority}
              onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as 'high' | 'medium' | 'low'})}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            >
              <option value="high">Alta Prioridad</option>
              <option value="medium">Media Prioridad</option>
              <option value="low">Baja Prioridad</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddGoal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Crear Meta
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Metas */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500">No tienes metas financieras aún</p>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
              Crea tu primera meta para comenzar a ahorrar
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={goal.id}
                className={`rounded-xl p-5 border-2 ${priorityColors[goal.priority]} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-white dark:text-gray-100">{goal.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${priorityBadges[goal.priority]}`}>
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{goal.category}</p>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 dark:text-gray-400">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-purple-400 dark:text-purple-300">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 dark:bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : progress > 75
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : progress > 50
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Sugerencia de IA */}
                {goal.aiSuggestion && !isCompleted && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-lg p-3 mb-3 border border-purple-500/30 dark:border-purple-500/20">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-purple-400 dark:text-purple-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-300 dark:text-purple-400">{goal.aiSuggestion}</p>
                    </div>
                  </div>
                )}

                {/* Info adicional */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(goal.deadline).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : daysLeft < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {isOverdue ? 'Vencida' : `${daysLeft} días restantes`}
                      </span>
                    </div>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const amount = prompt('¿Cuánto quieres agregar?');
                        if (amount) updateProgress(goal.id, parseFloat(amount));
                      }}
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <DollarSign className="w-3 h-3" />
                      Agregar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen final */}
      {goals.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-xl p-4 border border-purple-500/30 dark:border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500">Progreso Total de Metas</p>
              <p className="text-2xl font-bold text-white dark:text-gray-100">
                ${totalSaved.toFixed(2)} / ${totalTarget.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 dark:text-gray-500">Faltan</p>
              <p className="text-2xl font-bold text-purple-400 dark:text-purple-300">
                ${(totalTarget - totalSaved).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;