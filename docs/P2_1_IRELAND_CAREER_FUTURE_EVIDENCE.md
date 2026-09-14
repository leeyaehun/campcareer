# P2.1 Ireland Career Future Evidence

P2.1 establishes a raw-evidence layer for the existing six-career Ireland cohort. It does not publish a Future Intelligence surface, calculate normalized values, change CampCareer Score, or add Careers.

## Scope and audit

The durable cohort remains the six IDs in `IE_CAREER_COMPARE_IDS`: software-developer, cybersecurity-analyst, data-engineer, civil-engineer, construction-manager and radiographer. Existing `wave-a-career-foundation` records contain labour-market observations and forward projections, but also legacy normalized components and score-shaped fields. Those normalized values are intentionally not copied into this layer. Existing vacancy averages, `CareerMarketDemand.rating`, pilot AI bands, degree-risk market-demand fields and free-form score evidence remain legacy/conflicting contracts; P2.1 does not migrate or refactor them. Pay evidence and the Ireland employment ecosystem are contextual and are not future-intelligence signals.

## Contract and source hierarchy

The implementation uses the P2.0 typed contract in `src/lib/career-future-intelligence-contract.ts`. Every observation preserves source, raw value, unit, geography, occupation mapping, reference period, checked date, evidence level, availability and limitations. `normalizedSignals` is always `null`.

Preferred hierarchy, in order: official occupation classification; official labour-market series; official task/skill dataset; transparent peer-reviewed research; validated market data; official sector proxy only when explicitly labelled. Editorial or AI summaries are not evidence. Ireland evidence is `scope: country`, `countryCode: IE`; global AI research is retained only as a documented unavailable boundary and never becomes Ireland truth.

## Signal coverage

| Signal | Six-career result | Boundary |
| --- | --- | --- |
| Demand | NSB 2025 shortage/employment context for each career; direct for software developer, civil engineer and radiographer, broader-group proxy for the other three | Not current vacancies; sector size is not occupation demand |
| Growth | NSB 2019–2024 observed employment change | Historical change is not current demand or a personal forecast |
| Stability | Unavailable for all six | No reproducible multi-period occupation volatility/persistence series found |
| AI Exposure | Unavailable for all six | OECD/ILO measures are global task evidence without a defensible SOC 2010 Ireland crosswalk; exposure is not disappearance probability |
| Skills Change | Unavailable for all six | No comparable Ireland occupation skill-change series with verified crosswalk |
| Outlook | SOLAS/Cedefop 2021–2035 broader-group projection context for each career | Proxy context, not a seventh score or recommendation |

The exported `IRELAND_FUTURE_COVERAGE_MATRIX` contains exactly 36 cells (6 careers × 6 signals), each classified `direct`, `proxy` or `unavailable`.

## Occupation mappings

| Career | Mapping | Relation / confidence |
| --- | --- | --- |
| Software Developer | SOC 2010 2136 — Programmers and software development professionals | exact / high |
| Cybersecurity Analyst | SOC 2010 2139 — IT and telecommunications professionals n.e.c. | narrower close proxy / medium |
| Data Engineer | SOC 2010 2135 — IT business analysts, architects and systems designers | narrower close proxy / medium |
| Civil Engineer | SOC 2010 2121 — Civil engineers | exact / high |
| Construction Manager | SOC 2010 2436 — Construction project managers and related professionals; secondary SOC 1122 site-manager scope | composite close proxy / medium; broader proxy / low |
| Radiographer | SOC 2010 2217 — Medical radiographers | exact / high |

Mappings are never silently merged. The secondary construction-manager mapping is retained as a separate proxy.

## Evidence and trust boundaries

Raw values retain employment counts, source-published growth percentages, shortage wording and projection baselines/net changes. No derived score or arbitrary band is present. Missing evidence is `rawValue: null`, `availability: missing`, `evidenceLevel: unavailable`, with an explicit reason; it is never zero or average. Outlook rows identify their broader group and horizon. Country-specific rows cannot be read as global Career truth. Any future normalization must be deterministic, versioned, denominator-aware and separate from raw evidence.

Reviewed authoritative sources: CSO SOC 2010; SOLAS National Skills Bulletin 2025; SOLAS/Cedefop Skills Forecast 2023 (Ireland); OECD AI exposure measure (2026); ILO refined global generative-AI exposure index (2025). Global AI sources were rejected for Ireland publication without a verified crosswalk.

## Files and validation

Changed files:

- `src/data/ireland-career-future-evidence.ts`
- `docs/P2_1_IRELAND_CAREER_FUTURE_EVIDENCE.md`

Focused P2.1 tests should validate cohort identity, 6×6 coverage, contract shape, explicit geography/source/date, mapping relations, null missing values, raw/normalized separation and absence of UI or score changes. Full repository validation is recorded in the task handoff after execution.

## Recommended P2.2 inputs

1. Obtain a reproducible Ireland occupation longitudinal series before attempting Stability.
2. Establish and review a SOC 2010 ↔ OECD/ILO task crosswalk before any Ireland AI Exposure publication.
3. Source a coded Ireland skills-change series with two comparable periods.
4. Define a founder-reviewed deterministic normalization policy only after those raw gaps are closed.
5. Keep Outlook as cited, bounded evidence synthesis; do not introduce a composite score.
