# DATABASE_OVERVIEW.md

## Status

**No database exists in this project.**

All content is hardcoded in ES modules and loaded at startup. There are three kinds:

| Kind | Where | Shape |
|------|-------|-------|
| Static texts | [data/alta.js](../data/alta.js), [data/ia.js](../data/ia.js), [data/procedimentos.js](../data/procedimentos.js) | string literals, merged into `textos` |
| Form models | [data/evolucao-modelos.js](../data/evolucao-modelos.js) | declarative objects |
| Calculator catalogs | [dripcalc/data.js](../dripcalc/data.js) | preset / presentation objects |

---

## In-Memory Data Layer

Each text data file exports a named object. `app.js` merges the three of them into:

```js
const textos = {
  ...altaTemplates,
  ...aiPromptTemplates,
  ...procedureTemplates,
};
```

`textos` is a plain JavaScript object acting as a key-value store:

```js
const textos = { [key: string]: string };
```

### Template Keys and Descriptions

| Key | Source File | Section | Button Label |
|-----|-------------|---------|--------------|
| `orotrachealIntubation` ... `proceduralSedation` | [data/procedimentos.js](../data/procedimentos.js) | Procedimentos | 20 descrições de procedimentos |
| `altaDengue` | [data/alta.js](../data/alta.js) | Alta | Dengue A ou B |
| `altaDorTraumatica` | [data/alta.js](../data/alta.js) | Alta | Dor Traumática |
| `altaHerpesZoster` | [data/alta.js](../data/alta.js) | Alta | Herpes Zóster |
| `altaIVAS` | [data/alta.js](../data/alta.js) | Alta | IVAS |
| `altaNefrolitiase` | [data/alta.js](../data/alta.js) | Alta | Nefrolitíase |
| `altaPNMComorb` | [data/alta.js](../data/alta.js) | Alta | PNM Comunidade – leve (com comorbidades) |
| `altaPNMSemComorb` | [data/alta.js](../data/alta.js) | Alta | PNM Comunidade – leve (sem comorbidade) |
| `altaPNMAlergia` | [data/alta.js](../data/alta.js) | Alta | PNM – se alergia a β-lactâmicos / macrolídeos |
| `promptResultadosLaboratoriaisLinha` | [data/ia.js](../data/ia.js) | Prompts de IA | Resultados laboratoriais em linha |

**Total text keys:** 29. **Total `data-template` buttons in `index.html`:** 29.

### Evolução Form Models

The six evolução models are **not** part of `textos`: they are structured objects in [data/evolucao-modelos.js](../data/evolucao-modelos.js) consumed by [evolucao-engine.js](../evolucao-engine.js), and the sidebar points at them with `data-form` instead of `data-template`.

| Model id | Button Label |
|----------|--------------|
| `admissao` | Admissão PS |
| `abcde` | Sala de Emergência (XABCDE) |
| `soap` | Evolução diária (SOAP) |
| `sistemas` | Evolução por sistemas (crítico) |
| `breve` | Atendimento PS / alta |
| `intercorrencia` | Intercorrência |

**Total `data-form` buttons in `index.html`:** 6. **Total `data-tool` buttons:** 1 (`dripcalc`). **Total sidebar buttons:** 36.

### DripCalc Catalogs

[dripcalc/data.js](../dripcalc/data.js) holds the drug data, in the same `{ name, amount, unit, vol }` shape for both lists. `buildCatalogForMode()` concatenates them for the pump modes and returns an empty list for Bolus and Infusão, which do not offer presets.

| Export | Entries | Purpose |
|--------|---------|---------|
| `infusionPresets` | 7 | Ready-diluted bags (noradrenalina x4 / x8, vasopressina, nitroglicerina, nitroprussiato, midazolam, fentanil) |
| `presentations` | 26 | Ampoules and vials as supplied |
| `infusionUnits` | 11 | Drug key → its usual infusion unit, preselected after `detectDrug()` matches |
| `infusionUnitOptions` | 9 | Unit dropdown for the pump modes |
| `ivPushUnitOptions` | 4 | Unit dropdown for Bolus (`mg`, `mcg`, `UI`, `g`) |

`unit` uses the base ids from [dripcalc/constants.js](../dripcalc/constants.js) (`mg`, `mcg`, `units`, `g`); `vol` is in mL. Internally every mass is normalized to mcg by `toBaseUnit()` before any division.

### Runtime Storage

| Store | Key | Shape | Lifetime |
|-------|-----|-------|----------|
| `sessionStorage` | `evolucao.v1` | `{ values: { <modelId>: { <fieldId>: string \| string[] } } }` | Until the tab is closed |
| `sessionStorage` | `dripcalc.v1` | `{ mode, drug, weight, dose, unit, rate, amount, amountUnit, volume, infusionTime, infusionTimeUnit }` (strings) | Until the tab is closed |

These are the only places the application writes anything. Field ids are generated from the model (`s<sectionIndex>_<slug do rótulo>`) unless declared explicitly, so **renaming a field label or reordering sections invalidates whatever a user had filled in** for that model in an open tab.
