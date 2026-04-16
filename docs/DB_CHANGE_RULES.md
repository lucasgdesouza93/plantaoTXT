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
  ...clinicaTemplates,
  ...traumaTemplates,
  ...procedureTemplates,
  ...altaTemplates,
  ...aiPromptTemplates,
  ...newCategoryTemplates,
};
```

### Rule 5: Test Selection and Clipboard Copy After Any Change

There is no automated test suite. After changes to [app.js](../app.js), [index.html](../index.html), or files in [data/](../data/):

1. Open the page in a browser.
2. Expand any affected category.
3. Click each modified or new button.
4. Copy the preview content.
5. Verify the pasted text matches the intended content.

### Rule 6: Preserve UTF-8 Encoding

The application contains Portuguese text and must remain saved as UTF-8.
