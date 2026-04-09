'use client';

import React, { useState, useEffect } from 'react';
import ExportadorPDF from '@/components/ExportadorPDF';
import { Personagem } from '@/types';

const TesteExportarPDF = () => {
  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [personagemSelecionado, setPersonagemSelecionado] = useState<Personagem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPersonagens();
  }, []);

  const carregarPersonagens = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const sessionId = typeof window !== 'undefined' ? window.localStorage.getItem('user_session_id') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['X-User-Session-ID'] = sessionId;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/personagens`, {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setPersonagens(data);

        if (data.length > 0) {
          setPersonagemSelecionado(data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando personagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 Exportador de Fichas PDF
          </h1>
          <p className="text-gray-600">
            Gere fichas editáveis no formato PDF para seus personagens de Tormenta20
          </p>
        </div>

        {personagens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum personagem encontrado</h2>
            <p className="text-gray-600 mb-6">
              Você precisa criar pelo menos um personagem para testar a exportação de PDF.
            </p>
            <a
              href="/criar-personagem"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="mr-2">➕</span>
              Criar Primeiro Personagem
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seletor de Personagens */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  👥 Selecionar Personagem
                </h2>
                <div className="space-y-3">
                  {personagens.map((personagem) => (
                    <div
                      key={personagem.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        personagemSelecionado?.id === personagem.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setPersonagemSelecionado(personagem)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{personagem.nome}</h3>
                          <p className="text-sm text-gray-600">
                            Nível {personagem.nivel} • {personagem.raca?.nome} {personagem.classe?.nome}
                          </p>
                        </div>
                        {personagemSelecionado?.id === personagem.id && (
                          <div className="text-indigo-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Informações do Personagem Selecionado */}
                {personagemSelecionado && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-800">
                    <h3 className="font-medium text-gray-800 mb-2">📊 Detalhes</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Força:</span>
                        <span className="font-medium">{personagemSelecionado.for}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destreza:</span>
                        <span className="font-medium">{personagemSelecionado.des}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Constituição:</span>
                        <span className="font-medium">{personagemSelecionado.con}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inteligência:</span>
                        <span className="font-medium">{personagemSelecionado.int}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sabedoria:</span>
                        <span className="font-medium">{personagemSelecionado.sab}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carisma:</span>
                        <span className="font-medium">{personagemSelecionado.car}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exportador de PDF */}
            <div className="lg:col-span-2">
              {personagemSelecionado ? (
                <ExportadorPDF
                  personagem={personagemSelecionado}
                  onExport={(options) => {
                    console.log('PDF exportado com opções:', options);
                  }}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Selecione um personagem
                  </h3>
                  <p className="text-gray-600">
                    Escolha um personagem na lista ao lado para começar a exportação
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exemplos e Documentação */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800">
            <h3 className="text-lg font-semibold mb-4">
              📱 Compatibilidade Testada
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Adobe Acrobat Reader (Desktop & Mobile)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">PDF24 (Gratuito)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Foxit Reader</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-yellow-500">⚠️</span>
                <span className="text-sm">Chrome/Edge (visualização limitada)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800">
            <h3 className="text-lg font-semibold mb-4">
              🎯 Recursos Implementados
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Campos editáveis (form-fillable)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Layout 1 ou 2 páginas</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Cálculos automáticos preservados</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Seções personalizáveis</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-500">🔄</span>
                <span className="text-sm">Personalização de cores (em desenvolvimento)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesteExportarPDF;
