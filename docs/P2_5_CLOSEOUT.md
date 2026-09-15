# P2 — Career Future Intelligence: Closeout

## Objective

Close P2 by validating that the P2.0 contract → P2.1 raw evidence → P2.2 derived
model → P2.3 Career detail UI → P2.4 discovery/Compare integration behaves as one
coherent system. No new product behavior was added in P2.5; the phase was audited,
regression-tested and documented as final.

## Final six-career cohort (Ireland only)

- Software Developer
- Cybersecurity Analyst
- Data Engineer
- Civil Engineer
- Construction Manager
- Radiographer

The cohort is a single source of truth: `IE_CAREER_COMPARE_IDS` in
`src/lib/ireland-career-comparison.ts`. The model, evidence registry, discovery
filter and Compare rows all derive from it. Nothing outside the six can receive
Future Intelligence, and no URL/query parameter can expand the cohort.

## Six Future signals

1. Demand
2. Growth
3. Stability
4. AI Exposure
5. Skills Change
6. Outlook

Outlook is a transparent synthesis of Demand + Growth + the SOLAS/Cedefop
projection. There is deliberately no numeric Future Score.

## Architecture

```
P2.1 raw evidence            src/data/ireland-career-future-evidence.ts
   │  (record + rawValue + availability + reason)
   ▼
P2.2 derived model           src/lib/career-future-intelligence-model.ts
   │  (status/direction/confidence/displayValue, one normalization)
   ▼
P2.0 contract                src/lib/career-future-intelligence-contract.ts
   │  (signal keys, types, boundaries consumed everywhere)
   ▼
P2.3 Career detail UI        src/app/(workspace)/career/career-future-outlook.tsx
   │                          src/lib/career-future-intelligence-ui.ts
   ▼
P2.4 discovery + Compare     src/lib/career-future-discovery.ts
                              src/lib/career-future-compare.ts
                              explorer + ireland-careers-compare-matrix.tsx
```

The UI never reinterprets or normalizes raw evidence: every displayed value
comes from the derived model, and raw evidence is touched once, inside the model,
when provenance metadata is requested.

## Known evidence gaps

- Stability: unavailable for all six — no reproducible multi-period Ireland
  occupation stability series found in reviewed official releases.
- AI Exposure: unavailable for all six — OECD/ILO task measures are global and no
  defensible SOC 2010 crosswalk supports an Ireland-specific claim.
- Skills change: unavailable for all six — no comparable Ireland skill-change
  series with a verified crosswalk.
- Growth and Outlook for five of six careers use broader occupation-group proxy
  evidence (all labelled as proxy); only Software Developer growth is exact.
- Demand for Cybersecurity Analyst, Data Engineer and Construction Manager is
  proxy/estimated coverage; Software Developer, Civil Engineer and Radiographer
  are direct.

## Trust boundaries (verified intact)

- Demand is a shortage assessment, never a vacancy count or a job guarantee.
- Sector/size is never treated as Career demand.
- Growth is historical (2019–2024 annual average), never labelled a projection.
- Stability is never inferred from employer size.
- AI Exposure is task exposure, never job-loss probability.
- Missing evidence stays "unavailable", never zero or negative.
- Proxy evidence is always identifiable (proxy / broader-proxy disclosure).
- Global evidence is never silently labelled Ireland-specific.
- Outlook is qualified context, never a personal recommendation.
- No arbitrary numeric Future Score exists anywhere.

## Intentionally NOT implemented

- No Future Score, rating, ranking or winner across all P2 surfaces.
- No numeric thresholds on discovery filters (categorical tokens only).
- No indexable programmatic Future pages; `/careers` base indexation and
  query-state noindex behaviour are unchanged; `/compare` stays noindex/nofollow.
- No Future permutations in the sitemap.
- No account gating, no personalisation, no new analytics events (P2 reuses
  existing `filter_apply`/`filter_clear`/`search` events).
- No new Careers, signals, employer/programme/institution/city expansion.

## What P3 can safely build on

- The contract/types and derived model are read-model stable and safe to extend.
- A future P3 could add country-career records by extending the evidence registry,
  then building off a non-IE cohort — the pipeline and boundaries are proven.
- Any normalization/scoring must publish a versioned, deterministic rule and stay
  explainable to the cited evidence (per P2.0 normalization boundaries).
- Browser checks in P2.5 covered `/career/ireland/software-developer`,
  `/career/ireland/radiographer`, `/careers?country=IE` and the Ireland Compare for
  Software Developer + Civil Engineer.