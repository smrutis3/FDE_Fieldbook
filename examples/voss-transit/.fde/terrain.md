# Terrain (codebase map)

**Repo:** `voss-cad-board` - Node 18 service + a 2016 PHP "public ETA" page nobody deploys. First commit 2016. Day-1 recon 2026-06-03.

**Stack:** JS + a vendor SOAP CAD/AVL adapter. Postgres 12. Deploys: their Jenkins, Leon-owned.

**Business map (plan+):**

| Flow | System | Owner | Notes |
|------|--------|-------|-------|
| Vehicle position | CAD/AVL SOAP | vendor + Leon | 4-12 min stale vs radio; sampled 2026-06-11 |
| Floor truth | paper radio log | Depot B supervisor | System of record for late buses |
| Public ETA page | PHP, undeployed | comms (historical) | 2024 stall; do not resurrect |

**Hotspots (handle with care):**

- `src/cad/soap-adapter.js` - vendor schema drift; no fixture older than 2023
- `scripts/eta-publish.php` - dead; comms still have the URL in a wiki

**Test gaps:** characterisation tests on the SOAP parser added 2026-06-20 before the shadow-read. Rollback path tested 2026-07-06 (drill).

**Landmines:**

- Vendor Friday patch window - do not redeploy 2026-07-10
- Union timekeeping export sits next to CAD credentials in `config/ops.yml` - keep out of prompts
