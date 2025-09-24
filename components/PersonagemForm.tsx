"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Personagem, Raca, Classe, Origem, Divindade, Habilidade, Pericia, Poder } from "@/types";
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
import EscolhasRaca from "./EscolhasRaca";
import SeletorBeneficiosOrigem from "./SeletorBeneficiosOrigem";
import BeneficiosOrigemSelecionados from "./BeneficiosOrigemSelecionados";

interface PersonagemFormProps {
  editId?: string | null;
}

function PersonagemFormComponent({ editId }: PersonagemFormProps) {
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);

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
    raca_id: undefined,
    classe_id: undefined,
    origem_id: undefined,
    divindade_id: undefined,
  });

  const [baseAtributos, setBaseAtributos] = useState({
    for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0,
  });

  // Estados de Dados
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
  const [beneficiosOrigem, setBeneficiosOrigem] = useState<{ pericias: number[], poderes: number[] }>({ pericias: [], poderes: [] });

    const [opcoesPericiasOrigem, setOpcoesPericiasOrigem] = useState<Pericia[]>([]);
    const [opcoesPoderesOrigem, setOpcoesPoderesOrigem] = useState<Poder[]>([]);

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

  const periciasDeOrigemEscolhidasObjetos = useMemo(() => {
  return opcoesPericiasOrigem.filter(pericia =>
    beneficiosOrigem.pericias.includes(pericia.id)
  );
  // Esta lista só será recriada se opcoesPericiasOrigem ou beneficiosOrigem.pericias mudar.
}, [opcoesPericiasOrigem, beneficiosOrigem.pericias]);

