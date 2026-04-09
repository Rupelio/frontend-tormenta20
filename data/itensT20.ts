// Dados de itens pre-definidos do Tormenta 20
// Baseado no Capitulo 3: Equipamento do Livro Basico

export interface ItemPreDefinido {
  nome: string;
  tipo: 'arma' | 'armadura' | 'escudo' | 'equipamento' | 'ferramenta' | 'vestuario' | 'esoterico' | 'alquimico' | 'animal' | 'veiculo' | 'municao';
  subtipo?: string;
  preco: number; // em T$
  peso: number; // em espacos
  dano?: string;
  critico?: string;
  alcance?: string;
  tipoDano?: string;
  bonusDefesa?: number;
  penalidade?: number;
  descricao?: string;
}

// ========== ARMAS SIMPLES ==========
export const armasSimples: ItemPreDefinido[] = [
  // Corpo a corpo - Leves
  { nome: 'Adaga', tipo: 'arma', subtipo: 'simples-leve', preco: 2, peso: 1, dano: '1d4', critico: '19', alcance: 'Curto', tipoDano: 'Perfuracao' },
  { nome: 'Espada curta', tipo: 'arma', subtipo: 'simples-leve', preco: 10, peso: 1, dano: '1d6', critico: '19', tipoDano: 'Perfuracao' },
  { nome: 'Foice', tipo: 'arma', subtipo: 'simples-leve', preco: 4, peso: 1, dano: '1d6', critico: 'x3', tipoDano: 'Corte' },
  // Corpo a corpo - Uma mao
  { nome: 'Clava', tipo: 'arma', subtipo: 'simples-uma-mao', preco: 0, peso: 1, dano: '1d6', critico: 'x2', tipoDano: 'Impacto' },
  { nome: 'Lanca', tipo: 'arma', subtipo: 'simples-uma-mao', preco: 2, peso: 1, dano: '1d6', critico: 'x2', alcance: 'Curto', tipoDano: 'Perfuracao' },
  { nome: 'Maca', tipo: 'arma', subtipo: 'simples-uma-mao', preco: 12, peso: 1, dano: '1d8', critico: 'x2', tipoDano: 'Impacto' },
  // Corpo a corpo - Duas maos
  { nome: 'Bordao', tipo: 'arma', subtipo: 'simples-duas-maos', preco: 0, peso: 2, dano: '1d6/1d6', critico: 'x2', tipoDano: 'Impacto' },
  { nome: 'Pique', tipo: 'arma', subtipo: 'simples-duas-maos', preco: 2, peso: 2, dano: '1d8', critico: 'x2', tipoDano: 'Perfuracao' },
  { nome: 'Tacape', tipo: 'arma', subtipo: 'simples-duas-maos', preco: 0, peso: 2, dano: '1d10', critico: 'x2', tipoDano: 'Impacto' },
  // Distancia - Uma mao
  { nome: 'Azagaia', tipo: 'arma', subtipo: 'simples-distancia', preco: 1, peso: 1, dano: '1d6', critico: 'x2', alcance: 'Medio', tipoDano: 'Perfuracao' },
  { nome: 'Besta leve', tipo: 'arma', subtipo: 'simples-distancia', preco: 35, peso: 1, dano: '1d8', critico: '19', alcance: 'Medio', tipoDano: 'Perfuracao' },
  { nome: 'Funda', tipo: 'arma', subtipo: 'simples-distancia', preco: 0, peso: 1, dano: '1d4', critico: 'x2', alcance: 'Medio', tipoDano: 'Impacto' },
  // Distancia - Duas maos
  { nome: 'Arco curto', tipo: 'arma', subtipo: 'simples-distancia', preco: 30, peso: 2, dano: '1d6', critico: 'x3', alcance: 'Medio', tipoDano: 'Perfuracao' },
];

