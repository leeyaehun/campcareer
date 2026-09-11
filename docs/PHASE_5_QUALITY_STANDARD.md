# Phase 5 — Quality standard and release gates

## Purpose and scope

Phase 5 turns the Phase 1–4 product contracts into measurable release
evidence. It does not change Career identity, `CareerProfile`, score formulae,
publication gates, product navigation, data pipelines, or database design.

Quality is evaluated in this order: correctness, data integrity, security,
accessibility, performance, usability, SEO, and visual polish. A gate records
evidence; it does not infer quality from a passing build alone.

## Severity and release policy

| Severity | Meaning | Release effect |
| --- | --- | --- |
| P0 | Security breach, data corruption, incorrect critical calculation, unavailable site, or impossible core journey. | Stops Phase 6 public launch. |
| P1 | Material accessibility, mobile, comparison, performance, security-boundary, or migration/deployment problem. | Must be fixed before public launch unless the release owner explicitly records a time-bound external dependency. |
| P2 | Non-critical usability, performance, reliability, or maintainability issue. | Track and schedule; does not independently block a release. |
| P3 | Cosmetic polish with no material correctness or accessibility effect. | Schedule when appropriate. |

The current source of truth for open issues is
[RELEASE_BLOCKERS.md](quality/RELEASE_BLOCKERS.md). In particular, migration
history drift and the unapplied raw-Career privilege migration remain P0 launch
blockers even when application checks pass.

## Definition of Done

Phase 5 engineering work is complete only when all of the following have
recorded evidence in [the release audit](quality/PHASE_5_RELEASE_AUDIT.md):

- TypeScript, ESLint, unit tests, production build, and `git diff --check` pass.
- The focused E2E suite runs against `next start`, and its failure fails CI.
- Chromium, Firefox, WebKit, and a representative mobile Chromium journey pass.
- Representative WCAG 2.2 AA automated scans are clean, and manual
  accessibility evidence is recorded before an external launch.
- Responsive surfaces are checked at 360, 390, 768, 1024, 1280, and 1440 px.
- Core routing, error handling, metadata, canonical URLs, and sitemap entries
  have been inspected.
- Existing data-quality validation passes and the public data contract is not
  weakened to fill missing evidence.
- Security findings and deployment blockers are classified rather than hidden.

## CI release sequence

The required GitHub Actions order is:

```text
Install
↓
Dependency security audit
↓
Typecheck
↓
Lint
↓
Unit tests
↓
Production build
↓
Install Chromium, Firefox, and WebKit
↓
Critical E2E against next start
↓
Diff whitespace check
↓
Secret scan
```

`npm run test:e2e:critical` is the focused browser gate. It runs the built
application with `next start`, not `next dev`, and covers desktop Chromium,
Firefox, WebKit, and mobile Chromium. Historical browser suites remain outside
this release gate to keep the required signal focused and stable.

## Correctness, browser, and responsive gates

The critical suite verifies these public journeys:

1. Careers → search/filter → canonical Career → score evidence and sources.
2. Career → supported Compare context.
3. Country → country-filtered Career discovery.
4. Verified Australian Program → its existing Institution relationship. The
   sampled Program data has no public Program→Career relation, so Phase 5 does
   not invent one for a test fixture.

It also verifies a valid Career 200, missing Career and country 404s, a
permanent legacy Career redirect, a recoverable malformed Compare state, no
unexpected page/console errors, canonical metadata, and intentional
page-level overflow rules. Responsive checks cover the homepage, Careers,
Career, Country, Program, Institution, and Compare at the six release
breakpoints. Compare may use a contained horizontal matrix; document-level
overflow is not allowed.

## Accessibility gate

Automated representative scans use `@axe-core/playwright` with WCAG 2.0,
2.1, and 2.2 A/AA tags for navigation/search, Career, Country, Program,
Institution, Compare, and Sources. A scan with any violation fails the E2E
gate. This is evidence, not a claim of full WCAG conformance.

Before public launch, the release owner records the following manual checks on
the same shared surfaces:

