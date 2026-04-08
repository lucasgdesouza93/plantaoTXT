# BACKEND_OVERVIEW.md

## Status

**No backend exists in this project.**

PlantãoTXT is a fully client-side static web application. There is no server, no API, no edge functions, no serverless functions, no middleware, and no runtime process beyond the browser.

---

## Services

Not identified in code.

---

## Endpoints

Not identified in code.

---

## Edge Functions

Not identified in code.

---

## Backend Logic

Not identified in code.

---

## Data Persistence

There is no data persistence layer. All template data is defined in ES module files under [data/](../data/) and is merged into an in-memory `textos` object by [app.js](../app.js) during the page session.

---

## Deployment Model

The application can be deployed to any static file host (e.g., Nginx, Apache, GitHub Pages, Netlify, Vercel, or a simple file server). No server-side runtime is required.

The HTML, CSS, JavaScript entry point, and data modules must be served from the same origin:
- [index.html](../index.html)
- [app.js](../app.js)
- [style.css](../style.css)
- [data/clinica.js](../data/clinica.js)
- [data/trauma.js](../data/trauma.js)
- [data/alta.js](../data/alta.js)