// ========== ARMAS MARCIAIS ==========
export const armasMarciais: ItemPreDefinido[] = [
  // Leves
  { nome: 'Machadinha', tipo: 'arma', subtipo: 'marcial-leve', preco: 6, peso: 1, dano: '1d6', critico: 'x3', alcance: 'Curto', tipoDano: 'Corte' },
  // Uma mao
  { nome: 'Cimitarra', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 15, peso: 1, dano: '1d6', critico: '18', tipoDano: 'Corte' },
  { nome: 'Espada longa', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 15, peso: 1, dano: '1d8', critico: '19', tipoDano: 'Corte' },
  { nome: 'Florete', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 20, peso: 1, dano: '1d6', critico: '18', tipoDano: 'Perfuracao' },
  { nome: 'Machado de batalha', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 10, peso: 1, dano: '1d8', critico: 'x3', tipoDano: 'Corte' },
  { nome: 'Mangual', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 8, peso: 1, dano: '1d8', critico: 'x2', tipoDano: 'Impacto' },
  { nome: 'Martelo de guerra', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 12, peso: 1, dano: '1d8', critico: 'x3', tipoDano: 'Impacto' },
  { nome: 'Picareta', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 8, peso: 1, dano: '1d6', critico: 'x4', tipoDano: 'Perfuracao' },
  { nome: 'Tridente', tipo: 'arma', subtipo: 'marcial-uma-mao', preco: 15, peso: 1, dano: '1d8', critico: 'x2', alcance: 'Curto', tipoDano: 'Perfuracao' },
  // Duas maos
  { nome: 'Alabarda', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 10, peso: 2, dano: '1d10', critico: 'x3', tipoDano: 'Corte/Perfuracao' },
  { nome: 'Alfange', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 75, peso: 2, dano: '2d4', critico: '18', tipoDano: 'Corte' },
  { nome: 'Gadanho', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 18, peso: 2, dano: '2d4', critico: 'x4', tipoDano: 'Corte' },
  { nome: 'Lanca montada', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 10, peso: 2, dano: '1d8', critico: 'x3', tipoDano: 'Perfuracao' },
  { nome: 'Machado de guerra', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 20, peso: 2, dano: '1d12', critico: 'x3', tipoDano: 'Corte' },
  { nome: 'Marreta', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 20, peso: 2, dano: '3d4', critico: 'x2', tipoDano: 'Impacto' },
  { nome: 'Montante', tipo: 'arma', subtipo: 'marcial-duas-maos', preco: 50, peso: 2, dano: '2d6', critico: '19', tipoDano: 'Corte' },
  // Distancia
  { nome: 'Arco longo', tipo: 'arma', subtipo: 'marcial-distancia', preco: 100, peso: 2, dano: '1d8', critico: 'x3', alcance: 'Medio', tipoDano: 'Perfuracao' },
  { nome: 'Besta pesada', tipo: 'arma', subtipo: 'marcial-distancia', preco: 50, peso: 2, dano: '1d12', critico: '19', alcance: 'Medio', tipoDano: 'Perfuracao' },
];

// ========== ARMAS EXOTICAS ==========
export const armasExoticas: ItemPreDefinido[] = [
  { nome: 'Chicote', tipo: 'arma', subtipo: 'exotica-uma-mao', preco: 2, peso: 1, dano: '1d3', critico: 'x2', tipoDano: 'Corte' },
  { nome: 'Espada bastarda', tipo: 'arma', subtipo: 'exotica-uma-mao', preco: 35, peso: 1, dano: '1d10/1d12', critico: '19', tipoDano: 'Corte' },
  { nome: 'Katana', tipo: 'arma', subtipo: 'exotica-uma-mao', preco: 100, peso: 1, dano: '1d8/1d10', critico: '19', tipoDano: 'Corte' },
  { nome: 'Machado anao', tipo: 'arma', subtipo: 'exotica-uma-mao', preco: 30, peso: 1, dano: '1d10', critico: 'x3', tipoDano: 'Corte' },
  { nome: 'Corrente de espinhos', tipo: 'arma', subtipo: 'exotica-duas-maos', preco: 25, peso: 2, dano: '2d4/2d4', critico: '19', tipoDano: 'Corte' },
  { nome: 'Machado taurico', tipo: 'arma', subtipo: 'exotica-duas-maos', preco: 50, peso: 2, dano: '2d8', critico: 'x3', tipoDano: 'Corte' },
  { nome: 'Rede', tipo: 'arma', subtipo: 'exotica-distancia', preco: 20, peso: 1 },
  // Armas de fogo
  { nome: 'Pistola', tipo: 'arma', subtipo: 'fogo-leve', preco: 250, peso: 1, dano: '2d6', critico: '19/x3', alcance: 'Curto', tipoDano: 'Perfuracao' },
  { nome: 'Mosquete', tipo: 'arma', subtipo: 'fogo-duas-maos', preco: 500, peso: 2, dano: '2d8', critico: '19/x3', alcance: 'Medio', tipoDano: 'Perfuracao' },
];

