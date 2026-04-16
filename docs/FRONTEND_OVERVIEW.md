# FRONTEND_OVERVIEW.md

## Main Pages / Routes

There is a **single page** with no routing system.

| Page | File | URL | Description |
|------|------|-----|-------------|
| Main (only) page | [index.html](../index.html) | `/` (root) | Sidebar with 13 buttons plus an editable preview panel |

---

## Layout Structure

Two-column desktop layout: fixed sidebar on the left, scrollable preview panel on the right.

```
<div class="layout">
  <aside class="sidebar">
    <h1>PlantãoTXT</h1>
    <div class="section">Clínica</div>
    <div class="section">Trauma</div>
    <div class="section">Orientações / Prescrições (Alta)</div>
    <div class="section">Prompts de IA</div>
  </aside>

  <main class="preview">
    <div id="preview-empty">
    <div id="preview-content">
      <div id="preview-header">
        <div id="preview-title">
        <button id="btn-copy" onclick="copiarPreview()">
      </div>
      <pre id="preview-body" contenteditable="true">
    </div>
  </main>
</div>
```

File references: [index.html](../index.html)

---

## Key Components

There are no reusable component abstractions.

| Element | Description | Source |
|---------|-------------|--------|
| Sidebar `<button>` elements | 13 buttons (`type="button"`), one per template or prompt | [index.html](../index.html) |
| `#preview-empty` | Placeholder shown before any selection | [index.html](../index.html) |
| `#preview-content` | Wrapper for header + body; hidden until first click | [index.html](../index.html) |
| `#preview-title` | Shows the label of the selected button | populated by [app.js](../app.js) |
| `#btn-copy` | Copies the editable preview text to clipboard | [index.html](../index.html), calls `copiarPreview()` |
| `#preview-body` | Editable `<pre>` containing the template/prompt text | populated by [app.js](../app.js) |
| `#toast` | Dynamically created "Copiado ✓" notification | [app.js](../app.js) |

---

## State Management

No state management framework is used.

| State | Location | Type |
|-------|----------|------|
| Toast timer reference | `window.__toastTimer` | Global variable (`setTimeout` ID) |
| Toast DOM element | `#toast` in `document.body` | DOM reference, created on first use |

The main content registry is `const textos`, assembled at module load time from the data files in [data/](../data/).

---

## Navigation Flow

There is no navigation. Every interaction is:

1. User clicks a button in the sidebar.
2. Button receives `.active` class and the previous one is cleared.
3. Selected template/prompt appears in `#preview-body`; label appears in `#preview-title`.
4. User can edit the content directly in the preview area.
5. User clicks **"Copiar"**.
6. `copiarPreview()` writes the current preview text to the clipboard.
7. A temporary toast appears.

---

## Styling Summary

File: [style.css](../style.css)

| Property | Value |
|----------|-------|
| Color scheme | Dark mode only |
| CSS organization | `:root` design tokens for colors, radii, and shadows |
| Body background | `#08111f` plus a radial gradient accent |
| Section background | Translucent dark panel with border and shadow |
| Button color | Green accent token |
| Preview font | `"Courier New", Courier, monospace` |
| Sidebar width | `320px` on desktop; full-width stacked layout below `860px` |
| Preview body | Dark gradient panel with editable text |

---

## Browser Compatibility

| Feature | Support | Fallback |
|---------|---------|----------|
| `navigator.clipboard.writeText()` | Modern browsers | `document.execCommand('copy')` via hidden textarea |
| `async/await` | ES2017+ browsers | None |
| ES modules (`type="module"`) | Modern browsers | None |
| CSS variables | Modern browsers | None |

The page should be served over HTTP/HTTPS because `app.js` is loaded as an ES module.
