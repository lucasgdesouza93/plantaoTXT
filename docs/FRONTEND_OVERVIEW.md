# FRONTEND_OVERVIEW.md

## Main Pages / Routes

There is a **single page** with no routing system.

| Page | File | URL | Description |
|------|------|-----|-------------|
| Main (only) page | [index.html](../index.html) | `/` (root) | Sidebar with 12 buttons + template preview panel |

---

## Layout Structure

Two-column desktop layout: fixed sidebar on the left, scrollable preview panel on the right.

```
<div class="layout">             flex row, 100vh

  <aside class="sidebar">        320px desktop, scrollable; full-width below 860px
    <h1>PlantãoTXT</h1>
    <div class="section">        dark card with subtle border and shadow
      <h2>🏥 Clínica</h2>
      <button type="button" onclick="copiar('admissaoClinica')">
      <button type="button" onclick="copiar('evolucao')">
    </div>
    <div class="section">
      <h2>🚑 Trauma</h2>
      <button type="button" onclick="copiar('admissaoTraumaFem')">
      <button type="button" onclick="copiar('admissaoTraumaMasc')">
    </div>
    <div class="section">
      <h2>🧾 Orientações / Prescrições (Alta)</h2>
      <button type="button" onclick="copiar('altaDengue')">
      ... (8 buttons)
    </div>
  </aside>

  <main class="preview">                  flex: 1, scrollable
    <div id="preview-empty">              shown when no template selected
    <div id="preview-content">            shown after first click
      <div id="preview-header">           flex row, space-between; stacked below 860px
        <div id="preview-title">          template name label
        <button id="btn-copy"             copies preview text to clipboard
                onclick="copiarPreview()">
      </div>
      <pre id="preview-body"              template text, monospace, editable
           contenteditable="true">
    </div>
  </main>

</div>
```

File references: [index.html](../index.html)

---

## Key Components

There are no reusable component abstractions. The UI consists of:

| Element | Description | Source |
|---------|-------------|--------|
| Sidebar `<button>` elements | 12 buttons (`type="button"`), one per template | [index.html:16-35](../index.html) |
| `#preview-empty` | Placeholder shown before any button is clicked | [index.html:40](../index.html) |
| `#preview-content` | Wrapper for header + body; `hidden` until first click | [index.html:41-47](../index.html) |
| `#preview-header` | Flex row: template name on left, copy button on right | [index.html:42-45](../index.html) |
| `#preview-title` | Shows the label of the selected template | populated by [app.js:26](../app.js) |
| `#btn-copy` | "Copiar" button — copies editable preview text to clipboard | [index.html:44](../index.html), calls `copiarPreview()` |
| `#preview-body` | `<pre contenteditable>` — monospace template text, user-editable | populated by [app.js:27](../app.js) |
| `#toast` div | Dynamically created "Copiado ✓" notification | [app.js:52-77](../app.js) |

The `#toast` element is not present in the initial HTML. It is created by `toast()` on first call and reused on subsequent calls.

---

## State Management

No state management framework is used.

| State | Location | Type |
|-------|----------|------|
| Toast timer reference | `window.__toastTimer` | Global variable (`setTimeout` ID) |
| Toast DOM element | `#toast` in `document.body` | DOM reference, created on first use |

There is no application state beyond the timer. Template data is assembled at module load time from the three `data/` files and stored in `const textos` ([app.js:5-9](../app.js)).

File reference: [app.js:31-51](../app.js)

---

## Navigation Flow

There is no navigation. The application is a single view with no modals, drawers, tabs, or page transitions. Every interaction is:

1. User clicks a button in the sidebar
2. Button receives `.active` class (darker green + outline); previous active button is cleared
3. Template text appears in `#preview-body` (editable); template name appears in `#preview-title`
4. User optionally edits the text directly in the preview area (changes are session-only)
5. User clicks the **"Copiar"** button (`#btn-copy`) in the top-right of the preview
6. `copiarPreview()` reads the current content of `#preview-body` (including any edits) and writes it to clipboard
7. Toast notification "Copiado ✓" appears for 1.1 seconds, then fades out

---

## Styling Summary

File: [style.css](../style.css)

| Property | Value |
|----------|-------|
| Color scheme | Dark mode only |
| CSS organization | `:root` design tokens for colors, radii, and shadow values |
| Body background | `#08111f` plus a lightweight radial gradient accent |
| Section background | translucent dark panel with subtle border and shadow |
| Button color | green accent token (`#22c55e`) |
| Button active color | stronger green (`#16a34a`) + soft green focus ring |
| Preview body background | dark linear gradient using local CSS variables |
| Preview body focus | border highlight + soft green `box-shadow` |
| Preview font | `"Courier New", Courier, monospace` |
| Sidebar font | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Sidebar width | `320px` on desktop; full-width stacked layout below `860px` |
| `#preview-header` layout | flex row with spacing on desktop; stacked on narrow screens |
| `#btn-copy` | overrides global `button` width to `auto`; full-width on narrow screens |
| Button border-radius | `var(--radius-sm)` (`10px`) |
| Section border-radius | `var(--radius-lg)` (`18px`) |
| Button hover | slightly brighter background, subtle elevation, and `translateY(-1px)` |

The styling remains plain CSS with no framework, CDN, images, icon library, or build dependency.

---

## Browser Compatibility

| Feature | Support | Fallback |
|---------|---------|----------|
| `navigator.clipboard.writeText()` | Modern browsers | `document.execCommand('copy')` via hidden textarea |
| `async/await` | ES2017+ browsers | None |
| ES modules (`type="module"`) | All modern browsers | None — required, no fallback |
| CSS variables | Modern browsers | None |
| CSS Grid | Not used | N/A |

> **Note:** Because `app.js` is loaded as `<script type="module">`, the page must be served over HTTP/HTTPS. Opening `index.html` directly as a `file://` URL will block module imports.
