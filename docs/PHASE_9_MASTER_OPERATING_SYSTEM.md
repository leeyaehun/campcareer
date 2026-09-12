# Phase 9 — Master Operating System

Last reviewed: 12 September 2026

## Purpose

CampCareer is operated through a repeatable evidence loop:

`Operate → observe → identify signal → prioritize → build small → measure → keep / improve / remove → expand`

This is an operating system, not a calendar roadmap. Product expansion follows
evidence; recurring checks provide the evidence.

## Current product state

The current production baseline is `e3e085de3061ec17009222faef3a9364c0f06693`,
the merged Phase 8 commit. Its GitHub production deployment is marked
successful, and `campcareer.com`, `/careers`, and `/countries/ie` returned
HTTP 200 from Vercel during the 12 September 2026 review.

The four permanent product engines are defined in
[CORE_DECISION_ENGINES.md](product/CORE_DECISION_ENGINES.md). The primary graph
remains:

`Country ↔ Career ↔ Degree ↔ Education`

Career is the primary decision surface. CampCareer Score, Evidence, Path,
Study / Programs and Jobs remain public and in their established order.
Search, discovery, filtering, Compare, rankings, calculations, sources and
methodology remain genuinely free. Account, Save and Settings remain optional
retention utilities.

Phase 5 quality, Phase 6 consent-aware measurement, Phase 7 growth rules and
Phase 8 commercial-independence rules remain authoritative.

## Operating cadence

| Cadence | Purpose | Operating document |
| --- | --- | --- |
| Daily, 10–20 minutes | Triage availability, data and P0/P1 signals. | [DAILY_CHECK.md](operations/DAILY_CHECK.md) |
| Weekly | Review actual product, search and quality signals; choose one primary problem. | [WEEKLY_REVIEW.md](operations/WEEKLY_REVIEW.md) |
| Monthly | Interpret trends, inspect the core journey and make explicit keep/build/do-not-build decisions. | [MONTHLY_REVIEW.md](operations/MONTHLY_REVIEW.md) |
| Quarterly | Decide whether evidence supports a new product, country, data or business bet. | [QUARTERLY_STRATEGY_REVIEW.md](operations/QUARTERLY_STRATEGY_REVIEW.md) |
| Annual | Refresh time-sensitive data while preserving historical observations. | [ANNUAL_DATA_REVIEW.md](operations/ANNUAL_DATA_REVIEW.md) |

Do not manufacture zeros for unavailable external data. A missing GA4, Search
Console, Vercel or Supabase value is recorded as unavailable with an owner and
next check.

## Prioritization

Every candidate work item records:

1. The user problem.
2. The supporting evidence and its period.
3. Expected decision improvement.
4. Data readiness and source quality.
5. Implementation size and operating cost.
6. Trust, privacy, accessibility, performance and SEO risk.
7. The measurement and stop condition.

Prefer high decision value, strong evidence, ready data, low trust risk and a
small reversible implementation. The weekly review selects **one** primary
product or growth problem; it is not a 20-item roadmap.

## Expansion gates

### Country, Career, Degree and education

Expansion requires real demand, a useful graph relationship, defensible source
data, maintained publication readiness and an owner for refresh. A raw profile,
popular label or existing route alone is not enough.

- **Country:** demand, career-market context, education data, comparison value
  and maintenance capacity.
- **Career:** demand, salary/demand/path evidence, an education path and
  explicit future-outlook evidence if an outlook is shown.
- **Degree:** demand, meaningful career outcomes, findable programs and usable
  country context.
- **Institution/program:** a current identity, location and public
  readiness; never infer delivery or international eligibility from a provider
  alone.

Use [EXPANSION_QUEUE.md](product/EXPANSION_QUEUE.md) to classify candidates as
NOW, NEXT, LATER or NOT YET.

### SEO

Publish only a specific high-intent question with reliable data and a connected
decision journey. A page must have unique decision value, a clear canonical
route, an explicit publication gate and maintenance ownership. One random
query, a changing title or a Cartesian route family is not enough.

