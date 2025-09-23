import { useState, useEffect } from 'react';
import React from 'react';

/**
 * Hook customizado para gerenciar dados no localStorage
 * Automaticamente sincroniza com o localStorage e fornece funcionalidades de cache
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para definir valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir valor ser uma função para que tenhamos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Salvar no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  // Função para remover item
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

interface PersonagemCacheData {
  personagem: any;
  atributosLivresEscolhidos: string[];
  escolhasRaca: any;
  periciasEscolhidas: number[];
  poderesClasseSelecionados: number[];
  poderesDivinosSelecionados: number[];
  timestamp: number;
  version: string;
}

/**
 * Hook especializado para cache de personagem em criação
 */
export function usePersonagemCache() {
  const [cachedPersonagem, setCachedPersonagem, removeCachedPersonagem] = useLocalStorage<PersonagemCacheData | null>('tormenta20_personagem_draft', null);

  // Auto-save com debounce - usando useRef para evitar re-renders
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const savePersonagemCache = React.useCallback((personagemData: any) => {
    // Clear timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Criar novo timeout para salvar após 1 segundo de inatividade
    saveTimeoutRef.current = setTimeout(() => {
      const dataToSave = {
        ...personagemData,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Salvar diretamente no localStorage sem causar re-render
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem('tormenta20_personagem_draft', JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Erro ao salvar cache:', error);
        }
      }
    }, 1000);
  }, []);

  const clearPersonagemCache = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    removeCachedPersonagem();
  }, [removeCachedPersonagem]);

  // Verificar se há cache válido
  const hasCachedData = React.useCallback(() => {
    if (!cachedPersonagem) return false;

    // Verificar se o cache não é muito antigo (24 horas)
    const cacheAge = Date.now() - (cachedPersonagem.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas em ms

    return cacheAge < maxAge;
  }, [cachedPersonagem]);

  return {
    cachedPersonagem,
    savePersonagemCache,
    clearPersonagemCache,
    hasCachedData
  };
}
