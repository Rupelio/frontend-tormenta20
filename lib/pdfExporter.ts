import { PDFDocument } from 'pdf-lib';
import { Personagem } from '@/types';

// Mapeamento pericia nome -> atributo base
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

// Mapeamento pericia nome -> campo checkbox do PDF
const PERICIAS_CHECKBOX: Record<string, string> = {
  'Acrobacia': 'Mar Trei acro', 'Adestramento': 'Mar Trei ades',
  'Atletismo': 'Mar Trei atle', 'Atuação': 'Mar Trei atua',
  'Cavalgar': 'Mar Trei caval', 'Conhecimento': 'Mar Trei conhe',
  'Cura': 'Mar Trei cura', 'Diplomacia': 'Mar Trei dipl',
  'Enganação': 'Mar Trei enga', 'Fortitude': 'Mar Trei forti',
  'Furtividade': 'Mar Trei furti', 'Guerra': 'Mar Trei guerra',
  'Iniciativa': 'Mar Trei ini', 'Intimidação': 'Mar Trei inti',
  'Intuição': 'Mar Trei intu', 'Investigação': 'Mar Trei inve',
  'Jogatina': 'Mar Trei joga', 'Ladinagem': 'Mar Trei ladi',
  'Luta': 'Mar Trei luta', 'Misticismo': 'Mar Trei misti',
  'Nobreza': 'Mar Trei nobre', 'Percepção': 'Mar Trei perce',
  'Pilotagem': 'Mar Trei pilo', 'Pontaria': 'Mar Trei ponta',
  'Reflexos': 'Mar Trei refle', 'Religião': 'Mar Trei reli',
  'Sobrevivência': 'Mar Trei sobre', 'Vontade': 'Mar Trei vonta',
};

// Mapeamento pericia nome -> campo de modificador total
const PERICIAS_MOD: Record<string, string> = {
  'Acrobacia': 'ModAtribAcro', 'Adestramento': 'ModAtribAdes',
  'Atletismo': 'ModAtribAtle', 'Atuação': 'ModAtribAtua',
  'Cavalgar': 'ModAtribCava', 'Conhecimento': 'ModAtribConh',
  'Cura': 'ModAtribCura', 'Diplomacia': 'ModAtribDipl',
  'Enganação': 'ModAtribEnga', 'Fortitude': 'ModAtribFort',
  'Furtividade': 'ModAtribFurt', 'Guerra': 'ModAtribGuer',
  'Iniciativa': 'ModAtribInic', 'Intimidação': 'ModAtribInti',
  'Intuição': 'ModAtribIntu', 'Investigação': 'ModAtribInve',
  'Jogatina': 'ModAtribJoga', 'Ladinagem': 'ModAtribLadi',
  'Luta': 'ModAtribLuta', 'Misticismo': 'ModAtribMist',
  'Nobreza': 'ModAtribNobr', 'Percepção': 'ModAtribPerc',
  'Pilotagem': 'ModAtribPilo', 'Pontaria': 'ModAtribPont',
  'Reflexos': 'ModAtribRefl', 'Religião': 'ModAtribReli',
  'Sobrevivência': 'ModAtribSobr', 'Vontade': 'ModAtribVont',
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
  setText('RAÇA', personagem.raca?.nome || '');
  setText('CLASSE', personagem.classe?.nome || '');
  setText('ORIGEM', personagem.origem?.nome || '');
  setText('DIVINDADE', personagem.divindade?.nome || '');
  setText('Lv', String(personagem.nivel || 1));

  // === ATRIBUTOS ===
  const attrs = {
    for: personagem.for || 0, des: personagem.des || 0, con: personagem.con || 0,
    int: personagem.int || 0, sab: personagem.sab || 0, car: personagem.car || 0,
  };

  setText('For', String(attrs.for));
  setText('Des', String(attrs.des));
  setText('Con', String(attrs.con));
  setText('Int', String(attrs.int));
  setText('Sab', String(attrs.sab));
  setText('Car', String(attrs.car));

  setText('ModFor', formatMod(attrs.for));
  setText('ModDes', formatMod(attrs.des));
  setText('ModCon', formatMod(attrs.con));
  setText('ModInt', formatMod(attrs.int));
  setText('ModSab', formatMod(attrs.sab));
  setText('ModCar', formatMod(attrs.car));

  // === COMBATE ===
  setText('PVs Totais', String(personagem.pv_total || 0));
  setText('PVs Atuais', String(personagem.pv_total || 0));
  setText('PMs Totais', String(personagem.pm_total || 0));
  setText('PMs Atuais', String(personagem.pm_total || 0));

  // Defesa: Base 10 + DES + armadura + escudo
  const baseDefesa = 10;
  setText('Base CA', String(baseDefesa));
  setText('CA', String(personagem.defesa || (baseDefesa + attrs.des)));
  setText('Desloc', personagem.raca?.deslocamento ? `${personagem.raca.deslocamento}m` : '9m');

  // === PERICIAS com calculos ===
  const periciasNomes = (personagem.pericias || []).map((p: any) => p.nome || '');
  const metadeNivel = Math.floor((personagem.nivel || 1) / 2);

  // Iterar todas as pericias conhecidas
  for (const [nomePericia, attrKey] of Object.entries(PERICIA_ATRIBUTO)) {
    const treinada = periciasNomes.includes(nomePericia);
    const modAtributo = (attrs as any)[attrKey] || 0;
    const bonusTreino = treinada ? (metadeNivel + 2) : 0;
    const total = modAtributo + bonusTreino;

    // Marcar treinada
    if (treinada && PERICIAS_CHECKBOX[nomePericia]) {
      setCheck(PERICIAS_CHECKBOX[nomePericia], true);
    }

    // Setar modificador total
    if (PERICIAS_MOD[nomePericia]) {
      setText(PERICIAS_MOD[nomePericia], formatMod(total));
    }
  }

  // === ATAQUES (itens do tipo arma) ===
  const armas = (personagem.itens || []).filter(i => i.tipo === 'arma').slice(0, 5);
  armas.forEach((arma, i) => {
    const n = i + 1;
    setText(`Ataque ${n}`, arma.nome);
    if (arma.descricao) {
      const partes = arma.descricao.split(' | ');
      if (partes[0]) setText(`Dano ${n}`, partes[0]);
      if (partes[1]) setText(`Cr\u00edtico ${n}`, partes[1]);
      if (partes[2]) setText(`Tipo ${n}`, partes[2]);
      if (partes[3]) setText(`Alcance ${n}`, partes[3]);
    }
  });

  // === ITENS (ate 15 slots) ===
  const todosItens = personagem.itens || [];
  todosItens.slice(0, 15).forEach((item, i) => {
    const n = i + 1;
    const qtdPrefix = item.quantidade > 1 ? `${item.quantidade}x ` : '';
    setText(`Item${n}`, `${qtdPrefix}${item.nome}`);
    setText(`PesoItem${n}`, String(item.peso * item.quantidade));
  });

  // Carga total
  const pesoTotal = todosItens.reduce((acc, item) => acc + (item.peso * item.quantidade), 0);
  setText('CargaTotal', String(pesoTotal));

  // === DESCRICAO / HISTORICO ===
  setText('Descri\u00e7\u00e3o', personagem.historico || '');

  // === ANOTACOES ===
  setText('Anota\u00e7\u00f5es', personagem.anotacoes || '');

  // === HABILIDADES ===
  setText('HabRa\u00e7asOrigem', personagem.raca?.nome || '');
  setText('HabClassePoderes', personagem.classe?.nome || '');

  // Flatten para PDF nao-editavel
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

function formatMod(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