// ========== MUNICOES ==========
export const municoes: ItemPreDefinido[] = [
  { nome: 'Flechas (20)', tipo: 'municao', preco: 1, peso: 1 },
  { nome: 'Virotes (20)', tipo: 'municao', preco: 2, peso: 1 },
  { nome: 'Pedras (20)', tipo: 'municao', preco: 0.5, peso: 1 },
  { nome: 'Balas (20)', tipo: 'municao', preco: 20, peso: 1 },
];

// ========== ARMADURAS ==========
export const armaduras: ItemPreDefinido[] = [
  // Leves
  { nome: 'Armadura acolchoada', tipo: 'armadura', subtipo: 'leve', preco: 5, peso: 2, bonusDefesa: 1, penalidade: 0 },
  { nome: 'Armadura de couro', tipo: 'armadura', subtipo: 'leve', preco: 20, peso: 2, bonusDefesa: 2, penalidade: 0 },
  { nome: 'Couro batido', tipo: 'armadura', subtipo: 'leve', preco: 35, peso: 2, bonusDefesa: 3, penalidade: -1 },
  { nome: 'Gibao de peles', tipo: 'armadura', subtipo: 'leve', preco: 25, peso: 2, bonusDefesa: 4, penalidade: -3 },
  { nome: 'Couraca', tipo: 'armadura', subtipo: 'leve', preco: 500, peso: 2, bonusDefesa: 5, penalidade: -4 },
  // Pesadas
  { nome: 'Brunea', tipo: 'armadura', subtipo: 'pesada', preco: 50, peso: 5, bonusDefesa: 5, penalidade: -2 },
  { nome: 'Cota de malha', tipo: 'armadura', subtipo: 'pesada', preco: 150, peso: 5, bonusDefesa: 6, penalidade: -2 },
  { nome: 'Loriga segmentada', tipo: 'armadura', subtipo: 'pesada', preco: 250, peso: 5, bonusDefesa: 7, penalidade: -3 },
  { nome: 'Meia armadura', tipo: 'armadura', subtipo: 'pesada', preco: 600, peso: 5, bonusDefesa: 8, penalidade: -4 },
  { nome: 'Armadura completa', tipo: 'armadura', subtipo: 'pesada', preco: 3000, peso: 5, bonusDefesa: 10, penalidade: -5 },
];

// ========== ESCUDOS ==========
export const escudos: ItemPreDefinido[] = [
  { nome: 'Escudo leve', tipo: 'escudo', preco: 5, peso: 1, bonusDefesa: 1, penalidade: -1 },
  { nome: 'Escudo pesado', tipo: 'escudo', preco: 15, peso: 2, bonusDefesa: 2, penalidade: -2 },
];

