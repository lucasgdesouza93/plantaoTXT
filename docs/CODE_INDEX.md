# CODE_INDEX.md

## Full File Tree

```
d:/Apps/PlantaoTXT/
├── index.html          Single-page HTML shell
├── app.js              Entry point: imports data modules, exposes copiar/copy handlers globally
├── style.css           All visual styling
├── data/               Template data modules (one file per category)
│   ├── clinica.js      Clinical admission and progression templates
│   ├── trauma.js       Trauma admission templates (female / male)
│   └── alta.js         Discharge prescription templates (8 templates)
├── tasks/              Task workflow definitions
│   ├── implement-feature.md
│   └── update-project-context.md
└── docs/               AI agent documentation
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

| File | Lines | Description |
|------|-------|-------------|
| [index.html](../index.html) | 53 | Page shell: `<head>` metadata, single `.layout` div, 3 `.section` divs with 12 template buttons, preview panel, and module script tag |

**Key lines:**
- [index.html:10-49](../index.html) — Full UI structure
- [index.html:16-17](../index.html) — Clínica section buttons
- [index.html:22-23](../index.html) — Trauma section buttons
- [index.html:28-35](../index.html) — Alta section buttons (8 buttons)
- [index.html:39-47](../index.html) — Preview empty state, preview content, copy button, and editable body
- [index.html:51](../index.html) — `<script type="module" src="app.js">` load

---

### JavaScript — Data Layer

Template data is now split into three ES module files under [data/](../data/). Each file exports a named object that `app.js` merges into `textos`.

**[data/clinica.js](../data/clinica.js)** — exports `clinicaTemplates`

| Key | Category | Button Label |
|-----|----------|--------------|
| `admissaoClinica` | Clínica | Admissão – Sala de Emergência |
| `evolucao` | Clínica | Evolução – Sala de Emergência |

**[data/trauma.js](../data/trauma.js)** — exports `traumaTemplates`

| Key | Category | Button Label |
|-----|----------|--------------|
| `admissaoTraumaFem` | Trauma | Admissão Trauma – Feminino |
| `admissaoTraumaMasc` | Trauma | Admissão Trauma – Masculino |

**[data/alta.js](../data/alta.js)** — exports `altaTemplates`

| Key | Category | Button Label |
|-----|----------|--------------|
| `altaDengue` | Alta | Dengue A ou B |
| `altaDorTraumatica` | Alta | Dor Traumática |
| `altaHerpesZoster` | Alta | Herpes Zóster |
| `altaIVAS` | Alta | IVAS |
| `altaNefrolitiase` | Alta | Nefrolitíase |
| `altaPNMComorb` | Alta | PNM com comorbidades |
| `altaPNMSemComorb` | Alta | PNM sem comorbidade |
| `altaPNMAlergia` | Alta | PNM – alergia β-lactâmicos/macrolídeos |

---

### JavaScript — Logic Layer

All logic lives in [app.js](../app.js) (entry point, 81 lines).

| Function | Lines | Description |
|----------|-------|-------------|
| `copiar(tipo)` | [app.js:11-28](../app.js) | Looks up key in `textos`, marks the selected button active, and displays the template in the preview panel |
| `copiarPreview()` | [app.js:30-50](../app.js) | Copies the current editable preview text to clipboard, with `execCommand` fallback |
| `toast(msg)` | [app.js:52-77](../app.js) | Creates or reuses `#toast` DOM element, shows message for 1100ms |

**Module wiring ([app.js:1-9](../app.js)):**
```js
import { clinicaTemplates } from './data/clinica.js';
import { traumaTemplates } from './data/trauma.js';
import { altaTemplates } from './data/alta.js';
const textos = { ...clinicaTemplates, ...traumaTemplates, ...altaTemplates };
```

**Global exposure ([app.js:80-81](../app.js)):**
```js
window.copiar = copiar; // required for inline onclick handlers in index.html
window.copiarPreview = copiarPreview;
```

**Global side effects:**
- `window.__toastTimer` — stores the `setTimeout` ID for the toast hide timer
- `window.copiar` — exposes the template-selection function to HTML onclick attributes
- `window.copiarPreview` — exposes the preview copy function to the "Copiar" button

---

### CSS — Styling

| File | Lines | Description |
|------|-------|-------------|
| [style.css](../style.css) | 258 | Dark responsive theme, layout, cards, buttons, and preview panel styles |

**Key rules:**
- [style.css:1-18](../style.css) — `:root`: design tokens for colors, radii, and shadows
- [style.css:24-33](../style.css) — `body`: dark background with lightweight radial accent and system font
- [style.css:37-57](../style.css) — `.layout`, `.sidebar`, `.preview`: two-column desktop layout
- [style.css:70-128](../style.css) — `.section` and `button`: card styling, green actions, hover, focus, and active states
- [style.css:132-211](../style.css) — preview empty state, header, copy button, and editable body panel
- [style.css:213-258](../style.css) — responsive stacked layout for screens below `860px`

---

## No Files In These Categories

| Category | Status |
|----------|--------|
| Configuration files (package.json, tsconfig, etc.) | Not present |
| Build scripts | Not present |
| Tests | Not present |
| Environment files (.env) | Not present |
| CI/CD configuration | Not present |
| Linting configuration | Not present |
| Migration files | Not present |
| Server-side code | Not present |
