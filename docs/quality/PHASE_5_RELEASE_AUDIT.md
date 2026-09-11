# Phase 5 release audit

Date: 2026-09-11  
Scope: Phase 1–4 product contracts, production-like build, selected public
surfaces, linked Supabase project, and release CI. No data migration or remote
configuration was applied during this audit.

## Correctness and testing

| Check | Evidence | Result |
| --- | --- | --- |
| Type safety | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass; 84 pre-existing warnings, no new warnings introduced by this work |
| Unit suite | `npm test` | Pass |
| Data quality | `npm run check:data` | Pass: 120 source records, 6 required categories, 20 countries |
| Production build | `npm run build` | Pass |
| Whitespace | `git diff --check` | Pass |
| Dependency production audit | `npm audit --omit=dev --audit-level=high` | Pass |
| Critical E2E | `npm run test:e2e:critical` | Pass: 45 passed, 3 intentional responsive-matrix skips; production build served with `next start` |

The focused E2E suite covers Careers search to canonical Career evidence,
Career Compare, Country-aware discovery, and the existing verified
Program→Institution relationship. It also checks valid/missing Career status,
invalid country, legacy redirect, malformed Compare recovery, canonical and
description metadata, security headers, no unexpected browser console/page
errors, and page-level horizontal overflow.

## Browser and responsive evidence

| Surface | Browser coverage | Result |
| --- | --- | --- |
| Critical journeys and HTTP/metadata | Chromium desktop, Firefox desktop, WebKit desktop, mobile Chromium (iPhone 13 profile) | Pass |
| Automated accessibility | Same four configurations | Pass |
| Responsive overflow matrix | Chromium at 360, 390, 768, 1024, 1280, and 1440 px | Pass; homepage, Careers, Career, Country, Program, Institution, and Compare checked |

Mobile Compare uses its existing contained comparison surface; the test rejects
document-level horizontal overflow. Manual keyboard, zoom, screen-reader,
touch-target, and reduced-motion evidence remains an open P1 release action;
see [RELEASE_BLOCKERS.md](RELEASE_BLOCKERS.md).

## Accessibility

`@axe-core/playwright` scanned `main` using WCAG 2.0/2.1/2.2 A and AA tags on:

- `/careers`
- `/career/australia/registered-nurse`
- `/countries/au`
- `/programs/au/1-bachelor-of-arts`
- `/institutions/au/australian-catholic-university`
- the Career Compare context
- `/sources`

All scans were free of violations. The review corrected two footer labels that
were incorrectly headings and fixed sampled low-contrast text in Country,
Program, Institution, and Sources shared surfaces. Automated scans remain a
partial check, not proof of complete WCAG 2.2 AA conformance.

## Performance baseline

Measurements use local `next build` + `next start` with Lighthouse 13.4.1 and
headless Chrome. They are synthetic lab observations, not field Core Web
Vitals. `INP` and production `TTFB` need field telemetry after launch.

| Route | Performance | Accessibility | Best Practices | SEO | LCP |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 91 | 98 | 100 | 100 | 3.47 s |
| `/careers` | 82 | 98 | 100 | 66* | 4.88 s |
| `/career/australia/registered-nurse` | 90 | 100 | 100 | 100 | 3.62 s |
| `/countries/au` | 82 | 100 | 100 | 100 | 4.95 s |
| `/programs/au/1-bachelor-of-arts` | 91 | 100 | 100 | 91† | 3.46 s |
| `/institutions/au/australian-catholic-university` | 87 | 100 | 100 | 100 | 4.06 s |
| `/sources` | 91 | 100 | 100 | 100 | 3.46 s |

\* Careers is intentionally `noindex, follow` because it is a dynamic
discovery/filter surface, so Lighthouse’s crawlability deduction is expected.

† The HTML and E2E test confirm the Program description includes course type,
institution, and location. Lighthouse reported a description issue despite the
rendered meta tag, so it is not treated as missing metadata.

The LCP target is at most 2.5 s, so the sampled baseline is a P1 performance
item. No broad rendering rewrite was made simply to optimise a lab score.

## SEO, canonical, and sitemap audit

- Canonical Career identity remains `country_code + career_id`, rendered as
  `/career/{country-slug}/{career-id}`.
- Canonical Career requests return 200; missing careers and invalid countries
  return 404; the legacy Career alias returns its 308 canonical redirect.
- The Careers and Compare query-state surfaces remain non-indexable.
- Sitemap audit found no duplicate URLs. The resulting sitemap has 2,154 URLs,
  including 11 canonical Career entries and no state occupation context URLs.
- The 40 valid Australian state occupation pages remain available as contextual
  evidence, explicitly `noindex, follow`, and are absent from the sitemap.
- `robots.txt` allows public product routes, blocks API/auth/account and retired
  surfaces, and declares the primary, blog, and Canadian program sitemaps.

This change avoids a second indexable Career surface without deleting useful
state-level demand evidence.

## Data integrity and provenance

`npm run check:data` passed with the existing catalogue gate: 120 source
records cover all 6 required categories across 20 countries. This review did
not change score calculation, publication readiness, source selection, or
missing-data semantics. The Career read model continues to expose source-aware
missing values rather than manufacturing salary, demand, mapping, readiness,
or score inputs.

## Security and privacy

- CI preserves dependency audit and Git history secret scan; the production
  dependency audit passed at the High threshold. It still reports one Moderate
  `baseline-browser-mapping` denial-of-service advisory, tracked as P2 rather
  than hidden.
- Public responses now include `nosniff`, strict-origin referrer policy, and a
  restrictive camera/microphone/geolocation permissions policy.
- Institution rendering no longer requests external favicon URLs, avoiding the
  observed third-party browser-state cookie before a visitor opens a source.
- Supabase Advisor classification: 128 `rls_enabled_no_policy` informational
  findings on intentionally internal/deny-by-default tables, 25 unindexed
  foreign-key informational findings, 83 unused-index informational findings,
  and one `auth_leaked_password_protection` warning.
- No remote database or Auth configuration was mutated in this review.

The unresolved migration history and raw-Career privilege boundary are P0 and
are detailed in [RELEASE_BLOCKERS.md](RELEASE_BLOCKERS.md).

## Reliability

Critical routes have explicit valid, missing, redirect, and unsupported-state
coverage. A malformed Compare query returns a recoverable “Comparison not
available” surface rather than an empty successful page. The E2E helper fails
on unexpected page errors and browser console errors; no such browser errors
were observed. During parallel E2E navigation, `next start` logged `The
destination stream closed early`; it did not fail a request or assertion and is
tracked as P2 for production reproduction.

## Known blockers and deferred work

Open P0/P1/P2/P3 items, owners, and exit conditions are maintained in
[RELEASE_BLOCKERS.md](RELEASE_BLOCKERS.md). The P0 migration history drift and
unapplied P0.5 raw-Career privilege migration prevent a public Phase 6 launch.
This review deliberately did not rewrite migration history, apply DDL, change
raw-Career policies, or remove the required `42501 → anon` compatibility
fallback.

## Decision

**NOT READY FOR PHASE 6.** Application quality gates pass, but the unresolved
P0 migration/privilege boundary and listed P1 launch conditions remain open.
