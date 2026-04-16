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

## AD-07: Inline Event Handlers

Button click events are bound via `onclick` attributes directly in HTML. This keeps wiring minimal for the small, static set of actions.

## AD-08: Toast Notification via Dynamically Created DOM Element

The toast element is created programmatically on first use and then reused.

## AD-09: No Security Model

There is no authentication, authorization, or application-level persistence because the app is static and local-only in behavior.

## AD-10: Portuguese as the Only Language

All UI text and template, procedure, and prompt content are written in Brazilian Portuguese.

## AD-11: ES Modules for Data Files, Window Handlers for HTML Compatibility

Data files use native ES modules, while `window.copiar` and `window.copiarPreview` bridge module scope to inline HTML handlers.
