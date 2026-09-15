# Degree Match Contract v1 (P3.0)

Status: contract and types only. No new Degree, Programme, or relationship data is published by P3.0.

## Purpose

Degree Match describes an evidence-backed relationship between a canonical Career and a canonical Degree / field of study. The same relation is traversed in both directions:

- Career → Degree: “What can I study for this Career?”
- Degree → Career: “What Careers can this Degree lead to?”

The durable relation key is `country_code + career_id + degree_id`. A Degree is a field-of-study identity such as **Computer Science**. A Programme is an institution-specific offering such as **BSc Computer Science at University X**. Programme evidence may support a relation later; it never becomes the Degree identity.

## Vocabulary

`direct`, `common`, `alternative`, `optional`, and `insufficient_alone` describe the relationship. They are not universal legal rules and must be interpreted in the stated country and evidence scope.

Strength (`strong`, `moderate`, `contextual`, `unavailable`) and evidence level (`verified`, `estimated`, `limited_evidence`, `unavailable`) are separate fields. A direct relationship can have limited local evidence. Missing evidence stays unavailable; it is not a weak, negative, optional, or zero match.

P3.0 defines no numeric Match Score or percentage. Any later user-facing strength must be categorical and explainable from relationship type and evidence quality.

## Geography and eligibility

Every relation carries geography. `global_academic` describes an academic relationship only. `country_pathway` describes a country-specific route. `country_professional_requirement` describes entry or practice conditions in a country. A Degree relationship never grants permission to practise.

Qualification state is explicit and can represent registration, accreditation, postgraduate conversion, professional examinations, supervised practice, additional training, multiple requirements, or `none_verified` / `unavailable`. Regulation stores regulated status, regulator, accreditation, registration, jurisdiction, and source evidence separately from the academic relation.

## Evidence

Evidence records title, publisher, URL, source kind, direct versus proxy status, geography, reference period, checked date, and limitations. Preferred sources are official regulators and professional bodies, government or qualification authorities, official institutions, official career guidance, and other authoritative education sources. Generic blogs, SEO pages, title similarity, and AI assumptions cannot create a core relation.

An unavailable observation has a reason and no fabricated value. Proxy evidence remains explicitly proxy and cannot silently become exact evidence.

## Normalization boundary

Source labels and aliases map to a canonical Degree only through an explicit alias mapping with a relationship, confidence, rationale, and evidence requirement. `canonicalEquivalent` is always false in this contract; P3.0 does not build an ontology or silently equate “Computing”, “Applied Computing”, and “Computer Science”.

## Existing architecture audit

The repository already has `taxonomy.study_concepts`, `taxonomy.programme_concepts`, and an Ireland-only `taxonomy.career_degree_relations` graph from the reviewed P1 cohort. Its existing `direct/common_pathway/related` and `primary/strong/supporting` vocabulary remains compatible data for that surface, but is not expanded or rewritten by P3.0. The new contract is an explicit boundary for future adapters and does not create a second populated source of truth.

The six reviewed Ireland Career identities remain exactly: `software-developer`, `cybersecurity-analyst`, `data-engineer`, `civil-engineer`, `construction-manager`, and `radiographer`. Their reviewed Degree concepts remain unchanged. Ireland Programme publication remains closed under the existing publication gate.

P2 Future Intelligence stays separate. Its signals (`demand`, `growth`, `stability`, `ai_exposure`, `skills_change`, `outlook`) are not Degree Match fields and are not copied into this contract. They may be composed by a later read layer.

## Future query boundary

Future repositories may expose `getCareerDegreeMatches({ countryCode, careerId })` and `getDegreeCareerMatches({ countryCode, degreeId })`, backed by the same relation. P3.0 adds no populated production API or UI.
