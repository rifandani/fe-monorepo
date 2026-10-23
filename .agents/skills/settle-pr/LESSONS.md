# Lessons

A **lesson** is a settled thread that changes how the next PR gets written. Everything else is an implementation detail.

## Which settlements qualify

- **apply** / **partial** — you agreed and changed the code.
- **reject** whose rationale was intent that no doc records. The bot re-raises undocumented intent every PR; recording it is what stops the loop. A reject citing an existing ADR, doc, comment, or enforced rule teaches nothing — drop it.

**defer** and **ask** produce no lesson.

## The prevention test

Would the code have been written differently if this rule had been enforced before the PR?

- **Yes** — lesson. Route it through the layers below.
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

## Layers

Enforcement beats prose: a guard fires on every PR without anyone remembering it, while a prose rule waits for the next reader to notice it. A lesson lands on the first layer that can catch it.

| Layer | Catches | Target |
|-------|---------|--------|
| **Shipped rule** | A pattern oxlint or oxfmt already names, including `ultracite` presets and installed plugins | `oxlint.config.ts` `rules` / `overrides`; `oxfmt.config.ts` |
| **Custom rule** | A single-file syntax pattern no shipped rule covers | a local JS plugin registered in `jsPlugins` |
| **Fallow policy** | Structure across files: imports, boundaries, banned calls, duplication, complexity, dead code, dependencies | `.fallowrc.json` |
| **Prose** | Intent, trade-offs, naming judgment — nothing executable can see it | root `AGENTS.md`, `apps/web/AGENTS.md`, or the doc it links |

Most lessons are an existing rule left off. Reach for a custom rule only when the rule lists have nothing close, and for prose only when no checker can see the pattern.

### Shipped rule

Turn it on at `error`. When it fires on existing code by design, scope it with `overrides` and a comment that gives the reason, the way the Effect rules are scoped in `oxlint.config.ts` today. A rule already off for a stated reason stays off until the user says otherwise.

A formatting lesson lands in `oxfmt.config.ts` — an option, or an `ignorePatterns` entry for generated files. Formatting never becomes prose.

### Custom rule

Write one when the pattern is a single file's syntax and no shipped rule names it. Keep it narrow: one node pattern, one message, no autofix unless the fix is mechanical.

- Put the plugin in `scripts/oxlint-plugins/<name>.ts`; it exports an ESLint-style object, and `meta.name` sets the rule namespace. The plugin API is [oxlint's JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).
- Register the file in `jsPlugins` in `oxlint.config.ts`; enable `<name>/<rule>` in `rules`.
- Add the file to `.fallowrc.json` `dynamicallyLoaded`: fallow sees a config string, not an import, and would report the plugin as unused.
- Test it: the rule fires on the pattern from the thread, and `bun lint` stays green.

### Fallow policy

Fallow reads the import graph and the whole repo; oxlint reads one file. What may import what, how complex a file may get, and what counts as dead is fallow's.

| Lesson | Field |
|--------|-------|
| Feature A may not import feature B; app → features → shared only | `boundaries.zones`, `boundaries.rules` |
| Never call or import X from Y | `rulePacks` — `banned-call`, `banned-import`, `banned-effect` |
| This file's branching is the format spec, not product branching | `health.thresholdOverrides` with a `reason` |
| These blocks are parallel on purpose | `duplicates.ignore`, `duplicates.ignoredClones` |
| This export is public API; this file loads at runtime | `ignoreExports`, `publicPackages`, `dynamicallyLoaded` |
| The finding is a false positive here | `overrides`, `ignoreFindings` |

Every threshold override carries a `reason` that says why the code is shaped that way. A second override for the same path is a collision, not a fix.

### Prose

Last resort: the rule needs a reader, not a checker. Scope first — does it bind code outside `apps/web`? Root `AGENTS.md` when yes, `apps/web/AGENTS.md` when no. Then follow that file's links and write in the linked doc when one owns the topic, inline otherwise. Domain vocabulary goes to `apps/web/GLOSSARY.md`.

## Collision

Read the target file before proposing anything.

| Existing rule | Do |
|---------------|-----|
| Says the same thing | Drop the candidate |
| Same topic, candidate is sharper or broader | Edit the existing line, rule, or threshold in place — one authority stays |
| Says the opposite, or a rule is off for a stated reason | Escalate. Present both and let the user pick — never flip or overwrite silently |

## Prose shape

One imperative bullet in the file's own voice, phrased positively. No PR reference, no rationale clause — indistinguishable from the rules already there.

```markdown
### Feature boundaries
- A feature's `index.ts` is its public API; import across features only through it.
```

Config changes follow the same bar: the smallest entry that catches the lesson, plus a comment or `reason` field that says why the value is not the default.
