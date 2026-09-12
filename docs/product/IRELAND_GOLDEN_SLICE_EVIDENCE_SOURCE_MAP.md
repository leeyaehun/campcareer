# Ireland Golden Slice — Wave A Evidence Source Map

Last reviewed: 12 September 2026

## Purpose

Map the first eight Ireland Careers to the strongest currently identified
official evidence sources before any production score migration is written.

Wave A:

1. Software Developer
2. Cybersecurity Analyst
3. Data Engineer
4. Civil Engineer
5. Construction Manager
6. Accountant
7. Architect
8. Radiographer

This is a source-selection document, not a scored dataset.

## Common official source families

### SOLAS National Skills Bulletin 2025

Primary use:

- shortage signal;
- detailed occupation employment level where published;
- five-year employment growth / recent employment movement;
- recruitment-agency difficult-to-fill evidence;
- online job advert signal;
- employment permit counts/context;
- sector distribution/context.

Source:

- National Skills Bulletin 2025:
  https://www.solas.ie/f/70398/x/893ebacfd9/national-skills-bulletin-2025.pdf
- SLMRU career guidance:
  https://www.solas.ie/research-lp/skills-labour-market-research-slmru/research/

The bulletin is especially strong for ICT, construction, healthcare, and
business/financial occupation groups.

### CSO Census 2022 occupation data

Primary use:

- independent detailed occupation employment baseline;
- historical employment movement;
- occupation-size checks;
- potential industry-diversity derivation where a defensible occupation ×
  industry table can be extracted.

Source:

https://www.cso.ie/en/releasesandpublications/ep/p-cpp7/census2022profile7-employmentoccupationsandcommuting/atwork/

### CSO earnings evidence

Current official earnings sources identified:

- Earnings and Labour Costs Q1 2026 final / Q2 2026 preliminary:
  https://www.cso.ie/en/releasesandpublications/ep/p-elcq/earningsandlabourcostsq12026finalq22026preliminaryestimates/
- Earnings Analysis using Administrative Data Sources 2024:
  https://www.cso.ie/en/releasesandpublications/ep/p-eaads/earningsanalysisusingadministrativedatasources2024/
- Structure of Earnings Survey 2022:
  https://www.cso.ie/en/releasesandpublications/ep/p-ses/structureofearningssurvey2022/

Important limitation:

The current easily published CSO earnings tables are substantially broader than
the canonical CampCareer Career scopes. The 2022 Structure of Earnings Survey
publishes broad occupation earnings, while newer administrative earnings
releases are strong at economic-sector level.

Therefore these sources are valid potential **official proxies**, but must not
be labelled as exact Career salary data.

The canonical Pay policy allows a broader official occupation-group earnings
measure when it is the closest defensible official source, provided proxy scope
and lower confidence are explicit.

### SOLAS / Cedefop occupational forecast

Potential use:

- `projected_growth` where a defensible occupational mapping exists.

Source:

https://www.solas.ie/f/70398/x/756240fc66/summer-skills-bulletin-2023.pdf

This report describes Cedefop occupational forecasts for Ireland to 2035.
Mapping quality must be reviewed Career by Career. A broad forecast must not be
presented as an exact projection for a narrower Career.

### HSE consolidated pay scales

Potential use for regulated health careers:

https://healthservice.hse.ie/staff/pay/pay-scales/

The HSE publishes current consolidated salary scales. These are useful direct
public-employer pay evidence for grades such as radiography and later Nursing /
Pharmacy work.

However, a public-sector grade scale is not automatically a national
occupation median. It can be supporting context or a Pay input only if the
metric definition and comparison method explicitly permit it.

## Wave A mapping

### 1. Software Developer

Canonical Ireland scope:
`Programmers and software development professionals`.

Already strong:

- SOLAS explicitly identifies software developers/engineers as a skills
  shortage.
- National Skills Bulletin 2025 reports approximately 54,800 employed in 2024
  for the grouped occupation and a 12.1% five-year annual-average growth figure.
- The bulletin reports strong 2024 growth after a 2023 fall, difficult-to-fill
  evidence, and nearly 2,400 new employment permits for software
  developer/engineer roles.
- Employment spans ICT plus financial, professional and industrial activity.

Likely source path:

- shortage_signal → SOLAS 2025: strong/direct
- employment_momentum → SOLAS 2025: strong/direct at published group
- vacancy_intensity → SOLAS OJA/RAS evidence: usable, numeric rubric still to
  be designed
- industry_diversity → SOLAS/CSO sector distribution: likely derivable, exact
  HHI input still to be confirmed
- projected_growth → Cedefop/SOLAS forecast: proxy mapping required
- relative_salary → CSO official occupation/sector proxy unless a better
  official occupation earnings source is identified

Main unresolved issue: **Pay precision and numeric vacancy/diversity
normalization**, not basic demand evidence.

### 2. Cybersecurity Analyst

Canonical scope:
`Information technology and telecommunications professionals n.e.c. —
cyber-security analyst scope`.

Already strong:

- SOLAS identifies IT analysts/engineers among shortages.
- Recruitment Agency / Skills for Growth evidence includes cyber security,
  cloud security and related specialist skills.
- Employment permit evidence includes security engineers.

Likely source path:

- shortage_signal → SOLAS ICT shortage evidence, mapped proxy
- employment_momentum → broader ICT professional group
- vacancy_intensity → RAS/OJA specialist evidence
- industry_diversity → ICT/finance/industry distribution, proxy
- projected_growth → broader ICT professional Cedefop forecast
- relative_salary → official broader ICT/professional earnings proxy

Main unresolved issue: avoid treating the whole ICT-professional group as exact
Cybersecurity data.

### 3. Data Engineer

Canonical scope:
`IT business analysts, architects and systems designers — data engineering /
architecture scope`.

Already strong:

- SOLAS identifies IT analysts/engineers as shortage roles.
- Employment permits include data, systems, network and specialist engineering
  roles.
- Current canonical education graph already contains two Program relations.

Likely source path:

- shortage_signal → SOLAS IT analyst/engineer evidence, mapped proxy
- employment_momentum → IT business analysts / architects / systems designers
  group
- vacancy_intensity → OJA/RAS group evidence
- industry_diversity → professional + ICT + finance + industry evidence
- projected_growth → broader ICT forecast
- relative_salary → official broader ICT/professional earnings proxy

Main unresolved issue: exact mapping boundary between Data Engineer and the
broader systems-design/analyst group.

### 4. Civil Engineer

Canonical scope:
`Civil engineers`.

Already strong:

- SOLAS explicitly identifies **Civil engineers & construction project
  managers** as a shortage group.
- National Skills Bulletin 2025 says employment growth was above average for
  the combined group and records strong permit / difficult-to-fill evidence.
- Engineers Ireland already provides an education-entry source.

Likely source path:

- shortage_signal → SOLAS: direct at combined shortage group
- employment_momentum → SOLAS combined group
- vacancy_intensity → RAS/Skills for Growth combined group
- industry_diversity → construction / professional / infrastructure evidence;
  requires numeric derivation
- projected_growth → construction demand / Cedefop occupational forecast
- relative_salary → official professional/construction earnings proxy unless a
  better official civil-engineer earnings measure is validated

Main unresolved issue: separate Civil Engineer from Construction Project
Manager where the bulletin reports a combined group.

### 5. Construction Manager

Canonical scope:
`Construction project managers and related professionals`.

Already strong:

- shares the SOLAS direct shortage group with Civil Engineers;
- three canonical Ireland Program relations already exist;
- employer evidence identifies demand for site/project managers and BIM /
  sector-specific skills.

Likely source path is similar to Civil Engineer.

Main unresolved issue: derive distinct Career metrics from a combined SOLAS
group without inventing false precision.

### 6. Accountant

Canonical scope:
`Chartered and certified accountants — accountant scope`.

Already strong:

- National Skills Bulletin 2025 says employment growth was above average over
  five years and reports an additional 9,700 employed between 2023 and 2024.
- demand is spread across professional, financial and industrial sectors;
- difficult-to-fill evidence includes cost, tax, insurance, practice and
  manufacturing accountants;
- two canonical Program relations already exist.

Likely source path:

- shortage_signal → no blanket shortage claim; use actual bulletin evidence
  rather than converting “demand” into shortage
- employment_momentum → SOLAS: strong/direct
- vacancy_intensity → OJA/RAS evidence
- industry_diversity → SOLAS multi-sector evidence; numeric shares need source
- projected_growth → Cedefop/other official forecast, likely broader proxy
- relative_salary → official finance/professional or broad professional
  earnings proxy if no better occupation-level official series exists

