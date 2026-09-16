# P3.1 Ireland Degree Match Evidence

Status: verified raw evidence layer, 16 September 2026. Evidence only — no UI, no ranking, no Degree Match score, no Programme publication, no Career, Degree or Institution cohort expansion.

## Final six relations

| Career | Canonical Degree | Relationship | Strength | Evidence level | Qualification / regulation |
|---|---|---|---|---|---|
| Software Developer | Computer Science | common | strong | estimated | none_verified · not regulated · not a legal requirement |
| Cybersecurity Analyst | Cybersecurity | common | strong | estimated | none_verified · not regulated · not a legal requirement |
| Data Engineer | Data Science | alternative | contextual | estimated | none_verified · additional training commonly required · not regulated |
| Civil Engineer | Civil Engineering | direct | strong | verified | accredited_programme_required · Engineers Ireland accreditation (programme-specific) |
| Construction Manager | Construction Management | direct | strong | estimated | none_verified · not statutory; CIOB/SCSI accreditation career-relevant |
| Radiographer | Diagnostic Radiography | direct | strong | verified | professional_registration_required · CORU approval + registration required |

## Coverage matrix

| Career × Degree | Relationship | Confidence | Evidence status | Qualification / regulation | Completeness |
|---|---|---|---|---|---|
| Software Developer × Computer Science | common | strong | proxy (institution) | none_verified · not regulated | partial — no official Ireland guidance links the two directly |
| Cybersecurity Analyst × Cybersecurity | common | strong | direct (institution) | none_verified · not regulated | partial — provider-named role, not a regulator mandate |
| Data Engineer × Data Science | alternative | contextual | proxy (institution) | none_verified · additional training | partial — adjacent-only relation |
| Civil Engineer × Civil Engineering | direct | strong | direct (institution + regulator) | accredited_programme_required | good — regulator accreditation verified |
| Construction Manager × Construction Management | direct | strong | direct (institution) | none_verified · not statutory | partial — professional accreditation cited by provider, not verified centrally |
| Radiographer × Diagnostic Radiography | direct | strong | direct (institution + regulator) | professional_registration_required | good — CORU approval + registration verified |

## Sources

Source hierarchy followed: official regulator/professional body → government/qualification authority → official institution → official career guidance → other authoritative education.

- **Radiographer**: CORU Approved Qualifications (official regulator, verified) + Trinity College Dublin Diagnostic Radiography (M.Sc.) (official institution, verified 10 Sep 2026, states CORU approval).
- **Civil Engineer**: Engineers Ireland "Is your course accredited?" (official professional body, verified) + University of Galway BE/ME Civil (official institution, states Engineers Ireland accreditation).
- **Construction Manager**: TU Dublin BSc (Hons) Construction Management (TU833) (official institution, states CIOB/SCSI accreditation).
- **Software Developer**: DCU BSc in Computer Science (DC121) (official institution).
- **Cybersecurity Analyst**: TU Dublin BSc (Hons) Computing in Digital Forensics and Cyber Security (TU863) (official institution; page explicitly lists Cyber Security Analyst among graduate roles).
- **Data Engineer**: DCU BSc in Data Science and Artificial Intelligence (DC123) (official institution; adjacent, proxy).

All URLs verified live on 16 Sep 2026. Every evidence record keeps publisher, title, URL, source kind, direct/proxy status, geography, reference period, checked date and limitations.

## Regulation / qualification findings

- **Radiographer** is regulated: an approved (CORU-recognised) qualification plus registration with the CORU Radiographers Registration Board are required to practise. A Degree relationship never grants permission to practise.
- **Civil Engineer** is not statutorily registered in Ireland, but Engineers Ireland accreditation is programme-specific and underpins professional recognition and progression toward Chartered Engineer. The Degree does not itself confer a licence.
- **Construction Manager**, **Software Developer**, **Cybersecurity Analyst** and **Data Engineer** are not legally regulated; no universal mandatory Degree was verified.

## Degree vs Programme boundary

Canonical Degrees (`computer-science`, `cybersecurity`, `data-science`, `civil-engineering`, `construction-management`, `diagnostic-radiography`) are field identities rooted in `taxonomy.study_concepts`. Provider programme pages (DCU BSc, TU Dublin BSc, Galway BE/ME, Trinity M.Sc.) are used exclusively as **evidence** for the field relation. No new public Programme entity, route or publication gate change is made by P3.1.

## Alias / normalization notes

Small ontology, all evidence-gated with `canonicalEquivalent: false`:

| Source label | Canonical Degree | Relationship | Confidence |
|---|---|---|---|
| Computing | computer-science | related | low |
| Applied Computing | computer-science | related | low |
| Cyber Security | cybersecurity | synonym | medium |
| Data Analytics | data-science | related | medium |
| Radiography | diagnostic-radiography | broader | medium |

## Evidence gaps

- No verified official Irish regulator, government or qualification authority defines a single mandatory Degree for Software Developer, Cybersecurity Analyst or Data Engineer; recorded explicitly as `unavailable` observations rather than asserted requirements.
- Data Science → Data Engineer is an adjacent/alternative pathway; full production data-engineering readiness is not established by a Data Science curriculum alone.
- Construction Management accreditation (CIOB/SCSI) is cited by the provider but was not independently verified at a central register in this pass.
- All relations are Ireland-scoped; global academic logic is never converted into Irish professional eligibility.

## P3.2 model inputs

- Six relation records with `relationshipType`, `strength`, `evidenceLevel`, geography, rationale, qualification, regulation, evidence and (where applicable) missing-evidence observations.
- Five explicit alias mappings for label normalization.
- Keep relationship type and confidence separate and categorical; derive no numeric Match Score.
- P3.2 should expose the same relation bidirectionally (Career → Degree and Degree → Career) and keep the reviewed `career_degree_relation_read_v1` view as the populated source without publishing new Degree or Programme surfaces.