import React, { useState, useEffect } from 'react';
import { Habilidade } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface PoderesDivinosSelecionadosProps {
  divindadeId: number | null;
  poderesSelecionados: number[];
  nivelPersonagem: number;
}

const PoderesDivinosSelecionados: React.FC<PoderesDivinosSelecionadosProps> = ({
  divindadeId,
  poderesSelecionados,
  nivelPersonagem
}) => {
  const [poderes, setPoderes] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!divindadeId || poderesSelecionados.length === 0) {
      setPoderes([]);
      return;
    }

    const carregarPoderesSelecionados = async () => {
      setLoading(true);

      try {
        // Carregar todos os poderes da divindade
        const url = `${API_BASE_URL}/api/v1/habilidades/divindade/${divindadeId}`;
        const response = await fetch(url);

        if (response.ok) {
          const todosPoderes = await response.json();

          // Filtrar apenas os poderes selecionados
          const poderesFiltrados = todosPoderes.filter((poder: Habilidade) => {
            const poderId = poder.id || poder.ID || 0;
            return poderesSelecionados.includes(poderId);
          });

          setPoderes(poderesFiltrados);
        }
      } catch (err) {
        console.error('Erro ao carregar poderes selecionados:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarPoderesSelecionados();
  }, [divindadeId, poderesSelecionados, nivelPersonagem]);

  if (!divindadeId || poderesSelecionados.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="text-md font-medium mb-2 text-yellow-800">Poderes Divinos Selecionados</h4>
        <p className="text-yellow-600 text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
      <h4 className="text-md font-medium mb-3 text-yellow-800">
        Poderes Divinos Selecionados ({poderes.length})
      </h4>

      <div className="space-y-2">
        {poderes.map((poder) => {
          const poderId = poder.id || poder.ID || 0;

          return (
            <div
              key={poderId}
              className="p-3 border border-yellow-300 bg-yellow-100 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
                <div className="flex gap-1">
                  {poder.nivel && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                      Nível {poder.nivel}
                    </span>
                  )}
                  <span className="text-xs bg-yellow-300 px-2 py-1 rounded text-gray-700">
                    {poder.opcional ? 'Escolhido' : 'Automático'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {poder.descricao}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoderesDivinosSelecionados;
