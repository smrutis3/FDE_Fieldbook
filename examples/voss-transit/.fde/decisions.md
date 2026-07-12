# Decisions and plan

## Plan (ship phase, revised 2026-06-18)

1. ~~Shadow-read CAD/AVL → staging, score vs radio log~~ shipped 2026-06-22
2. ~~Delay board over the reconciled table, Depot B only~~ shipped 2026-07-03 (canary)
3. ~~Rollback drill under 10 min~~ done 2026-07-06 (6 min 40s)
4. Depot A expansion - proposed Thursday 2026-07-09
5. Public rider surface - KILL until both depots hold and comms has a named owner

Verification per slice: stop-arrival match vs radio. No match, no next depot.

## Decision log

### [2026-06-18] Re-scope: ops board before rider app
- Context: reality.md confirmed the radio log is the system of record
- Options considered: (a) rider app over raw CAD as briefed, (b) ops board first, (c) replace the CAD vendor
- Decision: (b). Rider app parked.
- Rationale: (a) is the 2024 failure mode; (c) is a procurement, not an 8-week embed
- Owner: Marisol Voss

### [2026-07-03] Canary Depot B only
- Context: staging match hit 94% then 96% the week of 2026-06-29
- Decision: flip the board at Depot B; Depot A stays on the log
- Rationale: one floor champion, one rollback path, one vendor
- Owner: Marisol Voss + Depot B supervisor

### [2026-07-06] Rollback is a paper procedure, not a ticket
- Context: Leon would not expand without a timed revert
- Decision: printed one-page runbook at the Depot B board; drill timed at 6 min 40s
- Rationale: night supervisor cannot open Jira mid-peak
- Owner: Leon Pruitt
