import { PDFDocument } from 'pdf-lib';
import { Personagem } from '@/types';

const getId = (item: any) => item?.ID || item?.id || 0;

// Mapeamento de pericias para campos do PDF
const PERICIAS_MAP: Record<string, { treinado: string; mod: string }> = {
  'Acrobacia': { treinado: 'Mar Trei acro', mod: 'ModAtribAcro' },
  'Adestramento': { treinado: 'Mar Trei ades', mod: 'ModAtribAdes' },
  'Atletismo': { treinado: 'Mar Trei atle', mod: 'ModAtribAtle' },
  'Atuação': { treinado: 'Mar Trei atua', mod: 'ModAtribAtua' },
  'Cavalgar': { treinado: 'Mar Trei caval', mod: 'ModAtribCava' },
  'Conhecimento': { treinado: 'Mar Trei conhe', mod: 'ModAtribConh' },
  'Cura': { treinado: 'Mar Trei cura', mod: 'ModAtribCura' },
  'Diplomacia': { treinado: 'Mar Trei dipl', mod: 'ModAtribDipl' },
  'Enganação': { treinado: 'Mar Trei enga', mod: 'ModAtribEnga' },
  'Fortitude': { treinado: 'Mar Trei forti', mod: 'ModAtribFort' },
  'Furtividade': { treinado: 'Mar Trei furti', mod: 'ModAtribFurt' },
  'Guerra': { treinado: 'Mar Trei guerra', mod: 'ModAtribGuer' },
  'Iniciativa': { treinado: 'Mar Trei ini', mod: 'ModAtribInic' },
  'Intimidação': { treinado: 'Mar Trei inti', mod: 'ModAtribInti' },
  'Intuição': { treinado: 'Mar Trei intu', mod: 'ModAtribIntu' },
  'Investigação': { treinado: 'Mar Trei inve', mod: 'ModAtribInve' },
  'Jogatina': { treinado: 'Mar Trei joga', mod: 'ModAtribJoga' },
  'Ladinagem': { treinado: 'Mar Trei ladi', mod: 'ModAtribLadi' },
  'Luta': { treinado: 'Mar Trei luta', mod: 'ModAtribLuta' },
  'Misticismo': { treinado: 'Mar Trei misti', mod: 'ModAtribMist' },
  'Nobreza': { treinado: 'Mar Trei nobre', mod: 'ModAtribNobr' },
  'Percepção': { treinado: 'Mar Trei perce', mod: 'ModAtribPerc' },
  'Pilotagem': { treinado: 'Mar Trei pilo', mod: 'ModAtribPilo' },
  'Pontaria': { treinado: 'Mar Trei ponta', mod: 'ModAtribPont' },
  'Reflexos': { treinado: 'Mar Trei refle', mod: 'ModAtribRefl' },
  'Religião': { treinado: 'Mar Trei reli', mod: 'ModAtribReli' },
  'Sobrevivência': { treinado: 'Mar Trei sobre', mod: 'ModAtribSobr' },
  'Vontade': { treinado: 'Mar Trei vonta', mod: 'ModAtribVont' },
};

export async function exportarPDF(personagem: Personagem): Promise<Blob> {
  // Carregar template
  const templateUrl = '/ficha-t20-template.pdf';
  const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Helper para setar texto seguramente
  const setText = (fieldName: string, value: string) => {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
    } catch {
      // Campo nao existe no PDF, ignorar
    }
  };

  const setCheck = (fieldName: string, checked: boolean) => {
    try {
      const field = form.getCheckBox(fieldName);
      if (checked) field.check();
      else field.uncheck();
    } catch {
      // Campo nao existe ou nao e checkbox
    }
  };

  // === INFO BASICA ===
  setText('NOME DO PERSONAGEM', personagem.nome || '');
  setText('RAÇA', personagem.raca?.nome || '');
  setText('CLASSE', personagem.classe?.nome || '');
  setText('ORIGEM', personagem.origem?.nome || '');
  setText('DIVINDADE', personagem.divindade?.nome || '');
  setText('Lv', String(personagem.nivel || 1));

  // === ATRIBUTOS ===
  setText('For', String(personagem.for || 0));
  setText('Des', String(personagem.des || 0));
  setText('Con', String(personagem.con || 0));
  setText('Int', String(personagem.int || 0));
  setText('Sab', String(personagem.sab || 0));
  setText('Car', String(personagem.car || 0));

  // Modificadores (em T20, mod = valor do atributo, mas se quiser separar)
  setText('ModFor', formatMod(personagem.for || 0));
  setText('ModDes', formatMod(personagem.des || 0));
  setText('ModCon', formatMod(personagem.con || 0));
  setText('ModInt', formatMod(personagem.int || 0));
  setText('ModSab', formatMod(personagem.sab || 0));
  setText('ModCar', formatMod(personagem.car || 0));

  // === COMBATE ===
  setText('PVs Totais', String(personagem.pv_total || 0));
  setText('PVs Atuais', String(personagem.pv_total || 0));
  setText('PMs Totais', String(personagem.pm_total || 0));
  setText('PMs Atuais', String(personagem.pm_total || 0));

  const defesa = 10 + (personagem.des || 0);
  setText('CA', String(defesa));
  setText('Base CA', '10');
  setText('Desloc', personagem.raca?.deslocamento ? `${personagem.raca.deslocamento}m` : '9m');

  // === PERICIAS ===
  if (personagem.pericias) {
    for (const pericia of personagem.pericias) {
      const nome = pericia.nome || '';
      const mapping = PERICIAS_MAP[nome];
      if (mapping) {
        setCheck(mapping.treinado, true);
      }
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
      if (partes[1]) setText(`Crítico ${n}`, partes[1]);
      if (partes[2]) setText(`Tipo ${n}`, partes[2]);
      if (partes[3]) setText(`Alcance ${n}`, partes[3]);
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

  // === HABILIDADES E PODERES ===
  setText('HabRaçasOrigem', personagem.raca?.nome || '');

  // === ANOTACOES ===
  setText('Anotações', personagem.anotacoes || '');
  setText('Descrição', personagem.historico || '');

  // Flatten form para que campos fiquem visiveis
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

function formatMod(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
