import { clinicaTemplates } from './data/clinica.js';
import { traumaTemplates } from './data/trauma.js';
import { altaTemplates } from './data/alta.js';
import { aiPromptTemplates } from './data/ia.js';
import { procedureTemplates } from './data/procedimentos.js';

const textos = {
  ...clinicaTemplates,
  ...traumaTemplates,
  ...altaTemplates,
  ...aiPromptTemplates,
  ...procedureTemplates,
};

function copiar(tipo) {
  const texto = textos[tipo];
  if (!texto) {
    alert('Modelo não encontrado.');
    return;
  }

  // Highlight active button
  document.querySelectorAll('.model-button').forEach(button => button.classList.remove('active'));
  const btn = document.querySelector(`.model-button[onclick*="'${tipo}'"]`);
  if (btn) btn.classList.add('active');

  // Show template in preview panel
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
  } catch (e) {
    // Fallback: cria textarea temporário
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
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
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.bottom = '18px';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'rgba(15, 23, 42, 0.92)';
    el.style.border = '1px solid rgba(148, 163, 184, 0.25)';
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '12px';
    el.style.fontWeight = '600';
    el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
    el.style.zIndex = '9999';
    el.style.opacity = '0';
    el.style.transition = 'opacity 160ms ease';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (el.style.opacity = '0'), 1100);
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

initCategoryToggles();

// Expose to inline onclick handlers in index.html
window.copiar = copiar;
window.copiarPreview = copiarPreview;
