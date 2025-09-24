'use client';

import React from 'react';
import { Pericia, Poder } from '@/types';

// Helper para obter ID de forma consistente
const getId = (item: any): number => item.ID || item.id || 0;

interface BeneficiosOrigemSelecionadosProps {
  // Recebe os IDs dos benefícios escolhidos
  beneficiosAtuais: { pericias: number[], poderes: number[] };
  // Recebe a lista completa de opções para encontrar os detalhes
  periciasDisponiveis: Pericia[];
  poderesDisponiveis: Poder[];
}

const BeneficiosOrigemSelecionados: React.FC<BeneficiosOrigemSelecionadosProps> = ({
  beneficiosAtuais,
  periciasDisponiveis,
  poderesDisponiveis
}) => {
  // Filtra a lista completa para pegar só os objetos das perícias escolhidas
  const periciasEscolhidas = periciasDisponiveis.filter(pericia =>
    beneficiosAtuais.pericias.includes(getId(pericia))
  );

  // Filtra a lista completa para pegar só os objetos dos poderes escolhidos
  const poderesEscolhidos = poderesDisponiveis.filter(poder =>
    beneficiosAtuais.poderes.includes(getId(poder))
  );

  // Se nada foi escolhido ainda, não mostra nada
  if (periciasEscolhidas.length === 0 && poderesEscolhidos.length === 0) {
    return null;
  }

  return (
    // Container principal, pode ser da cor que preferir. Usarei um neutro.
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-md font-medium mb-3 text-gray-800">
        Benefícios de Origem Escolhidos
      </h4>

      <div className="space-y-3">
        {/* Seção para Perícias Escolhidas */}
        {periciasEscolhidas.map((pericia) => (
          <div
            key={getId(pericia)}
            className="p-3 border border-purple-300 bg-purple-100 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <h5 className="font-semibold text-sm text-gray-900">{pericia.nome}</h5>
              <span className="text-xs bg-purple-300 px-2 py-1 rounded text-purple-800 font-medium">
                Perícia
              </span>
            </div>
          </div>
        ))}

        {/* Seção para Poderes Escolhidos */}
        {poderesEscolhidos.map((poder) => (
          <div
            key={getId(poder)}
            className="p-3 border border-green-300 bg-green-100 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
              <div className="flex gap-1">
                 {poder.tipo && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                        {poder.tipo}
                    </span>
                 )}
                <span className="text-xs bg-green-300 px-2 py-1 rounded text-green-800 font-medium">
                  Poder
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
  );
};

export default BeneficiosOrigemSelecionados;
