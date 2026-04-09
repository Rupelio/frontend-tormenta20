"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Personagem, Raca, Classe, Origem, Divindade, Habilidade, Pericia, Poder } from "@/types";
import { api } from "@/lib/api";
import { usePersonagemCache } from "@/hooks/useLocalStorage";
import { useLoadingStates } from "@/hooks/useLoading";
import StepBasicInfo from "./StepBasicInfo";
import StepRace from "./StepRace";
import StepClass from "./StepClass";
import StepAttributes from "./StepAttributes";
import StepOriginDeity from "./StepOriginDeity";
import StepSkills from "./StepSkills";
import StepExtras from "./StepExtras";
import StepReview from "./StepReview";

const getId = (item: any) => item?.ID || item?.id || 0;

const STEPS = [
  { key: "basico", label: "Basico" },
  { key: "raca", label: "Raca" },
  { key: "classe", label: "Classe" },
  { key: "atributos", label: "Atributos" },
  { key: "origem", label: "Origem" },
  { key: "pericias", label: "Pericias" },
  { key: "extras", label: "Extras" },
  { key: "revisao", label: "Revisao" },
];

interface WizardContainerProps {
  editId?: string | null;
}

export default function WizardContainer({ editId }: WizardContainerProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);

  const { savePersonagemCache, clearPersonagemCache, cachedPersonagem, hasCachedData } = usePersonagemCache();
  const { setLoading, isLoading, withLoading } = useLoadingStates();

  // State do personagem
  const [personagem, setPersonagem] = useState<Partial<Personagem>>({
    nome: "", nivel: 1,
    for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0,
    raca_id: undefined, classe_id: undefined, origem_id: undefined, divindade_id: undefined,
    dinheiro: 0, anotacoes: "", historico: "",
  });
  const [baseAtributos, setBaseAtributos] = useState({ for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 });

  // Dados do sistema
  const [racas, setRacas] = useState<Raca[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [divindades, setDivindades] = useState<Divindade[]>([]);

  // Habilidades
  const [habilidadesRaca, setHabilidadesRaca] = useState<Habilidade[]>([]);
  const [habilidadesClasse, setHabilidadesClasse] = useState<Habilidade[]>([]);
  const [habilidadesOrigem, setHabilidadesOrigem] = useState<Habilidade[]>([]);
  const [habilidadesDivindade, setHabilidadesDivindade] = useState<Habilidade[]>([]);

  // Selecoes do usuario
  const [periciasEscolhidas, setPericiasEscolhidas] = useState<number[]>([]);
  const [poderesClasseSelecionados, setPoderesClasseSelecionados] = useState<number[]>([]);
  const [poderesDivinosSelecionados, setPoderesDivinosSelecionados] = useState<number[]>([]);
  const [atributosLivresEscolhidos, setAtributosLivresEscolhidos] = useState<string[]>([]);
  const [escolhasRaca, setEscolhasRaca] = useState<any>({});
  const [beneficiosOrigem, setBeneficiosOrigem] = useState<{ pericias: number[], poderes: number[] }>({ pericias: [], poderes: [] });

  // Edicao
  const [isEditing, setIsEditing] = useState(false);
  const [originalPersonagemId, setOriginalPersonagemId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cache de pericias por fonte
  const [periciasClasse, setPericiasClasse] = useState<Pericia[]>([]);
  const [periciasAutomaticas, setPericiasAutomaticas] = useState<Pericia[]>([]);

  // Derivados
  const racaSelecionada = racas.find(r => getId(r) === personagem.raca_id);
  const classeEscolhida = classes.find(c => getId(c) === personagem.classe_id);
  const temAtributosLivres = racaSelecionada && (
    racaSelecionada.atributo_bonus_1?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_2?.toLowerCase() === 'livre' ||
    racaSelecionada.atributo_bonus_3?.toLowerCase() === 'livre'
  );

  // useEffect: calcular atributos finais quando base/raca mudam
  useEffect(() => {
    const { for: baseFor, des: baseDes, con: baseCon, int: baseInt, sab: baseSab, car: baseCar } = baseAtributos;
    const bonus = { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 };

    if (racaSelecionada) {
      const aplicarBonus = (attr: keyof typeof bonus, bonusValue: number) => { bonus[attr] += bonusValue; };

      if (temAtributosLivres) {
        atributosLivresEscolhidos.forEach(attr => {
          const key = attr.toLowerCase() as keyof typeof bonus;
          if (bonus.hasOwnProperty(key)) aplicarBonus(key, 1);
        });
      }

      if (racaSelecionada.atributo_bonus_1 && racaSelecionada.valor_bonus_1) aplicarBonus(racaSelecionada.atributo_bonus_1.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_1);
      if (racaSelecionada.atributo_bonus_2 && racaSelecionada.valor_bonus_2) aplicarBonus(racaSelecionada.atributo_bonus_2.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_2);
      if (racaSelecionada.atributo_bonus_3 && racaSelecionada.valor_bonus_3) aplicarBonus(racaSelecionada.atributo_bonus_3.toLowerCase() as keyof typeof bonus, racaSelecionada.valor_bonus_3);

      if (racaSelecionada.atributo_penalidade && racaSelecionada.valor_penalidade) {
        const penalidadeKey = racaSelecionada.atributo_penalidade.toLowerCase() as keyof typeof bonus;
        bonus[penalidadeKey] += racaSelecionada.valor_penalidade;
      }
    }

    setPersonagem(prev => ({
      ...prev,
      for: baseFor + bonus.for, des: baseDes + bonus.des, con: baseCon + bonus.con,
      int: baseInt + bonus.int, sab: baseSab + bonus.sab, car: baseCar + bonus.car,
    }));
  }, [baseAtributos, racaSelecionada, atributosLivresEscolhidos]);

  // Carregar dados iniciais
  useEffect(() => {
    setMounted(true);
    const carregarDados = async () => {
      try {
        await withLoading('dataLoading', async () => {
          const [racasData, classesData, origensData, divindadesData] = await Promise.all([
            api.getRacas(), api.getClasses(), api.getOrigens(), api.getDivindades()
          ]);
          setRacas(racasData); setClasses(classesData); setOrigens(origensData); setDivindades(divindadesData);

          if (editId) {
            setIsEditing(true);
            setOriginalPersonagemId(parseInt(editId));
            await carregarPersonagemParaEdicao(parseInt(editId), racasData);
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErrors({ geral: "Erro ao carregar dados do sistema." });
      }
    };
    carregarDados();
  }, []);

  // Carregar habilidades quando selecoes mudam
  useEffect(() => {
    if (!mounted) return;
    const carregarHabilidades = async () => {
      if (personagem.raca_id) {
        try {
          const hab = await api.getHabilidadesRaca(personagem.raca_id);
          setHabilidadesRaca(Array.isArray(hab) ? hab : []);
        } catch { setHabilidadesRaca([]); }
      }
      if (personagem.classe_id) {
        try {
          const hab = await api.getHabilidadesClasse(personagem.classe_id, personagem.nivel || 1);
          setHabilidadesClasse(Array.isArray(hab) ? hab : []);
          const pericias = await api.getPericiasClasse(personagem.classe_id);
          if (pericias) {
            setPericiasClasse(pericias.disponiveis || []);
            setPericiasAutomaticas(pericias.automaticas || []);
          }
        } catch { setHabilidadesClasse([]); }
      }
      if (personagem.origem_id) {
        try {
          const hab = await api.getHabilidadesOrigem(personagem.origem_id);
          setHabilidadesOrigem(Array.isArray(hab) ? hab : []);
        } catch { setHabilidadesOrigem([]); }
      }
      if (personagem.divindade_id) {
        try {
          const hab = await api.getHabilidadesDivindade(personagem.divindade_id, personagem.nivel || 1);
          setHabilidadesDivindade(Array.isArray(hab) ? hab : []);
        } catch { setHabilidadesDivindade([]); }
      }
    };
    carregarHabilidades();
  }, [mounted, personagem.raca_id, personagem.classe_id, personagem.origem_id, personagem.divindade_id, personagem.nivel]);

  // Carregar personagem para edicao
  const carregarPersonagemParaEdicao = async (id: number, racasData: Raca[]) => {
    const personagemData = await api.getPersonagem(id);
    const racaDoPersonagem = racasData.find(r => getId(r) === personagemData.raca_id);

    let atributosLivresCarregados: string[] = [];
    if (personagemData.atributos_livres) {
      try {
        const parsed = typeof personagemData.atributos_livres === 'string'
          ? JSON.parse(personagemData.atributos_livres) : personagemData.atributos_livres;
        if (Array.isArray(parsed)) atributosLivresCarregados = parsed;
      } catch {}
    }

    let atributosBaseCalculados = {
      for: personagemData.for || 0, des: personagemData.des || 0,
      con: personagemData.con || 0, int: personagemData.int || 0,
      sab: personagemData.sab || 0, car: personagemData.car || 0,
    };

    if (racaDoPersonagem) {
      const getBonusParaAtributo = (atributo: string): number => {
        let bonus = 0;
        const temLivres = racaDoPersonagem.atributo_bonus_1?.toLowerCase() === 'livre';
        if (temLivres && atributosLivresCarregados.includes(atributo.toUpperCase())) bonus += 1;
        if (racaDoPersonagem.atributo_bonus_1?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_1 || 0;
        if (racaDoPersonagem.atributo_bonus_2?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_2 || 0;
        if (racaDoPersonagem.atributo_bonus_3?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_bonus_3 || 0;
        if (racaDoPersonagem.atributo_penalidade?.toLowerCase() === atributo) bonus += racaDoPersonagem.valor_penalidade || 0;
        return bonus;
      };

      atributosBaseCalculados = {
        for: (personagemData.for || 0) - getBonusParaAtributo('for'),
        des: (personagemData.des || 0) - getBonusParaAtributo('des'),
        con: (personagemData.con || 0) - getBonusParaAtributo('con'),
        int: (personagemData.int || 0) - getBonusParaAtributo('int'),
        sab: (personagemData.sab || 0) - getBonusParaAtributo('sab'),
        car: (personagemData.car || 0) - getBonusParaAtributo('car'),
      };
    }

    setPersonagem(personagemData);
    setAtributosLivresEscolhidos(atributosLivresCarregados);
    setBaseAtributos(atributosBaseCalculados);

    if (personagemData.pericias) {
      setPericiasEscolhidas(personagemData.pericias.map((p: any) => getId(p)));
    }

    try { const pd = await api.getPersonagemPoderesDivinos(id); if (pd.poderes_ids) setPoderesDivinosSelecionados(pd.poderes_ids); } catch {}
    try { const pc = await api.getPersonagemPoderesClasse(id); if (pc.poderes_ids) setPoderesClasseSelecionados(pc.poderes_ids); } catch {}
    try { const b = await api.getPersonagemBeneficiosOrigem(id); if (b) setBeneficiosOrigem({ pericias: b.pericias || [], poderes: b.poderes || [] }); } catch {}

    try {
      const escolhas = await api.getPersonagemEscolhasRaca(id);
      if (escolhas.escolhas && Object.keys(escolhas.escolhas).length > 0) setEscolhasRaca(escolhas.escolhas);
      else if (personagemData.escolhas_raca) {
        try { setEscolhasRaca(JSON.parse(personagemData.escolhas_raca)); } catch {}
      }
    } catch {
      if (personagemData.escolhas_raca) {
        try { setEscolhasRaca(JSON.parse(personagemData.escolhas_raca)); } catch {}
      }
    }
  };

  // Calculos
  const calculateTotalPV = (): number => {
    if (!classeEscolhida) return 0;
    const pvPrimeiroNivel = classeEscolhida.pvprimeironivelc || classeEscolhida.pvpornivel || 0;
    const pvPorNivel = classeEscolhida.pvpornivel || 0;
    const modCon = personagem.con || 0;
    const nivel = personagem.nivel || 1;
    let total = pvPrimeiroNivel + modCon;
    if (nivel > 1) total += (pvPorNivel + modCon) * (nivel - 1);
    return Math.max(1, total);
  };

  const calculateTotalPM = (): number => {
    if (!classeEscolhida) return 0;
    const pmPrimeiroNivel = classeEscolhida.pmprimeironivelc || classeEscolhida.pmpornivel || 0;
    const pmPorNivel = classeEscolhida.pmpornivel || 0;
    const nivel = personagem.nivel || 1;
    let total = pmPrimeiroNivel;
    if (nivel > 1) total += pmPorNivel * (nivel - 1);
    return Math.max(0, total);
  };

  // Submit
  const handleSubmit = async () => {
    if (!personagem.nome || !personagem.raca_id || !personagem.classe_id || !personagem.origem_id) {
      setErrors({ geral: "Preencha nome, raca, classe e origem." });
      return;
    }

    try {
      await withLoading('createPersonagem', async () => {
        const data: any = {
          nome: personagem.nome, nivel: personagem.nivel || 1,
          for: personagem.for, des: personagem.des, con: personagem.con,
          int: personagem.int, sab: personagem.sab, car: personagem.car,
          raca_id: personagem.raca_id, classe_id: personagem.classe_id,
          origem_id: personagem.origem_id,
          divindade_id: personagem.divindade_id || null,
          escolhas_raca: Object.keys(escolhasRaca).length > 0 ? JSON.stringify(escolhasRaca) : "{}",
          atributosLivres: temAtributosLivres ? atributosLivresEscolhidos : [],
          pericias_selecionadas: periciasEscolhidas,
          poderes_classe: poderesClasseSelecionados,
          poderes_divinos: poderesDivinosSelecionados,
          beneficios_origem_pericias: beneficiosOrigem.pericias,
          beneficios_origem_poderes: beneficiosOrigem.poderes,
          dinheiro: personagem.dinheiro || 0,
          anotacoes: personagem.anotacoes || '',
          historico: personagem.historico || '',
          itens: personagem.itens || [],
        };

        let result;
        if (isEditing && originalPersonagemId) {
          result = await api.updatePersonagem(originalPersonagemId, data);
        } else {
          result = await api.createPersonagem(data);
        }

        // Salvar poderes separadamente
        const pId = result?.id || originalPersonagemId;
        if (pId) {
          if (poderesClasseSelecionados.length > 0) {
            try { await api.savePersonagemPoderesClasse(pId, poderesClasseSelecionados); } catch {}
          }
          if (poderesDivinosSelecionados.length > 0) {
            try { await api.savePersonagemPoderesDivinos(pId, poderesDivinosSelecionados); } catch {}
          }
          if (Object.keys(escolhasRaca).length > 0) {
            try { await api.savePersonagemEscolhasRaca(pId, escolhasRaca); } catch {}
          }
        }

        clearPersonagemCache();
        router.push('/');
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ geral: "Erro ao salvar personagem. Tente novamente." });
    }
  };

  // Navegacao
  const goNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const goToStep = (step: number) => { setCurrentStep(step); };

  // Validacao por step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return !!(personagem.nome && personagem.nome.length >= 2);
      case 1: return !!personagem.raca_id;
      case 2: return !!personagem.classe_id;
      default: return true;
    }
  };

  if (isLoading('dataLoading')) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Props compartilhados
  const sharedProps = {
    personagem, setPersonagem, racas, classes, origens, divindades,
    baseAtributos, setBaseAtributos, racaSelecionada, classeEscolhida,
    atributosLivresEscolhidos, setAtributosLivresEscolhidos,
    escolhasRaca, setEscolhasRaca,
    periciasEscolhidas, setPericiasEscolhidas,
    poderesClasseSelecionados, setPoderesClasseSelecionados,
    poderesDivinosSelecionados, setPoderesDivinosSelecionados,
    beneficiosOrigem, setBeneficiosOrigem,
    habilidadesRaca, habilidadesClasse, habilidadesOrigem, habilidadesDivindade,
    periciasClasse, periciasAutomaticas,
    temAtributosLivres, isEditing, errors, setErrors,
    calculateTotalPV, calculateTotalPM, getId,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Barra de progresso */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          {STEPS.map((step, i) => (
            <button
              key={step.key}
              onClick={() => goToStep(i)}
              className={`flex-1 min-w-[80px] py-2 px-1 text-xs font-medium border-b-2 transition-colors ${
                i === currentStep
                  ? 'border-red-600 text-red-700 bg-red-50'
                  : i < currentStep
                    ? 'border-green-500 text-green-700'
                    : 'border-gray-200 text-gray-400'
              }`}
            >
              <span className="block text-lg">{i < currentStep ? '\u2713' : i + 1}</span>
              <span className="block mt-0.5">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Erros */}
      {errors.geral && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.geral}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-h-[400px]">
        {currentStep === 0 && <StepBasicInfo {...sharedProps} />}
        {currentStep === 1 && <StepRace {...sharedProps} />}
        {currentStep === 2 && <StepClass {...sharedProps} />}
        {currentStep === 3 && <StepAttributes {...sharedProps} />}
        {currentStep === 4 && <StepOriginDeity {...sharedProps} />}
        {currentStep === 5 && <StepSkills {...sharedProps} />}
        {currentStep === 6 && <StepExtras {...sharedProps} />}
        {currentStep === 7 && <StepReview {...sharedProps} handleSubmit={handleSubmit} isSubmitting={isLoading('createPersonagem')} />}
      </div>

      {/* Navegacao */}
      <div className="flex justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {/* Preview compacto */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
          {personagem.nome && <span className="font-medium text-gray-700">{personagem.nome}</span>}
          {racaSelecionada && <span>{racaSelecionada.nome}</span>}
          {classeEscolhida && <span>{classeEscolhida.nome}</span>}
          {personagem.classe_id && (
            <span className="text-red-600 font-bold">PV:{calculateTotalPV()}</span>
          )}
        </div>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-700 text-white hover:bg-red-800"
          >
            Proximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading('createPersonagem')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-700 text-white hover:bg-red-800 disabled:bg-gray-400"
          >
            {isLoading('createPersonagem') ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Personagem'}
          </button>
        )}
      </div>
    </div>
  );
}
