// lib/api.ts
import { Raca, Classe, Origem, Divindade, Personagem } from '../../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw error;
    }
  }

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
  async createPersonagem(personagem: Omit<Personagem, 'id'>): Promise<Personagem> {
    return this.request<Personagem>('/api/v1/personagens', {
      method: 'POST',
      body: JSON.stringify(personagem),
    });
  }

  async getPersonagem(id: number): Promise<Personagem> {
    return this.request<Personagem>(`/api/v1/personagens/${id}`);
  }

  async updatePersonagem(id: number, personagem: Partial<Personagem>): Promise<Personagem> {
    return this.request<Personagem>(`/api/v1/personagens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personagem),
    });
  }

  async deletePersonagem(id: number): Promise<void> {
    return this.request<void>(`/api/v1/personagens/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const api = new ApiService();
