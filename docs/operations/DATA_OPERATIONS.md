# Data operations registry and correction process

This document is the operational index for existing data controls. It does not
create a second ingestion framework.

| Area | Authoritative mechanism | Owner/check | Freshness/review trigger |
| --- | --- | --- | --- |
| Career source snapshots | existing source/evidence records and Career publication gate | data reviewer | source cadence or material policy/data change |
| AU source refreshes | `scripts/record-au-source-runs.ts` → `data_source_runs` | import operator | official source release; record checksum, source, retrieval time and status |
| Canonical candidate ingestion | `scripts/data-foundation/common-ingestion/` manifests, package/validation reports | data operator + reviewer | before controlled import; reject/blocked records stay outside production publish |
| Publication/readiness | existing Career coverage and score contracts | product/data owner | before any Career/country is public |
| Recovery | `docs/operations/release-and-recovery.md` | release owner | incident or failed data release |

For each material refresh, record source/version, retrieval date, last successful
import, changed/rejected record counts, reviewer, next expected review and
whether the public effect is **Corrected**, **Updated** or **Source changed**.
The source/run record is the authoritative execution evidence; this registry
only points operators to it.

## Safe update sequence

1. Collect an immutable candidate and record checksum/source provenance.
2. Validate in a non-production environment. Unknown values remain null and
   blocked or review-required records never publish.
3. Review changed/rejected counts and deterministic product output.
4. Publish atomically using the established deployment/data workflow, retaining
   the prior version for rollback.
5. Re-check representative evidence links and public readiness gates.
6. Review anonymous data issues; do not silently alter consequential public
   data without a traceable source/change record.

There is intentionally no scheduler added in Phase 6. Existing imports are
operated manually until observed demand and source cadence justify automation.
