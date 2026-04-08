# PROJECT_OVERVIEW.md

## System Purpose

**PlantãoTXT** is a lightweight, browser-based utility for Brazilian emergency medicine physicians. It provides pre-formatted clinical documentation templates that can be selected, reviewed, edited in the browser, and copied to the clipboard, reducing manual typing during emergency room shifts. All templates are written in Portuguese and follow standard Brazilian ER documentation conventions.

---

## High-Level Architecture

```
[Browser]
    └── index.html              (single page — no router)
         ├── style.css           (visual styling)
         └── app.js              (entry point: imports data, exposes copiar/copy handlers)
              ├── data/clinica.js (clinical templates)
              ├── data/trauma.js  (trauma templates)
              └── data/alta.js    (discharge prescription templates)
```

- **Type:** Static, client-side only web application
- **Pages:** 1 (single HTML file, no routing)
- **Backend:** None
- **Database:** None
- **Build system:** None
- **Module system:** Native ES modules (`<script type="module">`) — no bundler
- **Dependencies:** Zero (no npm, no CDN, no external libraries)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (`lang="pt-BR"`) |
| Styling | CSS3 (plain, no framework) |
| Logic | Vanilla JavaScript (ES2017+, async/await) |
| Runtime | Browser (any modern browser) |
| Hosting | Any static file server |

---

## Main System Flow

```
User selects a template
    → onclick calls window.copiar('templateKey') [index.html:16-35]
    → copiar() looks up key in textos object     [app.js:11-28]
    → textos is assembled from data/ modules     [app.js:1-9]
    → selected button receives .active class
    → preview panel shows the template text and title
User clicks "Copiar"
    → onclick calls window.copiarPreview()       [index.html:44]
    → copiarPreview() reads editable preview text [app.js:30-50]
    → tries navigator.clipboard.writeText()      [app.js:35]
    → on failure: fallback via textarea + execCommand  [app.js:38-47]
    → calls toast("Copiado ✓")                  [app.js:36 / 48]
    → toast() renders a temporary notification   [app.js:52-77]
    → notification fades out after 1100ms
```

---

## Template Categories

The application contains **12 templates** grouped into 3 sections:

| Section | Templates |
|---------|-----------|
| Clínica | Admissão – Sala de Emergência, Evolução – Sala de Emergência |
| Trauma | Admissão Trauma – Feminino, Admissão Trauma – Masculino |
| Orientações / Prescrições (Alta) | Dengue, Dor Traumática, Herpes Zóster, IVAS, Nefrolitíase, PNM sem comorbidade, PNM com comorbidade, PNM – alergia a β-lactâmicos/macrolídeos |

---

## Key Files

| File | Path | Role |
|------|------|------|
| HTML shell | [index.html](../index.html) | DOM structure, 12-button layout |
| Entry point | [app.js](../app.js) | Imports data modules, merges `textos`, defines `copiar()`, `copiarPreview()`, and `toast()`, exposes `window.copiar` and `window.copiarPreview` |
| Clinical templates | [data/clinica.js](../data/clinica.js) | `admissaoClinica`, `evolucao` |
| Trauma templates | [data/trauma.js](../data/trauma.js) | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| Discharge templates | [data/alta.js](../data/alta.js) | 8 discharge prescription templates |
| Styling | [style.css](../style.css) | Dark responsive theme, layout, cards, buttons, and preview panel |
