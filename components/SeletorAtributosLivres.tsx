"use client";

import React, { useEffect, useState } from "react";
import { Raca } from "@/types";

interface SeletorAtributosLivresProps {
  raca: Raca;
  atributosEscolhidos: string[];
  onChange: (atributos: string[]) => void;
}

const SeletorAtributosLivres: React.FC<SeletorAtributosLivresProps> = ({
  raca,
  atributosEscolhidos,
  onChange
}) => {
  // Estado local para forçar re-render
  const [atributosInternos, setAtributosInternos] = useState<string[]>(atributosEscolhidos);

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setAtributosInternos(atributosEscolhidos);
  }, [atributosEscolhidos]);
  // Identificar qual atributo tem penalidade (não pode ser escolhido)
  const atributoComPenalidade = raca.atributo_penalidade?.toUpperCase();

  const atributosDisponiveis = [
    { key: 'FOR', label: 'Força (FOR)' },
    { key: 'DES', label: 'Destreza (DES)' },
    { key: 'CON', label: 'Constituição (CON)' },
    { key: 'INT', label: 'Inteligência (INT)' },
    { key: 'SAB', label: 'Sabedoria (SAB)' },
    { key: 'CAR', label: 'Carisma (CAR)' }
  ].filter(atributo =>
    // Excluir atributo que tem penalidade
    atributo.key !== atributoComPenalidade
  );

  const getQuantidadeNecessaria = (): number => {
    // Contar quantos campos de bônus estão marcados como "livre"
    let quantidade = 0;

    if (raca.atributo_bonus_1?.toLowerCase() === 'livre') quantidade++;
    if (raca.atributo_bonus_2?.toLowerCase() === 'livre') quantidade++;
    if (raca.atributo_bonus_3?.toLowerCase() === 'livre') quantidade++;

    return quantidade;
  };

  const quantidadeNecessaria = getQuantidadeNecessaria();

  const handleAtributoToggle = (atributo: string) => {
    let novosAtributos: string[];

    if (atributosInternos.includes(atributo)) {
      // Remover atributo se já estiver selecionado
      novosAtributos = atributosInternos.filter(attr => attr !== atributo);
    } else {
      // Adicionar atributo se não estiver selecionado
      if (atributosInternos.length < quantidadeNecessaria) {
        novosAtributos = [...atributosInternos, atributo];
      } else {
        // Se já tem o máximo, substituir o primeiro
        novosAtributos = [...atributosInternos.slice(1), atributo];
      }
    }

    setAtributosInternos(novosAtributos);
    onChange(novosAtributos);
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <h4 className="text-lg font-semibold mb-2 text-green-800">
        🎯 Escolha de Atributos Livres - {raca.nome}
      </h4>
      <p className="text-sm text-green-700 mb-3">
        Escolha {quantidadeNecessaria} atributos para receber +1 de bônus racial cada.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {atributosDisponiveis.map(atributo => {
          const isSelected = atributosInternos.includes(atributo.key);
          const canSelect = !isSelected && atributosInternos.length < quantidadeNecessaria;

          return (
            <button
              key={atributo.key}
              type="button"
              onClick={() => handleAtributoToggle(atributo.key)}
              disabled={!isSelected && !canSelect}
              className={`p-2 rounded border text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-green-500 text-white border-green-500'
                  : canSelect
                    ? 'bg-white text-green-700 border-green-300 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
            >
              {atributo.label}
              {isSelected && ' ✓'}
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-green-600">
        Selecionados: {atributosInternos.length}/{quantidadeNecessaria}
      </div>

      {/* Mostrar penalidade se existir */}
      {atributoComPenalidade && raca.valor_penalidade && (
        <div className="mt-2 p-2 bg-red-100 rounded border border-red-200 text-xs text-red-700">
          ⚠️ {raca.nome} tem {raca.valor_penalidade} em {atributoComPenalidade} (não pode ser escolhido)
        </div>
      )}
    </div>
  );
};

export default SeletorAtributosLivres;
