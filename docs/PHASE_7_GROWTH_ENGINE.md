# Phase 7 — Growth Engine

Last reviewed: 12 September 2026

## Purpose

Phase 7 makes CampCareer easier to discover, use again and share without
separating growth from the product. The core loop is:

`Search / discovery → useful Career data → exploration → comparison → decision → share / return → product signals → better product`

Career remains the primary decision object. CampCareer does not optimise for
pageviews, indexed URL count or generic traffic at the expense of a useful,
evidenced decision.

## North star and supporting measures

**Decision Sessions per Week** remains the north star from Phase 6. A session
qualifies after a Compare view, or three unique meaningful entity paths across
at least two entity types. It is consent-gated, uses browser `sessionStorage`
only and contains no account identifier.

The growth view combines GA4, Search Console and existing Vercel product and
performance tools. It must report:

| Measure | Source | Interpretation |
| --- | --- | --- |
| Organic Decision Sessions | GA4 plus landing attribution | Whether organic discovery reaches product value. |
| Non-branded organic clicks and impressions | Search Console | Demand context, never a standalone success metric. |
| Search → Decision conversion | GA4 | Whether the discovery flow helps a visitor reach a decision. |
| Entity → related entity rate | `cross_entity_navigation` | Whether the entity graph supports exploration. |
| Entity → Compare rate | `compare_add` | Whether a Career Page prompts a useful second decision. |
| Career Compare completion rate | Career-category `compare_complete` ÷ `compare_view` | Whether a visitor forms a real Career comparison. |
| Career Compare share rate | Career-category `compare_share` ÷ `compare_complete` | Whether a completed Career result is useful enough to pass on. |
| Returning Decision Sessions | GA4 | Whether value persists beyond a first visit. |
| Zero-result search rate | `search` where `result_count = 0` | A demand and discovery-quality signal. |
| Organic landing pages with decisions | Search Console + GA4 | Which existing canonical pages create value. |

## Growth audit — baseline

