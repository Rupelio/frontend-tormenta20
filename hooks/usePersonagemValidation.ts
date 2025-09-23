import { useState, useCallback } from 'react';
import { Personagem, Raca, Classe } from '@/types';

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationRules {
  personagem: Partial<Personagem>;
  racas: Raca[];
  classes: Classe[];
  atributosLivresEscolhidos: string[];
  periciasEscolhidas: number[];
  temAtributosLivres: boolean;
  getQuantidadeAtributosLivres: () => number;
  getCostForValue: (value: number) => number;
}

/**
 * Hook customizado para validação do formulário de personagem
 * Centraliza toda a lógica de validação e fornece feedback estruturado
 */
export function usePersonagemValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((fieldName: string, value: any, rules?: any): string | null => {
    switch (fieldName) {
      case 'nome':
        if (!value?.trim()) {
          return 'Nome é obrigatório';
        }
        if (value.length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        if (value.length > 50) {
          return 'Nome deve ter no máximo 50 caracteres';
        }
        return null;

      case 'nivel':
        if (!value || value < 1 || value > 20) {
          return 'Nível deve estar entre 1 e 20';
        }
        return null;

      case 'raca_id':
        if (!value) {
          return 'Selecione uma raça';
        }
        return null;

      case 'classe_id':
        if (!value) {
          return 'Selecione uma classe';
        }
        return null;

      case 'origem_id':
        if (!value) {
          return 'Selecione uma origem';
        }
        return null;

      default:
        return null;
    }
  }, []);

  const validateAtributos = useCallback((personagem: Partial<Personagem>, getCostForValue: (value: number) => number): string | null => {
    const atributos = ["for", "des", "con", "int", "sab", "car"] as const;

    // Verificar se todos os atributos estão no range válido
    if (atributos.some(attr => {
      const valor = personagem[attr];
      return valor === undefined || valor < -1 || valor > 4;
    })) {
      return "Todos os atributos devem estar entre -1 e 4";
    }

    // Verificar distribuição de pontos
    const totalCost = atributos.reduce((sum, attr) => {
      const value = personagem[attr] || 0;
      return sum + getCostForValue(value);
    }, 0);

    if (totalCost !== 10) {
      return `Você deve usar exatamente 10 pontos. Atualmente usando ${totalCost}`;
    }

    return null;
  }, []);

  const validateAtributosLivres = useCallback((
    temAtributosLivres: boolean,
    atributosLivresEscolhidos: string[],
    getQuantidadeAtributosLivres: () => number
  ): string | null => {
    if (temAtributosLivres) {
      const quantidadeNecessaria = getQuantidadeAtributosLivres();
      if (atributosLivresEscolhidos.length !== quantidadeNecessaria) {
        return `Você deve escolher exatamente ${quantidadeNecessaria} atributos para receber bônus racial.`;
      }
    }
    return null;
  }, []);

  const validatePericias = useCallback((
    personagem: Partial<Personagem>,
    classes: Classe[],
    periciasEscolhidas: number[]
  ): string | null => {
    if (personagem.classe_id && personagem.classe_id !== 0) {
      const classeSelecionada = classes.find(c => (c.ID || c.id) === personagem.classe_id);
      if (classeSelecionada) {
        const periciasQuantidade = (classeSelecionada as any).pericias_quantidade || 2;
        if (periciasEscolhidas.length !== periciasQuantidade) {
          return `Escolha exatamente ${periciasQuantidade} perícias para ${classeSelecionada.nome}`;
        }
      }
    }
    return null;
  }, []);

  const validateForm = useCallback((rules: ValidationRules): boolean => {
    setIsValidating(true);
    const newErrors: ValidationErrors = {};

    try {
      // Validar campos básicos
      const nomeError = validateField('nome', rules.personagem.nome);
      if (nomeError) newErrors.nome = nomeError;

      const nivelError = validateField('nivel', rules.personagem.nivel);
      if (nivelError) newErrors.nivel = nivelError;

      const racaError = validateField('raca_id', rules.personagem.raca_id);
      if (racaError) newErrors.raca_id = racaError;

      const classeError = validateField('classe_id', rules.personagem.classe_id);
      if (classeError) newErrors.classe_id = classeError;

      const origemError = validateField('origem_id', rules.personagem.origem_id);
      if (origemError) newErrors.origem_id = origemError;

      // Validar atributos
      const atributosError = validateAtributos(rules.personagem, rules.getCostForValue);
      if (atributosError) newErrors.atributos = atributosError;

      // Validar atributos livres
      const atributosLivresError = validateAtributosLivres(
        rules.temAtributosLivres,
        rules.atributosLivresEscolhidos,
        rules.getQuantidadeAtributosLivres
      );
      if (atributosLivresError) newErrors.atributosLivres = atributosLivresError;

      // Validar perícias
      const periciasError = validatePericias(rules.personagem, rules.classes, rules.periciasEscolhidas);
      if (periciasError) newErrors.pericias = periciasError;

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Erro durante validação:', error);
      setErrors({ geral: 'Erro interno durante validação' });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [validateField, validateAtributos, validateAtributosLivres, validatePericias]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError,
    setErrors
  };
}
