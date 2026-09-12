# Ireland Golden Slice — Wave A Normalization Status

Last reviewed: 12 September 2026

## Status

Wave A normalization now has a machine-readable staging package for all eight
Careers. The package is intentionally not a production publication switch.

Current staged Career Decision Ready candidates:

1. Software Developer
2. Cybersecurity Analyst
3. Data Engineer
4. Civil Engineer
5. Construction Manager

Current intentionally incomplete Careers:

- Accountant — shortage signal and industry-diversity coverage remain incomplete.
- Architect — shortage signal and vacancy-intensity evidence remain incomplete.
- Radiographer — shortage evidence remains explicitly inconclusive.

## What is normalized

The staging package now records:

- official/proxy occupation scope;
- shortage evidence where defensible;
- conservative vacancy fallbacks with survey-period lineage;
- recent employment momentum relative to the Ireland benchmark;
- conservative industry-diversity proxies where published coverage is sufficient;
- country-relative official Pay proxy with its broad-scope limitation;
- projected growth relative to the Ireland benchmark;
- Entry Accessibility;
- Entry Burden;
- visa/permit context, explicitly excluded from CampCareer Score v1.

All proxy evidence carries a proxy reason.

## CampCareer Score candidates

These totals are **staging-only mathematical candidates**. They are not in the
public readiness allowlist.

| Career | Demand | Pay | Entry | Candidate total |
| --- | ---: | ---: | ---: | ---: |
| Software Developer | 6 | 10 | 8 | 78 |
| Cybersecurity Analyst | 6 | 10 | 8 | 78 |
| Data Engineer | 6 | 10 | 8 | 78 |
| Civil Engineer | 5 | 10 | 8 | 74 |
| Construction Manager | 6 | 10 | 6 | 72 |
| Accountant | — | 10 | 8 | Not ready |
| Architect | — | 10 | 3 | Not ready |
| Radiographer | — | 10 | 3 | Not ready |

A missing component produces no total. It is never converted to zero.

## Important Pay limitation

All eight Wave A Careers currently use the same official broad CSO
Professional-occupations earnings proxy:

- Professional occupations median hourly earnings: EUR 32.99
- All occupational groups median hourly earnings: EUR 19.60
- ratio: 1.6832

This is official evidence and is permitted by the current Pay policy as a
broader occupation-group proxy, but it is **Estimated**, not exact Career pay.

Consequences:

- the current proxy can support a country-relative Pay component;
- it cannot be displayed as the exact salary of Software Developer, Civil
  Engineer, Architect, etc.;
- it cannot be used to claim Pay differences among these eight Careers;
- a future more detailed official occupation earnings source should replace it
  without changing the canonical Career identity.

## Vacancy evidence

Where both 2024 and 2025 SOLAS Recruitment Agency Surveys repeatedly identify
the Career/family as difficult to fill, staging uses the conservative fallback:

`low intensity 3 + persistence 1 = 4 / 15`

This currently applies to:

- Software Developer
- Cybersecurity Analyst
- Data Engineer
- Civil Engineer
- Construction Manager
- Accountant

Radiographer receives only `3 / 15` because it is named in the 2024 survey but
not repeated in the 2025 health summary.

Architect remains unscored: reviewed difficult-to-fill mentions in the
relevant construction group referred to Quantity Surveyors, and that evidence
is not borrowed for Architect.

## Industry-diversity evidence

The normalization uses published SOLAS broad-sector shares and groups all
unpublished residual employment into one `other` bucket. This creates a
conservative HHI upper bound.

The method requires at least roughly 80% explicit published coverage.

- ICT family: 82% explicit coverage → proxy score 1/5
- Construction family: 91% → proxy score 1/5
- Healthcare family: 94% → proxy score 0/5 because concentration is real
- Business/Financial family: 70% → **not scored**

Accountant therefore remains incomplete rather than receiving a guessed
diversity score.

## Production activation policy

The next database step must follow Add → Validate → Switch.

### Add

Backfill the Career Data Foundation tables with the normalized Wave A evidence,
while keeping the public score readiness allowlist unchanged.

### Validate

Verify in the target database that:

- every source reference resolves;
- every proxy has a proxy reason;
- every normalized metric reconstructs its component;
- the five complete Careers reconstruct the staged public totals;
- the three incomplete Careers remain unscored;
- no existing AU/US/UK foundation result regresses;
- RLS/grants remain unchanged and secure.

### Switch

Only after validation should a separate small change:

- mark reviewed Ireland Career foundation rows decision-ready as appropriate;
- add explicitly approved IE Career pairs to the public score readiness
  inventory;
- expose the score in product surfaces.

Data backfill and public activation should not be the same irreversible step.

## Current verdict

**NORMALIZATION STAGING SUBSTANTIALLY COMPLETE — PRODUCTION BACKFILL NOT YET APPLIED.**

The evidence work has deliberately stopped short of inventing shortage or
vacancy classifications for Accountant, Architect, and Radiographer.

The next engineering task is to prepare the data-backfill migration package
from this staging dataset, then validate it before any public activation.
