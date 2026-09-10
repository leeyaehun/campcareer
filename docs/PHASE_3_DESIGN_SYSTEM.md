# Phase 3 — Design System & UI Language

Status: implemented for the shared layer and representative product surfaces.

## Purpose

CampCareer uses a calm, evidence-first interface. The visual hierarchy is:

`Career → CampCareer Score → Evidence → Path → Study / Programs → Jobs`

The interface presents a conclusion first, keeps supporting data legible, and does not use decorative gradients, score gauges, traffic-light score treatments, or dashboard-style equal-weight cards on the canonical Career Page.

## Canonical tokens

`src/app/campcareer-brand.css` is the single canonical token layer.

- Canvas, surface, subtle surface, text, muted text, border, accent and semantic state tokens all use `--cc-color-*` names.
- The primary accent is `#2563EB`. Blue identifies CampCareer actions and orientation; it does not assign separate colours to Demand, Pay, or Entry.
- Semantic colours are limited to success, caution and negative states. They always pair colour with text or an icon.
- Spacing uses a 4px scale: `--cc-space-1` through `--cc-space-16`.
- Control, surface, large and featured radii are 6px, 8px, 12px and 16px.
- Surface elevation is limited to `--cc-shadow-surface` and `--cc-shadow-raised`.
- Inter remains the UI and score typeface. Numeric metrics use tabular numerals where comparison matters.
- Motion uses short tokenized durations. The global reduced-motion rule removes nonessential animation and smooth scrolling.

Tailwind exposes these values through `brand`, `campcareer`, `rounded-cc-*`, `shadow-cc-*`, `duration-cc-*`, and `cc-*` spacing utilities. `--brand`, `--cc-*`, and shadcn-style variables remain aliases only while legacy consumers are migrated; they are not independent palettes.

## Shared primitives

`src/components/ui/` provides the standard building blocks:

- controls: `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Tabs`
- overlay and support: `Popover`, `Dialog`, `Tooltip`, `Skeleton`, `Separator`
- status and content: `Badge`, `EmptyState`, `ErrorState`, `LoadingState`, `Card`
- data and entities: `Metric`, `Score`, `Stat`, `Trend`, `SourceInfo`, `EntityBadge`, `EntityCard`, `EntityPageHeader`, `EntityPageSection`
- discovery and comparison: `FilterBar`, `FilterChip`, `DataTable`, `CompareShell`, `CompareHeader`, `CompareSection`, `CompareCell`

Buttons use primary, secondary, outline, ghost, destructive and link variants. The compact control height is 36px; ordinary interactive controls are 40px or more. Keyboard focus uses the same visible blue ring across controls and links.

## Representative applications

- The shared primary and workspace navigation use the canonical surface, border, focus and action styles.
- `/careers` uses the catalogue’s existing data and route behavior, with standard search, country picker, filter chips, empty/loading states, badges, details and score display.
- `/career/{country}/{career-id}` uses the same Score and source/display primitives while preserving the existing Career read contract, publication behavior, evidence ordering and secondary actions.
- Career Compare uses `DataTable`, `CompareShell`, `CompareCell` and the Base UI-backed Dialog wrapper. Its city control and column chooser retain their existing behavior.
- Home uses `EntityCard` for public entry points without changing destinations.

## Accessibility and responsive rules

- Native buttons, labels, table structure, dialog focus trapping and `aria-*` state stay in place.
- All shared controls have a visible focus treatment and at least a 36px compact touch target.
- Empty, error, selected and trend states use text as well as colour.
- Tables sit in an explicit horizontal scroll container on narrow screens; mobile comparison uses stacked cells.
- Representative layouts were designed to reflow from a single column at 360/390px through tablet and desktop widths, with `min-w-0`, wrapping controls and no viewport-width positioning.

## Deliberately retained legacy surfaces

The Phase 3 audit found older literal palettes, gradients, oversized radii and large shadows in maps, country/city pages, blog layouts, legacy tool menus and many country-specific comparison matrices. They are retained because this phase does not redesign those product surfaces or change route behavior. The old global `btn-3d`, score-gradient and unused landing/result experiments were removed after a repository usage search; the retained onboarding choice card now uses canonical surface tokens.

Storybook is deferred. The repository has no existing Storybook setup; adding a dependency and a second build pipeline would be disproportionate to this focused UI pass. The shared primitives and representative screens are the source of truth until a dedicated component-preview task is approved.

## Phase boundary

This phase does not alter Career identities, Career read models, score formulas, readiness/publication gates, canonical URLs, SEO metadata, Supabase schema, authentication, Jobs, Programs, payment or recommendation systems.
