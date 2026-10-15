/* =====================================================================
   MODELOS DE PROCEDIMENTO
   Mesmo formato dos modelos de evolução (data/evolucao-modelos.js) e mesmo
   motor, com uma diferença: cada modelo tem prose(v), que escreve o texto
   corrido a partir dos valores preenchidos (v[id]). Frases cujos campos
   ficaram vazios são omitidas. Todo campo usado em prose() precisa de id.
   ===================================================================== */
import { T, A, C, M } from './evolucao-modelos.js';

/* ---------- helpers de texto ---------- */

const txt = (v, id) => (v[id] || '').trim();
// opções marcadas num campo de chips + o texto do "outro", se houver
const pick = (v, id) => [...(v[id] || []), txt(v, id + '__o')].filter(Boolean);
// minúscula inicial, exceto em siglas ("PCR", "ADA", "SNG")
const lower = s => /^[A-ZÀ-Ý0-9]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
const upper = s => s.charAt(0).toUpperCase() + s.slice(1);
// "a, b e c"
const joinE = xs => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1];
// junta frases, cada uma terminando em ponto
const sentences = xs => xs.filter(Boolean).map(s => upper(s.trim().replace(/\.$/, '')) + '.').join(' ');
// lista em frase: só o primeiro item com maiúscula ("Antissepsia e anestesia local")
const firstUp = xs => joinE(xs.map((x, i) => i ? lower(x) : x));
// acrescenta a unidade quando o valor é só número ("300" → "300 mL")
const withU = (x, u) => x ? x + (/^[\d.,\s]+$/.test(x) ? u : '') : '';

