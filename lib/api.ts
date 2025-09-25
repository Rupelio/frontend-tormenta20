// lib/api.ts

import { Raca, Classe, Origem, Divindade, Personagem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Chave para salvar o ID no localStorage
const SESSION_STORAGE_KEY = 'user_session_id';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Pega o ID de sessão do localStorage
    const sessionId = typeof window !== 'undefined' ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null;

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      // Espalha os headers existentes das opções, se houver
      ...(options?.headers as { [key: string]: string }),
    };

    // Adiciona o cabeçalho com o ID de sessão, se existir
    if (sessionId) {
      headers['X-User-Session-ID'] = sessionId;
    }

    try {
      const response = await fetch(url, {
        credentials: 'include', // Continua incluindo cookies
        headers: headers, // Usa os novos cabeçalhos
        ...options,
      });

      // ✅ Lógica para salvar/atualizar o ID de sessão no localStorage
      const responseSessionId = response.headers.get('X-User-Session-ID');
      if (responseSessionId && typeof window !== 'undefined') {
        window.localStorage.setItem(SESSION_STORAGE_KEY, responseSessionId);
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw error;
    }
  }

  // ... (o resto dos seus métodos: getRacas, getClasses, etc., permanecem iguais)
  // Raças
  async getRacas(): Promise<Raca[]> {
    return this.request<Raca[]>('/api/v1/racas');
  }

  async getRaca(id: number): Promise<Raca> {
    return this.request<Raca>(`/api/v1/racas/${id}`);
  }

  // Classes
  async getClasses(): Promise<Classe[]> {
    return this.request<Classe[]>('/api/v1/classes');
  }

  async getClasse(id: number): Promise<Classe> {
    return this.request<Classe>(`/api/v1/classes/${id}`);
  }

  // Origens
  async getOrigens(): Promise<Origem[]> {
    return this.request<Origem[]>('/api/v1/origens');
  }

  async getOrigem(id: number): Promise<Origem> {
    return this.request<Origem>(`/api/v1/origens/${id}`);
  }

  // Divindades
  async getDivindades(): Promise<Divindade[]> {
    return this.request<Divindade[]>('/api/v1/divindades');
  }

  async getDivindade(id: number): Promise<Divindade> {
    return this.request<Divindade>(`/api/v1/divindades/${id}`);
  }

  // Personagens
  async getPersonagens(): Promise<Personagem[]> {
    return this.request<Personagem[]>('/api/v1/personagens');
  }

  async createPersonagem(personagem: Omit<Personagem, 'id'>): Promise<Personagem> {
    return this.request<Personagem>('/api/v1/personagens', {
      method: 'POST',
      body: JSON.stringify(personagem),
    });
  }

  async getPersonagem(id: number): Promise<Personagem> {
    return this.request<Personagem>(`/api/v1/personagens/${id}`);
  }

  async updatePersonagem(id: number, data: any): Promise<Personagem> {
    return this.request<Personagem>(`/api/v1/personagens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePersonagem(id: number): Promise<void> {
    return this.request<void>(`/api/v1/personagens/${id}`, {
      method: 'DELETE',
    });
  }

  // Salvar perícias do personagem
  // ✅ Perícias são salvas automaticamente através dos campos pericias_selecionadas nos métodos Create/Update do personagem

  // Buscar perícias selecionadas do personagem (caso necessário no futuro)
  async getPersonagemPericias(personagemId: number): Promise<{personagem_id: number, pericias_ids: number[]}> {
    // Nota: Este endpoint não existe ainda, perícias são carregadas junto com o personagem
    return this.request<{personagem_id: number, pericias_ids: number[]}>(`/api/v1/personagens/${personagemId}/pericias`);
  }

  // Salvar poderes divinos do personagem
  async savePersonagemPoderesDivinos(personagemId: number, poderesIds: number[]): Promise<any> {
    return this.request<any>(`/api/v1/personagens/${personagemId}/poderes-divinos`, {
      method: 'POST',
      body: JSON.stringify({ poderes_ids: poderesIds }),
    });
  }

  // Salvar poderes de classe do personagem
  async savePersonagemPoderesClasse(personagemId: number, poderesIds: number[]): Promise<any> {
    return this.request<any>(`/api/v1/personagens/${personagemId}/poderes-classe`, {
      method: 'POST',
      body: JSON.stringify({ poderes_ids: poderesIds }),
    });
  }

  // Buscar poderes divinos selecionados do personagem
  async getPersonagemPoderesDivinos(personagemId: number): Promise<{personagem_id: number, poderes_ids: number[]}> {
    return this.request<{personagem_id: number, poderes_ids: number[]}>(`/api/v1/personagens/${personagemId}/poderes-divinos`);
  }

  // Buscar poderes de classe selecionados do personagem
  async getPersonagemPoderesClasse(personagemId: number): Promise<{personagem_id: number, poderes_ids: number[]}> {
    return this.request<{personagem_id: number, poderes_ids: number[]}>(`/api/v1/personagens/${personagemId}/poderes-classe`);
  }

  // Salvar escolhas raciais do personagem
  async savePersonagemEscolhasRaca(personagemId: number, escolhas: any): Promise<any> {
    return this.request<any>(`/api/v1/personagens/${personagemId}/escolhas-raca`, {
      method: 'POST',
      body: JSON.stringify({ escolhas }),
    });
  }

  // Buscar escolhas raciais do personagem
  async getPersonagemEscolhasRaca(personagemId: number): Promise<{personagem_id: number, escolhas: any}> {
    return this.request<{personagem_id: number, escolhas: any}>(`/api/v1/personagens/${personagemId}/escolhas-raca`);
  }

  // Buscar perícias por origem
  async getPericiasOrigem(origemId: number): Promise<any> {
    return this.request<any>(`/api/v1/origens/${origemId}/pericias`);
  }

  // Buscar perícias por classe
  async getPericiasClasse(classeId: number): Promise<any> {
    return this.request<any>(`/api/v1/classes/${classeId}/pericias`);
  }

  // Buscar habilidades por raça
  async getHabilidadesRaca(racaId: number): Promise<any> {
    return this.request<any>(`/api/v1/habilidades/raca/${racaId}`);
  }

  // Buscar habilidades por classe e nível
  async getHabilidadesClasse(classeId: number, nivel: number): Promise<any> {
    return this.request<any>(`/api/v1/habilidades/classe/${classeId}/nivel/${nivel}`);
  }

  // Buscar habilidades por origem
  async getHabilidadesOrigem(origemId: number): Promise<any> {
    return this.request<any>(`/api/v1/habilidades/origem/${origemId}`);
  }
  async getPoderesOrigem(origemId: number): Promise<any> {
    return this.request<any>(`/api/v1/poderes/origem/${origemId}`);
  }

  // Buscar habilidades por divindade e nível
  async getHabilidadesDivindade(divindadeId: number, nivel: number): Promise<any> {
    return this.request<any>(`/api/v1/habilidades/divindade/${divindadeId}/nivel/${nivel}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  async getPersonagemBeneficiosOrigem(id: number): Promise<{ pericias: number[], poderes: number[] }> {
    try {
      const response = await this.request<{ pericias: number[], poderes: number[] }>(`/api/v1/personagens/${id}/beneficios-origem`);
      // A função request já retorna o JSON parseado, então podemos usar diretamente.
      return response || { pericias: [], poderes: [] };
    } catch (error) {
      console.error('Erro ao buscar benefícios de origem do personagem:', error);
      return { pericias: [], poderes: [] };
    }
  }
}


export const api = new ApiService();
