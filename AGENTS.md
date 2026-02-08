## Architecture

- Monorepo: `bun` workspace, apps in `apps/`, packages in `packages/`
- Apps:
  - `spa`: Single Page Application with react 19 and tanstack router
  - `web`: Full Stack Application with next 16
  - `expo`: React native with expo 53
- Packages:
  - `core`: Shared business logic, types, hooks, constants that can be shared in browser and mobile (react native)
  - `typescript-config`: Shared typescript config
