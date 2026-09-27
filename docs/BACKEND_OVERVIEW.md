# BACKEND_OVERVIEW.md

## Status

**No backend exists in this project.**

PlantãoTXT is a fully client-side static web application. There is no server, no API, no serverless function, and no runtime process beyond the browser.

---

## Data Persistence

There is no persistence layer. All template, procedure, and prompt content is defined in ES module files under [data/](../data/) and merged into an in-memory `textos` object by [app.js](../app.js).

What the user types is the exception. Two `sessionStorage` keys hold it:

| Key | Written by | Contents |
|-----|-----------|----------|
| `evolucao.v1` | [evolucao-engine.js](../evolucao-engine.js) | Filled form values, bucketed per model |
| `dripcalc.v1` | [dripcalc-engine.js](../dripcalc-engine.js) | Current mode and field values |

Both survive switching between models, tools and static templates, and are discarded when the tab closes. Every read and write is wrapped in `try/catch`, so storage being blocked costs persistence and nothing else. Nothing is ever sent anywhere — there is no server to send it to. See [AUTH_MATRIX.md](AUTH_MATRIX.md) for what that means for clinical data.

---

## Deployment Model

The application can be deployed to any static file host. The following files must be served together:

- [index.html](../index.html)
- [app.js](../app.js)
- [evolucao-engine.js](../evolucao-engine.js)
- [dripcalc-engine.js](../dripcalc-engine.js)
- [style.css](../style.css)
- [evolucao.css](../evolucao.css)
- [dripcalc.css](../dripcalc.css)
- [data/evolucao-modelos.js](../data/evolucao-modelos.js)
- [data/procedimentos.js](../data/procedimentos.js)
- [data/alta.js](../data/alta.js)
- [data/ia.js](../data/ia.js)
- [dripcalc/calc.js](../dripcalc/calc.js)
- [dripcalc/data.js](../dripcalc/data.js)
- [dripcalc/constants.js](../dripcalc/constants.js)
- [_headers](../_headers) — if the host reads it (Netlify / Cloudflare Pages)

Directory structure matters: `data/` and `dripcalc/` are imported by relative path, so they must keep their names and stay next to the entry point. The site must be served over HTTP/HTTPS — ES modules do not load from `file://`.
