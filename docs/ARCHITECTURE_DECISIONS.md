# ARCHITECTURE_DECISIONS.md

Decisions listed here are inferred from the actual code. No information is invented.

---

## AD-01: Zero External Dependencies

**Decision:** The application uses no libraries, frameworks, or CDN resources.

**Evidence:**
- [index.html](../index.html) has no `<script>` tags other than the local `app.js`
- [index.html](../index.html) has no `<link>` tags other than the local `style.css`
- No `package.json` exists in the repository
- No `node_modules` directory

**Inferred rationale:** Eliminates dependency on network availability at load time, removes supply-chain risk from third-party packages, and guarantees the application works offline or in restricted hospital network environments where CDN access may be blocked.

---

## AD-02: No Build Step

**Decision:** Source files are served directly as-is; there is no compilation, bundling, or transpilation step.

**Evidence:**
- No `package.json`, `webpack.config.js`, `vite.config.js`, `rollup.config.js`, or equivalent
- `<script type="module" src="app.js">` loads the source file directly
- JavaScript uses template literals and `async/await` (ES2017+), authored for direct browser consumption

**Inferred rationale:** Simplifies deployment to "copy the static source files to any web server." Reduces operational overhead and toolchain fragility.

---

## AD-03: Single HTML Page, No Router

**Decision:** All UI is in one `index.html` with no client-side or server-side routing.

**Evidence:**
- Only one `.html` file exists
- No `<a href>` navigation links between pages
- No hash-based or history-based routing code in [app.js](../app.js)

**Inferred rationale:** The application has a single workflow (select, optionally edit, and copy a template) that does not require multiple views.

---

## AD-04: Clipboard API with `execCommand` Fallback

**Decision:** Clipboard access uses the modern async Clipboard API first, with a `document.execCommand('copy')` fallback for older or restricted browsers.

**Evidence:** [app.js:35-47](../app.js)

```js
try {
  await navigator.clipboard.writeText(texto);
} catch (e) {
  // fallback: hidden textarea + execCommand
}
```

**Inferred rationale:** Hospital computers may run older browsers or have security policies that restrict the Clipboard API. The fallback ensures the application works in both modern and legacy environments.

---

## AD-05: Data Hardcoded as JavaScript Strings, Split by Category

**Decision:** All 12 medical templates are stored as string literals in ES module files under [data/](../data/), not in a database, CMS, or external file. Templates are grouped by clinical category: [data/clinica.js](../data/clinica.js), [data/trauma.js](../data/trauma.js), [data/alta.js](../data/alta.js). [app.js](../app.js) imports and merges them.

**Evidence:** [data/](../data/) directory; [app.js:1-9](../app.js) imports.

**Inferred rationale:** Hardcoding eliminates the need for a backend, an API, and a data persistence layer. Splitting by category makes it straightforward to locate and edit templates in a specific clinical domain, and to add new categories without touching existing files.

---

## AD-06: Dark Mode as the Only Theme

**Decision:** The application ships with a single dark color scheme. No light mode or theme toggle exists.

**Evidence:** [style.css:24-33](../style.css) — the `body` rule applies a dark background with a lightweight radial accent. No `prefers-color-scheme` media query is present.

**Inferred rationale:** Emergency rooms are often dimly lit. A dark interface reduces eye strain during night shifts, which is a primary use case given the application name "PlantãoTXT" (plantão = shift/on-call duty).

---

## AD-11: ES Modules for Data Files, Window Handlers for HTML Compatibility

**Decision:** Data files use native ES module syntax (`export const`). `app.js` is loaded as `<script type="module">`. Because ES modules are scoped and don't pollute the global namespace, `copiar` and `copiarPreview` are explicitly assigned to `window` to remain accessible from inline `onclick` attributes in [index.html](../index.html).

**Evidence:** [app.js:80-81](../app.js) — `window.copiar = copiar` and `window.copiarPreview = copiarPreview`; [index.html:51](../index.html) — `<script type="module" src="app.js">`.

**Inferred rationale:** ES modules allow splitting the codebase without a build tool while preserving the existing HTML button structure unchanged. The `window` assignment is the minimal bridge between module scope and inline handlers.

---

## AD-07: Inline Event Handlers

**Decision:** Button click events are bound via `onclick` attributes directly in HTML rather than via `addEventListener` in JavaScript.

**Evidence:** [index.html:16-35](../index.html) — all 12 template buttons have `onclick="copiar('...')"`. [index.html:44](../index.html) — the preview copy button has `onclick="copiarPreview()"`.

**Inferred rationale:** With 12 template buttons, one copy button, and simple click behavior, inline handlers are the simplest approach and require no DOM querying or event delegation boilerplate.

---

## AD-08: Toast Notification via Dynamically Created DOM Element

**Decision:** The toast notification element is not present in the initial HTML. It is created programmatically on first use and then reused.

**Evidence:** [app.js:52-77](../app.js) — `toast()` calls `document.getElementById("toast")` and creates the element only if null.

**Inferred rationale:** Keeps the HTML minimal and avoids managing hidden-state CSS classes in markup. The toast is a transient UI concern owned entirely by the JavaScript layer.

---

## AD-09: No Security Model

**Decision:** No authentication, authorization, HTTPS enforcement, CSP headers, or input sanitization is implemented at the application level.

**Evidence:** No auth code in any file. No `<meta http-equiv="Content-Security-Policy">` in [index.html](../index.html).

**Context:** This is appropriate for the current scope. The application handles no user data, makes no network requests, and stores nothing. Security hardening (HTTPS, CSP, etc.) would be the responsibility of the web server/hosting layer, not the application code.

---

## AD-10: Portuguese as the Only Language

**Decision:** All UI text, template content, and in-code comments are written in Brazilian Portuguese.

**Evidence:** [index.html:2](../index.html) — `<html lang="pt-BR">`. All button labels in [index.html](../index.html) and template text in [data/](../data/) are in Portuguese.

**Inferred rationale:** The application is purpose-built for Brazilian healthcare professionals. Internationalization is out of scope.
