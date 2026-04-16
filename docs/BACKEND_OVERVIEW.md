# BACKEND_OVERVIEW.md

## Status

**No backend exists in this project.**

PlantãoTXT is a fully client-side static web application. There is no server, no API, no serverless function, and no runtime process beyond the browser.

---

## Data Persistence

There is no persistence layer. All template, procedure, and prompt content is defined in ES module files under [data/](../data/) and merged into an in-memory `textos` object by [app.js](../app.js).

---

## Deployment Model

The application can be deployed to any static file host. The following files must be served together:

- [index.html](../index.html)
- [app.js](../app.js)
- [style.css](../style.css)
- [data/clinica.js](../data/clinica.js)
- [data/trauma.js](../data/trauma.js)
- [data/procedimentos.js](../data/procedimentos.js)
- [data/alta.js](../data/alta.js)
- [data/ia.js](../data/ia.js)
