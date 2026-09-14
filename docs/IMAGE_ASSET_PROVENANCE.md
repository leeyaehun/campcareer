# Image Asset Provenance — UX-6 Visual Identity

This document records the visual assets used in UX-6 surface changes and the licensing/reuse policy that governs them.

## Governing rule

Phase-5 quality standard ([docs/PHASE_5_QUALITY_STANDARD.md](../docs/PHASE_5_QUALITY_STANDARD.md)):  

> External institution favicons are not loaded as page images; only first-party
> logo assets render. This avoids a third party setting browser state before the
> visitor deliberately opens the source.

All visual imagery on the modified surfaces therefore satisfies one of:

1. An already-approved Unsplash image served same-origin through the Next/Image optimizer (the browser never contacts the third party directly).
2. A first-party logo asset served from the CampCareer origin (`/` or `https://www.campcareer.com/`).
3. A brand-tinted monogram mark generated entirely client-side from verified entity names.

No new third-party image domains were introduced.

---

## Country hero imagery

| Country | Source asset | Photo ID | Source origin | Approval |
|---------|-------------|----------|---------------|----------|
| Ireland | `LaunchCountry.image` | `photo-1751235332025-a2f2bf7f24b8` | Unsplash | Already approved in `src/data/launch-countries.ts` catalogue JSdoc |
| Australia | `LaunchCountry.image` | `photo-1506973035872-a4ec16b8e8d9` | Unsplash | Same approval |
| Canada | `LaunchCountry.image` | `photo-1503614472-8c93d56e92ce` | Unsplash | Same approval |
| United States | `LaunchCountry.image` | `photo-1496442226666-8d4d0e62e6e9` | Unsplash | Same approval |
| United Kingdom | `LaunchCountry.image` | `photo-1513635269975-59663e0ac1ad` | Unsplash | Same approval |
| All other launch countries | `LaunchCountry.image` | Per catalogue row | Unsplash | Same approval |

All country hero images are rendered via `next/image` with `fill`, `sizes="100vw"`, `loading="eager"`, and `fetchPriority="high"`. The fixed crop query string (`?w=400&h=250&fit=crop&auto=format`) is stripped; the Next/Image optimizer resizes above the fold.

The browser fetches these images from `/_next/image` (same origin). No direct Unsplash contact occurs.

---

## Ireland city hero imagery

| City | Photo ID | Catalogue source |
|------|----------|------------------|
| Dublin | `photo-1666115836913-24e621a54d0b` | `src/data/regional-discovery.ts` IE list |
| Cork | `photo-1633937765115-b5e0987541b3` | Same |
| Galway | `photo-1693824107580-9b05a98ea682` | Same |
| Limerick | `photo-1660687446300-b05801428ca9` | Same |

These are already-used Unsplash assets served through the same Next/Image pipeline as the country heroes. The fixed crop query is stripped before rendering.

City hero rendering falls back to gradient-only when no matching `regional-discovery` card exists.

---

## Entity marks (institutions and employers)

No third-party logo assets were introduced for the nine verified Ireland institutions or the three selected employers. All entity marks render a brand-tinted monogram initial generated from the verified entity name using `institutionInitials` from `src/lib/programs/institution-brand.ts`.

The monogram fallback is applied because:

1. The `institution_logo_v1` table contains zero rows for the nine verified IE institutions.
2. Phase-5 quality standard prohibits rendering external favicons as page images.
3. The founder acceptance criteria explicitly accept "a consistent/clear fallback mark" when an approved logo is not available.

The `EntityLogo` component (`src/components/ui/entity-logo.tsx`) is forward-compatible with first-party logo assets: if a future `institution_logo_v1` row stores a path starting with `"/"` or `"https://www.campcareer.com/"`, that asset will render with an `onError` fallback to the monogram mark.

---

## Visa catalogue imagery

No images were added to the Ireland visa surfaces. The visual hierarchy improvements are achieved through layout, grouping, and the existing brand-tinted token system.

---

## Summary

| Surface | Asset type | Count | New domains added |
|---------|-----------|-------|-------------------|
| Country hero | Unsplash (same-origin via Next/Image) | 1 per country | None |
| Ireland city hero | Unsplash (same-origin via Next/Image) | 4 cities | None |
| Institution marks | Client-rendered monogram initials | 9 institutions | None |
| Employer marks | Client-rendered monogram initials | 3 employers | None |
| Visa surfaces | Existing token system only | 0 | None |

No Wikimedia, third-party logo services, or direct third-party favicon requests were introduced.