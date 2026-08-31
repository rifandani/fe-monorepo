# Lessons

A **lesson** is a settled thread that changes how the next PR gets written. Everything else is an implementation detail.

## Which settlements qualify

- **apply** / **partial** — you agreed and changed the code.
- **reject** whose rationale was intent that no doc records. The bot re-raises undocumented intent every PR; writing it down is what stops the loop. A reject citing an existing ADR, doc, comment, or lint rule teaches nothing — drop it.

**defer** and **ask** produce no lesson.

## The prevention test

Had this rule been in `CLAUDE.md` before the PR, would the code have been written differently?

- **Yes** — lesson. It steers writing, which is the only thing the ledger is for.
- **No** — implementation detail. Drop it.

```
partial !42: replaced useMemo with render-time derivation
  "Derive at render" would have prevented it    -> lesson

apply !42: fixed an off-by-one in page-size math
  No rule phrasing prevents an off-by-one       -> detail

reject !42: barrel export is intentional, nothing documents it
  "Barrels mark the public API" would have
  stopped the bot raising it                    -> lesson
```

## Where it lands

Route on scope, then on depth.

**Scope** — does the rule bind code outside `apps/spa`?

| Reach | Target |
|-------|--------|
| Cross-cutting (monorepo, tooling, React, any package) | root `CLAUDE.md` |
| `spa` only | `apps/spa/CLAUDE.md` |
| `design-system` only | `packages/design-system/CONTEXT.md` |

**Depth** — the routed `CLAUDE.md` is an index. Read its links and follow the pointer when one owns the topic:

| Lesson | Target |
|--------|--------|
| Tailwind, tokens, dark mode | `apps/spa/docs/styling.md` |
| Layering, module boundaries, data flow | `apps/spa/docs/architecture.md` |
| Logging, tracing, error reporting | `apps/spa/docs/observability.md` |
| Domain terms, context relationships | the context's `CONTEXT.md` |
| No linked doc owns it | inline in the routed `CLAUDE.md` |

Write inline under an existing `###` heading when one fits; otherwise add a new one.

## Collision

Read the target file before proposing anything.

| Existing rule | Do |
|---------------|-----|
| Says the same thing | Drop the candidate |
| Same topic, candidate is sharper or broader | Edit the existing line in place — one rule stays authoritative |
| Says the opposite | Escalate. Present both and let the user pick which survives — never write silently |

## Shape

One imperative bullet in the file's own voice, phrased positively. No PR reference, no rationale clause — indistinguishable from the rules already there.

```markdown
### Feature boundaries
- A feature's `index.ts` is its public API; import across features only through it.
```
