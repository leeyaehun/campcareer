# Growth opportunity review

Last reviewed: 12 September 2026

Run this review weekly during quiet launch, then fold it into the existing
weekly and monthly operating reviews. It is a decision record, not a queue for
automatic page generation.

## Inputs

| Input | Review question | Possible action |
| --- | --- | --- |
| Search Console queries and pages | Which query/page combinations have meaningful impressions, clicks or low CTR? | Improve the existing canonical answer, clarify metadata, or investigate a data gap. |
| Organic landing sessions | Which canonical landing pages lead to Decision Sessions and which do not? | Improve journey clarity or evidence on the existing page. |
| Internal search | Which safe terms repeat, and which have `result_count = 0`? | Add an alias, improve search, assess Country/Degree data or consider an entity only after validation. |
| Compare | Which modes have strong `compare_view`, completion or share demand? | Improve an existing decision utility, not a new page family by default. |
| Related entity flow | Where does `cross_entity_navigation` progress or stop? | Fix a contextual relationship where it answers a real decision question. |
| Feedback and data operations | Are repeated requests or evidence gaps blocking an existing decision? | Prioritise source/data work under the publication gate. |

## Priority model

Use qualitative priority and record the reason. Do not invent a weighted score
before there is enough real traffic and data.

- **High** — repeated demand, strong Career/product relevance, reliable data
  available, clear existing-page or graph action, and an observable Decision
  Session outcome.
- **Medium** — promising signal, but data, intent, relationship or maintenance
  commitment needs validation.
- **Low** — one-off query, weak decision relevance, unclear source quality,
  duplicate/thin-page risk or no maintainable path.

An opportunity cannot advance into a page, data or localization change unless
it passes the programmatic-page and publication gates in
[`PHASE_7_GROWTH_ENGINE.md`](../PHASE_7_GROWTH_ENGINE.md).

## Weekly review record

| Date | Signal | Existing canonical page / feature | Data readiness | Priority | Proposed action | Metric and guardrail | Owner | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _Add observed data only_ |  |  |  |  |  |  |  |  |

## Required checks

1. Review the representative Search Console URL set from the launch runbook:
   Home, Careers discovery, one published Career, Country, Program,
   Institution, Compare and Data policy.
2. Check GA4 DebugView after affirmative consent before trusting product-event
   totals. `compare_view`, `compare_complete`, `compare_share` and
   `decision_session` must use their documented names and safe parameters.
3. Group zero-result search terms by repeated intent; omit any term rejected by
   analytics sanitisation and never copy PII into this record.
4. Test whether the existing canonical product page can answer the demand
   before proposing a new route.
5. Record whether a proposed change adds any indexable URL. The default answer
   is zero.

## Decisions

Choose one: **Improve existing page**, **Improve internal discovery**, **Queue
data validation**, **Run a single experiment**, **Monitor**, or **Decline**.
For every decision, retain the source period, evidence owner, indexability
effect and next review date. A low-traffic page is not a deletion reason by
itself; evaluate usefulness, evidence, indexing and graph value first.
