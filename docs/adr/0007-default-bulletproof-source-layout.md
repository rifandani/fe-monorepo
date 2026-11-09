# Source folders follow the default bulletproof preset

We use Fallow's [bulletproof preset](https://fallow.tools/docs/analysis/boundaries/) without custom zones or import rules. Source files move to the preset's folder conventions so the code structure and the checked architecture agree. Fallow runs from each workspace root because the preset starts at `src/`.

Each app keeps routes and app composition in `src/app`, and each feature in `src/features/<name>`. Shared code uses the preset's `components`, `hooks`, `lib`, `providers`, `shared`, `styles`, `types`, and `utils` folders. A feature can import shared code, but cannot import another feature. Router providers and developer tools that depend on routes belong to app composition.

Core's domain modules move under `src/lib/<domain>`. Its constants and assets move under `src/shared`. The public `@workspace/core` subpaths stay unchanged through the package exports map. This updates the physical paths from [ADR-0006](./0006-core-owns-the-effect-seams.md) while preserving its ownership and service design. Vitest derives its mutation-sandbox aliases from that exports map, as required by [ADR-0004](./0004-module-resolution-has-a-single-source-of-truth.md).

The shared `fallow.boundaries.json` selects the preset and requires source coverage. Workspace configurations inherit it. Root build configurations, scripts, and end-to-end tests are outside the preset's source layers and have explicit coverage allowances. Tests beside source files follow the same import rules as that source. Fallow can warn about unused preset zones, such as `server`; the preset stays unchanged.

`bun run check:boundaries` checks all three source workspaces. `bun run check:all` includes this gate, and CI runs it before the full Fallow check. Boundary violations are errors, with no baseline. The workspace-scoped preset does not classify another workspace's source; lint separately forbids imports between apps and imports from core into an app. Git hooks keep their existing commands.
