'use client';

import React, { useState, useEffect } from 'react';
import { Poder, Pericia } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface EscolhasRacaProps {
  racaId: number;
  escolhasAtuais?: any;
  onEscolhasChange: (escolhas: any) => void;
}

interface HabilidadeEspecial {
  id: number;
  raca_id: number;
  nome: string;
  descricao: string;
  tipo: string;
  opcoes: string;
}

const EscolhasRaca: React.FC<EscolhasRacaProps> = ({
  racaId,
  escolhasAtuais = {},
  onEscolhasChange
}) => {
  const [habilidadesEspeciais, setHabilidadesEspeciais] = useState<HabilidadeEspecial[]>([]);
  const [poderesTormenta, setPoderesTormenta] = useState<Poder[]>([]);
  const [poderesGerais, setPoderesGerais] = useState<Poder[]>([]);
  const [pericias, setPericias] = useState<Pericia[]>([]);
  const [loading, setLoading] = useState(true);
  const [escolhas, setEscolhas] = useState<any>(escolhasAtuais);
  const [buscaTormenta, setBuscaTormenta] = useState('');
  const [mostrarTodosPoderes, setMostrarTodosPoderes] = useState(false);
  const [buscaPoderGeral, setBuscaPoderGeral] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar habilidades especiais da raça
        const habilidadesRes = await fetch(`${API_BASE_URL}/api/v1/habilidades-especiais/raca/${racaId}`);
        const habilidadesData = await habilidadesRes.json();
        setHabilidadesEspeciais(habilidadesData || []);

        // Buscar poderes da Tormenta
        const poderesRes = await fetch(`${API_BASE_URL}/api/v1/poderes/tipo/Tormenta`);
        const poderesData = await poderesRes.json();
        setPoderesTormenta(poderesData || []);

        // Buscar poderes gerais (Combate, Destino, Magia)
        const poderesGeraisPromises = ['Combate', 'Destino', 'Magia'].map(tipo =>
          fetch(`${API_BASE_URL}/api/v1/poderes/tipo/${tipo}`).then(res => res.json())
        );
        const poderesGeraisData = await Promise.all(poderesGeraisPromises);
        const todosPoderesGerais = poderesGeraisData.flat();
        setPoderesGerais(todosPoderesGerais || []);

        // Buscar perícias
        const periciasRes = await fetch(`${API_BASE_URL}/api/v1/pericias`);
        const periciasData = await periciasRes.json();
        setPericias(periciasData || []);

      } catch (error) {
        console.error('Erro ao carregar dados das escolhas de raça:', error);
      } finally {
        setLoading(false);
      }
    };

    if (racaId) {
      fetchData();
    }
  }, [racaId]);

  // useEffect para atualizar escolhas quando escolhasAtuais mudar
  useEffect(() => {
    setEscolhas(escolhasAtuais);
  }, [escolhasAtuais]);

  const handleEscolhaChange = (tipo: string, valor: any) => {

    const novasEscolhas = {
      ...escolhas,
      [tipo]: valor
    };
    setEscolhas(novasEscolhas);
    onEscolhasChange(novasEscolhas);
  };

  const renderEscolhaDeformidade = (habilidade: HabilidadeEspecial) => {
    const opcoes = JSON.parse(habilidade.opcoes);
    const escolhaAtual = escolhas[habilidade.id] || { pericias: [], poderes: [] };

    const handlePericiaChange = (periciaId: number, valor: number) => {
      const novaEscolha = { ...escolhaAtual };
      const periciaIndex = novaEscolha.pericias.findIndex((p: any) => p.id === periciaId);

      if (periciaIndex >= 0) {
        if (valor === 0) {
          novaEscolha.pericias.splice(periciaIndex, 1);
        } else {
          novaEscolha.pericias[periciaIndex].bonus = valor;
        }
      } else if (valor > 0) {
        novaEscolha.pericias.push({ id: periciaId, bonus: valor });
      }

      handleEscolhaChange(habilidade.id.toString(), novaEscolha);
    };

    const handlePoderChange = (poderId: number, selected: boolean) => {
      const novaEscolha = { ...escolhaAtual };

      if (selected) {
        // Adicionar poder se não existir
        if (!novaEscolha.poderes.includes(poderId)) {
          novaEscolha.poderes.push(poderId);
        }
      } else {
        // Remover poder
        novaEscolha.poderes = novaEscolha.poderes.filter((id: number) => id !== poderId);
      }

      handleEscolhaChange(habilidade.id.toString(), novaEscolha);
    };

    const totalPontosPericias = escolhaAtual.pericias?.reduce((sum: number, p: any) => sum + (p.bonus || 0), 0) || 0;
    const totalPoderes = escolhaAtual.poderes?.length || 0;
    const pontosUsados = totalPontosPericias + (totalPoderes * 2); // Cada poder da Tormenta = 2 pontos de perícia
    const pontosDisponiveis = opcoes.pericias_bonus * 2; // Total: 4 pontos

    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">{habilidade.nome}</h4>
          <p className="text-sm text-amber-700 mb-3">{habilidade.descricao}</p>

          <div className="text-sm font-medium text-amber-800 mb-2">
            Pontos usados: {pontosUsados} / {pontosDisponiveis}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção de Perícias */}
            <div>
              <h5 className="font-medium mb-2">Bônus em Perícias (+2 cada)</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pericias.map(pericia => {
                  const periciaEscolhida = escolhaAtual.pericias?.find((p: any) => p.id === pericia.id);
                  const bonusAtual = periciaEscolhida?.bonus || 0;

                  return (
                    <div key={pericia.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <label className="text-sm font-medium min-w-0 flex-1">{pericia.nome}</label>
                      <select
                        value={bonusAtual}
                        onChange={(e) => handlePericiaChange(pericia.id, parseInt(e.target.value))}
                        className="border rounded px-2 py-1 text-sm w-full sm:w-auto sm:min-w-[80px]"
                        disabled={pontosUsados >= pontosDisponiveis && bonusAtual === 0}
                      >
                        <option value={0}>+0</option>
                        <option value={2} disabled={pontosUsados + (bonusAtual === 0 ? 2 : 0) > pontosDisponiveis}>+2</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Poderes da Tormenta */}
            <div>
              <h5 className="font-medium mb-2">Poderes da Tormenta (substitui +2 perícia)</h5>

              {/* Campo de busca */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Buscar poderes da Tormenta..."
                  value={buscaTormenta}
                  onChange={(e) => setBuscaTormenta(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(() => {
                  const poderesFiltrados = poderesTormenta.filter(poder =>
                    poder.nome.toLowerCase().includes(buscaTormenta.toLowerCase()) ||
                    poder.descricao.toLowerCase().includes(buscaTormenta.toLowerCase())
                  );

                  const poderesParaMostrar = mostrarTodosPoderes || buscaTormenta
                    ? poderesFiltrados
                    : poderesFiltrados.slice(0, 8);

                  return (
                    <>
                      {poderesParaMostrar.map(poder => {
                        const poderSelecionado = escolhaAtual.poderes?.includes(poder.ID || poder.id || 0) || false;
                        const poderId = poder.ID || poder.id || 0;

                        return (
                          <div key={poderId} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              id={`poder-${poderId}`}
                              checked={poderSelecionado}
                              onChange={(e) => handlePoderChange(poderId, e.target.checked)}
                              disabled={!poderSelecionado && pontosUsados + 2 > pontosDisponiveis}
                              className="mt-1 flex-shrink-0"
                            />
                            <label htmlFor={`poder-${poderId}`} className="text-sm min-w-0 flex-1">
                              <div className="font-medium text-red-800 break-words">{poder.nome}</div>
                              <div className="text-gray-600 text-xs mb-1 break-words">{poder.descricao.substring(0, 120)}...</div>
                              {poder.requisitos && (
                                <div className="text-purple-600 text-xs break-words">Requisitos: {poder.requisitos}</div>
                              )}
                            </label>
                          </div>
                        );
                      })}

                      {!buscaTormenta && !mostrarTodosPoderes && poderesFiltrados.length > 8 && (
                        <button
                          type="button"
                          onClick={() => setMostrarTodosPoderes(true)}
                          className="text-blue-600 text-sm hover:underline w-full text-left"
                        >
                          Mostrar todos os {poderesFiltrados.length} poderes da Tormenta...
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEscolhaVersatilidade = (habilidade: HabilidadeEspecial) => {
    const opcoes = JSON.parse(habilidade.opcoes);
    const escolhaAtual = escolhas[habilidade.id] || { pericias: [], poderes: [] };

    const handlePericiaVersatilidadeChange = (periciaId: number, selected: boolean) => {
      const novaEscolha = { ...escolhaAtual };

      if (selected) {
        // Verificar se ainda pode adicionar perícias (máximo baseado na troca com poderes)
        const totalEscolhas = novaEscolha.pericias.length + novaEscolha.poderes.length;
        if (totalEscolhas < opcoes.pericias_bonus) {
          // Encontrar o objeto completo da perícia
          const periciaObj = pericias.find(p => p.id === periciaId);
          if (periciaObj) {
            novaEscolha.pericias.push(periciaObj);
          }
        }
      } else {
        novaEscolha.pericias = novaEscolha.pericias.filter((pericia: any) =>
          (typeof pericia === 'number' ? pericia : pericia.id) !== periciaId
        );
      }

      handleEscolhaChange(habilidade.id.toString(), novaEscolha);
    };

    const handlePoderGeralChange = (poderId: number, selected: boolean) => {
      const novaEscolha = { ...escolhaAtual };

      if (selected) {
        // Verificar se ainda pode adicionar poderes (máximo baseado na troca com perícias)
        const totalEscolhas = novaEscolha.pericias.length + novaEscolha.poderes.length;
        if (totalEscolhas < opcoes.pericias_bonus) {
          novaEscolha.poderes.push(poderId);
        }
      } else {
        novaEscolha.poderes = novaEscolha.poderes.filter((id: number) => id !== poderId);
      }

      handleEscolhaChange(habilidade.id.toString(), novaEscolha);
    };

    const totalEscolhidos = (escolhaAtual.pericias?.length || 0) + (escolhaAtual.poderes?.length || 0);
    const maxEscolhas = opcoes.pericias_bonus;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">{habilidade.nome}</h4>
          <p className="text-sm text-blue-700 mb-3">{habilidade.descricao}</p>

          <div className="mb-3 p-2 bg-blue-100 rounded text-sm">
            <strong>Escolhas flexíveis:</strong> Você pode escolher qualquer combinação até {maxEscolhas} itens:
            <div className="mt-1 text-xs space-y-1">
              <div>• {maxEscolhas} perícias</div>
              <div>• {maxEscolhas - 1} perícia + 1 poder geral</div>
              <div>• {maxEscolhas} poderes gerais</div>
            </div>
            <div className="mt-2">
              <span className="text-blue-600 font-medium">
                Selecionados: {totalEscolhidos || 0} / {maxEscolhas}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Seleção de Perícias */}
            <div className="p-3 bg-gray-50 rounded">
              <h6 className="font-medium mb-2">Perícias Disponíveis:</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {pericias.map(pericia => {
                  // Verificar se a perícia está selecionada (pode ser ID ou objeto)
                  const periciaEscolhida = escolhaAtual.pericias?.some((p: any) =>
                    typeof p === 'number' ? p === pericia.id : p.id === pericia.id
                  ) || false;
                  const maxAtingido = totalEscolhidos >= maxEscolhas;

                  return (
                    <label key={pericia.id} className="flex items-center space-x-2 text-sm hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={periciaEscolhida}
                        onChange={(e) => handlePericiaVersatilidadeChange(pericia.id, e.target.checked)}
                        disabled={!periciaEscolhida && maxAtingido}
                        className="flex-shrink-0"
                      />
                      <span className="min-w-0 flex-1 break-words">{pericia.nome}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Poderes Gerais */}
            <div className="p-3 bg-gray-50 rounded">
              <h6 className="font-medium mb-2">Poderes Gerais Disponíveis:</h6>

                {/* Campo de busca para poderes gerais */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar poderes gerais..."
                    value={buscaPoderGeral}
                    onChange={(e) => setBuscaPoderGeral(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(() => {
                    const poderesFiltrados = poderesGerais.filter(poder =>
                      poder.nome.toLowerCase().includes(buscaPoderGeral.toLowerCase()) ||
                      poder.descricao.toLowerCase().includes(buscaPoderGeral.toLowerCase()) ||
                      poder.tipo.toLowerCase().includes(buscaPoderGeral.toLowerCase())
                    );

                    return poderesFiltrados.map(poder => {
                      const poderId = poder.ID || poder.id || 0;
                      const poderEscolhido = escolhaAtual.poderes?.includes(poderId) || false;
                      const maxAtingido = totalEscolhidos >= maxEscolhas;

                      return (
                        <label key={poderId} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={poderEscolhido}
                            onChange={(e) => handlePoderGeralChange(poderId, e.target.checked)}
                            disabled={!poderEscolhido && maxAtingido}
                            className="mt-1 flex-shrink-0"
                          />
                          <div className="text-sm min-w-0 flex-1">
                            <div className="font-medium text-blue-800 break-words">{poder.nome}</div>
                            <div className="text-gray-600 text-xs mb-1 break-words">{poder.descricao.substring(0, 150)}...</div>
                            {poder.requisitos && (
                              <div className="text-purple-600 text-xs break-words">Requisitos: {poder.requisitos}</div>
                            )}
                            <div className="text-orange-600 text-xs font-medium">Tipo: {poder.tipo}</div>
                          </div>
                        </label>
                      );
                    });
                  })()}
                </div>

                {buscaPoderGeral && (
                  <div className="text-xs text-gray-600 mt-2">
                    {poderesGerais.filter(poder =>
                      poder.nome.toLowerCase().includes(buscaPoderGeral.toLowerCase()) ||
                      poder.descricao.toLowerCase().includes(buscaPoderGeral.toLowerCase()) ||
                      poder.tipo.toLowerCase().includes(buscaPoderGeral.toLowerCase())
                    ).length} poderes encontrados
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!habilidadesEspeciais.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Escolhas Especiais da Raça</h3>

      {habilidadesEspeciais.map(habilidade => (
        <div key={habilidade.id}>
          {habilidade.tipo === 'deformidade' && renderEscolhaDeformidade(habilidade)}
          {habilidade.tipo === 'versatilidade' && renderEscolhaVersatilidade(habilidade)}
        </div>
      ))}
    </div>
  );
};

export default EscolhasRaca;
