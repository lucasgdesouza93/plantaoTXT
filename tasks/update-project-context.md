# Documentation Sync Task

Objective:
Keep project documentation aligned with the current codebase.

WORKFLOW:

1. analyze the current git diff
2. identify modified files
3. evaluate impact on:
   - architecture
   - frontend
   - backend
   - database
   - permissions
   - API contracts

UPDATE IF NECESSARY:

- docs/PROJECT_OVERVIEW.md
- docs/FRONTEND_OVERVIEW.md
- docs/BACKEND_OVERVIEW.md
- docs/DATABASE_OVERVIEW.md
- docs/API_CONTRACTS.md
- docs/AUTH_MATRIX.md
- docs/CODE_INDEX.md
- docs/ARCHITECTURE_DECISIONS.md
- docs/DB_CHANGE_RULES.md

RULES:

- do not invent information
- use only current code as source of truth
- list all updated documentation files

OUTPUT:

- summary of changes
- updated documentation files
