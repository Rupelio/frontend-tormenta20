'use client';

import React, { useState, useEffect } from 'react';
import { Poder, Pericia } from '@/types';
import { api } from '../lib/api'; // Importe sua instância da API

interface SeletorBeneficiosOrigemProps {
  origemId: number | null;
  beneficiosAtuais: { pericias: number[], poderes: number[] };
  onBeneficiosChange: (beneficios: { pericias: number[], poderes: number[] }) => void;
}

const SeletorBeneficiosOrigem: React.FC<SeletorBeneficiosOrigemProps> = ({
  origemId,
  beneficiosAtuais,
  onBeneficiosChange
}) => {
  const [periciasDisponiveis, setPericiasDisponiveis] = useState<Pericia[]>([]);
  const [poderesDisponiveis, setPoderesDisponiveis] = useState<Poder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origemId) {
      setPericiasDisponiveis([]);
      setPoderesDisponiveis([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [periciasData, poderesData] = await Promise.all([
          api.getPericiasOrigem(origemId),
          api.getPoderesOrigem(origemId) // Usando a função da API
        ]);

        setPericiasDisponiveis(periciasData?.pericias || []);
        setPoderesDisponiveis(poderesData || []);

      } catch (error) {
        console.error('Erro ao carregar dados da origem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [origemId]);

  const totalEscolhidos = (beneficiosAtuais.pericias?.length || 0) + (beneficiosAtuais.poderes?.length || 0);
  const maxEscolhas = 2;

  const handlePericiaChange = (periciaId: number, selected: boolean) => {
    const novasPericias = selected
      ? [...beneficiosAtuais.pericias, periciaId]
      : beneficiosAtuais.pericias.filter(id => id !== periciaId);

    if (novasPericias.length + (beneficiosAtuais.poderes?.length || 0) <= maxEscolhas) {
      onBeneficiosChange({ ...beneficiosAtuais, pericias: novasPericias });
    }
  };

  const handlePoderChange = (poderId: number, selected: boolean) => {
    const novosPoderes = selected
      ? [...beneficiosAtuais.poderes, poderId]
      : beneficiosAtuais.poderes.filter(id => id !== poderId);

    if ((beneficiosAtuais.pericias?.length || 0) + novosPoderes.length <= maxEscolhas) {
      onBeneficiosChange({ ...beneficiosAtuais, poderes: novosPoderes });
    }
  };

  if (!origemId) return null;

  if (loading) {
    return <div className="mt-4 p-4 text-center text-gray-500">Carregando benefícios da origem...</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-800 mb-2">Benefícios da Origem</h4>
        <p className="text-sm text-purple-700 mb-3">
          Escolha dois benefícios concedidos pela sua origem.
        </p>

        <div className="mb-3 p-2 bg-purple-100 rounded text-sm font-medium text-purple-800">
          Selecionados: {totalEscolhidos} / {maxEscolhas}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção de Perícias */}
          <div className="p-3 bg-white rounded-lg border">
            <h6 className="font-medium mb-2 text-gray-800">Perícias:</h6>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {periciasDisponiveis.map(pericia => {
                const isSelected = beneficiosAtuais.pericias.includes(pericia.id);
                const isDisabled = !isSelected && totalEscolhidos >= maxEscolhas;
                return (
                  <label key={pericia.id} className={`flex items-center space-x-2 p-1 rounded ${isDisabled ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={isSelected} onChange={(e) => handlePericiaChange(pericia.id, e.target.checked)} disabled={isDisabled} />
                    <span>{pericia.nome}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Seleção de Poderes */}
          <div className="p-3 bg-white rounded-lg border">
            <h6 className="font-medium mb-2 text-gray-800">Poderes:</h6>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {poderesDisponiveis.map(poder => {
                const poderId = poder.ID || poder.id || 0;
                const isSelected = beneficiosAtuais.poderes.includes(poderId);
                const isDisabled = !isSelected && totalEscolhidos >= maxEscolhas;
                return (
                  <label key={poderId} className={`flex items-center space-x-2 p-1 rounded ${isDisabled ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={isSelected} onChange={(e) => handlePoderChange(poderId, e.target.checked)} disabled={isDisabled} />
                    <span>{poder.nome}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeletorBeneficiosOrigem;
