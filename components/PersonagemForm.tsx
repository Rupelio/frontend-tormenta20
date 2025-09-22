"use client";

import React, { useState, useEffect } from "react";
import { Personagem, Raca, Classe, Origem, Divindade, Habilidade } from "@shared/types";
import { api } from "../lib/api";
import PointBuyCalculator from "./PointBuyCalculator";
import SeletorAtributosLivres from "./SeletorAtributosLivres";
import SeletorPericias from "./SeletorPericias";
import SeletorHabilidades from "./SeletorHabilidades";
import SeletorPoderesDivinos from "./SeletorPoderesDivinos";
import SeletorPoderesClasse from "./SeletorPoderesClasse";
import PoderesDivinosSelecionados from "./PoderesDivinosSelecionados";
import PoderesOrigemAutomaticos from "./PoderesOrigemAutomaticos";
import EscolhasRaca from "./EscolhasRaca";

export default function PersonagemForm() {
  const [mounted, setMounted] = useState(false);
  const [personagem, setPersonagem] = useState<Partial<Personagem>>({
    nome: "",
    nivel: 1,
    for: 0,
    des: 0,
    con: 0,
    int: 0,
    sab: 0,
    car: 0,
    raca_id: null,
    classe_id: null,
    origem_id: null,
    divindade_id: null,
    pontos_vida: 0,
    pontos_mana: 0,
  });

  const [racas, setRacas] = useState<Raca[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [divindades, setDivindades] = useState<Divindade[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para habilidades carregadas da API
  const [habilidadesRaca, setHabilidadesRaca] = useState<Habilidade[]>([]);
  const [habilidadesClasse, setHabilidadesClasse] = useState<Habilidade[]>([]);
  const [habilidadesOrigem, setHabilidadesOrigem] = useState<Habilidade[]>([]);
  const [habilidadesDivindade, setHabilidadesDivindade] = useState<Habilidade[]>([]);
  const [habilidadesLoading, setHabilidadesLoading] = useState(false);

  // Estado para atributos livres
  const [atributosLivresEscolhidos, setAtributosLivresEscolhidos] = useState<string[]>([]);
  const [escolhasRaca, setEscolhasRaca] = useState<any>({});

  // Estado para perícias
  const [periciasEscolhidas, setPericiasEscolhidas] = useState<number[]>([]);
  const [periciasDeRacaEscolhidas, setPericiasDeRacaEscolhidas] = useState<Pericia[]>([]);

  // Estado para poderes de classe selecionados
  const [poderesClasseSelecionados, setPoderesClasseSelecionados] = useState<number[]>([]);

  // Estado para poderes divinos selecionados
  const [poderesDivinosSelecionados, setPoderesDivinosSelecionados] = useState<number[]>([]);

  // Helper function para acessar ID de forma consistente
  const getId = (item: any): number => item.ID || item.id || 0;

  // Encontrar a raça selecionada
  const racaSelecionada = racas.find(r => getId(r) === personagem.raca_id);

  // Verificar se a raça tem atributos livres
  const temAtributosLivres = racaSelecionada && (
    racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_3?.toLowerCase() === 'livre'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

    // Reset atributos livres quando mudar de raça
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Se a nova raça não tem atributos livres, limpar a seleção
      if (!temAtributosLivres) {
        setAtributosLivresEscolhidos([]);
      } else {
        // Se mudou para uma raça com atributos livres, reset a seleção
        setAtributosLivresEscolhidos([]);
      }
      // Limpar escolhas de raça quando mudar de raça
      setEscolhasRaca({});
    }
  }, [personagem.raca_id, temAtributosLivres]);

  // Reset poderes divinos quando mudar de divindade
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPoderesDivinosSelecionados([]);
    }
  }, [personagem.divindade_id]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!mounted) return;

      try {
        setDataLoading(true);
        console.log("Iniciando carregamento de dados...");

        const [racasData, classesData, origensData, divindadesData] = await Promise.all([
          api.getRacas().catch(err => {
            console.error("Erro ao carregar raças:", err);
            throw new Error(`Erro ao carregar raças: ${err.message}`);
          }),
          api.getClasses().catch(err => {
            console.error("Erro ao carregar classes:", err);
            throw new Error(`Erro ao carregar classes: ${err.message}`);
          }),
          api.getOrigens().catch(err => {
            console.error("Erro ao carregar origens:", err);
            throw new Error(`Erro ao carregar origens: ${err.message}`);
          }),
          api.getDivindades().catch(err => {
            console.error("Erro ao carregar divindades:", err);
            throw new Error(`Erro ao carregar divindades: ${err.message}`);
          }),
        ]);

        console.log("Dados carregados com sucesso:", {
          racas: racasData.length,
          classes: classesData.length,
          origens: origensData.length,
          divindades: divindadesData.length,
        });

        setRacas(racasData);
        setClasses(classesData);
        setOrigens(origensData);
        setDivindades(divindadesData);
        setErrors({}); // Limpar erros se carregar com sucesso
      } catch (error) {
        console.error("Erro detalhado ao carregar dados:", error);
        setErrors({
          geral: error instanceof Error ? error.message : "Erro desconhecido ao carregar dados básicos. Verifique se o backend está rodando.",
        });
      } finally {
        setDataLoading(false);
      }
    };

    carregarDados();
  }, [mounted]);

  // UseEffect para carregar habilidades quando personagem, raça, classe, origem, divindade ou nível mudarem
  useEffect(() => {
    if (mounted && !dataLoading) {
      carregarTodasHabilidades();
    }
  }, [mounted, dataLoading, personagem.raca_id, personagem.classe_id, personagem.origem_id, personagem.divindade_id, personagem.nivel]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!personagem.nome?.trim()) {
      novosErros.nome = "Nome é obrigatório";
    }

    if (!personagem.raca_id) {
      novosErros.raca_id = "Selecione uma raça";
    }

    if (!personagem.classe_id) {
      novosErros.classe_id = "Selecione uma classe";
    }

    if (!personagem.origem_id) {
      novosErros.origem_id = "Selecione uma origem";
    }

    // Verificar se todos os atributos estão no range válido
    const atributos = ["for", "des", "con", "int", "sab", "car"] as const;
    if (atributos.some(attr => {
      const valor = personagem[attr];
      return valor === undefined || valor < -1 || valor > 4;
    })) {
      novosErros.atributos = "Todos os atributos devem estar entre -1 e 4";
    }

    // Verificar se os pontos estão distribuídos corretamente
    const totalCost = atributos.reduce((sum, attr) => {
      const value = personagem[attr] || 0;
      return sum + getCostForValue(value);
    }, 0);

    if (totalCost !== 10) {
      novosErros.pontos = `Você deve usar exatamente 10 pontos. Atualmente usando ${totalCost}`;
    }

    // Validação específica para atributos livres
    if (temAtributosLivres) {
      const quantidadeNecessaria = getQuantidadeAtributosLivres();
      if (atributosLivresEscolhidos.length !== quantidadeNecessaria) {
        novosErros.atributosLivres = `Você deve escolher exatamente ${quantidadeNecessaria} atributos para receber bônus racial.`;
      }
    }

    // Validar perícias se uma classe foi selecionada
    if (personagem.classe_id && personagem.classe_id !== 0) {
      const classeSelecionada = classes.find(c => getId(c) === personagem.classe_id);
      if (classeSelecionada) {
        const periciasQuantidade = (classeSelecionada as any).pericias_quantidade || 2;
        if (periciasEscolhidas.length !== periciasQuantidade) {
          novosErros.pericias = `Escolha exatamente ${periciasQuantidade} perícias para ${classeSelecionada.nome}`;
        }
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const getQuantidadeAtributosLivres = (): number => {
    if (!racaSelecionada) return 0;

    // Contar quantos campos de bônus estão marcados como "livre"
    let quantidade = 0;
    if (racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre') quantidade++;
    if (racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre') quantidade++;
    if (racaSelecionada.atributo_bonus_3?.toLowerCase() === 'livre') quantidade++;

    return quantidade;
  };

  const getCostForValue = (value: number): number => {
    switch (value) {
      case -1: return -1;
      case 0: return 0;
      case 1: return 1;
      case 2: return 2;
      case 3: return 4;
      case 4: return 7;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);
    try {
      // Preparar dados para envio - garantir que os IDs não sejam null
      const personagemData = {
        ...personagem,
        raca_id: personagem.raca_id || 1,     // Valor padrão caso não tenha selecionado
        classe_id: personagem.classe_id || 1, // Valor padrão caso não tenha selecionado
        origem_id: personagem.origem_id || 1, // Valor padrão caso não tenha selecionado
        divindade_id: personagem.divindade_id || undefined, // Divindade é opcional
        // Adicionar informações sobre atributos livres escolhidos se necessário
        atributosLivres: temAtributosLivres ? atributosLivresEscolhidos : undefined,
        escolhas_raca: Object.keys(escolhasRaca).length > 0 ? JSON.stringify(escolhasRaca) : undefined
      };

      const novoPersonagem = await api.createPersonagem(personagemData as Personagem);

      // Atualizar perícias do personagem se foram selecionadas
      if (periciasEscolhidas.length > 0) {
        try {
          await fetch(`http://localhost:8080/api/v1/personagens/${novoPersonagem.id}/pericias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pericias_ids: periciasEscolhidas
            }),
          });
        } catch (error) {
          console.error('Erro ao salvar perícias:', error);
          // Não falhar a criação do personagem por causa das perícias
        }
      }

      alert(`Personagem ${novoPersonagem.nome} criado com sucesso!`);

      // Reset form
      setPersonagem({
        nome: "",
        nivel: 1,
        for: 0,
        des: 0,
        con: 0,
        int: 0,
        sab: 0,
        car: 0,
        raca_id: null,
        classe_id: null,
        origem_id: null,
        divindade_id: null,
      });
      setAtributosLivresEscolhidos([]);
      setPericiasEscolhidas([]);
      setEscolhasRaca({});
      setPoderesDivinosSelecionados([]);
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      setErrors({
        geral: "Erro ao criar personagem. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAtributosChange = (atributos: {
    for: number;
    des: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  }) => {
    setPersonagem(prev => ({
      ...prev,
      ...atributos,
    }));
  };

  const handleAtributosLivresChange = (atributos: string[]) => {
    setAtributosLivresEscolhidos(atributos);
  };

  const handleEscolhasRacaChange = (escolhas: any) => {
    setEscolhasRaca(escolhas);

    // Extrair perícias das escolhas de raça
    const periciasDeRaca: number[] = [];
    const periciasDeRacaObjetos: Pericia[] = [];

    Object.values(escolhas).forEach((escolha: any) => {
      if (escolha.pericias && Array.isArray(escolha.pericias)) {
        escolha.pericias.forEach((pericia: any) => {
          if (typeof pericia === 'number') {
            periciasDeRaca.push(pericia);
          } else if (pericia.id) {
            periciasDeRaca.push(pericia.id);
            periciasDeRacaObjetos.push(pericia);
          }
        });
      }
    });

    // Armazenar os objetos completos das perícias de raça
    setPericiasDeRacaEscolhidas(periciasDeRacaObjetos);    // Combinar perícias já escolhidas com as das escolhas de raça
    setPericiasEscolhidas(prev => {
      // Remover perícias de raça antigas primeiro
      const periciasNaoDeRaca = prev.filter(id => !getPericiasDeRacaAnteriores().includes(id));
      // Adicionar novas perícias de raça
      return [...new Set([...periciasNaoDeRaca, ...periciasDeRaca])];
    });
  };

  // Função auxiliar para obter perícias de raça anteriores
  const getPericiasDeRacaAnteriores = (): number[] => {
    const periciasAnteriores: number[] = [];
    Object.values(escolhasRaca).forEach((escolha: any) => {
      if (escolha.pericias && Array.isArray(escolha.pericias)) {
        escolha.pericias.forEach((pericia: any) => {
          if (typeof pericia === 'number') {
            periciasAnteriores.push(pericia);
          } else if (pericia.id) {
            periciasAnteriores.push(pericia.id);
          }
        });
      }
    });
    return periciasAnteriores;
  };

  const calculateTotalPV = (): number => {
    const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
    const basePV = classeEscolhida?.pvpornivel || 0;

    // No Tormenta20, modificador é igual ao valor do atributo
    const modCon = personagem.con || 0;

    // Aplicar bônus racial de CON se houver
    const racaEscolhida = racas.find(r => getId(r) === personagem.raca_id);
    let bonusRacialCon = 0;
    if (racaEscolhida) {
      // Verificar se CON está nos atributos livres escolhidos
      if (temAtributosLivres && atributosLivresEscolhidos.includes('CON')) {
        bonusRacialCon += 1;
      } else {
        // Verificar bônus fixos
        if (racaEscolhida.atributobonus1?.toLowerCase() === 'con') {
          bonusRacialCon += racaEscolhida.valorbonus1 || 0;
        }
        if (racaEscolhida.atributobonus2?.toLowerCase() === 'con') {
          bonusRacialCon += racaEscolhida.valorbonus2 || 0;
        }
      }
    }

    const modConFinal = modCon + bonusRacialCon;

    // Fórmula correta do Tormenta20:
    // PV Total = (PV base da classe + mod CON) × nível
    // O modificador de CON é somado a cada nível
    return (basePV + modConFinal) * (personagem.nivel || 1);
  };

  const calculateTotalPM = (): number => {
    const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
    const basePM = classeEscolhida?.pmpornivel || 0;

    // No Tormenta20, modificador é igual ao valor do atributo
    const modInt = personagem.int || 0;

    // Aplicar bônus racial de INT se houver
    const racaEscolhida = racas.find(r => getId(r) === personagem.raca_id);
    let bonusRacialInt = 0;
    if (racaEscolhida) {
      // Verificar se INT está nos atributos livres escolhidos
      if (temAtributosLivres && atributosLivresEscolhidos.includes('INT')) {
        bonusRacialInt += 1;
      } else {
        // Verificar bônus fixos
        if (racaEscolhida.atributobonus1?.toLowerCase() === 'int') {
          bonusRacialInt += racaEscolhida.valorbonus1 || 0;
        }
        if (racaEscolhida.atributobonus2?.toLowerCase() === 'int') {
          bonusRacialInt += racaEscolhida.valorbonus2 || 0;
        }
      }
    }

    const modIntFinal = modInt + bonusRacialInt;

    // Fórmula correta do Tormenta20:
    // PM Total = (PM base da classe + mod INT) × nível
    // O modificador de INT é somado a cada nível
    return (basePM + modIntFinal) * (personagem.nivel || 1);
  };

  // Funções para carregar habilidades da API
  const carregarHabilidadesRaca = async (racaId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/habilidades/raca/${racaId}`);
      if (response.ok) {
        const habilidades = await response.json();
        setHabilidadesRaca(habilidades);
      }
    } catch (error) {
      console.error('Erro ao carregar habilidades da raça:', error);
      setHabilidadesRaca([]);
    }
  };

  const carregarHabilidadesClasse = async (classeId: number, nivel: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/habilidades/classe/${classeId}/nivel/${nivel}`);
      if (response.ok) {
        const habilidades = await response.json();
        setHabilidadesClasse(habilidades);
      }
    } catch (error) {
      console.error('Erro ao carregar habilidades da classe:', error);
      setHabilidadesClasse([]);
    }
  };

  const carregarHabilidadesOrigem = async (origemId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/habilidades/origem/${origemId}`);
      if (response.ok) {
        const habilidades = await response.json();
        setHabilidadesOrigem(habilidades);
      }
    } catch (error) {
      console.error('Erro ao carregar habilidades da origem:', error);
      setHabilidadesOrigem([]);
    }
  };

  const carregarHabilidadesDivindade = async (divindadeId: number, nivel: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/habilidades/divindade/${divindadeId}/nivel/${nivel}`);
      if (response.ok) {
        const habilidades = await response.json();
        setHabilidadesDivindade(habilidades);
      }
    } catch (error) {
      console.error('Erro ao carregar habilidades da divindade:', error);
      setHabilidadesDivindade([]);
    }
  };

  // Função para carregar todas as habilidades quando os dados mudarem
  const carregarTodasHabilidades = async () => {
    setHabilidadesLoading(true);

    try {
      const promises = [];

      if (personagem.raca_id && personagem.raca_id > 0) {
        promises.push(carregarHabilidadesRaca(personagem.raca_id));
      }

      if (personagem.classe_id && personagem.classe_id > 0 && personagem.nivel) {
        promises.push(carregarHabilidadesClasse(personagem.classe_id, personagem.nivel));
      }

      if (personagem.origem_id && personagem.origem_id > 0) {
        promises.push(carregarHabilidadesOrigem(personagem.origem_id));
      }

      if (personagem.divindade_id && personagem.divindade_id > 0 && personagem.nivel) {
        promises.push(carregarHabilidadesDivindade(personagem.divindade_id, personagem.nivel));
      }

      await Promise.all(promises);
    } finally {
      setHabilidadesLoading(false);
    }
  };

  // Não renderizar até que esteja montado (evita hydration issues)
  if (!mounted) return null;

  // Loading state para carregamento inicial de dados
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-black">
            Criar Personagem - Tormenta20
          </h1>
          <div className="flex justify-center items-center">
            <div className="text-lg text-gray-600">Carregando dados...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Criar Personagem - Tormenta20
        </h1>

        {errors.geral && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.geral}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
          {/* Formulário Principal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-black">Informações Básicas</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Nome do Personagem
                </label>
                <input
                  type="text"
                  value={personagem.nome}
                  onChange={(e) =>
                    setPersonagem(prev => ({ ...prev, nome: e.target.value }))
                  }
                  className={`w-full p-3 border rounded-lg text-black ${
                    errors.nome ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Digite o nome do personagem"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
                )}
              </div>

              {/* Nível */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Nível
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={personagem.nivel}
                  onChange={(e) =>
                    setPersonagem(prev => ({
                      ...prev,
                      nivel: parseInt(e.target.value) || 1
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg text-black"
                />
              </div>

              {/* Raça */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Raça
                </label>
                <select
                  value={personagem.raca_id ? String(personagem.raca_id) : ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setPersonagem(prev => ({ ...prev, raca_id: value }));
                  }}
                  className={`w-full p-3 border rounded-lg text-black ${
                    errors.raca_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma raça</option>
                  {racas.map(raca => (
                    <option key={getId(raca)} value={getId(raca)}>
                      {raca.nome}
                    </option>
                  ))}
                </select>
                {errors.raca_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.raca_id}</p>
                )}

                {/* Mostrar descrição da raça selecionada */}
                {personagem.raca_id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <strong>{racas.find(r => getId(r) === personagem.raca_id)?.nome}</strong>
                    <br />
                    Tamanho: {racas.find(r => getId(r) === personagem.raca_id)?.tamanho},
                    Deslocamento: {racas.find(r => getId(r) === personagem.raca_id)?.deslocamento}m
                    <br />
                    {temAtributosLivres ? (
                      <span className="text-blue-600">
                        🎯 Esta raça permite escolher {getQuantidadeAtributosLivres()} atributos para receber bônus!
                      </span>
                    ) : (
                      <div>
                        {(() => {
                          const raca = racas.find(r => getId(r) === personagem.raca_id);
                          if (!raca) return null;

                          const bonus = [];
                          const penalidades = [];

                          // Verificar bônus usando novos campos
                          if (raca.atributo_bonus_1 && raca.valor_bonus_1) {
                            bonus.push(`+${raca.valor_bonus_1} ${raca.atributo_bonus_1.toUpperCase()}`);
                          }
                          if (raca.atributo_bonus_2 && raca.valor_bonus_2) {
                            bonus.push(`+${raca.valor_bonus_2} ${raca.atributo_bonus_2.toUpperCase()}`);
                          }
                          if (raca.atributo_bonus_3 && raca.valor_bonus_3) {
                            bonus.push(`+${raca.valor_bonus_3} ${raca.atributo_bonus_3.toUpperCase()}`);
                          }

                          // Verificar penalidades
                          if (raca.atributo_penalidade && raca.valor_penalidade) {
                            penalidades.push(`${raca.valor_penalidade} ${raca.atributo_penalidade.toUpperCase()}`);
                          }

                          const modificadores = [...bonus, ...penalidades];

                          return (
                            <span>
                              {modificadores.length > 0 ? (
                                <>Modificadores: {modificadores.join(', ')}</>
                              ) : (
                                'Nenhum modificador de atributo'
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Escolhas Especiais da Raça */}
              {personagem.raca_id && (
                <EscolhasRaca
                  racaId={personagem.raca_id}
                  escolhasAtuais={escolhasRaca}
                  onEscolhasChange={handleEscolhasRacaChange}
                />
              )}

              {/* Classe */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Classe
                </label>
                <select
                  value={personagem.classe_id ? String(personagem.classe_id) : ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setPersonagem(prev => ({ ...prev, classe_id: value }));
                  }}
                  className={`w-full p-3 border rounded-lg text-black ${
                    errors.classe_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma classe</option>
                  {classes.map(classe => (
                    <option key={getId(classe)} value={getId(classe)}>
                      {classe.nome}
                    </option>
                  ))}
                </select>
                {errors.classe_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.classe_id}</p>
                )}

                {/* Mostrar descrição da classe selecionada */}
                {personagem.classe_id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <strong>{classes.find(c => getId(c) === personagem.classe_id)?.nome}</strong>
                    <br />
                    PV por nível: {classes.find(c => getId(c) === personagem.classe_id)?.pvpornivel},
                    PM por nível: {classes.find(c => getId(c) === personagem.classe_id)?.pmpornivel}
                    <br />
                    Atributo principal: {classes.find(c => getId(c) === personagem.classe_id)?.atributoprincipal}
                    {/* Perícias da Classe */}
                    {personagem.classe_id && personagem.classe_id !== 0 && (
                        <ClassePericiasInfo classeId={personagem.classe_id} />
                    )}
                  </div>
                )}

                {/* Seletor de Poderes de Classe */}
                {personagem.classe_id && (
                  <SeletorPoderesClasse
                    classeId={personagem.classe_id}
                    classeNome={classes.find(c => c.ID === personagem.classe_id)?.nome || ""}
                    nivel={personagem.nivel || 1}
                    poderesSelecionados={poderesClasseSelecionados}
                    onPoderesSelecionados={setPoderesClasseSelecionados}
                  />
                )}
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Origem
                </label>
                <select
                  value={personagem.origem_id ? String(personagem.origem_id) : ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setPersonagem(prev => ({ ...prev, origem_id: value }));
                  }}
                  className={`w-full p-3 border rounded-lg text-black ${
                    errors.origem_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma origem</option>
                  {origens.map(origem => (
                    <option key={getId(origem)} value={getId(origem)}>
                      {origem.nome}
                    </option>
                  ))}
                </select>
                {errors.origem_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.origem_id}</p>
                )}

                {/* Mostrar descrição da origem selecionada */}
                {personagem.origem_id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {origens.find(o => getId(o) === personagem.origem_id)?.descricao}
                  </div>
                )}

                {/* Perícias da Origem */}
                {personagem.origem_id && (
                  <OrigemPericiasInfo origemId={personagem.origem_id} />
                )}

                {/* Poderes de Origem Automáticos */}
                {personagem.origem_id && (
                  <PoderesOrigemAutomaticos origemId={personagem.origem_id} />
                )}
              </div>

              {/* Divindade */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Divindade (Opcional)
                </label>
                <select
                  value={personagem.divindade_id ? String(personagem.divindade_id) : ""}
                  onChange={(e) => {
                    const valor = e.target.value ? parseInt(e.target.value) : null;
                    setPersonagem(prev => ({
                      ...prev,
                      divindade_id: valor
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black"
                >
                  <option value="">Nenhuma divindade</option>
                  {divindades.map(divindade => (
                    <option key={getId(divindade)} value={getId(divindade)}>
                      {divindade.nome} - {divindade.dominio}
                    </option>
                  ))}
                </select>

                {/* Mostrar descrição da divindade selecionada */}
                {personagem.divindade_id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <strong>{divindades.find(d => getId(d) === personagem.divindade_id)?.nome}</strong>
                    <br />
                    <em>{divindades.find(d => getId(d) === personagem.divindade_id)?.dominio}</em>
                    <br />
                    Alinhamento: {divindades.find(d => getId(d) === personagem.divindade_id)?.alinhamento}
                    <br />
                    {divindades.find(d => getId(d) === personagem.divindade_id)?.descricao}
                  </div>
                )}

                {/* Seletor de Poderes Divinos */}
                {personagem.divindade_id && (
                  <SeletorPoderesDivinos
                    divindadeId={personagem.divindade_id}
                    nivelPersonagem={personagem.nivel || 1}
                    classeId={personagem.classe_id}
                    poderesSelecionados={poderesDivinosSelecionados}
                    onPoderesSelecionados={(poderesOpcionais) => {
                      setPoderesDivinosSelecionados(poderesOpcionais);
                      console.log('Poderes divinos opcionais selecionados:', poderesOpcionais);
                    }}
                  />
                )}

                {/* Exibir Poderes Divinos Selecionados */}
                {personagem.divindade_id && poderesDivinosSelecionados.length > 0 && (
                  <PoderesDivinosSelecionados
                    divindadeId={personagem.divindade_id}
                    poderesSelecionados={poderesDivinosSelecionados}
                    nivelPersonagem={personagem.nivel || 1}
                  />
                )}
              </div>

              {errors.atributos && (
                <p className="text-red-500 text-sm">{errors.atributos}</p>
              )}
              {errors.pontos && (
                <p className="text-red-500 text-sm">{errors.pontos}</p>
              )}
              {errors.atributosLivres && (
                <p className="text-red-500 text-sm">{errors.atributosLivres}</p>
              )}
              {errors.pericias && (
                <p className="text-red-500 text-sm">{errors.pericias}</p>
              )}

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition duration-200`}
              >
                {loading ? "Criando..." : "Criar Personagem"}
              </button>
            </form>
          </div>

          {/* Point Buy Calculator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-black">Atributos</h2>
            <PointBuyCalculator
              atributos={{
                for: personagem.for || 0,
                des: personagem.des || 0,
                con: personagem.con || 0,
                int: personagem.int || 0,
                sab: personagem.sab || 0,
                car: personagem.car || 0,
              }}
              onChange={handleAtributosChange}
              racaSelecionada={racaSelecionada}
              atributosLivresEscolhidos={atributosLivresEscolhidos}
              onAtributosLivresChange={handleAtributosLivresChange}
            />

            {/* Stats Preview */}
            {personagem.classe_id && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2 text-black">
                  Preview do Personagem
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>Pontos de Vida: <span className="font-bold">{calculateTotalPV()}</span></div>
                  <div>Pontos de Mana: <span className="font-bold">{calculateTotalPM()}</span></div>
                </div>

                {/* Preview dos bônus raciais escolhidos */}
                {temAtributosLivres && atributosLivresEscolhidos.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                    <strong>Bônus raciais escolhidos:</strong>
                    <br />
                    {atributosLivresEscolhidos.map(attr => (
                      <span key={attr} className="inline-block mr-2">
                        {attr}: +1
                      </span>
                    ))}
                    {racaSelecionada?.nome?.toLowerCase() === 'lefou' && (
                      <span className="text-red-600">CAR: -1</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seletor de Perícias */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SeletorPericias
              classeId={personagem.classe_id || null}
              racaId={personagem.raca_id || null}
              origemId={personagem.origem_id || null}
              periciasEscolhidas={periciasEscolhidas}
              onPericiasChange={setPericiasEscolhidas}
              periciasDeRaca={periciasDeRacaEscolhidas}
            />
          </div>
        </div>
          {/* Habilidades */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Habilidades do Personagem
            </h2>

            {habilidadesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando habilidades...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Habilidades Raciais */}
                {habilidadesRaca.length > 0 && (
                  <SeletorHabilidades
                    tipo="raca"
                    habilidades={habilidadesRaca}
                    nivelPersonagem={personagem.nivel || 1}
                  />
                )}

                {/* Habilidades de Classe */}
                {habilidadesClasse.length > 0 && (
                  <SeletorHabilidades
                    tipo="classe"
                    habilidades={habilidadesClasse}
                    nivelPersonagem={personagem.nivel || 1}
                  />
                )}

                {/* Poderes de Origem Automáticos */}
                {personagem.origem_id && (
                  <PoderesOrigemAutomaticos origemId={personagem.origem_id} />
                )}

                {/* Poderes Divinos Selecionados */}
                {personagem.divindade_id && poderesDivinosSelecionados.length > 0 && (
                  <PoderesDivinosSelecionados
                    divindadeId={personagem.divindade_id}
                    poderesSelecionados={poderesDivinosSelecionados}
                  />
                )}

                {/* Mensagem quando não há habilidades */}
                {habilidadesRaca.length === 0 && habilidadesClasse.length === 0 &&
                 habilidadesOrigem.length === 0 &&
                 personagem.raca_id && personagem.classe_id && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>Não há habilidades disponíveis para as seleções atuais.</p>
                    <p className="text-sm">Certifique-se de que raça, classe e nível estão selecionados.</p>
                  </div>
                )}
              </div>
            )}
          </div>

      </div>
    </div>
  );
}

// Componente para mostrar informações sobre perícias da origem
function OrigemPericiasInfo({ origemId }: { origemId: number }) {
  const [periciasInfo, setPericiasInfo] = useState<{
    origem: string;
    pericias: Array<{ id: number; nome: string; atributo: string; descricao: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarPericiasOrigem = async () => {
      if (!origemId || origemId === 0) {
        setPericiasInfo(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/v1/origens/${origemId}/pericias`);
        if (response.ok) {
          const data = await response.json();
          setPericiasInfo(data);
        } else {
          console.error('Erro ao carregar perícias da origem');
          setPericiasInfo(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perícias da origem:', error);
        setPericiasInfo(null);
      } finally {
        setLoading(false);
      }
    };

    carregarPericiasOrigem();
  }, [origemId]);

  if (loading) {
    return (
      <div className="mt-4 p-3 bg-amber-50 rounded text-sm">
        <div className="animate-pulse">Carregando perícias da origem...</div>
      </div>
    );
  }

  if (!periciasInfo || !periciasInfo.pericias || periciasInfo.pericias.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-amber-50 rounded text-sm text-gray-700">
      <h4 className="font-semibold text-amber-800 mb-2">Perícias da Origem</h4>

      <div className="space-y-1">
        {periciasInfo.pericias.map(pericia => (
          <div key={pericia.id} className="flex items-start">
            <span className="font-medium text-amber-700">{pericia.nome}</span>
            <span className="text-xs text-gray-500 ml-1">({pericia.atributo})</span>
            {pericia.descricao && (
              <span className="text-xs text-gray-600 ml-2">- {pericia.descricao}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para mostrar informações sobre perícias da classe
function ClassePericiasInfo({ classeId }: { classeId: number }) {
  const [periciasInfo, setPericiasInfo] = useState<{
    classe: string;
    pericias_quantidade: number;
    pericias_disponiveis: Array<{ id: number; nome: string; atributo: string; descricao: string }>;
    pericias_automaticas: Array<{ id: number; nome: string; atributo: string; descricao: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarPericiasClasse = async () => {
      if (!classeId || classeId === 0) {
        setPericiasInfo(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/v1/classes/${classeId}/pericias`);
        if (response.ok) {
          const data = await response.json();
          setPericiasInfo(data);
        } else {
          console.error('Erro ao carregar perícias da classe');
          setPericiasInfo(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perícias da classe:', error);
        setPericiasInfo(null);
      } finally {
        setLoading(false);
      }
    };

    carregarPericiasClasse();
  }, [classeId]);

  if (loading) {
    return (
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <div className="animate-pulse">Carregando perícias da classe...</div>
      </div>
    );
  }

  if (!periciasInfo) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
      <h4 className="font-semibold text-blue-800 mb-2">Perícias da Classe</h4>

      {/* Perícias Automáticas */}
      {periciasInfo.pericias_automaticas.length > 0 && (
        <div className="mb-3">
          <div className="font-medium text-green-700 mb-1">Perícias Automáticas:</div>
          <div className="space-y-1">
            {periciasInfo.pericias_automaticas.map(pericia => (
              <div key={pericia.id} className="flex items-start">
                <span className="font-medium">{pericia.nome}</span>
                <span className="text-xs text-gray-500 ml-1">({pericia.atributo})</span>
                {pericia.descricao && (
                  <span className="text-xs text-gray-600 ml-2">- {pericia.descricao}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantidade de Perícias para Escolher */}
      <div className="mb-2">
        <span className="font-medium text-blue-700">
          Perícias para escolher: {periciasInfo.pericias_quantidade}
        </span>
      </div>

      {/* Perícias Disponíveis para Escolha */}
      {periciasInfo.pericias_disponiveis.length > 0 && (
        <div>
          <div className="font-medium text-blue-700 mb-1">Perícias Disponíveis:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {periciasInfo.pericias_disponiveis.map(pericia => (
              <div key={pericia.id} className="flex items-center">
                <span className="font-medium">{pericia.nome}</span>
                <span className="text-gray-500 ml-1">({pericia.atributo})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
