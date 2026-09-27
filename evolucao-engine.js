/* =====================================================================
   MOTOR DO FORMULÁRIO DE EVOLUÇÃO
   Monta um formulário interativo dentro de um container e gera o texto
   para o prontuário. Sem DOM próprio no index.html: tudo é criado aqui.
   Estado no sessionStorage (some ao fechar a aba), separado por modelo.
   ===================================================================== */
import { TEMPLATES, N, num, fmtN } from './data/evolucao-modelos.js';

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
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const withUnit = (v, u) => (u && /^[\d.,\/x×\s+\-–]+$/i.test(v)) ? v + u : v;

// ids automáticos (únicos por modelo) para quem não declarou
TEMPLATES.forEach(tp => tp.sections.forEach((s, si) => s.fields.forEach(f => {
  f.id = f.id || `s${si}_${slug(f.label)}`;
  if (f.fields) f.fields.forEach(sf => { sf.id = sf.id || `${f.id}_${slug(sf.label)}`; });
})));

/* ---------- estado (sessionStorage: some ao fechar a aba) ---------- */
const KEY = 'evolucao.v1';
let state = { values: {} };
try {
  const s = JSON.parse(sessionStorage.getItem(KEY));
  if (s && s.values) state = s;
} catch (e) { /* estado corrompido: começa vazio */ }

const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

/* ---------- contexto da montagem ativa ---------- */
// Só um formulário fica montado por vez; cur guarda os nós e os índices dele.
let cur = null;

const tpl = () => TEMPLATES.find(t => t.id === cur.tplId);
const V = () => state.values[cur.tplId] || (state.values[cur.tplId] = {});
function set(id, val) { V()[id] = val; save(); refresh(); }

/* ---------- concordância de gênero ---------- */
// Nos textos, "{o|a}" vira a forma masculina ou feminina conforme o campo Sexo (sex:true).
const sexOf = () => {
  const f = tpl().sections.flatMap(s => s.fields).find(f => f.sex);
  return f && (V()[f.id] || [])[0] === 'Feminino' ? 'f' : 'm';
};
const g = t => t == null ? t
  : String(t).replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, m, f) => sexOf() === 'f' ? f : m);

// pares [masc, fem] extraídos de todos os textos marcados, para converter o que já foi preenchido
const GENDER_PAIRS = (() => {
  const src = JSON.stringify(TEMPLATES) + JSON.stringify(N), seen = new Set(), out = [];
  for (const w of src.match(/\p{L}*\{[^|{}"]*\|[^|{}"]*\}\p{L}*/gu) || []) {
    const pair = [0, 1].map(i => w.replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, m, f) => i ? f : m).toLowerCase());
    if (pair[0] !== pair[1] && !seen.has(pair[0])) { seen.add(pair[0]); out.push(pair); }
  }
  return out;
})();

function applySex() {
  const to = sexOf(), v = V(), cap = w => w[0].toUpperCase() + w.slice(1);
  for (const k of Object.keys(v)) {
    if (typeof v[k] !== 'string') continue;
    for (const [m, f] of GENDER_PAIRS) {
      const [from, dest] = to === 'f' ? [m, f] : [f, m];
      v[k] = v[k].replace(
        new RegExp(`(?<!\\p{L})(${from}|${cap(from)})(?!\\p{L})`, 'gu'),
        x => x[0] === x[0].toUpperCase() ? cap(dest) : dest
      );
    }
  }
  save();
}

/* ---------- formulário ---------- */
function renderForm() {
  const form = cur.form;
  form.innerHTML = '';
  cur.calcEls = [];
  cur.gcsEls = [];
  const t = tpl();
  cur.desc.textContent = t.desc;
  t.sections.forEach(sec => {
    const grid = el('div', { class: 'ev-grid' });
    sec.fields.forEach(f => grid.append(renderField(f)));
    const head = el('div', { class: 'ev-card-h' }, el('h2', {}, sec.title), el('span', { class: 'ev-sp' }));
    if (sec.normalAll) head.append(el('button', {
      class: 'ev-small', type: 'button',
      title: 'Preenche com o texto normal os campos de exame ainda vazios',
      onclick: () => {
        sec.fields.forEach(f => { if (f.normal && !V()[f.id]) V()[f.id] = g(f.normal); });
        save(); renderForm(); refresh();
      }
    }, 'Tudo normal'));
    form.append(el('section', { class: 'ev-card' }, head, grid));
  });
}

