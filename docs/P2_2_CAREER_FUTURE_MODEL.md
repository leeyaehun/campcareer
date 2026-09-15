# P2.2 Career Future Intelligence Model

P2.2 derives an explainable domain model from the P2.1 Ireland raw evidence registry. It is model logic only: no Career-page UI, no cohort expansion, no normalization, no CampCareer Score changes and no new evidence collection.

## Architecture

`P2.1 raw evidence → deterministic signal derivation → Ireland Career Future model API`

`src/lib/career-future-intelligence-model.ts` returns one finished object for each of the six reviewed Ireland Careers. Each signal carries status, direction where defensible, P2.0 evidence level, source-native display text, bounded interpretation, raw evidence keys, proxy disclosure, geography and reference period. `normalizedSignals` and numeric score fields do not exist in the derived model.

## Signal rules

- **Demand:** shortage assessment is a positive direction when the source says shortage/difficult-to-fill. Employment context is retained as raw context and is never treated as current vacancies, sector size or a guarantee. Proxy mappings are `limited`.
- **Growth:** the source's 2019–2024 annual average is displayed as historical growth. It is never labelled as a projection. Direction is deterministic from the signed source value.
- **Stability:** all six remain unavailable because P2.1 found no reproducible multi-period Ireland occupation persistence/volatility series.
- **AI Exposure:** all six remain unavailable. Global OECD/ILO task evidence has no verified SOC 2010 Ireland crosswalk; no disappearance, automation or job-loss probability is inferred.
- **Skills Change:** all six remain unavailable because no comparable Ireland occupation skill-change series with a verified crosswalk exists.
- **Outlook:** broader SOLAS/Cedefop 2021–2035 projection context is shown as a limited broader proxy. Outlook direction is a transparent synthesis of cited demand, historical growth and projection evidence; conflicting directions produce `mixed`, never a magic aggregate score.

## Ireland six-career result

Demand is `available/positive` for Software Developer, Civil Engineer and Radiographer, and `limited/positive` for Cybersecurity Analyst, Data Engineer and Construction Manager. Growth is `available/positive` only where the source series is verified and otherwise `limited/positive`; every display explicitly says historical. Outlook is `limited/positive` for all six because the projection is broader-group context. Stability, AI Exposure and Skills Change are `unavailable/unknown` for all six.

## Trust boundaries

Exact, narrower and composite occupation mappings remain visible through `exact`, `proxy` and `broader_proxy`. Global geography remains global. Missing evidence remains unavailable with null display values. No 0–100 values, neutral placeholders, sector-demand substitutions or hidden Future Score are created. The output order is the canonical P2.1 six-career order and the six P2.0 signal keys.

## Files changed

- `src/lib/career-future-intelligence-model.ts`
- `tests/p2-2-career-future-model.test.ts`
- `docs/P2_2_CAREER_FUTURE_MODEL.md`

## Validation

Focused P2.2 tests: 8 passed. Full unit suite: 1,933 passed. Typecheck, lint and production build passed. `git diff --check` passed. Lint reports existing repository warnings only.

## P2.3 UI input contract

P2.3 can consume `getIrelandCareerFutureIntelligence(careerId)` and render `signals` directly. Components should display `status`, `direction`, `displayValue`, `interpretation`, `confidence`, `proxyDisclosure`, `geography`, `referencePeriod` and evidence links without performing evidence normalization or score calculations.
