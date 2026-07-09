# Context Map

## Contexts

- [spa](./apps/spa/CONTEXT.md) — React SPA
- [web](./apps/web/CONTEXT.md) — web app
- [expo](./apps/expo/CONTEXT.md) — Expo / React Native app
- [core](./packages/core/CONTEXT.md) — shared libraries and cross-app vocabulary

## Relationships

- **spa → core**: spa consumes core Message Catalogs and `initI18n`
- **expo → core**: expo consumes the same Message Catalogs and `initI18n`; owns its own React Translation Provider
