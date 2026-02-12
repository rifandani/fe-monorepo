# Agent instructions

Bun workspace monorepo: React (SPA), Next.js (web), Expo (mobile). Apps in `apps/`, shared code in `packages/`.

- **Package manager**: `bun` (not npm)
- **Lint** (all apps): `bun lint` or `bun lint:fix` to apply safe fix from root
- **Typecheck** (all apps): `bun typecheck` from root

Details by topic:

- [Architecture](docs/architecture.md)
- [Accessibility](docs/accessibility.md)
- [Security](docs/security.md)
- [Performance](docs/performance.md)

Per-app commands and conventions: see each app’s `AGENTS.md` (e.g. `apps/web/AGENTS.md`, `apps/spa/AGENTS.md`).
