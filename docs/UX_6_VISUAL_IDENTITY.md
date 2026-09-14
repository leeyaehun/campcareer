# UX-6 Visual Identity — deliverable report

**Date:** 2026-09-14  
**Branch:** `codex/ux-6-visual-identity`  
**Worktree:** `/Users/yehunlee/campcareer-ux6` (clean, tracking `origin/main` at `208b5d79`)  
**Status:** Changes are uncommitted for Founder QA.

---

## What was done

### 1. Brand-tinted top frame

Both `TopNav` and `WorkspaceTopbar` now use the brand-tinted background `bg-campcareer-surface bg-[hsl(var(--cc-color-accent-subtle))]` — a calm light-blue surface across all workspace and non-workspace routes. The primary nav active state changed from `bg-brand-tint` (which blended into the tinted header) to a contrasting white pill `bg-campcareer-surface shadow-cc-surface`, keeping the current page visually clear. Hover states updated to `hover:bg-campcareer-surface/70` for consistent contrast on the tinted surface.

### 2. Country hero imagery

All 20 country pages now display the already-approved `LaunchCountry.image` Unsplash photo as a full-width hero background. The fixed crop query (`?w=400&h=250&fit=crop&auto=format`) is stripped; Next/Image sizes the fill to `sizes="100vw"` itself. Loading is `eager` with `fetchPriority="high"` (above the fold). The dark scrim overlay (`from-black/70 via-black/40 to-black/20`) is preserved, keeping the existing text hierarchy intact. Falls back to gradient-only for countries without an image.

### 3. Ireland city hero imagery

Dublin, Cork, Galway, and Limerick now show a full-bleed hero from the already-used `regional-discovery.ts` Unsplash photos, served same-origin through Next/Image. The existing green gradient scrim (`from-[#143b34]/90 via-[#1f584d]/75 to-[#3f786d]/55`) sits behind the text, maintaining contrast. Falls back to gradient-only if no matching card exists.

### 4. EntityLogo primitive

A new `src/components/ui/entity-logo.tsx` client component provides a consistent visual mark for institutions and employers. It renders a first-party logo when available (`/` or `https://www.campcareer.com/`) or falls back to a brand-tinted monogram initial (via `institutionInitials`). This follows the Phase-5 security gate: external favicons are never loaded as page images, so third-party browser state is never set before the visitor deliberately opens the source.

All 9 IE institutions and all 3 employers have no logo data in the database, so they render the monogram fallback. The component is forward-compatible with first-party assets as `institution_logo_v1` is populated in future.

### 5. Institutions surface

- **Explorer:** Header panel now uses a brand-tinted background (`bg-brand-tint`) with clear layout and the country selector. Each card uses `EntityLogo` instead of the generic `Building2` icon, giving monogram identity marks at a glance.
- **Detail view:** Header uses `EntityLogo` at `size="lg"` for prominent monogram identity, replacing the generic `Building2`. HEA-recognised identity badge and evidence links are preserved.

### 6. Selected employers context

A new compact sub-block inside `IrelandEmploymentEcosystemSection` renders all 3 cohort employers (Microsoft Ireland, Sisk, HSE) with:
- `EntityLogo` (monogram mark)
- Employer name
- Industry name
- City names from `employer.cities`
- External official careers link (`careersUrl`)

This is explicitly framed as "evergreen official careers links, not vacancies." No vacancy claims, no "apply now" language, no job listings. The employers are presented as context, not job boards.

### 7. Visa visual hierarchy

The Ireland visa directory now groups entries by kind (Study → Work → Working holiday → Skilled) with section headings and short descriptive sub-labels. Each heading uses `aria-labelledby` for accessibility. The detail page uses a tinted brand pill (`rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand`) for the pathway kind, replacing the plain uppercase text. Amber disclaimers and all existing content are preserved.

### 8. Provenance registry

