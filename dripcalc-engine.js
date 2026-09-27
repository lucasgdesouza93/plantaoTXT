/* =====================================================================
   DRIPCALC — CALCULADORA DE INFUSÃO, BOLUS E FLUIDOS
   Porte do app DripCalc para dentro do PlantãoTXT. Os cálculos e os
   presets vêm sem alteração de dripcalc/ (calc.js, data.js, constants.js);
   este módulo só monta a interface dentro de um container.
   Estado no sessionStorage (some ao fechar a aba), como a evolução.
   ===================================================================== */
import { UNIT, DEFAULT_MODE, DEFAULT_INFUSION_UNIT, DEFAULT_BOLUS_UNIT, DEFAULT_TIME_UNIT } from './dripcalc/constants.js';
import { buildCatalogForMode, detectDrug, infusionUnits, infusionUnitOptions, ivPushUnitOptions } from './dripcalc/data.js';
import {
  calculateConcentration,
  calculateFluidPumpRate,
  calculateForwardRate,
  calculateIvPushVolume,
  calculateReverseRate,
  formatNumber,
  formatUnit,
  isPositiveNumber,
  needsWeight,
  parseLocaleNumber
} from './dripcalc/calc.js';

const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k);
  return e;
};

const MODES = [
  { id: 'forward', label: 'Dose → mL/h', copy: 'Selecione a droga, informe a dose prescrita e a diluição para descobrir a velocidade da bomba.' },
  { id: 'reverse', label: 'mL/h → Dose', copy: 'Informe a velocidade atual da bomba e a diluição para descobrir a dose entregue.' },
  { id: 'bolus', label: 'Bolus', copy: 'Informe a dose desejada e a apresentação para descobrir o volume a administrar.' },
  { id: 'infusion', label: 'Infusão', copy: 'Informe volume e tempo para calcular a taxa de infusão em mL/h.' }
];

const AMOUNT_UNIT_OPTIONS = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'units', label: 'UI' },
  { value: 'g', label: 'g' }
];
const TIME_UNIT_OPTIONS = [
  { value: 'min', label: 'min' },
  { value: 'hr', label: 'h' }
];

// Unidades de dose em UI só combinam com solução em UI (e massa com massa).
const UNITS_FAMILY = [UNIT.UNITS_MIN, UNIT.UNITS_HR, UNIT.UNITS_KG, UNIT.UNITS, 'units'];
const isUnitsFamily = u => UNITS_FAMILY.includes(u);

/* ---------- estado (sessionStorage: some ao fechar a aba) ---------- */
const KEY = 'dripcalc.v1';
const FIELD_IDS = ['drug', 'weight', 'dose', 'unit', 'rate', 'amount', 'amountUnit', 'volume', 'infusionTime', 'infusionTimeUnit'];

function loadState() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY));
    return s && typeof s === 'object' ? s : null;
  } catch (e) { return null; }
}
const save = () => {
  if (!cur) return;
  const data = { mode: cur.mode };
  FIELD_IDS.forEach(id => { data[id] = cur.f[id].value; });
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
};

/* ---------- contexto da montagem ativa ---------- */
// Só uma calculadora fica montada por vez; cur guarda os nós e o modo.
let cur = null;

function fillSelect(select, options, selected, fallback) {
  select.innerHTML = '';
  options.forEach(({ value, label }) => select.append(el('option', { value }, label)));
  const has = v => options.some(o => o.value === v);
  select.value = has(selected) ? selected : has(fallback) ? fallback : (options[0] || {}).value;
}

function renderDrugOptions() {
  const { drug } = cur.f;
  const selectedName = cur.catalog[Number(drug.value)]?.name;
  cur.catalog = buildCatalogForMode(cur.mode);
  drug.innerHTML = '';
  drug.append(el('option', { value: '' }, 'Selecione um preset de bomba ou apresentação'));
  ['Presets de bomba', 'Ampolas / frascos'].forEach(group => {
    const og = el('optgroup', { label: group });
    cur.catalog.forEach((item, i) => { if (item.group === group) og.append(el('option', { value: String(i) }, item.name)); });
    if (og.children.length) drug.append(og);
  });
  const idx = cur.catalog.findIndex(item => item.name === selectedName);
  drug.value = idx >= 0 ? String(idx) : '';
}

