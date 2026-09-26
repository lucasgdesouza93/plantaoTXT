/* =====================================================================
   MODELOS DE EVOLUÇÃO / ADMISSÃO
   Para criar/editar um modelo, altere o array TEMPLATES abaixo.
   Tipos de campo:
     T  texto curto        A  texto longo (normal: texto do botão "Normal")
     I  botões que inserem "- item" num texto livre editável
     C  escolha única      M  escolha múltipla   (other: campo "outro"; list: sai em tópicos)
     S  lista suspensa     R  linha de subcampos [rótulo, unidade, placeholder, id]
     GCS  Glasgow          CALC  campo calculado  (fn recebe todos os valores)
   Opções comuns: out (rótulo na saída), nolabel (sai sem rótulo), full (linha inteira),
   ph (placeholder), {o|a} em qualquer texto concorda com o Sexo do paciente, part/gather
   (campos com part:'X' saem dentro do campo com gather:'X'), intitle (a escolha sai no
   título, não no corpo), noout (só alimenta cálculos; não sai no texto), detail (o "outro"
   sai entre parênteses após a opção), sep (separador dos itens escolhidos; padrão ", "),
   rows, id (necessário só quando um CALC lê o campo).
   Seção: inline:true junta os campos numa linha só; normalAll:true põe o botão "Tudo normal".
   ===================================================================== */

/* Helpers numéricos: ficam aqui porque as funções dos campos CALC deste arquivo
   os usam por escopo de módulo. O motor também os importa daqui. */
export function num(s) {
  if (s == null || s === '') return null;
  const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}
export const fmtN = n => String(Math.round(n * 10) / 10).replace('.', ',');

const T=(label,o={})=>({t:'text',label,...o});
const A=(label,o={})=>({t:'area',label,...o});
const C=(label,opts,o={})=>({t:'chips',label,opts,...o});
const M=(label,opts,o={})=>({t:'chips',label,opts,multi:true,...o});
const S=(label,opts,o={})=>({t:'select',label,opts,...o});
const R=(label,subs,o={})=>({t:'row',label,fields:subs.map(([l,u,ph,id,out])=>({label:l,unit:u||'',ph:ph||'',id,out})),...o});
const I=(label,opts,o={})=>({t:'insert',label,opts,...o});
const GCS=(o={})=>({t:'gcs',label:'Escala de Coma de Glasgow',...o});
const CALC=(label,fn,o={})=>({t:'calc',label,fn,...o});

export const N={
  geral:'BEG, lúcid{o|a} e orientad{o|a}, corad{o|a}, hidratad{o|a}, acianótic{o|a}, anictéric{o|a}, afebril, eupneic{o|a} em ar ambiente.',
  acv:'RCR em 2T, BNF, sem sopros. Pulsos periféricos palpáveis e simétricos. TEC < 3 s.',
  ar:'MV presente bilateralmente, sem ruídos adventícios. Sem esforço respiratório.',
  abd:'Plano, flácido, RHA presentes, indolor à palpação, sem massas ou visceromegalias. DB negativa.',
  neuro:'Glasgow 15, pupilas isocóricas e fotorreagentes, sem déficits focais, sem sinais meníngeos.',
  ext:'Sem edemas, panturrilhas livres, extremidades aquecidas e bem perfundidas.',
  ecg:'Ritmo sinusal, sem alterações isquêmicas agudas.',
  pele:'Sem lesões por pressão, extremidades aquecidas, sem edemas.',
  sumario:'BEG, lúcid{o|a} e orientad{o|a}, corad{o|a}, hidratad{o|a}, acianótic{o|a}, anictéric{o|a}, afebril.\nACV: RCR em 2T, BNF, sem sopros.\nAR: MV presente bilateralmente, sem ruídos adventícios.\nABD: plano, flácido, RHA presentes, indolor, sem visceromegalias.\nNeuro: sem déficits focais.\nExtremidades: sem edemas, panturrilhas livres.'
};

