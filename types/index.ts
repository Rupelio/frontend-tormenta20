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
  pvpornivel: number;
  pmpornivel: number;
  atributoprincipal: string;
}

export interface Origem {
  id?: number;
  ID?: number;
  nome: string;
  descricao: string;
}

export interface Personagem {
  id?: number;
  nome: string;
  nivel: number;
  for: number;
  des: number;
  con: number;
  int: number;
  sab: number;
  car: number;
  raca_id: number | null;
  classe_id: number | null;
  origem_id: number | null;
  divindade_id?: number | null;
  raca?: Raca;
  classe?: Classe;
  origem?: Origem;
  divindade?: Divindade;
  pontos_vida?: number;
  pontos_mana?: number;
  defesa?: number;
  escolhas_raca?: string;
  pericias?: Pericia[];
}

export interface Stats {
  pv_total: number;
  pm_total: number;
  defesa: number;
}