// Preenche a diluição do preset escolhido e a unidade típica da droga.
function applySelection() {
  const item = cur.catalog[Number(cur.f.drug.value)];
  if (!item || cur.f.drug.value === '') return;
  cur.f.amount.value = item.amount != null ? String(item.amount) : '';
  cur.f.amountUnit.value = item.unit || cur.f.amountUnit.value;
  cur.f.volume.value = item.vol != null ? String(item.vol) : '';
  const drugName = detectDrug(item.name);
  if (drugName && infusionUnits[drugName]) cur.f.unit.value = infusionUnits[drugName];
}

function syncFields() {
  const m = cur.mode, pump = m === 'forward' || m === 'reverse';
  const show = {
    drug: pump,
    weight: pump && needsWeight(cur.f.unit.value),
    dose: m === 'forward' || m === 'bolus',
    unit: m !== 'infusion',
    rate: m === 'reverse',
    amount: m !== 'infusion',
    amountUnit: m !== 'infusion',
    volume: true,
    infusionTime: m === 'infusion',
    infusionTimeUnit: m === 'infusion'
  };
  FIELD_IDS.forEach(id => {
    cur.wraps[id].hidden = !show[id];
    cur.f[id].disabled = !show[id];
  });
  cur.labels.dose.textContent = m === 'bolus' ? 'Dose desejada' : 'Dose';
  cur.labels.amount.textContent = m === 'bolus' ? 'Dose total na apresentação' : 'Dose total na solução';
  cur.intro.textContent = MODES.find(x => x.id === m).copy;
  cur.tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === m)));
}

function setMode(mode) {
  cur.mode = mode;
  const bolus = mode === 'bolus';
  fillSelect(cur.f.unit, bolus ? ivPushUnitOptions : infusionUnitOptions, cur.f.unit.value,
    bolus ? DEFAULT_BOLUS_UNIT : DEFAULT_INFUSION_UNIT);
  renderDrugOptions();
  syncFields();
}

/* ---------- cálculo ---------- */

const val = id => parseLocaleNumber(cur.f[id].value);
const n = (x, d = 2) => formatNumber(x, d);
const concLabel = u => (isUnitsFamily(u) ? 'UI' : 'mcg') + '/mL';
const drugName = () => cur.f.drug.value !== '' ? cur.catalog[Number(cur.f.drug.value)]?.name : '';

function hasMinimumData() {
  const m = cur.mode;
  if (m === 'infusion') return isPositiveNumber(val('volume')) && isPositiveNumber(val('infusionTime'));
  if (!isPositiveNumber(val('amount')) || !isPositiveNumber(val('volume'))) return false;
  if (m === 'bolus') return isPositiveNumber(val('dose'));
  if (needsWeight(cur.f.unit.value) && !isPositiveNumber(val('weight'))) return false;
  return isPositiveNumber(val(m === 'reverse' ? 'rate' : 'dose'));
}

