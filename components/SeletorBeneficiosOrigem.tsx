'use client';

import React from 'react';
import { Poder, Pericia } from '@/types';

// Helper para obter ID de forma consistente
const getId = (item: any): number => item.ID || item.id || 0;

interface SeletorBeneficiosOrigemProps {
  origemId: number | null;
  beneficiosAtuais: { pericias: number[], poderes: number[] };
  onBeneficiosChange: (beneficios: { pericias: number[], poderes: number[] }) => void;
  periciasDisponiveis: Pericia[];
  poderesDisponiveis: Poder[];
  loading: boolean;
}

const SeletorBeneficiosOrigem: React.FC<SeletorBeneficiosOrigemProps> = ({
  origemId,
  beneficiosAtuais,
  onBeneficiosChange,
  periciasDisponiveis,
  poderesDisponiveis,
  loading
}) => {

  const totalEscolhidos = (beneficiosAtuais.pericias?.length || 0) + (beneficiosAtuais.poderes?.length || 0);
  const maxEscolhas = 2;

  const handlePericiaChange = (periciaId: number) => {
    const selecionado = beneficiosAtuais.pericias.includes(periciaId);
    const novasPericias = selecionado
      ? beneficiosAtuais.pericias.filter(id => id !== periciaId)
      : [...beneficiosAtuais.pericias, periciaId];

    if (novasPericias.length + (beneficiosAtuais.poderes?.length || 0) <= maxEscolhas) {
      onBeneficiosChange({ ...beneficiosAtuais, pericias: novasPericias });
    }
  };

  const handlePoderChange = (poderId: number) => {
    const selecionado = beneficiosAtuais.poderes.includes(poderId);
    const novosPoderes = selecionado
      ? beneficiosAtuais.poderes.filter(id => id !== poderId)
      : [...beneficiosAtuais.poderes, poderId];

    if ((beneficiosAtuais.pericias?.length || 0) + novosPoderes.length <= maxEscolhas) {
      onBeneficiosChange({ ...beneficiosAtuais, poderes: novosPoderes });
    }
  };

  if (!origemId) return null;

  if (loading) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Benefícios da Origem</h3>
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando benefícios...</span>
            </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mt-4">
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Benefícios da Origem</h3>
            <p className="text-sm text-gray-600 mt-1">
                Escolha dois benefícios abaixo. Pode ser duas perícias, dois poderes, ou um de cada.
                <span className="ml-2 font-medium text-blue-600">
                    ({totalEscolhidos}/{maxEscolhas} selecionados)
                </span>
            </p>
        </div>

        {/* Seção de Perícias Opcionais */}
        {periciasDisponiveis.length > 0 && (
            <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-purple-700">Perícias Opcionais</h4>
                <div className="space-y-2">
                    {periciasDisponiveis.map(pericia => {
                        const periciaId = getId(pericia);
                        const selecionado = beneficiosAtuais.pericias.includes(periciaId);
                        const limiteAtingido = !selecionado && totalEscolhidos >= maxEscolhas;

                        return (
                            <div key={periciaId}
                                className={`p-3 border rounded-lg transition-colors ${
                                    limiteAtingido
                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                                    : selecionado
                                        ? 'border-purple-500 bg-purple-50 cursor-pointer'
                                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                                }`}
                                onClick={() => !limiteAtingido && handlePericiaChange(periciaId)}
                            >
                                <div className="flex justify-between items-center">
                                    <h5 className="font-semibold text-sm text-gray-900">{pericia.nome}</h5>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        selecionado
                                        ? 'bg-purple-200 text-purple-800'
                                        : 'bg-yellow-200 text-yellow-800'
                                    }`}>
                                        {selecionado ? 'Selecionado' : 'Opcional'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Seção de Poderes Opcionais */}
        {poderesDisponiveis.length > 0 && (
            <div>
                <h4 className="text-md font-medium mb-3 text-green-700">Poderes Opcionais</h4>
                <div className="space-y-2">
                    {poderesDisponiveis.map(poder => {
                        const poderId = getId(poder);
                        const selecionado = beneficiosAtuais.poderes.includes(poderId);
                        const limiteAtingido = !selecionado && totalEscolhidos >= maxEscolhas;

                        return (
                            <div key={poderId}
                                className={`p-3 border rounded-lg transition-colors ${
                                    limiteAtingido
                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                                    : selecionado
                                        ? 'border-green-500 bg-green-50 cursor-pointer'
                                        : 'border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer'
                                }`}
                                onClick={() => !limiteAtingido && handlePoderChange(poderId)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        selecionado
                                        ? 'bg-green-200 text-green-800'
                                        : 'bg-yellow-200 text-yellow-800'
                                    }`}>
                                        {selecionado ? 'Selecionado' : 'Opcional'}
                                    </span>
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
    </div>
  );
};

export default SeletorBeneficiosOrigem;
