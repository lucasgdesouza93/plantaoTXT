# FRONTEND_OVERVIEW.md

## Main Pages / Routes

There is a **single page** with no routing system.

| Page | File | URL | Description |
|------|------|-----|-------------|
| Main (only) page | [index.html](../index.html) | `/` (root) | Sidebar with checkbox-controlled categories, 37 action buttons, and a preview area with three mutually exclusive modes |

The preview area has three modes, never visible at the same time:

| Mode | Container | Triggered by | Content |
|------|-----------|--------------|---------|
| Text | `#preview-content` | `.model-button[data-template]` | Editable `<pre>` with a fixed template |
| Form | `#preview-form` | `.model-button[data-form]` | Interactive evolução form built by `mountEvolucao()` |
| Tool | `#preview-tool` | `.model-button[data-tool]` | DripCalc calculator built by `mountDripCalc()` |

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
        <span class="category-title">Evolução</span>
      </label>
      <div class="category-content">
        <button class="model-button" data-form="...">      <!-- abre um formulário -->
        <button class="model-button" data-template="...">  <!-- mostra um texto -->
      </div>
    </div>
  </aside>

  <main class="preview">
    <div id="preview-empty">
    <div id="preview-content">          <!-- modo texto -->
      <div id="preview-header">
        <div id="preview-title">
        <button id="btn-copy">
      </div>
      <pre id="preview-body" contenteditable="true">
    </div>
    <div id="preview-form">             <!-- modo formulário, preenchido pelo motor -->
    <div id="preview-tool">             <!-- modo ferramenta (DripCalc) -->
  </main>
</div>
```

The evolução form is built entirely by [evolucao-engine.js](../evolucao-engine.js) inside `#preview-form`:

```
<div class="ev-root">
  <div class="ev-top">            data/hora · agora · Limpar modelo · Copiar evolução
  <div class="ev-main">
    <div>                         <p class="ev-desc"> + <form class="ev-form">
      <section class="ev-card">   uma por seção do modelo
        <div class="ev-card-h">   título + botão "Tudo normal"
        <div class="ev-grid">     <div class="ev-field"> por campo
    <aside class="ev-side">       painel de saída (sticky)
      <div class="ev-outcard">
        <div class="ev-edited">   aviso de edição manual + "Regenerar"
        <textarea class="ev-out"> texto para o prontuário
```

DripCalc is built the same way by [dripcalc-engine.js](../dripcalc-engine.js) inside `#preview-tool`:

```
<div class="dc-root">
  <div class="dc-top">            título + abas de modo (role="tablist")
  <div class="dc-main">
    <form class="dc-form">        <p class="dc-copy"> (explicação do modo)
      <div class="dc-grid">       <label class="dc-field"> por campo, [hidden] fora do modo
    <aside class="dc-side">
      <div class="dc-result">     rótulo · valor · concentração (aria-live)
      <div class="dc-actions">    Limpar · Copiar resultado
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
| `.model-button` | Sidebar button for each template, procedure description, prompt, evolução form, or tool | [index.html](../index.html), selected by [app.js](../app.js) |
| `#preview-form` | Container for the evolução form; hidden while in text mode | [index.html](../index.html), filled by [evolucao-engine.js](../evolucao-engine.js) |
| `.ev-*` | Every element of the evolução form (cards, fields, chips, output panel) | created by [evolucao-engine.js](../evolucao-engine.js), styled in [evolucao.css](../evolucao.css) |
| `#preview-tool` | Container for DripCalc; hidden unless the tool is open | [index.html](../index.html), filled by [dripcalc-engine.js](../dripcalc-engine.js) |
| `.dc-*` | Every element of DripCalc (mode tabs, fields, result card) | created by [dripcalc-engine.js](../dripcalc-engine.js), styled in [dripcalc.css](../dripcalc.css) |
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
| Toast timer reference | `toastTimer` (module scope in `app.js`) | Module-level variable (`setTimeout` ID) |
| Toast DOM element | `#toast` in `document.body` | DOM reference, created on first use |
| Category visibility state | `.collapsed` class on `.sidebar-category` | DOM class derived from checkbox state; initial state is collapsed because checkboxes start unchecked |
| Filled form values | `sessionStorage` key `evolucao.v1` | `{ values: { <modelId>: { <fieldId>: string \| string[] } } }`, one bucket per model |
| DripCalc values | `sessionStorage` key `dripcalc.v1` | `{ mode, drug, weight, dose, unit, rate, amount, amountUnit, volume, infusionTime, infusionTimeUnit }` (all strings) |
| Active DripCalc context | `cur` (module scope in `dripcalc-engine.js`) | Field nodes, mode, visible catalog and last copyable text |
| Active form context | `cur` (module scope in `evolucao-engine.js`) | Nodes, CALC/Glasgow indexes, and the manual-edit flag of the mounted form |