- keyboard-only navigation, visible focus, menus, dialogs, filters, and Compare;
- 200% browser zoom and high text scaling;
- a screen-reader smoke check for landmarks, headings, controls, tables, and
  status messages;
- mobile touch targets (general controls at least 40 by 40 CSS px and major
  actions at least 44 by 44 where the layout permits); and
- reduced-motion behaviour.

A material failure in a shared primitive is P1 because it can affect many
pages at once.

## Performance gate

Phase 5 records production-like synthetic baselines on representative routes.
The release targets are LCP at most 2.5 s, INP at most 200 ms, CLS at most
0.10, and TTFB at most 800 ms; stretch targets are LCP at most 2.0 s, INP at
most 150 ms, and CLS at most 0.05. Lighthouse lab measurements do not prove
field Core Web Vitals. After traffic exists, field data is authoritative.

Lighthouse remains a documented audit rather than a CI hard gate because its
local synthetic score is too variable for a reliable PR signal. A measurable
regression or a route that materially misses the baseline is P1 and is tracked
in the release blockers document.

## SEO and sitemap gate

Every sampled indexable URL must be a 200 response with server-rendered main
content, useful title/H1/description, a matching canonical URL, and correct
indexability. Filter and Compare query states remain `noindex` and do not
become generated SEO families.

A sitemap URL must be canonical, published, indexable, and return 200. The
audit checks for duplicate URLs and compatibility/retired paths. Australian
state occupation pages remain useful contextual evidence, but are `noindex,
follow` and excluded from the sitemap so they cannot compete with canonical
Career pages. `lastModified` continues to use source-checked dates where the
catalogue provides them; otherwise it uses the existing defensible dataset
date rather than fabricated current freshness.

## Data-quality gate

`npm run check:data` remains the release data gate. It reuses the existing
validation infrastructure rather than imposing a new historical schema. Score
and publication rules remain authoritative: missing salary, demand, mapping,
readiness, or evidence is represented as missing, never as an invented neutral
value. Important displayed measures require the available source, period,
country/region, and unit metadata. Candidate ingestion validation and review
remain the place to quarantine impossible values instead of silently
normalising them.

## Security gate

The release checks dependency vulnerabilities, repository secrets, existing
Zod request validation, Supabase advisor findings, RLS boundaries, and public
HTTP headers. The application sets `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive
camera/microphone/geolocation `Permissions-Policy`. A Content Security Policy
is deferred until it can be introduced with tested Next.js nonce/reporting
behaviour, rather than breaking rendering with an unverified static policy.

External institution favicons are not loaded as page images; only first-party
logo assets render. This avoids a third party setting browser state before the
visitor deliberately opens the source.

## Release checklist

- [ ] TypeScript passes.
- [ ] ESLint passes with no new warnings beyond the documented 84-warning baseline.
- [ ] Unit tests pass.
- [ ] Production build passes.
- [ ] `git diff --check` passes.
- [ ] Critical E2E passes on Chromium, Firefox, WebKit, and mobile Chromium.
- [ ] Keyboard, 200% zoom, screen-reader smoke, mobile touch, and reduced-motion checks are recorded.
- [ ] Metadata, canonical URLs, robots policy, and sitemap are audited.
- [ ] Source/date and missing-data behaviour are checked.
- [ ] No critical console or hydration errors occur on critical journeys.
- [ ] Supabase findings, dependency audit, and secret scan are reviewed.
- [ ] No P0 or unresolved launch-critical P1 remains, except an explicitly documented external dependency with an approved resolution plan.

The checklist status for this review is recorded in the release audit. Passing
the code gates does not override an open migration or privilege boundary
blocker.

## Intentionally deferred non-blockers

- A broad Server Component/client-JavaScript rewrite.
- A large visual snapshot system or a commercial visual testing service.
- A static CSP before the required nonce/reporting strategy is proven.
- Mechanical addition/removal of Supabase indexes or RLS policies solely to
  silence advisor informational findings.
- New SEO page families, product features, data ingestion, or score changes.
