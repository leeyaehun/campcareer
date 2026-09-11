# CampCareer release blockers

Last reviewed: 2026-09-11

## Open launch blockers

| Severity | Item | Evidence and impact | Exit condition | Owner |
| --- | --- | --- | --- | --- |
| P0 | Supabase migration history drift | The checkout has 759 migration versions and the linked project has 813. There are 230 repository-only and 296 deployed-only versions. `20260907101500_p0_5_private_raw_career_data.sql` is repository-only. A normal `supabase db push --dry-run` refused the divergent history. | Integrate the approved deployed lineage; dry run until only the intended P0.5 migration remains; apply it through the normal migration workflow; verify history and application reads. Never rewrite history merely to make lists match. | Database/release owner |
| P0 | Raw Career privilege boundary is not fully hardened | The existing P0.5 migration has not been safely applied. The server read path retains its narrow `42501 → anon` compatibility fallback, so the raw Career boundary cannot be claimed fully hardened. | After migration reconciliation, apply the existing migration, verify service-role SELECT plus anon/authenticated denial and Career read output, then remove the fallback in a focused change. | Database/release owner |
| P1 | Synthetic LCP baseline misses the Phase 5 target on representative pages | Local production-like Lighthouse measured LCP from 3.46 to 4.95 s on the sampled non-home routes; the target is 2.5 s. This is lab evidence only, but it identifies work required before public launch and field monitoring. | Establish a repeatable budget, remove the measured high-impact bottleneck(s), rerun the lab audit, then monitor field CWV after launch. | Web performance owner |
| P1 | Manual accessibility evidence is not yet recorded | Automated WCAG scans are clean, but automation cannot prove screen-reader, 200% zoom, touch target, reduced-motion, focus restoration, or keyboard quality. | Record the manual checklist in the quality standard on representative desktop and mobile surfaces; fix any material finding. | Release owner / accessibility reviewer |
| P1 | Supabase leaked-password protection warning | Supabase Advisor reports `auth_leaked_password_protection` as a warning. | Enable and verify leaked-password protection in the Supabase Auth dashboard, then record the setting. | Auth owner |

## Open planned work

| Severity | Item | Evidence | Policy |
| --- | --- | --- | --- |
| P2 | 128 RLS-enabled tables have no policy | Supabase Advisor reports these as informational; sampled tables are internal catalogue/ingest surfaces intentionally denied to browser roles. | Inventory and document the intended service-role-only tables. Do not add browser policies just to remove the warning. |
| P2 | Database index advisor findings | 25 unindexed foreign keys and 83 unused indexes were reported as informational. | Review with production query/index telemetry; do not add or drop indexes mechanically. |
| P2 | CSP rollout | Security headers are active, but CSP needs a tested Next.js nonce/reporting design. | Introduce in report-only or a controlled staged rollout with E2E coverage. |
| P2 | Moderate production dependency advisory | `npm audit --omit=dev --audit-level=high` exits successfully but reports one Moderate `baseline-browser-mapping` denial-of-service advisory. | Review the upstream fix through normal dependency updates and rerun the production audit; do not use an unreviewed bulk audit fix. |
| P2 | Next.js RSC stream-close logs under parallel E2E | During concurrent production-like Playwright navigation, the `next start` process logs `The destination stream closed early`; all 45 executed tests passed, HTTP assertions succeeded, and no browser console/page errors were captured. | Reproduce with production traffic or a reduced concurrent suite; investigate if it appears outside an intentionally aborted test/navigation request. |
| P3 | Lighthouse cleanup opportunities | Lab audit reports small legacy JavaScript/CSS and back/forward cache opportunities. | Address only when profiling demonstrates an impact. |

## Resolved in this review

- Critical browser journeys now run from the production build on Chromium,
  Firefox, WebKit, and mobile Chromium in CI.
- Automatic navigation prefetch no longer produces Safari RSC console errors in
  critical journeys.
- Sampled shared surfaces have no automated WCAG 2.2 AA violations; footer
  heading structure and low-contrast text were corrected.
- Third-party institution favicon loading was removed from the rendered page.
- The 40 Australian state occupation context pages are `noindex, follow` and
  excluded from the sitemap; canonical Career routes remain the only indexable
Career product surface.

## Release decision

**NOT READY FOR PHASE 6.** The two P0 migration/privilege items must be
resolved before public launch. P1 performance, manual accessibility, and Auth
configuration evidence must also close before release.
