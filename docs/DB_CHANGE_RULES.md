# DB_CHANGE_RULES.md

## Scope

This project has no database. The equivalent persistence layer is the set of files under [data/](../data/), which hold all template, procedure, and prompt strings split by category. The `textos` object in [app.js](../app.js) is assembled by merging these modules at startup.

---

## Rules for Modifying Templates in `data/`

### Rule 1: Never Remove an Existing Key Without Updating `index.html`

Each key in the data files is referenced by name in an `onclick` attribute in [index.html](../index.html). Removing a key without removing the corresponding button causes `copiar()` to show `alert("Modelo não encontrado.")`.

### Rule 2: Key Names Must Match Exactly

The lookup `textos[tipo]` is an exact string match. If a key is renamed, update both the data file and the matching `onclick="copiar('...')"` call in [index.html](../index.html).

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

### Rule 6: Preserve UTF-8 Encoding

The application contains Portuguese text and must remain saved as UTF-8.