// ========== EQUIPAMENTO DE AVENTURA ==========
export const equipamentoAventura: ItemPreDefinido[] = [
  { nome: 'Agua benta', tipo: 'equipamento', subtipo: 'aventura', preco: 10, peso: 0.5 },
  { nome: 'Algemas', tipo: 'equipamento', subtipo: 'aventura', preco: 15, peso: 1 },
  { nome: 'Arpeu', tipo: 'equipamento', subtipo: 'aventura', preco: 5, peso: 1 },
  { nome: 'Bandoleira de pocoes', tipo: 'equipamento', subtipo: 'aventura', preco: 20, peso: 1 },
  { nome: 'Barraca', tipo: 'equipamento', subtipo: 'aventura', preco: 10, peso: 1 },
  { nome: 'Corda (10m)', tipo: 'equipamento', subtipo: 'aventura', preco: 1, peso: 1 },
  { nome: 'Espelho', tipo: 'equipamento', subtipo: 'aventura', preco: 10, peso: 1 },
  { nome: 'Lampiao', tipo: 'equipamento', subtipo: 'aventura', preco: 7, peso: 1 },
  { nome: 'Mochila', tipo: 'equipamento', subtipo: 'aventura', preco: 2, peso: 0 },
  { nome: 'Mochila de aventureiro', tipo: 'equipamento', subtipo: 'aventura', preco: 50, peso: 0 },
  { nome: 'Oleo', tipo: 'equipamento', subtipo: 'aventura', preco: 0.1, peso: 0.5 },
  { nome: 'Organizador de pergaminhos', tipo: 'equipamento', subtipo: 'aventura', preco: 25, peso: 1 },
  { nome: 'Pe de cabra', tipo: 'equipamento', subtipo: 'aventura', preco: 2, peso: 1 },
  { nome: 'Saco de dormir', tipo: 'equipamento', subtipo: 'aventura', preco: 1, peso: 1 },
  { nome: 'Simbolo sagrado', tipo: 'equipamento', subtipo: 'aventura', preco: 5, peso: 1 },
  { nome: 'Tocha', tipo: 'equipamento', subtipo: 'aventura', preco: 0.1, peso: 1 },
  { nome: 'Vara de madeira (3m)', tipo: 'equipamento', subtipo: 'aventura', preco: 0.2, peso: 1 },
];

// ========== FERRAMENTAS ==========
export const ferramentas: ItemPreDefinido[] = [
  { nome: 'Alaude elfico', tipo: 'ferramenta', preco: 300, peso: 1 },
  { nome: 'Colecao de livros', tipo: 'ferramenta', preco: 75, peso: 1 },
  { nome: 'Equipamento de viagem', tipo: 'ferramenta', preco: 10, peso: 1 },
  { nome: 'Estojo de disfarces', tipo: 'ferramenta', preco: 50, peso: 1 },
  { nome: 'Flauta mistica', tipo: 'ferramenta', preco: 150, peso: 1 },
  { nome: 'Gazua', tipo: 'ferramenta', preco: 5, peso: 1 },
  { nome: 'Instrumentos de oficio', tipo: 'ferramenta', preco: 30, peso: 1 },
  { nome: 'Instrumento musical', tipo: 'ferramenta', preco: 35, peso: 1 },
  { nome: 'Luneta', tipo: 'ferramenta', preco: 100, peso: 1 },
  { nome: 'Maleta de medicamentos', tipo: 'ferramenta', preco: 50, peso: 1 },
  { nome: 'Sela', tipo: 'ferramenta', preco: 20, peso: 1 },
  { nome: 'Tambor das profundezas', tipo: 'ferramenta', preco: 80, peso: 1 },
];