const VITALS=()=>R('Sinais vitais',[
  ['PA',' mmHg','120x80'],['FC',' bpm','80'],['FR',' irpm','16'],
  ['SpO2','%','97 AA'],['Tax',' °C','36,5'],['HGT',' mg/dL','110']
],{out:'SSVV'});
const EXAM=()=>[
  VITALS(),
  A('Estado geral',{out:'Geral',normal:N.geral}),
  A('Cardiovascular',{out:'ACV',normal:N.acv}),
  A('Respiratório',{out:'AR',normal:N.ar}),
  A('Abdome',{out:'ABD',normal:N.abd}),
  A('Neurológico',{out:'Neuro',normal:N.neuro}),
  A('Extremidades',{normal:N.ext}),
  A('POCUS',{ph:'Pulmão, VCI, coração, FAST...'}),
  A('Outros achados',{out:'Outros'})
];
const IDADE=()=>T('Idade',{unit:' anos',ph:'67'});
const SEXO=(o={})=>C('Sexo',['Masculino','Feminino'],{sex:true,...o});
const ALERGIAS=()=>C('Alergias',['Nega alergias'],{other:'Descrever alergia'});
const COMORB=['HAS','DM2','DM1','Dislipidemia','DRC','ICC','DAC / IAM prévio','FA','AVC prévio','DPOC','Asma','Hepatopatia crônica','Neoplasia','HIV','Hipotireoidismo','Demência','Nega comorbidades'];
const DISPOSITIVOS=['AVP','CVC','PAI','SVD','SNE / SNG','TOT / VM','TQT','Dreno de tórax','Cateter de hemodiálise'];
const DESTINO=['Observação no PS','Sala de emergência'];
const CHEGADA=()=>C('Chegada',['Demanda espontânea','APH móvel'],{other:'Nome do serviço',detail:true});
const ORIGEM=()=>C('Origem',['Domicílio','Via pública','Casa de repouso','APH fixo','Hospital'],{other:'Nome do hospital / serviço',detail:true});
const PERIODO=()=>C('Período',['Diurna','Noturna'],{intitle:true});
const INFORMANTE=()=>C('Informante',['Paciente','Acompanhante','Paciente e acompanhante','Equipe de APH','Encaminhamento/prontuário'],{other:'Outro'});
const PLANO=['Alta após observação','Enfermaria','UTI'];
const PUPILAS=['Isocóricas e fotorreagentes','Anisocoria','Mióticas','Midriáticas fixas','Não avaliáveis'];

