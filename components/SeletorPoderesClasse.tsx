import React, { useState, useEffect } from 'react';
import { Habilidade } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface SeletorPoderesClasseProps {
  classeId: number;
  classeNome: string;
  nivel: number;
  onPoderesSelecionados: (poderes: number[]) => void;
  poderesSelecionados?: number[];
}

const SeletorPoderesClasse: React.FC<SeletorPoderesClasseProps> = ({
  classeId,
  classeNome,
  nivel,
  onPoderesSelecionados,
  poderesSelecionados = []
}) => {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [poderesSelecionadosLocal, setPoderesSelecionadosLocal] = useState<number[]>(poderesSelecionados);

  // Helper para obter o ID da habilidade (compatibilidade com API)
  const getHabilidadeId = (habilidade: Habilidade): number => {
    return habilidade.id || habilidade.ID || 0;
  };

  // Carregar habilidades da classe
  useEffect(() => {
    const carregarHabilidades = async () => {
      if (!classeId || !nivel) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/habilidades/classe/${classeId}/nivel/${nivel}`);
        if (response.ok) {
          const data = await response.json();
          setHabilidades(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar habilidades da classe:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarHabilidades();
  }, [classeId, nivel]);

  // Separar habilidades automáticas e opcionais
  const habilidadesAutomaticas = habilidades.filter(h => !h.opcional);
  const habilidadesOpcionais = habilidades.filter(h => h.opcional);

  const handleSelecionarPoder = (habilidadeId: number) => {
    const novosPoderes = poderesSelecionadosLocal.includes(habilidadeId)
      ? poderesSelecionadosLocal.filter(id => id !== habilidadeId)
      : [...poderesSelecionadosLocal, habilidadeId];

    setPoderesSelecionadosLocal(novosPoderes);
    onPoderesSelecionados(novosPoderes);
  };

  const renderHabilidade = (habilidade: Habilidade, isOpcional: boolean = false) => {
    const habilidadeId = getHabilidadeId(habilidade);
    const selecionada = poderesSelecionadosLocal.includes(habilidadeId);

    return (
      <div
        key={habilidadeId}
        className={`p-4 border rounded-lg transition-all ${
          isOpcional
            ? selecionada
              ? 'border-blue-500 bg-blue-50 cursor-pointer shadow-md'
              : 'border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-gray-400'
            : 'border-green-500 bg-green-50'
        }`}
        onClick={() => isOpcional && handleSelecionarPoder(habilidadeId)}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-base text-gray-900">{habilidade.nome}</h4>
          <div className="flex gap-2">
            {habilidade.nivel && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                Nível {habilidade.nivel}
              </span>
            )}
            {isOpcional && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                selecionada ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
              }`}>
                {selecionada ? 'Selecionado' : 'Opcional'}
              </span>
            )}
            {!isOpcional && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                Automático
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {habilidade.descricao}
        </p>
        {isOpcional && (
          <div className="mt-3 text-xs text-gray-500">
            {selecionada
              ? '✓ Clique para desselecionar'
              : '○ Clique para selecionar este poder'
            }
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Poderes de {classeNome}</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando poderes...</p>
        </div>
      </div>
    );
  }

  if (habilidades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Poderes de {classeNome}</h3>
        <p className="text-gray-500 text-center py-8">
          Nenhum poder disponível para nível {nivel}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-6">
        Poderes de {classeNome} - Nível {nivel}
      </h3>

      {/* Habilidades Automáticas */}
      {habilidadesAutomaticas.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4 text-green-700 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Poderes Automáticos
          </h4>
          <div className="space-y-3">
            {habilidadesAutomaticas.map(habilidade => renderHabilidade(habilidade, false))}
          </div>
        </div>
      )}

      {/* Habilidades Opcionais */}
      {habilidadesOpcionais.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4 text-orange-700 flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            Poderes Opcionais
            <span className="ml-2 text-sm text-gray-500">
              ({poderesSelecionadosLocal.filter(id =>
                habilidadesOpcionais.some(h => getHabilidadeId(h) === id)
              ).length} selecionados)
            </span>
          </h4>
          <div className="space-y-3">
            {habilidadesOpcionais.map(habilidade => renderHabilidade(habilidade, true))}
          </div>
          {habilidadesOpcionais.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Poderes opcionais permitem personalizar seu personagem.
                Escolha aqueles que melhor se adequam ao seu estilo de jogo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeletorPoderesClasse;