function renderField(f) {
  const v = V();
  const wide = f.full || ['area', 'chips', 'row', 'gcs', 'insert'].includes(f.t);
  const wrap = el('div', { class: 'ev-field' + (wide ? ' ev-full' : '') });
  const lab = el('div', { class: 'ev-lab' }, el('label', { for: f.id }, f.label), el('span', { class: 'ev-sp' }));
  wrap.append(lab);

  switch (f.t) {
    case 'text': {
      const inp = el('input', {
        type: 'text', id: f.id, placeholder: g(f.ph) || '',
        oninput: e => set(f.id, e.target.value)
      });
      inp.value = v[f.id] || '';
      wrap.append(f.unit
        ? el('div', { class: 'ev-unitwrap' }, inp, el('span', {}, f.unit.trim()))
        : inp);
      break;
    }
    case 'area': {
      const ta = el('textarea', {
        id: f.id, rows: f.rows || 2, placeholder: g(f.ph) || '',
        oninput: e => set(f.id, e.target.value)
      });
      ta.value = v[f.id] || '';
      if (f.normal) lab.append(el('button', {
        class: 'ev-small', type: 'button', title: g(f.normal),
        onclick: () => {
          const n = g(f.normal), cr = V()[f.id] || '';
          const nv = cr.trim() ? cr.replace(/\s*$/, ' ') + n : n;
          ta.value = nv; set(f.id, nv); ta.focus();
        }
      }, 'Normal'));
      wrap.append(ta);
      break;
    }
    case 'insert': {
      const NL = '\n';
      const has = (txt, o) => txt.split(NL).some(l => l.trim().startsWith('- ' + o));
      const ta = el('textarea', { id: f.id, rows: f.rows || 5, placeholder: f.ph || '' });
      ta.value = v[f.id] || '';
      const box = el('div', { class: 'ev-chips' });
      const sync = () => box.querySelectorAll('.ev-chip')
        .forEach(b => b.setAttribute('aria-pressed', String(has(ta.value, b.dataset.o))));
      f.opts.forEach(o => box.append(el('button', {
        class: 'ev-chip', type: 'button', 'data-o': o,
        onclick: () => {
          let lines = ta.value.replace(/\s+$/, '').split(NL).filter((l, i, a) => a.length > 1 || l);
          if (has(ta.value, o)) lines = lines.filter(l => !l.trim().startsWith('- ' + o));
          else lines.push('- ' + o);
          ta.value = lines.join(NL); set(f.id, ta.value); sync();
        }
      }, o)));
      ta.addEventListener('input', () => { set(f.id, ta.value); sync(); });
      sync();
      wrap.append(box, ta);
      break;
    }
    case 'select': {
      const s = el('select', { id: f.id, onchange: e => set(f.id, e.target.value) },
        el('option', { value: '' }, '—'), ...f.opts.map(o => el('option', { value: o }, o)));
      s.value = v[f.id] || '';
      wrap.append(s);
      break;
    }
    case 'chips': {
      const box = el('div', { class: 'ev-chips' });
      f.opts.forEach(o => {
        const b = el('button', {
          class: 'ev-chip', type: 'button',
          'aria-pressed': String((v[f.id] || []).includes(o)),
          onclick: () => {
            let cr = [...(V()[f.id] || [])];
            if (cr.includes(o)) cr = cr.filter(x => x !== o);
            else cr = f.multi ? [...cr, o] : [o];
            if (!f.multi) box.querySelectorAll('.ev-chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', String(cr.includes(o)));
            set(f.id, cr);
            if (f.sex) { applySex(); renderForm(); refresh(); }
            if (f.details) { renderDetails(); if (cr.includes(o)) detBox.querySelector(`[data-o="${o}"]`)?.focus(); }
          }
        }, g(o));
        box.append(b);
      });
      // details: cada opção marcada ganha um campo próprio (ex.: sítio/data do dispositivo)
      const detBox = el('div', { class: 'ev-row ev-details' });
      const renderDetails = () => {
        detBox.innerHTML = '';
        (V()[f.id] || []).forEach(o => {
          const k = `${f.id}__d__${o}`;
          const inp = el('input', { type: 'text', 'data-o': o, placeholder: f.details, oninput: e => set(k, e.target.value) });
          inp.value = V()[k] || '';
          detBox.append(el('label', { class: 'ev-sub' }, el('small', {}, g(o)), inp));
        });
      };
      if (f.details) renderDetails();
      if (f.other) {
        const oi = el('input', { type: 'text', placeholder: f.other, oninput: e => set(f.id + '__o', e.target.value) });
        oi.value = v[f.id + '__o'] || '';
        box.append(oi);
      }
      wrap.append(box);
      if (f.details) wrap.append(detBox);
      break;
    }
    case 'row': {
      const r = el('div', { class: 'ev-row' });
      f.fields.forEach(sf => {
        const inp = el('input', {
          type: 'text', id: sf.id, placeholder: sf.ph || '',
          inputmode: sf.unit && !/modo/i.test(sf.label) ? 'decimal' : null,
          oninput: e => set(sf.id, e.target.value)
        });
        inp.value = v[sf.id] || '';
        r.append(el('label', { class: 'ev-sub' }, el('small', {}, sf.label),
          sf.unit ? el('div', { class: 'ev-unitwrap' }, inp, el('span', {}, sf.unit.trim())) : inp));
      });
      wrap.append(r);
      break;
    }
    case 'gcs': {
      const mk = (k, name, opts) => {
        const s = el('select', { onchange: e => set(f.id + '_' + k, e.target.value) },
          el('option', { value: '' }, '—'),
          ...opts.map(([val, txt]) => el('option', { value: val }, `${val} · ${txt}`)));
        s.value = v[f.id + '_' + k] || '';
        return el('label', { class: 'ev-sub' }, el('small', {}, name), s);
      };
      const badge = el('div', { class: 'ev-badge' });
      cur.gcsEls.push([f, badge]);
      wrap.append(el('div', { class: 'ev-gcs' },
        mk('o', 'Ocular', [['4', 'Espontânea'], ['3', 'Ao som'], ['2', 'À pressão'], ['1', 'Ausente']]),
        mk('v', 'Verbal', [['5', 'Orientado'], ['4', 'Confuso'], ['3', 'Palavras'], ['2', 'Sons'], ['1', 'Ausente'], ['T', 'Intubado']]),
        mk('m', 'Motora', [['6', 'Obedece'], ['5', 'Localiza'], ['4', 'Flexão normal'], ['3', 'Flexão anormal'], ['2', 'Extensão'], ['1', 'Ausente']]),
        badge));
      break;
    }
    case 'calc': {
      const d = el('div', { class: 'ev-calc' });
      cur.calcEls.push([f, d]);
      wrap.append(d);
      break;
    }
  }
  return wrap;
}

