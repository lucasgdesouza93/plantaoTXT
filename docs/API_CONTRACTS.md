# API_CONTRACTS.md

## Status

**No HTTP API exists in this project.**

There are no REST endpoints, GraphQL endpoints, WebSocket connections, or runtime network calls.

---

## Internal JavaScript API

[app.js](../app.js) keeps every function in module scope. **Nothing is exposed on `window`** — buttons are bound with `addEventListener` via `data-template` / `data-form` / `data-tool` attributes, as required by the CSP (AD-07, AD-11).

| Function | Purpose |
|----------|---------|
| `limparPreview(btn)` | Marks the clicked button and hides all three preview modes; every mode switch goes through it |
| `copiar(tipo, btn)` | Shows the selected template, procedure description, or prompt in the preview panel |
| `abrirFormulario(modelo, btn)` | Mounts the evolução form for the selected model |
| `abrirFerramenta(nome, btn)` | Mounts a tool (today only DripCalc) |
| `copiarPreview()` | Copies the current preview text to clipboard |
| `toast(msg)` | Shows the temporary "Copiado ✓" notification; also injected into both engines |
| `initModelButtons()` / `initFormButtons()` / `initToolButtons()` | Bind the click listeners of each button kind |
| `initCopyButton()` | Binds `#btn-copy` |
| `initCategoryToggles()` | Initializes checkbox-controlled collapse/expand behavior for sidebar categories |

There are two cross-file contracts, both documented below: [evolucao-engine.js](../evolucao-engine.js) and [dripcalc-engine.js](../dripcalc-engine.js). Both follow the same shape — `mount<X>(container, …, toast)` and `unmount<X>(container)`.

---

### `copiar(tipo, btn)`

Displays a template, procedure description, or prompt in the preview panel. It does **not** copy automatically.

**Signature:**
```js
function copiar(tipo: string, btn?: HTMLElement): void
```

**Valid values for `tipo`:**

| Group | Values |
|-------|--------|
| Procedimentos | `orotrachealIntubation`, `cricothyroidotomy`, `chestTubeDrainage`, `thoracentesis`, `resuscitativeThoracotomy`, `synchronizedCardioversion`, `transvenousPacemaker`, `pericardiocentesis`, `centralVenousAccess`, `arterialPuncture`, `intraosseousAccess`, `lumbarPuncture`, `paracentesis`, `urinaryCatheterization`, `enteralTubeInsertion`, `immobilization`, `jointReduction`, `woundSuture`, `abscessDrainage`, `proceduralSedation` |
| Alta | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| Prompts de IA | `promptResultadosLaboratoriaisLinha` |

**Behavior:**
1. Looks up `textos[tipo]`; returns silently if the key does not exist (no `alert`).
2. Calls `limparPreview(btn)`.
3. Shows `#preview-content`.
4. Updates `#preview-title` and `#preview-body`.

---

### `limparPreview(btn)`

Shared prelude of the three mode switches. Keeping it in one place is what guarantees the modes are mutually exclusive (AD-13).

**Signature:**
```js
function limparPreview(btn?: HTMLElement): void
```

**Behavior:**
1. Clears `.active` from every `.model-button` and marks `btn`.
2. `unmountEvolucao(#preview-form)` and hides it.
3. `unmountDripCalc(#preview-tool)` and hides it.
4. Hides `#preview-empty` and `#preview-content`.

---

## `abrirFormulario(modelo, btn)`

Mounts the interactive evolução form for a model. Counterpart of `copiar()` for `.model-button[data-form]` buttons.

**Signature:**
```js
function abrirFormulario(modelo: string, btn?: HTMLElement): void
```

**Valid values for `modelo`:** `admissao`, `abcde`, `soap`, `sistemas`, `breve`, `intercorrencia`

**Behavior:**
1. Calls `limparPreview(btn)`.
2. Shows `#preview-form` and calls `mountEvolucao(#preview-form, modelo, toast)`.

---

## `abrirFerramenta(nome, btn)`

Mounts a tool for `.model-button[data-tool]` buttons.

**Signature:**
```js
function abrirFerramenta(nome: string, btn?: HTMLElement): void
```

**Valid values for `nome`:** `dripcalc` — any other value returns silently before touching the preview, so an unknown `data-tool` leaves the current view untouched.

**Behavior:**
1. Returns immediately if `nome !== 'dripcalc'`.
2. Calls `limparPreview(btn)`.
3. Shows `#preview-tool` and calls `mountDripCalc(#preview-tool, toast)`.

---

## `evolucao-engine.js` module contract

