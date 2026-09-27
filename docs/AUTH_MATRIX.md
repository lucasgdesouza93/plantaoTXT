# AUTH_MATRIX.md

## Status

**No authentication or authorization system exists in this project.**

---

## User Roles

Not identified in code.

---

## Permissions

Not identified in code.

---

## Access Rules

Not identified in code.

---

## Effective Access Model

The application is fully open. Any user who can load the page in a browser has unrestricted access to all features.

| Feature | Access |
|---------|--------|
| View all templates | Open (no login required) |
| Copy any template | Open (no login required) |
| Fill in an evolução form | Open (no login required) |
| Use DripCalc | Open (no login required) |
| Modify templates or form models | Not possible via UI (content is hardcoded) |
| Add new templates | Not possible via UI |

---

## Security Considerations

- No cookies, sessions, or tokens are used
- No network requests are made at runtime; nothing is ever transmitted
- The application runs entirely in the browser with no server-side component
- No account, identity, or usage tracking exists

### Clinical data typed into the page

The evolução forms and DripCalc **do** hold what the physician types, and that text can contain patient information. It is worth being precise about where it lives:

| Aspect | Reality |
|--------|---------|
| Where | `sessionStorage`, keys `evolucao.v1` and `dripcalc.v1` — same-origin only |
| How long | Until that browser tab is closed; `sessionStorage` is per-tab and is not shared with other tabs or windows |
| Sent anywhere | No. There is no server, no analytics, no external request |
| Readable by | Any script running on the same origin — which, under the CSP (`script-src 'self'`), means only this application's own files |
| Cleared by | Closing the tab, "Limpar modelo" / "Limpar", or clearing site data |

`sessionStorage` was chosen over `localStorage` precisely so nothing survives the shift on a shared workstation (AD-14). It is still **not** an encrypted store: on a machine where another person can use the same open tab, the previous physician's text is visible. Treat closing the tab as the end-of-use step.

The clipboard is the other exit path: copied text goes to the OS clipboard and is then outside this application's control.

Authentication would only become relevant if the application were extended to support user-specific template libraries, usage tracking, or a backend persistence layer — none of which exist in the current codebase.
