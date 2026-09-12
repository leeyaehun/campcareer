# Phase 8 — Monetization & Business Model

Last reviewed: 12 September 2026

## Purpose

CampCareer earns the right to pursue revenue by helping people make better
career decisions first. The intended loop is:

`Useful decision → qualified intent → useful action → commercial value → revenue → better product`

Revenue is an outcome of independent product value. It is never a condition
for seeing the facts, score, evidence or decision path.

## Current stage

**Stage 0 — monetization observation.** Production GA4, Search Console and
consented Decision Session evidence have not been supplied in this repository.
The Stage 1 traffic and behaviour thresholds therefore cannot be claimed.

Stage guidance is operational rather than calendar-based:

| Stage | Decision Sessions per week | Product posture |
| --- | ---: | --- |
| 0 | 0–250 | Improve quality, trust, usage and action-intent measurement. No monetization pressure. |
| 1 | 250–1,000 | Validate one narrow, additive proposition with real intent evidence. |
| 2 | 1,000–5,000 | Operate one proven revenue engine while observing product guardrails. |
| 3 | 5,000–20,000 | Consider a marketplace or recruiting proposition only with demand and supply. |
| 4 | Evidence-dependent | Consider research, licensing or API work only after rights, reliability and demand gates. |
| 5 | Evidence-dependent | Consider selective advertising only after every earlier option is unsuitable. |

Moving from Stage 0 to Stage 1 requires all of the following: meaningful
consented Decision Session volume, repeated high-intent journeys that reach a
real action surface, a specific user problem with a plausible paid solution,
and no unresolved trust, quality or privacy blocker. The decision is recorded
in [the opportunity review](business/OPPORTUNITY_REVIEW.md), not inferred from
search demand alone.

## Free-core guarantee

These capabilities remain broadly available without payment, artificial limits
or mandatory sign-up:

- Career, country, degree and education information.
- Salary, tax estimates, decision metrics, sources and methodology.
- Search, discovery, filters, comparison, rankings and calculations.
- Understanding the evidence and deciding on a path.

CampCareer will not hide salary, reduce filters, blur decision-critical
metrics, cap Compare, change rankings, or require an account to make a basic
decision. Save and persistence may require an account because they store user
state; they do not change the underlying facts or methodology.

## Audit and present state

| Area | Current evidence | Phase 8 decision |
| --- | --- | --- |
| Auth and saved state | Supabase-backed account and explicit Save return flow exist. | Keep as optional retention utility; do not create an account-first paid workspace. |
| Career, country and Compare | Canonical public Career data, scores and Compare remain public. | Protect them as the free core. |
| Scores and rankings | Score, comparison and discovery-ranking modules have no commercial dependency. | Keep commercial inputs out of calculations; regression test the import boundary. |
| Affiliate relationships | Wise and Airalo cards use an adjacent affiliate disclosure and `rel="sponsored"`; links go through `/out/{partner}`. | Retain only as independently useful contextual action links. No score, ranking or recommendation influence. |
| Education and institution actions | Route guides link directly to verified official course pages. | Existing `route_external_link_clicked` measures the real `course` action after consent. Do not add referral parameters or a provider marketplace. |
| Jobs and graduate paths | Route guides can link to employer career pages and job sources. | Existing consented route event records the real `employer` and `job` link types. No recruiting marketplace. |
| Analytics and consent | GA4/Vercel/product events are consent-gated. The affiliate server redirect previously could write optional measurement without checking consent. | The redirect now works for everyone, while its server-side `affiliate_click` write needs affirmative consent. |
| Feedback and email | Feedback is separated from analytics. Resend supports transactional and separately consented alert/broadcast delivery. | No sales outreach, revenue email flow or new provider is introduced. |
| Payments and pricing | No Stripe, checkout, subscription, billing dependency, billing schema or pricing page exists. | Keep all payment work deferred. |
| APIs, reports and exports | Existing APIs serve product reads; no paid API, report-download product or commercial export exists. | Do not expose a data product before reliability, rights and demand are proven. |
| Sponsorship and advertising | No sponsored placement, ad network or ad surface exists. | Keep both deferred. |

The full source-rights operating inventory is
[SOURCE_LICENSING_READINESS.md](business/SOURCE_LICENSING_READINESS.md).

## Commercial intent measurement

Only real actions are measured. The consented, existing actions are:

| Event | Real action | Safe context |
| --- | --- | --- |
| `affiliate_offer_view` | A Wise or Airalo card is displayed. | Partner ID only. |
| `affiliate_click` | A visitor chooses a disclosed Wise or Airalo link. | Partner ID; the redirect can additionally use the documented pseudonymous attribution context after consent. |
| `route_external_link_clicked` | A Route Guide opens an official course page, employer career page, job source or map source. | Route ID, locale, link type and route surface. |
| `education_outbound_click` | Reserved typed event. | **Not emitted today**; it must not be reported as implemented. |

No event contains a name, email address, phone number, free-text note,
application content or payment information. The current observable funnel is
therefore `Decision Session → action intent`; application, enrollment,
qualified lead and revenue are not inferred.

## Commercial relationship rules

The permanent rules live in
[COMMERCIAL_INDEPENDENCE.md](business/COMMERCIAL_INDEPENDENCE.md).

In particular, a relationship is allowed only after an independently useful
option exists, and a disclosure is placed at the interaction. A paying
institution, employer, affiliate, verifier or sponsor cannot alter a
CampCareer Score, organic placement, methodology, competitor visibility or
recommendation. “Verified” describes authority or data review only; it never
means “recommended.”

## Revenue candidates and gates

Candidate-specific requirements, success metrics and stop conditions are in
[REVENUE_EXPERIMENTS.md](business/REVENUE_EXPERIMENTS.md). All candidates are
currently unvalidated. The next decision uses observed, consented behaviour,
feedback and interviews rather than hypothetical willingness to pay.

Before any pricing, checkout, waitlist, provider lead product, employer
product, research report, data license or API:

1. Record the user problem and evidence in the opportunity review.
2. Check the free-core guarantee and commercial-independence contract.
3. Confirm privacy, consent, source-rights, security, accessibility,
   performance and SEO implications.
4. Define one primary metric and Decision Session, exit, return, feedback,
   trust-complaint, accessibility and performance guardrails.
5. Set a sample requirement and stop condition before release.

## Boundaries

Phase 8 does not add a payment provider, pricing page, subscription, billing
table, marketplace, employer/company entity, CRM, ad technology, marketing tag
manager, new analytics provider, paywall, commercial landing-page family or
Supabase migration. The Phase 4 modular monolith remains the architecture.

Future B2C value can improve organisation, persistence, notification,
collaboration or presentation; it cannot make independent facts more accurate
for a paying user. Future B2B insight is aggregate and privacy-preserving.
Personal user data, private history and sensitive decision inputs are never a
revenue product.

## Definition of done

Phase 8 is complete when the free core, stage gate, commercial independence,
real action measurement, candidate registry, opportunity review and
source-rights readiness are explicit; payments and speculative supply have
not been introduced; and Phase 5–7 quality, privacy and growth contracts
remain intact.
