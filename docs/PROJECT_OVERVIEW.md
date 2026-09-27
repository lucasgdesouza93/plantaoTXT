# PROJECT_OVERVIEW.md

## System Purpose

**PlantãoTXT** is a lightweight, browser-based utility for Brazilian emergency medicine physicians. It provides pre-formatted clinical documentation templates and reusable AI prompts that can be selected, reviewed, edited in the browser, and copied to the clipboard, reducing manual typing during emergency room shifts.

The sidebar offers three kinds of items:

- **Static text templates** — a fixed block of text shown in an editable preview pane.
- **Evolução forms** — an interactive form that assembles the text from the fields the physician fills in (empty fields are omitted), rendered by a small engine in [evolucao-engine.js](../evolucao-engine.js).
- **Ferramentas** — standalone calculators that do not produce chart text. Today only **DripCalc** (infusion, bolus and fluid-rate calculator), ported from the standalone DripCalc app and rendered by [dripcalc-engine.js](../dripcalc-engine.js).

---

## High-Level Architecture

```
[Browser]
    └── index.html               (single page — no router)
         ├── style.css           (visual styling)
         ├── evolucao.css        (styling for the evolução form, all classes prefixed .ev-)
         ├── dripcalc.css        (styling for DripCalc, all classes prefixed .dc-)
         └── app.js              (entry point: imports data, exposes copy handlers, switches the three preview modes)
              ├── data/procedimentos.js (procedure descriptions)
              ├── data/alta.js    (discharge prescription templates)
              ├── data/ia.js      (frequently used AI prompts)
              ├── evolucao-engine.js    (form engine: renders fields, builds the text)
              │    └── data/evolucao-modelos.js (6 form models, declarative)
              └── dripcalc-engine.js    (DripCalc calculator UI, all classes prefixed .dc-)
                   └── dripcalc/        (calc.js, data.js, constants.js — pure math and presets)
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

User selects DripCalc (Ferramentas)
    → click listener on .model-button[data-tool] calls abrirFerramenta('dripcalc', btn)
    → #preview-content and #preview-form are hidden, #preview-tool is shown
    → mountDripCalc(#preview-tool, toast) builds the calculator (4 modes)
    → every field edit recalculates live and writes to sessionStorage (key dripcalc.v1)
    → "Copiar resultado" copies a one-line summary of the calculation
```

---

## Template Categories

The application contains **36 items** grouped into 6 sections: 6 interactive forms, 29 static texts and 1 tool.

| Section | Kind | Items |
|---------|------|-------|
| Evoluções | form (`data-form`) | Evolução diária (SOAP), Evolução por sistemas (crítico), Intercorrência |
| Admissões | form (`data-form`) | Paciente Clínico, Politrauma (XABCDE), Atendimento PS / alta |
| Procedimentos | text (`data-template`) | 20 descrições de procedimentos clínicos e de emergência |
| Orientações / Prescrições (Alta) | text (`data-template`) | Dengue, Dor Traumática, Herpes Zóster, IVAS, Nefrolitíase, PNM sem comorbidade, PNM com comorbidade, PNM – alergia a β-lactâmicos/macrolídeos |
| Prompts de IA | text (`data-template`) | Resultados laboratoriais em linha |
| Ferramentas | tool (`data-tool`) | DripCalc — infusão, bolus e fluidos |

The six forms were first grouped in a single **Evolução** section, which replaced the former **Clínica** (2 static texts) and **Trauma** (2 static texts) sections; `data/clinica.js` and `data/trauma.js` were removed. The Politrauma (XABCDE) and Paciente Clínico forms cover the same documentation, now generated from filled fields instead of a fixed block of text. That section was later split into **Evoluções** and **Admissões** in [index.html](../index.html) only — every form is still an evolução model in `data/evolucao-modelos.js`, rendered by the same engine.

---

## Key Files

| File | Path | Role |
|------|------|------|
| HTML shell | [index.html](../index.html) | DOM structure, checkbox-controlled sidebar groups, preview panel, `#preview-form` and `#preview-tool` containers |
| Entry point | [app.js](../app.js) | Imports data modules, merges `textos`, defines `limparPreview()`, `copiar()`, `abrirFormulario()`, `abrirFerramenta()`, `copiarPreview()`, `toast()`, and initializes category toggles |
| Form engine | [evolucao-engine.js](../evolucao-engine.js) | Renders the form for a model, generates the prontuário text, exports `mountEvolucao()` / `unmountEvolucao()` / `modelosEvolucao` |
| Form models | [data/evolucao-modelos.js](../data/evolucao-modelos.js) | `TEMPLATES` (6 models), `N` (normal exam texts), `num()` / `fmtN()`, and the CKD-EPI 2021 helper behind the TFGe field |
| Procedure templates | [data/procedimentos.js](../data/procedimentos.js) | 20 procedure description templates |
| Discharge templates | [data/alta.js](../data/alta.js) | 8 discharge prescription templates |
| AI prompt templates | [data/ia.js](../data/ia.js) | `promptResultadosLaboratoriaisLinha` |
| Styling | [style.css](../style.css) | Dark responsive theme, category toggles, cards, buttons, and preview panel |
| DripCalc UI | [dripcalc-engine.js](../dripcalc-engine.js) | Builds the calculator in `#preview-tool`, exports `mountDripCalc()` / `unmountDripCalc()` |
| DripCalc logic | [dripcalc/](../dripcalc/) | `calc.js` (pure formulas), `data.js` (presets and presentations), `constants.js` (unit ids, defaults) — copied unchanged from DripCalc |
| DripCalc styling | [dripcalc.css](../dripcalc.css) | Calculator layout, mode tabs and result card — every class prefixed `.dc-` |
| Form styling | [evolucao.css](../evolucao.css) | Form layout, chips, and output panel — every class prefixed `.ev-`, reusing the `style.css` color tokens |
