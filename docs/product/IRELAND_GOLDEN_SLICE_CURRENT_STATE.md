# Ireland Golden Slice — Current-State Audit

Last audited: 12 September 2026

## Audit goal

Establish what Ireland data and product surfaces already exist, what is safe to
reuse, what remains gated, and what must be built before the Ireland Golden
Slice can support a complete decision journey:

`Ireland → Career → Degree/Program → Institution → Compare → Decision`.

This audit is read-only. It does not relax any existing publication gate.

## Executive summary

Ireland is much further along in the data layer than the current public product
suggests.

- Career identity coverage is broad: 80 Ireland Career profiles exist.
- Ireland Career market metrics are still provisional: the 80 rows have no
  normalized occupation-level salary, employment, vacancy, or growth values.
- Program discovery already exists privately: 40 staged programs, 28 canonical
  Tier B programs, and 63 approved staging Career relations.
- Public program publication is correctly blocked: there are zero Tier A
  programs and zero publishable programs under the current gate.
- Nine institution/campus records are already verified for the four published
  cities, but Ireland is not enabled in the public Institution explorer.
- Four city pages are published: Dublin, Cork, Galway, and Limerick.
- City → Program linkage is currently empty.
- A large legacy Ireland dataset exists and is useful for discovery, but parts
  of it contain estimated institution metrics and must not be promoted as
  verified decision data.

The Golden Slice should therefore reuse the existing graph foundation rather
than create a parallel Ireland stack.

## 1. Career layer

### Existing data

Production currently contains:

- 80 `country_occupation_profiles` rows for `country_code = IE`.
- 80 distinct canonical Career IDs.
- all 80 profiles have `publication_status = profile_ready`.
- 80 matching metric snapshot rows.
- 238 Career links/sources/pathway links.

### Current quality boundary

All 80 Ireland metric snapshots are `score_status = provisional`.

Across those 80 rows:

- normalized annual salary present: 0/80
- normalized employment total present: 0/80
- normalized vacancy series present: 0/80
- normalized 5-year growth present: 0/80
- normalized 10-year growth present: 0/80
- internal opportunity score present: 80/80

The public CampCareer Score gate does not currently mark Ireland Careers as
score-ready. This is correct: the provisional internal score must not be
presented as a complete public decision score while major market components are
missing.

### Reuse decision

**Reuse:** Career identity, official classification mapping, registration
requirements, source links, permit/visa context, entry-route evidence.

**Do not yet treat as complete:** salary ranking, demand ranking, future-growth
ranking, or an overall "best career" ranking derived from the provisional
internal score.

## 2. Degree / Program layer

### Existing data

Production currently contains:

- 40 rows in `program_catalog_ie_staging`
- 40 rows in `program_international_ie_staging`
- 28 rows in `program_catalog_canonical_ie_v1`
- 63 approved rows in `program_occupation_ie_staging`
- 41 Careers represented by those 63 staging relations
- 51 canonical Career ↔ Program relations
- 32 Careers represented by the canonical relation view
- 9 institutions represented by the 28 canonical programs

The existing canonical cohort includes Computer Science, Data Science,
Cybersecurity, Cloud Computing, Accounting, Architecture, Construction
Management, Civil Engineering, Chemical/Biopharmaceutical Engineering,
Agricultural Science, Diagnostic Radiography, Primary Teaching, UX and other
programs.

### Publication gate

The production gate currently reports:

- Tier A: 0
- Tier B: 28
- Tier C: 12
- publishable: 0
- publication_ready: false
- reason: `exact_eligible_programme_evidence_required`
- evidence checked through: 2026-08-10

This gate must remain in place.

Tier B means the program identity is useful and review-ready, but current exact
program-level eligibility under the Ireland international-study publication
contract has not passed the Tier A gate.

### Current Career ↔ Program depth

The strongest existing canonical link coverage includes:

- Software Developer: 4 programs
- Construction Manager: 3
- Project Manager: 3
- Accountant: 2
- Architect: 2
- Cybersecurity Analyst: 2
- Data Analyst: 2
- Data Engineer: 2
- Network Administrator: 2
- several engineering, design, finance, hospitality and agriculture Careers:
  1–2 each

Important gap: several high-value Golden Slice Careers, especially parts of
healthcare, still do not have enough canonical program coverage. Radiographer
has a link, while Nursing is not yet represented in the current canonical
program cohort.

### Reuse decision

**Reuse:** the 40-program staging cohort, canonical program identity work,
Career relation review, official program URLs, international eligibility
research, NFQ levels, and provider identity.

**Do not bypass:** the Tier A publication gate.

The correct next move is to promote a deliberately small set of high-intent
programs from Tier B to Tier A with exact current evidence, then expose those
through a dedicated Ireland read model.

## 3. Institution / Education layer

### Verified Ireland institution-location foundation

The current city/institution foundation contains nine verified institution
records:

- Dublin City University
- RCSI University of Medicine and Health Sciences
- Technological University Dublin
- Trinity College Dublin
- University College Dublin
- University College Cork
- University of Galway
- Mary Immaculate College
- University of Limerick

