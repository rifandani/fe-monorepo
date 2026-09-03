# Module resolution has a single source of truth

A workspace package resolves through its own `exports` map and nothing else. `@workspace/core` is a declared `workspace:*` dependency of all three apps, so Bun symlinks it into `node_modules` and every bundler, `tsc`, and Node reach the same files by the same route. The tsconfig `paths` mappings and the Vite alias that pointed at `packages/core/src` are removed. Alongside this, the Node version is stated once and read from one file, and `erasableSyntaxOnly` is on repo-wide.

> Adapted from the backend monorepo's `6434761`, which reached the same resolution rule as a consequence of dropping its build step. The half of that commit this repo cannot use — running TypeScript natively on Node — is recorded under [Considered Options](#considered-options).
> Exception: the three Vitest configs keep their `@workspace/core` alias on purpose — see [The exception that stays](#the-exception-that-stays).

## Vocabulary

> **Exports map** — the `exports` field in a package's `package.json`. It is the package's public surface: a specifier that it does not name does not resolve, whatever files exist on disk. `packages/core` maps seven subpath patterns (`./apis/*`, `./assets/*`, `./constants/*`, `./hooks/*`, `./libs/*`, `./services/*`, `./types/*`, `./utils/*`) onto `./src/*`.
>
> **Parallel route** — a second way to reach the same file that only some tools understand. A tsconfig `paths` entry is one: `tsc` and Vite honour it, Node does not, and Metro does so only through a Babel plugin. While the two routes agree, nothing appears wrong.
>
> **Self-reference** — a package importing itself by name (`@workspace/core/libs/i18n/init` from inside `packages/core`). It resolves through the package's own `exports`, so an internal import is checked against the same public surface a consumer sees. Every module in `packages/core` already did this; one did not, and that is what broke.

## What was removed

**The `@workspace/core/*` tsconfig mapping**, from `apps/spa` and `apps/expo`, and **the matching Vite alias** in `apps/spa/vite.config.ts`. All imports across the repo use subpaths the `exports` map already covers, so the alias added nothing but a second answer to the same question. Both apps resolve `bundler`, which reads `exports` — `apps/expo` included, via `expo/tsconfig.base`.

**`"*": ["./*"]`**, from all three app tsconfigs. It let any bare specifier resolve against the app root for `tsc` alone. No bundler does this, so a genuinely missing dependency would typecheck and then fail to build. It was covering nothing: of 154 bare specifiers across the three apps, none resolved through it.

**`packages/typescript-config/node.json`**. No tsconfig in the repo extended it, and it had drifted out of agreement with the preset it never inherited from — it still declared `outDir: ./dist` and overrode `moduleResolution` to `bundler`, predating `nodenext` in `base.json`. A preset nobody consumes cannot be wrong in a way anyone notices, which is the argument for deleting rather than repairing it. A future Node package should be written against the `base.json` that exists then.

## What the alias was hiding

`packages/core/src/libs/i18n/my-translations.d.ts` was imported by `init.ts` as `.../my-translations.d`, and augmented by both app providers as `.../my-translations`:

```ts
declare module "@workspace/core/libs/i18n/my-translations" {
  interface Register { translations: typeof enUS }
}
```

Those are two different specifiers. Under the `paths` alias TypeScript inferred the extension, both landed on the same file, and the augmentation attached — **by coincidence**. Under `exports`, `./libs/*` maps to `./src/libs/*.ts`, so the app's specifier resolves to a `my-translations.ts` that did not exist, and `tsc` failed with `TS2664`.

The file is now a plain `.ts` module. It only ever exported an interface, so nothing about it needed to be a declaration file, and dropping the `.d` lets one specifier serve both the import and the augmentation. Its `./locales/en-US` import became a `@workspace/core` self-reference — matching every other module in the package, and satisfying `nodenext`, whose explicit-extension rule `.d.ts` files are exempt from. That exemption is precisely why the inconsistency survived unnoticed.

This is the argument for the whole change in one file: a parallel route does not announce that the primary route is broken.

## The exception that stays

The three Vitest configs (`packages/core`, `apps/spa`, `apps/expo`) **keep** their `@workspace/core` alias, built from `import.meta.dirname`. This is not an oversight. [ADR-0003](./0003-mutation-testing-is-advisory.md) depends on it: Stryker copies the repo into `.stryker-tmp` and symlinks `node_modules`, so bare package resolution inside the sandbox reaches the real, **unmutated** `packages/core`. The alias re-resolves to the sandbox copy; without it, mutants in `core` would silently stop reaching the app projects' tests and the mutation score would quietly overstate itself.

So the rule has a stated boundary: **build and typecheck resolve through `exports`; the mutation sandbox resolves by path.** Anyone deleting the Vitest aliases for consistency with this ADR would break ADR-0003 without a failing test to say so.

## One version, one pin

`.node-version` pins `26.8.1`, and all workflows read it via `node-version-file`.

The two numbers say different things, and the split is deliberate: **`engines.node` (`>=26.0.0`) is a support policy — what will run. `.node-version` is a pin — what we check.** `engines` is on the root. `apps/spa` ships static assets, `apps/expo` ships to a device, and `packages/core` is source only. Asserting a Node floor for those would state a constraint their artifacts do not have. Bun does not enforce `engines` on install in any case — the floor is enforced by CI reading `.node-version`, not by the package manager. `packageManager: bun@1.3.14` pins Bun.

An exact pin means CI no longer picks up 26.x patch releases on its own. The version lives in `.node-version`; `bump:deps` is an `npm-check-updates` invocation that does not touch it.

## Erasable syntax

`erasableSyntaxOnly` is on in `base.json`, and restated inline in `apps/expo/tsconfig.json` because that app extends `expo/tsconfig.base` and our preset never reaches it. Stating it in both places makes the rule repo-wide rather than wherever inheritance happens to go.

**Be honest about what it buys here.** In the backend monorepo the flag is a crash guard: an `enum` would typecheck and then kill a Node process that only strips types. Nothing in this repo runs on bare Node except `scripts/` — Metro, Vite, and Turbopack all compile `enum` and `namespace` without complaint. Here it is a consistency rule, chosen so that source in this repo means the same thing it means in the backend, and so that shared code never depends on a construct one runtime refuses. It cost nothing to adopt: the repo contained no non-erasable construct when it was turned on.

## Considered Options

- **Subpath imports (`#*`) replacing `@/*`** — **deferred, not rejected.** This is what the backend commit actually did: `"imports": { "#*": "./src/*" }` in each `package.json`, which Node, Bun, and Vitest resolve natively. It is the logical end of this ADR, and it would delete the last tsconfig-only alias in the repo. It is deferred on cost and on one unknown: 571 import rewrites across three apps, and Metro. Vite 8 and Next 16 resolve `imports` natively, but `apps/expo` is Expo SDK 53 / Metro 0.82, where `@/*` resolves through `babel-preset-expo` reading tsconfig rather than through Metro itself, and subpath-imports support is a separate and less-proven path from the package-exports support enabled by default. **Revisit by spiking one file in `apps/expo` and running the bundler** — decide on the observed result, not on the documentation. If Metro cannot resolve it, the choice is two conventions in one repo or a Metro `resolveRequest` shim, and neither is obviously worth it.
- **Repairing `node.json` instead of deleting it** — rejected; see above. Nothing extended it and it had already drifted.
- **Keeping `"*": ["./*"]` defensively** — rejected; it resolves for `tsc` and no bundler, so its only effect is to delay a missing-dependency error until build time.
- **Adding `engines.node` to every workspace** — rejected; it would assert a runtime constraint that `spa`, `expo`, and `core` artifacts do not have, and Bun does not enforce it anyway.
- **Floating `.node-version` on `26`** — rejected; it keeps CI current on patch releases but abandons the "we test exactly this" guarantee that is the only reason to add the file. The floating value already existed as `node-version: 26` and is what this replaces.
- **An `exports` entry for the `.d.ts`** — rejected as the fix for `my-translations`. Adding `"./libs/i18n/my-translations": "./src/libs/i18n/my-translations.d.ts"` would have resolved the specifier while leaving a type-only module reachable at two names, which is the shape of problem this ADR exists to remove.

## Verification

`bun run typecheck` and `bun run test:unit` pass. `bun spa build` passes.
