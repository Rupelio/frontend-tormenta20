import React, { useState, useEffect } from 'react';
import { Personagem, Stats } from '@/types';

export const StatsCalculator: React.FC<{
  personagem: Partial<Personagem>;
  racaSelecionada?: any;
  atributosLivresEscolhidos?: string[];
}> = ({ personagem, racaSelecionada, atributosLivresEscolhidos }) => {
  const [statsCalculados, setStatsCalculados] = useState<Stats>({
    pv_total: 0,
    pm_total: 0,
    defesa: 10
  });

  const getBonusRacial = (atributo: string): number => {
    if (!racaSelecionada) return 0;

    let bonus = 0;

    const temAtributosLivres = racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre' ||
                               racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre';

    if (temAtributosLivres && atributosLivresEscolhidos?.includes(atributo.toUpperCase())) {
      bonus += 1;
    } else if (!temAtributosLivres) {
      if (racaSelecionada.atributo_bonus_1?.toLowerCase() === atributo.toLowerCase()) {
        bonus += racaSelecionada.valor_bonus_1 || 0;
      }
      if (racaSelecionada.atributo_bonus_2?.toLowerCase() === atributo.toLowerCase()) {
        bonus += racaSelecionada.valor_bonus_2 || 0;
      }
    }

    // Penalidade racial usando dados do modelo (generico, nao hardcoded)
    if (racaSelecionada.atributo_penalidade?.toLowerCase() === atributo.toLowerCase() && racaSelecionada.valor_penalidade) {
      bonus += racaSelecionada.valor_penalidade;
    }

    return bonus;
  };

  const calculateStats = (char: Partial<Personagem>): Stats => {
    const conBase = char.con || 0;
    const desBase = char.des || 0;

    const modConFinal = conBase + getBonusRacial('con');
    const modDesFinal = desBase + getBonusRacial('des');

    // T20: PV = (PV por nivel + mod CON final) * nivel
    const pvPorNivel = char.classe?.pvpornivel || 0;
    const pvTotal = (pvPorNivel + modConFinal) * (char.nivel || 1);

    // T20: PM = PM por nivel * nivel (sem modificador de atributo)
    const pmPorNivel = char.classe?.pmpornivel || 0;
    const pmTotal = pmPorNivel * (char.nivel || 1);

    // T20: Defesa = 10 + mod DES final (sem armadura)
    const defesa = 10 + modDesFinal;

    return {
      pv_total: Math.max(1, pvTotal),
      pm_total: Math.max(0, pmTotal),
      defesa: defesa
    };
  };

  useEffect(() => {
    if (personagem.nivel && personagem.con !== undefined && personagem.des !== undefined) {
      const stats = calculateStats(personagem);
      setStatsCalculados(stats);
    }
  }, [personagem, racaSelecionada, atributosLivresEscolhidos]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Stats Calculados</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="text-2xl font-bold text-red-600">{statsCalculados.pv_total}</div>
          <div className="text-xs text-red-700 font-medium mt-1">Pontos de Vida</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{statsCalculados.pm_total}</div>
          <div className="text-xs text-blue-700 font-medium mt-1">Pontos de Mana</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-600">{statsCalculados.defesa}</div>
          <div className="text-xs text-green-700 font-medium mt-1">Defesa</div>
        </div>
      </div>
    </div>
  );
};
