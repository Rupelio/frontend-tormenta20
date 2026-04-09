import React, { useState, useEffect } from 'react';
import { Personagem, Stats } from '@/types';

export const StatsCalculator: React.FC<{
  personagem: Partial<Personagem>;
  racaSelecionada?: any;
  atributosLivresEscolhidos?: string[];
}> = ({ personagem, racaSelecionada }) => {
  const [statsCalculados, setStatsCalculados] = useState<Stats>({
    pv_total: 0,
    pm_total: 0,
    defesa: 10
  });

  const calculateStats = (char: Partial<Personagem>): Stats => {
    // personagem.con e personagem.des JA sao valores FINAIS (base + racial)
    // calculados pelo useEffect no PersonagemForm. NAO adicionar racial novamente.
    const modConFinal = char.con || 0;
    const modDesFinal = char.des || 0;

    // T20: 1o nivel = pvPrimeiroNivel + CON, niveis 2+ = pvPorNivel + CON
    const pvPrimeiroNivel = char.classe?.pvprimeironivelc || char.classe?.pvpornivel || 0;
    const pvPorNivel = char.classe?.pvpornivel || 0;
    let pvTotal = pvPrimeiroNivel + modConFinal;
    if ((char.nivel || 1) > 1) {
      pvTotal += (pvPorNivel + modConFinal) * ((char.nivel || 1) - 1);
    }

    // PM: pmPrimeiroNivel + pmPorNivel * (nivel - 1)
    const pmPrimeiroNivel = char.classe?.pmprimeironivelc || char.classe?.pmpornivel || 0;
    const pmPorNivel = char.classe?.pmpornivel || 0;
    let pmTotal = pmPrimeiroNivel;
    if ((char.nivel || 1) > 1) {
      pmTotal += pmPorNivel * ((char.nivel || 1) - 1);
    }

    // Defesa = 10 + mod DES
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
  }, [personagem, racaSelecionada]);

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
