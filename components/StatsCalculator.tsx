import React, { useState, useEffect } from 'react';
import { Personagem, Stats } from '@shared/types';

// components/StatsCalculator.tsx
export const StatsCalculator: React.FC<{personagem: Partial<Personagem>}> = ({ personagem }) => {
  const [statsCalculados, setStatsCalculados] = useState<Stats>({
    pv_total: 0,
    pm_total: 0,
    defesa: 10
  });

  const calculateStats = (char: Partial<Personagem>): Stats => {
    // No Tormenta20, modificador é igual ao valor do atributo
    const modCon = char.con || 0; // Modificador de Constituição
    const modDes = char.des || 0; // Modificador de Destreza

    // PV base + modificador de CON por nível
    const pvBase = char.pontos_vida || 0;
    const pvTotal = pvBase + (modCon * (char.nivel || 1));

    // PM base (sem modificadores por enquanto)
    const pmTotal = char.pontos_mana || 0;

    // Defesa = 10 + mod DES
    const defesa = 10 + modDes;

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
  }, [personagem]);

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
