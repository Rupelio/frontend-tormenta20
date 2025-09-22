import React from 'react';
import { Habilidade } from '../../shared/types';

interface SeletorHabilidadesProps {
  tipo: 'raca' | 'classe' | 'origem' | 'divindade';
  habilidades: Habilidade[];
  nivelPersonagem?: number;
  onSelecionarHabilidade?: (habilidadeId: number) => void;
  habilidadesSelecionadas?: number[];
}

const SeletorHabilidades: React.FC<SeletorHabilidadesProps> = ({
  tipo,
  habilidades,
  nivelPersonagem = 1,
  onSelecionarHabilidade,
  habilidadesSelecionadas = []
}) => {
  const getTitulo = () => {
    switch (tipo) {
      case 'raca': return 'Habilidades Raciais';
      case 'classe': return 'Habilidades de Classe';
      case 'origem': return 'Habilidades de Origem';
      case 'divindade': return 'Dádivas Divinas';
      default: return 'Habilidades';
    }
  };

  const getCorTipo = () => {
    switch (tipo) {
      case 'raca': return 'bg-green-100 text-green-800';
      case 'classe': return 'bg-blue-100 text-blue-800';
      case 'origem': return 'bg-purple-100 text-purple-800';
      case 'divindade': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar habilidades baseado no nível (para classe e divindade)
  const habilidadesFiltradas = habilidades.filter(h => {
    if (!h.nivel) return true;
    return h.nivel <= nivelPersonagem;
  });

  // Separar habilidades automáticas das opcionais
  const habilidadesAutomaticas = habilidadesFiltradas.filter(h => !h.opcional);
  const habilidadesOpcionais = habilidadesFiltradas.filter(h => h.opcional);

  const handleSelecionarHabilidade = (habilidadeId: number) => {
    if (onSelecionarHabilidade) {
      onSelecionarHabilidade(habilidadeId);
    }
  };

  // Helper para obter o ID da habilidade (compatibilidade com API)
  const getHabilidadeId = (habilidade: Habilidade): number => {
    return habilidade.id || habilidade.ID || 0;
  };

  const renderHabilidade = (habilidade: Habilidade, isOpcional: boolean = false) => {
    const habilidadeId = getHabilidadeId(habilidade);

    return (
      <div
        key={habilidadeId}
        className={`p-3 border rounded-lg transition-colors ${
          isOpcional
            ? habilidadesSelecionadas.includes(habilidadeId)
              ? 'border-blue-500 bg-blue-50 cursor-pointer'
              : 'border-gray-200 cursor-pointer hover:bg-gray-50'
            : 'border-green-200 bg-green-50'
        }`}
        onClick={() => isOpcional && handleSelecionarHabilidade(habilidadeId)}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm text-gray-900">{habilidade.nome}</h4>
          <div className="flex gap-1">
            {habilidade.nivel && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Nível {habilidade.nivel}
              </span>
            )}
            {isOpcional && (
              <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                Opcional
              </span>
            )}
            {!isOpcional && (
              <span className="text-xs bg-green-200 px-2 py-1 rounded">
                Automática
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {habilidade.descricao}
        </p>
      </div>
    );
  };

  if (habilidades.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getCorTipo()}`}>
            {getTitulo()}
          </span>
        </h3>
        <p className="text-sm text-gray-500">Nenhuma habilidade disponível.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getCorTipo()}`}>
          {getTitulo()}
        </span>
      </h3>

      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {/* Habilidades Automáticas */}
          {habilidadesAutomaticas.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-2">
                Habilidades Automáticas
              </h5>
              <div className="space-y-2">
                {habilidadesAutomaticas.map(h => renderHabilidade(h, false))}
              </div>
            </div>
          )}

          {/* Habilidades Opcionais */}
          {habilidadesOpcionais.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-2">
                Habilidades Opcionais (clique para selecionar)
              </h5>
              <div className="space-y-2">
                {habilidadesOpcionais.map(h => renderHabilidade(h, true))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeletorHabilidades;
