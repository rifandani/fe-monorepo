# Glossary Map

## Contexts

- [spa](./apps/spa/GLOSSARY.md) — React SPA
- [expo](./apps/expo/GLOSSARY.md) — Expo / React Native app
- [core](./packages/core/GLOSSARY.md) — shared libraries and cross-app vocabulary

## Relationships

- **spa → core**: spa consumes core Message Catalogs and `initI18n`, and keeps its Session and Persistence through core (on `localStorage`)
- **expo → core**: expo consumes the same Message Catalogs and `initI18n`, and keeps its Session and Persistence through core (on MMKV); owns its own React Translation Provider
