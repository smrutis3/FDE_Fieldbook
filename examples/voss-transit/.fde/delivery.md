# Delivery log

## Shipped

### [2026-06-22] CAD/AVL shadow-read (staging)
- Vendor SOAP → staging every 30s. Stop-arrivals scored against the radio log sample.
- Value: first measured number. Raw feed 61% match; staging reconcilers started climbing the same week.

### [2026-07-03] Depot B delay-board canary
- Board reads the reconciled table. Feature flag `depot-b-canary`. Afternoon peak run without the paper log as primary.
- Value: supervisor's words - "I looked at the log twice. I didn't need it."

### [2026-07-06] Rollback drill
- Flag off, board back to "use the log" card, radio desk briefed. 6 min 40s.
- Value: Leon's expand condition met. Receipt in decisions.md.

## Running value

- Stop-arrival match vs radio: 61% on the raw feed (2026-06-11) → 97.2% on the canary table over 4 days (as of 2026-07-07).
- Radio log still filled as backup; not retired.
