import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

/**
 * Hook customizado para gerenciar múltiplos estados de loading
 * Permite controlar diferentes operações assíncronas simultaneamente
 */
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string): boolean => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setLoadingStates({});
    }
  }, []);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    clearLoading,
    withLoading,
    loadingStates
  };
}

/**
 * Hook simples para um único estado de loading
 */
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    withLoading
  };
}
