# Career Coverage Inventory

Snapshot date: 2026-09-12

This document is the operating inventory for expanding CampCareer from a reference Career Page into a country-by-country Career Score database plus action pathways.

The canonical unit is:

`country_code + career_id -> CampCareer Score -> Evidence -> Path -> Study / Programs -> Jobs`

This inventory covers the 20 launch countries x 80 canonical careers = 1,600 country-career combinations.

## Status definitions

### Ready

The country-career profile exists, the inputs needed by CampCareer Score v1 have usable evidence for all required public dimensions, and the profile is already marked `decision_ready`.

A Ready row can be used for a public Career Page and content production, subject to the normal source freshness checks.

### Needs one gap

Exactly one blocker remains before Ready.

A blocker may be one missing public-score input or the final publication review.

This is the highest-priority expansion queue because one targeted piece of work can make the row publishable.

### Profile ready

The country-career profile exists, but two or more blockers remain.

The current legacy `opportunity_score` or provisional component total must not be treated as a public CampCareer Score when one of the required v1 inputs is actually missing.

### Not ready

No canonical country-career profile exists yet.

## Audit blockers

The audit does not treat a stored zero as evidence by itself. It checks whether the score input is supported by a usable data point or explicit evidence basis.

Blocker keys:

- `pay`: no defensible official occupation or occupation-group earnings measure that can be compared with the selected country's all-occupations earnings benchmark.
- `shortage`: no defensible shortage/no-shortage evidence for the shortage input.
- `vacancy_intensity`: no defensible vacancy-intensity input.
- `employer_diversity`: no defensible employer-diversity evidence basis.
- `demand_trend`: no defensible vacancy/demand-trend input.
- `growth`: no defensible employment-growth input.
- `entry_access`: no defensible structured-entry/access evidence.
- `entry_burden`: no defensible burden/licensing/registration evidence.
- `publication_review`: evidence may exist, but the profile has not yet passed the final decision-ready review gate.

For Pay, CampCareer prefers an exact official occupation earnings measure. If a more specific official median is unavailable, the closest defensible official occupation group may be used. Broader official-group evidence lowers Pay evidence confidence to `Estimated`; it does not make Pay missing. If no defensible official earnings measure exists, Pay remains unavailable. Missing Pay must never silently become a zero score.

## Country summary

| Country | Ready | Needs one gap | Profile ready | Not ready | Existing-profile avg blockers |
|---|---:|---:|---:|---:|---:|
| Australia | 11 | 8 | 61 | 0 | 2.2 |
| United Kingdom | 0 | 0 | 80 | 0 | 5.0 |
| Canada | 0 | 0 | 80 | 0 | 6.2 |
| United States | 0 | 0 | 64 | 16 | 4.1 |
| New Zealand | 0 | 0 | 47 | 33 | 5.0 |
| Ireland | 6 | 1 | 73 | 0 | 5.5 |
| Japan | 0 | 0 | 80 | 0 | 8.0 |
| South Korea | 0 | 0 | 80 | 0 | 8.0 |
| Singapore | 0 | 0 | 80 | 0 | 8.0 |
| Germany | 0 | 0 | 0 | 80 | — |
| Netherlands | 0 | 0 | 0 | 80 | — |
| Belgium | 0 | 0 | 0 | 80 | — |
| France | 0 | 0 | 0 | 80 | — |
| Spain | 0 | 0 | 0 | 80 | — |
| Norway | 0 | 0 | 0 | 80 | — |
| Sweden | 0 | 0 | 0 | 80 | — |
| Denmark | 0 | 0 | 0 | 80 | — |
| Finland | 0 | 0 | 0 | 80 | — |
| Switzerland | 0 | 0 | 0 | 80 | — |
| United Arab Emirates | 0 | 0 | 0 | 80 | — |

## Australia

### Pay reassessment policy and result

Australia Pay v1 compares a usable occupation earnings median with the Australian all-occupations median weekly earnings benchmark.

For the current JSA/ABS earnings dataset:

`relative premium = occupation or official group median weekly earnings / all-occupations median weekly earnings - 1`

The current Australian benchmark is AUD 1,852 per week.

Current Pay bands:

| Relative earnings vs all occupations | Pay |
|---|---:|
| below -20% | 1 |
| -20% to below -15% | 2 |
| -15% to below -10% | 3 |
| -10% to below -5% | 4 |
| -5% to below +5% | 5 |
| +5% to below +10% | 6 |
| +10% to below +15% | 7 |
| +15% to below +20% | 8 |
| +20% to below +25% | 9 |
| +25% or more | 10 |

A missing Pay measure is not Pay 0. It remains unavailable.

On 2026-08-15, 62 of the 67 Australian profiles that previously had a placeholder `salary_component = 0` were reassessed using the closest defensible official Jobs and Skills Australia ANZSCO earnings group. The source dataset is the ABS Survey of Employee Earnings and Hours, May 2025, customised report used by JSA occupation profiles. Exact or effectively exact occupation groups may be `Verified`; broader official groups are `Estimated` and are disclosed in score evidence.

Five Australian careers remain Pay-unresolved because no single defensible official median is currently available:

- `engineering-technician` — CampCareer umbrella spans several ANZSCO technician groups with materially different medians.
- `farm-manager` — relevant JSA farm-manager earnings groups do not publish a usable median.
- `horticulturist` — closest relevant JSA group does not publish a usable median.
- `hospitality-supervisor` — CampCareer umbrella spans several hospitality supervisor groups with materially different medians.
- `wall-floor-tiler` — the relevant JSA earnings group does not publish a usable median.

### Ready — 11

- `care-worker` — Demand 9 · Pay 5 · Entry 9 → 78 · Strong
- `carpenter`
- `electrician` — Demand 9 · Pay 8 · Entry 6 → 78 · Strong
- `medical-laboratory-technician` — Demand 1 · Pay 2 · Entry 7 → 31 · Tough
- `midwife`
- `occupational-therapist`
- `pharmacist` — Demand 4 · Pay 6 · Entry 5 → 49 · Challenging
- `physiotherapist`
- `radiographer` — Demand 6 · Pay 10 · Entry 6 → 72 · Strong
- `registered-nurse`
- `welder` — Demand 8 · Pay 4 · Entry 7 → 65 · Strong

These are the current content-production pool.

`medical-laboratory-technician`, `pharmacist`, and `radiographer` became Ready on 2026-08-15 after Pay was recalculated relative to the Australian all-occupations benchmark using the closest defensible official JSA earnings group. Their broader-group Pay evidence is marked `Estimated`; their score is not penalised for lower evidence confidence.

### Needs one gap — 8

Publication review only:

- `auditor`
- `chemical-engineer`
- `database-administrator`
- `environmental-engineer`
- `human-resources-specialist`
- `ict-support-technician`
- `industrial-engineer`
- `mechanical-engineer`

Their Pay blocker is now closed. No additional public Score input is currently missing under the revised Pay evidence policy; each needs final publication review before joining the Ready pool.

### Profile ready — 61

`vacancy_intensity + publication_review` — 15:

`accountant`, `business-analyst`, `civil-engineer`, `cloud-engineer`, `cybersecurity-analyst`, `data-analyst`, `data-engineer`, `electrical-engineer`, `financial-analyst`, `manufacturing-engineer`, `marketing-specialist`, `network-administrator`, `project-manager`, `software-developer`, `supply-chain-analyst`

`vacancy_intensity + employer_diversity + publication_review` — 13:

`chef`, `cook`, `counsellor`, `early-childhood-teacher`, `event-planner`, `hotel-manager`, `interior-designer`, `primary-school-teacher`, `restaurant-manager`, `secondary-school-teacher`, `tourism-manager`, `warehouse-manager`, `youth-worker`

`employer_diversity + publication_review` — 13:

`aircraft-maintenance-technician`, `architect`, `automotive-service-technician`, `baker`, `commercial-pilot`, `deck-officer`, `film-editor`, `logistics-coordinator`, `marine-engineer`, `social-worker`, `special-education-teacher`, `truck-driver`, `web-designer`

`pay + publication_review` — 2:

`engineering-technician`, `wall-floor-tiler`

`vacancy_intensity + employer_diversity + entry_burden + publication_review` — 8:

`agronomist`, `animal-science-technician`, `animator`, `forestry-technician`, `graphic-designer`, `multimedia-designer`, `sustainability-specialist`, `ux-designer`

`vacancy_intensity + demand_trend + publication_review` — 4:

`bricklayer`, `construction-manager`, `hvac-technician`, `plumber`

`vacancy_intensity + employer_diversity + demand_trend + growth + publication_review` — 1:

`community-worker`

`pay + vacancy_intensity + employer_diversity + demand_trend + growth + publication_review` — 1:

`hospitality-supervisor`

`employer_diversity + entry_burden + publication_review` — 2:

`environmental-scientist`, `food-technologist`

`pay + vacancy_intensity + employer_diversity + entry_burden + publication_review` — 1:

`horticulturist`

`pay + vacancy_intensity + employer_diversity + demand_trend + growth + entry_burden + publication_review` — 1:

`farm-manager`

## United Kingdom

All 80 canonical careers have profiles but remain `Profile ready` under the strict CampCareer v1 audit.

`vacancy_intensity + employer_diversity + demand_trend + growth + publication_review` — 79 canonical careers.

`registered-nurse` additionally has a `pay` blocker because the canonical roll-up currently has no defensible weighted pay measure across the six included SOC nursing groups.

## Canada

All 80 canonical careers have profiles but remain `Profile ready`.

Main blocker families:

- 37 careers: `vacancy_intensity + employer_diversity + demand_trend + growth + entry_access + publication_review`
- 22 careers: same blockers plus `entry_burden`
- 11 careers: `vacancy_intensity + employer_diversity + demand_trend + growth + publication_review`
- 7 careers: same base blockers plus `entry_burden`
- `engineering-technician`, `special-education-teacher`: add `pay`
- `project-manager`: add both `pay` and `entry_burden`

Canada has relatively strong pay coverage, but the old provisional score model assigns zero to several missing demand inputs. These rows must not be published as final CampCareer Scores until those inputs are evidenced or the scoring evidence model is deliberately revised.

## United States

### Profile ready — 64

56 careers:

`vacancy_intensity + employer_diversity + demand_trend + publication_review`

8 design careers additionally have a `shortage` blocker:

- `animator`
- `architect`
- `film-editor`
- `graphic-designer`
- `interior-designer`
- `multimedia-designer`
- `ux-designer`
- `web-designer`

### Not ready — 16

- `aircraft-maintenance-technician`
- `automotive-service-technician`
- `baker`
- `chef`
- `commercial-pilot`
- `cook`
- `deck-officer`
- `event-planner`
- `hospitality-supervisor`
- `hotel-manager`
- `logistics-coordinator`
- `marine-engineer`
- `restaurant-manager`
- `tourism-manager`
- `truck-driver`
- `warehouse-manager`

## New Zealand

### Profile ready — 47

All 47 canonical profiles currently share:

`vacancy_intensity + employer_diversity + demand_trend + growth + publication_review`

### Not ready — 33

- `agronomist`
- `aircraft-maintenance-technician`
- `animal-science-technician`
- `animator`
- `architect`
- `automotive-service-technician`
- `baker`
- `chef`
- `commercial-pilot`
- `cook`
- `deck-officer`
- `environmental-scientist`
- `event-planner`
- `farm-manager`
- `film-editor`
- `food-technologist`
- `forestry-technician`
- `graphic-designer`
- `horticulturist`
- `hospitality-supervisor`
- `hotel-manager`
- `interior-designer`
- `logistics-coordinator`
- `marine-engineer`
- `medical-laboratory-technician`
- `multimedia-designer`
- `restaurant-manager`
- `sustainability-specialist`
- `tourism-manager`
- `truck-driver`
- `ux-designer`
- `warehouse-manager`
- `web-designer`

### Identifier drift

The live NZ data contains the non-canonical legacy ID `medical-lab-tech`.

The current canonical Career ID is `medical-laboratory-technician`.

`medical-lab-tech` is excluded from the 1,600-row inventory and must be migrated or remapped before NZ can claim full canonical coverage.

## Ireland

Ireland Golden Slice Wave A adds six strict public-score Careers on 2026-09-12.

### Ready — 6

- `software-developer` — Demand 6 · Pay 10 · Entry 8 → 78
- `cybersecurity-analyst` — Demand 6 · Pay 10 · Entry 8 → 78
- `data-engineer` — Demand 6 · Pay 10 · Entry 8 → 78
- `civil-engineer` — Demand 5 · Pay 10 · Entry 8 → 74
- `construction-manager` — Demand 6 · Pay 10 · Entry 6 → 72
- `radiographer` — Demand 3 · Pay 10 · Entry 3 → 51

These scores use the Career Data Foundation and strict public evidence gate.
Broader official proxies remain explicitly Estimated. The current Pay input is
the CSO Professional-occupations earnings proxy and must not be presented as an
exact Career salary.

### Needs one gap — 1

- `accountant` — industry-diversity evidence remains below the usable coverage gate.

Accountant's labour-market signal is recorded as **pressure**, not a confirmed
shortage.

### Profile ready — 73

- `architect` remains blocked by shortage and vacancy-intensity evidence.
  Quantity Surveyor evidence is not borrowed.
- the remaining 72 Ireland Careers remain on the earlier strict-audit blocker
  families until they are normalized through the Career Data Foundation.

The original legacy Ireland provisional totals remain non-authoritative for
public CampCareer Score.

## Japan

All 80 canonical careers are `Profile ready` with the same blocker family:

`pay + shortage + vacancy_intensity + employer_diversity + demand_trend + growth + entry_burden + publication_review`

The current legacy totals should not be presented as CampCareer Score v1.

## South Korea

72 careers:

`pay + shortage + vacancy_intensity + employer_diversity + demand_trend + growth + entry_burden + publication_review`

8 health careers use a different entry gap:

`pay + shortage + vacancy_intensity + employer_diversity + demand_trend + growth + entry_access + publication_review`

The 8 careers are:

`care-worker`, `medical-laboratory-technician`, `midwife`, `occupational-therapist`, `pharmacist`, `physiotherapist`, `radiographer`, `registered-nurse`

## Singapore

All 80 canonical careers are `Profile ready` with:

`pay + shortage + vacancy_intensity + employer_diversity + demand_trend + growth + entry_burden + publication_review`

The current legacy totals should not be presented as CampCareer Score v1.

## Countries with no canonical Career profiles yet

For each country below, all 80 canonical careers are `Not ready`:

- Germany
- Netherlands
- Belgium
- France
- Spain
- Norway
- Sweden
- Denmark
- Finland
- Switzerland
- United Arab Emirates

## Immediate operating queue

The expansion order should optimize for the smallest number of blockers before content publication.

1. Ireland Golden Slice Ready 6: use these as the first deep Country → Career → Education decision cohort.
2. Ireland `accountant`: close the single industry-diversity gap.
3. Ireland `architect`: close shortage and vacancy-intensity evidence without borrowing adjacent occupations.
4. Australia Ready 11 remains available for existing content/product use.
5. Continue country expansion only after the Ireland Golden Slice graph is complete enough to prove the end-to-end journey.

## Coverage KPI

The primary expansion KPI is not raw profile count.

Use:

`publish-ready country-career decisions / 1,600 launch combinations`

Current strict snapshot:

- Ready: 17 / 1,600
- Needs one gap: 9 / 1,600
- Profile ready: 645 / 1,600
- Not ready: 929 / 1,600

The purpose of the inventory is to move rows upward one state at a time while content production consumes the Ready queue immediately.