Their current location records are marked `verified_official` and use Higher
Education Authority provider authority.

### Product gap

Ireland is **not** currently included in `INSTITUTION_MVP_COUNTRIES`.

That means the public Institution explorer/detail system does not yet expose
Ireland even though a verified Ireland institution-location foundation already
exists.

This is one of the clearest Golden Slice implementation gaps.

### Reuse decision

Build Ireland Institution explorer/detail read models from the existing
canonical institution/location foundation. Do not rebuild institution identity
from the legacy `colleges_ie` table.

## 4. City layer

Published Ireland city scope is currently:

- Dublin
- Cork
- Galway
- Limerick

Current production coverage:

- 4 city directory rows
- 9 linked institution rows
- 0 linked program rows

Institution coverage is marked `initial_verified_set`.
Program coverage is marked `verification_pending`.

The four-city scope is a good first Golden Slice boundary. Additional Irish
cities should remain deferred until the core graph is complete.

## 5. Country page

`/countries/ie` is already public, canonical and indexable.

It currently provides:

- visa-pathway count
- country-level salary range
- student living-cost range
- academic-year context
- static "strong majors" cards
- static representative institutions
- regions/cities
- work-opportunity context

The main weakness is not missing content; it is missing graph connectivity.

Current "Strong majors" and "Major universities and colleges" are primarily
context cards rather than durable entry points into verified Degree/Institution
objects. The Golden Slice should turn the Ireland page into the beginning of
the decision graph rather than add more standalone prose.

## 6. Legacy Ireland assets

Existing legacy/read-model inventory:

- `courses_ie`: 2,876 rows, 34 institution IDs, 163 raw city labels
- `colleges_ie`: 34 rows
- `field_earnings_ie`: 150 rows
- `graduate_outcomes_ie`: 64 rows across 10 fields, latest graduation year 2022
- `shortage_occupations_ie`: 79 rows
- `roi_explorer_ie`: 34 rows

Legacy course data was synchronized as recently as June 2026 and is valuable
for discovery and source matching.

However, the legacy college import script explicitly contains estimated
institution-level earnings, graduation-rate and price values. Those fields are
not suitable as Golden Slice truth without replacement by verified evidence.

### Reuse policy

**Safe discovery inputs:**

- Qualifax course identity
- CAO/NFQ/course codes
- provider-name matching
- city/provider discovery
- HEA field/outcome source discovery
- shortage occupation discovery

**Do not promote directly without re-verification:**

- estimated institution earnings
- estimated graduation rates
- estimated international price values
- legacy ROI scores derived from those estimates

## 7. Current graph status

| Edge | Current state |
| --- | --- |
| Ireland → Career | Broad identity coverage; decision metrics incomplete |
| Career → Program | Private/reviewed foundation exists; public graph gated |
| Program → Institution | Exists in canonical program cohort |
| Institution → City | Verified for 9 institution records / 4 cities |
| City → Program | Missing |
| Country → Degree | Static thematic cards, not a durable graph |
| Career → Degree | Relation foundation exists through programs, not yet public |
| Institution explorer → Ireland | Missing |
| Public Ireland programs | Intentionally blocked |
| Compare across Ireland Careers | Available structurally, but public score depth is incomplete |

## 8. Recommended Golden Slice build subset

Do not attempt to make all 80 Careers decision-ready at once.

Start with a bounded cohort where existing program relations and Irish labour
market relevance overlap. Recommended first cohort:

1. Software Developer
2. Cybersecurity Analyst
3. Data Analyst
4. Data Engineer
5. Civil Engineer
6. Construction Manager
7. Accountant
8. Financial Analyst
9. Architect
10. Radiographer
11. Registered Nurse
12. Pharmacist

The first nine already align strongly with the existing canonical program
cohort. Radiographer has an existing canonical education relation. Registered
Nurse and Pharmacist should be treated as deliberate healthcare gap-filling
targets rather than pretending the current cohort already covers them.

This cohort is a starting implementation boundary, not a permanent Ireland
taxonomy limit.

## 9. Immediate build order after this audit

1. Select the first 10–12 Ireland Careers and define decision-readiness evidence
   required per Career.
2. Normalize trustworthy salary/demand/growth evidence for that bounded cohort.
3. Promote a small set of matching Ireland programs to Tier A using exact
   current program-level evidence.
4. Create Ireland public Program read models and routes only for Tier A rows.
5. Enable Ireland Institution explorer/detail from the verified institution
   foundation.
6. Link Career ↔ Program/Degree ↔ Institution ↔ City in both directions.
7. Upgrade `/countries/ie` to expose those graph links.
8. Add Ireland-specific Compare coverage.
9. Run the product/design cleanup pass, including shared horizontal container
   spacing and the desktop edge-padding issue already identified separately.
10. Run Golden Slice quality/indexing gates.

## Audit verdict

**FOUNDATION EXISTS — GOLDEN SLICE NOT YET CONNECTED.**

The main work is not bulk data collection. It is converting already existing
Ireland foundations into a small, evidence-complete and publicly connected
decision graph while filling the specific labour-market and program-publication
gaps that currently prevent an end-to-end journey.
