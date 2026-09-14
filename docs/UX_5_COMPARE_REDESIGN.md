# UX-5 Compare Redesign — deliverable report

Date: 2026-09-14 — Branch `codex/ux-5-compare-redesign` (worktree `campcareer-ux5`, base: clean `main` after UX-4). Changes are left uncommitted for Founder QA.

## Goal
Make `/compare` understandable and usable in its own right, with mode-specific controls and the campcareer visual system, while keeping the project boundaries (Scope: Compare only; SEO and analytics preserved).

## What changed (uncommitted)
- `src/app/(workspace)/compare/compare-mode-navigation.tsx` — mode titles are real names ("Compare programs / countries / cities / careers"); CountryPill only in Career and City modes; never in Country or Program mode.
- `src/lib/country-comparison.ts` — rewritten to a country-only model. New canonical URL param `countries=AU,IE` (replaces the old `locations=AU:sydney` city pair). 0→3 state progression, two-country minimum, three-country ceiling, deterministic sorted canonical hrefs. `resolveComparisonPageType`, ISO adapters and `getCountryCompareCountryOption` retained.
- `src/app/(workspace)/compare/countries-compare-matrix.tsx` — rewritten country-only columns (Country 1/2 + optional 3), replaced city-selector controls, dropped the "Living in selected city" section rows, desktop table + mobile stacked (campcareer tokens), emits `compare_complete` (category `country`), keeps "Verified fields only. Missing values are shown as —.".
- `src/app/(workspace)/compare/page.tsx` — `CountriesCompare` passes `initialCountries`; modes unchanged (program/country/city/career), Ireland gate for programs remains closed, noindex nofollow + canonical preserved.
- `src/components/analytics/decision-session-tracker.tsx` — `getCompareAnalyticsDetails` counts `countries` for `type=country` (compare_view preserved).
- `src/lib/ireland-career-comparison.ts` — fixed empty/one/two states: `IE_CAREER_COMPARE_MAX_CAREERS = 2`; added `IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR = "€32.99/hour"` (CSO Professional-occupations proxy, shared by all six MVP careers).
- `src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx` — rewrote to exactly two career slots, campcareer tokens, Pay row shows `€32.99/hour` (not a score/10), caveat kept, desktop DataTable + mobile stack no forced horizontal scroll, `compare_complete` kept.
- `src/app/(workspace)/compare/city-compare-selector.tsx` — restyled to campcareer tokens while preserving the a11y strings tests rely on (Swap aria-label, `sm:hidden">Swap cities</span>`, `focus:ring-4`, `min-w-0`).
- `src/app/(workspace)/compare/programs-compare-matrix.tsx` — campcareer tokens applied; global AU Nursing cohort and ProgramChooser behaviour unchanged; Program mode header no CountryPill.
- Tests: `tests/ux-5-compare-redesign.test.ts` (new, 20 checks); `tests/country-comparison.test.ts` (rewritten for the country-only API); `tests/ie-career-comparison.test.ts` (cap test now "caps at two"; caveat regex tolerant of line wrapping).

## Not changed (deliberately)
- `ireland-cities-compare-matrix.tsx` copy stays intact (asserted by `ie-city-qa-contract` / `ie-city-compare-contract`), only its selector is restyled.
- `careers-compare-matrix.tsx` (AU) was already campcareer-styled.
- `src/lib/compare-routes.ts`, `src/lib/career-comparison.ts`, `src/lib/compare-navigation.ts` — canonical href builders untouched.
- No internal product-strategy copy exists in `src/` (only in `docs/` and old tests); the new test asserts continued absence.

## Validation
- Unit tests: full suite green, 1870 passed / 0 failed (`npx tsx --test "tests/**/*.test.ts"`).
- Typecheck: `tsc --noEmit` clean.
- Lint: `eslint` clean on all changed files.
- `git diff --check`: clean.
- `npm run build`: compile + TypeScript pass. Full static prerender requires live Supabase env (absent here) — `/countries/be` blocks export; unrelated to Compare. Note: build regenerated `src/data/blog-manifest.json` (reverted).
- Browser checks (dev server `127.0.0.1:3100`, real env copied from the base worktree `.env.local`, git-ignored):
  - Program (AU nursing from Supabase): 200, noindex, campcareer tokens, mode nav, no CountryPill.
  - Country empty / AU+IE / AU+IE+UK: 200, noindex, "Choose country" controls, `countries=` URL, "Select two countries…", third-slot "Country 3".
  - Ireland careers empty / one / two: 200, noindex, "Select two Ireland careers…"/"Select one more…", Pay renders `€32.99/hour`, `hidden md:block` + `md:hidden` split.
  - AU careers: 200, noindex, campcareer tokens.
  - City AU and IE (dublin/cork from Supabase): 200, noindex, First/Second city + Swap.

## Notes for Founder QA
- Worktree uses a copied `.env.local` from the base worktree for local browser checks; it is git-ignored so no secrets enter the diff.
- Nothing was committed or pushed; review the 12 modified files + 1 new test file above.
- Country Compare data is intentionally not fabricated: RN country shells are still all-null placeholders, so the matrix shows "—" for unverified values; v1 scope was the mechanism/UX, not inventing data.