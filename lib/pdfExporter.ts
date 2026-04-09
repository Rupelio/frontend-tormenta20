import { PDFDocument } from 'pdf-lib';
import { Personagem } from '@/types';

// Mapeamento pericia -> atributo base T20
const PERICIA_ATRIBUTO: Record<string, string> = {
  'Acrobacia': 'des', 'Adestramento': 'car', 'Atletismo': 'for',
  'Atuação': 'car', 'Cavalgar': 'des', 'Conhecimento': 'int',
  'Cura': 'sab', 'Diplomacia': 'car', 'Enganação': 'car',
  'Fortitude': 'con', 'Furtividade': 'des', 'Guerra': 'int',
  'Iniciativa': 'des', 'Intimidação': 'car', 'Intuição': 'sab',
  'Investigação': 'int', 'Jogatina': 'car', 'Ladinagem': 'des',
  'Luta': 'for', 'Misticismo': 'int', 'Nobreza': 'int',
  'Percepção': 'sab', 'Pilotagem': 'des', 'Pontaria': 'des',
  'Reflexos': 'des', 'Religião': 'sab', 'Sobrevivência': 'sab',
  'Vontade': 'sab',
};

// Campos do PDF por pericia:
// total | 1/2 nivel | mod atributo | treino (bonus proficiencia)
interface PericiaFields { checkbox: string; total: string; metadeNivel: string; modAtributo: string; treino: string; }

const PERICIAS_FIELDS: Record<string, PericiaFields> = {
  'Acrobacia':      { checkbox: 'Mar Trei acro',   total: '010', metadeNivel: '011', modAtributo: '013', treino: '014' },
  'Adestramento':   { checkbox: 'Mar Trei ades',   total: '020', metadeNivel: '021', modAtributo: '023', treino: '024' },
  'Atletismo':      { checkbox: 'Mar Trei atle',   total: '030', metadeNivel: '031', modAtributo: '033', treino: '034' },
  'Atuação':        { checkbox: 'Mar Trei atua',   total: '040', metadeNivel: '041', modAtributo: '043', treino: '044' },
  'Cavalgar':       { checkbox: 'Mar Trei caval',  total: '050', metadeNivel: '051', modAtributo: '053', treino: '054' },
  'Conhecimento':   { checkbox: 'Mar Trei conhe',  total: '060', metadeNivel: '061', modAtributo: '063', treino: '064' },
  'Cura':           { checkbox: 'Mar Trei cura',   total: '070', metadeNivel: '071', modAtributo: '073', treino: '074' },
  'Diplomacia':     { checkbox: 'Mar Trei dipl',   total: '080', metadeNivel: '081', modAtributo: '083', treino: '084' },
  'Enganação':      { checkbox: 'Mar Trei enga',   total: '090', metadeNivel: '091', modAtributo: '093', treino: '094' },
  'Fortitude':      { checkbox: 'Mar Trei forti',  total: '100', metadeNivel: '101', modAtributo: '103', treino: '104' },
  'Furtividade':    { checkbox: 'Mar Trei furti',  total: '110', metadeNivel: '111', modAtributo: '113', treino: '114' },
  'Guerra':         { checkbox: 'Mar Trei guerra', total: '120', metadeNivel: '121', modAtributo: '123', treino: '124' },
  'Iniciativa':     { checkbox: 'Mar Trei ini',    total: '130', metadeNivel: '131', modAtributo: '133', treino: '134' },
  'Intimidação':    { checkbox: 'Mar Trei inti',   total: '140', metadeNivel: '141', modAtributo: '143', treino: '144' },
  'Intuição':       { checkbox: 'Mar Trei intu',   total: '150', metadeNivel: '151', modAtributo: '153', treino: '154' },
  'Investigação':   { checkbox: 'Mar Trei inve',   total: '160', metadeNivel: '161', modAtributo: '163', treino: '164' },
  'Jogatina':       { checkbox: 'Mar Trei joga',   total: '170', metadeNivel: '171', modAtributo: '173', treino: '174' },
  'Ladinagem':      { checkbox: 'Mar Trei ladi',   total: '180', metadeNivel: '181', modAtributo: '183', treino: '184' },
  'Luta':           { checkbox: 'Mar Trei luta',   total: '190', metadeNivel: '191', modAtributo: '193', treino: '194' },
  'Misticismo':     { checkbox: 'Mar Trei misti',  total: '200', metadeNivel: '201', modAtributo: '203', treino: '204' },
  'Nobreza':        { checkbox: 'Mar Trei nobre',  total: '220', metadeNivel: '221', modAtributo: '223', treino: '224' },
  'Percepção':      { checkbox: 'Mar Trei perce',  total: '250', metadeNivel: '251', modAtributo: '253', treino: '254' },
  'Pilotagem':      { checkbox: 'Mar Trei pilo',   total: '210', metadeNivel: '211', modAtributo: '213', treino: '214' },
  'Pontaria':       { checkbox: 'Mar Trei ponta',  total: '260', metadeNivel: '261', modAtributo: '263', treino: '264' },
  'Reflexos':       { checkbox: 'Mar Trei refle',  total: '270', metadeNivel: '271', modAtributo: '273', treino: '274' },
  'Religião':       { checkbox: 'Mar Trei reli',   total: '280', metadeNivel: '281', modAtributo: '283', treino: '284' },
  'Sobrevivência':  { checkbox: 'Mar Trei sobre',  total: '290', metadeNivel: '291', modAtributo: '293', treino: '294' },
  'Vontade':        { checkbox: 'Mar Trei vonta',  total: '300', metadeNivel: '301', modAtributo: '303', treino: '304' },
};

