import { useState, useEffect } from 'react';
import { History, Calendar, TrendingUp, DollarSign, Brain, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface AnalysisHistoryItem {
  id: number;
  totalSpent: number;
  subscriptions: number;
  savingsPotential: number;
  createdAt: string;
  insights: string[];
  duplicates: Array<{
    name: string;
    count: number;
    saving: number;
  }>;
}

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Cargando historial de análisis...');

      const response = await fetch(`${API_URL}/api/analyses`);
      const data = await response.json();

      if (data.success) {
        setAnalyses(data.analyses);
        console.log('✅ Análisis cargados:', data.analyses.length);
      }
    } catch (error) {
      console.error('❌ Error cargando análisis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 ml-4">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-400" />
          Historial de Análisis
        </h3>
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay análisis guardados aún</p>
          <p className="text-gray-500 text-sm mt-2">
            Realiza tu primer análisis para ver el historial aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-blue-400" />
          Historial de Análisis ({analyses.length})
        </h3>
        <button
          onClick={loadAnalyses}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors"
          >
            {/* Header */}
            <div
              onClick={() => toggleExpand(analysis.id)}
              className="p-4 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-white font-medium text-sm">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Gastado: <span className="text-red-400 font-semibold">
                        ${analysis.totalSpent.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      Ahorro: <span className="text-green-400 font-semibold">
                        ${analysis.savingsPotential.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      Suscripciones: <span className="text-orange-400 font-semibold">
                        {analysis.subscriptions}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-gray-400">
                {expandedId === analysis.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === analysis.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                {/* Insights */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Insights de IA
                  </h4>
                  <div className="space-y-2">
                    {analysis.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 rounded-lg p-3 text-sm text-gray-300"
                      >
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duplicates */}
                {analysis.duplicates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Suscripciones Duplicadas
                    </h4>
                    <div className="space-y-2">
                      {analysis.duplicates.map((dup, idx) => (
                        <div
                          key={idx}
                          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">{dup.name}</p>
                            <p className="text-gray-400 text-xs">{dup.count} servicios</p>
                          </div>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {dup.saving.toFixed(2)}/mes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Gastado</p>
                    <p className="text-lg font-bold text-red-400">
                      ${analysis.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Suscripciones</p>
                    <p className="text-lg font-bold text-orange-400">
                      {analysis.subscriptions}
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Ahorro Potencial</p>
                    <p className="text-lg font-bold text-green-400">
                      ${analysis.savingsPotential.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {analyses.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Análisis Totales</p>
              <p className="text-2xl font-bold text-white">{analyses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Gasto Promedio</p>
              <p className="text-2xl font-bold text-red-400">
                ${(analyses.reduce((sum, a) => sum + a.totalSpent, 0) / analyses.length).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Ahorro Total</p>
              <p className="text-2xl font-bold text-green-400">
                ${analyses.reduce((sum, a) => sum + a.savingsPotential, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Último Análisis</p>
              <p className="text-sm font-bold text-purple-400">
                {new Date(analyses[0].createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;