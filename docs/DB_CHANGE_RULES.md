# DB_CHANGE_RULES.md

## Scope

This project has no database. The equivalent persistence layer is the set of template files under [data/](../data/), which hold all 12 medical template strings split by category. The `textos` object in [app.js](../app.js) is assembled by merging these modules at startup. The rules below govern how to safely modify that data layer without breaking the application.

---

## Rules for Modifying Templates in `data/`

### Rule 1: Never Remove an Existing Key Without Updating `index.html`

Each key in the data files is referenced by name in an `onclick` attribute in [index.html](../index.html). Removing a key without removing the corresponding button causes the `copiar()` function to call `alert("Modelo não encontrado.")` — a visible error for the user.

**Check before deleting any key:**
```
grep '<key-name>' index.html
```

**Affected files:** the relevant file in [data/](../data/), [index.html](../index.html)

---

### Rule 2: Key Names Must Match Exactly (Case-Sensitive)

The lookup `textos[tipo]` at [app.js:12](../app.js) is an exact string match. The value of `tipo` comes from the `onclick` attribute in [index.html](../index.html). If a key is renamed in a data module but not updated in the corresponding `onclick` call (or vice versa), the button fails with an alert.

**When renaming a key:**
1. Update the key name in the relevant file under [data/](../data/)
2. Update the matching `onclick="copiar('oldName')"` to `onclick="copiar('newName')"` in [index.html](../index.html)

---

### Rule 3: Preserve Template Text Structure

Templates follow an established format (uppercase section labels, blank-line separators, fill-in placeholder fields). Deviating from this format changes what physicians see when they paste into medical records. Medical correctness of the pasted output matters.

**Do not:**
- Remove standard fields like `PA:`, `FC:`, `FR:`, `TEMP:`, `SAT:` from admission templates
- Alter antibiotic names, dosages, or frequencies without clinical review
- Remove `ATENÇÃO!` warning sections from discharge prescription templates

---

### Rule 4: Add New Templates by Adding a New Key to the Right Data File

When adding a new template, add a new key to the appropriate file in [data/](../data/) and a corresponding `<button onclick="copiar('newKey')">` in [index.html](../index.html). Do not repurpose existing keys.

**Adding to an existing category** — edit the matching data file:
```js
// data/clinica.js, data/trauma.js, or data/alta.js
export const xyzTemplates = {
  // ... existing keys ...
  newTemplateName: `TEMPLATE TEXT HERE`,
};
```

**Adding a new category** — create a new data file and wire it into `app.js`:
```js
// data/newcategory.js
export const newCategoryTemplates = {
  newTemplateName: `TEMPLATE TEXT HERE`,
};
```
```js
// app.js — add import and spread
import { newCategoryTemplates } from './data/newcategory.js';
const textos = { ...clinicaTemplates, ...traumaTemplates, ...altaTemplates, ...newCategoryTemplates };
```

In [index.html](../index.html), add the button inside the appropriate `.section` div (or a new `.section`):
```html
<button onclick="copiar('newTemplateName')">Button Label</button>
```

---

### Rule 5: Test Clipboard Copy After Any Change

There is no automated test suite. After any change to [app.js](../app.js) or [index.html](../index.html):

1. Open `index.html` in a browser
2. Click each modified or new button
3. Paste the clipboard content into a text editor
4. Verify the pasted text matches the intended template exactly

Pay attention to:
- Line breaks (template literals preserve them)
- Trailing whitespace (some lines in the original templates have trailing spaces — these are intentional for alignment)
- Special characters (accented characters: `ã`, `ó`, `é`, `ê`, `ô`, `ú`, `ç`, `â`)

---

### Rule 6: Do Not Use Direct Edits to Deployed Files as a Substitute for Source Changes

The source files (`index.html`, `app.js`, `style.css`, and `data/*.js`) are the authoritative source of truth. There is no build process, so editing a deployed copy is the same as editing the source — but this creates drift if the repository copy is not updated. Always edit the repository files and redeploy.

---

### Rule 7: Preserve Encoding (UTF-8)

The HTML file declares `<meta charset="UTF-8">` ([index.html:4](../index.html)). Template strings in [data/](../data/) contain Portuguese characters that require UTF-8. Save all files as UTF-8 without BOM.

---

## Summary Table

| Action | Safe? | Prerequisite |
|--------|-------|-------------|
| Add a new template key | Yes | Add it to the relevant data module and add a button in `index.html` |
| Remove a template key | Only if | Corresponding button removed from `index.html` |
| Rename a template key | Only if | `onclick` attribute updated in `index.html` |
| Edit template text content | Yes | Clinical review recommended; test copy-paste |
| Change button label text | Yes | No impact on template key lookup |
| Reorder buttons in HTML | Yes | No impact on data |
| Reorder keys in data modules | Yes | Object key order is irrelevant to lookup |
