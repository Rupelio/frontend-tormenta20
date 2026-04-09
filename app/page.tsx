'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Personagem, Stats } from '@/types';
import { TrashIcon } from '@heroicons/react/24/outline';
import ExportadorPDF from '@/components/ExportadorPDF';

const calculateStats = (char: Partial<Personagem>): Stats => {
  const getBonusRacial = (atributo: string): number => {
    if (!char.raca) return 0;
    let bonus = 0;

    // Verificar atributos livres
    const temLivre = char.raca.atributo_bonus_1?.toLowerCase() === 'livre' ||
                     char.raca.atributo_bonus_2?.toLowerCase() === 'livre';

    if (temLivre) {
      let atributosLivres: string[] = [];
      if (char.atributos_livres) {
        try {
          atributosLivres = typeof char.atributos_livres === 'string'
            ? JSON.parse(char.atributos_livres)
            : char.atributos_livres;
        } catch { /* vazio */ }
      }
      if (atributosLivres.some(a => a.toLowerCase() === atributo.toLowerCase())) {
        bonus += 1;
      }
    } else {
      if (char.raca.atributo_bonus_1?.toLowerCase() === atributo.toLowerCase()) {
        bonus += char.raca.valor_bonus_1 || 0;
      }
      if (char.raca.atributo_bonus_2?.toLowerCase() === atributo.toLowerCase()) {
        bonus += char.raca.valor_bonus_2 || 0;
      }
    }

    // Penalidade racial usando dados do modelo
    if (char.raca.atributo_penalidade?.toLowerCase() === atributo.toLowerCase() && char.raca.valor_penalidade) {
      bonus += char.raca.valor_penalidade;
    }

    return bonus;
  };

  const conBase = char.con || 0;
  const desBase = char.des || 0;
  const modConFinal = conBase + getBonusRacial('con');
  const modDesFinal = desBase + getBonusRacial('des');

  const pvPorNivel = char.classe?.pvpornivel || 0;
  const pvTotal = (pvPorNivel + modConFinal) * (char.nivel || 1);

  const pmPorNivel = char.classe?.pmpornivel || 0;
  const pmTotal = pmPorNivel * (char.nivel || 1);

  const defesa = 10 + modDesFinal;

  return {
    pv_total: Math.max(1, pvTotal),
    pm_total: Math.max(0, pmTotal),
    defesa: defesa
  };
};

export default function Home() {
  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfPersonagem, setPdfPersonagem] = useState<Personagem | null>(null);

  useEffect(() => {
    const carregarPersonagens = async () => {
      try {
        setLoading(true);
        const data = await api.getPersonagens();
        setPersonagens(data);
      } catch (err) {
        console.error('Erro ao carregar personagens:', err);
        setError('Erro ao carregar personagens. Verifique se o servidor esta funcionando.');
      } finally {
        setLoading(false);
      }
    };

    carregarPersonagens();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmou = window.confirm(
      'Voce tem certeza que deseja excluir este personagem? Esta acao nao pode ser desfeita.'
    );
    if (!confirmou) return;

    try {
      await api.deletePersonagem(id);
      setPersonagens(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir personagem:', err);
      alert('Nao foi possivel excluir o personagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-600 font-medium">Carregando personagens...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/criar-personagem"
            className="inline-block px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
          >
            Criar Primeiro Personagem
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-800 to-red-900 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">Tormenta 20</h1>
          <p className="text-red-200 text-sm">Construtor de Personagens</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Barra de acoes */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Meus Personagens
            {personagens.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">({personagens.length})</span>
            )}
          </h2>
          <Link
            href="/criar-personagem"
            className="px-5 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm shadow-sm"
          >
            + Novo Personagem
          </Link>
        </div>

        {personagens.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">&#9876;</span>
            </div>
            <p className="text-gray-500 mb-4 text-lg">Nenhum personagem criado ainda.</p>
            <Link
              href="/criar-personagem"
              className="inline-block px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              Criar Primeiro Personagem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {personagens.map((personagem) => {
              const stats = calculateStats(personagem);

              return (
                <div key={personagem.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card header com nome e nivel */}
                  <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{personagem.nome}</h3>
                        <p className="text-sm text-gray-500">
                          {personagem.raca?.nome || 'N/A'} / {personagem.classe?.nome || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                          Nv {personagem.nivel}
                        </span>
                        <button
                          onClick={() => handleDelete(personagem.id)}
                          className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Excluir ${personagem.nome}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-5 py-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Origem</span>
                      <span className="text-gray-800 font-medium">{personagem.origem?.nome || 'N/A'}</span>
                    </div>
                    {personagem.divindade && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Divindade</span>
                        <span className="text-gray-800 font-medium">{personagem.divindade.nome}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
                    <div className="text-center py-3 border-r border-gray-100">
                      <div className="text-lg font-bold text-red-600">{stats.pv_total}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">PV</div>
                    </div>
                    <div className="text-center py-3 border-r border-gray-100">
                      <div className="text-lg font-bold text-blue-600">{stats.pm_total}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">PM</div>
                    </div>
                    <div className="text-center py-3">
                      <div className="text-lg font-bold text-green-600">{stats.defesa}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">Defesa</div>
                    </div>
                  </div>

                  {/* Acoes */}
                  <div className="flex border-t border-gray-100">
                    <Link
                      href={`/criar-personagem?edit=${personagem.id}`}
                      className="flex-1 text-center py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors border-r border-gray-100"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setPdfPersonagem(personagem)}
                      className="flex-1 text-center py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de exportacao PDF */}
      {pdfPersonagem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setPdfPersonagem(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 z-10"
              >
                X
              </button>
              <ExportadorPDF
                personagem={pdfPersonagem}
                onExport={() => setPdfPersonagem(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