export const PROCEDURES = [
{
  id: 'iot', name: 'Intubação Orotraqueal (IOT)', title: 'PROCEDIMENTO — INTUBAÇÃO OROTRAQUEAL',
  desc: 'Descrição de intubação orotraqueal: indicação, indução, laringoscopia, confirmação e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Indicação', ['Insuficiência respiratória aguda', 'Proteção de via aérea (rebaixamento do nível de consciência)', 'PCR', 'Choque refratário', 'Necessidade de procedimento / transporte'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Preparo e indução', fields: [
      M('Preparo', ['Pré-oxigenação', 'Monitorização contínua', 'Acesso venoso pérvio', 'Material de via aérea difícil disponível'], {id: 'prep'}),
      C('Técnica', ['Sequência rápida', 'Intubação sem drogas (PCR)'], {id: 'tec', other: 'Outra'}),
      C('Sedativo / hipnótico', ['Cetamina', 'Etomidato', 'Propofol', 'Midazolam'], {id: 'sed', other: 'Outro'}),
      T('Dose do sedativo', {id: 'sedDose', unit: ' mg', ph: '140'}),
      C('Bloqueador neuromuscular', ['Rocurônio', 'Succinilcolina'], {id: 'bnm', other: 'Outro'}),
      T('Dose do BNM', {id: 'bnmDose', unit: ' mg', ph: '84'})
    ]},
    {title: 'Laringoscopia e tubo', fields: [
      C('Dispositivo', ['Laringoscopia direta', 'Videolaringoscopia'], {id: 'lar'}),
      C('Cormack-Lehane', ['1', '2a', '2b', '3', '4'], {id: 'cl'}),
      M('Adjuvantes', ['Bougie', 'Fio-guia'], {id: 'adj'}),
      T('Tentativas', {id: 'tent', ph: '1'}),
      T('TOT nº', {id: 'tot', ph: '8,0'}),
      T('Fixação na comissura labial', {id: 'fix', unit: ' cm', ph: '22'})
    ]},
    {title: 'Confirmação e pós-procedimento', fields: [
      M('Confirmação', ['Capnografia', 'Ausculta pulmonar bilateral', 'Ausência de ruídos em epigástrio', 'Expansibilidade torácica simétrica', 'Radiografia de tórax'], {id: 'conf'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Dessaturação transitória', 'Hipotensão pós-intubação', 'Intubação esofágica reconhecida e corrigida', 'Broncoaspiração'], {id: 'inter', other: 'Outra'}),
      C('Após o procedimento', ['Mantido em ventilação mecânica protetora sob sedação e analgesia'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}.` : '',
      por ? `IOT realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    // indução: "Sequência rápida com cetamina 140 mg e rocurônio 84 mg"
    const drug = (id, doseId) => {
      const d = pick(v, id)[0], dose = txt(v, doseId);
      if (!d) return '';
      return lower(d) + (dose ? ` ${dose}${/^[\d.,\s]+$/.test(dose) ? ' mg' : ''}` : '');
    };
    const drugs = [drug('sed', 'sedDose'), drug('bnm', 'bnmDose')].filter(Boolean);
    const tec = pick(v, 'tec')[0] || '';
    const induction = tec || drugs.length
      ? (tec || 'Indução') + (drugs.length ? ` com ${joinE(drugs)}` : '')
      : '';

    // laringoscopia: "Videolaringoscopia com visualização de cordas vocais (Cormack 1), com auxílio de bougie, em 1 tentativa"
    const lar = pick(v, 'lar')[0], cl = pick(v, 'cl')[0], adj = pick(v, 'adj'), tent = txt(v, 'tent');
    let laryngo = '';
    if (lar || cl || adj.length || tent) {
      laryngo = (lar || 'Laringoscopia') + ' com visualização de cordas vocais'
        + (cl ? ` (Cormack-Lehane ${cl})` : '')
        + (adj.length ? `, com auxílio de ${lower(joinE(adj))}` : '')
        + (tent ? `, em ${tent} ${tent === '1' ? 'tentativa' : 'tentativas'}` : '');
    }

    // tubo: "Passado TOT nº 8,0, fixado em 22 cm na comissura labial"
    const tot = txt(v, 'tot'), fix = txt(v, 'fix');
    const tube = tot || fix
      ? (tot ? `Passado TOT nº ${tot}` : 'TOT') + (fix ? `, fixado em ${fix}${/^[\d.,\s]+$/.test(fix) ? ' cm' : ''} na comissura labial` : '')
      : '';

    const conf = pick(v, 'conf');
    const inter = pick(v, 'inter');
    const body = sentences([
      joinE(pick(v, 'prep').map((x, i) => i ? lower(x) : x)),
      induction,
      laryngo,
      tube,
      conf.length ? `Confirmação por ${lower(joinE(conf.map(lower)))}` : '',
      inter.length ? joinE(inter.map((x, i) => i ? lower(x) : x)) : '',
      pick(v, 'pos')[0] || ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'crico', name: 'Cricotireoidostomia', title: 'PROCEDIMENTO — CRICOTIREOIDOSTOMIA CIRÚRGICA',
  desc: 'Cricotireoidostomia de emergência pela técnica bisturi-bougie-tubo (incisão vertical): indicação, técnica, tubo, confirmação e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Indicação', ['Falha de via aérea — não intubo, não oxigeno', 'Trauma facial grave', 'Obstrução de via aérea superior'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Técnica', fields: [
      M('Preparo', ['Antissepsia', 'Anestesia local', 'Oxigenação mantida durante o procedimento'], {id: 'prep'}),
      C('Técnica', ['Bisturi-bougie-tubo com incisão vertical'], {id: 'tec', other: 'Outra'}),
      C('Identificação da membrana', ['Palpação', 'Ultrassonografia'], {id: 'ident'}),
      T('TOT nº', {id: 'tot', ph: '6,0'}),
      T('Fixação', {id: 'fix', unit: ' cm', ph: '12'})
    ]},
    {title: 'Confirmação e pós-procedimento', fields: [
      M('Confirmação', ['Capnografia', 'Ausculta pulmonar bilateral', 'Expansibilidade torácica simétrica', 'Radiografia de tórax'], {id: 'conf'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Sangramento local controlado com compressão', 'Falso trajeto reconhecido e corrigido', 'Dessaturação transitória'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Mantido em ventilação mecânica protetora sob sedação e analgesia', 'Solicitada avaliação da cirurgia para traqueostomia'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}.` : '',
      por ? `Cricotireoidostomia realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    const tec = pick(v, 'tec')[0], ident = pick(v, 'ident')[0];
    const identTxt = ident ? `identificação da membrana cricotireoidea por ${lower(ident)}` : 'identificação da membrana cricotireoidea';
    let technique = '';
    if (tec === 'Bisturi-bougie-tubo com incisão vertical') {
      technique = `Técnica bisturi-bougie-tubo: incisão vertical na pele sobre a região cricotireoidea, ${identTxt}, incisão transversal da membrana e inserção de bougie na traqueia`;
    } else if (tec) {
      technique = `Técnica: ${lower(tec)}` + (ident ? `, com ${identTxt}` : '');
    } else if (ident) {
      technique = upper(identTxt);
    }

    // tubo: "Passado TOT nº 6,0 sobre o bougie, com cuff insuflado, fixado em 12 cm"
    const tot = txt(v, 'tot'), fix = txt(v, 'fix');
    const overBougie = tec === 'Bisturi-bougie-tubo com incisão vertical' ? ' sobre o bougie' : '';
    const tube = tot || fix
      ? (tot ? `Passado TOT nº ${tot}${overBougie}, com cuff insuflado` : 'TOT') + (fix ? `, fixado em ${fix}${/^[\d.,\s]+$/.test(fix) ? ' cm' : ''}` : '')
      : '';

    const conf = pick(v, 'conf'), inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      joinE(pick(v, 'prep').map((x, i) => i ? lower(x) : x)),
      technique,
      tube,
      conf.length ? `Confirmação por ${lower(joinE(conf.map(lower)))}` : '',
      inter.length ? joinE(inter.map((x, i) => i ? lower(x) : x)) : '',
      pos.length ? joinE(pos.map((x, i) => i ? lower(x) : x)) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'dreno', name: 'Drenagem Torácica (selo d\'água)', title: 'PROCEDIMENTO — DRENAGEM TORÁCICA',
  desc: 'Drenagem torácica em selo d\'água: lado e indicação, anestesia, local da incisão, dreno, débito inicial e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Lado', ['Direito', 'Esquerdo'], {id: 'lado'}),
      C('Indicação', ['Pneumotórax', 'Pneumotórax hipertensivo', 'Hemotórax', 'Hemopneumotórax', 'Derrame pleural', 'Empiema'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Preparo e anestesia', fields: [
      M('Preparo', ['Antissepsia', 'Anestesia local', 'Sedação e analgesia procedimental'], {id: 'prep'}),
      T('Anestésico local', {id: 'anest', ph: 'lidocaína 2% 10 mL'}),
      T('Sedação e analgesia', {id: 'sed', ph: 'cetamina 50 mg'})
    ]},
    {title: 'Técnica', fields: [
      C('Espaço intercostal', ['4º', '5º'], {id: 'eic', other: 'Outro'}),
      C('Linha', ['Axilar anterior', 'Axilar média'], {id: 'linha'}),
      C('Técnica', ['Dissecção romba com exploração digital', 'Seldinger (pigtail)'], {id: 'tec', other: 'Outra'}),
      T('Dreno nº', {id: 'dreno', ph: '28'}),
      M('Conexão e fixação', ['Conectado a selo d\'água', 'Fixado à pele'], {id: 'cx'})
    ]},
    {title: 'Resultado e pós-procedimento', fields: [
      M('Saída inicial', ['Ar', 'Sangue', 'Líquido sero-hemático', 'Líquido seroso', 'Secreção purulenta'], {id: 'saida', other: 'Outro'}),
      T('Volume inicial', {id: 'vol', unit: ' mL', ph: '300'}),
      M('Dreno', ['Oscilação presente', 'Borbulhamento presente'], {id: 'osc'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Sangramento de parede controlado', 'Dor importante controlada com analgesia'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Melhora do padrão respiratório', 'Solicitada radiografia de tórax de controle'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const lado = pick(v, 'lado')[0], ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}${lado ? (lado === 'Direito' ? ' à direita' : ' à esquerda') : ''}.` : '',
      por ? `Drenagem torácica realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    // "Antissepsia, anestesia local com lidocaína 2% 10 mL e sedação / analgesia procedimental com cetamina 50 mg"
    const anest = txt(v, 'anest'), sed = txt(v, 'sed');
    const prep = pick(v, 'prep').map((x, i) => {
      let s = i ? lower(x) : x;
      if (x === 'Anestesia local' && anest) s += ` com ${anest}`;
      if (x === 'Sedação e analgesia procedimental' && sed) s += ` com ${sed}`;
      return s;
    });

    // "Incisão no 5º EIC na linha axilar média, com dissecção romba até a cavidade pleural e exploração digital"
    const eic = pick(v, 'eic')[0], linha = pick(v, 'linha')[0], tec = pick(v, 'tec')[0];
    let incision = '';
    if (eic || linha) {
      incision = 'Incisão' + (eic ? ` no ${eic} EIC` : '') + (linha ? ` na linha ${lower(linha)}` : '');
    }
    if (tec === 'Dissecção romba com exploração digital') {
      incision = (incision || 'Incisão') + ', com dissecção romba até a cavidade pleural e exploração digital';
    } else if (tec === 'Seldinger (pigtail)') {
      incision = incision ? `${incision}, por técnica de Seldinger` : 'Técnica de Seldinger';
    } else if (tec) {
      incision = incision ? `${incision}, técnica: ${lower(tec)}` : `Técnica: ${lower(tec)}`;
    }

    // "Introduzido dreno nº 28, conectado a selo d'água e fixado à pele"
    const dreno = txt(v, 'dreno'), cx = pick(v, 'cx').map(lower);
    const drain = dreno || cx.length
      ? (dreno ? `Introduzido dreno nº ${dreno}` : 'Dreno') + (cx.length ? `, ${joinE(cx)}` : '')
      : '';

    const saida = pick(v, 'saida'), vol = txt(v, 'vol');
    const volTxt = vol ? `${vol}${/^[\d.,\s]+$/.test(vol) ? ' mL' : ''}` : '';
    const output = saida.length
      ? `Saída inicial de ${lower(joinE(saida.map(lower)))}${volTxt ? ` (cerca de ${volTxt})` : ''}`
      : volTxt ? `Débito inicial de ${volTxt}` : '';

    const osc = pick(v, 'osc'), inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      lado ? `Drenagem torácica em hemitórax ${lower(lado)}` : '',
      firstUp(prep),
      incision,
      drain,
      output,
      osc.length ? firstUp(osc) : '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'toraco', name: 'Toracocentese', title: 'PROCEDIMENTO — TORACOCENTESE',
  desc: 'Toracocentese diagnóstica e/ou de alívio: lado e indicação, local da punção, aspecto e volume do líquido, exames enviados e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Lado', ['Direito', 'Esquerdo'], {id: 'lado'}),
      C('Indicação', ['Derrame pleural', 'Suspeita de empiema', 'Hemotórax'], {id: 'ind', other: 'Outra'}),
      M('Finalidade', ['Diagnóstica', 'De alívio'], {id: 'fin'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Técnica', fields: [
      C('Posição', ['Sentado', 'Decúbito lateral'], {id: 'posicao'}),
      M('Preparo', ['Antissepsia', 'Anestesia local'], {id: 'prep'}),
      T('Anestésico local', {id: 'anest', ph: 'lidocaína 2% 5 mL'}),
      C('Guia', ['Guiada por ultrassonografia', 'Por reparos anatômicos'], {id: 'guia'}),
      C('Espaço intercostal', ['7º', '8º', '9º'], {id: 'eic', other: 'Outro'}),
      C('Linha', ['Axilar média', 'Axilar posterior', 'Escapular'], {id: 'linha'}),
      T('Material', {id: 'mat', ph: 'jelco 14G'})
    ]},
    {title: 'Líquido e pós-procedimento', fields: [
      M('Aspecto do líquido', ['Citrino', 'Sero-hemático', 'Hemático', 'Turvo', 'Purulento', 'Quiloso'], {id: 'asp', other: 'Outro'}),
      T('Volume drenado', {id: 'vol', unit: ' mL', ph: '800'}),
      M('Material enviado para', ['Bioquímica (proteínas, LDH, glicose, pH)', 'Citologia oncótica', 'Celularidade total e diferencial', 'Bacterioscopia (Gram)', 'Cultura', 'ADA', 'BAAR'], {id: 'exames', other: 'Outro'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Tosse', 'Dor torácica', 'Reação vasovagal', 'Pneumotórax'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Melhora da dispneia', 'Solicitada radiografia de tórax de controle'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const lado = pick(v, 'lado')[0], ind = pick(v, 'ind'), fin = pick(v, 'fin'), por = txt(v, 'por');
    const side = lado ? (lado === 'Direito' ? ' à direita' : ' à esquerda') : '';
    const head = [
      ind.length || fin.length
        ? 'Indicação: ' + [fin.length ? `toracocentese ${lower(joinE(fin.map(lower)))}` : '', ind.length ? (fin.length ? 'por ' : '') + lower(joinE(ind)) + side : ''].filter(Boolean).join(' ') + '.'
        : '',
      por ? `Toracocentese realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    const posicao = pick(v, 'posicao')[0];
    const anest = txt(v, 'anest');
    const prep = pick(v, 'prep').map(x => x === 'Anestesia local' && anest ? `${x} com ${anest}` : x);

    // "Punção no 8º EIC na linha axilar posterior, guiada por ultrassonografia, com jelco 14G"
    const eic = pick(v, 'eic')[0], linha = pick(v, 'linha')[0], guia = pick(v, 'guia')[0], mat = txt(v, 'mat');
    const puncture = eic || linha || guia || mat
      ? 'Punção' + (eic ? ` no ${eic} EIC` : '') + (linha ? ` na linha ${lower(linha)}` : '')
        + (guia ? `, ${lower(guia)}` : '') + (mat ? `, com ${mat}` : '')
      : '';

    // "Drenados 800 mL de líquido citrino"
    const asp = pick(v, 'asp'), vol = withU(txt(v, 'vol'), ' mL');
    const fluid = asp.length || vol
      ? (vol ? `Drenados ${vol}` : 'Obtido') + (asp.length ? ` de líquido ${lower(joinE(asp.map(lower)))}` : '')
      : '';

    const exames = pick(v, 'exames'), inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      lado ? `Toracocentese em hemitórax ${lower(lado)}` : '',
      posicao ? `Paciente em ${posicao === 'Sentado' ? 'posição sentada' : lower(posicao)}` : '',
      firstUp(prep),
      puncture,
      fluid,
      exames.length ? `Material enviado para ${lower(joinE(exames.map(lower)))}` : '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'toracotomia', name: 'Toracotomia de Reanimação', title: 'PROCEDIMENTO — TORACOTOMIA DE REANIMAÇÃO',
  desc: 'Toracotomia de reanimação na sala de emergência: indicação, acesso, achados, manobras realizadas e desfecho.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Indicação', ['PCR traumática — trauma penetrante torácico', 'PCR traumática — trauma contuso', 'Choque refratário com suspeita de tamponamento'], {id: 'ind', other: 'Outra'}),
      T('Tempo de PCR até a toracotomia', {id: 'tempo', unit: ' min', ph: '5'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Técnica e achados', fields: [
      C('Acesso', ['Toracotomia anterolateral esquerda', 'Toracotomia bilateral (clamshell)'], {id: 'acesso', other: 'Outro'}),
      C('Espaço intercostal', ['4º', '5º'], {id: 'eic'}),
      M('Manobras realizadas', ['Pericardiotomia com drenagem de tamponamento', 'Massagem cardíaca interna', 'Rafia de lesão cardíaca', 'Clampeamento de aorta descendente', 'Clampeamento de hilo pulmonar', 'Desfibrilação interna'], {id: 'manobras', other: 'Outra'}),
      A('Achados', {id: 'achados', ph: 'Tamponamento cardíaco com lesão de VD de 2 cm...'})
    ]},
    {title: 'Desfecho', fields: [
      C('Desfecho', ['Retorno da circulação espontânea', 'Sem retorno da circulação espontânea — óbito'], {id: 'desfecho', other: 'Outro'}),
      T('Horário', {id: 'hora', ph: '14:35'}),
      M('Intercorrências', ['Sem intercorrências adicionais'], {id: 'inter', other: 'Descrever'}),
      M('Após o procedimento', ['Encaminhado ao centro cirúrgico', 'Cirurgia torácica / geral acionada'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), tempo = withU(txt(v, 'tempo'), ' min'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}${tempo ? ` (tempo de PCR até a toracotomia: ${tempo})` : ''}.` : '',
      por ? `Toracotomia de reanimação realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    // "Toracotomia anterolateral esquerda no 4º EIC"
    const acesso = pick(v, 'acesso')[0], eic = pick(v, 'eic')[0];
    const access = acesso || eic ? (acesso || 'Toracotomia') + (eic ? ` no ${eic} EIC` : '') : '';

    const manobras = pick(v, 'manobras');
    const achados = txt(v, 'achados');

    // desfecho com horário: "Retorno da circulação espontânea às 14:35" / "Óbito constatado às 14:35"
    const desf = pick(v, 'desfecho')[0], hora = txt(v, 'hora'), as = hora ? ` às ${hora}` : '';
    let outcome = '';
    if (desf === 'Retorno da circulação espontânea') outcome = `Retorno da circulação espontânea${as}`;
    else if (desf === 'Sem retorno da circulação espontânea — óbito') outcome = `Sem retorno da circulação espontânea. Óbito constatado${as}`;
    else if (desf) outcome = desf + as;

    const inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      access,
      achados ? `Achados: ${lower(achados.replace(/\.$/, ''))}` : '',
      manobras.length ? `Manobras realizadas: ${lower(joinE(manobras.map(lower)))}` : '',
      outcome,
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'cve', name: 'Cardioversão Elétrica Sincronizada', title: 'PROCEDIMENTO — CARDIOVERSÃO ELÉTRICA SINCRONIZADA',
  desc: 'Cardioversão elétrica sincronizada: ritmo e critérios de instabilidade, sedação, choques aplicados, resultado e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Ritmo', ['Fibrilação atrial', 'Flutter atrial', 'Taquicardia supraventricular', 'Taquicardia ventricular monomórfica com pulso'], {id: 'ritmo', other: 'Outro'}),
      M('Instabilidade', ['Hipotensão', 'Rebaixamento do nível de consciência', 'Dor torácica isquêmica', 'Congestão pulmonar', 'Sinais de choque'], {id: 'instab', other: 'Outro'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Preparo e sedação', fields: [
      M('Preparo', ['Monitorização contínua', 'O2 suplementar', 'Acesso venoso pérvio', 'Material de via aérea disponível'], {id: 'prep'}),
      C('Sedativo', ['Etomidato', 'Propofol', 'Midazolam', 'Cetamina'], {id: 'sed', other: 'Outro'}),
      T('Dose do sedativo', {id: 'sedDose', unit: ' mg', ph: '20'}),
      C('Analgésico', ['Fentanil'], {id: 'analg', other: 'Outro'}),
      T('Dose do analgésico', {id: 'analgDose', unit: ' mcg', ph: '50'})
    ]},
    {title: 'Choques', fields: [
      C('Desfibrilador', ['Bifásico', 'Monofásico'], {id: 'aparelho'}),
      C('Posição das pás', ['Anterolateral', 'Anteroposterior'], {id: 'pas'}),
      T('Choques aplicados', {id: 'choques', unit: ' J', ph: '120, 150'})
    ]},
    {title: 'Resultado e pós-procedimento', fields: [
      C('Resultado', ['Reversão para ritmo sinusal', 'Sem reversão do ritmo'], {id: 'res', other: 'Outro'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Hipotensão transitória', 'Depressão respiratória transitória', 'Bradicardia pós-cardioversão', 'Queimadura de pele'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Mantido monitorizado', 'ECG pós-procedimento realizado', 'Iniciada anticoagulação'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ritmo = pick(v, 'ritmo'), instab = pick(v, 'instab'), por = txt(v, 'por');
    const instTxt = instab.length ? `instabilidade (${lower(joinE(instab.map(lower)))})` : '';
    const head = [
      ritmo.length || instab.length
        ? 'Indicação: ' + [ritmo.length ? lower(joinE(ritmo)) : 'taquiarritmia', instTxt ? `com ${instTxt}` : ''].filter(Boolean).join(' ') + '.'
        : '',
      por ? `Cardioversão elétrica realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    // "Sedação com etomidato 20 mg e fentanil 50 mcg"
    const drug = (id, doseId, unit) => {
      const d = pick(v, id)[0], dose = withU(txt(v, doseId), unit);
      return d ? lower(d) + (dose ? ` ${dose}` : '') : '';
    };
    const drugs = [drug('sed', 'sedDose', ' mg'), drug('analg', 'analgDose', ' mcg')].filter(Boolean);

    // "120, 150" → "Aplicados 2 choques sincronizados (120 J e 150 J), com desfibrilador bifásico, pás em posição anterolateral"
    const shots = txt(v, 'choques').split(/\s*(?:,|;|\be\b|\+)\s*/).map(s => s.trim()).filter(Boolean)
      .map(s => withU(s.replace(/\s*J$/i, ''), ' J'));
    const aparelho = pick(v, 'aparelho')[0], pas = pick(v, 'pas')[0];
    let shocks = '';
    if (shots.length === 1) shocks = `Aplicado choque sincronizado de ${shots[0]}`;
    else if (shots.length > 1) shocks = `Aplicados ${shots.length} choques sincronizados (${joinE(shots)})`;
    if (aparelho || pas) {
      const extra = [aparelho ? `desfibrilador ${lower(aparelho)}` : '', pas ? `pás em posição ${lower(pas)}` : ''].filter(Boolean).join(', ');
      shocks = shocks ? `${shocks}, com ${extra}` : upper(extra);
    }

    const res = pick(v, 'res')[0], inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      firstUp(pick(v, 'prep')),
      drugs.length ? `Sedação com ${joinE(drugs)}` : '',
      shocks,
      res || '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'mptv', name: 'Marcapasso Transvenoso', title: 'PROCEDIMENTO — MARCAPASSO TRANSVENOSO TEMPORÁRIO',
  desc: 'Implante de marcapasso transvenoso temporário: indicação, acesso, posicionamento do eletrodo, captura e parâmetros programados.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Indicação', ['BAVT com instabilidade hemodinâmica', 'BAV de 2º grau Mobitz II sintomático', 'Bradicardia sintomática refratária a drogas', 'Intoxicação (betabloqueador / bloqueador de canal de cálcio / digital)'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Acesso e posicionamento', fields: [
      M('Preparo', ['Antissepsia', 'Paramentação estéril completa', 'Anestesia local', 'Marcapasso transcutâneo como ponte'], {id: 'prep'}),
      T('Anestésico local', {id: 'anest', ph: 'lidocaína 2% 5 mL'}),
      C('Acesso', ['Veia jugular interna direita', 'Veia jugular interna esquerda', 'Veia subclávia esquerda', 'Veia femoral direita'], {id: 'acesso', other: 'Outro'}),
      C('Punção', ['Guiada por ultrassonografia', 'Por reparos anatômicos'], {id: 'guia'}),
      C('Posicionamento do eletrodo', ['Guiado por ECG intracavitário', 'Guiado por ultrassonografia', 'Guiado pela captura no monitor'], {id: 'posic', other: 'Outro'}),
      T('Eletrodo fixado em', {id: 'fix', unit: ' cm', ph: '40'})
    ]},
    {title: 'Captura e parâmetros', fields: [
      M('Captura', ['Captura elétrica', 'Captura mecânica (pulso palpável)'], {id: 'capt'}),
      C('Modo', ['VVI'], {id: 'modo', other: 'Outro'}),
      T('Frequência', {id: 'fc', unit: ' bpm', ph: '70'}),
      T('Output', {id: 'output', unit: ' mA', ph: '5'}),
      T('Limiar de captura', {id: 'limiar', unit: ' mA', ph: '0,8'})
    ]},
    {title: 'Pós-procedimento', fields: [
      M('Intercorrências', ['Sem intercorrências imediatas', 'Arritmia ventricular transitória durante a passagem', 'Punção arterial inadvertida, controlada com compressão'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Mantido monitorizado', 'Solicitada radiografia de tórax de controle', 'Cardiologia acionada para marcapasso definitivo'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}.` : '',
      por ? `Marcapasso transvenoso implantado por ${por}.` : ''
    ].filter(Boolean).join('\n');

    const anest = txt(v, 'anest');
    const prep = pick(v, 'prep').map(x => x === 'Anestesia local' && anest ? `${x} com ${anest}` : x);

    // "Punção de veia jugular interna direita, guiada por ultrassonografia"
    const acesso = pick(v, 'acesso')[0], guia = pick(v, 'guia')[0];
    const access = acesso ? `Punção de ${lower(acesso)}${guia ? `, ${lower(guia)}` : ''}` : guia ? `Punção venosa central ${lower(guia)}` : '';

    // "Progressão do eletrodo até o ventrículo direito, guiado por ECG intracavitário, fixado em 40 cm"
    const posic = pick(v, 'posic')[0], fix = withU(txt(v, 'fix'), ' cm');
    const electrode = posic || fix
      ? 'Progressão do eletrodo até o ventrículo direito' + (posic ? `, ${lower(posic)}` : '') + (fix ? `, fixado em ${fix}` : '')
      : '';

    const capt = pick(v, 'capt');
    // "Programado em modo VVI, FC 70 bpm, output 5 mA (limiar de captura 0,8 mA)"
    const modo = pick(v, 'modo')[0], fc = withU(txt(v, 'fc'), ' bpm'), out = withU(txt(v, 'output'), ' mA'), lim = withU(txt(v, 'limiar'), ' mA');
    const params = [modo ? `modo ${modo}` : '', fc ? `FC ${fc}` : '', out ? `output ${out}` : ''].filter(Boolean).join(', ');
    const program = params || lim
      ? (params ? `Programado em ${params}` : '') + (lim ? `${params ? ' ' : ''}(limiar de captura ${lim})` : '')
      : '';

    const inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      firstUp(prep),
      access,
      electrode,
      capt.length ? `Obtida ${lower(joinE(capt.map(lower)))}` : '',
      params ? program : lim ? `Limiar de captura ${lim}` : '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'cvc', name: 'Acesso Venoso Central (CVC)', title: 'PROCEDIMENTO — ACESSO VENOSO CENTRAL',
  desc: 'Punção de acesso venoso central: indicação, barreira máxima, sítio, guia por ultrassonografia, cateter, confirmação e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      M('Indicação', ['Infusão de drogas vasoativas', 'Acesso venoso periférico difícil', 'Monitorização hemodinâmica', 'Infusão de soluções irritantes', 'Nutrição parenteral', 'Hemodiálise'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Preparo', fields: [
      M('Preparo', ['Higienização das mãos', 'Paramentação com barreira máxima', 'Antissepsia com clorexidina alcoólica', 'Campo estéril amplo', 'Anestesia local'], {id: 'prep'}),
      T('Anestésico local', {id: 'anest', ph: 'lidocaína 2% 5 mL'})
    ]},
    {title: 'Punção e cateter', fields: [
      C('Sítio', ['Veia jugular interna direita', 'Veia jugular interna esquerda', 'Veia subclávia direita', 'Veia subclávia esquerda', 'Veia femoral direita', 'Veia femoral esquerda'], {id: 'sitio', other: 'Outro'}),
      C('Punção', ['Guiada por ultrassonografia em tempo real', 'Por reparos anatômicos'], {id: 'guia'}),
      T('Tentativas', {id: 'tent', ph: '1'}),
      C('Cateter', ['Duplo lúmen', 'Triplo lúmen', 'Cateter de hemodiálise'], {id: 'cat', other: 'Outro'}),
      T('Calibre', {id: 'cal', ph: '7 Fr'}),
      T('Posicionado em', {id: 'fix', unit: ' cm', ph: '15'})
    ]},
    {title: 'Confirmação e pós-procedimento', fields: [
      M('Confirmação', ['Refluxo sanguíneo adequado em todas as vias', 'Fio-guia visualizado na veia por ultrassonografia', 'Bubble test positivo (microbolhas no átrio direito à ultrassonografia)'], {id: 'conf'}),
      M('Fixação', ['Fixado com ponto', 'Curativo estéril transparente'], {id: 'cur'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Punção arterial inadvertida, controlada com compressão', 'Arritmia transitória durante a passagem do fio-guia', 'Pneumotórax'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Solicitada radiografia de tórax de controle', 'Liberado para uso'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind.map(lower)))}.` : '',
      por ? `Acesso venoso central realizado por ${por}.` : ''
    ].filter(Boolean).join('\n');

    const anest = txt(v, 'anest');
    const prep = pick(v, 'prep').map(x => x === 'Anestesia local' && anest ? `${x} com ${anest}` : x);

    // "Punção de veia jugular interna direita, guiada por ultrassonografia em tempo real, em 1 tentativa"
    const sitio = pick(v, 'sitio')[0], guia = pick(v, 'guia')[0], tent = txt(v, 'tent');
    const puncture = sitio || guia || tent
      ? (sitio ? `Punção de ${lower(sitio)}` : 'Punção venosa central')
        + (guia ? `, ${lower(guia)}` : '') + (tent ? `, em ${tent} ${tent === '1' ? 'tentativa' : 'tentativas'}` : '')
      : '';

    // "Passado cateter venoso central triplo lúmen 7 Fr pela técnica de Seldinger, posicionado em 15 cm"
    const cat = pick(v, 'cat')[0], cal = txt(v, 'cal'), fix = withU(txt(v, 'fix'), ' cm');
    let catheter = '';
    if (cat || cal || fix) {
      const name = cat === 'Cateter de hemodiálise' ? 'cateter de hemodiálise'
        : `cateter venoso central${cat ? ' ' + lower(cat) : ''}`;
      catheter = `Passado ${name}${cal ? ' ' + cal : ''} pela técnica de Seldinger` + (fix ? `, posicionado em ${fix}` : '');
    }

    const conf = pick(v, 'conf'), cur = pick(v, 'cur'), inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      firstUp(prep),
      puncture,
      catheter,
      conf.length ? firstUp(conf) : '',
      cur.length ? firstUp(cur) : '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
},
{
  id: 'pericardio', name: 'Pericardiocentese', title: 'PROCEDIMENTO — PERICARDIOCENTESE',
  desc: 'Pericardiocentese: indicação, via de acesso, guia por ultrassonografia, líquido drenado, resposta hemodinâmica e intercorrências.',
  copyLabel: 'Copiar descrição',
  sections: [
    {title: 'Indicação', fields: [
      C('Indicação', ['Tamponamento cardíaco com instabilidade hemodinâmica', 'PCR com suspeita de tamponamento', 'Derrame pericárdico volumoso (diagnóstica)'], {id: 'ind', other: 'Outra'}),
      T('Realizada por', {id: 'por', full: true, ph: 'Dr(a). Nome — CRM'})
    ]},
    {title: 'Técnica', fields: [
      M('Preparo', ['Monitorização contínua', 'Antissepsia', 'Anestesia local'], {id: 'prep'}),
      T('Anestésico local', {id: 'anest', ph: 'lidocaína 2% 5 mL'}),
      C('Via', ['Subxifoide', 'Apical', 'Paraesternal esquerda'], {id: 'via', other: 'Outra'}),
      C('Guia', ['Guiada por ultrassonografia', 'Às cegas (emergência)'], {id: 'guia'}),
      T('Material', {id: 'mat', ph: 'jelco 16G'}),
      C('Drenagem', ['Aspiração apenas', 'Cateter duplo lúmen', 'Cateter pigtail'], {id: 'dren', other: 'Outro cateter'})
    ]},
    {title: 'Resultado e pós-procedimento', fields: [
      M('Aspecto do líquido', ['Hemático', 'Sero-hemático', 'Citrino', 'Purulento'], {id: 'asp', other: 'Outro'}),
      T('Volume drenado', {id: 'vol', unit: ' mL', ph: '150'}),
      M('Resposta', ['Melhora hemodinâmica', 'Retorno da circulação espontânea', 'Sem melhora hemodinâmica'], {id: 'resp', other: 'Outra'}),
      M('Material enviado para', ['Bioquímica', 'Citologia oncótica', 'Bacterioscopia (Gram)', 'Cultura', 'ADA'], {id: 'exames', other: 'Outro'}),
      M('Intercorrências', ['Sem intercorrências imediatas', 'Arritmia transitória', 'Punção de câmara cardíaca, sem repercussão', 'Pneumotórax'], {id: 'inter', other: 'Outra'}),
      M('Após o procedimento', ['Mantido monitorizado', 'Solicitado ecocardiograma de controle', 'Cirurgia cardíaca acionada'], {id: 'pos', other: 'Outro'}),
      A('Observações', {id: 'obs'})
    ]}
  ],
  prose: v => {
    const ind = pick(v, 'ind'), por = txt(v, 'por');
    const head = [
      ind.length ? `Indicação: ${lower(joinE(ind))}.` : '',
      por ? `Pericardiocentese realizada por ${por}.` : ''
    ].filter(Boolean).join('\n');

    const anest = txt(v, 'anest');
    const prep = pick(v, 'prep').map(x => x === 'Anestesia local' && anest ? `${x} com ${anest}` : x);

    // "Punção pericárdica por via subxifoide, guiada por ultrassonografia, com jelco 16G"
    const via = pick(v, 'via')[0], guia = pick(v, 'guia')[0], mat = txt(v, 'mat');
    const puncture = via || guia || mat
      ? 'Punção pericárdica' + (via ? ` por via ${lower(via)}` : '') + (guia ? `, ${lower(guia)}` : '') + (mat ? `, com ${mat}` : '')
      : '';

    // "Drenados 150 mL de líquido hemático"
    const asp = pick(v, 'asp'), vol = withU(txt(v, 'vol'), ' mL');
    const fluid = asp.length || vol
      ? (vol ? `Drenados ${vol}` : 'Obtido') + (asp.length ? ` de líquido ${lower(joinE(asp.map(lower)))}` : '')
      : '';

    // "Deixado cateter duplo lúmen no saco pericárdico, pela técnica de Seldinger, para drenagem"
    const dren = pick(v, 'dren')[0];
    let drain = '';
    if (dren === 'Aspiração apenas') drain = 'Realizada aspiração, sem manutenção de cateter';
    else if (dren === 'Cateter duplo lúmen') drain = 'Deixado cateter duplo lúmen no saco pericárdico, pela técnica de Seldinger, para drenagem';
    else if (dren) drain = `Deixado ${lower(dren)} no saco pericárdico para drenagem`;

    const resp = pick(v, 'resp'), exames = pick(v, 'exames'), inter = pick(v, 'inter'), pos = pick(v, 'pos');
    const body = sentences([
      firstUp(prep),
      puncture,
      fluid,
      drain,
      resp.length ? firstUp(resp) : '',
      exames.length ? `Material enviado para ${lower(joinE(exames.map(lower)))}` : '',
      inter.length ? firstUp(inter) : '',
      pos.length ? firstUp(pos) : ''
    ]);

    return [head, body, txt(v, 'obs')].filter(Boolean).join('\n');
  }
}
];
