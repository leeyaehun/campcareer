# P3.2 — Ireland Degree Match Model

Status: Implemented

Builds an explainable, bidirectional Degree Match domain model on top of the
P3.0 contract and the P3.1 Ireland evidence registry. No UI, no routes, no
numeric scores and no cohort expansion.

## Raw evidence → derived model

- `src/lib/degree-match/ireland-evidence.ts` (P3.1) is the single truth for
  relationships and aliases (`IRELAND_DEGREE_MATCH_RELATIONS`,
  `IRELAND_DEGREE_MATCH_ALIASES`).
- `src/lib/degree-match/ireland-model.ts` (P3.2) derives a typed, categorical
  view per Career and exposes it through two APIs.

Derivation: each P3.1 relation is enriched at build time into a
`IrelandCareerDegreeMatch` row containing:

- identity (`careerId`/`careerLabel`, `degreeId`/`degreeLabel`, `countryCode`)
- `relationshipType` (contract vocabulary)
- `relationshipStrength` and `confidence` (kept independent)
- `status` (`available` | `limited` | `unavailable`) — derived from confidence
  only; never a numeric score
- reasoned `rationale` (plain-language, Ireland-specific)
- `additionalQualification.state` and `regulation`
- `evidenceDirectness` and `evidenceReferences` (traceable to P3.1 evidence ids)
- `missingEvidenceReasons` for estimated confidence

## APIs (bidirectional, single source)

- `getIrelandCareerDegreeMatches(careerId)` → Career → Degree(s)
- `getIrelandDegreeCareerMatches(degreeId)` → Degree → Career(s)

Both read the same derived rows, so results are structurally identical and
cannot diverge. There is no duplicated Degree→Career table.

## The six Ireland relations

| Career | Degree | Relationship | Confidence | Evidence directness |
| --- | --- | --- | --- | --- |
| software-developer | computer-science | common | estimated | mixed |
| cybersecurity-analyst | cybersecurity | common | estimated | mixed |
| data-engineer | data-science | alternative | estimated | proxy |
| civil-engineer | civil-engineering | direct | verified | direct |
| construction-manager | construction-management | direct | estimated | mixed |
| radiographer | diagnostic-radiography | direct | verified | direct |

## Missing evidence handling

Estimated/limited-evidence relations keep their `missingEvidenceReasons` and
stay `limited`; nothing is coerced to weak, neutral or zero. The P3.0 contract
forbids treating a missing measure as a zero component; the model never invents
a low value for an absent measure.

## Degree vs Programme boundary

The model reasons about canonical Degrees (e.g. `civil-engineering`), not
individual programmes (`institutionId` and `programmeId` are absent). Programme
row evidence may support a relationship but no Programme is published by P3.2.

## Regulation and professional eligibility

- civil-engineer: accredited programme required (Engineers Ireland); displayed,
  not scored.
- radiographer: professional registration required (CORU Radiographers
  Registration Board). The Degree Match explicitly states that the Degree does
  not grant permission to practise, so the UI/UX must call out registration
  before practice.
- Tech careers (software-developer, cybersecurity-analyst, data-engineer) are
  not legally regulated; the model states the Degree is not a verified
  statutory requirement.

## Non-goals

P2 Future Intelligence (demand, growth, stability, exposure) is not mixed into
this model. P3.2 adds no routes, components, or publication gates; it only
prepares the data contract a P3.3 consumer (Career Page or Compare) would bind
to.

## Suggested P3.3 input contract

A future UI consumer should read `IRELAND_DEGREE_MATCH_MODEL` rows only, render
`relationshipType`, `relationshipStrength`, `status`, `reasoning` and
`regulation.summary` (no numbers), and route the user to external regulator
guidance for regulated careers.