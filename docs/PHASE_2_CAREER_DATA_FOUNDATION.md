# Phase 2 — Career Data Foundation

## Canonical identity

A Career is the product decision object. Its stable identity is:

```text
country_code + career_id
```

`career_id` is selected from the 80-item `CANONICAL_CAREERS` catalogue. Labels,
translations, aliases, and official occupation codes describe that identity; they
do not replace it. Database adapters may continue to read
`canonical_occupation_id`, but no product-facing read model exposes that name.

## Source-of-truth hierarchy

```text
CANONICAL_CAREERS
  → Career catalogue boundary
  → Career Data Foundation
  → CareerProfile
  → /careers and /career/{country}/{career-id}
```

`CAREER_CATALOGUE` is the application boundary for list, search, category, and
route identity. The existing `career-data-foundation` read is the preferred
country-level evidence source. It provides official occupation mapping, pay,
demand, CampCareer Score readiness, blockers, sources, and related entry points.

## Legacy fallback policy

The existing `country_occupation_*` reads remain available where Foundation
coverage does not yet provide a ready public Career profile. This is an explicit
fallback, never a second Career identity:

- `career_data_foundation` — Foundation evidence passed the existing public
  readiness and coverage gates.
- `legacy_country_occupation` — reviewed country-occupation data supplies the
  current Career profile while Foundation coverage is absent.
- `editorial_only` — neither source provides a public-ready country profile, or
  a Foundation record exists but has not passed its publication gate.

`CareerProfile.dataSource` exposes the selected source, whether legacy fallback
is active, and whether a Foundation candidate exists but was not selected by the
public gate. Missing evidence stays `null` or unavailable; no score, pay,
demand, mapping, readiness, or visa eligibility is inferred.

## Public naming conventions

Product boundaries use `Career`, `careerId`, and `CareerProfile`. Internal
database row names and compatibility types may retain `occupation` where they
match existing Supabase columns or the preserved fallback implementation.

`CareerProfile.compatibility` is a temporary, explicitly named adapter for the
existing Career Page components. New reads use the Career-named fields on
`CareerProfile` directly.

## Publication and readiness

The existing publication rules remain authoritative. A public CampCareer Score
requires the explicit coverage gate, decision readiness, score readiness,
publication readiness, a valid CampCareer Score, and strict evidence coverage.
A valid route can therefore render with `noindex` and without a score while its
evidence is incomplete.

## Phase 2 boundaries

Phase 2 reuses current Supabase tables, views, routes, and the 80-career
catalogue. It adds no migration, authentication, payment, job ingestion,
graduate-programme ingestion, SEO migration, country or visa rewrite, or route
renaming. Legacy country-occupation data is retained until Foundation coverage
can replace it under the publication gate.
