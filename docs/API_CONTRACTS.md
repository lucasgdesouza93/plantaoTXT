# API_CONTRACTS.md

## Status

**No HTTP API exists in this project.**

There are no REST endpoints, GraphQL endpoints, WebSocket connections, or runtime network calls.

---

## Internal JavaScript API

[app.js](../app.js) keeps every function in module scope. **Nothing is exposed on `window`** — buttons are bound with `addEventListener` via `data-template` / `data-form` attributes, as required by the CSP (AD-07, AD-11).

| Function | Purpose |
|----------|---------|
| `copiar(tipo, btn)` | Shows the selected template, procedure description, or prompt in the preview panel |
| `abrirFormulario(modelo, btn)` | Mounts the evolução form for the selected model |
| `copiarPreview()` | Copies the current preview text to clipboard |
| `toast(msg)` | Shows the temporary "Copiado ✓" notification; also injected into the form engine |
| `initCategoryToggles()` | Initializes checkbox-controlled collapse/expand behavior for sidebar categories |

The only cross-file contract is the [evolucao-engine.js](../evolucao-engine.js) module interface documented at the end of this file.

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
| Prompts de IA | `promptInterconsulta`, `promptResultadosLaboratoriaisLinha` |

**Behavior:**
1. Looks up `textos[tipo]`; returns silently if the key does not exist.
2. Clears `.active` from `.model-button` elements and marks the selected one.
3. Unmounts any evolução form and hides `#preview-form`.
4. Shows `#preview-content`.
5. Updates `#preview-title` and `#preview-body`.

---

## `abrirFormulario(modelo, btn)`

Mounts the interactive evolução form for a model. Counterpart of `copiar()` for `.model-button[data-form]` buttons.

**Signature:**
```js
function abrirFormulario(modelo: string, btn?: HTMLElement): void
```

**Valid values for `modelo`:** `admissao`, `abcde`, `soap`, `sistemas`, `breve`, `intercorrencia`

**Behavior:**
1. Clears `.active` from `.model-button` elements and marks the selected one.
2. Hides `#preview-empty` and `#preview-content`.
3. Shows `#preview-form` and calls `mountEvolucao(#preview-form, modelo, toast)`.

---

## `evolucao-engine.js` module contract

| Export | Signature | Behavior |
|--------|-----------|----------|
| `mountEvolucao` | `(container: HTMLElement, tplId: string, toast: (msg: string) => void) => void` | Empties `container` and builds the form for `tplId`; no-op if `tplId` is unknown. Only one form may be mounted at a time. |
| `unmountEvolucao` | `(container: HTMLElement) => void` | Empties `container` and releases the active context. Safe to call when nothing is mounted. |
| `modelosEvolucao` | `Array<{ id: string, name: string }>` | One entry per model, in declaration order. |

The engine never writes to `window`, never reads DOM outside its `container`, and calls the injected `toast` instead of creating its own.

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
