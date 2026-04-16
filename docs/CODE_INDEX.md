# CODE_INDEX.md

## Full File Tree

```
d:/Apps/PlantaoTXT/
├── index.html          Single-page HTML shell
├── app.js              Entry point: imports data modules and exposes copy handlers globally
├── style.css           All visual styling
├── data/
│   ├── clinica.js      Clinical admission and progression templates
│   ├── trauma.js       Trauma admission templates
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
| [index.html](../index.html) | Page shell with sidebar sections for Clínica, Trauma, Alta, and Prompts de IA plus the preview panel |

### JavaScript — Data Layer

Each file in [data/](../data/) exports a named object that `app.js` merges into `textos`.

| File | Export | Keys |
|------|--------|------|
| [data/clinica.js](../data/clinica.js) | `clinicaTemplates` | `admissaoClinica`, `evolucao` |
| [data/trauma.js](../data/trauma.js) | `traumaTemplates` | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| [data/alta.js](../data/alta.js) | `altaTemplates` | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| [data/ia.js](../data/ia.js) | `aiPromptTemplates` | `promptResultadosLaboratoriaisLinha` |

### JavaScript — Logic Layer

| Function | Description |
|----------|-------------|
| `copiar(tipo)` | Looks up the selected key, updates active button state, and shows the text in the preview panel |
| `copiarPreview()` | Copies the current editable preview content to clipboard |
| `toast(msg)` | Creates or reuses the toast notification element |

`app.js` imports all data modules and exposes `window.copiar` and `window.copiarPreview` for inline HTML handlers.

### CSS — Styling

| File | Description |
|------|-------------|
| [style.css](../style.css) | Dark responsive theme, layout, cards, buttons, and preview panel styles |

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