The main content registry is `const textos`, assembled at module load time from the text data files in [data/](../data/). Evolução form values do **not** live there: they are written to `sessionStorage` on every keystroke, so they survive switching models or jumping to a static template and back, and disappear when the tab is closed. The date/time field is not persisted — it resets to "now" on each mount.

---

## Navigation Flow

There is no navigation. Every interaction is:

1. Categories start recolhidas, and the user checks or unchecks a category header to show or hide its buttons.
2. `initCategoryToggles()` updates `.collapsed` on the matching `.sidebar-category`.

**Static text:**

3. User clicks a `.model-button[data-template]` in the sidebar.
4. The click listener calls `copiar(btn.dataset.template, btn)`; that button receives `.active` and the previous active model button is cleared.
5. Any mounted form is unmounted and `#preview-form` is hidden.
6. Selected template/prompt appears in `#preview-body`; label appears in `#preview-title`.
7. User can edit the content directly in the preview area.
8. User clicks **"Copiar"**; `copiarPreview()` writes the preview text to the clipboard and a toast appears.

**Evolução form:**

3. User clicks a `.model-button[data-form]` in the sidebar.
4. The click listener calls `abrirFormulario(btn.dataset.form, btn)`; `#preview-content` is hidden and `#preview-form` shown.
5. `mountEvolucao()` renders the model's sections and restores whatever was already filled in for that model.
6. Every edit calls `set()` → `sessionStorage` → `refresh()`, which rebuilds the text in `.ev-out`. Empty fields never appear in the text.
7. Editing `.ev-out` by hand raises the "texto editado à mão" warning and freezes regeneration until **Regenerar** is clicked.
8. User clicks **"Copiar evolução"** (or `Ctrl`/`Cmd`+`Enter`); the engine writes to the clipboard and calls the same `toast()` from `app.js`.

**DripCalc (Ferramentas):**

3. User clicks `.model-button[data-tool="dripcalc"]`; `abrirFerramenta()` hides the other modes and calls `mountDripCalc()`.
4. User picks a mode tab (Dose → mL/h, mL/h → Dose, Bolus, Infusão); only the fields that mode needs are shown (Peso only for per-kg units).
5. Choosing a preset fills the dilution and the drug's usual unit; every edit recalculates and saves to `sessionStorage`.
6. **"Copiar resultado"** copies a one-line summary (drug, solution, weight, dose → result) and shows the toast. **"Limpar"** resets the fields.

---

## Styling Summary

Three stylesheets, loaded in this order: [style.css](../style.css), [evolucao.css](../evolucao.css), [dripcalc.css](../dripcalc.css).

### [style.css](../style.css) — shell and text mode

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

### [evolucao.css](../evolucao.css) (`.ev-`) and [dripcalc.css](../dripcalc.css) (`.dc-`)

Both are scoped to their engine's root element and reuse the `--color-*` tokens above — there is one dark theme for the whole app (AD-06, AD-15).

| Aspect | evolucao.css | dripcalc.css |
|--------|--------------|--------------|
| Layout | form + sticky output panel, two columns above 1100px | form + sticky result card, two columns above 860px |
| Distinctive parts | `.ev-card` sections, `.ev-chip` pills, `.ev-unitwrap` inputs with a unit suffix, `.ev-gcs` grid, `.ev-calc` dashed box | `.dc-tabs` mode tabs, `.dc-field[hidden]` for fields outside the current mode, `.dc-result` card |
| Reset | `.ev-root button/input/select/textarea` | `.dc-root button/input/select` |

**Why the reset exists:** `style.css` styles bare `button`, `input`, `select` and `textarea` globally, so without it every chip would render as a full-width green block. Its selectors carry the tag name (specificity 0,1,1), which means a plain single-class rule added later will silently lose to it — write `.ev-root textarea.ev-out`, not `.ev-out`.

---

## Browser Compatibility

| Feature | Support | Fallback |
|---------|---------|----------|
| `navigator.clipboard.writeText()` | Modern browsers | `document.execCommand('copy')` via hidden textarea |
| `async/await` | ES2017+ browsers | None |
| ES modules (`type="module"`) | Modern browsers | None |
| CSS variables | Modern browsers | None |
| `sessionStorage` | All browsers | `try/catch`: the form and the calculator still work, they just stop remembering |
| Optional chaining (`?.`) | ES2020 browsers | None |
| `Number.toLocaleString('pt-BR')` (DripCalc number formatting) | All modern browsers | None |
| Regex lookbehind + `\p{L}` (gender agreement in `applySex()`) | Chrome 62+, Firefox 78+, **Safari 16.4+** | None — this is the narrowest requirement in the app |

The page must be served over HTTP/HTTPS: `app.js` is loaded as an ES module and will not load from `file://`.