/** Calcula o modo atual. Retorna { value, meta, text } ou { error }. */
function compute() {
  const m = cur.mode, f = cur.f;

  if (m === 'infusion') {
    const r = calculateFluidPumpRate(f.volume.value, f.infusionTime.value, f.infusionTimeUnit.value);
    if (r.error) return r;
    const t = `${n(val('infusionTime'))} ${f.infusionTimeUnit.value === 'hr' ? 'h' : 'min'}`;
    return {
      label: 'Taxa da bomba',
      value: `${n(r.mlh)} mL/h`,
      meta: `${n(val('volume'))} mL em ${t}`,
      text: `${n(val('volume'))} mL em ${t} = ${n(r.mlh)} mL/h`
    };
  }

  if (isUnitsFamily(f.unit.value) !== isUnitsFamily(f.amountUnit.value)) {
    return { error: 'Unidade da dose e da solução não combinam (UI × massa).' };
  }

  const solution = `${n(val('amount'))} ${formatUnit(f.amountUnit.value)} em ${n(val('volume'))} mL`;

  if (m === 'bolus') {
    const r = calculateIvPushVolume(f.dose.value, f.unit.value, f.amount.value, f.amountUnit.value, f.volume.value);
    if (r.error) return r;
    const conc = `${n(val('amount') / val('volume'))} ${formatUnit(f.amountUnit.value)}/mL`;
    return {
      label: 'Volume a administrar',
      value: `${n(r.volumeMl)} mL`,
      meta: `Concentração: ${conc}`,
      text: `${n(val('dose'))} ${formatUnit(f.unit.value)} (apresentação ${solution}; ${conc}) = ${n(r.volumeMl)} mL`
    };
  }

  const unit = f.unit.value, weight = val('weight'), withWeight = needsWeight(unit);
  if (!isPositiveNumber(val('amount'))) return { error: 'Dose total na solução deve ser maior que zero.' };
  if (!isPositiveNumber(val('volume'))) return { error: 'Volume deve ser maior que zero.' };
  if (withWeight && !isPositiveNumber(weight)) return { error: 'Peso deve ser maior que zero.' };

  const concentration = calculateConcentration(val('amount'), f.amountUnit.value, val('volume'));
  const meta = `Concentração: ${n(concentration)} ${concLabel(f.amountUnit.value)}`;
  const head = [drugName(), `solução ${solution}`, withWeight ? `peso ${n(weight)} kg` : ''].filter(Boolean).join('; ');

  if (m === 'forward') {
    if (!isPositiveNumber(val('dose'))) return { error: 'Dose deve ser maior que zero.' };
    const r = calculateForwardRate(val('dose'), unit, weight, concentration);
    if (r.error) return r;
    return {
      label: 'Velocidade da bomba',
      value: `${n(r.mlh)} mL/h`,
      meta,
      text: `${head}: ${n(val('dose'), 3)} ${formatUnit(unit)} = ${n(r.mlh)} mL/h`
    };
  }

  if (!isPositiveNumber(val('rate'))) return { error: 'mL/h deve ser maior que zero.' };
  const r = calculateReverseRate(val('rate'), unit, weight, concentration);
  if (r.error) return r;
  return {
    label: 'Dose entregue',
    value: `${n(r.dose, 3)} ${formatUnit(unit)}`,
    meta,
    text: `${head}: ${n(val('rate'))} mL/h = ${n(r.dose, 3)} ${formatUnit(unit)}`
  };
}

function refresh() {
  syncFields();
  const box = cur.result;
  box.innerHTML = '';
  cur.lastText = '';
  if (!hasMinimumData()) {
    box.append(el('div', { class: 'dc-result-value dc-muted' }, '--'));
    cur.copyBtn.disabled = true;
    return;
  }
  const r = compute();
  if (r.error) {
    box.append(el('div', { class: 'dc-result-error' }, r.error));
    cur.copyBtn.disabled = true;
    return;
  }
  box.append(
    el('div', { class: 'dc-result-label' }, r.label),
    el('div', { class: 'dc-result-value' }, r.value),
    el('div', { class: 'dc-result-meta' }, r.meta)
  );
  cur.lastText = r.text;
  cur.copyBtn.disabled = false;
}

async function copy() {
  if (!cur || !cur.lastText) return;
  try {
    await navigator.clipboard.writeText(cur.lastText);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = cur.lastText;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  cur.toast('Copiado ✓');
}

function clearAll() {
  ['drug', 'weight', 'dose', 'rate', 'amount', 'volume', 'infusionTime'].forEach(id => { cur.f[id].value = ''; });
  cur.f.amountUnit.value = 'mg';
  cur.f.infusionTimeUnit.value = DEFAULT_TIME_UNIT;
  cur.f.unit.value = cur.mode === 'bolus' ? DEFAULT_BOLUS_UNIT : DEFAULT_INFUSION_UNIT;
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  refresh();
}

/* ---------- montagem ---------- */

function numberInput(ph) {
  return el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: ph });
}

/**
 * Monta a calculadora dentro de container.
 * @param {HTMLElement} container elemento que recebe a calculadora (é limpo antes)
 * @param {(msg:string)=>void} toast notificação do projeto, reaproveitada daqui
 */
