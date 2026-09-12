# CampCareer privacy foundation inventory

Last reviewed: 11 September 2026
Owner: Yaehun Lee, operating CampCareer
Privacy contact: leeyaehun@gmail.com

This is the internal source of truth for the public privacy policy, cookie
notice, consent UI, and release checks. It records the data flows currently
implemented in the product; it is not a substitute for jurisdiction-specific
legal advice.

## Current service providers

| Provider | Role | Data categories in scope |
| --- | --- | --- |
| Supabase | Authentication, database, private storage | Account identifiers, saved plans, feedback and support-request records |
| Vercel | Hosting, optional Analytics and Speed Insights | Page and performance measurement after visitor consent |
| Google Analytics 4 | Optional product measurement when a production measurement ID is configured | Consent-gated product events and page measurement |
| Resend | Transactional and separately consented email | Email address and the message/alert metadata required to deliver it |

An external school, agency, insurer, money-transfer provider, communications
provider, or accommodation provider receives data only through its own site,
or after the visitor gives the specific consent displayed for a support request.

## Cookies and local device storage

| Name or category | Purpose | Essential? | Set when | Retention |
| --- | --- | --- | --- | --- |
| Supabase authentication session cookies | Keep a signed-in user authenticated and protect their account | Yes | Sign-in or account session refresh | Provider-controlled session lifetime |
| `cc_analytics_consent` | Remember the visitor's measurement choice (`granted` or `denied`) | Yes, as the record of the choice | Visitor selects a choice in the consent banner | 180 days |
| `cc_sid` | Pseudonymous measurement session identifier | No | A subsequent request after measurement consent | 30 days |
| `cc_first_path` | First CampCareer path in the consented session | No | A subsequent request after measurement consent | 30 days |
| `cc_utm_source`, `cc_utm_medium`, `cc_utm_campaign`, `cc_utm_term`, `cc_utm_content` | Consented campaign attribution | No | A subsequent request after measurement consent and only when the corresponding URL parameter exists | 30 days |

## Measurement gate

Before affirmative measurement consent, CampCareer must not initialise Vercel
Analytics, Vercel Speed Insights, Google Analytics 4, or custom product-event requests. Custom
events use an allow-list and must not include email addresses, free-text
answers, full URLs with user input, passport data, payment data, or special
category data.

The current allowed custom-event context is limited to low-cardinality product
fields such as country, concept, goal, locale, route ID, link type, event
counts and entity families. Search text is omitted when it resembles obvious
PII. Feedback text is never sent to analytics.

## Release checklist

- Update this inventory before adding or removing an analytics, advertising,
  chat, A/B test, support, payment, email, or partner service.
- Update the public Privacy Policy and cookie information in the same release.
- Verify a fresh browser sends no optional measurement request before consent.
- Verify **Essential only** blocks optional measurement.
- Verify **Allow measurement** enables only the documented measurement flows.
- Before adding a preference-management screen, document and test that
  withdrawing consent deletes the optional CampCareer cookies and blocks future
  measurement.
- Obtain a jurisdiction-specific legal review before taking payments, adding
  advertising/retargeting, or materially changing the data categories.

## Open operating decision

No registered business address has been supplied for publication. Do not invent
one. Confirm whether a business/registered address or another legally required
contact channel must be published for the jurisdictions in which CampCareer is
offered before a paid launch.
