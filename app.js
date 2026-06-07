import { clinicaTemplates } from './data/clinica.js';
import { traumaTemplates } from './data/trauma.js';
import { altaTemplates } from './data/alta.js';
import { aiPromptTemplates } from './data/ia.js';
import { procedureTemplates } from './data/procedimentos.js';

// Clickjacking guard: refuse to run inside a frame
if (window.top !== window.self) {
  document.documentElement.style.display = 'none';
  try { window.top.location = window.self.location; } catch (_) {}
}

const textos = {
  ...clinicaTemplates,
  ...traumaTemplates,
  ...altaTemplates,
  ...aiPromptTemplates,
  ...procedureTemplates,
};

let toastTimer;

function copiar(tipo, btn) {
  const texto = textos[tipo];
  if (!texto) return;

  document.querySelectorAll('.model-button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('preview-empty').hidden = true;
  document.getElementById('preview-content').hidden = false;
  document.getElementById('preview-title').textContent = btn ? btn.textContent : tipo;
  document.getElementById('preview-body').textContent = texto;
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
initCopyButton();
initCategoryToggles();