export const TEMPLATES=[
{
  id:'admissao', name:'Admissão PS', title:'ADMISSÃO — PRONTO-SOCORRO',
  desc:'Admissão completa de paciente estável no pronto-socorro.',
  sections:[
    {title:'Identificação', inline:true, fields:[
      IDADE(), SEXO(),
      CHEGADA(), ORIGEM(),
      INFORMANTE()
    ]},
    {title:'Queixa principal', fields:[T('Queixa principal',{nolabel:true,full:true,ph:'Dor torácica há 2 horas'})]},
    {title:'História da doença atual', fields:[A('HDA',{nolabel:true,rows:6})]},
    {title:'Antecedentes', fields:[
      M('Comorbidades',COMORB,{other:'Outras',sep:' | '}),
      M('Hábitos',['Tabagismo ativo','Ex-tabagista','Etilismo','Drogas ilícitas','Nega'],{other:'Detalhar (carga tabágica etc.)',sep:' | '}),
      T('Cirurgias / internações prévias',{out:'Cirurgias/internações',full:true}),
      A('Medicações de uso contínuo',{out:'MUC',rows:2}),
      ALERGIAS()
    ]},
    {title:'Exame físico', normalAll:true, fields:EXAM()},
    {title:'Exames complementares', fields:[
      A('Laboratoriais',{out:'Laboratório',ph:'Hb | Leuco | Plaq | Cr | Ur | Na | K | PCR | Lactato'}),
      A('ECG',{normal:N.ecg}),
      A('Imagem')
    ]},
    {title:'Hipóteses diagnósticas', fields:[A('Hipóteses',{nolabel:true,rows:3,ph:'1. \n2. '})]},
    {title:'Conduta', fields:[
      I('Condutas',['Monitorização contínua','Acesso venoso periférico','O2 suplementar','Exames laboratoriais','Hemoculturas (2 pares)','ECG','Radiografia de tórax','Tomografia','Analgesia','Antiemético','Hidratação venosa','Antibioticoterapia','Profilaxia de TEV','Jejum','Dieta liberada','Reavaliação após medidas iniciais'],{nolabel:true,rows:6,ph:'Doses, horários, pendências...'}),
      M('Comunicação',['Paciente informad{o|a} sobre quadro e conduta','Familiar informado','Discutido com especialista'],{other:'Especialidade / nome'})
    ]},
    {title:'Plano e destino', fields:[
      C('Destino',DESTINO,{other:'Outro'}),
      C('Plano',PLANO,{other:'Outro'}),
      A('Detalhes do plano',{nolabel:true})
    ]}
  ]
},
{
  id:'abcde', name:'Sala de emergência (XABCDE)', title:'ADMISSÃO — SALA DE EMERGÊNCIA',
  desc:'Paciente crítico: avaliação primária estruturada, AMPLA e condutas de ressuscitação.',
  sections:[
    {title:'Identificação', inline:true, fields:[
      IDADE(), SEXO(),
      CHEGADA(), ORIGEM(), INFORMANTE(),
      T('Horário de chegada',{ph:'14:20'})
    ]},
    {title:'Motivo / contexto', fields:[
      A('Motivo',{nolabel:true,rows:3,ph:'Encontrad{o|a} rebaixad{o|a} em domicílio, trazid{o|a} por APH móvel...'}),
      T('Alergias',{out:'A'}), T('Medicamentos',{out:'M'}), T('Passado médico',{out:'P'}),
      T('Líquidos / última refeição',{out:'L'}), T('Ambiente / eventos',{out:'A',full:true}),
      A('HDA',{rows:4})
    ]},
    {title:'Avaliação primária', normalAll:true, fields:[
      A('X — Hemorragia exsanguinante',{out:'X',normal:'Sem hemorragia externa exsanguinante.'}),
      M('X — intervenções',['Compressão direta','Curativo compressivo','Tamponamento com agente hemostático','Torniquete'],{out:'Intervenções (X)',other:'Outra'}),
      A('A — Via aérea',{out:'A',normal:'Via aérea pérvia, fonação preservada, sem estridor.'}),
      M('A — intervenções',['Aspiração','Cânula orofaríngea','IOT','Dispositivo supraglótico','Colar cervical'],{out:'Intervenções (A)',other:'Outra'}),
      A('B — Ventilação',{out:'B',normal:'Eupneic{o|a}, expansibilidade simétrica, MV presente bilateralmente sem ruídos adventícios. Traqueia centrada.'}),
      M('B — intervenções',['Cateter nasal','Máscara não reinalante','CNAF','VNI','VM invasiva','Toracocentese / drenagem'],{out:'Intervenções (B)',other:'Outra'}),
      A('C — Circulação',{out:'C',normal:'Pele corada e aquecida, TEC < 3 s, pulsos periféricos cheios e simétricos, sem sangramento externo ativo.'}),
      M('C — intervenções',['AVP','Acesso intraósseo','CVC','Cristaloide','Hemoderivados','Vasopressor','Cardioversão / desfibrilação','Ácido tranexâmico'],{out:'Intervenções (C)',other:'Outra'}),
      GCS({label:'D — Glasgow',part:'D'}),
      S('D — Pupilas',PUPILAS,{out:'Pupilas',part:'D'}),
      A('D — Neurológico',{out:'D',gather:'D',normal:'Sem déficits focais. Glicemia capilar aferida.'}),
      A('E — Exposição',{out:'E',normal:'Sem lesões aparentes à exposição. Normotérmic{o|a}.'}),
      A('POCUS',{ph:'RUSH / eFAST: ...'}),
      VITALS()
    ]},
    {title:'Avaliação secundária', normalAll:true, fields:[
      A('Cabeça e face',{normal:'Sem deformidades, ferimentos ou crepitações. Sem otorragia, rinorragia ou sinais de fratura de base de crânio.'}),
      A('Pescoço',{normal:'Traqueia centrada, sem turgência jugular, sem enfisema subcutâneo. Sem dor à palpação da coluna cervical.'}),
      A('Tórax',{normal:'Expansibilidade simétrica, sem deformidades, crepitações ou enfisema subcutâneo.'}),
      A('Abdome',{normal:'Plano, flácido, indolor, sem sinais de peritonite, equimoses ou distensão.'}),
      A('Pelve e períneo',{out:'Pelve/períneo',normal:'Pelve estável, sem hematoma perineal ou sangramento em meato uretral.'}),
      A('Dorso e coluna',{out:'Dorso/coluna',normal:'Sem deformidades, ferimentos ou dor à palpação de processos espinhosos.'}),
      A('Extremidades',{normal:'Sem deformidades, pulsos distais presentes e simétricos, sem sinais de síndrome compartimental.'}),
      A('Neurológico',{out:'Neuro',normal:'Força e sensibilidade preservadas nos quatro membros, sem déficits focais.'})
    ]},
    {title:'Exames complementares', fields:[
      R('Gasometria',[['pH','','7,32'],['pCO2',' mmHg'],['pO2',' mmHg'],['HCO3',' mEq/L'],['BE',''],['Lactato',' mmol/L']]),
      A('Laboratoriais',{out:'Laboratório'}),
      A('ECG',{normal:N.ecg}),
      A('Imagem')
    ]},
    {title:'Hipóteses diagnósticas', fields:[A('Hipóteses',{nolabel:true,rows:3,ph:'1. \n2. '})]},
    {title:'Conduta', fields:[
      I('Condutas',['Monitorização multiparamétrica','Hemoculturas (2 pares)','Antibioticoterapia na 1ª hora','Sedoanalgesia pós-IOT','SVD com controle de diurese','Protocolo de sepse aberto','Protocolo de AVC acionado','Protocolo de dor torácica acionado','TC de crânio','Profilaxia de TEV'],{nolabel:true,rows:6,ph:'Drogas e doses, parâmetros de VM, metas...'}),
      M('Comunicação',['Familiar informado sobre gravidade','Discutido com especialista','Vaga solicitada à regulação'],{other:'Detalhar'})
    ]},
    {title:'Plano e destino', fields:[
      C('Destino',DESTINO,{other:'Outro'}),
      C('Plano',PLANO,{other:'Outro'}),
      A('Detalhes do plano',{nolabel:true})
    ]}
  ]
},
{
  id:'soap', name:'Evolução diária (SOAP)', title:'EVOLUÇÃO MÉDICA',
  desc:'Evolução de paciente em observação ou internado no PS.',
  sections:[
    {title:'Identificação', fields:[
      PERIODO(), SEXO({noout:true}), T('Leito'), T('Dia de internação',{out:'DIH',ph:'D3'}),
      A('Diagnósticos / problemas ativos',{out:'Diagnósticos',rows:2}),
      M('Dispositivos',DISPOSITIVOS,{other:'Outro / sítio e data'}),
      T('Antimicrobianos',{full:true,ph:'Ceftriaxona D3/7 (início 23/09)'}),
      T('Culturas',{full:true,ph:'HMC 23/09: parcial negativa'})
    ]},
    {title:'Subjetivo', fields:[
      M('Relato',['Sem queixas','Refere melhora','Dor controlada','Aceitando dieta','Diurese espontânea','Evacuações presentes','Sono preservado','Deambulando'],{nolabel:true}),
      A('Queixas / intercorrências',{nolabel:true,ph:'Queixas e intercorrências nas últimas 24 h'})
    ]},
    {title:'Objetivo', normalAll:true, fields:[
      ...EXAM().slice(0,1),
      R('Balanço 24 h',[['Diurese',' mL'],['BH',' mL','+500'],['Evacuações','','1x, pastosa'],['HGT',' mg/dL','110-180']]),
      ...EXAM().slice(1)
    ]},
    {title:'Exames', fields:[
      A('Laboratoriais',{out:'Laboratório',ph:'(24/09 → 25/09) Hb 10,2 → 10,0 | Leuco 15.300 → 11.200 | Cr 1,8 → 1,4'}),
      A('Imagem / outros',{out:'Imagem'})
    ]},
    {title:'Avaliação', fields:[
      C('Evolução',['Melhora clínica','Estável','Piora clínica']),
      A('Impressão',{nolabel:true,rows:3})
    ]},
    {title:'Plano', fields:[
      M('Plano',['Mantidas condutas','Ajuste de antimicrobiano','Descalonamento de antimicrobiano','Solicitados exames de controle','Aguarda vaga de internação (regulação)','Programada alta','Discutido com especialista'],{nolabel:true,list:true,other:'Outro'}),
      A('Detalhes',{nolabel:true})
    ]}
  ]
},
{
  id:'sistemas', name:'Evolução por sistemas (crítico)', title:'EVOLUÇÃO MÉDICA{p} — PACIENTE CRÍTICO',
  desc:'Paciente grave na sala de emergência / UTI, organizado por sistemas.',
  sections:[
    {title:'Identificação', fields:[
      PERIODO(), SEXO({noout:true}), T('Leito'), T('Dia de internação',{out:'DIH',ph:'D3'}), T('Dia de VM',{out:'VM',ph:'D2'}),
      A('Diagnósticos / problemas ativos',{out:'Diagnósticos',rows:2}),
      M('Dispositivos',DISPOSITIVOS,{other:'Outro / sítio e data'})
    ]},
    {title:'Neurológico', fields:[
      T('Sedoanalgesia',{full:true,ph:'Fentanil 100 mcg/h + Midazolam 10 mg/h'}),
      S('RASS',['+4 Combativo','+3 Muito agitado','+2 Agitado','+1 Inquieto','0 Alerta e calmo','-1 Sonolento','-2 Sedação leve','-3 Sedação moderada','-4 Sedação profunda','-5 Não despertável']),
      S('Pupilas',PUPILAS),
      S('CAM-ICU',['Negativo','Positivo','Não avaliável (RASS ≤ -4)']),
      GCS(),
      A('Observações',{out:'Neuro'})
    ]},
    {title:'Hemodinâmico', fields:[
      T('Drogas vasoativas',{out:'DVA',full:true,ph:'Noradrenalina 0,2 mcg/kg/min (em redução)'}),
      R('Parâmetros',[['PAM',' mmHg'],['FC',' bpm'],['Lactato',' mmol/L'],['TEC',' s']],{nolabel:true}),
      C('Ritmo',['Sinusal','Taquicardia sinusal','FA','Flutter','Marca-passo'],{other:'Outro'}),
      A('Exame cardiovascular',{out:'ACV',normal:N.acv})
    ]},
    {title:'Respiratório', fields:[
      C('Suporte',['Ar ambiente','Cateter nasal','Máscara de Venturi','Máscara não reinalante','CNAF','VNI','VM invasiva'],{other:'Detalhar (L/min, FiO2)'}),
      R('Ventilação mecânica',[['Modo','','PCV'],['VC',' mL','420'],['PC / PS',' cmH2O'],['PEEP',' cmH2O','8','peep'],['FiO2','%','40','fio2'],['FR',' irpm'],['Pplatô',' cmH2O','','pplat']],{out:'VM'}),
      CALC('Driving pressure',v=>{const p=num(v.pplat),e=num(v.peep);return (p!=null&&e!=null)?`${fmtN(p-e)} cmH2O`:''},{out:'DP'}),
      R('Gasometria arterial',[['pH','','7,38'],['pCO2',' mmHg'],['pO2',' mmHg','','pao2'],['HCO3',' mEq/L'],['BE',''],['SatO2','%']],{out:'Gasometria'}),
      R('Relação P/F — dados',[['PaO2',' mmHg','80','pf_pao2'],['FiO2','%','40','pf_fio2']],{noout:true}),
      CALC('Relação P/F',v=>{const p=num(v.pf_pao2);let f=num(v.pf_fio2);if(p==null||!f)return '';const fr=f>1?f/100:f;
        return `${Math.round(p/fr)} (PaO2 ${v.pf_pao2.trim()} mmHg / FiO2 ${f>1?fmtN(f)+'%':v.pf_fio2.trim()})`},{out:'P/F'}),
      A('Exame respiratório',{out:'AR',normal:N.ar})
    ]},
    {title:'Renal / metabólico', fields:[
      R('Balanço',[['Diurese',' mL/24h'],['BH',' mL'],['Ur',''],['Cr','']],{nolabel:true}),
      R('Eletrólitos',[['Na',''],['K',''],['Mg',''],['P',''],['Cai','']]),
      C('TRS',['Sem TRS','Hemodiálise intermitente','Hemodiálise contínua'],{other:'Outro'})
    ]},
    {title:'Gastrointestinal / nutrição', fields:[
      C('Dieta',['Zero','VO','SNE','NPT'],{other:'Detalhar (volume, meta)'}),
      T('Evacuações'),
      C('Profilaxia de úlcera de estresse',['IBP','Sem indicação'],{out:'Profilaxia de LAMG'}),
      A('Exame abdominal',{out:'ABD',normal:N.abd})
    ]},
    {title:'Infeccioso', fields:[
      T('Tmax',{unit:' °C',ph:'37,8'}),
      R('Laboratório',[['Leuco',''],['PCR','']],{nolabel:true}),
      T('Antimicrobianos',{full:true,ph:'Piperacilina-tazobactam D4 (início 22/09)'}),
      A('Culturas',{rows:2})
    ]},
    {title:'Hematológico', fields:[
      R('Laboratório',[['Hb',' g/dL'],['Plaq',''],['INR',''],['TTPa','']],{nolabel:true}),
      C('Profilaxia de TEV',['Enoxaparina','HNF','Mecânica','Anticoagulação plena','Contraindicada'],{other:'Detalhar'}),
      T('Hemotransfusão',{full:true})
    ]},
    {title:'Endócrino', fields:[
      T('Glicemias',{ph:'110-180 mg/dL'}),
      T('Insulina',{ph:'Insulina regular conforme protocolo'})
    ]},
    {title:'Pele / extremidades', fields:[A('Pele e extremidades',{nolabel:true,normal:N.pele})]},
    {title:'Problemas e plano por sistema', fields:[
      C('Evolução',['Melhora clínica','Estável','Piora clínica']),
      A('Neurológico',{out:'Neuro',ph:'Reduzir sedação, meta RASS 0 a -1...'}),
      A('Hemodinâmico',{out:'Hemodinâmico',ph:'Desmame de noradrenalina, meta PAM ≥ 65 mmHg...'}),
      A('Respiratório',{out:'Respiratório',ph:'Teste de respiração espontânea...'}),
      A('Renal / metabólico',{out:'Renal/metabólico',ph:'Repor K, balanço neutro...'}),
      A('Gastrointestinal / nutrição',{out:'TGI/nutrição',ph:'Progredir dieta enteral...'}),
      A('Infeccioso',{out:'Infeccioso',ph:'Manter pip-tazo D4/7, aguardar culturas...'}),
      A('Hematológico',{out:'Hemato',ph:'Manter profilaxia de TEV...'}),
      A('Endócrino',{out:'Endócrino',ph:'Alvo glicêmico 140-180 mg/dL...'}),
      A('Pele / extremidades',{out:'Pele',ph:'Mudança de decúbito 2/2 h...'}),
      A('Geral / família / regulação',{out:'Geral',ph:'Boletim à família, vaga de UTI solicitada...'})
    ]}
  ]
},
{
  id:'breve', name:'Atendimento PS / alta', title:'ATENDIMENTO — PRONTO-SOCORRO',
  desc:'Atendimento de menor complexidade com desfecho no próprio plantão (fast track, alta).',
  sections:[
    {title:'Identificação', inline:true, fields:[IDADE(), SEXO()]},
    {title:'Queixa principal', fields:[T('Queixa principal',{nolabel:true,full:true})]},
    {title:'História da doença atual', fields:[A('HDA',{nolabel:true,rows:4})]},
    {title:'Antecedentes', fields:[
      T('Comorbidades',{full:true}), T('Medicações de uso contínuo',{out:'MUC',full:true}), ALERGIAS()
    ]},
    {title:'Exame físico', fields:[VITALS(), A('Exame físico',{nolabel:true,rows:5,normal:N.sumario})]},
    {title:'Exames complementares', fields:[A('Exames',{nolabel:true})]},
    {title:'Hipótese diagnóstica', fields:[A('Hipótese',{nolabel:true,rows:2})]},
    {title:'Conduta no PS', fields:[
      A('Medicações administradas',{out:'Medicações',rows:2}),
      A('Reavaliação',{ph:'Após medicação, refere melhora da dor...'})
    ]},
    {title:'Desfecho', fields:[
      C('Destino',DESTINO,{other:'Outro'}),
      C('Plano',PLANO,{other:'Outro'}),
      M('Orientações',['Orientad{o|a} sobre sinais de alarme e retorno imediato se piora','Receita entregue e explicada','Atestado médico entregue','Encaminhad{o|a} à UBS para seguimento','Encaminhad{o|a} ao ambulatório de especialidade','Paciente compreende e concorda com a conduta'],{nolabel:true,list:true,other:'Outra orientação'}),
      A('Prescrição de alta',{rows:3})
    ]}
  ]
},
{
  id:'intercorrencia', name:'Intercorrência', title:'EVOLUÇÃO — INTERCORRÊNCIA',
  desc:'Registro de intercorrência em paciente já internado ou em observação.',
  sections:[
    {title:'Identificação', inline:true, fields:[
      SEXO({noout:true}), T('Leito'), T('Horário',{ph:'03:15'}),
      C('Acionado por',['Enfermagem','Familiar','Alarme do monitor','Reavaliação de rotina'],{other:'Outro'})
    ]},
    {title:'Motivo', fields:[A('Motivo',{nolabel:true,rows:3,ph:'Chamado pela enfermagem por dessaturação...'})]},
    {title:'Avaliação', normalAll:true, fields:[
      VITALS(),
      GCS(),
      A('Exame direcionado',{nolabel:true,rows:4})
    ]},
    {title:'Hipótese', fields:[A('Hipótese',{nolabel:true,rows:2})]},
    {title:'Conduta', fields:[A('Conduta',{nolabel:true,rows:4})]},
    {title:'Reavaliação', fields:[A('Reavaliação',{nolabel:true,rows:2,ph:'Após 30 min: SpO2 95% em CN 3 L/min, sem desconforto...'})]},
    {title:'Comunicação', fields:[
      M('Comunicado a',['Médico assistente / plantonista','Familiar','Equipe de enfermagem','Especialista','UTI / regulação'],{other:'Detalhar'})
    ]}
  ]
}
];
