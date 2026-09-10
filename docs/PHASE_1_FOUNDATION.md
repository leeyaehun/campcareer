# Phase 1 Foundation

## Product goal

CampCareer helps people move from **Campus to Career**. It gives a public, evidence-led answer to which career to pursue, what that career is like, how to enter it, and which study and provider options support the path.

## Core entities

- **Career** is the primary decision object. Its durable identity is `country_code + career_id`.
- **Country** supplies the labour-market, pathway, work-rights and place context for a Career.
- **Degree** is the user-facing way to describe study options. The existing **Program** model remains the canonical catalogue and data model in Phase 1.
- **Education** is the user-facing provider category. The existing **Institution** model remains the canonical provider entity.

## Canonical routes

| Product concept | Phase 1 route | Notes |
| --- | --- | --- |
| Career discovery | `/careers` | Public index over the existing canonical career catalogue. |
| Career decision | `/career/{country}/{career-id}` | Canonical Career Page. Country slugs project durable country codes. |
| Country context | `/countries`, `/countries/{country}` | Context for a career, not a competing dashboard. |
| Degrees | `/programs` | Program routes and data stay canonical while the product label is Degrees. |
| Education | `/institutions` | Institution routes and data stay canonical while the product label is Education. |
| Compare | `/compare` | A secondary action used after a Career Page decision. |

This foundation deliberately does not rename the established `/career`, `/programs` or `/institutions` route families, and it makes no SEO migration decision.

## Entity relationships

The working relationship is:

```text
Career → Degree / Program → Education / Institution → Graduate Programme or Job
                 ↘ Country context ↗
```

A Career Page is the primary way into the relationship. Career context may pass into Programs, and reviewed Program relationships may return a user to the relevant Career Page. Institution discovery supports provider choice once a program or path is relevant.

## Account philosophy

Value comes before account creation. Career discovery, CampCareer Score, evidence, path, Programs, Institutions, Countries and Compare remain public. Authentication is reserved for actions that persist user state, such as saving a career, settings and later personalisation.

## Phase 1 boundaries

This work establishes navigation and discovery structure only. It does not redesign Supabase, add migrations or authentication, ingest Jobs or Graduate Programmes, add payments or a paywall, introduce AI recommendations, rewrite country or map surfaces, or perform a route or SEO migration.

## Future Jobs and Graduate Programmes

Jobs and Graduate Programmes will connect after the Career → Degree / Program → Education / Institution path. They will remain action layers attached to a career decision, with Country context available throughout; they are not a standalone Jobs platform in Phase 1.
