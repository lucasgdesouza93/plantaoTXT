# CODE_INDEX.md

## Full File Tree

```
d:/Apps/PlantaoTXT/
├── index.html          Single-page HTML shell
├── app.js              Entry point: imports data modules, wires event listeners, initializes sidebar toggles
├── style.css           All visual styling
├── _headers            HTTP security headers for Netlify / Cloudflare Pages
├── data/
│   ├── clinica.js      Clinical admission and progression templates
│   ├── trauma.js       Trauma admission templates
│   ├── procedimentos.js Procedure description templates
│   ├── alta.js         Discharge prescription templates
│   └── ia.js           Frequently used AI prompts
├── tasks/
│   ├── implement-feature.md
│   └── update-project-context.md
└── docs/
    ├── PROJECT_OVERVIEW.md
    ├── FRONTEND_OVERVIEW.md
    ├── BACKEND_OVERVIEW.md
    ├── DATABASE_OVERVIEW.md
    ├── API_CONTRACTS.md
    ├── AUTH_MATRIX.md
    ├── CODE_INDEX.md
    ├── ARCHITECTURE_DECISIONS.md
    └── DB_CHANGE_RULES.md
```

---

## Files by Domain

### HTML — DOM Structure

| File | Description |
|------|-------------|
| [index.html](../index.html) | Page shell with five `.sidebar-category` groups, checkbox-based category headers, `.model-button` entries, and the preview panel |

### JavaScript — Data Layer

Each file in [data/](../data/) exports a named object that `app.js` merges into `textos`.

| File | Export | Keys |
|------|--------|------|
| [data/clinica.js](../data/clinica.js) | `clinicaTemplates` | `admissaoClinica`, `evolucao` |
| [data/trauma.js](../data/trauma.js) | `traumaTemplates` | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| [data/procedimentos.js](../data/procedimentos.js) | `procedureTemplates` | 20 procedure description keys |
| [data/alta.js](../data/alta.js) | `altaTemplates` | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| [data/ia.js](../data/ia.js) | `aiPromptTemplates` | `promptResultadosLaboratoriaisLinha` |

### JavaScript — Logic Layer

| Function | Description |
|----------|-------------|
| `copiar(tipo, btn)` | Looks up the selected key, updates active model button state, and shows the text in the preview panel |
| `copiarPreview()` | Copies the current editable preview content to clipboard |
| `toast(msg)` | Creates or reuses the toast notification element |
| `initModelButtons()` | Attaches click listeners to all `.model-button[data-template]` elements |
| `initCopyButton()` | Attaches the click listener to `#btn-copy` |
| `initCategoryToggles()` | Binds `.category-toggle` checkboxes and toggles `.collapsed` on each `.sidebar-category` |

`app.js` imports all data modules and wires all event listeners within module scope. No globals are exposed on `window`.

### CSS — Styling

| File | Description |
|------|-------------|
| [style.css](../style.css) | Dark responsive theme, category headers, collapsible sidebar groups, buttons, and preview panel styles |

---

## No Files In These Categories

| Category | Status |
|----------|--------|
| Configuration files (package.json, tsconfig, etc.) | Not present |
| Build scripts | Not present |
| Tests | Not present |
| Environment files (.env) | Not present |
| CI/CD configuration | Not present |
| Server-side code | Not present |