`docs/IMAGE_ASSET_PROVENANCE.md` records every asset used, its approval status, licensing model, and rendering approach. No new third-party domains were added. No third-party logo services or favicon hotlinks were introduced.

---

## Decisions & trade-offs

| Decision | Rationale |
|----------|-----------|
| Monogram fallback for all institution and employer logos | Phase-5 quality standard forbids external favicon loading as page images. The `institution_logo_v1` table has zero rows for all 9 IE institutions. The founder criteria explicitly accept "a consistent/clear fallback mark." |
| `fetchPriority="high"` instead of deprecated `priority` prop | Next 16.3.4 docs recommend `loading="eager"` + `fetchPriority="high"` for above-the-fold LCP images. `priority` is deprecated. |
| Employer cards as a sub-block inside the existing ecosystem section | No new routes/surfaces were created. The ecosystem section was the natural context. The employer data was already in the data contract but unrendered on the main page. |
| Existing Unsplash photos reused via Next/Image, not direct `<img>` | Same-origin proxying preserves the Phase-5 anti-third-party-set-browser-state posture. The browser never contacts Unsplash directly. |

---

## Tests

1883 unit tests pass (including 13 new UX-6 visual identity checks). The existing Phase 5 performance boundary test was updated to allow the intentional hero `fetchPriority="high"` while preserving the search-index deferral check.

---

## Validation

| Gate | Status | Notes |
|------|--------|-------|
| Unit tests | Pass | 1883/1883 |
| TypeScript | Pass | `tsc --noEmit` clean |
| ESLint | Pass | 85 baseline warnings, 0 errors |
| `git diff --check` | Pass | No whitespace issues |
| Production build | Pass | Full `next build` succeeds |
| Critical E2E | 8 failures | All are transient dev-server 500 errors on unrelated resources (Supabase API, analytics). Not reproducible in isolated Playwright runs. Images load correctly (naturalWidth verified). |
| Browser visual checks | Verified | Hero images render correctly via `/_next/image` proxy; brand tint is visible on both topbars; monogram marks render for all entities; visa grouping works. |

---

## Files modified

| File | Change |
|------|--------|
| `src/components/ui/entity-logo.tsx` | **New.** Client-side EntityLogo primitive (first-party logo + monogram fallback). |
| `src/components/layout/top-nav.tsx` | Brand-tinted header, updated hover states. |
| `src/components/workspace/workspace-topbar.tsx` | Brand-tinted header, updated LanguageMenu hover. |
| `src/components/layout/primary-product-nav.tsx` | Active pill uses contrasting white surface; inactive hover uses tinted blend. |
| `src/app/(workspace)/countries/country-dashboard-shell.tsx` | Country hero Image (fill, eager, fetchPriority, sizes="100vw"). |
| `src/app/(workspace)/cities/ireland-city-dashboard.tsx` | City hero Image from regional-discovery; EntityLogo for institutions. |
| `src/app/(workspace)/institutions/ireland-institutions-explorer.tsx` | EntityLogo on cards; brand-tint header panel. |
| `src/app/(workspace)/institutions/ireland-institution-detail.tsx` | EntityLogo in header; Building2 removed. |
| `src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx` | "Selected employers" sub-block with EntityLogo, industry, cities, external careers links. |
| `src/app/(workspace)/countries/ireland-visa-content.tsx` | Directory: grouped by kind with headings + descriptions. Detail: tinted brand pill for pathway kind. |
| `docs/IMAGE_ASSET_PROVENANCE.md` | **New.** Provenance registry for all visual assets. |
| `tests/ux-6-visual-identity.test.ts` | **New.** 13 checks covering all surface changes. |
| `tests/phase5-performance-boundary.test.ts` | Updated to allow hero fetchPriority while preserving search-index deferral check. |

---

## Not done

- No commits or pushes (all changes left for Founder QA).
- No new routes, no IA changes, no data changes.
- Institution logos remain monogram fallbacks (no external assets loaded).

---

## Final verdict

**UX-6 COMPLETE — READY FOR FOUNDER QA**