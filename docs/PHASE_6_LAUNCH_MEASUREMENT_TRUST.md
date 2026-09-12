# Phase 6 — Launch, Measurement & Trust Operations

Last reviewed: 12 September 2026

## Purpose and scope

Phase 6 turns the current verified launch slice into an operating product:
publish, measure, observe, learn, correct, then expand. It preserves Career as
the primary decision object, the existing Career publication gates, canonical
URLs, Supabase/PostgreSQL architecture, Universal Compare, and Phase 5 release
gates. It does not add a new product category, redesign, ingestion target or
SEO page family.

The launch slice is judged by connected decisions — Search → Explore → Career
→ Country context → Compare → Program / Institution → Sources — not by a
dataset-count target or pageviews alone.

## Launch states

1. **Release Candidate**: production-equivalent validation has passed,
   including Phase 5 quality gates, core journeys, data, SEO, trust, mobile,
   browser, performance, accessibility and redirect checks.
2. **Quiet Launch**: the public domain is available for real crawling,
   measurement, errors and user behaviour, without a promotional campaign.
3. **Stable Public Launch**: no P0 or unresolved major P1 remains; core
   journeys, analytics, Search Console, sitemap, representative canonicals,
   feedback, monitoring and data review all work in production.

Apply a seven-day feature freeze before public promotion. During it, only bug
fixes, data verification, performance, SEO, accessibility, security, analytics
correctness and trust work may enter. After Stable Public Launch, no full
redesign for 90 days; evidence-led usability fixes remain allowed.

## Measurement contract

The existing affirmative-consent boundary in
`src/components/consent-gated-insights.tsx` mounts Vercel Analytics, Vercel
Speed Insights, GA4 and the decision-session tracker only after
`cc_analytics_consent=granted`. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is optional;
an absent or invalid value makes GA4 a no-op. No production ID belongs in the
repository.

`src/lib/analytics.ts` is the shared typed event boundary. It provides stable
lower-snake-case names, consent checks, debug browser events and value
sanitisation. It rejects obvious email, phone, URL and title-cased name search
input, removes disallowed parameter names, and never receives feedback text.
It must be the only place product code sends GA4/Vercel product events.

| Event | Trigger | Parameters |
| --- | --- | --- |
| `search` | Settled Career search | `search_location`, `result_count`, optional safe `search_term`, `entity_filter` |
| `filter_apply` / `filter_clear` | Career category filter changes | `search_location`, `entity_filter` |
| `compare_add` | Career Compare action | `entity_type`, `entity_count`, `comparison_category` |
| `compare_view` | Universal Compare route | `entity_count`, `comparison_category` |
| `entity_save` | Successful signed-in Career save | `entity_type` |
| `entity_view` | Meaningful canonical entity/trust route | `entity_type` |
| `cross_entity_navigation` | Change between meaningful entity types | `from_entity_type`, `to_entity_type` |
| `decision_session` | Definition below | `qualification` |
| `source_open` | External source opened from Sources | `source_surface` |
| `methodology_open` | Methodology opened from Sources or Data policy | `source_surface` |

`compare_remove` and `education_outbound_click` are reserved in the contract
but are not emitted until their precise existing interactions are wired. Do not
manufacture events for absent product features.

### Decision Sessions

Decision Sessions per Week is the north-star metric. A browser session emits
**one** `decision_session` when it has either a `compare_view`, or at least
three unique meaningful entity paths across at least two entity types. State
uses `sessionStorage` only after consent, contains no account identifier, and
is never a cross-device identifier. Simple pageviews do not qualify.

Supporting metrics are Search → Result CTR, Entity → Compare Rate,
Cross-Entity Navigation Rate, Compare Completion Rate, Zero-Result Search Rate
and Returning User Rate. Traffic and pageviews remain acquisition context.

### Validation and GA4 manual setup

Unit tests cover the contract, PII sanitisation, optional GA ID and Decision
Session semantics. A browser can listen for the `campcareer-analytics-event`
custom event to inspect already-sanitised events without calling GA. CI never
contacts GA.

After the owner creates/configures a GA4 property and supplies its build-time
measurement ID, validate in DebugView/Realtime with a fresh browser:

1. Choose **Use essential only**, visit `/careers`, search, open Compare, and
   confirm no GA events arrive.
2. Clear site data, choose **Allow measurement**, then search `electrician`.
   Expect `search` with `search_location=careers` and a non-negative
   `result_count`; confirm a typed email is omitted from `search_term`.
3. Apply and clear a Career category. Expect `filter_apply` then
   `filter_clear` with `entity_filter`.
4. Open a canonical Career and use Compare. Expect `compare_add`, then
   `compare_view` and exactly one `decision_session` with
   `qualification=compare_view` for that browser session.
5. Open `/sources` and Methodology. Expect `methodology_open` with
   `source_surface=sources`.
6. Mark `compare_view` and `decision_session` as GA Key Events after the
   observed names and parameters match this contract. Do not mark every event.

## Feedback and trust

Phase 6 reuses the service-managed `public.feedback` table and `/api/v1/feedback`.
The additive migration `20260911110000_feedback_page_context_status.sql` adds
query-free page/entity context and internal status (`new`, `reviewing`,
`resolved`, `ignored`). Browser requests cannot choose status. Until that
migration is deployed, the existing metadata fallback retains page context
without opening direct browser database access.

