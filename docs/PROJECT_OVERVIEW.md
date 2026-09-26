# PROJECT_OVERVIEW.md

## System Purpose

**PlantãoTXT** is a lightweight, browser-based utility for Brazilian emergency medicine physicians. It provides pre-formatted clinical documentation templates and reusable AI prompts that can be selected, reviewed, edited in the browser, and copied to the clipboard, reducing manual typing during emergency room shifts.

The sidebar offers two kinds of items:

- **Static text templates** — a fixed block of text shown in an editable preview pane.
- **Evolução forms** — an interactive form that assembles the text from the fields the physician fills in (empty fields are omitted), rendered by a small engine in [evolucao-engine.js](../evolucao-engine.js).

---

## High-Level Architecture

```
[Browser]
    └── index.html               (single page — no router)
         ├── style.css           (visual styling)
         ├── evolucao.css        (styling for the evolução form, all classes prefixed .ev-)
         └── app.js              (entry point: imports data, exposes copy handlers, switches between text and form mode)
              ├── data/procedimentos.js (procedure descriptions)
              ├── data/alta.js    (discharge prescription templates)
              ├── data/ia.js      (frequently used AI prompts)
              └── evolucao-engine.js    (form engine: renders fields, builds the text)
                   └── data/evolucao-modelos.js (6 form models, declarative)
```

- **Type:** Static, client-side only web application
- **Pages:** 1 (single HTML file, no routing)
- **Backend:** None
- **Database:** None
- **Build system:** None
- **Module system:** Native ES modules (`<script type="module">`)
- **Dependencies:** Zero

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (`lang="pt-BR"`) |
| Styling | CSS3 (plain, no framework) |
| Logic | Vanilla JavaScript (ES2017+, async/await) |
| Runtime | Browser (modern browsers) |
| Hosting | Any static file server |

---

## Main System Flow

```
User optionally collapses or expands a sidebar category
    → checkbox in .category-header toggles .collapsed on .sidebar-category
    → .category-content is shown or hidden
User selects a static template or prompt
    → click listener on .model-button[data-template] calls copiar(key, btn)
    → copiar() looks up key in textos
    → selected button receives .active class
    → any mounted evolução form is unmounted and #preview-form is hidden
    → preview panel shows the selected text
User clicks "Copiar"
    → click listener on #btn-copy calls copiarPreview()
    → copiarPreview() reads editable preview text
    → tries navigator.clipboard.writeText()
    → on failure: fallback via textarea + execCommand
    → calls toast("Copiado ✓")

User selects an evolução form
    → click listener on .model-button[data-form] calls abrirFormulario(id, btn)
    → #preview-content is hidden and #preview-form is shown
    → mountEvolucao(#preview-form, id, toast) builds the form for that model
    → every field edit writes to sessionStorage and regenerates the text panel
    → the form owns its own "Copiar evolução" button and reuses toast() from app.js
```

---

## Template Categories

The application contains **36 items** grouped into 4 sections: 6 interactive forms and 30 static texts.

| Section | Kind | Items |
|---------|------|-------|
| Evolução | form (`data-form`) | Admissão PS, Sala de Emergência (XABCDE), Evolução diária (SOAP), Evolução por sistemas (crítico), Atendimento PS / alta, Intercorrência |
| Procedimentos | text (`data-template`) | 20 descrições de procedimentos clínicos e de emergência |
| Orientações / Prescrições (Alta) | text (`data-template`) | Dengue, Dor Traumática, Herpes Zóster, IVAS, Nefrolitíase, PNM sem comorbidade, PNM com comorbidade, PNM – alergia a β-lactâmicos/macrolídeos |
| Prompts de IA | text (`data-template`) | Pedido de interconsulta, Resultados laboratoriais em linha |

The **Evolução** section replaced the former **Clínica** (2 static texts) and **Trauma** (2 static texts) sections; `data/clinica.js` and `data/trauma.js` were removed. The XABCDE and Admissão PS forms cover the same documentation, now generated from filled fields instead of a fixed block of text.

---

## Key Files

| File | Path | Role |
|------|------|------|
| HTML shell | [index.html](../index.html) | DOM structure, checkbox-controlled sidebar groups, preview panel, `#preview-form` container |
| Entry point | [app.js](../app.js) | Imports data modules, merges `textos`, defines `copiar()`, `abrirFormulario()`, `copiarPreview()`, `toast()`, and initializes category toggles |
| Form engine | [evolucao-engine.js](../evolucao-engine.js) | Renders the form for a model, generates the prontuário text, exports `mountEvolucao()` / `unmountEvolucao()` / `modelosEvolucao` |
| Form models | [data/evolucao-modelos.js](../data/evolucao-modelos.js) | `TEMPLATES` (6 models), `N` (normal exam texts), `num()` / `fmtN()` |
| Procedure templates | [data/procedimentos.js](../data/procedimentos.js) | 20 procedure description templates |
| Discharge templates | [data/alta.js](../data/alta.js) | 8 discharge prescription templates |
| AI prompt templates | [data/ia.js](../data/ia.js) | `promptInterconsulta`, `promptResultadosLaboratoriaisLinha` |
| Styling | [style.css](../style.css) | Dark responsive theme, category toggles, cards, buttons, and preview panel |
| Form styling | [evolucao.css](../evolucao.css) | Form layout, chips, and output panel — every class prefixed `.ev-`, reusing the `style.css` color tokens |
