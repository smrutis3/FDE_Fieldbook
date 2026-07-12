# Brief (stated problem)

**Stated problem:** "Adjusters drown in first-notice noise. Build an AI claims summarizer - one page per FNOL, ready before the desk opens." (Priya Osborn, VP Claims, kickoff 2026-06-19)
**Timeline:** 10-week pilot. Board wants an August demo. One line of business first (auto).
**Named decision-maker:** Priya Osborn (VP Claims, sponsor). SIU (special investigations) holds a quiet veto on anything that touches fraud notes.
**Gaps in the brief (questions to answer):**

- Where does a first notice actually arrive? → answered 2026-06-22: shared mailbox, then AS400, then Guidewire
- What is allowed to touch a model? Claim notes include medical and financial data. → policy unsigned, see trust-profile.md
- Previous 2025 "smart FNOL" vendor POC - who killed it? → Walt: "it summarized the wrong system"
- August demo: whose calendar, what "one page" means

**Hypothesis (falsifiable):** the summarizer ask is a proxy - notices never enter Guidewire cleanly, so a model over Guidewire summarizes a hole. → confirmed 2026-07-01, see reality.md.
