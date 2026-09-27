# ARCHITECTURE_DECISIONS.md

Decisions listed here are inferred from the actual code.

---

## AD-01: Zero External Dependencies

The application uses no libraries, frameworks, or CDN resources.

## AD-02: No Build Step

Source files are served directly as-is with `<script type="module" src="app.js">`.

## AD-03: Single HTML Page, No Router

All UI is in one `index.html` with no client-side or server-side routing.

## AD-04: Clipboard API with `execCommand` Fallback

Clipboard access uses `navigator.clipboard.writeText()` first, with `document.execCommand('copy')` fallback for older or restricted browsers.

## AD-05: Data Hardcoded as JavaScript Strings, Split by Category

All templates, procedure descriptions, and reusable prompts are stored as string literals in ES module files under [data/](../data/). Content is grouped by category:

- [data/procedimentos.js](../data/procedimentos.js)
- [data/alta.js](../data/alta.js)
- [data/ia.js](../data/ia.js)

`app.js` imports and merges these modules into a single `textos` object.

Evolução content is the exception: it is declarative data, not a string (see AD-12).

## AD-06: Dark Mode as the Only Theme

The application ships with a single dark color scheme and no theme toggle.

## AD-07: Event Listeners via `data-template` / `data-form` / `data-tool` Attributes

Button click events are bound via `addEventListener` in `initModelButtons()`, `initFormButtons()`, `initToolButtons()` and `initCopyButton()`. Sidebar buttons carry either a `data-template` attribute (static text key), a `data-form` attribute (evolução model id), or a `data-tool` attribute (tool id, today only `dripcalc`), which eliminates inline handlers and satisfies the strict Content Security Policy.

The same rule applies inside the form engine: it builds its DOM with `createElement` + `addEventListener` (never `innerHTML` with markup, never `on*` attributes), and the `<form>` element cancels submission with a listener rather than `onsubmit="return false"`. This is why the original single-file `evolucao.html` could not be dropped in as-is — its inline `<style>`, inline `<script>` and inline `onsubmit` were all blocked by the CSP and had to be split into [evolucao.css](../evolucao.css) and [evolucao-engine.js](../evolucao-engine.js).

## AD-08: Toast Notification via Dynamically Created DOM Element

The toast element is created programmatically on first use and then reused.

## AD-09: Defense-in-Depth Security for a Static App

Although there is no authentication or persistence, the following controls are enforced:

- **Content Security Policy** — `default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; form-action 'none'` — blocks injected scripts, styles, and unauthorized navigations. Applied both as a `<meta>` tag and via `_headers` (HTTP header for Netlify/Cloudflare Pages).
- **`frame-ancestors 'none'` / `X-Frame-Options: DENY`** — prevents clickjacking by forbidding iframe embedding.
- **Clickjacking JS guard** — `app.js` hides the page and attempts a redirect if `window.top !== window.self`.
- **`Referrer-Policy: no-referrer`** — prevents URL leakage in resource requests.
- **`X-Content-Type-Options: nosniff`** — disables browser MIME sniffing.
- **`Permissions-Policy`** — explicitly denies camera, microphone, geolocation, and payment APIs.

## AD-10: Portuguese as the Only Language

All UI text and template, procedure, and prompt content are written in Brazilian Portuguese.

## AD-11: ES Modules for All Logic, No Global Leakage

Data files use native ES modules. `app.js` is loaded as `<script type="module">` and does not expose any function to `window`. Event binding is done entirely within module scope via `initModelButtons()`, `initFormButtons()`, `initToolButtons()` and `initCopyButton()`. Both engines follow the same rule: they export only their `mount` / `unmount` pair (plus `modelosEvolucao`), and keep their state in module scope.

## AD-12: Evolução as Declarative Models, Not Fixed Text

The former **Clínica** and **Trauma** sections were four fixed blocks of text the physician had to edit by hand, including deleting the findings that did not apply and correcting gender agreement. They were replaced by six declarative models in [data/evolucao-modelos.js](../data/evolucao-modelos.js), rendered by [evolucao-engine.js](../evolucao-engine.js).

Consequences:

- Content is authored as data (`TEMPLATES`), so adding a field or a whole model needs no engine change.
- Only filled fields reach the text, so nothing has to be deleted afterwards.
- `{o|a}` markers in any text agree with the Sexo field; `applySex()` also rewrites text already typed when Sexo changes.
- Fields the physician would otherwise compute by hand are `CALC` fields fed by other fields — driving pressure, relação P/F, and TFGe by CKD-EPI 2021.
- The representations coexist: `data-template` buttons show text, `data-form` buttons mount a form, `data-tool` buttons mount a tool (AD-13).

## AD-13: Three Preview Modes, One at a Time

`#preview-content` (text), `#preview-form` (evolução) and `#preview-tool` (DripCalc) are siblings inside `<main class="preview">` and are never shown together. Rather than each entry point hiding the other two, all three call one `limparPreview(btn)` that unmounts both engines and hides every mode; each then reveals only its own container. Adding a fourth mode means extending that single function, not auditing the others.

Each mode owns its own copy button: `#btn-copy` reads the `<pre>`, the form has "Copiar evolução" reading its output textarea, and DripCalc has "Copiar resultado" reading its computed summary. All of them call the single `toast()` defined in `app.js`, injected into the engines rather than duplicated inside them.

## AD-14: Form State in sessionStorage, Scoped per Model

Filled values live under the `evolucao.v1` key, bucketed by model id, so switching models or jumping to a static template and back preserves the work, and closing the tab discards it — appropriate for clinical data that should not persist on a shared shift workstation. All reads and writes go through `set()`, and every `sessionStorage` call is wrapped in `try/catch` so a blocked storage only costs persistence, not the form.

## AD-15: Form Styling Isolated by Prefix, Sharing the Theme Tokens

[evolucao.css](../evolucao.css) prefixes every class `.ev-` and reuses the `--color-*` tokens of `style.css` instead of the light palette the form was originally authored with (AD-06 keeps a single dark theme). Because `style.css` styles bare `button`, `input`, `select` and `textarea` globally, the file opens with a `.ev-root` reset; rules that must beat that reset carry the tag in the selector (`.ev-root textarea.ev-out`).

## AD-16: DripCalc Ported as a Native Tool, Not Embedded

DripCalc (a standalone offline PWA) was added under a new **Ferramentas** sidebar category. Embedding it in an `<iframe>` would require relaxing the CSP (`default-src 'none'` also blocks `frame-src`) and conflicts with `frame-ancestors 'none'` / `X-Frame-Options: DENY` (AD-09). Instead:

- Its pure modules (`calc.js`, `data.js`, `constants.js`) were copied unchanged into [dripcalc/](../dripcalc/); only `CACHE_VERSION` and `STORAGE_KEY` were dropped from `constants.js`.
- Its UI was rewritten in [dripcalc-engine.js](../dripcalc-engine.js) with the same mount/unmount pattern as the evolução engine, in a third preview container `#preview-tool` (extends AD-13).
- Styles live in [dripcalc.css](../dripcalc.css), prefixed `.dc-`, reusing the `style.css` tokens (same approach as AD-15).
- State uses `sessionStorage` (`dripcalc.v1`) instead of the original `localStorage`, consistent with AD-14; the result HTML is no longer persisted, it is recomputed on mount.
- Number fields are `type="text" inputmode="decimal"` so a comma decimal works in every browser locale (`parseLocaleNumber` already accepts it).
- A dose unit in UI with a solution in mass (or vice versa) is rejected; the original app computed a meaningless number.
- PWA pieces (service worker, manifest, icons), the share button, mobile swipe and the original tests were not ported.
