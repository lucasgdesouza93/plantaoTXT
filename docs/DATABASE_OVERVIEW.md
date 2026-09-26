# DATABASE_OVERVIEW.md

## Status

**No database exists in this project.**

All data is hardcoded as JavaScript string literals split across five ES module files under [data/](../data/). The entry point [app.js](../app.js) imports and merges them at load time.

---

## In-Memory Data Layer

Each data file exports a named object. `app.js` merges them into:

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
| `promptInterconsulta` | [data/ia.js](../data/ia.js) | Prompts de IA | Pedido de interconsulta |
| `promptResultadosLaboratoriaisLinha` | [data/ia.js](../data/ia.js) | Prompts de IA | Resultados laboratoriais em linha |

**Total text keys:** 30. **Total `data-template` buttons in `index.html`:** 30.

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

**Total `data-form` buttons in `index.html`:** 6. **Total sidebar buttons:** 36.

### Runtime Storage

| Store | Key | Shape | Lifetime |
|-------|-----|-------|----------|
| `sessionStorage` | `evolucao.v1` | `{ values: { <modelId>: { <fieldId>: string \| string[] } } }` | Until the tab is closed |

This is the only place the application writes anything. Field ids are generated from the model (`s<sectionIndex>_<slug do rótulo>`) unless declared explicitly, so **renaming a field label or reordering sections invalidates whatever a user had filled in** for that model in an open tab.
