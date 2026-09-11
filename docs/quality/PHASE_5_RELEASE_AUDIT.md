# Phase 5 release audit

Date: 2026-09-11  
Scope: Phase 1–4 product contracts, production-like build, representative public
surfaces, production migration/privilege reconciliation, and release CI.

## Correctness and testing

| Check | Evidence | Result |
| --- | --- | --- |
| Type safety | CI #2084 · `npm run typecheck` | Pass |
| Lint | CI #2084 · `npm run lint` | Pass |
| Unit suite | CI #2084 · unit test step | Pass |
| Data quality | Last recorded `npm run check:data`: 120 source records, 6 required categories, 20 countries; performance/accessibility work did not alter the catalogue contract | Pass |
| Production build | CI #2084 · `npm run build` | Pass |
| Whitespace | CI #2084 · `git diff --check` | Pass |
| Dependency production audit | CI #2084 · `npm audit --omit=dev --audit-level=high` | Pass at the High threshold |
| Secret scan | CI #2084 | Pass |
| Critical E2E | CI #2084 · `npm run test:e2e:critical` against `next start` | Pass: 49 passed, 15 intentional project-specific skips |

The focused E2E suite covers Careers country selection/search to canonical
Career evidence, Career Compare, Country-aware discovery, and the verified
Program→Institution relationship. It also checks valid/missing Career status,
invalid country, legacy redirect, malformed Compare recovery, canonical and
description metadata, security headers, responsive overflow, and unexpected
browser console/page errors.

## Browser and responsive evidence

| Surface | Browser coverage | Result |
| --- | --- | --- |
| Critical journeys and HTTP/metadata | Chromium desktop, Firefox desktop, WebKit desktop, mobile Chromium | Pass |
| Automated accessibility | Same four configurations for representative axe scans; targeted keyboard/text-scale/reduced-motion/touch checks on their designated projects | Pass |
| Responsive overflow matrix | Chromium at 360, 390, 768, 1024, 1280, and 1440 px | Pass on homepage, Careers, Career, Country, Program, Institution, and Compare |

Manual accessibility sign-off is the remaining P1. Automated evidence and the
manual checklist are recorded in
[PHASE_5_ACCESSIBILITY_EVIDENCE.md](PHASE_5_ACCESSIBILITY_EVIDENCE.md).

## Accessibility

`@axe-core/playwright` scans `main` with WCAG 2.0/2.1/2.2 A/AA tags on:

- `/careers`
- `/career/australia/registered-nurse`
- `/countries/au`
- `/programs/au/1-bachelor-of-arts`
- `/institutions/au/australian-catholic-university`
- the Career Compare context
- `/sources`

The scans are clean. CI also passes targeted checks for visible keyboard focus,
200% text scaling, reduced-motion preference, and the WCAG 2.2 24×24 CSS px
minimum mobile target. These are automated risk controls, not a claim of full
WCAG conformance. Real screen-reader output, full keyboard interaction/focus
restoration, browser 200% zoom, larger product touch targets, and qualitative
reduced-motion behaviour remain to be signed off manually.

## Performance release audit

Performance audit #31 ran the production build on commit `4a9b3f60`. The hard
budget was LCP ≤ 2.5 s, CLS ≤ 0.10, and warm TTFB ≤ 800 ms. Every sampled route
passed.

| Route | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Warm TTFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 80 | 98 | 100 | 100 | 2.48 s | 0.000 | 702 ms | 49 ms |
| `/careers` | 94 | 100 | 100 | 66* | 2.49 s | 0.000 | 215 ms | 93 ms |
| `/career/australia/registered-nurse` | 88 | 100 | 100 | 100 | 2.47 s | 0.000 | 390 ms | 68 ms |
| `/countries/au` | 95 | 100 | 100 | 100 | 2.47 s | 0.000 | 164 ms | 21 ms |
| `/programs/au/1-bachelor-of-arts` | 96 | 100 | 100 | 100 | 2.33 s | 0.000 | 163 ms | 36 ms |
| `/institutions/au/australian-catholic-university` | 97 | 100 | 100 | 100 | 2.32 s | 0.000 | 143 ms | 18 ms |
| `/sources` | 96 | 100 | 100 | 100 | 2.33 s | 0.000 | 172 ms | 17 ms |

\* Careers is intentionally `noindex, follow`, so Lighthouse’s crawlability
deduction is expected.

These are synthetic lab observations, not field Core Web Vitals. Field INP,
LCP, CLS, and TTFB monitoring remains a Phase 6 responsibility once traffic
exists.

## SEO, canonical, and sitemap audit

- Canonical Career identity remains `country_code + career_id`, rendered as
  `/career/{country-slug}/{career-id}`.
- Canonical Career requests return 200; missing careers and invalid countries
  return 404; the legacy Career alias returns its 308 canonical redirect.
- Careers and Compare query-state surfaces remain non-indexable.
- The recorded sitemap audit contains 2,154 URLs, including 11 canonical Career
  entries and no Australian state occupation context URLs.
- The 40 valid Australian state occupation pages remain available as contextual
  evidence, explicitly `noindex, follow`, and absent from the sitemap.
- `robots.txt` keeps public product routes available while blocking
  API/auth/account and retired surfaces.

## Data integrity and provenance

Production migration lineage and the repository are reconciled at 814
migrations with zero branch-only or production-only versions. P0.5
`20260907101500_p0_5_private_raw_career_data` is applied under its intended
version. The public data contract still represents missing salary, demand,
mapping, readiness, or score evidence as missing rather than inventing neutral
values.

All six raw Career tables are service-role-only for reads: `service_role`
has SELECT, `anon`/`authenticated` do not, and there are no browser SELECT
policies. A real service-role read succeeded and the application-side
`42501 → anon` compatibility fallback has been removed.

## Security and privacy

- Dependency audit and Git history secret scan pass in CI #2084.
- Public responses include `nosniff`, strict-origin referrer policy, and a
  restrictive camera/microphone/geolocation permissions policy.
- Institution rendering does not load third-party favicons.
- Supabase leaked-password protection remains a documented P2 because the
  current Free plan does not expose the Pro+ control.
- Advisor informational findings for service-only RLS tables and indexes remain
  tracked as P2 rather than being mechanically “fixed”.
- CSP remains a staged P2 item pending a tested nonce/reporting design.

## Reliability

Critical routes have explicit valid, missing, redirect, and unsupported-state
coverage. Malformed Compare input returns a recoverable surface. CI fails on
unexpected browser page/console errors; the previous WebKit RSC prefetch error
is closed. Parallel `next start` can still log `The destination stream
closed early` during intentionally aborted navigation and is tracked as P2.

## Known blockers and deferred work

The source of truth is [RELEASE_BLOCKERS.md](RELEASE_BLOCKERS.md). All migration,
privilege, critical-browser, and synthetic-performance launch blockers are
closed. The only remaining P1 is the manual accessibility sign-off in
[PHASE_5_ACCESSIBILITY_EVIDENCE.md](PHASE_5_ACCESSIBILITY_EVIDENCE.md).

P2/P3 items do not independently block Phase 6 and remain scheduled work.

## Decision

**NOT READY FOR PHASE 6.** All engineering and performance release gates pass,
but the Phase 5 standard explicitly requires manual accessibility evidence
before external launch. Once that checklist is completed without a material
finding (or findings are fixed and rechecked), update this decision to
**READY FOR PHASE 6** and move PR #263 out of draft.
