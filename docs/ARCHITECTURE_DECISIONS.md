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

- [data/clinica.js](../data/clinica.js)
- [data/trauma.js](../data/trauma.js)
- [data/procedimentos.js](../data/procedimentos.js)
- [data/alta.js](../data/alta.js)
- [data/ia.js](../data/ia.js)

`app.js` imports and merges these modules into a single `textos` object.

## AD-06: Dark Mode as the Only Theme

The application ships with a single dark color scheme and no theme toggle.

## AD-07: Event Listeners via `data-template` Attributes

Button click events are bound via `addEventListener` in `initModelButtons()` and `initCopyButton()`. Buttons carry a `data-template` attribute identifying the template key, which eliminates inline handlers and satisfies the strict Content Security Policy.

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

Data files use native ES modules. `app.js` is loaded as `<script type="module">` and does not expose any function to `window`. Event binding is done entirely within module scope via `initModelButtons()` and `initCopyButton()`.
