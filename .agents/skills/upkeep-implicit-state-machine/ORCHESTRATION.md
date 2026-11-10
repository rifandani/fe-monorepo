# Agent orchestration

Use parallel work where the file ownership and dependencies permit it. The parent owns the coverage list, shared decisions, integration, and final validation. Workers perform their assigned work without starting more agents.

## Discovery

After mapping the source areas, assign independent areas to read-only discovery workers. Give each worker its source scope, applicable instructions, this skill, and the required inventory fields from step 1. Each worker must read the source and trace related state owners and callers, including references outside its assigned area. It returns findings and dependencies without edits.

The parent combines the results, removes duplicate flow entries, and resolves ownership across areas. Keep a flow and its shared consumers in one implementation group even when discovery found them in different apps. Record an uninspected area as a coverage gap.

**Done when:** each assigned area has a returned inventory or a specific blocker, and every candidate has one owner in the combined inventory.

## Implementation

Partition selected work by independent state owner and contract. Keep coupled transitions, affected callers, adapters, and tests together. The parent handles shared configuration and contracts across groups. Complete a shared contract change before starting dependent groups, or give the contract and all consumers to one worker.

Use the available orchestration tool's worktree isolation for editing workers. Follow the host tool's checkout and delegation rules. Each worker must start from the same recorded revision plus the current task changes it needs. Verify that starting state before edits. Give each worker separate output locations and ports where needed. If isolated checkouts are unavailable, keep discovery parallel and serialize edits in the shared checkout.

Give each worker:

- Its explicit editable file list, assigned flows, relevant discovery results, and known dependencies.
- Applicable repo guidance, baseline failures, and validation commands.
- The requirement to model and assess its flows in step 2, implement supported improvements in step 3, and run the affected checks from step 4.
- The requirement to return an out-of-scope dependency to the parent for reassignment before editing that file.

Assign each editable file to one worker. If files or contracts overlap, combine or sequence those tasks. Keep the number of workers within available capacity; group short tasks when setup and integration would cost more than parallel work saves.

Each worker returns its inspected areas, flow models and decisions, changed files, UX/DX/AX evidence, checks and results, retained or deferred findings, and unresolved dependencies. Keep worker changes uncommitted unless the user has requested commits.

**Done when:** every assigned flow has a returned decision and verification result or a specific blocker, and no worker has an unresolved editing dependency.

## Integration

Review each worker's diff against its assigned model, public contracts, and required benefits. Bring the changes into the parent checkout through supported patch or integration operations. Preserve existing user changes. Resolve dependent contracts and conflicts before treating a worker result as complete.

Reconcile all worker results with the coverage list and inventory. Run step 4 against the combined result, including paths that cross worker boundaries. A passing worker check cannot establish that the integrated apps work together.

**Done when:** all worker changes are combined or explicitly deferred, every inventory entry has a final status, and combined validation has passed or has a documented blocker.
