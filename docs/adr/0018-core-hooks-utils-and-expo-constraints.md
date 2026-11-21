# Core hooks, utils and Expo constraints

> Recorded on 2026-11-20 from the comments in `packages/core/src/{hooks,utils,i18n}` and `apps/expo` ([ADR-0011](./0011-code-carries-no-comments.md)).

## React Compiler

The React Compiler runs on the shared hooks, and it sets the shape of some code:

- `useMultipleRefs` returns a named iterator object, so `[Symbol.iterator]` can return the same object without `this`, which the compiler cannot lower.
- `useHistoryTravel` keeps its initial-value ref in the hook body: the compiler rule forbids passing a ref across a function boundary during render.
- `useLatest` writes its ref in a layout effect, not during render, so the hook stays pure. Effects, event handlers and timers still see the value of the current render.
- `useMemoizedFn` does not write `fnRef.current = fn` during render ([alibaba/hooks#728](https://github.com/alibaba/hooks/issues/728)).

## Utils and i18n

- `useRafInterval` and `useRafTimeout` fall back to plain timers where `requestAnimationFrame` is absent (SSR, Node tests).
- `parseSetCookieHeader` splits an attribute on the first `=` only, because a value can contain `=`. An unknown `SameSite` value is dropped. A cookie with no value keeps an empty value; a cookie with no name is dropped.
- `isClipboardSupported` is false on the server and outside secure contexts, where browsers hide `navigator.clipboard`.
- `supportedLocales` is the one list of Locales. The type, the schema, the names and the catalogs follow it, so a new Locale is a compile error until each one has an entry (the Expo `date-fns` map too).
- `t` replaces a placeholder literally, with a function replacement. A string replacement reads `$&`, `$$`, `` $` `` and `$'` in the value as patterns, and a value can be text that a person typed. An empty message counts as missing, so the next Locale can supply it.

## Expo

- `babel.config.js` is a static object, which Babel caches for ever (the same as `api.cache(true)`). Clear the Metro cache after each change (`bunx expo start --clear`).
- `APP_VARIANT` comes from the shell, so any other value (or none) gives the development config.
- `YGroup`'s `separator` prop is deprecated, so callers put separators between the items of `FitSheet`.
- Maestro flows read the test ids `profile-language-english-checked` and `profile-language-indonesia-checked`. Keep them stable.
