'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface Pericia {
  id: number;
  nome: string;
  atributo: string;
  descricao: string;
}

interface SeletorPericiasProps {
  classeId: number | null;
  racaId: number | null;
  origemId: number | null;
  periciasEscolhidas: number[];
  onPericiasChange: (pericias: number[]) => void;
  periciasDeRaca?: Pericia[]; // Perícias vindas das escolhas de raça
}

export default function SeletorPericias({
  classeId,
  racaId,
  origemId,
  periciasEscolhidas,
  onPericiasChange,
  periciasDeRaca = [],
}: SeletorPericiasProps) {
  const [periciasDisponiveis, setPericiasDisponiveis] = useState<Pericia[]>([]);
  const [periciasAutomaticas, setPericiasAutomaticas] = useState<Pericia[]>([]);
  const [quantidadePericias, setQuantidadePericias] = useState(2);
  const [loading, setLoading] = useState(false);

  // Reset perícias escolhidas quando classe mudar
  useEffect(() => {
    onPericiasChange([]);
  }, [classeId]); // Remove onPericiasChange da dependência para evitar loops

  // Buscar todas as perícias quando qualquer ID mudar
  useEffect(() => {
    const fetchTodasPericias = async () => {
      if (!classeId) {
        setPericiasDisponiveis([]);
        setPericiasAutomaticas([]);
        setQuantidadePericias(2);
        return;
      }

      setLoading(true);
      try {
        const promises: Promise<any>[] = [];

        // Buscar perícias da classe
        promises.push(
          fetch(`${API_BASE_URL}/api/v1/classes/${classeId}/pericias`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );

        // Buscar perícias da raça se selecionada
        if (racaId) {
          promises.push(
            fetch(`${API_BASE_URL}/api/v1/racas/${racaId}/pericias`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        // Buscar perícias da origem se selecionada
        if (origemId) {
          promises.push(
            fetch(`${API_BASE_URL}/api/v1/origens/${origemId}/pericias`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        const [classeData, racaData, origemData] = await Promise.all(promises);

        // Processar dados da classe
        if (classeData) {
          setPericiasDisponiveis(classeData.pericias_disponiveis || []);
          setQuantidadePericias(classeData.pericias_quantidade || 2);
        }

        // Combinar todas as perícias automáticas
        const todasAutomaticas: Pericia[] = [];

        // Perícias automáticas da classe
        if (classeData?.pericias_automaticas) {
          todasAutomaticas.push(...classeData.pericias_automaticas);
        }

        // Perícias automáticas da raça
        if (racaData?.pericias) {
          todasAutomaticas.push(...racaData.pericias);
        }

        // Perícias automáticas da origem
        if (origemData?.pericias) {
          todasAutomaticas.push(...origemData.pericias);
        }

        // Remover duplicatas baseado no ID
        const automaticasUnicas = todasAutomaticas.filter((pericia, index, self) =>
          index === self.findIndex(p => p.id === pericia.id)
        );

        setPericiasAutomaticas(automaticasUnicas);

      } catch (error) {
        console.error('Erro ao buscar perícias:', error);
        setPericiasDisponiveis([]);
        setPericiasAutomaticas([]);
        setQuantidadePericias(2);
      } finally {
        setLoading(false);
      }
    };

    fetchTodasPericias();
  }, [classeId, racaId, origemId]);

  // Filtrar perícias disponíveis removendo as automáticas e as de raça
  const periciasParaEscolher = periciasDisponiveis.filter(
    pericia => !periciasAutomaticas.some(auto => auto.id === pericia.id) &&
               !periciasDeRaca.some(racaPericia => racaPericia.id === pericia.id)
  );

  // Handle seleção de perícia
  const handlePericiaSelecionada = (periciaId: number) => {
    const novasEscolhidas = periciasEscolhidas.includes(periciaId)
      ? periciasEscolhidas.filter(id => id !== periciaId)
      : [...periciasEscolhidas, periciaId];

    // Limitar ao número máximo permitido
    if (novasEscolhidas.length <= quantidadePericias) {
      onPericiasChange(novasEscolhidas);
    }
  };

  const getAtributoColor = (atributo: string) => {
    const cores = {
      'FOR': 'bg-red-100 text-red-800',
      'DES': 'bg-green-100 text-green-800',
      'CON': 'bg-yellow-100 text-yellow-800',
      'INT': 'bg-blue-100 text-blue-800',
      'SAB': 'bg-purple-100 text-purple-800',
      'CAR': 'bg-pink-100 text-pink-800',
    };
    return cores[atributo as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  if (!classeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecione uma classe para escolher perícias
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Perícias
        </h3>
        <span className="text-sm text-gray-600">
          {periciasEscolhidas.length}/{quantidadePericias} escolhidas
        </span>
      </div>

      {/* Perícias Automáticas */}
      {periciasAutomaticas.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Perícias Automáticas (Classe/Raça/Origem)
          </h4>
          <div className="grid gap-2">
            {periciasAutomaticas.map((pericia) => (
              <div
                key={`auto-${pericia.id}`}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-900">{pericia.nome}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAtributoColor(pericia.atributo)}`}>
                      {pericia.atributo}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">{pericia.descricao}</p>
                </div>
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perícias de Raça Escolhidas */}
      {periciasDeRaca && periciasDeRaca.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Perícias Escolhidas da Raça
          </h4>
          <div className="grid gap-2">
            {periciasDeRaca.map((pericia, index) => (
              <div
                key={`raca-${index}`}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-900">{pericia.nome}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAtributoColor(pericia.atributo)}`}>
                      {pericia.atributo}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{pericia.descricao}</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perícias para Escolher */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">
          Escolha suas Perícias de Classe
        </h4>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando perícias...</p>
          </div>
        ) : periciasParaEscolher.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma perícia disponível para escolha
          </div>
        ) : (
          <div className="grid gap-2">
            {periciasParaEscolher.map((pericia) => {
              const isSelected = periciasEscolhidas.includes(pericia.id);
              const canSelect = isSelected || periciasEscolhidas.length < quantidadePericias;

              return (
                <button
                  key={pericia.id}
                  onClick={() => handlePericiaSelecionada(pericia.id)}
                  disabled={!canSelect}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : canSelect
                      ? 'bg-white border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {pericia.nome}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAtributoColor(pericia.atributo)}`}>
                          {pericia.atributo}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {pericia.descricao}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="text-blue-600 ml-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
