'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Personagem, Stats } from '@/types';

// Função para calcular stats (mesma lógica do StatsCalculator)
const calculateStats = (char: Partial<Personagem>): Stats => {
  // Função para calcular bônus racial de um atributo
  const getBonusRacial = (atributo: string): number => {
    if (!char.raca) return 0;

    let bonus = 0;

    // Verificar bônus fixos da raça
    if (char.raca.atributo_bonus_1?.toLowerCase() === atributo.toLowerCase()) {
      bonus += char.raca.valor_bonus_1 || 0;
    }
    if (char.raca.atributo_bonus_2?.toLowerCase() === atributo.toLowerCase()) {
      bonus += char.raca.valor_bonus_2 || 0;
    }

    // Verificar penalidades (ex: Lefou tem -1 CAR)
    if (char.raca.nome?.toLowerCase() === 'lefou' && atributo.toLowerCase() === 'car') {
      bonus -= 1;
    }

    return bonus;
  };

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

export default function Home() {
  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarPersonagens = async () => {
      try {
        setLoading(true);
        const data = await api.getPersonagens();
        setPersonagens(data);
      } catch (err) {
        console.error('Erro ao carregar personagens:', err);
        setError('Erro ao carregar personagens. Verifique se o servidor está funcionando.');
      } finally {
        setLoading(false);
      }
    };

    carregarPersonagens();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Carregando personagens...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link
            href="/criar-personagem"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Primeiro Personagem
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meus Personagens - Tormenta20
          </h1>
          <Link
            href="/criar-personagem"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Criar Novo Personagem
          </Link>
        </div>

        {personagens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4 text-lg">
              Você ainda não tem nenhum personagem criado.
            </div>
            <Link
              href="/criar-personagem"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎭 Criar Primeiro Personagem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personagens.map((personagem) => {
              // Calcular stats totais para cada personagem
              const stats = calculateStats(personagem);

              return (
                <div key={personagem.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {personagem.nome}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      Nível {personagem.nivel}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>
                      <strong>Raça:</strong> {personagem.raca?.nome || 'N/A'}
                    </div>
                    <div>
                      <strong>Classe:</strong> {personagem.classe?.nome || 'N/A'}
                    </div>
                    <div>
                      <strong>Origem:</strong> {personagem.origem?.nome || 'N/A'}
                    </div>
                    {personagem.divindade && (
                      <div>
                        <strong>Divindade:</strong> {personagem.divindade.nome}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="bg-red-50 p-2 rounded">
                      <div className="font-semibold text-red-700">PV Total</div>
                      <div className="text-red-900">{stats.pv_total}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-semibold text-blue-700">PM Total</div>
                      <div className="text-blue-900">{stats.pm_total}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/criar-personagem?edit=${personagem.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      ✏️ Editar
                    </Link>
                    <Link
                      href={`/exportar-pdf?id=${personagem.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm text-center"
                    >
                      📄 PDF
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
