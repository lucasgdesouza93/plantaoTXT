# DATABASE_OVERVIEW.md

## Status

**No database exists in this project.**

All data is hardcoded as JavaScript string literals split across three ES module files under [data/](../data/). The entry point [app.js](../app.js) imports and merges them at load time.

---

## Tables

Not identified in code.

---

## Relationships

Not identified in code.

---

## Indexes

Not identified in code.

---

## RLS Policies

Not identified in code.

---

## In-Memory Data Layer

Template data is split into three ES module files. Each exports a named object. [app.js:5-9](../app.js) merges them:

```js
const textos = { ...clinicaTemplates, ...traumaTemplates, ...altaTemplates };
```

`textos` is a plain JavaScript object acting as a key-value store mapping template keys to multi-line string values:

```
const textos = { [key: string]: string }
```

### Template Keys and Descriptions

| Key | Source File | Section | Button Label |
|-----|-------------|---------|--------------|
| `admissaoClinica` | [data/clinica.js](../data/clinica.js) | Clínica | Admissão – Sala de Emergência |
| `evolucao` | [data/clinica.js](../data/clinica.js) | Clínica | Evolução – Sala de Emergência |
| `admissaoTraumaFem` | [data/trauma.js](../data/trauma.js) | Trauma | Admissão Trauma – Feminino |
| `admissaoTraumaMasc` | [data/trauma.js](../data/trauma.js) | Trauma | Admissão Trauma – Masculino |
| `altaDengue` | [data/alta.js](../data/alta.js) | Alta | Dengue A ou B |
| `altaDorTraumatica` | [data/alta.js](../data/alta.js) | Alta | Dor Traumática |
| `altaHerpesZoster` | [data/alta.js](../data/alta.js) | Alta | Herpes Zóster |
| `altaIVAS` | [data/alta.js](../data/alta.js) | Alta | IVAS |
| `altaNefrolitiase` | [data/alta.js](../data/alta.js) | Alta | Nefrolitíase |
| `altaPNMComorb` | [data/alta.js](../data/alta.js) | Alta | PNM Comunidade – leve (com comorbidades) |
| `altaPNMSemComorb` | [data/alta.js](../data/alta.js) | Alta | PNM Comunidade – leve (sem comorbidade) |
| `altaPNMAlergia` | [data/alta.js](../data/alta.js) | Alta | PNM – se alergia a β-lactâmicos / macrolídeos |

**Total keys:** 12. **Total buttons in index.html:** 12.

### Template Content Format

Each value is a plain text multi-line string (template literal). Templates are structured as:
- Uppercase section headers
- Blank lines between sections
- Fill-in placeholders (e.g., `PA  : MMHG`, `DATA DA ADMISSÃO:`)
- Medical protocol steps using `>` for sub-items
- Warning signs (`ATENÇÃO! RETORNAR AO PRONTO-ATENDIMENTO CASO:`) for discharge templates

There is no schema enforcement — values are free-form strings intended for direct clipboard use.
