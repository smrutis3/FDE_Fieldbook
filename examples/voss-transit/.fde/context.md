# Engagement context

**Engagement:** voss-transit
**Customer:** Voss Transit Authority (fictional - municipal bus + light rail, 3 depots, ~220 vehicles)
**Phase:** ship
**Last updated:** 2026-07-07

## Current state

Week 6. Canary live on Depot B since 2026-07-03: delay board reads the reconciled CAD/AVL feed, not the radio log. 4 days at 97.2% stop-arrival match vs radio (was 61% against the raw feed). Rollback drill passed 2026-07-06. Trust green: Marisol rode the canary with the Depot B supervisor and asked to expand Thursday.

## Next action

Thursday 2026-07-09: Depot A expansion proposal to Marisol + Leon. Bring the rollback receipt and the 61% → 97.2% chart. Do not propose the rider-facing app.

## Notes for the next session

- Leon wants the rollback runbook printed at the Depot B board before Thursday - one page, his words.
- CAD vendor window is Friday 2026-07-10 (their patch). Canary stays on; do not redeploy that day.
- Government overlay: no PII from fare cards in any prompt. Badge reader logs stay out.

---

## Session log

## 2026-06-04 - session close
- Where we are: land done, brief interrogated. Marisol's "real-time rider app" is the stated ask.
- What changed: shadowed Depot B radio desk; the board they actually run is a paper radio log.
- Next step: sample the CAD/AVL feed against the log.

<!-- fdeops auto-capture -->
## Session end - 2026-06-04 17:18
- workspace: `main` @ 2c81aa0 chore: delay-board config snapshot
- engagement files updated: brief.md stakeholders.md reality.md

## 2026-06-18 - session close
- Where we are: discover closed. Raw CAD/AVL is 4-12 min stale vs radio.
- What changed: Marisol agreed to ship the ops board first; rider app parked (decisions.md).
- Next step: shadow-read feed → staging, prove stop-arrival match.

<!-- fdeops auto-capture -->
## Session end - 2026-06-18 18:02
- workspace: `feat/avl-shadow` @ 8e44b11 feat: staging table + feed sampler
- engagement files updated: reality.md success.md decisions.md

## 2026-07-03 - session close
- Where we are: Depot B canary live. First shift on the board without the paper log.
- What changed: supervisor ran the afternoon peak on the board; radio log used only as backup.
- Next step: rollback drill, then ask Marisol about Depot A.

<!-- fdeops auto-capture -->
## Session end - 2026-07-03 16:44
- workspace: `feat/depot-b-canary` @ c19f0e3 feat: canary flag + board read path
- engagement files updated: delivery.md risks.md context.md

## 2026-07-07 - session close
- Where we are: ship. Rollback drill passed. Stop-arrival 97.2% over 4 canary days.
- What changed: Marisol wants Depot A Thursday if Leon signs the runbook.
- Next step: one-pager rollback for Leon; Thursday expansion ask.

<!-- fdeops auto-capture -->
## Session end - 2026-07-07 17:11
- workspace: `feat/depot-b-canary` @ d4a22b8 docs: rollback drill notes
- engagement files updated: delivery.md stakeholders.md decisions.md context.md
