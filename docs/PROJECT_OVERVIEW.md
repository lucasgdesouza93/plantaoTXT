# PROJECT_OVERVIEW.md

## System Purpose

**PlantãoTXT** is a lightweight, browser-based utility for Brazilian emergency medicine physicians. It provides pre-formatted clinical documentation templates and reusable AI prompts that can be selected, reviewed, edited in the browser, and copied to the clipboard, reducing manual typing during emergency room shifts.

---

## High-Level Architecture

```
[Browser]
    └── index.html               (single page — no router)
         ├── style.css           (visual styling)
         └── app.js              (entry point: imports data, exposes copy handlers, initializes category toggles)
              ├── data/clinica.js (clinical templates)
              ├── data/trauma.js  (trauma templates)
              ├── data/procedimentos.js (procedure descriptions)
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
User optionally collapses or expands a sidebar category
    → checkbox in .category-header toggles .collapsed on .sidebar-category
    → .category-content is shown or hidden
User selects a template or prompt
    → onclick calls window.copiar('templateKey')
    → copiar() looks up key in textos
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

The application contains **33 items** grouped into 5 sections:

| Section | Items |
|---------|-------|
| Clínica | Admissão – Sala de Emergência, Evolução – Sala de Emergência |
| Trauma | Admissão Trauma – Feminino, Admissão Trauma – Masculino |
| Procedimentos | 20 descrições de procedimentos clínicos e de emergência |
| Orientações / Prescrições (Alta) | Dengue, Dor Traumática, Herpes Zóster, IVAS, Nefrolitíase, PNM sem comorbidade, PNM com comorbidade, PNM – alergia a β-lactâmicos/macrolídeos |
| Prompts de IA | Resultados laboratoriais em linha |

---

## Key Files

| File | Path | Role |
|------|------|------|
| HTML shell | [index.html](../index.html) | DOM structure, checkbox-controlled sidebar groups, preview panel |
| Entry point | [app.js](../app.js) | Imports data modules, merges `textos`, defines `copiar()`, `copiarPreview()`, `toast()`, and initializes category toggles |
| Clinical templates | [data/clinica.js](../data/clinica.js) | `admissaoClinica`, `evolucao` |
| Trauma templates | [data/trauma.js](../data/trauma.js) | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| Procedure templates | [data/procedimentos.js](../data/procedimentos.js) | 20 procedure description templates |
| Discharge templates | [data/alta.js](../data/alta.js) | 8 discharge prescription templates |
| AI prompt templates | [data/ia.js](../data/ia.js) | `promptResultadosLaboratoriaisLinha` |
| Styling | [style.css](../style.css) | Dark responsive theme, category toggles, cards, buttons, and preview panel |
