import { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Save, X, SlidersHorizontal, Tv, Car, Coffee, DollarSign } from 'lucide-react';
import { showToast } from '../utils/toast';

const API_URL = 'http://localhost:3000';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionManagerProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

const TransactionManager = ({ transactions, onUpdate }: TransactionManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });

  // Obtener categorías únicas
  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    // Búsqueda por texto
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    
    // Filtro por fecha
    const matchesDateFrom = !filterDateFrom || t.date >= filterDateFrom;
    const matchesDateTo = !filterDateTo || t.date <= filterDateTo;
    
    // Filtro por monto
    const amount = Math.abs(t.amount);
    const matchesMinAmount = !filterMinAmount || amount >= parseFloat(filterMinAmount);
    const matchesMaxAmount = !filterMaxAmount || amount <= parseFloat(filterMaxAmount);

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      comparison = Math.abs(a.amount) - Math.abs(b.amount);
    } else {
      comparison = a.description.localeCompare(b.description);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Iniciar edición
  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      date: transaction.date
    });
  };

  // Guardar edición
  const saveEdit = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editForm.description,
          amount: -Math.abs(parseFloat(editForm.amount)),
          category: editForm.category,
          date: editForm.date
        })
      });

      const data = await response.json();

      if (data.success) {
        setEditingId(null);
        onUpdate();
        showToast('Transacción actualizada', 'success');
      }
    } catch {
      showToast('Error al actualizar', 'error');
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ description: '', amount: '', category: '', date: '' });
  };

  // Eliminar transacción
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta transacción?')) return;

    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        onUpdate();
        showToast('Transacción eliminada', 'info');
      }
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suscripción': return <Tv className="w-4 h-4 text-purple-400" />;
      case 'Comida': return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'Transporte': return <Car className="w-4 h-4 text-blue-400" />;
      default: return <DollarSign className="w-4 h-4 text-green-400" />;
    }
  };

  const hasActiveFilters = filterCategory !== 'all' || filterDateFrom || filterDateTo || filterMinAmount || filterMaxAmount;

  return (
    <div className="space-y-4">
      
      {/* Barra de búsqueda y controles */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-white/10">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg pl-10 pr-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Ordenar */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by as 'date' | 'amount' | 'description');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguas</option>
            <option value="amount-desc">Mayor monto</option>
            <option value="amount-asc">Menor monto</option>
            <option value="description-asc">A-Z</option>
            <option value="description-desc">Z-A</option>
          </select>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasActiveFilters
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 dark:bg-white/5 text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filtros
            {hasActiveFilters && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Activos</span>}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="date"
              placeholder="Desde"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            />

            <input
              type="date"
              placeholder="Hasta"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 focus:outline-none focus:border-purple-500"
            />

            <input
              type="number"
              placeholder="Monto mínimo"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            <input
              type="number"
              placeholder="Monto máximo"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              className="bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 rounded-lg px-4 py-2 text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Resultados */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-400 dark:text-gray-500">
            Mostrando {filteredTransactions.length} de {transactions.length} transacciones
          </span>
          {hasActiveFilters && (
            <span className="text-purple-400 dark:text-purple-300">
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-gray-600 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500">
              {transactions.length === 0 ? 'No hay transacciones' : 'No se encontraron resultados'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white/5 dark:bg-white/3 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg p-4 transition-colors"
            >
              {editingId === tx.id ? (
                // Modo edición
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Descripción"
                    />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Monto"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Suscripción">Suscripción</option>
                      <option value="Comida">Comida</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Otros">Otros</option>
                    </select>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(tx.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 dark:bg-purple-500/10 p-2 rounded-lg">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <p className="text-white dark:text-gray-100 font-semibold">{tx.description}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        {tx.date} • {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${tx.amount < 0 ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300'}`}>
                      ${Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => startEdit(tx)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionManager;