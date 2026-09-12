# Ireland Golden Slice — Career Decision Readiness

Last reviewed: 12 September 2026

## Purpose

Define the first Ireland Career cohort and the evidence required before a Career
can be treated as decision-ready inside the Ireland Golden Slice.

This document does not make an Ireland Career score-ready by itself. It defines
the gate that later data work must satisfy.

## Two different gates

Ireland needs two explicit readiness levels.

### Gate A — Career Decision Ready

A Career is Career Decision Ready when a user can understand and compare:

- what the occupation actually maps to in Ireland;
- current demand;
- comparable pay;
- entry route and burden;
- regulation/registration where applicable;
- the evidence and any proxy boundary.

A provisional legacy component total is not enough.

### Gate B — Golden Slice Journey Ready

A Career is Golden Slice Journey Ready only when Gate A passes **and** the
education graph is complete enough to continue the decision journey:

`Career → Degree/Program → Institution → City → Compare`

At minimum this requires:

- at least one publication-authorized Ireland Program relation;
- a real verified Institution;
- a verified location/city relation;
- an official Program source;
- visible trade-offs or an alternative where more than one option exists.

A Career may pass Gate A before it passes Gate B.

## Public score evidence contract

CampCareer Score v1 is:

`Demand 40% + Pay 30% + Entry 30%`

The strict public evidence gate already expects the following non-visa
components to have real evidence:

### Demand

1. `shortage_signal`
2. `vacancy_intensity`
3. `industry_diversity`
4. `employment_momentum`
5. `projected_growth`

### Pay

6. `relative_salary`

### Entry

7. `entry_accessibility`
8. `entry_burden`

For Ireland, all eight public components must be `available`, have a finite
score value, and must not use a missing-evidence placeholder such as
`no_evidence_found` or `insufficient_industry_coverage`.

Visa evidence remains valuable context but is not part of the public
CampCareer Score.

## Evidence quality rules for Ireland

### Mapping

- Prefer an exact Irish occupation/classification mapping.
- A broader official occupation group may be used only when the exact metric is
  not published and the proxy boundary is explicit.
- Cross-SOC Careers such as Data Analyst require a written scope boundary.
- A famous job title must never be forced into an official code merely to
  obtain a metric.

### Demand

Preferred evidence order:

1. official Irish labour-market / government occupation evidence;
2. official statistical occupation series;
3. explicitly mapped broader official occupation group;
4. conservative fallback that is documented and comparable.

A zero caused by missing evidence is not a demand observation.

### Pay

- Prefer comparable current Irish occupation earnings.
- If exact occupation pay is unavailable, a broader official occupation proxy
  can be accepted only with `directness=proxy`, a clear `proxy_reason`, and
  adequate mapping quality.
- Public-sector pay scales may support regulated-profession context but should
  not silently become the universal cross-sector salary statistic.
- Legacy estimated institution earnings are not Career salary evidence.

### Entry

Entry evidence must describe the real path into the occupation, including:

- qualification/training route;
- regulator or registration requirement where applicable;
- apprenticeship or alternate entry routes where they genuinely exist;
- material licensing/credential burden.

### Freshness

- Current policy, permit, registration and program eligibility must be checked
  against current official sources at publication.
- Statistical evidence may use the latest available official period even when
  the reference period is older, but the reference period and check date must
  both remain visible.
- A newer unofficial number does not automatically supersede an older official
  statistic.

## First Ireland cohort

The first cohort remains 12 Careers, but implementation is split into two waves.

### Wave A — existing graph is strongest

1. Software Developer
2. Cybersecurity Analyst
3. Data Engineer
4. Civil Engineer
5. Construction Manager
6. Accountant
7. Architect
8. Radiographer

These Careers already combine useful Ireland source coverage with at least one
canonical Program relation.

### Wave B — intentional gap/complexity work

9. Data Analyst
10. Financial Analyst
11. Registered Nurse
12. Pharmacist

Reasons:

- **Data Analyst:** cross-SOC scope needs especially careful mapping and metric
  proxy discipline.
- **Financial Analyst:** education depth exists but current demand evidence is
  weak and only one canonical Program relation exists.
- **Registered Nurse:** high-value Ireland Career with strong regulator/demand
  context, but zero canonical Ireland Program relations today.
