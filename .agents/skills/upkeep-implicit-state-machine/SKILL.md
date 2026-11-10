---
name: upkeep-implicit-state-machine
description: Find and improve implicit state machines across apps and their shared code. Use for state-machine upkeep, coupled state flags, scattered transitions, or unclear workflow lifecycles.
disable-model-invocation: true
---

# Upkeep implicit state machines

Find the state machines in the requested scope and implement supported improvements. With no scope given, cover every project-owned app and the shared code that the apps use. Preserve required behavior and public contracts. An inventory alone completes only an explicit audit request.

An **implicit state machine** is a flow whose current state and incoming event determine its next state or allowed action, but whose rules are spread across values, conditions, callbacks, or effects. A boolean can be a sufficient model for a simple flow. Several independent values do not, by themselves, require a combined machine.

## 1. Establish coverage and a baseline

Read the applicable repo instructions, standards, relevant glossaries from `GLOSSARY-MAP.md`, and ADRs. Find the apps, shared dependencies, test scope, and required checks from workspace files and CI. Read related vendored guidance before changing library usage.

Build a coverage list of routes, features, and shared areas in scope. Include components, hooks, providers, stores, services, navigation, persistence, background work, and platform adapters. Include source outside the usual feature folders when it can control application behavior. Exclude dependencies, vendored code, caches, and generated output; inspect the source or generator of relevant generated behavior.

For independent areas, use parallel subagents in the shared checkout. Read [ORCHESTRATION.md](ORCHESTRATION.md) before assigning work; it defines file ownership, worker results, and integration checks. Keep small or tightly coupled work with one agent.

Search for state storage and state changes. Useful signals include state hooks, reducers, atoms, stores, mutable refs, module variables, status values, related booleans, effects, subscriptions, callbacks, promises, timers, and route or storage events. Read the source in each coverage area and trace its callers, state writers, and external events. Search matches are leads; search alone cannot establish coverage.

Record each candidate flow with its source locations, owner, current state source, events, and affected consumers. Classify it as implicit, already explicit, library-owned, or simple independent state. Link repeated uses to the same owner. Record areas with no candidate and areas that could not be inspected.

Run the applicable checks before edits and record existing failures. For flows that may change, capture the current behavior through existing tests or a reproducible interaction.

**Done when:** every area in scope is reviewed or has a specific coverage blocker, each candidate is classified with source evidence, and baseline checks and behavior are recorded. Limit coverage claims to the source and paths actually inspected.

## 2. Model each flow and select improvements

For each implicit flow, trace the complete lifecycle. Write a compact transition table or equivalent notes with:

- Initial state, reachable states, and data required in each state.
- Events and their sources, guards, next states, and side effects.
- Invalid or repeated events and the required response to each.
- Invariants: conditions that must hold in every reachable state.
- Applicable failure, cancellation, retry, reset, navigation, unmount, and persistence paths.

Use this model to find impossible combinations, missing transitions, duplicate state sources, stale results, lost input, repeated actions, and states with no recovery. Compare with callers, tests, and product behavior. Distinguish an intended invariant from an assumption. Treat a suspected defect as a finding that needs evidence, rather than as permission to change the workflow.

Assess each proposed change on all three aspects:

| Aspect | Required benefit | Evidence to check |
| --- | --- | --- |
| UX: user experience | More reliable progress, feedback, or recovery | Concrete interaction, reachable state, or race that becomes safer; preserve input, accessibility, and responsiveness. |
| DX: developer experience | Easier and safer maintenance | Fewer coupled writes or duplicate sources, a smaller interface, or rules that can be tested at one owner. |
| AX: agent experience | Easier discovery and correct modification | Named states and events, one clear owner, exhaustive transitions, and tests that show the contract. |

Select changes that improve all three aspects together. Record the before and after evidence for each aspect; code size or a new abstraction alone is not evidence of improvement. Compare a local correction, a derived value, and an explicit transition model. Choose the smallest complete solution that removes the demonstrated problem.

Keep a sufficient model as it is. Retain library ownership for query, form, router, and other managed state; derive views from that state rather than mirror it in a second machine. Keep independent or concurrent flows separate when their events and lifecycles are independent. Use hierarchy or a state-machine library only when the real flow needs it and current project guidance supports it. A new dependency or repo-wide framework migration needs a concrete reason within scope.