export async function exportarPDF(personagem: Personagem): Promise<Blob> {
  const templateUrl = '/ficha-t20-template.pdf';
  const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const setText = (fieldName: string, value: string) => {
    try { form.getTextField(fieldName).setText(value); } catch {}
  };
  const setCheck = (fieldName: string, checked: boolean) => {
    try { if (checked) form.getCheckBox(fieldName).check(); } catch {}
  };

  // === INFO BASICA ===
  setText('NOME DO PERSONAGEM', personagem.nome || '');
  setText('RA\u00c7A', personagem.raca?.nome || '');
  setText('CLASSE', personagem.classe?.nome || '');
  setText('ORIGEM', personagem.origem?.nome || '');
  setText('DIVINDADE', personagem.divindade?.nome || '');
  setText('Lv', String(personagem.nivel || 1));

  // === ATRIBUTOS ===
  const attrs: Record<string, number> = {
    for: personagem.for || 0, des: personagem.des || 0, con: personagem.con || 0,
    int: personagem.int || 0, sab: personagem.sab || 0, car: personagem.car || 0,
  };
  setText('For', String(attrs.for)); setText('Des', String(attrs.des)); setText('Con', String(attrs.con));
  setText('Int', String(attrs.int)); setText('Sab', String(attrs.sab)); setText('Car', String(attrs.car));
  setText('ModFor', formatMod(attrs.for)); setText('ModDes', formatMod(attrs.des)); setText('ModCon', formatMod(attrs.con));
  setText('ModInt', formatMod(attrs.int)); setText('ModSab', formatMod(attrs.sab)); setText('ModCar', formatMod(attrs.car));

  // === PV / PM ===
  setText('PVs Totais', String(personagem.pv_total || 0));
  setText('PVs Atuais', String(personagem.pv_total || 0));
  setText('PMs Totais', String(personagem.pm_total || 0));
  setText('PMs Atuais', String(personagem.pm_total || 0));

  // === DEFESA ===
  // Calcular bonus de armadura e escudo a partir dos itens
  let bonusArmadura = 0;
  let bonusEscudo = 0;
  let penArmadura = 0;
  let penEscudo = 0;
  for (const item of (personagem.itens || [])) {
    if (item.tipo === 'armadura' && item.descricao) {
      const defMatch = item.descricao.match(/Def \+(\d+)/);
      const penMatch = item.descricao.match(/Penalidade (-?\d+)/);
      if (defMatch) bonusArmadura = parseInt(defMatch[1]);
      if (penMatch) penArmadura = parseInt(penMatch[1]);
    }
    if (item.tipo === 'escudo' && item.descricao) {
      const defMatch = item.descricao.match(/Def \+(\d+)/);
      const penMatch = item.descricao.match(/Penalidade (-?\d+)/);
      if (defMatch) bonusEscudo = parseInt(defMatch[1]);
      if (penMatch) penEscudo = parseInt(penMatch[1]);
    }
  }

  const baseDefesa = 10;
  const defesaTotal = baseDefesa + attrs.des + bonusArmadura + bonusEscudo;
  setText('CA', String(defesaTotal));
  setText('Base CA', String(baseDefesa));
  setText('ModAtribDefe', formatMod(attrs.des));
  setText('Armadura', bonusArmadura > 0 ? String(bonusArmadura) : '');
  setText('Escudo', bonusEscudo > 0 ? String(bonusEscudo) : '');
  setText('Pa', penArmadura ? String(penArmadura) : '');
  setText('Pe', penEscudo ? String(penEscudo) : '');
  setText('PArmTotal', (penArmadura + penEscudo) ? String(penArmadura + penEscudo) : '');
  setText('Desloc', personagem.raca?.deslocamento ? `${personagem.raca.deslocamento}m` : '9m');

  // Proficiencias
  const profs: string[] = [];
  if (personagem.classe?.prof_armas_simples) profs.push('Armas simples');
  if (personagem.classe?.prof_armas_marciais) profs.push('Armas marciais');
  if (personagem.classe?.prof_armaduras_leves) profs.push('Armaduras leves');
  if (personagem.classe?.prof_armaduras_pesadas) profs.push('Armaduras pesadas');
  if (personagem.classe?.prof_escudos) profs.push('Escudos');
  setText('Profici\u00eancias', profs.join(', '));

  // === PERICIAS ===
  const periciasNomes = (personagem.pericias || []).map((p: any) => p.nome || '');
  const nivel = personagem.nivel || 1;
  const metadeNivel = Math.floor(nivel / 2);

  for (const [nomePericia, fields] of Object.entries(PERICIAS_FIELDS)) {
    const attrKey = PERICIA_ATRIBUTO[nomePericia] || 'for';
    const modAtributo = attrs[attrKey] || 0;
    const treinada = periciasNomes.includes(nomePericia);
    // Treino em T20: metade nivel + 2 (se treinada)
    const bonusTreino = treinada ? (metadeNivel + 2) : 0;
    const total = metadeNivel + modAtributo + bonusTreino;

    setCheck(fields.checkbox, treinada);
    setText(fields.total, String(total));
    setText(fields.metadeNivel, String(metadeNivel));
    setText(fields.modAtributo, String(modAtributo));
    // Campo treino = apenas o bonus de proficiencia (metade nivel + 2), NAO o mod atributo
    setText(fields.treino, treinada ? String(bonusTreino) : '');
  }

  // === ATAQUES ===
  const armas = (personagem.itens || []).filter(i => i.tipo === 'arma').slice(0, 5);
  armas.forEach((arma, i) => {
    const n = i + 1;
    setText(`Ataque ${n}`, arma.nome);
    if (arma.descricao) {
      const partes = arma.descricao.split(' | ');
      if (partes[0]) setText(`Dano ${n}`, partes[0]);
      if (partes[1]) setText(`Cr\u00edtico ${n}`, partes[1]);
      if (partes[2]) setText(`Tipo ${n}`, partes[2]);
    }
  });

  // === ITENS ===
  const todosItens = personagem.itens || [];
  todosItens.slice(0, 15).forEach((item, i) => {
    const n = i + 1;
    const qtdPrefix = item.quantidade > 1 ? `${item.quantidade}x ` : '';
    setText(`Item${n}`, `${qtdPrefix}${item.nome}`);
    setText(`PesoItem${n}`, String(item.peso * item.quantidade));
  });
  const pesoTotal = todosItens.reduce((acc, item) => acc + (item.peso * item.quantidade), 0);
  setText('CargaTotal', String(pesoTotal));

  // === HABILIDADES DE RACA ===
  const habRaca = (personagem.raca as any)?.habilidades || [];
  const habRacaTexto = habRaca.map((h: any) => `${h.nome}: ${h.descricao || ''}`).join('\n');
  setText('HabRa\u00e7asOrigem', habRacaTexto || personagem.raca?.nome || '');

  // === HABILIDADES DE CLASSE / PODERES ===
  const habClasse = (personagem.classe as any)?.habilidades || [];
  const habClasseTexto = habClasse.map((h: any) => `${h.nome}: ${h.descricao || ''}`).join('\n');
  setText('HabClassePoderes', habClasseTexto || personagem.classe?.nome || '');

  // === DESCRICAO / HISTORICO / ANOTACOES ===
  setText('Descri\u00e7\u00e3o', personagem.historico || '');
  setText('Anota\u00e7\u00f5es', personagem.anotacoes || '');

  form.flatten();
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

function formatMod(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
