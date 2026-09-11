# Migration drift audit — 2026-09-10

## Scope

Compared repository migration filenames with the linked CampCareer Supabase
project (`babylusxcknjerxtepoc`) migration history. The original Phase 4/5
audit found a divergent local lineage and deliberately avoided production
history repair or direct privilege changes.

## Original result

| Check | Result |
| --- | --- |
| Repository migration versions | 759 |
| Deployed migration versions | 813 |
| Repository-only versions | 230 |
| Deployed-only versions | 296 |
| P0.5 `20260907101500_p0_5_private_raw_career_data` | repository-only; not deployed |

The earlier linked dry run correctly refused to push because remote history
contained versions absent from the checkout.

## Reconciliation completed — 2026-09-11

On `prelaunch/release-blockers`, the migration directory was reconciled to
the deployed production lineage without deleting or rewriting existing
production migration history.

Immediately before P0.5 application:

| Check | Result |
| --- | --- |
| Production migration rows | 813 |
| Canonical production migration paths present in branch | 813 / 813 |
| Additional pending migrations | 1 — `20260907101500_p0_5_private_raw_career_data.sql` |
| Missing production migration paths | 0 |
| Non-P0.5 extra migration paths | 0 |
| Duplicate migration versions in branch | 0 |
| Total migration files in branch | 814 |

The final comparison used the same migration identity that Supabase documents
for `migration list` / `db push`: migration timestamps, with names also
checked as an additional guard. The connected execution environment does not
expose a linked local Supabase CLI, so the post-reconciliation verification
was performed by comparing the GitHub migration tree directly with
`supabase_migrations.schema_migrations`.

## P0.5 applied — 2026-09-11

The exact SQL from
`20260907101500_p0_5_private_raw_career_data.sql` was applied to production
inside one explicit transaction. The transaction asserted the intended
privilege boundary before recording the migration history row with the exact
version `20260907101500`, name `p0_5_private_raw_career_data`, and migration
statements.

This preserved the intended migration identity rather than generating a new
timestamp.

Post-application verification:

| Check | Result |
| --- | --- |
| Production migration rows | 814 |
| Branch migration files | 814 |
| Branch-only migrations | 0 |
| Production-only migrations | 0 |
| P0.5 history rows | 1 |
| `service_role` SELECT on all six raw Career tables | yes |
| `anon` SELECT on all six raw Career tables | no |
| `authenticated` SELECT on all six raw Career tables | no |
| Browser SELECT policies on all six raw Career tables | 0 |

A real `service_role` role read also succeeded across all six raw Career
tables. Supabase Security Advisor now reports those six tables as
`RLS enabled, no policy`, which is expected for this server-only boundary.

## Application follow-up

The application-side `42501 → anon` compatibility fallback has been removed
from `src/lib/workspace/raw-career-data.ts` on
`prelaunch/release-blockers`. Raw Career reads now use `supabaseAdmin`
only, and the P0.5 contract test rejects reintroduction of the anon fallback.

## P0 status

**CLOSED.** Repository and production migration histories converge at 814
migrations, P0.5 is applied under its intended version, the raw Career tables
are server-role-only, and the temporary browser fallback has been retired.
