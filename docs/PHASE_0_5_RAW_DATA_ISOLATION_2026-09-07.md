# Phase 0.5 — raw Career-data isolation

## Decision

The owner has confirmed that the reviewed Career data may continue to inform
the public product. That does not make the underlying legacy snapshots a
public API: they include internal component scores and unshaped source
evidence that can bypass the Career publication gate.

`country_occupation_*` is therefore an internal read model. Public visitors
receive the canonical Career Page or its explicitly scrubbed API response,
not direct Supabase REST access to the raw tables.

## Implementation

- The server-only country profile, Career market and legacy overview readers
  route all `country_occupation_*` queries through a controlled server-side
  gateway. It uses the service role first and falls back only on the precise
  missing-service-role-grant error during the deployment handoff.
- The migration
  `20260907101500_p0_5_private_raw_career_data.sql` removes the six existing
  anon/authenticated RLS policies and all browser-role table grants.
- The canonical Career Page remains the sole public surface that can show a
  CampCareer Score; the legacy occupation endpoint continues to return score
  fields as `null`.

## Required release order

1. Deploy the application commit containing the server-only reads. The
   temporary server-side fallback keeps this step compatible with the old
   grants; it is not available in a browser bundle.
2. Apply `20260907101500_p0_5_private_raw_career_data.sql` in the linked
   Supabase project.
3. Verify with the anon key that a select on
   `country_occupation_metric_snapshots` receives `401` or `403`.
4. Verify an indexed, Ready canonical Career route still returns `200` and
   contains only its approved public score/evidence representation.

The local Supabase CLI cannot apply this migration yet because its linked
database migration-history login is denied (`403`) and no database password
is configured. No schema change was attempted through an unknown or unsafe
alternate channel.