// ========== ALQUIMICOS ==========
export const alquimicos: ItemPreDefinido[] = [
  { nome: 'Acido', tipo: 'alquimico', subtipo: 'preparado', preco: 10, peso: 0.5 },
  { nome: 'Balsamo restaurador', tipo: 'alquimico', subtipo: 'preparado', preco: 10, peso: 0.5 },
  { nome: 'Bomba', tipo: 'alquimico', subtipo: 'preparado', preco: 50, peso: 0.5 },
  { nome: 'Cosmetico', tipo: 'alquimico', subtipo: 'preparado', preco: 30, peso: 0.5 },
  { nome: 'Elixir do amor', tipo: 'alquimico', subtipo: 'preparado', preco: 100, peso: 0.5 },
  { nome: 'Essencia de mana', tipo: 'alquimico', subtipo: 'preparado', preco: 50, peso: 0.5 },
  { nome: 'Fogo alquimico', tipo: 'alquimico', subtipo: 'preparado', preco: 10, peso: 0.5 },
  { nome: 'Po do desaparecimento', tipo: 'alquimico', subtipo: 'preparado', preco: 100, peso: 0.5 },
];

// ========== VESTUARIO ==========
export const vestuario: ItemPreDefinido[] = [
  { nome: 'Andrajos de aldeao', tipo: 'vestuario', preco: 1, peso: 1 },
  { nome: 'Bandana', tipo: 'vestuario', preco: 5, peso: 1 },
  { nome: 'Botas reforcadas', tipo: 'vestuario', preco: 20, peso: 1 },
  { nome: 'Camisa bufante', tipo: 'vestuario', preco: 25, peso: 1 },
  { nome: 'Capa esvoacante', tipo: 'vestuario', preco: 25, peso: 1 },
  { nome: 'Capa pesada', tipo: 'vestuario', preco: 15, peso: 1 },
  { nome: 'Casaco longo', tipo: 'vestuario', preco: 20, peso: 1 },
  { nome: 'Chapeu arcano', tipo: 'vestuario', preco: 50, peso: 1 },
  { nome: 'Enfeite de elmo', tipo: 'vestuario', preco: 15, peso: 1 },
  { nome: 'Farrapos de ermitao', tipo: 'vestuario', preco: 1, peso: 1 },
  { nome: 'Gorro de ervas', tipo: 'vestuario', preco: 75, peso: 1 },
  { nome: 'Luva de pelica', tipo: 'vestuario', preco: 5, peso: 1 },
  { nome: 'Manopla', tipo: 'vestuario', preco: 10, peso: 1 },
  { nome: 'Manto camuflado', tipo: 'vestuario', preco: 12, peso: 1 },
  { nome: 'Manto eclesiastico', tipo: 'vestuario', preco: 20, peso: 1 },
  { nome: 'Robe mistico', tipo: 'vestuario', preco: 50, peso: 1 },
  { nome: 'Sapatos de camurca', tipo: 'vestuario', preco: 8, peso: 1 },
  { nome: 'Tabardo', tipo: 'vestuario', preco: 10, peso: 1 },
  { nome: 'Traje da corte', tipo: 'vestuario', preco: 100, peso: 1 },
  { nome: 'Traje de viajante', tipo: 'vestuario', preco: 10, peso: 0 },
  { nome: 'Veste de seda', tipo: 'vestuario', preco: 25, peso: 1 },
];

// ========== ESOTERICOS ==========
export const esotericos: ItemPreDefinido[] = [
  { nome: 'Bolsa de po', tipo: 'esoterico', preco: 300, peso: 1 },
  { nome: 'Cajado arcano', tipo: 'esoterico', preco: 1000, peso: 2 },
  { nome: 'Cetro elemental', tipo: 'esoterico', preco: 750, peso: 1 },
  { nome: 'Costela de lich', tipo: 'esoterico', preco: 300, peso: 1 },
  { nome: 'Dedo de ente', tipo: 'esoterico', preco: 200, peso: 1 },
  { nome: 'Luva de ferro', tipo: 'esoterico', preco: 150, peso: 1 },
  { nome: 'Medalhao de prata', tipo: 'esoterico', preco: 750, peso: 1 },
  { nome: 'Orbe cristalino', tipo: 'esoterico', preco: 750, peso: 1 },
  { nome: 'Tomo hermetico', tipo: 'esoterico', preco: 1500, peso: 1 },
  { nome: 'Varinha arcana', tipo: 'esoterico', preco: 100, peso: 1 },
];

