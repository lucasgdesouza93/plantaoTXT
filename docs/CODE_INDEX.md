# CODE_INDEX.md

## Full File Tree

```
d:/Apps/PlantaoTXT/
├── index.html          Single-page HTML shell
├── app.js              Entry point: imports data modules, wires event listeners, switches text/form mode
├── evolucao-engine.js  Evolução form engine: renders fields, builds the prontuário text
├── style.css           All visual styling
├── evolucao.css        Styling for the evolução form (.ev- prefix)
├── _headers            HTTP security headers for Netlify / Cloudflare Pages
├── data/
│   ├── evolucao-modelos.js Declarative models for the evolução forms
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
| [index.html](../index.html) | Page shell with four `.sidebar-category` groups, checkbox-based category headers, `.model-button` entries (`data-template` for texts, `data-form` for forms), the preview panel, and the `#preview-form` container |

### JavaScript — Data Layer

Each file in [data/](../data/) exports a named object. The text modules are merged into `textos` by `app.js`; the models module feeds the form engine instead.

| File | Export | Keys |
|------|--------|------|
| [data/procedimentos.js](../data/procedimentos.js) | `procedureTemplates` | 20 procedure description keys |
| [data/alta.js](../data/alta.js) | `altaTemplates` | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| [data/ia.js](../data/ia.js) | `aiPromptTemplates` | `promptInterconsulta`, `promptResultadosLaboratoriaisLinha` |
| [data/evolucao-modelos.js](../data/evolucao-modelos.js) | `TEMPLATES`, `N`, `num`, `fmtN` | models `admissao`, `abcde`, `soap`, `sistemas`, `breve`, `intercorrencia` |

#### Form model format

Each entry of `TEMPLATES` is `{ id, name, title, desc, sections[] }`, and each section is `{ title, inline?, normalAll?, fields[] }`. Fields are built by the short constructors at the top of the file:

| Constructor | Field | Notes |
|-------------|-------|-------|
| `T` | short text | `unit` appends a unit to numeric values |
| `A` | long text | `normal` adds a "Normal" button with the standard finding |
| `C` / `M` | single / multiple choice chips | `other`, `detail`, `list`, `sep` |
| `S` | dropdown | |
| `I` | insert buttons that add `- item` lines to a free-text area | |
| `R` | row of subfields | `[label, unit, placeholder, id]` |
| `GCS` | Glasgow coma scale | selects + computed badge |
| `CALC` | computed field | `fn(values)` — needs `id` on the fields it reads |

Common field options: `out` (label in the output), `nolabel`, `full`, `ph`, `rows`, `noout` (feeds calculations only), `intitle` (goes into the title), `part` / `gather` (merge several fields into one output line), `sex` (drives `{o|a}` gender agreement).

### JavaScript — Logic Layer

[app.js](../app.js):

| Function | Description |
|----------|-------------|
| `copiar(tipo, btn)` | Looks up the selected key, unmounts any evolução form, and shows the text in the preview panel |
| `abrirFormulario(modelo, btn)` | Hides the text panel and mounts the evolução form for that model in `#preview-form` |
| `copiarPreview()` | Copies the current editable preview content to clipboard |
| `toast(msg)` | Creates or reuses the toast notification element; also passed to the form engine |
| `initModelButtons()` | Attaches click listeners to all `.model-button[data-template]` elements |
| `initFormButtons()` | Attaches click listeners to all `.model-button[data-form]` elements |
| `initCopyButton()` | Attaches the click listener to `#btn-copy` |
| `initCategoryToggles()` | Binds `.category-toggle` checkboxes and toggles `.collapsed` on each `.sidebar-category` |

[evolucao-engine.js](../evolucao-engine.js) — exported:

| Export | Description |
|--------|-------------|
| `mountEvolucao(container, tplId, toast)` | Clears the container and builds the whole form UI for that model |
| `unmountEvolucao(container)` | Empties the container and releases the active context |
| `modelosEvolucao` | `[{ id, name }]` for every model, for building the sidebar |

[evolucao-engine.js](../evolucao-engine.js) — internal:

| Function | Description |
|----------|-------------|
| `renderForm()` / `renderField(f)` | Build the sections and one field each, by field type |
| `build()` | Assembles the prontuário text: title, date/time, then one block per non-empty section |
| `fieldOut(f, v, inner)` | One output line for one field, honouring `out` / `nolabel` / `list` / `gather` / `noout` |
| `refresh()` | Recomputes CALC fields, Glasgow badges, and the output panel |
| `g(text)` / `applySex()` | Gender agreement: `g()` resolves `{o|a}` on render, `applySex()` rewrites already-typed text when Sexo changes |
| `set(id, val)` | Single write path: value → sessionStorage → refresh |
| `copy()` | Clipboard write with `execCommand` fallback, then `toast()` |

Only one form is mounted at a time; the module keeps its nodes and indexes in a single `cur` context object. The `Ctrl`/`Cmd`+`Enter` shortcut is one module-level listener guarded by `cur.root.isConnected`.

`app.js` imports all data modules and wires all event listeners within module scope. No globals are exposed on `window`.

### CSS — Styling

| File | Description |
|------|-------------|
| [style.css](../style.css) | Dark responsive theme, category headers, collapsible sidebar groups, buttons, and preview panel styles |
| [evolucao.css](../evolucao.css) | Evolução form: two-column layout, cards, chips, unit inputs, Glasgow grid, and output panel |

Every selector in `evolucao.css` is prefixed `.ev-` and scoped under `.ev-root` / `#preview-form`, and the file reuses the `--color-*` tokens from `style.css`. It opens with a reset block because `style.css` styles bare `button`, `input`, `select` and `textarea` globally (full-width green buttons), which would otherwise apply to every chip in the form. Two consequences to keep in mind when editing it:

- The reset uses `.ev-root <tag>` (specificity 0,1,1), so a later single-class rule such as `.ev-out` **loses** to it. Rules that must win are written as `.ev-root textarea.ev-out`.
- A chip's computed `display` is `block`, not `inline-block`: flex items are blockified by the CSS spec. That is expected, not a bug.

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
