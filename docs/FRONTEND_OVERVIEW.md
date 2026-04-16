# FRONTEND_OVERVIEW.md

## Main Pages / Routes

There is a **single page** with no routing system.

| Page | File | URL | Description |
|------|------|-----|-------------|
| Main (only) page | [index.html](../index.html) | `/` (root) | Sidebar with checkbox-controlled categories, 33 action buttons, and an editable preview panel |

---

## Layout Structure

Two-column desktop layout: fixed sidebar on the left, scrollable preview panel on the right.

```
<div class="layout">
  <aside class="sidebar">
    <h1>PlantãoTXT</h1>

    <div class="section sidebar-category">
      <label class="category-header">
        <input type="checkbox" class="category-toggle">
        <span class="category-title">Clínica</span>
      </label>
      <div class="category-content">
        <button class="model-button" onclick="copiar('...')">
      </div>
    </div>
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
| `.sidebar-category` | Card-like wrapper for each category | [index.html](../index.html), styled in [style.css](../style.css) |
| `.category-header` | Clickable label that contains the checkbox and category title | [index.html](../index.html) |
| `.category-toggle` | Checkbox that controls expanded/collapsed state; starts unchecked by default | initialized by [app.js](../app.js) |
| `.category-content` | Wrapper that contains the buttons and is hidden when collapsed | [index.html](../index.html), toggled by `.collapsed` |
| `.model-button` | Sidebar button for each template, procedure description, or prompt | [index.html](../index.html), selected by [app.js](../app.js) |
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
| Category visibility state | `.collapsed` class on `.sidebar-category` | DOM class derived from checkbox state; initial state is collapsed because checkboxes start unchecked |

The main content registry is `const textos`, assembled at module load time from the data files in [data/](../data/).

---

## Navigation Flow

There is no navigation. Every interaction is:

1. Categories start recolhidas, and the user checks or unchecks a category header to show or hide its buttons.
2. `initCategoryToggles()` updates `.collapsed` on the matching `.sidebar-category`.
3. User clicks a `.model-button` in the sidebar.
4. That button receives `.active` and the previous active model button is cleared.
5. Selected template/prompt appears in `#preview-body`; label appears in `#preview-title`.
6. User can edit the content directly in the preview area.
7. User clicks **"Copiar"**.
8. `copiarPreview()` writes the current preview text to the clipboard.
9. A temporary toast appears.

---

## Styling Summary

File: [style.css](../style.css)

| Property | Value |
|----------|-------|
| Color scheme | Dark mode only |
| CSS organization | `:root` design tokens for colors, radii, and shadows |
| Body background | `#08111f` plus a radial gradient accent |
| Section background | Translucent dark panel with border and shadow |
| Category header | Horizontal flex row with checkbox + title |
| Collapsed state | `.sidebar-category.collapsed .category-content { display: none; }` |
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