export function mountDripCalc(container, toast) {
  container.innerHTML = '';

  const f = {
    drug: el('select', {}),
    weight: numberInput('Ex.: 70,5'),
    dose: numberInput('Ex.: 0,1'),
    unit: el('select', {}),
    rate: numberInput('Ex.: 12,5'),
    amount: numberInput('Ex.: 16'),
    amountUnit: el('select', {}),
    volume: numberInput('Ex.: 250'),
    infusionTime: numberInput('Ex.: 30'),
    infusionTimeUnit: el('select', {})
  };
  fillSelect(f.amountUnit, AMOUNT_UNIT_OPTIONS, 'mg');
  fillSelect(f.infusionTimeUnit, TIME_UNIT_OPTIONS, DEFAULT_TIME_UNIT);

  const labelText = {
    drug: 'Preset / apresentação', weight: 'Peso (kg)', dose: 'Dose', unit: 'Unidade', rate: 'mL/h',
    amount: 'Dose total na solução', amountUnit: 'Unidade da solução', volume: 'Volume (mL)',
    infusionTime: 'Tempo', infusionTimeUnit: 'Unidade do tempo'
  };
  const full = ['drug', 'weight', 'volume'];
  const labels = {}, wraps = {};
  FIELD_IDS.forEach(id => {
    f[id].id = `dc-${id}`;
    labels[id] = el('span', {}, labelText[id]);
    wraps[id] = el('label', { class: 'dc-field' + (full.includes(id) ? ' dc-full' : ''), for: f[id].id }, labels[id], f[id]);
  });

  const tabs = MODES.map(m => el('button', {
    type: 'button', role: 'tab', 'data-mode': m.id,
    onclick: () => { setMode(m.id); refresh(); save(); }
  }, m.label));

  const copyBtn = el('button', { class: 'dc-primary', type: 'button', onclick: copy }, 'Copiar resultado');
  const result = el('div', { class: 'dc-result', role: 'status', 'aria-live': 'polite' });
  const intro = el('p', { class: 'dc-copy' });
  const root = el('div', { class: 'dc-root' });

  cur = { root, f, labels, wraps, tabs, result, copyBtn, intro, toast, mode: DEFAULT_MODE, catalog: [], lastText: '' };

  root.append(
    el('div', { class: 'dc-top' },
      el('h2', {}, 'DripCalc'),
      el('span', { class: 'dc-sub' }, 'Infusão, bolus e fluidos'),
      el('span', { class: 'dc-sp' }),
      el('div', { class: 'dc-tabs', role: 'tablist', 'aria-label': 'Modo de cálculo' }, tabs)
    ),
    el('div', { class: 'dc-main' },
      el('form', { class: 'dc-form', autocomplete: 'off', onsubmit: e => e.preventDefault() },
        intro,
        el('div', { class: 'dc-grid' }, FIELD_IDS.map(id => wraps[id]))
      ),
      el('aside', { class: 'dc-side' },
        result,
        el('div', { class: 'dc-actions' },
          el('button', { type: 'button', onclick: clearAll }, 'Limpar'),
          copyBtn),
        el('p', { class: 'dc-hint' },
          'Ferramenta de apoio: confira sempre a prescrição e a diluição. ',
          'O preenchimento fica só nesta aba (some ao fechá-la).'))
    )
  );

  f.drug.addEventListener('change', () => { applySelection(); refresh(); save(); });
  FIELD_IDS.filter(id => id !== 'drug').forEach(id => {
    ['input', 'change'].forEach(ev => f[id].addEventListener(ev, () => { refresh(); save(); }));
  });

  // restaura o que foi preenchido nesta aba
  const saved = loadState();
  const mode = saved && MODES.some(m => m.id === saved.mode) ? saved.mode : DEFAULT_MODE;
  if (saved) {
    FIELD_IDS.forEach(id => { if (id !== 'drug' && id !== 'unit' && saved[id]) f[id].value = saved[id]; });
    cur.mode = mode;
    fillSelect(f.unit, mode === 'bolus' ? ivPushUnitOptions : infusionUnitOptions, saved.unit,
      mode === 'bolus' ? DEFAULT_BOLUS_UNIT : DEFAULT_INFUSION_UNIT);
  }
  setMode(mode);
  if (saved && saved.drug && cur.catalog[Number(saved.drug)]) f.drug.value = saved.drug;

  container.append(root);
  refresh();
}

/** Desmonta a calculadora e libera o contexto ativo. */
export function unmountDripCalc(container) {
  container.innerHTML = '';
  cur = null;
}
