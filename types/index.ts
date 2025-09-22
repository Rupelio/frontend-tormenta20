// types/index.ts
export interface Raca {
  id: number;
  nome: string;
  atributo_bonus_1: string;
  valor_bonus_1: number;
  atributo_bonus_2: string;
  valor_bonus_2: number;
  tamanho: string;
  deslocamento: number;
  habilidades: HabilidadeRaca[];
}

export interface Classe {
  id: number;
  nome: string;
  pv_por_nivel: number;
  pm_por_nivel: number;
  atributo_principal: string;
  habilidades: HabilidadeClasse[];
}

export interface Origem {
  id: number;
  nome: string;
  descricao: string;
}

export interface HabilidadeRaca {
  id: number;
  raca_id: number;
  nome: string;
  descricao: string;
}

export interface HabilidadeClasse {
  id: number;
  classe_id: number;
  nome: string;
  descricao: string;
}

export interface Personagem {
  id?: number;
  nome: string;
  nivel: number;
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
  raca_id: number;
  classe_id: number;
  origem_id: number;
  raca?: Raca;
  classe?: Classe;
  origem?: Origem;
  pv_total?: number;
  pm_total?: number;
  defesa?: number;
}

export interface Stats {
  pv_total: number;
  pm_total: number;
  defesa: number;
}
