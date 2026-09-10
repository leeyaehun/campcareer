# AU Nursing minimal canonical gap closure (2026-08-02)

This is a read-only candidate package for the three existing Programs Compare products:

- `qut-bachelor-nursing`
- `unisc-bachelor-nursing-science`
- `unisc-graduate-entry-nursing-science`

The canonical read model was resolved from the private `api_private.au_nursing_programme_catalog_v1` and its fees, requirements, and accreditations views. The package records the exact canonical programme/offering UUIDs and existing evidence snapshot IDs. No UUID was generated, no fuzzy match was used, and no production insert/update/delete or migration was performed.

Current result: **B — Partial Candidate Package**. Identity, international offering, current 2026 annual tuition, duration, location, and entry requirements are available. Professional outcome and accreditation remain null because the queried accreditation rows have no `evidence_id` and require review. Mandatory study costs and estimated total tuition are not inferred.

The existing UI fixture and Programs Compare screen are intentionally unchanged. This package is not a replacement data source and is not imported by runtime code.

## Lineage

`sources.jsonl` identifies provider pages; `source_snapshots.jsonl` preserves the existing canonical `content_sha256` values and retrieval timestamps (the hashes are copied from the read-only database and were not recomputed from a downloaded page); `metric_observations.jsonl` carries value-level observation IDs and snapshot links; `programme_candidate_updates.jsonl` is the normalized candidate read model. `conflict_register.json` records excluded undated legacy fee observations and the accreditation evidence gate.

## Validation

The package is validated by `tests/data-foundation/au-nursing-minimal-gap-closure.test.ts`. `SHA256SUMS.txt` covers every file in this directory except itself, and the documentation memo records the production read-only audit boundary.
