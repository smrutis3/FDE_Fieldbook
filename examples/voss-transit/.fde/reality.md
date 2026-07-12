# Reality (actual problem)

**Confirmed:** Depot B (and A) run the floor from a paper radio log. The CAD/AVL feed is 4-12 minutes behind what the radio already knows. A rider app over the raw feed would publish times ops already know are stale.

**Evidence:**
- 2026-06-04 depot shadow: supervisor answered "where's the 14?" by flipping the log, not the vendor console. Verbatim: "the feed is for the website. the log is how we run."
- Sampled 2026-06-11, afternoon peak, 80 stop-arrivals: raw feed matched radio within 2 min on 49/80 (61%). Late buses were the misses.
- 2024 NextBus refresh died after comms refused to put the vendor ETA on the public site (Leon, 2026-06-05).

**Differs from brief how:** brief buys a rider-facing app. The constraint is an ops board that matches the radio, then a public surface.

**Implication for build:** reconcile feed vs radio first, Depot B canary, then talk public. Agreed with Marisol 2026-06-18 (see decisions.md).
