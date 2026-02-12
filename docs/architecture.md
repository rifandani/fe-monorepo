# Architecture

- **Monorepo**: `bun` workspace; apps in `apps/`, packages in `packages/`
- **Apps**
  - `spa`: Single Page Application (React 19, TanStack Router)
  - `web`: Full Stack (Next 16)
  - `expo`: React Native (Expo 53)
- **Packages**
  - `core`: Shared business logic, types, hooks, constants (browser + mobile)
  - `typescript-config`: Shared TypeScript config

Run app-specific commands from repo root: `bun --filter @workspace/<app>` or from the app directory.
