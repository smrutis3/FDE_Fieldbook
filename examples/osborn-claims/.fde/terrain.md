# Terrain (codebase map)

**Access:** read-only on `osborn-fnol-adapters` (2017 Java, talks to Guidewire ClaimCenter). No AS400 access. No mailbox admin. `fde scan` 2026-06-23 on the adapter repo only.

**Stack (partial):** Guidewire ClaimCenter (version unconfirmed) + AS400 green-screen (2009 FNOL note) + shared Outlook. Adapter: Java 8, Jenkins, weekly.

**Business map (plan+):**

| Flow | System | Owner | Notes |
|------|--------|-------|-------|
| First notice in | `fnol-auto@` mailbox | Walt's desk | System of record for "new today" |
| One-line parking | AS400 note | Walt (password in notebook) | 13 of 41 Monday notices stopped here |
| Accepted claim | Guidewire | unnamed admin | 28 of 41 Monday notices |
| "Smart FNOL" 2025 | vendor SaaS | killed | Summarized Guidewire only |

**Hotspots (handle with care):**

- `FnolPushJob.java` - 22 commits/90d, no tests. Retries by rewriting the same Guidewire note.
- AS400 screen is undocumented. Do not "just script it."

**Test gaps:** zero tests in the adapter repo at scan (2026-06-23). No characterisation until Priya unlocks a sandbox.

**Landmines:**

- Mailbox bodies are claim content. A helpful local script is a leak.
- SIU notes can appear on the same Guidewire claim as FNOL. One wrong join is a veto.
