# P2.0 Career Future Intelligence Contract

Status: contract-only; no new data, UI, score, migration or publication is introduced by P2.0.

## Purpose and boundaries

Future Intelligence is a planned evidence layer for the existing Career decision flow. It helps a user judge whether investing in a career may be sensible, while preserving the current hierarchy:

`Career → CampCareer Score → Evidence → Path → Study / Programs → Jobs`

P2.0 defines durable types and evidence rules only. It does not add Career rows, collect data, expose new frontend sections, or change CampCareer Score v1. The six reviewed Ireland Golden Slice careers remain the trust-boundary cohort:

`software-developer`, `cybersecurity-analyst`, `data-engineer`, `civil-engineer`, `construction-manager`, `radiographer`.

Durable identity is always `country_code + career_id`; a country result is not silently global truth.

## Current Career intelligence audit

The existing Career Data Foundation is the strongest starting point. It already separates `career_raw_observations`, `career_normalized_metrics`, score components, source records, occupation mappings, reference periods, checked dates, evidence status and confidence. The public score gate and the coverage inventory correctly keep missing evidence from becoming a public score.

The following existing fields are retained for compatibility but are not P2.0 Future Intelligence truth:

| Existing field/surface | Conflict or boundary |
| --- | --- |
| `CountryOccupationMetric.vacanciesThreeMonthAvg` / `vacancyPeriod` | A point-in-time vacancy series is one Demand input, not Demand itself. It needs definition, denominator, geography and persistence. |
| `employmentGrowth5yPct` / `employmentGrowth10yPct` | Useful raw change observations, but they do not define Growth until horizon, baseline, occupation scope and projection method are explicit. |
| `metric.score.growth` and `growth_component` | Legacy internal scoring output; it must not be reused as a P2.0 normalized Growth signal. |
| `CareerMarketDemand.rating` and free-form `note` | Lacks a typed raw evidence shape, classification scope and country/global boundary. |
| `au-major-signals` `ai_exposure_band` / `aiNote` | Editorial/seed values have no common task framework or cross-country contract; they are not probability of job loss. |
| `PilotOccupation.stabilityScore` and Japan `stabilityScore: null` | Score-like values have no shared meaning or longitudinal evidence contract. Keep quarantined until migrated deliberately. |
| degree-risk `market_demand_score`, `ai_exposure_band` and layer metadata | A separate degree-risk product vocabulary; do not merge into Career Future Intelligence without an explicit mapping and provenance review. |
| Ireland employment ecosystem | Explicitly reviewed employer/industry context, not a vacancy or occupation-demand signal. |
| `scoreEvidence` JSON and editorial notes | Valuable audit context, but free-form JSON cannot substitute for the typed evidence object below. |

No broad migration or refactor is justified in P2.0. Existing P1 score, Pay policy, publication gate and Ireland cohort remain authoritative.

## Final signal definitions

The canonical definitions live in `src/lib/career-future-intelligence-contract.ts` as `CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS`.

| Signal | Meaning | Explicit non-meaning |
| --- | --- | --- |
| Demand | Sustained employer need for the occupation in a stated geography, using shortage pressure, employment, vacancy intensity and/or openings over a stated period. | Not current vacancy count alone, sector size/GDP, salary, visa eligibility or a job guarantee. |
| Growth | Observed or projected change in occupation employment/opportunities over a stated horizon. | Not current demand, sector growth/policy ambition without occupation linkage, or an individual income/promotion forecast. |
| Stability | Resilience and continuity of occupation employment from persistence, volatility, cyclicality or replacement evidence. | Not permanent job security, an individual retention promise, shortage, pay or AI exposure by itself. |
| AI Exposure | Task-level exposure to AI capability for augmentation or substitution under an explicit framework. | Not probability of a job disappearing, layoffs, individual employability or whole-occupation replacement. |
| Skills Change | Observed change in skills, tasks, tools or requirements attached to an occupation over named periods. | Not a generic skills list, AI Exposure, or a mandate that every worker learn every skill. |
| Outlook | A bounded forward interpretation anchored in cited signal evidence and an explicit horizon. | Not a seventh score, hidden total, AI-generated prediction, ranking or global truth. |

Every raw observation carries source, raw value, unit, geography, occupation mapping (when applicable), reference period, checked date, availability, evidence level and an explicit missing reason. `normalizedSignals` is intentionally `null` in P2.0.

## Source hierarchy

The typed contract uses these ordered source tiers per signal:

1. Official occupation statistics/projections or official occupation outlooks.
2. Official labour-market, task or skills datasets (as appropriate to the signal).
3. Peer-reviewed research with a transparent method.
4. Official sector proxies, only when clearly labelled as proxies.
5. Validated market datasets with coverage and denominator disclosure.
6. Editorial or AI summaries are context only and cannot create a signal or score.

An official source is not automatically occupation-specific. Broader groups require a mapping relation, quality and rationale. Private job boards may corroborate context but cannot silently become country-wide demand truth.

## Evidence and confidence model

`verified` means direct, reproducible, current evidence at the Career's occupation and geography. `estimated` means a defensible broader occupation group, documented crosswalk or validated market proxy. `limited_evidence` means directional or coverage-limited evidence. `unavailable` means no defensible evidence exists.

Confidence never changes raw values and is separate from any future normalized display. A missing observation has `availability: "missing"`, `rawValue: null`, `evidenceLevel: "unavailable"` and a human-readable `missingReason`.

## Normalization boundary

P2.0 defines no 0–10 bands, ranking, composite, or AI-generated number. Any later normalization must be deterministic, versioned, source-reproducible, geography/occupation aware, and explainable from raw evidence. Raw evidence and normalized/display signals must remain separate tables/types. Outlook may not become a hidden total.

## Missing-data policy

Missing is not zero, neutral, average, “no change” or a low-risk default. A signal with no defensible evidence is unavailable; a partial outlook must say which supporting signal is missing. Country evidence cannot be promoted to global truth. Public readiness and P1 CampCareer Score rules remain unchanged.

## Recommended P2.1 order (not started)

1. Inventory and map candidate official sources for the Ireland six-career cohort, preserving exact country + Career identity and occupation crosswalks.
2. Implement raw evidence ingestion/storage and lineage checks using the P2.0 shape; do not normalize yet.
3. Pilot Demand, Growth and Stability with one source-backed Ireland Career and independent review of missing-data behavior.
4. Add task-level AI Exposure and Skills Change only where transparent, occupation-mapped sources exist.
5. Add Outlook as a cited synthesis after component evidence is present; publish no new UI until product review approves interpretation and normalization.
