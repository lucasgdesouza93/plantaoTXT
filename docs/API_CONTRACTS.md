# API_CONTRACTS.md

## Status

**No HTTP API exists in this project.**

There are no REST endpoints, GraphQL endpoints, WebSocket connections, or runtime network calls.

---

## Internal JavaScript API

The application exposes three functions defined in [app.js](../app.js). Two are assigned to `window` for inline `onclick` handlers.

| Function | Exposed as | Purpose |
|----------|-----------|---------|
| `copiar(tipo)` | `window.copiar` | Shows the selected template/prompt in the preview panel |
| `copiarPreview()` | `window.copiarPreview` | Copies current preview text to clipboard |
| `toast(msg)` | internal only | Shows the "Copiado ✓" notification |

---

### `copiar(tipo)`

Displays a template or prompt in the preview panel. It does **not** copy automatically.

**Signature:**
```js
function copiar(tipo: string): void
```

**Valid values for `tipo`:**

| Value | Meaning |
|-------|---------|
| `'admissaoClinica'` | ER clinical admission |
| `'evolucao'` | ER progression note |
| `'admissaoTraumaFem'` | Trauma admission – female |
| `'admissaoTraumaMasc'` | Trauma admission – male |
| `'altaDengue'` | Dengue discharge prescription |
| `'altaDorTraumatica'` | Traumatic pain discharge prescription |
| `'altaHerpesZoster'` | Herpes zoster discharge prescription |
| `'altaIVAS'` | IVAS discharge prescription |
| `'altaNefrolitiase'` | Nephrolithiasis discharge prescription |
| `'altaPNMComorb'` | Community pneumonia with comorbidities |
| `'altaPNMSemComorb'` | Community pneumonia without comorbidities |
| `'altaPNMAlergia'` | Community pneumonia for β-lactam/macrolide allergy |
| `'promptResultadosLaboratoriaisLinha'` | AI prompt for inline lab result formatting |

**Behavior:**
1. Looks up `textos[tipo]`.
2. If the key does not exist, shows `alert("Modelo não encontrado.")`.
3. Clears `.active` from buttons and marks the selected button.
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

## Request / Response Payloads

Not applicable — no network requests are made.
