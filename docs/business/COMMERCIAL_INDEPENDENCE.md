# Commercial Independence

Last reviewed: 12 September 2026

This is a permanent CampCareer product and business contract.

## Independent results

Organic, editorial and data results answer the product question using the
published methodology and available evidence. They include Career and country
results, CampCareer Score, evidence, paths, programs, institutions, job
context, comparison and recommendation outputs.

The following statements are non-negotiable:

- Paying does not improve organic ranking.
- Paying does not improve CampCareer Scores or their components.
- Paying does not change methodology, evidence availability or publication
  gates.
- Paying does not suppress a competitor.
- Employer payment does not change demand, salary, suitability or a Career
  recommendation.
- Verified does not mean recommended.
- Sponsored does not mean better.

Commercial code must never become an input to
`src/lib/campcareer-score.ts`, Career data reads, comparison ordering,
country/discovery ranking or school scoring. The Phase 8 boundary test checks
those modules for commercial imports; changes to that boundary require an
explicit documented exception and review.

## Commercial placements

There is no sponsored-placement or advertising surface today. If one is ever
proposed, it must be separate from independent result lists and calculations,
plainly labelled in the rendered interface, visually distinguishable, keyboard
accessible, and test-covered. It must never appear as:

- a Career, program, institution, job or comparison result;
- a score component or an input to ordering;
- an unlabeled recommendation;
- a blocker or interstitial before core decision content.

No commercial placement changes canonical URLs, indexability or sitemap rules.

## Affiliate and referral rule

A link may use a commission or referral relationship only when all three
conditions are true:

1. The destination is independently useful and would be shown without the
   commission.
2. The relationship is disclosed in plain language at the interaction.
3. The relationship has no effect on independent answers or ordering.

The current Wise and Airalo cards meet the implementation-side disclosure
requirement with an affiliate label and `rel="sponsored"`. They are
contextual action cards, not Career, country, education or job rankings.
Their optional measurement requires affirmative analytics consent.

Official education and employer links remain direct official destinations
unless a justified, disclosed relationship has separately passed this
contract. CampCareer must not replace an official option with a higher-paying
destination.

## Verification and provider relationships

Provider verification can establish identity, authority to correct supplied
facts and a data-maintenance relationship. It cannot establish quality,
suitability, value, outcome superiority or recommendation. A verified
provider must still meet exactly the same public data, evidence and ranking
rules as every other provider.

## Privacy and business insight

CampCareer does not sell personal data, individual search history, private
decision history, sensitive notes or email-linked intent audiences.

Any future provider or employer insight uses a documented aggregate threshold,
minimum collection, valid purpose and consent where required. It may report
aggregate product patterns such as total views or commonly compared
alternatives. It cannot expose a person's private query, profile, application,
feedback or contact details.

## Enforcement

Every commercial proposal must be reviewed against this contract and
[the Phase 8 operating contract](../PHASE_8_MONETIZATION_BUSINESS_MODEL.md)
before implementation. A material conflict with trust is rejected by default.
