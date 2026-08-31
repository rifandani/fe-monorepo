# Settlement rubric

Assign **apply** when the bot identifies a real defect, spec miss, or standards violation the repo actually enforces — and its suggested fix is sound or easily adapted.

Assign **partial** when the concern is real but the bot misread the code, over-scoped the fix, or proposed something that breaks conventions. Implement the underlying fix your way.

Assign **reject** when:

- The bot misread the diff or commented on code that doesn't exist on this branch
- The flagged pattern is intentional and documented (ADR, comment, established convention)
- Tooling already enforces the rule (linter, typechecker, formatter)
- The suggestion is stylistic and the repo has no standard for it
- The bot assumes behaviour the spec doesn't require

A reject resting on "this is intentional" while no ADR, doc, comment, or lint rule says so is the bot's cue to raise it again next MR. Mark it undocumented — step 6 turns it into a rule.

Assign **defer** when the concern is valid but fixing it belongs in a follow-up (different layer, pre-existing debt, scope the MR never claimed).

Assign **ask** only when the trade-off is genuinely yours — architectural direction, product call, ambiguous spec — not when more reading would settle it.

When two threads contradict each other, settle both explicitly and pick one direction with rationale.

Each **partial**, **reject**, or **defer** settlement needs a reply on the MR before the thread is resolved — state the reason, not just the label.
