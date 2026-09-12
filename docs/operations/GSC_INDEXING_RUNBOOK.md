# Search Console Indexing Runbook

Last reviewed: 12 September 2026

## Baseline

The supplied settled 28-day baseline is 1,073 impressions, 3 clicks, roughly
0.28% CTR and average position 30.2. The homepage is confirmed indexed.
`/careers` is reported crawled but not indexed; its product policy is
intentional discovery-surface `noindex`, so do not treat that as an indexing
defect or request indexing without a separate product decision.
`/countries/ie` is currently unknown to Google and remains the Ireland Golden
Slice indexing target once its connected decision value is ready.

The public sitemap contained 2,156 URL entries when checked on 12 September
2026. Counts may change with governed publication; use the live sitemap and
Search Console report rather than treating a prior approximate count as a
contract.

## Weekly review

| Check | Question | Action |
| --- | --- | --- |
| Core URL inspection | Are Home, a published Career, Country, Program, Institution and trust page indexed/canonical as intended? | Compare live URL, declared and Google-selected canonical, robots and rendered content. |
| Sitemap | Is it fetchable, valid and aligned with approved publication entries? | Diagnose source/publish gate before resubmitting. |
| Exclusions | Which URLs are crawled-not-indexed, discovered-not-indexed, noindex or duplicate? | Respect intentional noindex; investigate unexpected exclusions one representative URL at a time. |
| Queries and landing pages | Where are repeated impressions, clicks, low CTR or clear decision intent? | Improve an existing answer or queue a source-backed opportunity. |
| Legacy traffic | Which ROI, Australia jobs and older blog pages still produce useful demand? | Add contextual links into the current graph only where genuinely helpful. |
| Country/Career/Degree demand | Do repeated query clusters match available data and connected products? | Feed [EXPANSION_QUEUE.md](../product/EXPANSION_QUEUE.md); do not create a page from one query. |

## Legacy authority bridge

Keep useful legacy pages readable. Improve their next action rather than
deceptively redirecting:

| Existing context | Useful bridge when justified |
| --- | --- |
| ROI Explorer | Degree context → institution/program evidence → Career outcomes. |
| Australia job page | Canonical Career → country comparison → related study path. |
| Comparison guide | Existing Compare → relevant Country, Degree or Career discovery. |

Every bridge must retain the legacy page's real value, link to a canonical
destination and avoid competing indexable Career routes.

## Indexing actions

Do not mass-request indexing. Request or investigate a URL only after checking
publication readiness, canonical route, robots, source evidence, user value and
connected internal path. Search demand is not willingness to pay, and
impressions are not a reason to publish unsupported data.
