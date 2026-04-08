# API_CONTRACTS.md

## Status

**No HTTP API exists in this project.**

There are no REST endpoints, GraphQL endpoints, WebSocket connections, or any network calls made by the application at runtime.

---

## HTTP Endpoints

Not identified in code.

---

## Internal JavaScript API

The application exposes three functions defined in [app.js](../app.js). Two are assigned to `window` for use in inline `onclick` handlers. `toast` is internal.

| Function | Exposed as | Purpose |
|----------|-----------|---------|
| `copiar(tipo)` | `window.copiar` | Shows template in preview panel; does NOT copy |
| `copiarPreview()` | `window.copiarPreview` | Copies current preview text to clipboard |
| `toast(msg)` | internal only | Shows the "Copiado ✓" notification |

---

### `copiar(tipo)` — [app.js:11-28](../app.js)

Displays a template in the preview panel. Does **not** copy to clipboard. Exposed globally as `window.copiar`.

**Signature:**
```js
function copiar(tipo: string): void
// also available as: window.copiar(tipo)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tipo` | `string` | Yes | Key name of the template to display. Must match a key in the `textos` object. |

**Valid values for `tipo`:**

| Value | Template |
|-------|----------|
| `'admissaoClinica'` | ER clinical admission |
| `'evolucao'` | ER progression note |
| `'admissaoTraumaFem'` | Trauma admission – female |
| `'admissaoTraumaMasc'` | Trauma admission – male |
| `'altaDengue'` | Dengue discharge prescription |
| `'altaDorTraumatica'` | Traumatic pain discharge prescription |
| `'altaHerpesZoster'` | Herpes zoster discharge prescription |
| `'altaIVAS'` | IVAS discharge prescription |
| `'altaNefrolitiase'` | Nephrolithiasis discharge prescription |
| `'altaPNMComorb'` | Community pneumonia (with comorbidities) |
| `'altaPNMSemComorb'` | Community pneumonia (without comorbidities) |
| `'altaPNMAlergia'` | Community pneumonia (β-lactam/macrolide allergy) |

**Behavior:**
1. Looks up `textos[tipo]`
2. If key not found: calls `alert("Modelo não encontrado.")` and returns
3. Removes `.active` from all sidebar buttons; adds `.active` to the clicked button
4. Sets `#preview-empty` hidden; shows `#preview-content`
5. Sets `#preview-title` text to the button's label
6. Sets `#preview-body` text to the template string (discards any previous edits)

**Error cases:**

| Condition | Behavior |
|-----------|----------|
| Unknown `tipo` key | `alert()` shown, preview not updated |

---

### `copiarPreview()` — [app.js:30-50](../app.js)

Copies the current content of `#preview-body` to the clipboard. Reads whatever text is present — including user edits made via `contenteditable`. Exposed globally as `window.copiarPreview`.

**Signature:**
```js
async function copiarPreview(): Promise<void>
// also available as: window.copiarPreview()
```

**Behavior:**
1. Reads `document.getElementById('preview-body').innerText` (preserves edited line breaks)
2. If empty: returns silently
3. Tries `navigator.clipboard.writeText(texto)` (async, modern Clipboard API)
4. On failure: creates a hidden `<textarea>`, selects its content, calls `document.execCommand("copy")`, then removes the element
5. On success (either path): calls `toast("Copiado ✓")`

**Error cases:**

| Condition | Behavior |
|-----------|----------|
| Preview is empty | Returns silently, no clipboard write |
| Clipboard API unavailable | Falls back to `execCommand` |
| `execCommand` also fails | No error shown to user (silent failure) |

---

### `toast(msg)` — [app.js:52-77](../app.js)

Displays a temporary overlay notification at the bottom center of the viewport. Internal function — not exposed on `window`.

**Signature:**
```js
function toast(msg: string): void
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `msg` | `string` | Yes | Text to display inside the toast |

**Behavior:**
1. Checks for existing `#toast` element in DOM; creates it if absent
2. Sets `el.textContent = msg`
3. Sets `opacity: 1` to make toast visible
4. Clears any pending hide timer (`window.__toastTimer`)
5. Sets new timer: after 1100ms, sets `opacity: 0` (fade-out via CSS transition)

**Side effects:**
- Mutates DOM (appends `#toast` div to `document.body` on first call)
- Writes to `window.__toastTimer`

**Called with:** `"Copiado ✓"` (called by `copiarPreview()` — two call sites, both in the try/catch block)

---

## Request / Response Payloads

Not applicable — no network requests are made.

---

## Error Cases (Summary)

| Error | Location | Handling |
|-------|----------|----------|
| Invalid template key | `copiar()` | `alert()` dialog |
| Empty preview on copy | `copiarPreview()` | Silent return |
| Clipboard write failure | `copiarPreview()` | Fallback to `execCommand` |
| `execCommand` also fails | `copiarPreview()` | Silent (no user feedback) |
