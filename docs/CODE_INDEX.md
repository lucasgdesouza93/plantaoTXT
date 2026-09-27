# CODE_INDEX.md

## Full File Tree

```
d:/Apps/PlantaoTXT/
├── index.html          Single-page HTML shell
├── app.js              Entry point: imports data modules, wires listeners, switches the three preview modes
├── evolucao-engine.js  Evolução form engine: renders fields, builds the prontuário text
├── dripcalc-engine.js  DripCalc calculator UI (Ferramentas)
├── style.css           All visual styling
├── evolucao.css        Styling for the evolução form (.ev- prefix)
├── dripcalc.css        Styling for DripCalc (.dc- prefix)
├── _headers            HTTP security headers for Netlify / Cloudflare Pages
├── README.md           Short project description and how to run it
├── CLAUDE.md           Working rules for AI agents in this repo
├── .gitattributes      Line-ending normalization
├── dripcalc/
│   ├── calc.js         Pure infusion / bolus / fluid-rate formulas
│   ├── data.js         Pump presets, drug presentations, unit options
│   └── constants.js    Unit ids and defaults
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

Not shown: `.vscode/` and `.claude/` hold editor and agent settings and have no effect on the application.

---

## Files by Domain

### HTML — DOM Structure

| File | Description |
|------|-------------|
| [index.html](../index.html) | Page shell with six `.sidebar-category` groups, checkbox-based category headers, `.model-button` entries (`data-template` for texts, `data-form` for forms, `data-tool` for tools), the preview panel, and the `#preview-form` / `#preview-tool` containers |

### JavaScript — Data Layer

Each file in [data/](../data/) exports a named object. The text modules are merged into `textos` by `app.js`; the models module feeds the form engine instead.

| File | Export | Keys |
|------|--------|------|
| [data/procedimentos.js](../data/procedimentos.js) | `procedureTemplates` | 20 procedure description keys |
| [data/alta.js](../data/alta.js) | `altaTemplates` | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| [data/ia.js](../data/ia.js) | `aiPromptTemplates` | `promptResultadosLaboratoriaisLinha` |
| [data/evolucao-modelos.js](../data/evolucao-modelos.js) | `TEMPLATES`, `N`, `num`, `fmtN` | models `admissao`, `abcde`, `soap`, `sistemas`, `breve`, `intercorrencia` |

`num()` and `fmtN()` live in the models file, not the engine, because the `CALC` functions declared there close over them; the engine imports them back from it. `ckdEpi2021()` is private to the file and parses creatinine with its own `parseFloat` — `num()` treats a dot as a thousands separator, so `1.2` would become `12`.

[dripcalc/](../dripcalc/) — copied unchanged from the standalone DripCalc app, except that `CACHE_VERSION` and `STORAGE_KEY` were dropped from `constants.js`:

| File | Export | Contents |
|------|--------|----------|
| [dripcalc/constants.js](../dripcalc/constants.js) | `UNIT`, `AMOUNT_UNIT`, `DEFAULT_MODE`, `DEFAULT_INFUSION_UNIT`, `DEFAULT_BOLUS_UNIT`, `DEFAULT_TIME_UNIT` | Frozen unit id maps and defaults |
| [dripcalc/calc.js](../dripcalc/calc.js) | 12 pure functions | Parsing, unit conversion, formatting, and the four calculators |
| [dripcalc/data.js](../dripcalc/data.js) | `infusionPresets` (7), `presentations` (26), `infusionUnits` (11), `infusionUnitOptions` (9), `ivPushUnitOptions` (4), `buildCatalogForMode()`, `detectDrug()` | Drug catalogs and unit dropdowns |

#### Form model format

Each entry of `TEMPLATES` is `{ id, name, title, desc, sections[] }`, and each section is `{ title, inline?, normalAll?, fields[] }`. Fields are built by the short constructors at the top of the file:

| Constructor | Field | Notes |
|-------------|-------|-------|
| `T` | short text | `unit` appends a unit to numeric values |
| `A` | long text | `normal` adds a "Normal" button with the standard finding |
| `C` / `M` | single / multiple choice chips | `other`, `detail`, `details` (per-option text input, output as `Option (text)`), `list`, `sep` |
| `S` | dropdown | |
| `I` | insert buttons that add `- item` lines to a free-text area | |
| `R` | row of subfields | `[label, unit, placeholder, id]` |
| `GCS` | Glasgow coma scale | selects + computed badge |
| `CALC` | computed field | `fn(values)` — needs `id` on the fields it reads |

Three `CALC` fields exist today, all in the `sistemas` model: **Driving pressure** (`pplat` − `peep`), **Relação P/F** (`pf_pao2` / `pf_fio2`, accepting FiO2 as either `40` or `0,4`), and **TFGe (CKD-EPI 2021)** (`cr`, `idade`, `sexo`; returns empty under 18 years or without a Sexo, since the formula has no value for either).

Common field options: `out` (label in the output), `nolabel`, `below` (value starts on the line below the label), `full`, `ph`, `rows`, `noout` (feeds calculations only), `intitle` (goes into the title), `part` / `gather` (merge several fields into one output line), `sex` (drives `{o|a}` gender agreement), `id` (required for any field a `CALC` reads).

