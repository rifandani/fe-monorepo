# Core is organised by domain and owns the Effect seams

`packages/core` is organised by domain (`auth/`, `cdn/`, `http/`, `i18n/`, `persistence/`, `session/`), not by kind (`apis/`, `services/`, `libs/`). Core owns the Session and the stored client state of every app, behind one seam: a `KeyValueStore` layer. Each app keeps only its platform adapters and its one runtime, in `src/core/layers/`. TanStack Query stays the owner of server state.

> Recorded on 2026-11-03, after commit `60f553711` moved both apps to Effect. The move made `Http` and the endpoints real Effect code, but the code around them stayed copied in each app.

## Vocabulary

> **Domain folder** — one folder per domain in core. An API domain has three files: `schemas.ts` (declarations only), `api.ts` (the endpoint Effects), and `queries.ts` (the query keys and the query and mutation option factories). An app feature that owns its own endpoints uses the same layout (`apps/expo/src/user/`).
>
> **Composition root** — `apps/*/src/core/layers/`. It holds the platform adapters (storage, transport, telemetry), the env `ConfigProvider`, and `runtime.ts`, which states the services that every app Effect can use.
>
> **Toolbox** — `hooks/`, `utils/`, `constants/` and `types/` in core. Plain code for apps that do not exist yet. It is kept even without a caller, and it is not rewritten on Effect: Effect gives value where there are effects, errors and dependencies, not in pure helpers.

## What core owns

**Persistence.** `makePersistence(kvsLayer, { defaultLocale })` returns the one atom registry, the atom runtime, and the Session, theme and Locale atoms. Each app calls it once, with `localStorage` (spa) or MMKV (expo). Tests call it with `KeyValueStore.layerMemory`.

**The Session.** `Session` is a `Context.Service` with `accessToken`, `start` and `end`. `Http` gets it from its Layers. Before, `Http` took two callbacks (`getToken`, `onUnauthorized`), which the Layer graph could not see, and each app had its own End Session. Now there is one End Session flow, as the glossary says. The app gives only its extra step (`onEnd`: clear the query cache). `Session.layerMemory` is the second adapter at the same seam, so a test needs no module mocks.

**Query and mutation options.** Each factory takes any `ManagedRuntime` that provides the services it needs. `ManagedRuntime` is contravariant in its services, so a runtime that provides more is accepted. The app hook keeps only its own part (the toast).

## What each app owns

`src/core/layers/` only. Env goes through Effect `Config`: the layers read `EnvConfig`, the runtime installs one `ConfigProvider` over the env object that the bundler inlines, and code outside Effect reads its few values with `readEnv`, from the same object and with the same rule. The type of `AppLayer` in `runtime.ts` names the services the runtime must provide (`Http`, `HttpClient`, `Session`). `Layer` is contravariant in its output, so the build fails if one of them goes missing. This check exists because expo once hid `HttpClient` with `Layer.provide`, and `cdnApi` could not run there.

## Considered Options

- **Keep folders by kind and add `services/session.ts` and `atoms/`** — rejected. Folders by kind give each Effect concept no fixed location, and "everything about auth" was in three places.
- **Core atoms at module level, with the storage added by `Atom.context().addGlobalLayer` at startup** — rejected. `Atom.kvs` needs a runtime whose type includes `KeyValueStore`, so this needs a type cast, a hidden mutable global, and a startup order that must be correct. The `makePersistence` factory keeps the types correct and is the test surface.
- **A `QueryClient` service in core, so End Session clears the cache itself** — rejected. It couples the Session to TanStack Query. The `onEnd` step is a smaller interface.
- **Sync Session helpers (`get`, `set`, `end`) beside the Effect service** — rejected. Two write paths let a write skip `onEnd`. Writes go through the Effect; reads use `sessionAtom`.
- **Replace TanStack Query with `AtomRuntime.fn` / `runtime.atom`** — rejected for now. It would make one state system, but it rewrites every hook in both apps and removes the TanStack devtools and cache invalidation. Reopen it only with a new reason, not because "Effect everywhere" sounds cleaner.
- **One `AuthApi` / `CdnApi` `Context.Service` for each domain** — rejected. `Http` is already the seam, and MSW fakes the network under it (ADR-0002). A service with one adapter is a hypothetical seam.
- **Keep the Translation Provider in each app** — kept, as the glossary says. Only the Locale value moved to Persistence.
