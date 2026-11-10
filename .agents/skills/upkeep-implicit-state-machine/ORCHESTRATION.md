# Agent orchestration

Use subagents in the shared checkout where file ownership and dependencies permit parallel work. Do not create worktrees or separate checkouts. The parent owns the coverage list, shared decisions, integration, and final validation. Workers perform their assigned work without starting more agents.

## Discovery

After mapping the source areas, assign independent areas to read-only discovery workers. Give each worker its source scope, applicable instructions, this skill, and the required inventory fields from step 1. Each worker must read the source and trace related state owners and callers, including references outside its assigned area. It returns findings and dependencies without edits.

The parent combines the results, removes duplicate flow entries, and resolves ownership across areas. Keep a flow and its shared consumers in one implementation group even when discovery found them in different apps. Record an uninspected area as a coverage gap.

**Done when:** each assigned area has a returned inventory or a specific blocker, and every candidate has one owner in the combined inventory.

## Implementation

Partition selected work by independent state owner and contract. Keep coupled transitions, affected callers, adapters, and tests together. The parent handles shared configuration and contracts across groups. Complete a shared contract change before starting dependent groups, or give the contract and all consumers to one worker.

Use the available native subagent tool. Tell each worker that edits are immediately visible to the other agents. Each worker edits only its assigned files and preserves changes made by the user and other agents. The parent also respects active file assignments. Sequence work when one task reads a contract that another task changes. Give workers separate output locations and ports where needed; serialize checks that share mutable caches, fixtures, or output files.

Give each worker:

- Its explicit editable file list, assigned flows, relevant discovery results, and known dependencies.
- Applicable repo guidance, baseline failures, and validation commands.
- The requirement to model and assess its flows in step 2, implement supported improvements in step 3, and run the affected checks from step 4.
- The requirement to return an out-of-scope dependency to the parent for reassignment before editing that file.

Assign each editable file to one worker. If files or contracts overlap, combine or sequence those tasks. Keep the number of workers within available capacity; group short tasks when setup and integration would cost more than parallel work saves.

Each worker returns its inspected areas, flow models and decisions, changed files, UX/DX/AX evidence, checks and results, retained or deferred findings, and unresolved dependencies. Keep worker changes uncommitted unless the user has requested commits.

**Done when:** every assigned flow has a returned decision and verification result or a specific blocker, and no worker has an unresolved editing dependency.

## Integration

After workers finish, review their changes in the shared checkout against their assigned models, public contracts, and required benefits. Use their returned file lists to account for edits. Preserve existing user changes. Resolve dependent contracts and overlapping edits before treating a worker result as complete.

Reconcile all worker results with the coverage list and inventory. Run step 4 against the combined result, including paths that cross worker boundaries. A passing worker check cannot establish that the integrated apps work together.

**Done when:** all worker changes are combined or explicitly deferred, every inventory entry has a final status, and combined validation has passed or has a documented blocker.
