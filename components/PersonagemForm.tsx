"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Personagem, Raca, Classe, Origem, Divindade, Habilidade, Pericia } from "@/types";
import { api } from "../lib/api";
import { usePersonagemCache } from "../hooks/useLocalStorage";
import { usePersonagemValidation } from "../hooks/usePersonagemValidation";
import { useLoadingStates } from "../hooks/useLoading";
import ErrorBoundary from "./ErrorBoundary";
import PointBuyCalculator from "./PointBuyCalculator";
import SeletorAtributosLivres from "./SeletorAtributosLivres";
import SeletorPericias from "./SeletorPericias";
import SeletorHabilidades from "./SeletorHabilidades";
import SeletorPoderesDivinos from "./SeletorPoderesDivinos";
import SeletorPoderesClasse from "./SeletorPoderesClasse";
import PoderesDivinosSelecionados from "./PoderesDivinosSelecionados";
import PoderesOrigemAutomaticos from "./PoderesOrigemAutomaticos";
import EscolhasRaca from "./EscolhasRaca";

interface PersonagemFormProps {
  editId?: string | null;
}

function PersonagemFormComponent({ editId }: PersonagemFormProps) {
  const [mounted, setMounted] = useState(false);

  // Hooks customizados
  const {
    cachedPersonagem,
    savePersonagemCache,
    clearPersonagemCache,
    hasCachedData
  } = usePersonagemCache();

  const {
    errors,
    validateForm,
    clearErrors,
    setErrors
  } = usePersonagemValidation();

  const {
    setLoading,
    isLoading,
    withLoading
  } = useLoadingStates();

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

  // Estados para habilidades carregadas da API
  const [habilidadesRaca, setHabilidadesRaca] = useState<Habilidade[]>([]);
  const [habilidadesClasse, setHabilidadesClasse] = useState<Habilidade[]>([]);
  const [habilidadesOrigem, setHabilidadesOrigem] = useState<Habilidade[]>([]);
  const [habilidadesDivindade, setHabilidadesDivindade] = useState<Habilidade[]>([]);

  // Estado para atributos livres
  const [atributosLivresEscolhidos, setAtributosLivresEscolhidos] = useState<string[]>([]);

  // Estado para controlar se deve mostrar o botão de recuperar dados
  const [showRecoverButton, setShowRecoverButton] = useState(false);

  // Estado para modo de edição
  const [isEditing, setIsEditing] = useState(!!editId);
  const [originalPersonagemId, setOriginalPersonagemId] = useState<number | null>(
    editId ? parseInt(editId) : null
  );
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

    // Se estiver editando, carregar dados do personagem
    if (isEditing && originalPersonagemId) {
      carregarPersonagemParaEdicao(originalPersonagemId);
    } else {
      // Verificar se há dados em cache para restaurar (apenas se não estiver editando)
      if (hasCachedData() && cachedPersonagem) {
        setShowRecoverButton(true);
      }
    }
  }, []);

  // Auto-save no cache sempre que os dados mudarem
  useEffect(() => {
    if (mounted && (personagem.nome || personagem.raca_id || personagem.classe_id)) {
      const dadosParaCache = {
        personagem,
        atributosLivresEscolhidos,
        escolhasRaca,
        periciasEscolhidas,
        poderesClasseSelecionados,
        poderesDivinosSelecionados
      };

      savePersonagemCache(dadosParaCache);
    }
  }, [
    mounted,
    personagem.nome,
    personagem.nivel,
    personagem.for,
    personagem.des,
    personagem.con,
    personagem.int,
    personagem.sab,
    personagem.car,
    personagem.raca_id,
    personagem.classe_id,
    personagem.origem_id,
    personagem.divindade_id,
    atributosLivresEscolhidos,
    escolhasRaca,
    periciasEscolhidas,
    poderesClasseSelecionados,
    poderesDivinosSelecionados,
    savePersonagemCache
  ]);
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
        await withLoading('dataLoading', async () => {
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
          clearErrors(); // Limpar erros se carregar com sucesso
        });
      } catch (error) {
        console.error("Erro detalhado ao carregar dados:", error);
        setErrors({
          geral: error instanceof Error ? error.message : "Erro desconhecido ao carregar dados básicos. Verifique se o backend está rodando.",
        });
      }
    };

    carregarDados();
  }, [mounted, withLoading, clearErrors, setErrors]);

  // UseEffect para carregar habilidades quando personagem, raça, classe, origem, divindade ou nível mudarem
  useEffect(() => {
    if (mounted && !isLoading('dataLoading')) {
      carregarTodasHabilidades();
    }
  }, [mounted, personagem.raca_id, personagem.classe_id, personagem.origem_id, personagem.divindade_id, personagem.nivel]);

  const validarFormulario = (): boolean => {
    console.log('🔍 Iniciando validação...');
    console.log('📊 Dados do personagem:', personagem);

    // Validação simplificada para debug
    if (!personagem.nome || personagem.nome.trim() === '') {
      console.log('❌ Nome vazio');
      setErrors({ nome: 'Nome é obrigatório' });
      return false;
    }

    console.log('✅ Validação simplificada passou');
    return true;

    // Comentando validação completa temporariamente
    /*
    return validateForm({
      personagem,
      racas,
      classes,
      atributosLivresEscolhidos,
      periciasEscolhidas,
      temAtributosLivres: Boolean(temAtributosLivres),
      getQuantidadeAtributosLivres,
      getCostForValue
    });
    */
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

  // Função para recuperar dados do cache
  const handleRecoverData = () => {
    if (cachedPersonagem) {
      // Restaurar dados do cache
      if (cachedPersonagem.personagem) {
        setPersonagem(cachedPersonagem.personagem);
      }
      if (cachedPersonagem.atributosLivresEscolhidos) {
        setAtributosLivresEscolhidos(cachedPersonagem.atributosLivresEscolhidos);
      }
      if (cachedPersonagem.escolhasRaca) {
        setEscolhasRaca(cachedPersonagem.escolhasRaca);
      }
      if (cachedPersonagem.periciasEscolhidas) {
        setPericiasEscolhidas(cachedPersonagem.periciasEscolhidas);
      }
      if (cachedPersonagem.poderesClasseSelecionados) {
        setPoderesClasseSelecionados(cachedPersonagem.poderesClasseSelecionados);
      }
      if (cachedPersonagem.poderesDivinosSelecionados) {
        setPoderesDivinosSelecionados(cachedPersonagem.poderesDivinosSelecionados);
      }

      console.log('📥 Dados restaurados do cache:', cachedPersonagem);
      setShowRecoverButton(false);
    }
  };

  // Função para descartar dados do cache
  const handleDiscardData = () => {
    clearPersonagemCache();
    setShowRecoverButton(false);
  };

  // Função para carregar personagem para edição
  const carregarPersonagemParaEdicao = async (id: number) => {
    try {
      await withLoading('dataLoading', async () => {
        const personagemData = await api.getPersonagem(id);

        // Carregar dados básicos
        setPersonagem({
          ...personagemData,
          id: personagemData.id
        });

        // Carregar escolhas raciais se existirem
        if (personagemData.escolhas_raca && personagemData.escolhas_raca !== '{}') {
          try {
            const escolhasRaciais = JSON.parse(personagemData.escolhas_raca);
            setEscolhasRaca(escolhasRaciais);
            console.log('📥 Escolhas raciais carregadas:', escolhasRaciais);
          } catch (e) {
            console.warn('⚠️ Erro ao parsear escolhas raciais:', e);
          }
        }

        // Carregar perícias se existirem
        if (personagemData.pericias && Array.isArray(personagemData.pericias)) {
          const periciasIds = personagemData.pericias.map((p: any) => getId(p));
          setPericiasEscolhidas(periciasIds);
          console.log('📥 Perícias carregadas:', periciasIds);
        }

        // TODO: Carregar poderes de classe e divinos quando implementados no backend

        console.log('📥 Personagem carregado para edição:', personagemData);
      });
    } catch (error) {
      console.error('❌ Erro ao carregar personagem:', error);
      setErrors({
        geral: "Erro ao carregar personagem para edição. Verifique se o personagem existe.",
      });
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Iniciando handleSubmit...');
    console.log('📊 Estado atual do personagem:', personagem);

    const validacao = validarFormulario();
    console.log('✅ Resultado da validação:', validacao);

    if (!validacao) {
      console.log('❌ Validação falhou, interrompendo...');
      return;
    }

    console.log('✅ Validação passou, continuando...');

    try {
      await withLoading('createPersonagem', async () => {
        // Preparar dados completos do personagem
        const personagemData = {
          ...personagem,
          raca_id: personagem.raca_id || 1,
          classe_id: personagem.classe_id || 1,
          origem_id: personagem.origem_id || 1,
          divindade_id: personagem.divindade_id || undefined,
          // Dados de atributos livres
          atributosLivres: temAtributosLivres ? atributosLivresEscolhidos : undefined,
          // Escolhas raciais (incluindo versatilidade e lefou)
          escolhas_raca: Object.keys(escolhasRaca).length > 0 ? JSON.stringify(escolhasRaca) : "{}",
          // Perícias selecionadas
          pericias_selecionadas: periciasEscolhidas,
          // Poderes de classe selecionados
          poderes_classe: poderesClasseSelecionados,
          // Poderes divinos selecionados
          poderes_divinos: poderesDivinosSelecionados,
          // PV e PM calculados
          pontos_vida: calculateTotalPV(),
          pontos_mana: calculateTotalPM()
        };

        console.log('📝 Dados completos do personagem:', personagemData);

        let resultPersonagem;
        if (isEditing && originalPersonagemId) {
          console.log('✏️ Modo edição - atualizando personagem...');
          // Atualizar personagem existente
          resultPersonagem = await api.updatePersonagem(originalPersonagemId, personagemData as Personagem);
          console.log('✅ Personagem atualizado:', resultPersonagem);
        } else {
          console.log('🆕 Modo criação - criando novo personagem...');
          // Criar novo personagem
          console.log('📡 Chamando API createPersonagem com dados:', personagemData);

          try {
            resultPersonagem = await api.createPersonagem(personagemData as Personagem);
            console.log('✅ Personagem criado com sucesso:', resultPersonagem);
          } catch (apiError) {
            console.error('❌ Erro na API createPersonagem:', apiError);
            throw apiError;
          }
        }

        // Salvar dados relacionados em paralelo
        const savePromises = [];

        // Salvar perícias do personagem
        if (periciasEscolhidas.length > 0) {
          console.log('💾 Salvando perícias:', periciasEscolhidas);
          savePromises.push(
            api.savePersonagemPericias(resultPersonagem.id!, periciasEscolhidas)
              .then(() => console.log('✅ Perícias salvas com sucesso'))
              .catch(error => {
                console.error('❌ Erro ao salvar perícias:', error);
                console.error('❌ Dados enviados:', { pericias_ids: periciasEscolhidas });
              })
          );
        } else {
          console.log('⚠️ Nenhuma perícia selecionada para salvar');
        }

        // Salvar poderes de classe se houver
        if (poderesClasseSelecionados.length > 0) {
          console.log('⚠️ ENDPOINT FALTANDO: /api/v1/personagens/:id/poderes-classe');
          console.log('💾 Poderes de classe que deveriam ser salvos:', poderesClasseSelecionados);
          // TODO: Implementar endpoint no backend
          /*
          savePromises.push(
            fetch(`${API_BASE_URL}/api/v1/personagens/${resultPersonagem.id}/poderes-classe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ poderes_ids: poderesClasseSelecionados }),
            }).then(() => console.log('✅ Poderes de classe salvos com sucesso'))
              .catch(error => console.error('❌ Erro ao salvar poderes de classe:', error))
          );
          */
        }

        // Salvar poderes divinos se houver
        if (poderesDivinosSelecionados.length > 0) {
          console.log('⚠️ ENDPOINT FALTANDO: /api/v1/personagens/:id/poderes-divinos');
          console.log('💾 Poderes divinos que deveriam ser salvos:', poderesDivinosSelecionados);
          // TODO: Implementar endpoint no backend
          /*
          savePromises.push(
            fetch(`${API_BASE_URL}/api/v1/personagens/${resultPersonagem.id}/poderes-divinos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ poderes_ids: poderesDivinosSelecionados }),
            }).then(() => console.log('✅ Poderes divinos salvos com sucesso'))
              .catch(error => console.error('❌ Erro ao salvar poderes divinos:', error))
          );
          */
        }

        // Salvar escolhas raciais especiais se houver
        if (Object.keys(escolhasRaca).length > 0) {
          console.log('⚠️ ENDPOINT FALTANDO: /api/v1/personagens/:id/escolhas-raca');
          console.log('💾 Escolhas raciais que deveriam ser salvas:', escolhasRaca);
          // TODO: Implementar endpoint no backend
          /*
          savePromises.push(
            fetch(`${API_BASE_URL}/api/v1/personagens/${resultPersonagem.id}/escolhas-raca`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ escolhas: escolhasRaca }),
            }).then(() => console.log('✅ Escolhas raciais salvas com sucesso'))
              .catch(error => console.error('❌ Erro ao salvar escolhas raciais:', error))
          );
          */
        }

        // Aguardar todas as operações de salvamento
        await Promise.allSettled(savePromises);

        const acao = isEditing ? 'atualizado' : 'criado';
        alert(`🎭 Personagem ${resultPersonagem.nome} ${acao} com sucesso!`);

        // Limpar cache após operação bem-sucedida (apenas se não estiver editando)
        if (!isEditing) {
          clearPersonagemCache();
          resetFormulario();
        }

        // Redirecionar para a página inicial após sucesso
        window.location.href = '/';
      });
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      setErrors({
        geral: "Erro ao criar personagem. Verifique os dados e tente novamente.",
      });
    }
  };

  // Função para reset completo do formulário
  const resetFormulario = () => {
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
      pontos_vida: 0,
      pontos_mana: 0,
    });
    setAtributosLivresEscolhidos([]);
    setPericiasEscolhidas([]);
    setEscolhasRaca({});
    setPoderesDivinosSelecionados([]);
    setPoderesClasseSelecionados([]);
    setErrors({});
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

    console.log('🔍 Debug PV completo:', {
      classeId: personagem.classe_id,
      classesDisponiveis: classes.map(c => ({ id: getId(c), nome: c.nome, pv: c.pvpornivel })),
      classeEscolhida: classeEscolhida ? { nome: classeEscolhida.nome, pvpornivel: classeEscolhida.pvpornivel } : null,
      basePV,
      personagemCon: personagem.con,
      personagemNivel: personagem.nivel
    });

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
        if (racaEscolhida.atributo_bonus_1?.toLowerCase() === 'con') {
          bonusRacialCon += racaEscolhida.valor_bonus_1 || 0;
        }
        if (racaEscolhida.atributo_bonus_2?.toLowerCase() === 'con') {
          bonusRacialCon += racaEscolhida.valor_bonus_2 || 0;
        }
      }
    }

    const modConFinal = modCon + bonusRacialCon;
    const resultado = (basePV + modConFinal) * (personagem.nivel || 1);

    console.log('🔍 Cálculo PV final:', {
      basePV,
      modCon,
      bonusRacialCon,
      modConFinal,
      nivel: personagem.nivel || 1,
      resultado
    });

    // Fórmula correta do Tormenta20:
    // PV Total = (PV base da classe + mod CON) × nível
    // O modificador de CON é somado a cada nível
    return resultado;
  };

  const calculateTotalPM = (): number => {
    const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
    const basePM = classeEscolhida?.pmpornivel || 0;

    console.log('🔍 Debug PM completo:', {
      classeId: personagem.classe_id,
      classesDisponiveis: classes.map(c => ({ id: getId(c), nome: c.nome, pm: c.pmpornivel })),
      classeEscolhida: classeEscolhida ? { nome: classeEscolhida.nome, pmpornivel: classeEscolhida.pmpornivel } : null,
      basePM,
      personagemInt: personagem.int,
      personagemNivel: personagem.nivel
    });

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
        if (racaEscolhida.atributo_bonus_1?.toLowerCase() === 'int') {
          bonusRacialInt += racaEscolhida.valor_bonus_1 || 0;
        }
        if (racaEscolhida.atributo_bonus_2?.toLowerCase() === 'int') {
          bonusRacialInt += racaEscolhida.valor_bonus_2 || 0;
        }
      }
    }

    const modIntFinal = modInt + bonusRacialInt;
    const resultado = (basePM + modIntFinal) * (personagem.nivel || 1);

    console.log('🔍 Cálculo PM final:', {
      basePM,
      modInt,
      bonusRacialInt,
      modIntFinal,
      nivel: personagem.nivel || 1,
      resultado
    });

    // Fórmula correta do Tormenta20:
    // PM Total = (PM base da classe + mod INT) × nível
    // O modificador de INT é somado a cada nível
    return resultado;
  };

  // Funções para carregar habilidades da API
  const carregarHabilidadesRaca = async (racaId: number) => {
    try {
      const habilidades = await api.getHabilidadesRaca(racaId);
      setHabilidadesRaca(habilidades);
    } catch (error) {
      console.error('Erro ao carregar habilidades da raça:', error);
      setHabilidadesRaca([]);
    }
  };

  const carregarHabilidadesClasse = async (classeId: number, nivel: number) => {
    try {
      const habilidades = await api.getHabilidadesClasse(classeId, nivel);
      setHabilidadesClasse(habilidades);
    } catch (error) {
      console.error('Erro ao carregar habilidades da classe:', error);
      setHabilidadesClasse([]);
    }
  };

  const carregarHabilidadesOrigem = async (origemId: number) => {
    try {
      const habilidades = await api.getHabilidadesOrigem(origemId);
      setHabilidadesOrigem(habilidades);
    } catch (error) {
      console.error('Erro ao carregar habilidades da origem:', error);
      setHabilidadesOrigem([]);
    }
  };

  const carregarHabilidadesDivindade = async (divindadeId: number, nivel: number) => {
    try {
      const habilidades = await api.getHabilidadesDivindade(divindadeId, nivel);
      setHabilidadesDivindade(habilidades);
    } catch (error) {
      console.error('Erro ao carregar habilidades da divindade:', error);
      setHabilidadesDivindade([]);
    }
  };

  // Função para carregar todas as habilidades quando os dados mudarem
  const carregarTodasHabilidades = async () => {
    try {
      await withLoading('habilidades', async () => {
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
      });
    } catch (error) {
      console.error('Erro ao carregar habilidades:', error);
    }
  };

  // Não renderizar até que esteja montado (evita hydration issues)
  if (!mounted) return null;

  // Loading state para carregamento inicial de dados
  if (isLoading('dataLoading')) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-black">
            {isEditing ? 'Editar Personagem - Tormenta20' : 'Criar Personagem - Tormenta20'}
          </h1>

          {/* Indicador de Cache */}
          {hasCachedData() && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">💾</span>
                <span>Rascunho salvo automaticamente</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar o rascunho salvo?')) {
                    clearPersonagemCache();
                    resetFormulario();
                  }
                }}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Limpar rascunho
              </button>
            </div>
          )}
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
          {isEditing ? 'Editar Personagem - Tormenta20' : 'Criar Personagem - Tormenta20'}
        </h1>

        {/* Botão de Recuperar Dados */}
        {showRecoverButton && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="mr-2">📋</span>
                <span>Encontramos um rascunho de personagem salvo. Deseja continuar de onde parou?</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRecoverData}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Recuperar
                </button>
                <button
                  onClick={handleDiscardData}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}

        {errors.geral && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.geral}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
          {/* Formulário Principal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-black">Informações Básicas</h2>
            <form className="space-y-6">
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
                    {(() => {
                      const classeEncontrada = classes.find(c => getId(c) === personagem.classe_id);
                      console.log('🔍 Debug classe:', {
                        classeId: personagem.classe_id,
                        classeEncontrada,
                        classes: classes.map(c => ({ id: getId(c), nome: c.nome, pv: c.pvpornivel, pm: c.pmpornivel }))
                      });
                      return (
                        <>
                          <strong>{classeEncontrada?.nome}</strong>
                          <br />
                          PV por nível: {classeEncontrada?.pvpornivel || 'N/A'},
                          PM por nível: {classeEncontrada?.pmpornivel || 'N/A'}
                          <br />
                          Atributo principal: {classeEncontrada?.atributoprincipal || 'N/A'}
                        </>
                      );
                    })()}
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
                    classeId={personagem.classe_id || null}
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

        {/* Seções que ocupam toda a largura */}
        <div className="mt-8 space-y-8">
          {/* Habilidades */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Habilidades do Personagem
            </h2>

          {isLoading('habilidades') ? (
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
                  nivelPersonagem={personagem.nivel || 1}
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

        {/* Seção Final - Criação do Personagem */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Finalizar Criação
          </h2>

          {/* Validação e Erros */}
          <div className="mb-6">
            {errors.atributos && (
              <p className="text-red-500 text-sm mb-2">{errors.atributos}</p>
            )}
            {errors.pontos && (
              <p className="text-red-500 text-sm mb-2">{errors.pontos}</p>
            )}
            {errors.atributosLivres && (
              <p className="text-red-500 text-sm mb-2">{errors.atributosLivres}</p>
            )}
            {errors.pericias && (
              <p className="text-red-500 text-sm mb-2">{errors.pericias}</p>
            )}
          </div>

          {/* Resumo do Personagem */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Resumo do Personagem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span>
                <span className="ml-2 text-gray-700">{personagem.nome || "Não definido"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nível:</span>
                <span className="ml-2 text-gray-700">{personagem.nivel}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Raça:</span>
                <span className="ml-2 text-gray-700">{personagem.raca_id ? racas.find(r => getId(r) === personagem.raca_id)?.nome : "Não selecionada"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Classe:</span>
                <span className="ml-2 text-gray-700">{personagem.classe_id ? classes.find(c => getId(c) === personagem.classe_id)?.nome : "Não selecionada"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Origem:</span>
                <span className="ml-2 text-gray-700">{personagem.origem_id ? origens.find(o => getId(o) === personagem.origem_id)?.nome : "Não selecionada"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Divindade:</span>
                <span className="ml-2 text-gray-700">{personagem.divindade_id ? divindades.find(d => getId(d) === personagem.divindade_id)?.nome : "Nenhuma"}</span>
              </div>
              {personagem.classe_id && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">PV:</span>
                    <span className="ml-2 font-bold text-green-600">{calculateTotalPV()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">PM:</span>
                    <span className="ml-2 font-bold text-blue-600">{calculateTotalPM()}</span>
                  </div>
                </>
              )}
              <div>
                <span className="font-medium text-gray-700">Perícias Escolhidas:</span>
                <span className="ml-2">{periciasEscolhidas.length}</span>
              </div>
            </div>
          </div>

          {/* Botão de Criação */}
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              console.log('🔘 Botão clicado!');
              handleSubmit();
            }}
            disabled={isLoading('createPersonagem')}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg ${
              isLoading('createPersonagem')
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white transition duration-200 transform hover:scale-105`}
          >
            {isLoading('createPersonagem') ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Atualizando Personagem...' : 'Criando Personagem...'}
              </div>
            ) : (
              isEditing ? "✏️ Atualizar Personagem" : "🎭 Criar Personagem"
            )}
          </button>

          {/* Botões de Ação Adicionais */}
          <div className="mt-4 flex gap-3">
            <Link
              href="/exportar-pdf"
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              📄 Exportar PDF
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              🏠 Voltar
            </Link>
          </div>
        </div>

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
        const data = await api.getPericiasOrigem(origemId);
        setPericiasInfo(data);
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
        const data = await api.getPericiasClasse(classeId);
        setPericiasInfo(data);
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

// Componente principal envolvido com Error Boundary
export default function PersonagemForm(props: PersonagemFormProps = {}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log de erro personalizado
        console.group('🚨 Erro capturado no PersonagemForm');
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
      }}
    >
      <PersonagemFormComponent {...props} />
    </ErrorBoundary>
  );
}
