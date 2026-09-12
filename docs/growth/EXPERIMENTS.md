# Growth experiment registry

Last reviewed: 12 September 2026

Use this registry after a consented production baseline exists. One change must
test one hypothesis. A status is **Proposed**, **Running**, **Won**, **Lost** or
**Inconclusive**; do not infer a result from implementation alone.

## Record template

```text
ID:
Status:
Hypothesis:
Audience / surface:
Baseline metric and observation window:
Change:
Primary metric:
Guardrails:
Observation window:
Evidence:
Decision:
```

## P7-01 — shareable completed Career comparison

| Field | Record |
| --- | --- |
| Status | Proposed — ready to observe after the production release and GA4 DebugView validation. |
| Hypothesis | A visible, privacy-safe share action on a completed Australian Career comparison increases useful result sharing without reducing comparison completion. |
| Surface | `/compare?type=career…` after two or three selected Careers. |
| Baseline | Collect the first stable consented `compare_view` and `compare_complete` baseline before judging. |
| Change | Normalized native/clipboard share action, result-specific metadata and `compare_share` event. |
| Primary metric | `compare_share / compare_complete`. |
| Guardrails | `compare_complete / compare_view`, Decision Sessions, noindex/canonical behaviour, keyboard use, LCP and CLS. |
| Observation | At least two weekly review cycles with stable event delivery; extend if volume is insufficient. |
| Evidence | Not yet available. |
| Decision | Do not expand sharing to other Compare modes until this result and the direct-share usability are observed. |

## Experiment selection rules

Prioritise an experiment only when it has a measurable journey problem,
reliable data and a clear owner. Pause it when it harms evidence clarity,
performance, accessibility, canonical behaviour or the Career-first product
flow. Do not run competing Compare CTA and share-layout changes at the same
time, because attribution would be ambiguous.
