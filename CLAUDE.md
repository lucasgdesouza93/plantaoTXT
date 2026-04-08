# Instructions for AI Agents

Before implementing any change in this project:

1. Read docs/PROJECT_OVERVIEW.md
2. Read docs/CODE_INDEX.md
3. Read the relevant domain documentation
4. Locate the exact files involved before modifying anything

MANDATORY RULES:

- Do not invent tables, endpoints, or fields
- Do not modify the database schema without a migration
- Do not break existing API contracts
- Always list affected files before and after changes
- Always evaluate impact on:
  - frontend
  - backend
  - database
- Base decisions only on existing code and documentation

WORKFLOW:

1. analyze the current system
2. identify affected files
3. propose an implementation plan
4. implement changes incrementally and safely
5. review impacts
6. update affected documentation

ENGINEERING PRINCIPLES:

- Prefer incremental refactors over large rewrites
- Preserve compatibility with production data
- Avoid unnecessary abstractions
- Keep code readable for non-expert developers
- When in doubt, choose the safest option

DATABASE SAFETY:

- Inspect migrations, seeds, views, and queries before changes
- Never assume schema structure without verification
- Validate RLS implications when modifying queries
- Prefer additive changes over destructive ones

LANGUAGE CONVENTION:

- Internal code should use English naming
- User-facing UI should remain in Portuguese (pt-BR)
