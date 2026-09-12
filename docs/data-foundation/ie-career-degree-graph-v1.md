# Ireland Career ↔ Degree Graph v1

Status: reviewed relationship layer for the first Ireland Golden Slice.  
Last reviewed: 12 September 2026.

## Scope

This graph is intentionally restricted to the Ireland MVP cohort:

- Software Developer
- Cybersecurity Analyst
- Data Engineer
- Civil Engineer
- Construction Manager
- Radiographer

It creates six canonical degree concepts in `taxonomy.study_concepts` and six
country-scoped, source-backed relations in `taxonomy.career_degree_relations`.
The durable career identity remains `IE + canonical_career_id`; degree labels
and provider programme titles are not Career identifiers.

| Career | Canonical degree concept | Relationship | Supporting official provider record |
|---|---|---|---|
| Software Developer | Computer Science | Direct · primary | Dublin City University — BSc in Computer Science |
| Cybersecurity Analyst | Cybersecurity | Direct · primary | Technological University Dublin — Computing in Digital Forensics and Cyber Security |
| Data Engineer | Data Science | Related · supporting | Dublin City University — BSc in Data Science and Artificial Intelligence |
| Civil Engineer | Civil Engineering | Direct · primary | University of Galway — BE (Hons) Engineering – Civil Engineering |
| Construction Manager | Construction Management | Direct · primary | Technological University Dublin — BSc (Hons) Construction Management |
| Radiographer | Diagnostic Radiography | Direct · primary | Trinity College Dublin — MSc Diagnostic Radiography |

Every relation stores rationale, official-source authority, title and URL,
reference period, checked date, relationship type, directness and strength.
The Degree read model resolves the inverse traversal—Degree → Careers—without
creating a redundant `/degrees` route.

## Existing programme-relation audit

The live canonical Ireland programme layer was checked on 12 September 2026.
It has 28 canonical Tier B programmes and 51 approved Career relations.
The MVP cohort has these 13 source-reviewed programme relations:

| Career | Count | Degree interpretation |
|---|---:|---|
| Software Developer | 4 | Computer Science, including Computer Science and Information Technology |
| Cybersecurity Analyst | 2 | Cybersecurity |
| Data Engineer | 2 | Data Science as an adjacent pathway |
| Civil Engineer | 1 | Civil Engineering |
| Construction Manager | 3 | Construction Management, including Construction Management and Engineering |
| Radiographer | 1 | Diagnostic Radiography |

The graph deliberately does **not** promote Software Engineering, generic
Computing or any other degree concept without a reviewed Ireland relationship
in the current bounded cohort.

## Publication boundary

This migration does not write `taxonomy.programme_concepts`, create an Ireland
programme explorer/detail route, or link a Career Page to a Tier B programme.
It therefore does not bypass `program_publication_gate_ie_v1`.

At the audit date:

- Tier A achieved: **0**
- Tier B remaining: **28**
- MVP-linked Tier B programme relations remaining: **13**
- Publicly publishable Ireland programmes: **0**
- Gate reason: `exact_eligible_programme_evidence_required`

Each relevant programme remains gated because its exact programme-level
TrustEd Ireland / ILEP eligibility has not been established alongside positive
international-student eligibility, verified full-time daytime study and a
verified canonical offering. Provider authorization, a current provider page,
or a reviewed Career relationship does not substitute for that evidence.

The Career Page may therefore show the degree relationship and its provenance,
but it explicitly withholds programme listings until the existing Tier A gate
is met. Programme → Degree mapping and public institution/city traversal are
the next separately gated change.
