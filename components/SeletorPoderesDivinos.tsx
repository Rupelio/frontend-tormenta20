import React, { useState, useEffect } from 'react';
import { Habilidade } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface SeletorPoderesDivinosProps {
  divindadeId: number | null;
  nivelPersonagem: number;
  classeId: number | null;
  poderesSelecionados?: number[];
  onPoderesSelecionados: (poderesIds: number[]) => void;
}

const SeletorPoderesDivinos: React.FC<SeletorPoderesDivinosProps> = ({
  divindadeId,
  nivelPersonagem,
  classeId,
  poderesSelecionados = [],
  onPoderesSelecionados
}) => {
  const [poderes, setPoderes] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Classes divinas: Clérigo (7), Druida (8), Paladino (14)
  const isClasseDivina = (classeId: number | null): boolean => {
    return classeId === 7 || classeId === 8 || classeId === 14;
  };

  const maxPoderesSelecionaveis = isClasseDivina(classeId) ? 2 : 1;

  useEffect(() => {
    if (!divindadeId) {
      setPoderes([]);
      return;
    }

    const carregarPoderes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Carregar todos os poderes da divindade até o nível atual
        const url = `${API_BASE_URL}/api/v1/habilidades/divindade/${divindadeId}/nivel/${nivelPersonagem}`;
        console.log('Carregando poderes da URL:', url);

        const response = await fetch(url);
        console.log('Resposta da API:', response.status, response.statusText);

        if (response.ok) {
          const poderesData = await response.json();
          console.log('Dados dos poderes recebidos:', poderesData);
          setPoderes(poderesData);
        } else {
          const errorText = await response.text();
          console.error('Erro na resposta:', response.status, errorText);
          setError('Erro ao carregar poderes da divindade');
        }
      } catch (err) {
        setError('Erro de conexão ao carregar poderes');
        console.error('Erro ao carregar poderes:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarPoderes();
  }, [divindadeId, nivelPersonagem]);

  const handleSelecionarPoder = (poderId: number) => {
    const novosPoderes = poderesSelecionados.includes(poderId)
      ? poderesSelecionados.filter(id => id !== poderId)
      : [...poderesSelecionados, poderId];

    // Validar limite de seleção
    if (novosPoderes.length > maxPoderesSelecionaveis) {
      // Exibir mensagem de erro ou não permitir a seleção
      return;
    }

    onPoderesSelecionados(novosPoderes);
  };

  const getIdPoder = (poder: Habilidade): number => {
    return poder.id || poder.ID || 0;
  };

  if (!divindadeId) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Poderes Divinos</h3>
        <p className="text-gray-500 text-sm">Selecione uma divindade para ver os poderes disponíveis.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Poderes Divinos</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando poderes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Poderes Divinos</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const poderesAutomaticos = poderes.filter(p => !p.opcional);
  const poderesOpcionais = poderes.filter(p => p.opcional);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Poderes Divinos</h3>
        <p className="text-sm text-gray-600 mt-1">
          {isClasseDivina(classeId)
            ? `Classes divinas podem escolher até ${maxPoderesSelecionaveis} poderes opcionais`
            : `Classes não-divinas podem escolher até ${maxPoderesSelecionaveis} poder opcional`}
          {poderesSelecionados.length > 0 && (
            <span className="ml-2 font-medium">
              ({poderesSelecionados.length}/{maxPoderesSelecionaveis} selecionados)
            </span>
          )}
        </p>
      </div>

      {poderesAutomaticos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-green-700">Poderes Automáticos</h4>
          <div className="space-y-2">
            {poderesAutomaticos.map((poder) => (
              <div
                key={getIdPoder(poder)}
                className="p-3 border border-green-200 bg-green-50 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
                  <div className="flex gap-1">
                    {poder.nivel && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Nível {poder.nivel}
                      </span>
                    )}
                    <span className="text-xs bg-green-200 px-2 py-1 rounded">
                      Automático
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {poder.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {poderesOpcionais.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-blue-700">Poderes Opcionais</h4>
          <p className="text-sm text-gray-600 mb-3">
            Clique nos poderes que deseja escolher para seu personagem:
          </p>
          <div className="space-y-2">
            {poderesOpcionais.map((poder) => {
              const poderId = getIdPoder(poder);
              const selecionado = poderesSelecionados.includes(poderId);
              const limiteAtingido = !selecionado && poderesSelecionados.length >= maxPoderesSelecionaveis;

              return (
                <div
                  key={poderId}
                  className={`p-3 border rounded-lg transition-colors ${
                    limiteAtingido
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : selecionado
                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                        : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !limiteAtingido && handleSelecionarPoder(poderId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
                    <div className="flex gap-1">
                      {poder.nivel && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          Nível {poder.nivel}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        selecionado
                          ? 'bg-blue-200'
                          : limiteAtingido
                            ? 'bg-gray-300'
                            : 'bg-yellow-200'
                      }`}>
                        {selecionado
                          ? 'Selecionado'
                          : limiteAtingido
                            ? 'Limite atingido'
                            : 'Opcional'}
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
      )}

      {poderes.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Nenhum poder divino disponível para o nível atual.
          </p>
        </div>
      )}
    </div>
  );
};

export default SeletorPoderesDivinos;
