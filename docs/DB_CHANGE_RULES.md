# DB_CHANGE_RULES.md

## Scope

This project has no database. The equivalent content layer is:

| Location | Holds | Consumed by |
|----------|-------|-------------|
| [data/](../data/) `alta.js`, `ia.js`, `procedimentos.js` | static template strings | merged into `textos` in [app.js](../app.js) |
| [data/evolucao-modelos.js](../data/evolucao-modelos.js) | the 6 declarative form models | [evolucao-engine.js](../evolucao-engine.js) |
| [dripcalc/data.js](../dripcalc/data.js) | pump presets, drug presentations, unit options | [dripcalc-engine.js](../dripcalc-engine.js) |

---

## Rules for Modifying Templates in `data/`

### Rule 1: Never Remove an Existing Key Without Updating `index.html`

Each key is referenced by a `data-template` attribute on a `.model-button` in [index.html](../index.html). Removing a key without removing its button leaves a button that silently does nothing: `copiar()` returns early when `textos[tipo]` is undefined — there is no error message to alert the user, so a stale button is easy to miss.

### Rule 2: Key Names Must Match Exactly

The lookup `textos[tipo]` is an exact string match. If a key is renamed, update both the data file and the matching `data-template="..."` attribute in [index.html](../index.html). The same applies to `data-form` (model ids in `TEMPLATES`) and `data-tool` (accepted by `abrirFerramenta()`).

### Rule 3: Preserve Content Structure

Medical templates follow an established format with section labels, spacing, and placeholders. Procedure descriptions and prompt text should remain directly reusable for clipboard workflows.

### Rule 4: Add New Content in the Appropriate Data File

When adding a new item, either:

- add a new key to an existing data file in [data/](../data/), or
- create a new category file and import/spread it in [app.js](../app.js).

Example:

```js
import { newCategoryTemplates } from './data/newcategory.js';

const textos = {
  ...altaTemplates,
  ...aiPromptTemplates,
  ...procedureTemplates,
  ...newCategoryTemplates,
};
```

To add or change an **evolução form** instead, edit `TEMPLATES` in [data/evolucao-modelos.js](../data/evolucao-modelos.js) — the engine needs no change. A new model also needs a `.model-button[data-form="<id>"]` in [index.html](../index.html). Beware that field ids are derived from section index and label, so renaming a label or reordering sections discards what a user had already filled in for that model in an open tab.

A `CALC` field reads other fields **by id**, so any field it depends on must declare an explicit `id` — auto-generated ids shift when sections move. `TFGe (CKD-EPI 2021)` in the `sistemas` model is the example: it reads `cr`, `idade` and `sexo`, all declared by hand.

### Rule 4b: DripCalc Catalogs

Presets and presentations live in [dripcalc/data.js](../dripcalc/data.js) and are plain objects `{ name, amount, unit, vol }` — `unit` must be one of `mg`, `mcg`, `units`, `g`; `vol` is in mL.

- `infusionPresets` are already-diluted bags; `presentations` are ampoules/vials as supplied.
- `detectDrug(name)` maps a catalog entry's `name` to a drug key by substring match, and `infusionUnits[key]` then preselects that drug's usual unit. A new drug needs an entry in **both** to preselect the unit — otherwise the dilution still fills in and the user picks the unit.
- [dripcalc/calc.js](../dripcalc/calc.js) and [dripcalc/constants.js](../dripcalc/constants.js) were copied unchanged from the standalone DripCalc app. Prefer keeping them that way so fixes can be carried across; UI-only concerns belong in [dripcalc-engine.js](../dripcalc-engine.js).
- **Doses are clinical content.** Changing a preset changes what the calculator recommends: check the result against a known case before and after.

### Rule 5: Test Selection and Clipboard Copy After Any Change

There is no automated test suite. After changes to [app.js](../app.js), [index.html](../index.html), or files in [data/](../data/):

1. Open the page in a browser.
2. Expand any affected category.
3. Click each modified or new button.
4. Copy the preview content.
5. Verify the pasted text matches the intended content.

For changes to an evolução form, also check:

6. The form mounts and the text panel shows the title and date/time.
7. Empty fields stay out of the generated text; filled ones appear with the expected label.
8. Switching to a static template and back preserves what was filled in.
9. Switching Sexo converts the `{o|a}` agreement in text already written.
10. Any `CALC` that reads the fields you touched still computes (check the dashed box in the form, not only the text).

For changes to DripCalc, also check:

11. Each of the four mode tabs shows only its own fields, and Peso appears only for per-kg units.
12. Picking a preset fills dose, unit and volume, and the result updates.
13. A known case still gives the known answer — e.g. noradrenalina 16 mg/250 mL, 70 kg, 0,1 mcg/kg/min → **6,56 mL/h**.
14. Mixing a UI dose with a mass solution (or vice versa) still shows the "não combinam" message instead of a number.

### Rule 6: Preserve UTF-8 Encoding

The application contains Portuguese text and must remain saved as UTF-8.