// ========== CATALISADORES ==========
export const catalisadores: ItemPreDefinido[] = [
  { nome: 'Baga-de-fogo', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
  { nome: 'Dente-de-dragao', tipo: 'alquimico', subtipo: 'catalisador', preco: 45, peso: 0.5 },
  { nome: 'Essencia abissal', tipo: 'alquimico', subtipo: 'catalisador', preco: 150, peso: 0.5 },
  { nome: 'Liquen lilas', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
  { nome: 'Musgo purpura', tipo: 'alquimico', subtipo: 'catalisador', preco: 45, peso: 0.5 },
  { nome: 'Ossos de monstro', tipo: 'alquimico', subtipo: 'catalisador', preco: 45, peso: 0.5 },
  { nome: 'Po de cristal', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
  { nome: 'Po de giz', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
  { nome: 'Ramo verdejante', tipo: 'alquimico', subtipo: 'catalisador', preco: 45, peso: 0.5 },
  { nome: 'Saco de sal', tipo: 'alquimico', subtipo: 'catalisador', preco: 45, peso: 0.5 },
  { nome: 'Seixo de ambar', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
  { nome: 'Terra de cemiterio', tipo: 'alquimico', subtipo: 'catalisador', preco: 30, peso: 0.5 },
];

// ========== VENENOS ==========
export const venenos: ItemPreDefinido[] = [
  { nome: 'Beladona', tipo: 'alquimico', subtipo: 'veneno', preco: 1500, peso: 0.5 },
  { nome: 'Bruma sonolenta', tipo: 'alquimico', subtipo: 'veneno', preco: 150, peso: 0.5 },
  { nome: 'Cicuta', tipo: 'alquimico', subtipo: 'veneno', preco: 60, peso: 0.5 },
  { nome: 'Essencia de sombra', tipo: 'alquimico', subtipo: 'veneno', preco: 100, peso: 0.5 },
  { nome: 'Nevoa toxica', tipo: 'alquimico', subtipo: 'veneno', preco: 30, peso: 0.5 },
  { nome: 'Peconha comum', tipo: 'alquimico', subtipo: 'veneno', preco: 15, peso: 0.5 },
  { nome: 'Peconha concentrada', tipo: 'alquimico', subtipo: 'veneno', preco: 90, peso: 0.5 },
  { nome: 'Peconha potente', tipo: 'alquimico', subtipo: 'veneno', preco: 600, peso: 0.5 },
  { nome: 'Po de lich', tipo: 'alquimico', subtipo: 'veneno', preco: 3000, peso: 0.5 },
  { nome: 'Riso de Nimb', tipo: 'alquimico', subtipo: 'veneno', preco: 150, peso: 0.5 },
];

// ========== ANIMAIS E VEICULOS ==========
export const animaisVeiculos: ItemPreDefinido[] = [
  { nome: 'Alforje', tipo: 'animal', preco: 30, peso: 0 },
  { nome: 'Cao de caca', tipo: 'animal', preco: 150, peso: 0 },
  { nome: 'Cavalo', tipo: 'animal', preco: 75, peso: 0 },
  { nome: 'Cavalo de guerra', tipo: 'animal', preco: 400, peso: 0 },
  { nome: 'Ponei', tipo: 'animal', preco: 5, peso: 0 },
  { nome: 'Ponei de guerra', tipo: 'animal', preco: 30, peso: 0 },
  { nome: 'Trobo', tipo: 'animal', preco: 60, peso: 0 },
  { nome: 'Carroca', tipo: 'veiculo', preco: 150, peso: 0 },
  { nome: 'Carruagem', tipo: 'veiculo', preco: 500, peso: 0 },
  { nome: 'Canoa', tipo: 'veiculo', preco: 70, peso: 0 },
  { nome: 'Balao goblin', tipo: 'veiculo', preco: 200, peso: 0 },
];

// ========== ITENS INICIAIS POR ORIGEM ==========
export const itensIniciaisPorOrigem: Record<string, string[]> = {
  'Acolito': ['Simbolo sagrado', 'Traje de viajante'],
  'Amigo dos Animais': ['Cao de caca ou Cavalo ou Ponei ou Trobo'],
  'Aristocrata': ['Traje da corte'],
  'Artesao': ['Instrumentos de oficio'],
  'Artista': ['Estojo de disfarces ou Instrumento musical'],
  'Assistente de Laboratorio': ['Instrumentos de oficio'],
  'Batedor': ['Barraca', 'Equipamento de viagem'],
  'Capanga': ['Adaga ou Clava'],
  'Charlatao': ['Estojo de disfarces'],
  'Circense': ['Instrumento musical'],
  'Criminoso': ['Estojo de disfarces ou Gazua'],
  'Curandeiro': ['Balsamo restaurador', 'Balsamo restaurador', 'Maleta de medicamentos'],
  'Eremita': ['Barraca', 'Equipamento de viagem'],
  'Escravo': ['Algemas'],
  'Estudioso': ['Colecao de livros'],
  'Fazendeiro': ['Carroca', 'Lanca'],
  'Forasteiro': ['Equipamento de viagem', 'Instrumento musical'],
  'Gladiador': ['Espada longa ou Machado de batalha'],
  'Guarda': ['Espada longa ou Lanca'],
  'Herdeiro': [],
  'Heroi Campones': ['Instrumentos de oficio ou Lanca'],
  'Marujo': ['Corda (10m)'],
  'Mateiro': ['Arco curto', 'Barraca', 'Equipamento de viagem', 'Flechas (20)'],
  'Membro de Guilda': ['Gazua ou Instrumentos de oficio'],
  'Mercador': ['Carroca', 'Trobo'],
  'Minerador': ['Picareta'],
  'Nomade': ['Bordao', 'Equipamento de viagem'],
  'Pivete': ['Gazua'],
  'Refugiado': [],
  'Seguidor': [],
  'Selvagem': ['Lanca ou Bordao'],
  'Soldado': ['Espada longa ou Arco curto'],
  'Taverneiro': ['Clava'],
  'Trabalhador': ['Maca ou Lanca'],
};

// ========== TODOS OS ITENS AGRUPADOS ==========
export const todosOsItens: ItemPreDefinido[] = [
  ...armasSimples,
  ...armasMarciais,
  ...armasExoticas,
  ...municoes,
  ...armaduras,
  ...escudos,
  ...equipamentoAventura,
  ...ferramentas,
  ...vestuario,
  ...esotericos,
  ...alquimicos,
  ...catalisadores,
  ...venenos,
  ...animaisVeiculos,
];

// Categorias para o seletor
export const categoriasItens = [
  { key: 'armas-simples', label: 'Armas Simples', itens: armasSimples },
  { key: 'armas-marciais', label: 'Armas Marciais', itens: armasMarciais },
  { key: 'armas-exoticas', label: 'Armas Exoticas e de Fogo', itens: armasExoticas },
  { key: 'municoes', label: 'Municoes', itens: municoes },
  { key: 'armaduras', label: 'Armaduras', itens: armaduras },
  { key: 'escudos', label: 'Escudos', itens: escudos },
  { key: 'equipamento', label: 'Equipamento de Aventura', itens: equipamentoAventura },
  { key: 'ferramentas', label: 'Ferramentas', itens: ferramentas },
  { key: 'vestuario', label: 'Vestuario', itens: vestuario },
  { key: 'esotericos', label: 'Esotericos', itens: esotericos },
  { key: 'alquimicos', label: 'Alquimicos (Preparados)', itens: alquimicos },
  { key: 'catalisadores', label: 'Catalisadores', itens: catalisadores },
  { key: 'venenos', label: 'Venenos', itens: venenos },
  { key: 'animais-veiculos', label: 'Animais e Veiculos', itens: animaisVeiculos },
];
