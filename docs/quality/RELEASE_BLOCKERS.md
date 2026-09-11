# CampCareer release blockers

Last reviewed: 2026-09-11

## Open launch blockers

| Severity | Item | Evidence and impact | Exit condition | Owner |
| --- | --- | --- | --- | --- |
| P1 | Manual accessibility sign-off is not yet recorded | CI now provides clean WCAG 2.2 AA scans plus automated keyboard focus, high text scaling, reduced-motion, and mobile minimum-target evidence. Automation still does not prove real screen-reader output, browser 200% zoom behaviour, complete keyboard/menu/dialog/filter/Compare interaction quality, focus restoration, or the larger 40/44 px product touch-target standard. | Complete and record the manual checklist in [PHASE_5_ACCESSIBILITY_EVIDENCE.md](PHASE_5_ACCESSIBILITY_EVIDENCE.md) on representative desktop and mobile surfaces; fix any material finding. | Release owner / accessibility reviewer |

## Open planned work

| Severity | Item | Evidence | Policy |
| --- | --- | --- | --- |
| P2 | RLS-enabled service-only tables have no policy | Supabase Advisor reports these as informational. The six raw Career tables intentionally join this set after P0.5 because browser roles have no table privilege and no browser SELECT policies. | Inventory and document intended service-role-only tables. Do not add browser policies just to remove the informational lint. |
| P2 | Supabase leaked-password protection is plan-gated | Security Advisor reports `auth_leaked_password_protection` as WARN, but the production Supabase organization is on the Free plan and Supabase documents leaked-password protection as Pro+ only. Password auth is used, so enable and re-verify this control when the project moves to Pro; do not treat an unavailable paid control as a Free-plan release blocker. | Upgrade-triggered Auth hardening. |
| P2 | Database index advisor findings | 25 unindexed foreign keys and 83 unused indexes were reported as informational. | Review with production query/index telemetry; do not add or drop indexes mechanically. |
| P2 | CSP rollout | Security headers are active, but CSP needs a tested Next.js nonce/reporting design. | Introduce in report-only or a controlled staged rollout with E2E coverage. |
| P2 | Moderate production dependency advisory | `npm audit --omit=dev --audit-level=high` exits successfully but reports one Moderate `baseline-browser-mapping` denial-of-service advisory. | Review the upstream fix through normal dependency updates and rerun the production audit; do not use an unreviewed bulk audit fix. |
| P2 | Next.js RSC stream-close logs under parallel E2E | During concurrent production-like Playwright navigation, `next start` can log `The destination stream closed early`; current critical assertions still pass and no browser console/page errors are captured. | Reproduce with production traffic or a reduced concurrent suite; investigate if it appears outside an intentionally aborted test/navigation request. |
| P3 | Lighthouse cleanup opportunities | Lab audit still reports unused JavaScript/CSS and back/forward-cache opportunities. | Address only when profiling demonstrates an impact. |

## Resolved in this review

- Supabase production migration lineage is reconciled. The branch and production
  both contain 814 migrations with zero branch-only or production-only versions.
- P0.5 `20260907101500_p0_5_private_raw_career_data` is applied in production
  under its intended version.
- All six raw Career tables grant SELECT to `service_role`, deny
  `anon`/`authenticated` table SELECT, and have no browser SELECT policies.
- A real service-role read across all six raw Career tables succeeded.
- The application-side `42501 → anon` fallback is removed; raw Career reads
  are server-role-only.
- Critical browser journeys run from the production build on Chromium, Firefox,
  WebKit, and mobile Chromium. CI #2087 on commit `cdf05705` passed every
  release step, including critical E2E, whitespace, and secret scanning.
- Automatic navigation prefetch no longer produces Safari/WebKit RSC console
  errors in the critical journeys.
- Representative `@axe-core/playwright` WCAG 2.2 AA scans are clean.
  Additional CI checks pass for keyboard focus visibility, high text scaling,
  reduced motion, and the WCAG 2.2 minimum 24 px mobile target size.
- Synthetic performance is within the Phase 5 release budget on all seven
  representative routes. Performance audit #34 on commit `cdf05705` passed the stricter three-sample median gate: LCP ≤ 2.5 s, CLS ≤ 0.10, and warm TTFB ≤ 800 ms on every representative route.
- Third-party institution favicon loading was removed from the rendered page.
- The 40 Australian state occupation context pages are `noindex, follow` and
  excluded from the sitemap; canonical Career routes remain the only indexable
  Career product surface.

## Release decision

**NOT READY FOR PHASE 6.** The migration, raw-Career privilege, critical
browser, and performance blockers are closed. Supabase leaked-password
protection remains a P2 plan-gated hardening item. The only open launch-critical
P1 is the manual accessibility sign-off described above.
