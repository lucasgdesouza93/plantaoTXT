# BACKEND_OVERVIEW.md

## Status

**No backend exists in this project.**

PlantãoTXT is a fully client-side static web application. There is no server, no API, no serverless function, and no runtime process beyond the browser.

---

## Data Persistence

There is no persistence layer. All template, procedure, and prompt content is defined in ES module files under [data/](../data/) and merged into an in-memory `textos` object by [app.js](../app.js).

The evolução forms are the one exception: what the physician types is kept in `sessionStorage` under the `evolucao.v1` key so it survives switching between models, and is discarded when the tab closes. Nothing is ever sent anywhere — there is no server to send it to.

---

## Deployment Model

The application can be deployed to any static file host. The following files must be served together:

- [index.html](../index.html)
- [app.js](../app.js)
- [evolucao-engine.js](../evolucao-engine.js)
- [style.css](../style.css)
- [evolucao.css](../evolucao.css)
- [data/evolucao-modelos.js](../data/evolucao-modelos.js)
- [data/procedimentos.js](../data/procedimentos.js)
- [data/alta.js](../data/alta.js)
- [data/ia.js](../data/ia.js)
