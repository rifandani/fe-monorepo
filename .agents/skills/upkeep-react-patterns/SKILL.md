---
name: upkeep-react-patterns
description: Refactor React composition across all apps and shared React code. Apply React best practices only to the SPA app and React Native guidance only to the Expo app.
disable-model-invocation: true
---

# Upkeep React patterns

Refactor the requested scope to follow the applicable Vercel patterns. If no scope is given, cover the React code in `apps/spa`, `apps/expo`, and shared packages. Preserve user-visible behavior and accessibility.

## 1. Load the guidance

Call the Skill tool with "vercel-composition-patterns". Apply it to all apps in scope, including the SPA and Expo apps, and to shared React code.

For work in the SPA app (`apps/spa`) only: Call the Skill tool with "vercel-react-best-practices". Apply this guidance only to the SPA app; exclude Expo code.

For work in the Expo app (`apps/expo`) only: Call the Skill tool with "vercel-react-native-skills".

Use each rule only where the framework, platform, and installed versions support it.

**Done when:** the applicable skills are loaded and the scope is clear.

## 2. Assign independent work

Map the features and shared React areas in scope. Use the package scripts and CI configuration to find the required checks. Record existing failures before edits.

Use parallel agents for independent groups of files. Keep a component, its hooks, affected callers, and tests in one group when they must change together. Keep a small or tightly coupled refactor with one agent.

Give each worker an explicit file list, the applicable guidance from step 1, existing failures, and check commands. Each worker must perform step 3 for its group and run the affected checks. Keep the SPA and Expo guidance scoped as specified in step 1. Assign each editable file to one owner. A worker that needs a file outside its assignment must return that dependency to the parent for reassignment.

Use the available agent orchestration to give workers isolated checkouts when supported. Include the current task changes in each worker's starting state. In a shared checkout, use disjoint file ownership and serialize edits that could affect another worker's results. Keep shared configuration and changes across groups with the parent. Complete shared API changes before workers refactor dependent callers, or keep the API and its callers in one group.

Each worker returns the areas checked, changed files, implemented fixes, deferred findings with reasons, check commands and results, and unresolved dependencies. The parent collects and reviews the changes, resolves dependencies, and accounts for every area in scope. Run the full repo checks after the changes are combined; worker checks establish only their assigned scope.

**Done when:** every area has one owner, all workers have returned, and their changes and results are combined or recorded as blocked.

## 3. Refactor

Read the applicable context files, docs, ADRs, and Fallow configuration. Keep Fallow's `bulletproof` preset boundaries intact when moving components, state, or hooks. Keep platform-specific code in its app and shared code independent of app internals.

Work through each feature and shared React area in scope:

- Read its components, hooks, providers, callers, and tests. Check them against the applicable skill rules, starting with the highest-impact issues.
- Implement the fixes and update affected callers. Use composition where it simplifies the component interface; keep state with the components that need it.
- Keep the current libraries and public contracts unless a concrete fix requires a change. Base performance changes on a demonstrated cost or an applicable rule in the loaded guidance.
- Record a brief reason for findings that need a separate behavior change, dependency migration, or work outside the requested scope.

**Done when:** every React area in scope has been checked, each applicable finding has a fix or a specific reason for deferral, and affected callers are updated. An audit or change list alone does not complete this step.

## 4. Validate

After all worker changes are combined, run lint and type checks, Fallow boundary and static checks, and the unit tests for the affected workspaces. Run the affected app's build or platform checks where local scripts support them. Run independent checks concurrently when they do not write to the same output or cache.

Add or update tests when the change affects a state transition, shared contract, or behavior that existing tests do not cover. Check affected interactions and accessibility when the component structure changes. Fix failures caused by the refactor and repeat the affected checks.

**Done when:** required checks pass, or an external or pre-existing blocker is identified with its command, error, and effect on validation. Report checks that could not run separately from checks that passed.

## 5. Report

Report the scope covered, the implemented changes and their purpose, validation results, and any deferred findings or remaining blockers. Leave the changes uncommitted unless the user requests a commit.
