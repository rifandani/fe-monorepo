---
name: upkeep-lint-suppressions
description: Remove Oxlint and Fallow suppression comments, fix the violations they hide, and remove dead suppressions. Use for codebase suppression cleanup, including oxlint-disable, fallow-disable, and fallow-ignore comments.
disable-model-invocation: true
---

# Upkeep lint suppressions

Clean the requested scope. If no scope is given, cover all project-owned code, tests, declarations, scripts, and configuration files. Preserve behavior and public contracts.

## 1. Find suppressions and checks

Read the applicable repo instructions and standards. Use the package scripts, CI, installed tool help, and effective configuration to find the checks and their scope. Read related vendored guidance when a fix uses that library.

Search for `oxlint-disable`, `fallow-disable`, and `fallow-ignore`. Include line, next-line, block, and file forms. Include matching enable comments when you inspect a disabled region. Exclude dependencies, vendored repositories, build output, caches, and generated files. Report relevant generated-file matches as excluded; fix their source or generator only when it is in scope. Separate real directives from strings, examples, and comments that only describe a directive.

Make an inventory of each directive's path, line, tool, rule list, and affected region. For a directive with several rules, track each rule separately. Verify which Fallow forms the installed version supports; an unsupported `fallow-disable` comment can still be obsolete text that needs removal.

Run the applicable checks before edits and record existing failures. Include unused-directive detection for Oxlint and stale-suppression detection for Fallow when the installed tools support them. Fallow's `suppressions` command can help with the inventory, but text search must also cover unsupported forms.

**Done when:** every suppression in scope is in the inventory, exclusions are clear, and the check commands and existing failures are recorded.

## 2. Assign independent work

Use parallel subagents in the current shared checkout when the inventory contains independent groups of files. Do not create worktrees or separate checkouts. Keep directives in the same file, fixes with shared callers, and changes to the same public contract in one group. Keep a small or tightly coupled cleanup with one agent.

Give each worker an explicit file list, its inventory entries, the baseline failures, applicable guidance, and check commands. Each worker must perform step 3 for its group. Assign each editable file to one owner. A worker that needs a file outside its assignment must return that dependency to the parent for reassignment.

Use disjoint file ownership to isolate worker edits. Preserve changes made by other workers and the user. Serialize temporary diagnostic edits and checks when another worker's edits could affect their results. Keep shared configuration changes and fixes across groups with the parent.

Each worker returns its changed files, the outcome for every assigned rule, retained reasons, check commands and results, and unresolved dependencies. The changes are already in the shared checkout. The parent reviews them, resolves dependencies, and updates the inventory. Run the full repo checks after all workers finish; worker checks establish only their assigned scope.

**Done when:** every inventory entry has one owner, all workers have returned, and their changes and results are reviewed or recorded as blocked.

## 3. Remove, check, and fix

Work in small groups so each diagnostic can be linked to its directive. For each directive:

1. Remove the directive or one rule from its list. Run the check that owns that rule with the project's effective configuration. Keep Oxlint's typed checks and plugins active. Use the relevant Fallow analysis for the finding, such as dead code, architecture, health, or duplication. A dead-code check alone cannot prove that a complexity or duplication suppression is dead.
2. If no diagnostic returns, confirm that the tool checked the affected region and rule. A skipped file, filtered report, failed scan, stale cache, or inactive analysis is not proof that the code satisfies the rule. A directive made redundant by the current configuration can be removed; record that reason separately from a code fix.
3. If a diagnostic returns, read the affected code, callers, and tests. Fix the cause, update affected callers, and repeat the check. For dead-code findings, check framework entry points, dynamic use, and public consumers before deletion. Preserve required interfaces; remove code only when the evidence supports removal.
4. If a fix cannot preserve the required behavior or contract within scope, retain only the necessary rule and region. Add or keep a short comment that explains the concrete constraint. Record the diagnostic, evidence, attempted fix or unsafe tradeoff, and the change needed to remove it later. A missing autofix alone is not a reason to retain a suppression.

Keep rule severity, analysis scope, ignore lists, baselines, and thresholds intact. Do not replace a removed directive with another suppression mechanism, a type escape, or artificial code that only makes the check pass. Use a temporary diagnostic override only to investigate a rule; restore it before final validation.

Remove dead rules from mixed lists. Remove empty directives, obsolete reasons, and redundant enable comments. Preserve enable comments that still close an active disabled region, and check that comment removal has not changed another directive's target line.

**Done when:** every inventoried rule is removed with a verified reason, fixed in code, or retained with specific evidence. An inventory or advice alone does not complete this step.

## 4. Validate the result

Run the required repo checks and affected workspace tests. Include lint, type checks, the Fallow analyses used above, and architecture checks when imports or module boundaries changed. Add or update tests when a fix changes behavior that existing tests do not cover.

Repeat the suppression search and unused/stale checks after the fixes. Use the complete project graph for Fallow; changed-file reports or baselines that hide findings cannot prove a suppression is dead. Check warnings as well as errors. Fix failures caused by this work and repeat the affected checks.

**Done when:** the final search agrees with the inventory, each retained rule has a reason, and required checks pass or have a documented blocker. For each blocker, record the command, error, whether it existed before the edits, and what remains unverified. A blocked check stays unverified.

## 5. Report

Report the scope, dead suppressions removed, violations fixed, and validation results. List each retained suppression with its file location, rule, concrete reason, and required next change. Separate exclusions and blocked checks from completed work. Leave changes uncommitted unless the user requests a commit.