/* ---------- geração do texto ---------- */
function gcsText(f, v) {
  const o = v[f.id + '_o'], vb = v[f.id + '_v'], m = v[f.id + '_m'];
  if (!o || !vb || !m) return '';
  const tot = vb === 'T' ? `${+o + +m}T` : String(+o + +vb + +m);
  return `Glasgow ${tot} (O${o} V${vb} M${m})`;
}

function fieldOut(f, v, inner) {
  if (f.noout || f.intitle || (f.part && !inner)) return '';
  if (f.gather) { // junta numa linha só os campos com part igual (ex.: Glasgow e pupilas dentro do D)
    const parts = tpl().sections.flatMap(s => s.fields)
      .filter(x => x.part === f.gather).map(x => fieldOut(x, v, true));
    parts.push((v[f.id] || '').trim());
    const all = parts.filter(Boolean);
    return all.length ? `${f.out || f.label}: ${all.join(' | ')}` : '';
  }
  const L = f.out || f.label, lbl = s => f.nolabel ? s : f.below ? `${L}:\n${s}` : `${L}: ${s}`;
  switch (f.t) {
    case 'text': { const x = (v[f.id] || '').trim(); return x ? lbl(withUnit(x, f.unit)) : ''; }
    case 'area': case 'select': case 'insert': { const x = (v[f.id] || '').trim(); return x ? lbl(x) : ''; }
    case 'chips': {
      const items = (v[f.id] || []).map(o => {
        const d = f.details && (v[`${f.id}__d__${o}`] || '').trim();
        return g(o) + (d ? ` (${d})` : '');
      });
      const o = (v[f.id + '__o'] || '').trim();
      if (o) { if (f.detail && items.length) items[items.length - 1] += ` (${o})`; else items.push(o); }
      if (!items.length) return '';
      if (f.list) {
        const body = items.map(i => '- ' + i).join('\n');
        return f.nolabel ? body : `${L}:\n${body}`;
      }
      return lbl(items.join(f.sep || ', '));
    }
    case 'row': {
      const parts = f.fields.map(sf => {
        const x = (v[sf.id] || '').trim();
        return x ? `${sf.out || sf.label} ${withUnit(x, sf.unit)}` : '';
      }).filter(Boolean);
      return parts.length ? lbl(parts.join(' | ')) : '';
    }
    case 'gcs': return gcsText(f, v);
    case 'calc': { const x = f.fn(v); return x ? lbl(x) : ''; }
  }
  return '';
}

