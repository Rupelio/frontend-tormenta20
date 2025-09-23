import React, { useState, useEffect } from 'react';
import { Personagem, Stats } from '@/types';

// components/StatsCalculator.tsx
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

  // Função para calcular bônus racial de um atributo
  const getBonusRacial = (atributo: string): number => {
    if (!racaSelecionada) return 0;

    let bonus = 0;

    // Verificar se tem atributos livres
    const temAtributosLivres = racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre' ||
                               racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre';

    if (temAtributosLivres && atributosLivresEscolhidos?.includes(atributo.toUpperCase())) {
      bonus += 1;
    } else {
      // Verificar bônus fixos
      if (racaSelecionada.atributo_bonus_1?.toLowerCase() === atributo.toLowerCase()) {
        bonus += racaSelecionada.valor_bonus_1 || 0;
      }
      if (racaSelecionada.atributo_bonus_2?.toLowerCase() === atributo.toLowerCase()) {
        bonus += racaSelecionada.valor_bonus_2 || 0;
      }
    }

    // Verificar penalidades (ex: Lefou tem -1 CAR)
    if (racaSelecionada.nome?.toLowerCase() === 'lefou' && atributo.toLowerCase() === 'car') {
      bonus -= 1;
    }

    return bonus;
  };

  const calculateStats = (char: Partial<Personagem>): Stats => {
    // Calcular valores finais dos atributos (base + bônus racial)
    const conBase = char.con || 0;
    const desBase = char.des || 0;

    const bonusRacialCon = getBonusRacial('con');
    const bonusRacialDes = getBonusRacial('des');

    const modConFinal = conBase + bonusRacialCon; // Modificador final de CON
    const modDesFinal = desBase + bonusRacialDes; // Modificador final de DES

    // PV = (pv_por_nivel da classe + mod CON final) * nível
    const pvPorNivel = char.classe?.pvpornivel || 0;
    const pvTotal = (pvPorNivel + modConFinal) * (char.nivel || 1);

    // PM = pm_por_nivel da classe * nível
    const pmPorNivel = char.classe?.pmpornivel || 0;
    const pmTotal = pmPorNivel * (char.nivel || 1);

    // Defesa = 10 + mod DES final
    const defesa = 10 + modDesFinal;

    return {
      pv_total: Math.max(1, pvTotal), // Mínimo 1 PV
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
    <div className="bg-gray-50 rounded-lg shadow-lg p-6 text-black">
      <h2 className="text-2xl font-semibold mb-6">Stats Calculados</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-white rounded shadow">
          <span className="font-medium">Pontos de Vida (PV)</span>
          <span className="text-lg font-bold text-red-600">{statsCalculados.pv_total}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white rounded shadow">
          <span className="font-medium">Pontos de Mana (PM)</span>
          <span className="text-lg font-bold text-blue-600">{statsCalculados.pm_total}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white rounded shadow">
          <span className="font-medium">Defesa</span>
          <span className="text-lg font-bold text-green-600">{statsCalculados.defesa}</span>
        </div>
      </div>
    </div>
  );
};
