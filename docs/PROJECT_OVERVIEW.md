# PROJECT_OVERVIEW.md

## System Purpose

**PlantãoTXT** is a lightweight, browser-based utility for Brazilian emergency medicine physicians. It provides pre-formatted clinical documentation templates and reusable AI prompts that can be selected, reviewed, edited in the browser, and copied to the clipboard, reducing manual typing during emergency room shifts.

---

## High-Level Architecture

```
[Browser]
    └── index.html               (single page — no router)
         ├── style.css           (visual styling)
         └── app.js              (entry point: imports data, exposes copiar/copy handlers)
              ├── data/clinica.js (clinical templates)
              ├── data/trauma.js  (trauma templates)
              ├── data/alta.js    (discharge prescription templates)
              └── data/ia.js      (frequently used AI prompts)
```

- **Type:** Static, client-side only web application
- **Pages:** 1 (single HTML file, no routing)
- **Backend:** None
- **Database:** None
- **Build system:** None
- **Module system:** Native ES modules (`<script type="module">`)
- **Dependencies:** Zero

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (`lang="pt-BR"`) |
| Styling | CSS3 (plain, no framework) |
| Logic | Vanilla JavaScript (ES2017+, async/await) |
| Runtime | Browser (modern browsers) |
| Hosting | Any static file server |

---

## Main System Flow

```
User selects a template or prompt
    → onclick calls window.copiar('templateKey')
    → copiar() looks up key in textos
    → textos is assembled from data/ modules
    → selected button receives .active class
    → preview panel shows the selected text
User clicks "Copiar"
    → onclick calls window.copiarPreview()
    → copiarPreview() reads editable preview text
    → tries navigator.clipboard.writeText()
    → on failure: fallback via textarea + execCommand
    → calls toast("Copiado ✓")
```

---

## Template Categories

The application contains **13 items** grouped into 4 sections:

| Section | Items |
|---------|-------|
| Clínica | Admissão – Sala de Emergência, Evolução – Sala de Emergência |
| Trauma | Admissão Trauma – Feminino, Admissão Trauma – Masculino |
| Orientações / Prescrições (Alta) | Dengue, Dor Traumática, Herpes Zóster, IVAS, Nefrolitíase, PNM sem comorbidade, PNM com comorbidade, PNM – alergia a β-lactâmicos/macrolídeos |
| Prompts de IA | Resultados laboratoriais em linha |

---

## Key Files

| File | Path | Role |
|------|------|------|
| HTML shell | [index.html](../index.html) | DOM structure, sidebar sections, preview panel |
| Entry point | [app.js](../app.js) | Imports data modules, merges `textos`, defines `copiar()`, `copiarPreview()`, and `toast()` |
| Clinical templates | [data/clinica.js](../data/clinica.js) | `admissaoClinica`, `evolucao` |
| Trauma templates | [data/trauma.js](../data/trauma.js) | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| Discharge templates | [data/alta.js](../data/alta.js) | 8 discharge prescription templates |
| AI prompt templates | [data/ia.js](../data/ia.js) | `promptResultadosLaboratoriaisLinha` |
| Styling | [style.css](../style.css) | Dark responsive theme, layout, cards, buttons, and preview panel |