function fmtDt(s) {
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d:\d\d)/.exec(s || '');
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}` : '';
}

function build() {
  const t = tpl(), v = V();
  const extra = t.sections.flatMap(s => s.fields).filter(f => f.intitle).flatMap(f => v[f.id] || []);
  const ex = extra.length ? ' ' + extra.join(' ').toUpperCase() : '';
  const out = [t.title.includes('{p}') ? t.title.replace('{p}', ex) : t.title + ex];
  if (cur.useDt.checked && cur.dt.value) out.push(fmtDt(cur.dt.value));
  t.sections.forEach(sec => {
    const lines = sec.fields.map(f => fieldOut(f, v)).filter(Boolean);
    if (lines.length) out.push('', sec.title.toUpperCase(), sec.inline ? lines.join(' | ') : lines.join('\n'));
  });
  return out.join('\n');
}

function refresh() {
  if (!cur) return;
  const v = V();
  cur.calcEls.forEach(([f, d]) => { d.textContent = f.fn(v) || '—'; });
  cur.gcsEls.forEach(([f, b]) => { const s = gcsText(f, v); b.textContent = s ? s.split(' ')[1] : '—'; });
  if (!cur.outEdited) cur.out.value = build();
}

/* ---------- ações ---------- */
async function copy() {
  const texto = cur.out.value;
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const o = cur.out;
    o.focus();
    o.select();
    document.execCommand('copy');
    o.setSelectionRange(0, 0);
  }
  cur.toast('Copiado ✓');
}

function setNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  cur.dt.value = d.toISOString().slice(0, 16);
  refresh();
}

function markEdited(on) {
  cur.outEdited = on;
  cur.edited.classList.toggle('ev-on', on);
}

// Ctrl/Cmd+Enter copia. Listener único de módulo, ativo só com formulário montado.
document.addEventListener('keydown', e => {
  if (!cur || !cur.root.isConnected) return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); copy(); }
});

/* ---------- montagem ---------- */

/** Nome exibido de cada modelo, para a sidebar. */
export const modelosEvolucao = TEMPLATES.map(t => ({ id: t.id, name: t.name }));

/**
 * Monta o formulário do modelo tplId dentro de container.
 * @param {HTMLElement} container elemento que recebe o formulário (é limpo antes)
 * @param {string} tplId id do modelo em TEMPLATES
 * @param {(msg:string)=>void} toast notificação do projeto, reaproveitada daqui
 */
export function mountEvolucao(container, tplId, toast) {
  const t = TEMPLATES.find(x => x.id === tplId);
  if (!t) return;

  container.innerHTML = '';
  const useDt = el('input', { type: 'checkbox', checked: true });
  const dt = el('input', { type: 'datetime-local' });
  const desc = el('p', { class: 'ev-desc' });
  const form = el('form', { class: 'ev-form', autocomplete: 'off' });
  const out = el('textarea', { class: 'ev-out', spellcheck: 'false' });
  const edited = el('div', { class: 'ev-edited' });
  const root = el('div', { class: 'ev-root' });

  cur = { tplId, root, useDt, dt, desc, form, out, edited, toast, calcEls: [], gcsEls: [], outEdited: false };

  form.addEventListener('submit', e => e.preventDefault());
  useDt.addEventListener('change', refresh);
  dt.addEventListener('input', refresh);
  out.addEventListener('input', () => markEdited(true));

  edited.append(
    'Texto editado à mão — o formulário não o atualiza mais.',
    el('span', { class: 'ev-sp' }),
    el('button', { class: 'ev-small', type: 'button', onclick: () => { markEdited(false); refresh(); } }, 'Regenerar')
  );

  root.append(
    el('div', { class: 'ev-top' },
      el('label', { class: 'ev-dt' }, useDt, ' Data/hora ', dt),
      el('button', { class: 'ev-small', type: 'button', title: 'Usar data/hora atual', onclick: setNow }, 'agora'),
      el('span', { class: 'ev-sp' }),
      el('button', {
        type: 'button',
        onclick: () => {
          if (confirm(`Apagar tudo o que foi preenchido em "${t.name}"?`)) {
            state.values[tplId] = {};
            save();
            markEdited(false);
            renderForm();
            refresh();
          }
        }
      }, 'Limpar modelo'),
      el('button', { class: 'ev-primary', type: 'button', onclick: copy }, 'Copiar evolução')
    ),
    el('div', { class: 'ev-main' },
      el('div', {}, desc, form),
      el('aside', { class: 'ev-side' },
        el('div', { class: 'ev-outcard' },
          el('div', { class: 'ev-card-h' },
            el('h2', {}, 'Texto para o prontuário'),
            el('span', { class: 'ev-sp' }),
            el('button', { class: 'ev-small', type: 'button', onclick: copy }, 'Copiar')),
          edited,
          out,
          el('div', { class: 'ev-hint' },
            'Campos vazios não entram no texto. ',
            el('kbd', {}, 'Ctrl'), '+', el('kbd', {}, 'Enter'), ' copia. ',
            'O preenchimento fica só nesta aba (some ao fechá-la).')))
    )
  );

  container.append(root);
  renderForm();
  setNow();
}

/** Desmonta o formulário e libera o contexto ativo. */
export function unmountEvolucao(container) {
  container.innerHTML = '';
  cur = null;
}
