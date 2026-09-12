# Observability and incident operation

## Current verified capability

- **Application/runtime errors:** Vercel deployment/runtime logs and structured
  application error logs. Review without copying user-submitted feedback,
  emails, credentials, tokens or service-role values into tickets.
- **Product measurement:** consent-gated Vercel Analytics plus optional GA4.
- **Performance:** consent-gated Vercel Speed Insights and existing Phase 5
  performance audits.
- **Build/release failures:** repository CI and the established Phase 5 gates.
- **Database/data distinction:** Supabase/server errors are reviewed alongside
  source-run and publication records; direct service-role errors stay server
  logs only.

No additional error-monitoring vendor is introduced in Phase 6. A health
endpoint was not added: no existing monitor requires it, and a shallow route
would not prove data or database readiness.

## Triage

1. Classify as availability, data/evidence, canonical/SEO, measurement,
   performance, accessibility, security or deployment.
2. Preserve non-sensitive route, timestamp, deployment and request context.
3. For a data/evidence issue, remove affected publication/score visibility when
   required by existing readiness rules; do not replace missing evidence with
   zero or a guess.
4. For a release incident, use `release-and-recovery.md`; rollback data through
   immutable versions, never mutate history in place.
5. Record owner, severity, customer effect and verification before close.

## Backup status

The repository documents the isolated quarterly Supabase restore drill in
`release-and-recovery.md`. Backup/PITR availability, retention and current
recovery point must be confirmed in the production Supabase dashboard by the
owner before Stable Public Launch. This repository does not claim that external
dashboard confirmation has occurred.
