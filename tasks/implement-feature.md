# Implement Feature Task

Objective:
Implement a new feature or refactor safely, following the project's engineering principles.

WORKFLOW:

1. read CLAUDE.md and relevant docs/ files
2. analyze the current codebase related to the feature
3. identify all affected files (before changes)
4. propose an implementation plan and confirm scope
5. implement changes incrementally
6. verify no existing behavior is broken
7. identify all affected files (after changes)
8. update relevant docs/ files if structure changed

RULES:

- do not invent abstractions not required by the feature
- do not break existing API contracts or button behavior
- list affected files before starting
- keep changes minimal and readable
- prefer additive changes over rewrites
- do not introduce build tools unless explicitly requested

OUTPUT:

- list of modified files
- summary of what changed and why
- any follow-up tasks or risks identified
