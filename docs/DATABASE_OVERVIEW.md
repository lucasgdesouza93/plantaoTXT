# DATABASE_OVERVIEW.md

## Status

**No database exists in this project.**

All data is hardcoded as JavaScript string literals split across five ES module files under [data/](../data/). The entry point [app.js](../app.js) imports and merges them at load time.

---

## In-Memory Data Layer

Each data file exports a named object. `app.js` merges them into:

```js
const textos = {
  ...clinicaTemplates,
  ...traumaTemplates,
  ...procedureTemplates,
  ...altaTemplates,
  ...aiPromptTemplates,
};
```

`textos` is a plain JavaScript object acting as a key-value store:

```js
const textos = { [key: string]: string };
```

### Template Keys and Descriptions

| Key | Source File | Section | Button Label |
|-----|-------------|---------|--------------|
| `admissaoClinica` | [data/clinica.js](../data/clinica.js) | Clínica | Admissão – Sala de Emergência |
| `evolucao` | [data/clinica.js](../data/clinica.js) | Clínica | Evolução – Sala de Emergência |
| `admissaoTraumaFem` | [data/trauma.js](../data/trauma.js) | Trauma | Admissão Trauma – Feminino |
| `admissaoTraumaMasc` | [data/trauma.js](../data/trauma.js) | Trauma | Admissão Trauma – Masculino |
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

**Total keys:** 33. **Total buttons in `index.html`:** 33.
