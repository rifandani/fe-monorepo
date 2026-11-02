## Language

Always talk in ASD-STE100 Simplified Technical English.

## Vendored Repositories

This project vendors external repositories under @repos/ for coding-agent reference.

- Use vendored repositories as read-only reference material when working with related libraries.
- Prefer examples and patterns from vendored source code over generated guesses or web search results.
- Do not edit files under @repos/ unless explicitly asked.
- Do not import from @repos/; application code should continue importing from normal package dependencies.

When working with a related library, inspect its vendored repository for idiomatic usage, tests, module structure, API design, examples, and docs. If the vendored repository contains agent-oriented guidance such as LLMS.md, AGENTS.md, or AGENT.md, read that guidance before making changes.

## Agent skills

### Issue tracker

GitHub Issues on `rifandani/fe-monorepo` via `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary with default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context — `GLOSSARY-MAP.md` at repo root points to per-context `GLOSSARY.md` files. See `docs/agents/domain.md`.
