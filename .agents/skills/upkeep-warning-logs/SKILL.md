---
name: upkeep-warning-logs
description: Fix runtime errors and warnings in browser and terminal logs, fix build errors and warnings, and improve build time and output size. Use for log cleanup or build optimization.
disable-model-invocation: true
---

# Upkeep warning logs

Work within the requested scope. If no scope is given, cover the project-owned apps and their shared packages. Preserve application behavior and public contracts. Complete the fixes and assess build improvements; a list of findings alone does not complete this task.

## 1. Define coverage and capture a baseline

Read the applicable repo instructions and standards. Find runtime, build, and validation commands in package scripts and CI configuration. Identify each app's platform, required services, and supported local build modes. Read related vendored guidance before changing library usage.

Define a coverage list for each app: startup, representative routes or commands, and interactions that exercise the reported issues. Include lazy-loaded features and relevant failure paths. Record the scenarios actually tested so the result has a clear coverage limit.

Capture fresh logs before edits:

- **Browser apps:** attach log collection before navigation. Capture console warnings and errors, uncaught exceptions, and unhandled rejections. Exercise the coverage list and inspect failed network requests for related causes. Collect the dev server's terminal logs too. Where a local production preview is supported, check that mode as well.
- **Other runtimes:** capture terminal or platform logs during startup and the selected commands or interactions. Include stderr, process failures, and unhandled asynchronous failures.
- **Builds:** run each applicable build command. Save stdout, stderr, and the actual build exit status. A successful exit can still contain warnings. Keep the original diagnostics available when wrappers shorten or filter output.

Group repeated messages by cause. For each finding, record its source, diagnostic, trigger or command, affected code, and whether it existed before the edits. Separate application defects from expected handled failures, dependency diagnostics, browser-extension noise, and missing local services. Use evidence for each classification.

For build measurements, read [BUILD-MEASUREMENTS.md](BUILD-MEASUREMENTS.md). Record the baseline before changing build inputs or configuration.

**Done when:** each app in scope has a coverage list, captured runtime and build results, and build measurements, or a specific blocker for the missing evidence. Each distinct diagnostic has an entry in the findings list. A blocked or untested path remains unverified.

## 2. Assign independent work

Use native subagents in the current checkout when separate apps, diagnostic causes, or build candidates can be investigated independently. Do not create worktrees or separate checkouts. Keep a small or tightly coupled task with one agent. Read-only discovery can run in parallel while the parent records the baseline.

Group fixes by their dependency graph. Keep a cause, its callers, and its tests together. Assign each editable file to one owner. Keep shared configuration, dependency versions, lockfiles, and changes across groups with the parent.

Give each subagent its files, findings, baseline evidence, applicable guidance, reproduction commands, and expected checks. Subagents perform steps 3 and 4 within that assignment, preserve other agents' edits, and return any dependency outside their scope to the parent.

Give subagents separate servers, browser sessions, ports, logs, generated output, and writable caches where supported. Run operations that share output or caches one at a time. Coordinate build experiments through the parent and evaluate candidates in sequence. Pause edits to the measured build inputs and competing workloads during timing measurements, as specified in [BUILD-MEASUREMENTS.md](BUILD-MEASUREMENTS.md).

Each subagent returns changed files, causes and fixes, reproduction and check results, build evidence, and unresolved findings. The parent reviews the shared changes, resolves shared dependencies, and updates the findings list. Subagent checks establish only the assigned scope; final validation covers the combined result.

**Done when:** each independent group has one owner in the current checkout, shared resources have an execution plan, and shared changes have a clear order. If parallel work is unsuitable, continue with one agent.

## 3. Fix the causes

Fix build failures that prevent runtime checks first. Then work through runtime errors, warnings, and remaining build diagnostics. For each finding:

1. Reproduce the diagnostic with its recorded scenario or command. Trace it to the code, configuration, asset, or dependency that emits it. Check callers and related tests before selecting a fix.
2. Make the smallest complete fix that preserves the required behavior. For a dependency issue, check the installed version and supported configuration before changing versions. Change generated output through its source or generator.
3. Repeat the same scenario or command. Confirm that the diagnostic is absent and the affected operation still works. If a build failure hid later diagnostics, add the newly exposed findings and continue.
4. Record the cause, fix, and verification result. If the fix needs unavailable services, an upstream change, or work outside scope, record the evidence and the exact remaining dependency.

Keep diagnostic visibility and validation strength intact. Do not use console stubs, log filters, warning suppressions, higher warning thresholds, disabled checks, or swallowed exceptions as fixes. When an expected handled failure produces a misleading diagnostic, use the project's logging policy to correct its severity while retaining useful context and verifying the failure path.

Add or update a regression test when a behavior change has a meaningful test seam. Use the original runtime or build reproduction to verify log and configuration fixes. Remove temporary diagnostic code after verification.

**Done when:** every finding is fixed and verified, classified with evidence, or blocked with a concrete reason. Every newly exposed diagnostic is accounted for. A quiet log from a skipped code path does not verify a fix.

## 4. Improve the build

Use the baseline and build reports to find costs in the affected build graph. Follow [BUILD-MEASUREMENTS.md](BUILD-MEASUREMENTS.md) to assess build time and output size.

Implement supported improvements within scope. Check whether each change moves cost elsewhere, such as from the initial bundle to a slow lazy route, or from the build to application startup. Preserve required browser and platform targets, assets, source-map policy, checks, and runtime behavior.

Repeat the comparable measurements after each candidate change. Keep changes with a demonstrated benefit and acceptable tradeoffs. Revert candidates that regress the result or lack evidence. If no useful improvement is found, report what was measured and why the candidates were rejected. Separate larger redesigns or dependency migrations from completed improvements.

**Done when:** build time and output size have both been assessed, each retained improvement has comparable before and after evidence, and rejected or blocked candidates have a specific reason.

## 5. Validate the combined result

Collect all worker results and combine accepted changes before final validation. Account for each assignment as completed or blocked. Repeat measurements for retained build improvements on the combined code under comparable conditions.

Run the required repo checks and affected tests. Repeat the builds and runtime coverage list after all changes are combined. Include the supported production preview for browser apps so development-only success cannot hide production failures.

Inspect warnings as well as exit codes. Compare the final logs with the findings list and resolve new diagnostics caused by the work. Confirm that optimized chunks and assets load through the affected routes and interactions. When cache inputs change, verify that a relevant source change rebuilds the affected output correctly.

Keep raw logs and measurements in temporary or ignored storage. Remove credentials and personal data from any shared excerpt. Stop only the local processes and browser sessions started for this task.

**Done when:** each planned scenario and required check passes or has a documented blocker, all findings have a final status, and retained build improvements remain valid in the combined result. Record each blocked command, error, whether it was present before edits, and what remains unverified.

## 6. Report

Report the apps and scenarios checked, causes fixed, validation commands and results, and measured build improvements. State the measurement conditions and units. List remaining diagnostics, coverage gaps, and deferred changes with their evidence and next action. Leave changes uncommitted unless the user requests a commit.
