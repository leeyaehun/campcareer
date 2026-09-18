# P3.3 — Ireland Degree Match UI journeys

Status: Implemented

## Decision: Degree surface

There is no canonical `/degree/[slug]` route and the codebase explicitly
forbids introducing a dedicated `/degrees` route (see `career-degree/read.ts`
and `P3_1_IRELAND_DEGREE_MATCH_EVIDENCE.md`). P3.3 therefore does **not**
invent a Degree route. Both journeys are built on existing, sanctioned
surfaces:

- Career → Degree: the Career Page `#study` section (existing "Study / Programs"
  surface) gains a concise Degree Match card for the six supported Ireland
  careers.
- Degree → Career: the existing country education hub `/countries/ie/education`
  (already indexable and sitemap-listed) gains a Degree Match section that
  renders each reviewed Degree with the Careers it can lead toward.

Both journeys read the P3.2 derived model only. Raw P3.1 evidence is never
imported into React components.

## Career → Degree

The Career Page `#study` section renders the P3.2 output for the career being
viewed (exactly when a relation exists). The card shows the Degree name,
relationship type, relationship strength, and confidence as **text labels**
(never a numeric Match Score), a concise interpretation from the model, and a
qualification / regulation note when the model exposes one.

## Degree → Career

`/countries/ie/education` gains a "Degree match" section listing the six
reviewed Degrees. Each Degree card uses `getIrelandDegreeCareerMatches(degreeId)`
to list the Careers the Degree can lead toward, with the same categorical
relationship labels, a qualification / regulation note, lightweight P2 context
(Future outlook, Demand) read from the P2 derived model, and a link to each
Career's canonical Career Page. Country context stays `IE`; the page never
switches country.

## Boundary guarantees

- Degree ≠ Programme: cards render a canonical Degree (e.g. "Computer Science"),
  never a university programme listing. No Programme routes are opened and no
  Ireland Programme listings are published.
- Regulated careers: Radiographer (and Civil Engineer, via accreditation) keep
  the "registration/professional requirement" note prominent; Degree relevance
  and permission to practise remain visually distinct.
- Non-regulated tech careers (Software Developer, Cybersecurity Analyst, Data
  Engineer): wording states an academic pathway, never a legally mandatory
  Degree.
- P2 Future Intelligence stays a separate data source; the Degree Match model
  carries no P2 values.
- Institutions: the existing verified-institution continuation in the `#study`
  section is preserved; no new Institution cohort is added.