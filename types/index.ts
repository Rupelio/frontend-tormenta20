// types/index.ts

export interface Habilidade {
  id?: number;
  ID?: number;
  nome: string;
  descricao: string;
  nivel?: number;
  opcional?: boolean;
}

export interface Poder {
  id?: number;
  ID?: number;
  nome: string;
  descricao: string;
  tipo: string;
  requisitos: string;
}

export interface Pericia {
  id: number;
  nome: string;
  atributo: string;
  so_treinada: boolean;
  descricao: string;
}

export interface Divindade {
  id?: number;
  ID?: number;
  nome: string;
  dominio: string;
  alinhamento: string;
  descricao: string;
}

export interface Raca {
  id?: number;
  ID?: number;
  nome: string;
  tamanho: string;
  deslocamento: number;
  atributo_bonus_1?: string;
  valor_bonus_1?: number;
  atributo_bonus_2?: string;
  valor_bonus_2?: number;
  atributo_bonus_3?: string;
  valor_bonus_3?: number;
  atributo_penalidade?: string;
  valor_penalidade?: number;
}

export interface Classe {
  id?: number;
  ID?: number;
  nome: string;
  pvprimeironivelc?: number;
  pvpornivel: number;
  pmprimeironivelc?: number;
  pmpornivel: number;
  atributoprincipal: string;
  pericias_quantidade?: number;
  prof_armas_simples?: boolean;
  prof_armas_marciais?: boolean;
  prof_armaduras_leves?: boolean;
  prof_armaduras_pesadas?: boolean;
  prof_escudos?: boolean;
}

export interface OrigemItem {
  id?: number;
  origem_id?: number;
  nome: string;
  tipo: string;
  quantidade: number;
  descricao?: string;
}

export interface PersonagemItem {
  id?: number;
  personagem_id?: number;
  nome: string;
  tipo: string;
  quantidade: number;
  peso: number;
  valor: number;
  descricao: string;
}

export interface Origem {
  id?: number;
  ID?: number;
  nome: string;
  descricao: string;
  itens?: OrigemItem[];
}

export interface Personagem {
  id: number;
  nome: string;
  nivel: number;

  // Atributos base (0 a 4)
  for: number;
  des: number;
  con: number;
  int: number;
  sab: number;
  car: number;

  // Relações
  raca_id: number;
  raca?: Raca;
  classe_id: number;
  classe?: Classe;
  origem_id: number;
  origem?: Origem;
  divindade_id?: number;
  divindade?: Divindade;

  // Perícias do personagem
  pericias?: Pericia[];

  // Escolhas específicas de raça
  escolhas_raca?: string;

  // Atributos livres escolhidos (JSON) - para raças com atributos livres
  atributos_livres?: string;

  // Identificação do usuário/sessão
  user_session_id?: string;
  user_ip?: string;
  created_by_type?: 'session' | 'ip' | 'hybrid';

  // Campos extras
  dinheiro?: number;
  itens?: PersonagemItem[];
  anotacoes?: string;
  historico?: string;

  // Stats calculados
  pv_total?: number;
  pm_total?: number;
  defesa?: number;

  created_at?: string;
  updated_at?: string;
}

export interface Stats {
  pv_total: number;
  pm_total: number;
  defesa: number;
}