Main unresolved issue: a strong labour market does **not** justify fabricating
a shortage designation.

### 7. Architect

Canonical scope:
`Architects and town planners — Architect`.

Already strong:

- statutory registration path is already sourced;
- National Skills Bulletin 2025 provides architects/town planners group
  employment/permit/demand context;
- two canonical Program relations exist.

Important nuance:

SOLAS does not identify generic Architect alone as the shortage in that group;
the bulletin identifies Quantity Surveyors as the explicit shortage while
discussing demand for architects and future housing/infrastructure-driven
demand.

Likely source path:

- shortage_signal → must remain evidence-based and may legitimately be low/none
- employment_momentum → broader architects/town-planners group
- vacancy_intensity → grouped recruitment evidence
- industry_diversity → professional/construction group proxy
- projected_growth → housing/infrastructure outlook + occupational forecast
- relative_salary → official broader professional earnings proxy unless a
  defensible architect-specific official measure is found

Main unresolved issue: do not borrow Quantity Surveyor shortage evidence for
Architect.

### 8. Radiographer

Canonical scope:
`Radiographers — diagnostic and therapeutic radiography scope`.

Already strong:

- CORU registration and approved-qualification evidence already exists;
- employment permits and recruitment evidence include radiographers;
- one canonical Program relation exists;
- current HSE salary scales provide direct public-employer pay-grade evidence.

Important nuance:

The National Skills Bulletin groups radiographers with other healthcare
professionals and marks shortage evidence for that wider group as
**inconclusive**. That must remain explicit.

Likely source path:

- shortage_signal → inconclusive/low unless stronger exact evidence is found
- employment_momentum → broader healthcare-professional group, proxy
- vacancy_intensity → recruitment / permit evidence; exact normalization needed
- industry_diversity → healthcare is structurally concentrated; score must
  reflect actual concentration rather than penalize missing data
- projected_growth → healthcare demand / occupational forecast proxy
- relative_salary → HSE scale as strong context; national Pay input still needs
  methodology review

Main unresolved issue: distinguish a genuinely concentrated occupation from
missing industry-diversity evidence, and decide whether HSE pay scales satisfy
the Pay input definition.

## Component readiness after initial source review

| Career | Shortage | Momentum | Vacancy | Diversity | Projection | Pay | Entry |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Software Developer | strong | strong | candidate | candidate | proxy candidate | unresolved/proxy | strong |
| Cybersecurity Analyst | proxy strong | proxy | candidate | proxy | proxy | unresolved/proxy | strong |
| Data Engineer | proxy strong | proxy | candidate | proxy | proxy | unresolved/proxy | strong |
| Civil Engineer | combined-group strong | combined-group | candidate | candidate | proxy | unresolved/proxy | strong |
| Construction Manager | combined-group strong | combined-group | candidate | candidate | proxy | unresolved/proxy | strong |
| Accountant | no blanket shortage | strong | candidate | candidate | proxy | unresolved/proxy | strong |
| Architect | no direct shortage | proxy | candidate | proxy | proxy | unresolved/proxy | strong |
| Radiographer | inconclusive | proxy | candidate | concentrated/proxy | proxy | methodology review | strong |

“Candidate” means an official evidence family is identified but the exact
normalization/scoring input has not yet been reviewed.

## Key conclusion

The first source review changes the implementation risk profile.

**Demand is not the hardest Ireland problem.** SOLAS already supplies strong
current labour-market evidence for most Wave A Careers.

The two hardest common components are:

1. **Pay** — Ireland lacks a convenient current detailed occupation earnings
   series comparable to Australia JSA; official CSO sources are mostly broader.
2. **Projected growth / numeric vacancy-diversity inputs** — current official
   evidence exists, but much of it is grouped or qualitative and needs careful
   normalization.

Therefore the next engineering step should not write scores immediately.

It should first implement an Ireland evidence-normalization design that records:

- exact vs proxy scope;
- source period;
- mapping quality;
- proxy reason;
- confidence;
- evidence status;

using the existing Career Data Foundation model.

## User/manual dependency

None at this stage.

No paid dataset, account login or user-only dashboard action has been identified
as necessary for Wave A source mapping. If later a required official dataset is
available only through a manual download or interactive export, that dependency
should be surfaced before any production migration is prepared.
