# ADR-002: Consent-gated launch measurement and trust operations

Date: 2026-09-11  
Status: Accepted for Phase 6

## Context

CampCareer has a public Career-first decision flow, existing Vercel Analytics/
Speed Insights consent controls, a service-managed feedback table, canonical
URLs and evidence/readiness gates. The launch needs comparable decision signals
and correction operations without turning the product into an account-first
dashboard, a surveillance system or a second data pipeline.

## Decision

Keep Career as the primary decision object and retain the existing
Supabase/PostgreSQL and publication architecture. Mount GA4 only inside the
current affirmative consent boundary, using an optional build-time environment
ID. Send product events only through the typed analytics boundary. Use Decision
Sessions — Compare view, or three unique meaningful entity views across two
types — as the initial north-star metric, once per consented browser session.

Reuse the existing service-managed feedback endpoint/table. Add bounded
query-free page/entity context and server-owned review status with an additive
migration. Keep a public Data policy, Sources and Methodology rather than a
public per-row changelog. Operate data through existing source/run and
ingestion controls, with documentation that identifies external verification
rather than claiming it.

## Consequences

Measurement is optional and no login/cross-device identifier is created.
Historical event names and canonical URLs must not change casually. Feedback
is anonymous where useful but has input limits, server validation and no
browser authority to set review status. GA/Search Console/backup dashboard
configuration remains an external owner task. No full redesign is allowed for
90 days after Stable Public Launch; measured improvements remain allowed.
