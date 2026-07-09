# Shared Message Catalog; app-owned Translation Provider

Expo drops i18next and uses `@workspace/core` `initI18n` with the same Message Catalog as spa. Catalogs and flat Translation Keys live in core; each app keeps its own React Translation Provider because locale discovery differs (browser vs Device Locale). Manual Locale changes are not overwritten by OS changes on resume.

## Considered Options

- Per-app catalogs or an expo overlay — rejected; one catalog avoids drift
- Lift Translation Provider into core — rejected; would need platform forks
- Keep i18next on expo only — rejected; duplicate i18n stacks in the monorepo