Search Console operates as product research as well as SEO monitoring; see
[GSC_INDEXING_RUNBOOK.md](operations/GSC_INDEXING_RUNBOOK.md). Existing legacy
pages with traffic are authority bridges, not automatic deletion candidates.

### Data

Source changes trigger refresh work; calendar review verifies that no
time-sensitive source has silently aged out. Candidate collection stays
separate from controlled canonical publication. Unknown remains unknown, and
historical source periods are retained rather than overwritten. See
[DATA_OPERATIONS.md](operations/DATA_OPERATIONS.md) and the annual review.

## Product and design loop

Do not begin concurrent Degree Match, Country Match, future prediction, jobs,
new country and SEO-family work. Ireland is the first depth test:
[IRELAND_GOLDEN_SLICE.md](product/IRELAND_GOLDEN_SLICE.md).

For any surfaced UX problem, use:

`Observed problem → small UI improvement → measure / review`

The Phase 3 system remains in place. The review questions and evidence format
are in [PRODUCT_DESIGN_REVIEW.md](design/PRODUCT_DESIGN_REVIEW.md).

## Infrastructure and cost review

Vercel resource remediation is the first operational **P0 / NOW** task. The
connected Vercel account verifies 82.4 GB of 10 GB Deployment Storage and
15.22 GB of 10 GB Functions Storage. It has at least 420 deployments. In the
latest 400, 379 are Preview and 21 Production; 159 are READY, 114 CANCELED and
127 ERROR. The most repeated refs in that sample are `cleanup/phase1-reset`
(106), `prelaunch/release-blockers` (105), `feature/fifo-report-commerce`
(60), and `agent/campus-career-product-constitution` (42).

Those counts show the first retention review should focus on stale Preview,
CANCELED and ERROR deployments from repeated historical refs. They do not
establish that any individual deployment is safe to delete. The available
connector does not expose byte-per-deployment or function-bundle sizes, so
this phase records no invented size allocation. The repository review's local
Next server output (about 268 MB before Vercel packaging) remains diagnostic
only.

[VERCEL_STORAGE_RUNBOOK.md](operations/VERCEL_STORAGE_RUNBOOK.md) records the
verified inventory and the operator procedure for selecting exact deletion
candidates without affecting production or rollback safety.

Quarterly review covers Vercel usage, Supabase capacity, database growth,
source rights, freshness, technical debt, performance and recovery readiness.
No new monitoring, billing or data service is introduced by this phase.

## Feature experiments and business transition

An experiment needs a real problem, a single variable, a primary measure,
Decision Session and trust guardrails, a sample requirement and a stop
condition. It cannot gate the free core or weaken independent answers.

Commercial progression remains Stage 0 until production evidence supports a
later stage. Use the Phase 8
[opportunity review](business/OPPORTUNITY_REVIEW.md) and
[revenue registry](business/REVENUE_EXPERIMENTS.md). Personal data is never a
revenue product, and a commercial relationship cannot affect score, ranking,
methodology or recommendation.

## Current execution order

1. **P0 / NOW:** classify Vercel's retained deployments and execute only
   reviewed deletion candidates, preserving production and rollback safety.
2. **P0:** validate GA4 and Search Console production data, then start the
   weekly operating record.
3. **P1:** close one Ireland graph gap with a source-backed, publication-gated
   slice before building a broad matching engine.
4. **P2:** build a transparent Degree Match MVP only after the Ireland slice
   supplies enough connected degree, career and education evidence.
5. **P3+:** consider career outlook, Country Match, demand-led SEO/data
   expansion, action layers, retention and commercial work in that order when
   evidence supports each gate.

## Phase 9 completion status

The Phase 9 operating-system foundation is ready: its cadence, evidence
standards, decision-engine boundaries, expansion queue, Ireland depth test,
design review and operational runbooks are established. Vercel resource
remediation is the first P0 / NOW execution task, but deletion pending exact
operator review does not block the operating-system foundation.

**Verdict: MASTER OPERATING SYSTEM READY**
