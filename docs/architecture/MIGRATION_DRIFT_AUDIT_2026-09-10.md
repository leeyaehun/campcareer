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
