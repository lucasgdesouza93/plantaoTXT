# API_CONTRACTS.md

## Status

**No HTTP API exists in this project.**

There are no REST endpoints, GraphQL endpoints, WebSocket connections, or runtime network calls.

---

## Internal JavaScript API

The application defines four main functions in [app.js](../app.js). Two are exposed on `window` for inline `onclick` handlers.

| Function | Exposed as | Purpose |
|----------|-----------|---------|
| `copiar(tipo)` | `window.copiar` | Shows the selected template, procedure description, or prompt in the preview panel |
| `copiarPreview()` | `window.copiarPreview` | Copies the current preview text to clipboard |
| `toast(msg)` | internal only | Shows the temporary "Copiado ✓" notification |
| `initCategoryToggles()` | internal only | Initializes checkbox-controlled collapse/expand behavior for sidebar categories |

---

### `copiar(tipo)`

Displays a template, procedure description, or prompt in the preview panel. It does **not** copy automatically.

**Signature:**
```js
function copiar(tipo: string): void
```

**Valid values for `tipo`:**

| Group | Values |
|-------|--------|
| Clínica | `admissaoClinica`, `evolucao` |
| Trauma | `admissaoTraumaFem`, `admissaoTraumaMasc` |
| Procedimentos | `orotrachealIntubation`, `cricothyroidotomy`, `chestTubeDrainage`, `thoracentesis`, `resuscitativeThoracotomy`, `synchronizedCardioversion`, `transvenousPacemaker`, `pericardiocentesis`, `centralVenousAccess`, `arterialPuncture`, `intraosseousAccess`, `lumbarPuncture`, `paracentesis`, `urinaryCatheterization`, `enteralTubeInsertion`, `immobilization`, `jointReduction`, `woundSuture`, `abscessDrainage`, `proceduralSedation` |
| Alta | `altaDengue`, `altaDorTraumatica`, `altaHerpesZoster`, `altaIVAS`, `altaNefrolitiase`, `altaPNMComorb`, `altaPNMSemComorb`, `altaPNMAlergia` |
| Prompts de IA | `promptResultadosLaboratoriaisLinha` |

**Behavior:**
1. Looks up `textos[tipo]`.
2. If the key does not exist, shows `alert("Modelo não encontrado.")`.
3. Clears `.active` from `.model-button` elements and marks the selected one.
4. Shows `#preview-content`.
5. Updates `#preview-title` and `#preview-body`.

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
