# Phase 5 accessibility evidence

Date: 2026-09-11  
Release branch: `prelaunch/release-blockers`

This record separates automated evidence from the manual checks required by the
Phase 5 quality standard. Automated checks reduce risk but are not represented
as a substitute for a real screen-reader and human interaction review.

## Automated evidence

CI #2087 on commit `cdf05705` completed successfully against the production
build served with `next start`. The critical suite ran 64 project/test
combinations: 49 passed and 15 intentional project-specific skips.

| Check | Representative evidence | Result |
| --- | --- | --- |
| WCAG 2.2 AA scan | `@axe-core/playwright` on Careers, Career, Country, Program, Institution, Compare, and Sources across Chromium, Firefox, WebKit, and mobile Chromium | Pass; zero violations |
| Keyboard focus visibility | Chromium tabs through the Careers entry surface and requires every sampled focus target to be interactive, visible, and visibly outlined | Pass |
| High text scaling | Career page at 200% root text scale, 640×900 viewport; H1 remains visible and document-level horizontal overflow is rejected | Pass |
| Reduced motion | Chromium with `prefers-reduced-motion: reduce`; rendered descendants are checked for animation/transition durations above the release smoke threshold | Pass |
| Mobile minimum target | Mobile Chromium scans visible buttons/inputs/selects/textareas/`role=button` controls on the Australia Country surface | Pass at the WCAG 2.2 24×24 CSS px minimum |
| Browser errors | Critical journeys fail on unexpected `pageerror` or error-level console output | Pass |

The product standard intentionally asks for larger general touch targets
(approximately 40×40 CSS px, and 44×44 for major actions where layout permits).
That product-level target still requires the manual mobile spot-check below.

## Manual sign-off

The release owner confirmed completion of the representative manual checks on
2026-09-11. Exact browser/device identifiers were not separately captured in
this project chat; the sign-off below records the confirmed release result
without inventing those details.

| Manual check | Representative surfaces / action | Status | Evidence / notes |
| --- | --- | --- | --- |
| Screen-reader landmarks and headings | Careers → Career; Country; Program → Institution; Compare; Sources. Confirm sensible landmark order, H1/H2 hierarchy, control names, table/Compare announcements, and status messages. | **Pass** | Release owner confirmed the representative screen-reader check completed successfully. |
| Full keyboard journey | Careers country selector/search → Career → Compare; Country search/filter; any menu/dialog used in the shared shell. Confirm no trap, logical order, and visible focus throughout. | **Pass** | Release owner confirmed the complete keyboard journey check passed. |
| Focus restoration | Open and close a representative menu/dialog; verify focus returns to the invoking control. | **Pass** | Release owner confirmed focus restoration behaved as required. |
| 200% browser zoom | At 200% browser zoom, review Career, Country, Program, Institution, Compare, and Sources for clipping, overlap, lost controls, or two-dimensional page scrolling. | **Pass** | Release owner confirmed the representative 200% browser-zoom review passed. |
| Mobile touch quality | On a phone-size viewport/device, verify primary actions are comfortably targetable and product targets are ~40×40 / 44×44 where intended. | **Pass** | Release owner confirmed representative mobile touch quality was acceptable. |
| Reduced-motion quality | With OS/browser reduced-motion enabled, exercise menus/search/Compare and confirm no unexpected motion remains. | **Pass** | Release owner confirmed the reduced-motion quality check passed. |

## Sign-off

- Reviewer: **Release owner (user-confirmed)**
- Date: **2026-09-11**
- Browser/device: **Representative desktop and mobile environments; exact identifiers not separately captured in this project chat**
- Result: **PASS**
- Material findings fixed: **None reported during final sign-off**

The manual accessibility P1 release blocker is closed.
