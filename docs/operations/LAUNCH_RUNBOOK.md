# CampCareer launch runbook

Use this checklist for Release Candidate, Quiet Launch and Stable Public Launch.
It supplements [release and recovery](release-and-recovery.md), not replaces it.

## Release Candidate

- [ ] Search, discovery, Compare and entity relationships work; primary navigation has no empty destination.
- [ ] Core published data has sources/dates; estimates and missing evidence are labelled; no `review_required` input is published.
- [ ] Phase 5 has no P0 or major unresolved P1, and all required CI/quality checks pass.
- [ ] Release performance gate passes: `npm run audit:lighthouse` reports all 7 representative routes within budget (LCP ≤ 2.50 s, CLS ≤ 0.10, warm TTFB ≤ 800 ms medians). Restart the server from a fresh build and warm routes before the run; do not change budget, route set or sample counts. See the performance-gate section in `PHASE_6_LAUNCH_MEASUREMENT_TRUST.md`.
- [ ] `/robots.txt`, `/sitemap.xml`, canonical metadata and representative redirects are verified.
- [ ] `/methodology`, `/sources` and `/data-policy` render and data issue reporting accepts an anonymous test report.
- [ ] Consent blocks Vercel/GA measurement until affirmative choice; analytics debug validation passes.
- [ ] Vercel runtime logs, CI results and Speed Insights are accessible to the release owner.
- [ ] The applicable data pipeline/run record has a reviewed source and recovery owner.

## Exact external-provider actions

These cannot be completed from the repository.

1. **GA4:** create/select the production property, add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the production build environment, deploy, run the DebugView checklist in `PHASE_6_LAUNCH_MEASUREMENT_TRUST.md`, then configure `compare_view` and `decision_session` as Key Events.
2. **Search Console:** create/verify the `campcareer.com` Domain Property through DNS; add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` only if HTML-meta verification is used; submit `https://www.campcareer.com/sitemap.xml`; record fetch status and discovered URLs.
3. **Supabase backups:** in the production dashboard, record whether automated backups/PITR are enabled, retention and owner. Do not perform a destructive restore. Schedule the isolated quarterly restore drill in `release-and-recovery.md`.
4. **Vercel:** confirm production deployment logs and Analytics/Speed Insights access for the release owner.

## Representative Search Console inspection set

Inspect live URL, declared canonical, Google-selected canonical when available,
indexability and rendered primary content. Do not mass-request indexing.

| Surface | Representative URL | Expected |
| --- | --- | --- |
| Home | `/` | 200, self-canonical, indexable |
| Career discovery | `/careers` | 200, intentional noindex discovery surface |
| Canonical Career | `/career/au/electrician` | 200, canonical Career metadata and publication gate |
| Country | `/countries/au` | 200, self-canonical, indexable |
| Program | one current sitemap program URL | 200, self-canonical, published-only |
| Institution | one current sitemap institution URL | 200, self-canonical, published-only |
| Compare | `/compare` | 200, product route; verify its intended metadata/indexing state |
| Trust | `/data-policy` | 200, self-canonical, indexable |

## Quiet Launch

- [ ] Public domain is reachable without promotional campaign.
- [ ] A crawler can fetch intended robots/sitemap/canonical pages.
- [ ] Consent-gated events arrive in GA4 DebugView and Vercel Analytics.
- [ ] Runtime errors are visible and triaged; no P0 is open.
- [ ] A real anonymous page-feedback and data-issue submission has been reviewed in the existing feedback workflow.
- [ ] First weekly review is scheduled.

## Stable Public Launch

Require at least a Quiet Launch observation window with no P0, no unresolved
major P1, working core journey, event delivery, accessible monitoring, valid
sitemap, representative canonical inspection, no known major data issue and
working feedback/data reporting. Code passing alone is insufficient.
