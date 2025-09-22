"use client";

import React from "react";
import { Raca } from "@shared/types";
import SeletorAtributosLivres from "./SeletorAtributosLivres";

interface PointBuyCalculatorProps {
  atributos: {
    for: number;
    des: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  };
  onChange: (atributos: {
    for: number;
    des: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  }) => void;
  racaSelecionada?: Raca;
  atributosLivresEscolhidos?: string[];
  onAtributosLivresChange?: (atributos: string[]) => void;
}

// Tabela de custos para point-buy
const getCostForValue = (value: number): number => {
  switch (value) {
    case -1: return -1; // Ganho de 1 ponto
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 4;
    case 4: return 7;
    default: return 0;
  }
};

// Mapear nomes de atributos para as chaves usadas no sistema
const atributoMap: Record<string, 'for' | 'des' | 'con' | 'int' | 'sab' | 'car'> = {
  'FOR': 'for',
  'DES': 'des',
  'CON': 'con',
  'INT': 'int',
  'SAB': 'sab',
  'CAR': 'car',
  'forca': 'for',
  'destreza': 'des',
  'constituicao': 'con',
  'inteligencia': 'int',
  'sabedoria': 'sab',
  'carisma': 'car'
};

const PointBuyCalculator: React.FC<PointBuyCalculatorProps> = ({
  atributos,
  onChange,
  racaSelecionada,
  atributosLivresEscolhidos = [],
  onAtributosLivresChange
}) => {
  // Verificar se a raça tem atributos livres
  const temAtributosLivres = racaSelecionada && (
    racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_3?.toLowerCase() === 'livre'
  );

  // Calcular bônus raciais considerando atributos livres
  const getBonusRacial = (atributo: keyof typeof atributos): number => {
    if (!racaSelecionada) return 0;

    let bonus = 0;

    // Se tem atributos livres, usar a seleção do jogador
    if (temAtributosLivres) {
      const atributoKey = atributo.toUpperCase();

      if (atributosLivresEscolhidos.includes(atributoKey)) {
        bonus += 1; // Cada atributo livre escolhido recebe +1
      }

      // Para raças mistas (que têm alguns fixos e alguns livres)
      // verificar também os bônus fixos usando os novos campos
      if (racaSelecionada.atributo_bonus_1 && racaSelecionada.atributo_bonus_1.toLowerCase() !== 'livre') {
        const atributo1 = atributoMap[racaSelecionada.atributo_bonus_1.toUpperCase()];
        if (atributo1 === atributo) {
          bonus += racaSelecionada.valor_bonus_1 || 0;
        }
      }

      if (racaSelecionada.atributo_bonus_2 && racaSelecionada.atributo_bonus_2.toLowerCase() !== 'livre') {
        const atributo2 = atributoMap[racaSelecionada.atributo_bonus_2.toUpperCase()];
        if (atributo2 === atributo) {
          bonus += racaSelecionada.valor_bonus_2 || 0;
        }
      }

      if (racaSelecionada.atributo_bonus_3 && racaSelecionada.atributo_bonus_3.toLowerCase() !== 'livre') {
        const atributo3 = atributoMap[racaSelecionada.atributo_bonus_3.toUpperCase()];
        if (atributo3 === atributo) {
          bonus += racaSelecionada.valor_bonus_3 || 0;
        }
      }


    } else {
      // Sistema normal para raças com bônus fixos - usar os novos campos
      if (racaSelecionada.atributo_bonus_1) {
        const atributo1 = atributoMap[racaSelecionada.atributo_bonus_1.toUpperCase()];
        if (atributo1 === atributo) {
          bonus += racaSelecionada.valor_bonus_1 || 0;
        }
      }

      if (racaSelecionada.atributo_bonus_2) {
        const atributo2 = atributoMap[racaSelecionada.atributo_bonus_2.toUpperCase()];
        if (atributo2 === atributo) {
          bonus += racaSelecionada.valor_bonus_2 || 0;
        }
      }

      if (racaSelecionada.atributo_bonus_3) {
        const atributo3 = atributoMap[racaSelecionada.atributo_bonus_3.toUpperCase()];
        if (atributo3 === atributo) {
          bonus += racaSelecionada.valor_bonus_3 || 0;
        }
      }

    }

    return bonus;
  };

  // Calcular penalidades raciais usando os dados do banco
  const getPenalidadeRacial = (atributo: keyof typeof atributos): number => {
    if (!racaSelecionada) return 0;

    // Primeiro verificar se há penalidade nos novos campos do banco
    if (racaSelecionada.atributo_penalidade && racaSelecionada.valor_penalidade) {
      const atributoPenalidade = atributoMap[racaSelecionada.atributo_penalidade.toUpperCase()];
      if (atributoPenalidade === atributo) {
        return racaSelecionada.valor_penalidade;
      }
    }

    return 0;
  };

  // Calcular valor final do atributo (base + bônus racial + penalidade)
  const getValorFinal = (atributo: keyof typeof atributos): number => {
    const valorBase = atributos[atributo];
    const bonus = getBonusRacial(atributo);
    const penalidade = getPenalidadeRacial(atributo);

    return valorBase + bonus + penalidade;
  };

  const totalCost = Object.values(atributos).reduce(
    (sum, value) => sum + getCostForValue(value),
    0
  );

  const remainingPoints = 10 - totalCost;

  const updateAttribute = (attr: keyof typeof atributos, change: number) => {
    const newValue = atributos[attr] + change;

    // Verificar se o valor está no range válido
    if (newValue < -1 || newValue > 4) return;

    // Verificar se temos pontos suficientes para aumentar
    if (change > 0) {
      const currentCost = getCostForValue(atributos[attr]);
      const newCost = getCostForValue(newValue);
      const costDifference = newCost - currentCost;

      if (remainingPoints - costDifference < 0) {
        return; // Não há pontos suficientes
      }
    }

    onChange({
      ...atributos,
      [attr]: newValue,
    });
  };

  const getModifier = (value: number): string => {
    // No Tormenta20, o modificador é igual ao valor do atributo
    if (value < 0) return String(value);
    if (value === 0) return "0";
    return `+${value}`;
  };

  const AttributeRow = ({
    name,
    attr,
    label
  }: {
    name: keyof typeof atributos;
    attr: string;
    label: string;
  }) => {
    const valorBase = atributos[name];
    const bonus = getBonusRacial(name);
    const penalidade = getPenalidadeRacial(name);
    const valorFinal = getValorFinal(name);
    const modificadorFinal = getModifier(valorFinal);

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex flex-col">
          <span className="font-medium">{label}</span>
          <span className="text-sm text-gray-600">
            Modificador: {modificadorFinal}
          </span>
          {racaSelecionada && (bonus !== 0 || penalidade !== 0) && (
            <span className="text-xs text-blue-600">
              Base: {valorBase}
              {bonus > 0 && ` +${bonus} racial`}
              {penalidade < 0 && ` ${penalidade} racial`}
              {` = ${valorFinal} final`}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateAttribute(name, -1)}
              disabled={atributos[name] <= -1}
              className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{atributos[name]}</span>
            <button
              type="button"
              onClick={() => updateAttribute(name, 1)}
              disabled={
                atributos[name] >= 4 ||
                (remainingPoints -
                  (getCostForValue(atributos[name] + 1) - getCostForValue(atributos[name])) < 0)
              }
              className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
            >
              +
            </button>
            <span className="text-sm text-gray-600 ml-2">
              Custo: {getCostForValue(atributos[name])}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Distribuição de Pontos</h3>
        <p className="text-sm text-gray-600 mb-2">
          Você tem 10 pontos para distribuir. Cada nível de atributo tem um custo diferente.
        </p>
        <div className="text-xs text-gray-500 grid grid-cols-3 gap-2">
          <span>-1: +1 ponto</span>
          <span>0: 0 pontos</span>
          <span>1: 1 ponto</span>
          <span>2: 2 pontos</span>
          <span>3: 4 pontos</span>
          <span>4: 7 pontos</span>
        </div>

        <div className="mt-3 p-2 bg-white rounded border">
          <span className="font-medium">Pontos restantes: </span>
          <span className={`font-bold ${
            remainingPoints < 0
              ? 'text-red-600'
              : remainingPoints === 0
                ? 'text-green-600'
                : 'text-blue-600'
          }`}>
            {remainingPoints}
          </span>
        </div>

        {racaSelecionada && !temAtributosLivres && (
          <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            <span className="text-sm font-medium text-yellow-800">
              Bônus racial aplicado: {racaSelecionada.nome}
            </span>
            <div className="text-xs text-yellow-700 mt-1">
              {racaSelecionada.atributo_bonus_1 && racaSelecionada.valor_bonus_1 && (
                <span>
                  +{racaSelecionada.valor_bonus_1} {racaSelecionada.atributo_bonus_1.toUpperCase()}
                </span>
              )}
              {racaSelecionada.atributo_bonus_1 && racaSelecionada.atributo_bonus_2 && ', '}
              {racaSelecionada.atributo_bonus_2 && racaSelecionada.valor_bonus_2 && (
                <span>
                  +{racaSelecionada.valor_bonus_2} {racaSelecionada.atributo_bonus_2.toUpperCase()}
                </span>
              )}
              {racaSelecionada.atributo_bonus_2 && racaSelecionada.atributo_bonus_3 && ', '}
              {racaSelecionada.atributo_bonus_3 && racaSelecionada.valor_bonus_3 && (
                <span>
                  +{racaSelecionada.valor_bonus_3} {racaSelecionada.atributo_bonus_3.toUpperCase()}
                </span>
              )}
              {racaSelecionada.atributo_penalidade && racaSelecionada.valor_penalidade && (
                <span className="text-red-600">
                  , {racaSelecionada.valor_penalidade} {racaSelecionada.atributo_penalidade.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Seletor de Atributos Livres */}
      {temAtributosLivres && racaSelecionada && onAtributosLivresChange && (
        <SeletorAtributosLivres
          raca={racaSelecionada}
          atributosEscolhidos={atributosLivresEscolhidos}
          onChange={onAtributosLivresChange}
        />
      )}

      <div className="space-y-3">
        <AttributeRow name="for" attr="for" label="Força (FOR)" />
        <AttributeRow name="des" attr="des" label="Destreza (DES)" />
        <AttributeRow name="con" attr="con" label="Constituição (CON)" />
        <AttributeRow name="int" attr="int" label="Inteligência (INT)" />
        <AttributeRow name="sab" attr="sab" label="Sabedoria (SAB)" />
        <AttributeRow name="car" attr="car" label="Carisma (CAR)" />
      </div>
    </div>
  );
};

export default PointBuyCalculator;