| Area | Existing capability | Phase 7 decision |
| --- | --- | --- |
| Search Console readiness | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, sitemap, robots and a representative inspection set already exist. Search Console ownership, sitemap submission and query data are external to this repository. | Keep the operational workflow; do not claim demand data until the owner records it. |
| GA4 | Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID`, consent-gated GA4 loader and typed event boundary exist. | Production environment setup and DebugView validation remain owner actions. No ID is committed. |
| Decision Sessions | Consent-aware tracker records one session after Compare or cross-entity exploration. | Retain as the north star. |
| Internal search | Career explorer emits a settled `search` event with safe `search_term`, `result_count` and optional category. | Use `result_count = 0` as the zero-result measure; do not create an entity from one query. |
| Compare | `/compare` has compact, reconstructable public query state, is `noindex`, and is excluded from the sitemap. Direct compare views now carry the selected mode and count; completed Australian Career comparisons emit `compare_complete` and expose a normalized share action. |
| Sharing | Career Pages already have static OG metadata; Compare previously had generic metadata and no result-share control. | A 2–3 Career Australian comparison now shares only normalized public state and emits `compare_share` after a successful native share or clipboard copy. |
| Entity transitions | The tracker records `entity_view` and `cross_entity_navigation` for Career, Country, Program, Institution and trust routes. | Preserve the small event set; do not track ordinary navigation. |
| Canonicals, sitemap and robots | Canonical Career publication gates, central redirect registry, published-only sitemap entries and robots rules already exist. | No change to indexability rules. Compare stays `noindex, nofollow` with canonical `/compare`. |
| Internal links and related entities | Career → Evidence → Path → Study / Programs → Jobs and contextual Country/Compare links already provide the primary graph. Blog posts have related guides and a career-first product CTA. | Measure existing graph transitions before adding generic link blocks. |
| Tools, save and accounts | Compare is the current decision utility. Save uses the existing value-first authentication return flow. | No workspace, generic newsletter or account expansion. |
| Editorial, i18n and historical URLs | Blog supports published guides and a sitemap; i18n infrastructure and stable redirects are present. | No mass content or localization expansion. Preserve historical URLs and data. |

## Acquisition and SEO policy

Create the best answer first, then make it discoverable. Existing canonical
product pages are preferred over new acquisition-only landing pages.

Page families are assessed individually:

| Family | Current policy |
| --- | --- |
| Entity | Career, Country, Program, Institution and approved contextual entities use existing publication gates. |
| Entity × Country | Canonical Career route is `country_code + career_id` projected as `/career/{country-slug}/{career-id}`. It is indexed only when the existing Career publication gate is ready. |
| Comparison | `/compare` reconstructs a user-selected result but remains `noindex`; comparison queries must not become a generated index family. |
| Ranking, outcome and tool | Do not create until real demand, reliable data and a clear decision question are demonstrated. |
| Guide | Use the existing editorial system only where an evidence-backed guide strengthens a product decision and its upkeep is known. |

Every prospective programmatic page must pass all of these gates before it is
published or indexed:

1. A real search or product-demand signal exists.
2. Reliable, maintainable data exists.
3. The page contains meaningfully unique decision value, not a changed title.
4. It answers a real question and has useful graph relationships.
5. Its canonical, publication and maintenance ownership are explicit.

Failure of any gate means no new page is published or indexed. Phase 7 creates
**zero new indexable URLs**.

## Internal discovery rules

Use relationships rather than keyword-stuffed footer lists. The desired graph
is Country ↔ Career ↔ Degree / education, with contextual paths into Programs,
Jobs and Compare after the Career verdict.

- Career Page links must preserve the primary order: Score → Evidence → Path →
  Study / Programs → Jobs → secondary Save / Compare.
- Compare is a secondary decision check; it cannot replace the Career verdict
  or become global primary navigation.
- Country, City, Visa, Maps and Institutions remain contextual. Add a link only
  when it answers the selected Career or Path question.
- Observe `cross_entity_navigation` and `compare_add` before adding a new
  related-entity module. A generic link block without a useful relationship is
  not growth infrastructure.

## Comparison and sharing rules

A shareable result must be useful if opened in another browser, contain no PII,
and use a compact stable public URL. It must never serialize private account
state, a free-text search term or a large application snapshot.

The initial Phase 7 implementation is deliberately limited to an Australian
Career comparison with two or three validated Career IDs. It:

- rebuilds the URL through `buildCareerCompareHref` from validated state;
- preserves the existing `noindex, nofollow` Compare policy and canonical
  `/compare`;
- gives the shared result a descriptive metadata title and description while
  retaining the static CampCareer image;
- records only comparison category, item count and `native` or `clipboard`
  method after a successful share; and
- does not add dynamic OG-image infrastructure, a social SDK or any indexable
  query page.

## Demand-driven expansion workflow

Search Console is product research, not only a ranking report:

`query / page / country signal → existing data and page audit → improve existing product or queue a data gap → observe Decision Session effect`

Internal search follows the same discipline. Review safe terms, result counts
and zero-result queries weekly. A repeated query can become a candidate for an
alias, search UX change, Country context, Degree data or a new Career only
after product relevance, reliable data and graph fit are confirmed. Never
create an entity automatically from a query.

Use [the opportunity review](growth/OPPORTUNITY_REVIEW.md) for the record and
qualitative High / Medium / Low priority. The initial model intentionally has
no invented numerical score.

## Experiments

One variable per experiment. Every record needs a hypothesis, baseline,
change, primary metric, guardrails, observation period and a decision. Keep
experiments in [the registry](growth/EXPERIMENTS.md). Do not call an experiment
won before real consented production observations exist.

Guardrails always include Decision Session quality, accessibility, canonical
behaviour and Phase 5 performance budgets. Do not add blocking third-party
scripts, heavy social widgets or large client bundles for growth work.

## Retention, localization and freshness

Save remains a user-initiated retention action and preserves the existing
sign-in return contract. Phase 7 does not create collections, a dashboard,
emails or a workspace. Product-triggered retention is considered only after
real saved-item and returning-decision evidence exists.

Localization stays demand-driven. Existing i18n code remains in place, but no
new language is added until the English product and templates are stable, a
translation and data-freshness workflow exists, demand is evidenced, and the
maintenance owner is known.

Freshness follows source changes, not the calendar. New salary, tax, tuition,
projection, visa/work-policy or source evidence may justify an update. Keep
historical provenance and existing URLs unless the URL-permanence process
approves a specific redirect, merge, noindex or removal.

## Anti-patterns

- No Cartesian Career × Country × Degree × City page generation.
- No AI content factory, bulk localization, spam posting, bought links or
  automated outreach.
- No search-result or arbitrary filter indexing.
- No generic newsletter or account-first retention system.
- No traffic-only decision making, invented demand data or fabricated
  experiment outcomes.

## Phase 7 definition of done

1. Growth metrics, provider-owned gaps and the operating cadence are explicit.
2. Existing Search, Compare, graph, SEO, trust, retention, editorial, i18n
   and historical URL infrastructure has been audited.
3. A small, privacy-safe sharing/Compare improvement is measured and does not
   create an indexable page family.
4. Search Console and zero-result demand have repeatable review paths.
5. The Phase 5 quality gates remain green.
6. Post-launch work follows `Launch → Observe → Improve → Expand`.
