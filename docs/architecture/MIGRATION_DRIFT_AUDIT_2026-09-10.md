# Migration drift audit — 2026-09-10

## Scope

Compared repository migration filenames with the linked CampCareer Supabase
project (`babylusxcknjerxtepoc`) migration history, then ran the normal
`supabase db push --dry-run` workflow using the configured server-only database
connection.

## Result

| Check | Result |
| --- | --- |
| Repository migration versions | 759 |
| Deployed migration versions | 813 |
| Repository-only versions | 230 |
| Deployed-only versions | 296 |
| P0.5 `20260907101500_p0_5_private_raw_career_data` | repository-only; not deployed |

The dry run correctly refused to push because remote history contains versions
that are absent from this checkout. No migration repair, history rewrite,
manual DDL, or direct privilege change was attempted.

## Reconciliation update — 2026-09-11

On `prelaunch/release-blockers`, the migration directory was reconciled to
the deployed production lineage without modifying the production migration
history table:

| Check | Result |
| --- | --- |
| Production migration rows | 813 |
| Canonical production migration paths present in branch | 813 / 813 |
| Additional pending migrations | 1 — `20260907101500_p0_5_private_raw_career_data.sql` |
| Missing production migration paths | 0 |
| Non-P0.5 extra migration paths | 0 |
| Duplicate migration versions in branch | 0 |
| Total migration files in branch | 814 |

Production history rows were reconstructed using the current Supabase
`migration fetch` contract: `<version>_<name>.sql`, with stored
`statements` joined by `;
` and a trailing separator. Git history retains
the superseded local filenames and timestamp variants.

This establishes the intended local version/name lineage: production's 813
applied versions plus exactly one pending P0.5 migration. An actual linked CLI
`supabase db push --dry-run` is still required before deployment; this
reconciliation does not claim that command has run.

The P0.5 SQL was also executed against production inside an explicit
transaction with assertions for all six raw Career tables, then rolled back.
Inside the transaction, `service_role` SELECT was present, browser-role SELECT
was absent, and browser SELECT policies were absent. After rollback,
production was rechecked and remained unchanged: P0.5 is absent from migration
history, all six tables still expose the temporary anon/authenticated SELECT
contract, and no explicit service-role SELECT grant has been committed.

## P0.5 status

The existing P0.5 migration is internally consistent with its target state:
it grants `service_role` SELECT for the six raw country-occupation tables,
drops their public-read policies, and revokes `PUBLIC`, `anon`, and
`authenticated` privileges. Before the migration, the deployed tables had RLS
enabled but public SELECT policies/grants, while `service_role` had no explicit
SELECT grant. The deployed application already tries its server-only
service-role read first and falls back only on `42501`.

It is deliberately **not applied** in this phase. Applying it outside the
normal migration workflow would create another divergent history record. The
temporary fallback remains until the history is reconciled.

## Resolution path

1. Identify the approved repository lineage containing the deployed-only
   migrations and reconcile it through normal Git integration; do not mark
   versions repaired solely to unblock a push.
2. Re-run `supabase db push --dry-run` until it identifies only the intended
   P0.5 migration.
3. Apply the existing P0.5 file through `supabase db push`, preserving its
   `20260907101500` version.
4. Verify migration history, service-role SELECT, anon/authenticated denial,
   canonical Career routes, Career API/read-model output, and fallback
   semantics.
5. Remove the `42501` anon fallback in a focused follow-up only after those
   checks pass.

This report is a reconciliation blocker, not evidence that either history
should be rewritten or that data should be deleted.