Give every finding a decision: improve, retain with evidence, or defer with a concrete constraint and next action. A missing autofix or a preference for less work is not a deferral reason. If intended behavior is unresolved, continue independent work and leave that decision open for clarification.

**Done when:** every implicit flow has a lifecycle model and decision, and each selected change has a specific UX, DX, and AX benefit with no known regression in any aspect.

## 3. Implement through one owner

Work in small groups of related flows. Keep the state owner, affected callers, adapters, and tests together. Start with flows where failure can lose data, leave stale authentication, repeat an action, or prevent recovery.

Use the file ownership rules in [ORCHESTRATION.md](ORCHESTRATION.md) for parallel implementation. Resolve shared contract changes before dependent work starts. Combine worker results before the final validation in step 4.

Use the simplest representation that enforces the model: a derived value, a named status, a discriminated union with state-specific data, or a reducer or transition function. Use domain terms for states and events. Keep the transition rules and invariants with their owner; expose actions that express intent. Preserve required controlled-component and public interfaces through adapters when needed.

Separate transition calculation from side effects where the flow permits it. Keep React render and reducer logic pure. Give asynchronous work a clear owner, result identity, and cleanup rule. Ensure that a late result cannot restore obsolete state after a newer operation, reset, logout, cancellation, or unmount. Use the existing library's cancellation and concurrency rules where applicable. Cancellation of local work alone does not prove a remote action was cancelled.

Update all consumers of a changed contract. Remove obsolete flags, duplicate writes, synchronization effects, and dead branches once the new owner covers them. Keep feature and platform boundaries intact. Put shared domain rules in shared code only when their behavior is shared; retain platform behavior in its adapter. Preserve stored data formats and rehydration behavior, or provide and verify a compatible migration within scope.

Preserve intended interactions: loading and empty states, enabled actions, error feedback, focus, keyboard or native navigation, screen-reader announcements, translations, and user input. Correct a confirmed defect with a regression case that shows the required result. Keep unrelated behavior changes separate.

**Done when:** each selected improvement is implemented, every affected consumer uses the intended owner, obsolete state paths are removed, and required behavior and compatibility are accounted for.

## 4. Verify transitions and combined behavior

Follow the repo's test policy. Test pure transition logic and stores through their supported interfaces; verify UI behavior with the supported app interaction tools. Use deterministic event sequences and controlled time or responses for asynchronous cases.

For each changed flow, verify initial state, valid transitions and their guards, invalid or repeated events, state-specific data, and invariants. Assert observable results and side effects, including their count and order when these are part of the contract. Cover applicable adverse sequences: failure then retry, rapid repeated input, cancel then late success, older response after a newer response, and reset or logout while work is pending. Include persistence reload and cleanup when those paths apply. Each demonstrated defect needs a regression case that fails on the old behavior and passes after the fix.

Exercise affected user paths on each affected platform, including recovery and accessibility behavior. Shared-code success alone does not verify app adapters. Check the UX, DX, and AX evidence from step 2 against the final implementation.

Run required repo checks and affected workspace tests, including lint, type checks, architecture checks, and supported builds or platform checks. Fix failures caused by this work and repeat affected checks. Keep validation scope and strength intact.

Run independent checks concurrently when their outputs, caches, ports, and fixtures are isolated. Run the required combined checks against the integrated result; worker checks establish only their assigned scope.

Review the final diff and repeat the candidate search across the original scope. Reconcile remaining matches and newly exposed flows with the inventory. A remaining boolean is acceptable when its recorded model is sufficient.

**Done when:** every changed flow has transition and interaction evidence, the final inventory agrees with the code, and required checks pass or have a documented blocker. For a blocker, record the command or scenario, error, whether it existed before edits, and what remains unverified. An unavailable check remains unverified.

## 5. Report

Report coverage by app and shared area, implemented changes with their UX, DX, and AX benefits, and validation results. List retained flows with brief reasons. List deferred findings and coverage gaps with source locations, evidence, and the next action. State the limits of verification; checks cannot guarantee the absence of regressions. Leave changes uncommitted unless the user requests a commit.
