'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Personagem } from '@/types';

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
            {personagens.map((personagem) => (
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
                    <div className="font-semibold text-red-700">PV</div>
                    <div className="text-red-900">{personagem.pontos_vida || 0}</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-semibold text-blue-700">PM</div>
                    <div className="text-blue-900">{personagem.pontos_mana || 0}</div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