The lightweight anonymous **Was this useful?** control posts to the same
validated endpoint. `/sources` and `/data-policy` expose **Report a data
issue** with Outdated, Incorrect, Wrong source, Missing data and Other. It
captures the query-free path automatically, never requires an account, accepts
optional details only, and never sends reports or free text to analytics.

`/methodology` and `/sources` remain the detailed method and reference pages.
`/data-policy` explains source priority, estimates, missing evidence,
freshness, corrections and limits. There is no public `/changelog` yet: public
history would be premature while the product is in quiet launch. Material data
changes are recorded through source/run provenance and release documentation;
only later user-meaningful changes merit a public changelog.

## Release performance gate

`scripts/lighthouse-release-audit.mjs` (`npm run audit:lighthouse`) is the
release performance gate. It audits the fixed representative route set, warms
each route first, and judges each route on the **median of 3 independent
Lighthouse runs**. A route whose initial median misses the hard budget collects
4 additional samples and is judged on the median of 7. The budget is immutable:

- **LCP ≤ 2500 ms** (median) · **CLS ≤ 0.10** (median) · **median warm-up TTFB ≤ 800 ms**

The route set is: `/`, `/careers`, `/career/australia/registered-nurse`,
`/countries/au`, `/programs/au/1-bachelor-of-arts`,
`/institutions/au/australian-catholic-university`, `/sources`.

Final gate result (12 September 2026, cold build, warm server, 3 samples/route with Chrome's simulated throttling): **all 7 routes PASS**.

| Route | Median LCP | CLS | warm TTFB |
| --- | --- | --- | --- |
| `/` | 2.33 s | 0.000 | 6 ms |
| `/careers` | 2.48 s | 0.000 | 8 ms |
| `/career/australia/registered-nurse` | 2.48 s | 0.000 | 8 ms |
| `/countries/au` | 2.49 s | 0.000 | 4 ms |
| `/programs/au/1-bachelor-of-arts` | 2.33 s | 0.000 | 7 ms |
| `/institutions/au/australian-catholic-university` | 2.48 s | 0.000 | 4 ms |
| `/sources` | 2.33 s | 0.000 | 3 ms |

Root causes that had held `/countries/au` out of budget, resolved 12 September
2026:

- **LCP (2.63 s → 2.49 s):** the country search option index (`SEARCH_OPTIONS`,
  name/currency/region/city terms for the launch countries) was embedded in the
  initial RSC payload of every country page. The index is now a client-safe
  static module dynamically imported by the search control
  (`src/lib/workspace/country-search-options-data.ts`), removing the index from
  the initial document and the cold browser main bundle. Compressed document
  size for `/countries/au` fell from 16.4 KB to 12.8 KB gz.
- **CLS (0.101 → 0.000):** the only source was the `ssr:false` lazy placeholder
  swapping to the mounted control (two `had_recent_input` layout shifts right
  after paint). The control is now server-rendered with an optional `options`
  prop; when none are supplied it loads them in a `useEffect` and the Popular
  chip row renders geometry-identical `h-8` skeleton chips until options
  arrive. No placeholder-to-mount swap exists on the page.
- Kept for the gate, pending post-launch polish: the decorative Unsplash
  `picture` hero background was removed from country dashboards. It measured
  LCP-neutral, but keeping the Unknown network fetch out of the countries
  critical path preserves the ~20 ms budget headroom. Post-launch, restore the
  imagery and re-run the gate before keeping it.
- `/careers` initial main-bundle trim predates the gate: the occupation
  explorer mounts client-side via a deferred dynamic import (initial JS chunks
  175 KB → 91 KB raw) with no empty-state regression.

Before re-running the gate, restart the production server from a fresh build
so force-dynamic routes return to their warm TTFB; run the audit only against
a warmed, non-hot server. Do not change the budget, the route set, or the
sample counts to make a failing route pass.

## Search, URLs, data and observability

Technical SEO continues to use the existing sitemap, robots, canonical metadata
and redirect registry. `/data-policy` and `/sources` are now static sitemap
entries. Search Console operation and its representative inspection set live in
`docs/operations/LAUNCH_RUNBOOK.md`; do not request indexing for a large URL
batch.

The URL permanence policy is `Correct → Update → Merge → Redirect → Remove
only when necessary`. Keep stable canonical slugs and identifiers. Use the
existing `LEGACY_SEO_REDIRECTS` registry and focused tests for exact permanent
replacements; do not turn broad legacy aliases into new permanent redirects.

Existing import-run/source provenance and the common ingestion framework remain
authoritative. `docs/operations/DATA_OPERATIONS.md` records the operating
registry and correction process. Vercel logs, Vercel Analytics/Speed Insights,
CI, and existing application logs form the current observability baseline;
there is no new monitoring vendor in this phase. Backup/PITR availability is an
external Supabase dashboard verification, documented without claiming it has
been performed.

Use the launch, weekly, monthly and observability documents for recurring
operation. Before a subjective redesign/removal decision, review usage,
funnels, feedback, errors and search behaviour; observed and repeated behaviour
outranks founder intuition.