const periciasDeRacaEscolhidasObjetos = useMemo(() => {
  return periciasDeRacaEscolhidas;
  // Esta lista só será recriada se periciasDeRacaEscolhidas mudar.
}, [periciasDeRacaEscolhidas]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
        try {
        await withLoading('dataLoading', async () => {
            // Primeiro, carrega os dados básicos (raças, classes, etc)
            const [racasData, classesData, origensData, divindadesData] = await Promise.all([
            api.getRacas(),
            api.getClasses(),
            api.getOrigens(),
            api.getDivindades()
            ]);
            setRacas(racasData);
            setClasses(classesData);
            setOrigens(origensData);
            setDivindades(divindadesData);

            // DEPOIS de carregar os dados básicos, verifica se está em modo de edição
            if (isEditing && originalPersonagemId) {
            // Passa as raças já carregadas para a função de edição
            await carregarPersonagemParaEdicao(originalPersonagemId, racasData);
            } else if (hasCachedData() && cachedPersonagem) {
            setShowRecoverButton(true);
            }
        });
        } catch (error) {
        console.error("Erro fatal ao carregar dados:", error);
        setErrors({ geral: "Não foi possível carregar os dados básicos do jogo." });
        }
    };

    setMounted(true);
    carregarDadosIniciais();
    }, []);

  // Auto-save no cache sempre que os dados mudarem
  useEffect(() => {
    if (mounted && (personagem.nome || personagem.raca_id || personagem.classe_id)) {
      const dadosParaCache = {
        personagem,
        atributosLivresEscolhidos,
        escolhasRaca,
        periciasEscolhidas,
        beneficiosOrigem,
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
    poderesDivinosSelecionados
  ]);
  // useEffect para calcular os atributos finais sempre que a base, raça ou livres mudarem
    useEffect(() => {
    // Pega os valores base atuais
    const { for: baseFor, des: baseDes, con: baseCon, int: baseInt, sab: baseSab, car: baseCar } = baseAtributos;

    // Calcula os bônus/penalidades
    const bonus = { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 };

    if (racaSelecionada) {
        const aplicarBonus = (attr: keyof typeof bonus, bonusValue: number) => {
        bonus[attr] += bonusValue;
        };

        // Bônus Livres
        if (temAtributosLivres) {
        atributosLivresEscolhidos.forEach(attr => {
            const key = attr.toLowerCase() as keyof typeof bonus;
            if (bonus.hasOwnProperty(key)) {
            aplicarBonus(key, 1);
            }
        });
        }

        // Bônus Fixos
        if (racaSelecionada.atributo_bonus_1 && racaSelecionada.valor_bonus_1) aplicarBonus(racaSelecionada.atributo_bonus_1.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_1);
        if (racaSelecionada.atributo_bonus_2 && racaSelecionada.valor_bonus_2) aplicarBonus(racaSelecionada.atributo_bonus_2.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_2);
        if (racaSelecionada.atributo_bonus_3 && racaSelecionada.valor_bonus_3) aplicarBonus(racaSelecionada.atributo_bonus_3.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_3);

        // Penalidade
        if (racaSelecionada.atributo_penalidade && racaSelecionada.valor_penalidade) {
        const penalidadeKey = racaSelecionada.atributo_penalidade.toLowerCase() as keyof typeof bonus;
        bonus[penalidadeKey] += racaSelecionada.valor_penalidade; // Geralmente penalidade é negativa
        }
    }

    // Calcula os valores finais e atualiza o estado 'personagem'
    setPersonagem(prev => ({
        ...prev,
        for: baseFor + bonus.for,
        des: baseDes + bonus.des,
        con: baseCon + bonus.con,
        int: baseInt + bonus.int,
        sab: baseSab + bonus.sab,
        car: baseCar + bonus.car,
    }));

    }, [baseAtributos, racaSelecionada, atributosLivresEscolhidos]); // Dependências

  useEffect(() => {
    // Este useEffect agora só controla o isInitialMount.
    // O useEffect que depende de `personagem.raca_id` cuidará da limpeza.
    if (isInitialMount.current) {
        isInitialMount.current = false;
    }
  }, []);
  useEffect(() => {
    // Limpa os benefícios escolhidos ao trocar de origem, exceto no carregamento inicial
    if (!isInitialMount.current) {
      setBeneficiosOrigem({ pericias: [], poderes: [] });
    }
  }, [personagem.origem_id]);


  // Reset poderes divinos quando mudar de divindade
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPoderesDivinosSelecionados([]);
    }
  }, [personagem.divindade_id]);

  // UseEffect para carregar habilidades quando personagem, raça, classe, origem, divindade ou nível mudarem
  useEffect(() => {
    if (mounted && !isLoading('dataLoading') &&
        (personagem.raca_id || personagem.classe_id || personagem.origem_id || personagem.divindade_id)) {
      carregarTodasHabilidades();
    }
  }, [mounted, personagem.raca_id, personagem.classe_id, personagem.origem_id, personagem.divindade_id, personagem.nivel]);

  // Busca as OPÇÕES da origem quando ela muda
    useEffect(() => {
    if (!personagem.origem_id) {
        setOpcoesPericiasOrigem([]);
        setOpcoesPoderesOrigem([]);
        return;
    }
    const carregarOpcoesOrigem = async () => {
        await withLoading('origemData', async () => {
            try {
                // APENAS DUAS CHAMADAS, como era originalmente
                const [periciasData, poderesData] = await Promise.all([
                    api.getPericiasOrigem(personagem.origem_id!),
                    api.getPoderesOrigem(personagem.origem_id!) // Esta API já busca TUDO.
                ]);

                setOpcoesPericiasOrigem(periciasData?.pericias || []);
                setOpcoesPoderesOrigem(poderesData || []);

            } catch (error) {
                console.error("Erro ao carregar opções da origem:", error);
                setOpcoesPericiasOrigem([]);
                setOpcoesPoderesOrigem([]);
            }
        });
    };
    carregarOpcoesOrigem();
}, [personagem.origem_id]);

    // **A MÁGICA ACONTECE AQUI**
    useEffect(() => {
        const periciasDeOutrasFontes = periciasEscolhidas.filter(id =>
            !opcoesPericiasOrigem.some(p => p.id === id)
        );
        const novasPericias = [...new Set([...periciasDeOutrasFontes, ...beneficiosOrigem.pericias])];
        if (JSON.stringify(novasPericias.sort()) !== JSON.stringify(periciasEscolhidas.sort())) {
            setPericiasEscolhidas(novasPericias);
        }
    }, [beneficiosOrigem.pericias, opcoesPericiasOrigem]);

  const validarFormulario = (): boolean => {
    // Validação simplificada para debug
    if (!personagem.nome || personagem.nome.trim() === '') {
      setErrors({ nome: 'Nome é obrigatório' });
      return false;
    }
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
  // ...


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
      if (cachedPersonagem.beneficiosOrigem) {
        setBeneficiosOrigem(cachedPersonagem.beneficiosOrigem);
      }

      setShowRecoverButton(false);
    }
  };

  // Função para descartar dados do cache
  const handleDiscardData = () => {
    clearPersonagemCache();
    setShowRecoverButton(false);
  };

  // Função para carregar personagem para edição
  const carregarPersonagemParaEdicao = async (id: number, racasData: Raca[]) => {
  try {
    await withLoading('dataLoading', async () => {
      // 1. Buscamos os dados salvos do personagem
      const personagemData = await api.getPersonagem(id);

      // 2. Precisamos da raça completa para calcular os bônus
      const racaDoPersonagem = racasData.find(r => getId(r) === personagemData.raca_id);

      // 3. Parse dos atributos livres salvos e guarda numa variável LOCAL
      let atributosLivresCarregados: string[] = [];
      if (personagemData.atributos_livres) {
        try {
          const parsed = typeof personagemData.atributos_livres === 'string'
            ? JSON.parse(personagemData.atributos_livres)
            : personagemData.atributos_livres;
          if (Array.isArray(parsed)) {
            atributosLivresCarregados = parsed;
          }
        } catch (e) { console.warn('⚠️ Erro ao parsear atributos livres:', e); }
      }

      // 4. LÓGICA DE CÁLCULO REVERSO (CORRIGIDA)
      let atributosBaseCalculados = {
        for: personagemData.for || 0, des: personagemData.des || 0,
        con: personagemData.con || 0, int: personagemData.int || 0,
        sab: personagemData.sab || 0, car: personagemData.car || 0,
      };

      if (racaDoPersonagem) {
        // Esta função auxiliar agora usa 'atributosLivresCarregados' diretamente
        const getBonusRacialParaAtributo = (atributo: string): number => {
          let bonus = 0;
          const temLivres = racaDoPersonagem.atributo_bonus_1?.toLowerCase() === 'livre';

          // CORREÇÃO CRÍTICA: Usar a variável local 'atributosLivresCarregados'
          // em vez do estado 'atributosLivresEscolhidos'
          if (temLivres && atributosLivresCarregados.includes(atributo.toUpperCase())) {
            bonus += 1;
          }

          if (racaDoPersonagem.atributo_bonus_1?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_1 || 0;
          if (racaDoPersonagem.atributo_bonus_2?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_2 || 0;
          if (racaDoPersonagem.atributo_bonus_3?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_3 || 0;
          if (racaDoPersonagem.atributo_penalidade?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_penalidade || 0;

          return bonus;
        };

        atributosBaseCalculados = {
          for: (personagemData.for || 0) - getBonusRacialParaAtributo('for'),
          des: (personagemData.des || 0) - getBonusRacialParaAtributo('des'),
          con: (personagemData.con || 0) - getBonusRacialParaAtributo('con'),
          int: (personagemData.int || 0) - getBonusRacialParaAtributo('int'),
          sab: (personagemData.sab || 0) - getBonusRacialParaAtributo('sab'),
          car: (personagemData.car || 0) - getBonusRacialParaAtributo('car'),
        };
      }

      // 5. ATUALIZAR TODOS OS ESTADOS DE UMA VEZ NO FINAL
      setPersonagem(personagemData);
      setAtributosLivresEscolhidos(atributosLivresCarregados);
      setBaseAtributos(atributosBaseCalculados);

      // Forçar atualização dos atributos livres após um pequeno delay para garantir que o componente renderize corretamente
      setTimeout(() => {
        setAtributosLivresEscolhidos([...atributosLivresCarregados]);
      }, 100);

      // Carregar habilidades imediatamente após carregar os dados do personagem
      console.log('🔄 Carregando habilidades para edição:', {
        raca_id: personagemData.raca_id,
        classe_id: personagemData.classe_id,
        origem_id: personagemData.origem_id,
        divindade_id: personagemData.divindade_id,
        nivel: personagemData.nivel
      });
      await carregarTodasHabilidades(personagemData);

      // Carregar o resto dos dados
      // Carregar escolhas raciais usando o novo endpoint
      try {
        const escolhasRaciais = await api.getPersonagemEscolhasRaca(id);
        if (escolhasRaciais.escolhas && Object.keys(escolhasRaciais.escolhas).length > 0) {
          setEscolhasRaca(escolhasRaciais.escolhas);
        } else {
          // Fallback para campo escolhas_raca se endpoint retornar vazio
          if (personagemData.escolhas_raca) {
            try {
              const escolhasParsed = JSON.parse(personagemData.escolhas_raca);
              setEscolhasRaca(escolhasParsed);
            } catch (e) {
              console.warn('⚠️ Erro ao parsear escolhas_raca do personagem:', e);
            }
          }
        }
      } catch (e) {
        console.warn("Não foi possível carregar escolhas raciais do endpoint, tentando fallback");
        // Fallback para campo escolhas_raca
        if (personagemData.escolhas_raca) {
          try {
            const escolhasParsed = JSON.parse(personagemData.escolhas_raca);
            setEscolhasRaca(escolhasParsed);
          } catch (e) {
            console.warn('⚠️ Erro ao parsear escolhas_raca do personagem:', e);
          }
        }
      }

      if (personagemData.pericias) {
        console.log('🔍 DEBUG - Perícias carregadas do backend:', personagemData.pericias);
        const periciasIds = personagemData.pericias.map(p => getId(p));
        console.log('🔍 DEBUG - IDs das perícias extraídos:', periciasIds);
        setPericiasEscolhidas(periciasIds);
      } else {
        console.log('⚠️ DEBUG - Nenhuma perícia encontrada no personagem carregado');
      }

      // Carregar poderes
      try {
        const poderesDivinos = await api.getPersonagemPoderesDivinos(id);
        if (poderesDivinos.poderes_ids) setPoderesDivinosSelecionados(poderesDivinos.poderes_ids);
      } catch (e) { console.warn("Não foi possível carregar poderes divinos"); }

      try {
        // Supondo que você criou esta nova função na sua API
        const beneficios = await api.getPersonagemBeneficiosOrigem(id);
        if (beneficios && (beneficios.pericias || beneficios.poderes)) {
            setBeneficiosOrigem({
                pericias: beneficios.pericias || [],
                poderes: beneficios.poderes || []
            });
        }
      } catch(e) { console.warn("Não foi possível carregar benefícios da origem"); }

    });
  } catch (error) {
    console.error('❌ Erro ao carregar personagem:', error);
    setErrors({ geral: "Erro ao carregar personagem para edição." });
  }
};


  const handleSubmit = async () => {
    const validacao = validarFormulario();
    if (!validacao) {
      return;
    }

    try {
      await withLoading('createPersonagem', async () => {
        // Validar campos obrigatórios
        if (!personagem.raca_id || !personagem.classe_id || !personagem.origem_id) {
          setErrors({ geral: "Raça, classe e origem são obrigatórias." });
          return;
        }

        // Preparar dados completos do personagem
        const personagemData = {
          ...personagem,
          raca_id: personagem.raca_id,
          classe_id: personagem.classe_id,
          origem_id: personagem.origem_id,
          divindade_id: personagem.divindade_id || null,
          // Dados de atributos livres
          atributosLivres: temAtributosLivres ? atributosLivresEscolhidos : [],
          // Escolhas raciais (incluindo versatilidade e lefou)
          escolhas_raca: Object.keys(escolhasRaca).length > 0 ? JSON.stringify(escolhasRaca) : "{}",
          // Perícias selecionadas
          pericias_selecionadas: periciasEscolhidas,
          // Poderes de classe selecionados
          poderes_classe: poderesClasseSelecionados,
          // Poderes divinos selecionados
          poderes_divinos: poderesDivinosSelecionados,
          // PV e PM calculados
          pv_total: calculateTotalPV(),
          pm_total: calculateTotalPM()
        };

        let resultPersonagem;
        if (isEditing && originalPersonagemId) {
          // Preparar estrutura correta para o backend (PersonagemRequest) - estrutura plana
          const updateData = {
            // Dados do personagem (estrutura plana como esperado pelo backend)
            nome: personagemData.nome,
            nivel: personagemData.nivel,
            for: personagemData.for,
            des: personagemData.des,
            con: personagemData.con,
            int: personagemData.int,
            sab: personagemData.sab,
            car: personagemData.car,
            raca_id: personagemData.raca_id,
            classe_id: personagemData.classe_id,
            origem_id: personagemData.origem_id,
            divindade_id: personagemData.divindade_id,
            escolhas_raca: Object.keys(escolhasRaca).length > 0 ? JSON.stringify(escolhasRaca) : "{}",
            // Dados complementares
            atributosLivres: temAtributosLivres ? atributosLivresEscolhidos : [],
            pericias_selecionadas: periciasEscolhidas,
            poderes_classe: poderesClasseSelecionados,
            poderes_divinos: poderesDivinosSelecionados,
            beneficios_origem_pericias: beneficiosOrigem.pericias,
            beneficios_origem_poderes: beneficiosOrigem.poderes
          };

          // Atualizar personagem existente
          resultPersonagem = await api.updatePersonagem(originalPersonagemId, updateData);
        } else {
          try {
            // Preparar dados para criação (estrutura correta para PersonagemRequest)
            const createData: any = {
              nome: personagemData.nome,
              nivel: personagemData.nivel || 1,
              for: personagemData.for,
              des: personagemData.des,
              con: personagemData.con,
              int: personagemData.int,
              sab: personagemData.sab,
              car: personagemData.car,
              raca_id: personagemData.raca_id,
              classe_id: personagemData.classe_id,
              origem_id: personagemData.origem_id,
              escolhas_raca: personagemData.escolhas_raca || "{}",
              atributosLivres: personagemData.atributosLivres || [],
              pericias_selecionadas: personagemData.pericias_selecionadas || [],
              poderes_classe: personagemData.poderes_classe || [],
              poderes_divinos: personagemData.poderes_divinos || [],
              beneficios_origem_pericias: beneficiosOrigem.pericias,
              beneficios_origem_poderes: beneficiosOrigem.poderes
            };

            // Só incluir divindade_id se realmente houver uma divindade selecionada
            if (personagemData.divindade_id && personagemData.divindade_id > 0) {
              createData.divindade_id = personagemData.divindade_id;
            }

            // Validação básica dos campos obrigatórios
            if (!createData.nome || createData.nome.trim() === '') {
              throw new Error('Nome é obrigatório');
            }
            if (!createData.raca_id || createData.raca_id === 0) {
              throw new Error('Raça é obrigatória');
            }
            if (!createData.classe_id || createData.classe_id === 0) {
              throw new Error('Classe é obrigatória');
            }
            if (!createData.origem_id || createData.origem_id === 0) {
              throw new Error('Origem é obrigatória');
            }

            console.log('📤 Dados enviados para API:', createData);
            resultPersonagem = await api.createPersonagem(createData as any);
          } catch (apiError) {
            console.error('❌ Erro na API createPersonagem:', apiError);
            throw apiError;
          }
        }

        // Salvar dados relacionados em paralelo
        const savePromises = [];

        // ✅ Perícias já são salvas durante a criação do personagem via campo pericias_selecionadas
        console.log('✅ Perícias incluídas na criação do personagem:', periciasEscolhidas);

        // Salvar poderes de classe se houver
        if (poderesClasseSelecionados.length > 0) {
          savePromises.push(
            api.savePersonagemPoderesClasse(resultPersonagem.id!, poderesClasseSelecionados)
              .then(() => console.log('✅ Poderes de classe salvos com sucesso'))
              .catch(error => {
                console.error('❌ Erro ao salvar poderes de classe:', error);
                console.error('❌ Dados enviados:', { poderes_ids: poderesClasseSelecionados });
              })
          );
        } else {
          console.log('⚠️ Nenhum poder de classe selecionado para salvar');
        }

        // Salvar poderes divinos se houver
        if (poderesDivinosSelecionados.length > 0) {
          savePromises.push(
            api.savePersonagemPoderesDivinos(resultPersonagem.id!, poderesDivinosSelecionados)
              .then(() => console.log('✅ Poderes divinos salvos com sucesso'))
              .catch(error => {
                console.error('❌ Erro ao salvar poderes divinos:', error);
                console.error('❌ Dados enviados:', { poderes_ids: poderesDivinosSelecionados });
              })
          );
        } else {
          console.log('⚠️ Nenhum poder divino selecionado para salvar');
        }

        // Salvar escolhas raciais especiais se houver
        if (Object.keys(escolhasRaca).length > 0) {
          savePromises.push(
            api.savePersonagemEscolhasRaca(resultPersonagem.id, escolhasRaca)
              .then(() => console.log('✅ Escolhas raciais salvas com sucesso'))
              .catch(error => console.error('❌ Erro ao salvar escolhas raciais:', error))
          );
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
      raca_id: undefined,
      classe_id: undefined,
      origem_id: undefined,
      divindade_id: undefined,
    });
    setAtributosLivresEscolhidos([]);
    setPericiasEscolhidas([]);
    setEscolhasRaca({});
    setPoderesDivinosSelecionados([]);
    setPoderesClasseSelecionados([]);
    setErrors({});
  };

  const handleAtributosLivresChange = (atributos: string[]) => {
    setAtributosLivresEscolhidos(atributos);
  };

  const handleEscolhasRacaChange = (escolhas: any) => {
    setEscolhasRaca(escolhas);

    // --- NOVA LÓGICA DE EXTRAÇÃO ---
    // 1. Inicia um array vazio para guardar os objetos de perícia encontrados.
    const periciasDeRacaEncontradas: Pericia[] = [];

    // 2. Procura de forma recursiva dentro do objeto de escolhas.
    const encontrarPericias = (obj: any) => {
        // Se encontrarmos um array chamado 'pericias', extraímos seus objetos.
        if (obj && Array.isArray(obj.pericias)) {
            obj.pericias.forEach((pericia: any) => {
                if (typeof pericia === 'object' && pericia.id) {
                    periciasDeRacaEncontradas.push(pericia);
                }
            });
        }
        // Se não, continua procurando nos sub-objetos.
        else if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(encontrarPericias);
        }
    };

    // 3. Inicia a busca.
    encontrarPericias(escolhas);
    // --- FIM DA NOVA LÓGICA ---

    // 4. Pega os IDs das perícias de raça da SELEÇÃO ANTERIOR (do estado atual).
    const idsDeRacaAnteriores = periciasDeRacaEscolhidas.map(p => p.id);

    // 5. Atualiza o estado que guarda os OBJETOS da perícia de raça.
    setPericiasDeRacaEscolhidas(periciasDeRacaEncontradas);

    // 6. Atualiza a lista MESTRA de todos os IDs de perícias.
    setPericiasEscolhidas(prev => {
        // Remove os IDs de raça antigos da lista mestra.
        const periciasSemAsDeRacaAntigas = prev.filter(id => !idsDeRacaAnteriores.includes(id));

        // Pega os IDs das novas perícias encontradas.
        const idsDeRacaNovas = periciasDeRacaEncontradas.map(p => p.id);

        // Retorna a lista mestra atualizada, sem duplicatas.
        return [...new Set([...periciasSemAsDeRacaAntigas, ...idsDeRacaNovas])];
    });
};

  const calculateTotalPV = (): number => {
    const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
    if (!classeEscolhida) return 0;

    const basePV = classeEscolhida.pvpornivel || 0;
    // 'personagem.con' já é o valor final (base + bônus), calculado pelo useEffect.
    const modConFinal = personagem.con || 0;

    return (basePV + modConFinal) * (personagem.nivel || 1);
  };

  const calculateTotalPM = (): number => {
    const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
    const basePM = classeEscolhida?.pmpornivel || 0;
    const resultado = (basePM) * (personagem.nivel || 1);

    return resultado;
  };




  // Funções para carregar habilidades da API
  const carregarHabilidadesRaca = async (racaId: number) => {
    try {
      console.log('🏃 Carregando habilidades da raça:', racaId);
      const habilidades = await api.getHabilidadesRaca(racaId);
      console.log('✅ Habilidades da raça carregadas:', habilidades);
      setHabilidadesRaca(habilidades);
    } catch (error) {
      console.error('❌ Erro ao carregar habilidades da raça:', error);
      setHabilidadesRaca([]);
    }
  };

  const carregarHabilidadesClasse = async (classeId: number, nivel: number) => {
    try {
      console.log('⚔️ Carregando habilidades da classe:', classeId, 'nível:', nivel);
      const habilidades = await api.getHabilidadesClasse(classeId, nivel);
      console.log('✅ Habilidades da classe carregadas:', habilidades);
      setHabilidadesClasse(habilidades);
    } catch (error) {
      console.error('❌ Erro ao carregar habilidades da classe:', error);
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
  const carregarTodasHabilidades = async (dadosPersonagem?: any) => {
    try {
      await withLoading('habilidades', async () => {
        const promises = [];

        // Usar dadosPersonagem se fornecido, senão usar o estado atual
        const dados = dadosPersonagem || personagem;

        if (dados.raca_id && dados.raca_id > 0) {
          promises.push(carregarHabilidadesRaca(dados.raca_id));
        }

        if (dados.classe_id && dados.classe_id > 0 && dados.nivel) {
          promises.push(carregarHabilidadesClasse(dados.classe_id, dados.nivel));
        }

        if (dados.origem_id && dados.origem_id > 0) {
          promises.push(carregarHabilidadesOrigem(dados.origem_id));
        }

        if (dados.divindade_id && dados.divindade_id > 0 && dados.nivel) {
          promises.push(carregarHabilidadesDivindade(dados.divindade_id, dados.nivel));
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
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
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
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
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
                    value={personagem.origem_id || ''}
                    onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        setPersonagem(prev => ({ ...prev, origem_id: value }));
                        setBeneficiosOrigem({ pericias: [], poderes: [] }); // Reseta a escolha ao trocar
                    }}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="">Selecione uma origem</option>
                    {origens.map(o => <option key={getId(o)} value={getId(o)}>{o.nome}</option>)}
                </select>
                {errors.origem_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.origem_id}</p>
                )}

                {personagem.origem_id && (
                <>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {origens.find(o => getId(o) === personagem.origem_id)?.descricao}
                  </div>

                  {/* COMPONENTE SELETOR */}
                    <SeletorBeneficiosOrigem
                        origemId={personagem.origem_id}
                        beneficiosAtuais={beneficiosOrigem}
                        onBeneficiosChange={setBeneficiosOrigem}
                        periciasDisponiveis={opcoesPericiasOrigem}
                        poderesDisponiveis={opcoesPoderesOrigem}
                        loading={isLoading('origemData')}
                    />
                </>
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
                    const valor = e.target.value ? parseInt(e.target.value) : undefined;
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
              atributos={baseAtributos}
              onChange={setBaseAtributos}
              racaSelecionada={racaSelecionada}
              atributosLivresEscolhidos={atributosLivresEscolhidos}
              onAtributosLivresChange={setAtributosLivresEscolhidos}
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
              periciasEscolhidas={periciasEscolhidas}
              onPericiasChange={setPericiasEscolhidas}
              periciasDeRacaObjetos={periciasDeRacaEscolhidasObjetos}
              periciasDeOrigemObjetos={periciasDeOrigemEscolhidasObjetos}
              isEditing={isEditing}
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

              {habilidadesOrigem.length > 0 && (
                <BeneficiosOrigemSelecionados
                    beneficiosAtuais={beneficiosOrigem}
                    periciasDisponiveis={opcoesPericiasOrigem}
                    poderesDisponiveis={opcoesPoderesOrigem}
                />
            )}

              {/* Poderes Divinos Selecionados */}
              {personagem.divindade_id && poderesDivinosSelecionados.length > 0 && (
                <PoderesDivinosSelecionados
                  divindadeId={personagem.divindade_id}
                  nivelPersonagem={personagem.nivel || 1}
                  poderesSelecionados={poderesDivinosSelecionados}
                />
              )}

              {/* Mensagem quando não há habilidades - só mostrar se não há NADA selecionado */}
              {(!personagem.raca_id || !personagem.classe_id) && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>Selecione raça e classe para ver as habilidades disponíveis.</p>
                  <p className="text-sm">As habilidades aparecerão automaticamente conforme você faz as seleções.</p>
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
            {/* <Link
              href="/exportar-pdf"
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              📄 Exportar PDF
            </Link> */}
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
