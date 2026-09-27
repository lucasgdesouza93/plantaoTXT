import { altaTemplates } from './data/alta.js';
import { aiPromptTemplates } from './data/ia.js';
import { procedureTemplates } from './data/procedimentos.js';
import { mountEvolucao, unmountEvolucao } from './evolucao-engine.js';
import { mountDripCalc, unmountDripCalc } from './dripcalc-engine.js';

// Clickjacking guard: refuse to run inside a frame
if (window.top !== window.self) {
  document.documentElement.style.display = 'none';
  try { window.top.location = window.self.location; } catch (_) {}
}

const textos = {
  ...altaTemplates,
  ...aiPromptTemplates,
  ...procedureTemplates,
};

let toastTimer;

// Marca o botão escolhido e esconde os três modos do painel (texto, formulário, ferramenta).
function limparPreview(btn) {
  document.querySelectorAll('.model-button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const form = document.getElementById('preview-form');
  unmountEvolucao(form);
  form.hidden = true;

  const tool = document.getElementById('preview-tool');
  unmountDripCalc(tool);
  tool.hidden = true;

  document.getElementById('preview-empty').hidden = true;
  document.getElementById('preview-content').hidden = true;
}

function copiar(tipo, btn) {
  const texto = textos[tipo];
  if (!texto) return;

  limparPreview(btn);
  document.getElementById('preview-content').hidden = false;
  document.getElementById('preview-title').textContent = btn ? btn.textContent : tipo;
  document.getElementById('preview-body').textContent = texto;
}

// Modo formulário: o painel de texto sai de cena e o motor monta o formulário do modelo.
function abrirFormulario(modelo, btn) {
  limparPreview(btn);

  const form = document.getElementById('preview-form');
  form.hidden = false;
  mountEvolucao(form, modelo, toast);
}

// Modo ferramenta: calculadoras que não geram texto de prontuário (hoje só o DripCalc).
function abrirFerramenta(nome, btn) {
  if (nome !== 'dripcalc') return;
  limparPreview(btn);

  const tool = document.getElementById('preview-tool');
  tool.hidden = false;
  mountDripCalc(tool, toast);
}

async function copiarPreview() {
  const texto = document.getElementById('preview-body').innerText;
  if (!texto) return;

  try {
    await navigator.clipboard.writeText(texto);
    toast('Copiado ✓');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('Copiado ✓');
  }
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:18px',
      'transform:translateX(-50%)',
      'background:rgba(15,23,42,0.92)',
      'border:1px solid rgba(148,163,184,0.25)',
      'color:#fff',
      'padding:10px 14px',
      'border-radius:12px',
      'font-weight:600',
      'box-shadow:0 10px 30px rgba(0,0,0,0.35)',
      'z-index:9999',
      'opacity:0',
      'transition:opacity 160ms ease',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 1100);
}

function initModelButtons() {
  document.querySelectorAll('.model-button[data-template]').forEach(btn => {
    btn.addEventListener('click', () => copiar(btn.dataset.template, btn));
  });
}

function initFormButtons() {
  document.querySelectorAll('.model-button[data-form]').forEach(btn => {
    btn.addEventListener('click', () => abrirFormulario(btn.dataset.form, btn));
  });
}

function initToolButtons() {
  document.querySelectorAll('.model-button[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => abrirFerramenta(btn.dataset.tool, btn));
  });
}

function initCopyButton() {
  const btn = document.getElementById('btn-copy');
  if (btn) btn.addEventListener('click', copiarPreview);
}

function initCategoryToggles() {
  document.querySelectorAll('.category-toggle').forEach(toggle => {
    const category = toggle.closest('.sidebar-category');
    if (!category) return;
    category.classList.toggle('collapsed', !toggle.checked);
    toggle.addEventListener('change', event => {
      const parentCategory = event.target.closest('.sidebar-category');
      if (!parentCategory) return;
      parentCategory.classList.toggle('collapsed', !event.target.checked);
    });
  });
}

initModelButtons();
initFormButtons();
initToolButtons();
initCopyButton();
initCategoryToggles();