- **Pharmacist:** regulated and strategically useful, but zero canonical
  Ireland Program relations today.

Wave B is not lower product importance. It is separated because it requires
more gap-filling before the full graph can pass.

## Current readiness matrix

All 12 Careers currently have:

- an Ireland profile;
- `publication_status = profile_ready`;
- a provisional metric snapshot;
- no normalized salary value;
- no normalized employment total;
- no normalized vacancy series;
- no normalized 5-year growth;
- no normalized 10-year growth.

Therefore **none of the 12 currently passes Gate A**.

| Career | Existing sources/links | Canonical Program links | Regulation | Main blocker |
| --- | ---: | ---: | --- | --- |
| Software Developer | 2 | 4 | No | Pay + vacancy + momentum + growth evidence |
| Cybersecurity Analyst | 3 | 2 | No | Pay + vacancy + momentum + growth evidence |
| Data Engineer | 2 | 2 | No | Pay + vacancy + momentum + growth evidence |
| Civil Engineer | 3 | 1 | No statutory registration | Pay + vacancy + momentum + growth evidence |
| Construction Manager | 3 | 3 | No | Pay + vacancy + momentum + growth evidence |
| Accountant | 4 | 2 | Context-dependent professional qualification | Pay + vacancy + momentum + growth evidence |
| Architect | 4 | 2 | Yes — RIAI statutory registration body | Pay + vacancy + momentum + growth evidence |
| Radiographer | 3 | 1 | Yes — CORU | Pay + vacancy + momentum + growth evidence |
| Data Analyst | 2 | 2 | No | Cross-SOC mapping + full market evidence |
| Financial Analyst | 2 | 1 | No universal registration | Full demand/pay evidence + shallow education graph |
| Registered Nurse | 4 | 0 | Yes — NMBI | Market metrics + missing canonical Program graph |
| Pharmacist | 3 | 0 | Yes — PSI | Market metrics + missing canonical Program graph |

## Existing component signal is not enough

Several Ireland legacy snapshots already credit shortage, entry and visa
components. For example:

- Software Developer currently has an internal provisional score of 43.
- Civil Engineer currently has an internal provisional score of 43.
- Registered Nurse currently has an internal provisional score of 39.

Those values are **not** public decision-ready scores because salary, vacancy,
employment momentum and growth coverage remain absent. The Golden Slice must
not rank Careers using these partial totals.

## Completion definition per Career

A Career can be added to the Ireland public decision-ready inventory only when
all of the following are true:

1. Canonical occupation scope reviewed.
2. Current source mapping recorded.
3. Five Demand components contain acceptable evidence.
4. Relative Pay contains acceptable evidence.
5. Entry accessibility contains acceptable evidence.
6. Entry burden contains acceptable evidence.
7. Regulated-profession requirement is correct and current.
8. Proxy use is explicit and traceable.
9. Score reconstructs deterministically from the stored components.
10. The public score readiness allowlist is updated only after evidence review.
11. Career page shows source period/check date and does not overstate precision.
12. For Golden Slice Journey Ready, at least one Tier A Program route continues
    to a verified Institution and City.

## Implementation sequence

### Step 2A — evidence-source map

For each Wave A Career, identify the best available Irish source for every
missing public component and record exact-vs-proxy mapping.

### Step 2B — normalize Wave A Career evidence

Populate the Career Data Foundation model rather than extending the old
provisional snapshot pattern.

Use the existing pipeline:

`Raw observation → Normalized metric → Score component → Public readiness`

### Step 2C — validate scoring

For each Career:

- no missing-evidence zero masquerades as a real zero;
- proxy reason is explicit;
- component maximums align with CampCareer Score v1;
- source/check dates are present;
- score reconstruction is deterministic.

### Step 2D — Wave B gap fill

After Wave A is stable:

- resolve Data Analyst mapping;
- deepen Financial Analyst education/demand evidence;
- add verified Nursing programs;
- add verified Pharmacy programs.

## Operational verdict

**COHORT DEFINED — EVIDENCE NORMALIZATION REQUIRED.**

No manual user action is required for this specification stage. The next
engineering/data task is Step 2A: build the Ireland evidence-source map for
Wave A and determine which missing components can be filled from official
sources without weakening the existing quality contract.