Fields repeated across models are defined once as small builders just above `TEMPLATES` — `IDADE`, `PESO`, `SEXO`, `ALERGIAS`, `CHEGADA`, `ORIGEM`, `PERIODO`, `INFORMANTE`, `EXAM` — plus shared option lists (`COMORB`, `DISPOSITIVOS`, `DESTINO`, `PLANO`, `PUPILAS`). Editing one of them changes every model that uses it. Builders that take options (`IDADE(o)`, `PESO(o)`, `SEXO(o)`) merge them over their defaults, e.g. `SEXO({noout:true,id:'sexo'})`. `PESO` is in the Identificação section of all six models.

Two options add free text to a chip field and are easy to confuse:

| Option | Adds | Output |
|--------|------|--------|
| `other` | one input at the end of the chip row | an extra item, or — with `detail: true` — appended in parentheses to the **last** selected option |
| `details` | one input per **selected** option, below the row | each option followed by its own text in parentheses, e.g. `CVC (VJID, 22/09)` |

`details` values are stored under `<fieldId>__d__<option>`, `other` under `<fieldId>__o`.

### JavaScript — Logic Layer

[app.js](../app.js):

| Function | Description |
|----------|-------------|
| `copiar(tipo, btn)` | Looks up the selected key, unmounts any evolução form, and shows the text in the preview panel |
| `limparPreview(btn)` | Marks the selected button, unmounts the form and the tool, and hides every preview mode |
| `abrirFerramenta(nome, btn)` | Mounts DripCalc in `#preview-tool` (only `dripcalc` exists) |
| `abrirFormulario(modelo, btn)` | Hides the text panel and mounts the evolução form for that model in `#preview-form` |
| `copiarPreview()` | Copies the current editable preview content to clipboard |
| `toast(msg)` | Creates or reuses the toast notification element; also passed to the form engine |
| `initModelButtons()` | Attaches click listeners to all `.model-button[data-template]` elements |
| `initFormButtons()` | Attaches click listeners to all `.model-button[data-form]` elements |
| `initToolButtons()` | Attaches click listeners to all `.model-button[data-tool]` elements |
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

[dripcalc-engine.js](../dripcalc-engine.js) — exported:

| Export | Description |
|--------|-------------|
| `mountDripCalc(container, toast)` | Clears the container, builds the 4-mode calculator (Dose → mL/h, mL/h → Dose, Bolus, Infusão) and restores the values of this tab |
| `unmountDripCalc(container)` | Empties the container and releases the active context |

[dripcalc-engine.js](../dripcalc-engine.js) — internal:

| Function | Description |
|----------|-------------|
| `setMode(mode)` | Swaps the unit dropdown (bolus units vs infusion units), rebuilds the preset list, then syncs |
| `syncFields()` | Shows/hides and enables/disables each field for the current mode, and relabels Dose / Dose total |
| `renderDrugOptions()` | Rebuilds the preset `<optgroup>`s, keeping the selected drug when it still exists |
| `applySelection()` | Fills dose, unit and volume from the chosen preset and preselects that drug's usual unit |
| `hasMinimumData()` | Guards `compute()`: shows `--` instead of an error while the form is still incomplete |
| `compute()` | Validates, calls the pure calculator, and returns `{ label, value, meta, text }` or `{ error }` |
| `refresh()` | Rebuilds the result card and enables/disables the copy button on every edit |
| `save()` / `loadState()` | Whole-state read/write of `sessionStorage` key `dripcalc.v1` |
| `clearAll()` | Empties the fields, restores the defaults, and removes the storage key |

Hidden fields are also `disabled`, so a value left over from another mode cannot reach the calculation. `hasMinimumData()` is why the panel reads `--` rather than flashing validation errors while the user is still typing.

Beyond the original app, `compute()` rejects dose/solution unit pairs that mix UI with mass — the original produced a meaningless number. Not ported: service worker, manifest, icons, share button, swipe navigation, tests.

`app.js` imports all data modules and wires all event listeners within module scope. No globals are exposed on `window`.

### CSS — Styling

| File | Description |
|------|-------------|
| [style.css](../style.css) | Dark responsive theme, category headers, collapsible sidebar groups, buttons, and preview panel styles |
| [dripcalc.css](../dripcalc.css) | DripCalc: mode tabs, two-column field grid, sticky result card; same `.dc-root` reset approach as `evolucao.css` |
| [evolucao.css](../evolucao.css) | Evolução form: two-column layout, cards, chips, unit inputs, Glasgow grid, and output panel |

Both `evolucao.css` and `dripcalc.css` follow the same pattern: every selector prefixed (`.ev-` / `.dc-`), scoped under the engine's root element, reusing the `--color-*` tokens from `style.css`, and opening with a reset block — `style.css` styles bare `button`, `input`, `select` and `textarea` globally (full-width green buttons), which would otherwise apply to every chip and every field of both engines. Two consequences when editing either file:

- The reset uses `.ev-root <tag>` / `.dc-root <tag>` (specificity 0,1,1), so a later single-class rule such as `.ev-out` **loses** to it. Rules that must win carry the tag: `.ev-root textarea.ev-out`.
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