| Export | Signature | Behavior |
|--------|-----------|----------|
| `mountEvolucao` | `(container: HTMLElement, tplId: string, toast: (msg: string) => void) => void` | Empties `container` and builds the form for `tplId`; no-op if `tplId` is unknown. Only one form may be mounted at a time. |
| `unmountEvolucao` | `(container: HTMLElement) => void` | Empties `container` and releases the active context. Safe to call when nothing is mounted. |
| `modelosEvolucao` | `Array<{ id: string, name: string }>` | One entry per model, in declaration order. |

The engine never writes to `window`, never reads DOM outside its `container`, and calls the injected `toast` instead of creating its own.

---

## `dripcalc-engine.js` module contract

| Export | Signature | Behavior |
|--------|-----------|----------|
| `mountDripCalc` | `(container: HTMLElement, toast: (msg: string) => void) => void` | Empties `container`, builds the four-mode calculator and restores the values saved in this tab. Only one calculator may be mounted at a time. |
| `unmountDripCalc` | `(container: HTMLElement) => void` | Empties `container` and releases the active context. Safe to call when nothing is mounted. |

Same guarantees as the evolução engine: module scope only, no `window`, no DOM outside `container`, injected `toast`.

**Modes** (`cur.mode`), each showing only the fields it needs:

| Mode | Asks for | Answers |
|------|----------|---------|
| `forward` | dose + unit, dilution, weight when the unit is per-kg | pump rate in mL/h |
| `reverse` | mL/h, dilution, weight when per-kg | dose being delivered |
| `bolus` | desired dose, presentation | volume to push, in mL |
| `infusion` | volume + time | rate in mL/h |

---

## `dripcalc/calc.js` — pure functions

Copied unchanged from the standalone DripCalc app. No DOM, no state, safe to call from anywhere.

| Function | Signature | Notes |
|----------|-----------|-------|
| `parseLocaleNumber` | `(value) => number` | Accepts comma as decimal separator; `NaN` when unparseable |
| `isPositiveNumber` | `(value) => boolean` | Finite and `> 0` |
| `toBaseUnit` | `(value, unit) => number` | Normalizes mg/g to mcg; other units pass through |
| `needsWeight` | `(unit) => boolean` | True for the per-kg units |
| `formatUnit` | `(unit) => string` | Unit id → label shown to the user (`mcg_kg_min` → `mcg/kg/min`) |
| `formatNumber` | `(value, decimals = 2) => string` | `pt-BR` formatting |
| `calculateConcentration` | `(totalAmount, amountUnit, totalVolume) => number` | Base unit per mL |
| `calculateForwardRate` | `(dose, unit, weight, concentration) => { mlh } \| { error }` | Rejects bolus units |
| `calculateReverseRate` | `(mlh, unit, weight, concentration) => { dose } \| { error }` | Rejects bolus units |
| `calculateBolusDoseBase` | `(dose, unit, weight) => number` | Bolus dose in base units |
| `calculateIvPushVolume` | `(doseValue, doseUnit, totalDoseValue, totalDoseUnit, totalVolume) => { volumeMl, concentration, … } \| { error }` | |
| `calculateFluidPumpRate` | `(volumeMl, timeValue, timeUnit) => { mlh, hours } \| { error }` | `timeUnit` is `min` or `hr` |

Every calculator returns either a result object or `{ error: string }` — never throws. The engine surfaces `error` in the result card and disables the copy button.

`dripcalc/data.js` exports the catalogs (`infusionPresets`, `presentations`, `infusionUnits`, `infusionUnitOptions`, `ivPushUnitOptions`), plus `buildCatalogForMode(mode)` and `detectDrug(name)`. `dripcalc/constants.js` exports the `UNIT` / `AMOUNT_UNIT` id maps and the `DEFAULT_*` values.

---

### `copiarPreview()`

Copies the current content of `#preview-body`, including any user edits.

**Signature:**
```js
async function copiarPreview(): Promise<void>
```

**Behavior:**
1. Reads `#preview-body.innerText`.
2. Returns silently if empty.
3. Tries `navigator.clipboard.writeText(texto)`.
4. Falls back to `document.execCommand("copy")` with a hidden `<textarea>`.
5. Calls `toast("Copiado ✓")` on success.

---

### `toast(msg)`

Shows a temporary bottom-centered notification and reuses the same DOM node across calls.

---

### `initCategoryToggles()`

Binds all `.category-toggle` checkboxes, applies the initial collapsed state for unchecked categories, and updates `.collapsed` on change.

---

## Request / Response Payloads

Not applicable — no network requests are made.
