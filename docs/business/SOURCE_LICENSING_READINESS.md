# Source Licensing Readiness

Last reviewed: 12 September 2026

## Purpose and rule

Source provenance is not a commercial-use license. CampCareer must not sell,
license, export or redistribute source-derived data merely because it is
available in a public page, API, snapshot or internal database.

This inventory is the operating layer above existing source manifests and
snapshots. It does not make a legal conclusion where the repository has not
recorded one.

## Status vocabulary

| Status | Meaning | Commercial handling |
| --- | --- | --- |
| `verified` | Exact current terms, scope, attribution and commercial/redistribution rights were reviewed and recorded by an owner. | May be considered only within the recorded scope. |
| `review_required` | A source or license label exists, but rights, scope, attribution or derived-use treatment are incomplete. | No external data product, export or license based on it. |
| `restricted` | Terms or the existing source record indicate restricted use or redistribution. | Do not package, resell or expose as a data product. |
| `unknown` | No usable terms or review record exists. | Treat as blocked for commercial data use. |

## Current readiness inventory

| Source family / repository evidence | License evidence presently recorded | Commercial and redistribution status | Required next step |
| --- | --- | --- | --- |
| Country source snapshots in `src/data/*-source-snapshots.json` | Mixed labels including `public-statistics`, `official-source`, `public-administrative-source`, `Licence Ouverte 2.0`, `cc-by-igo` and `pending-verification`. | `review_required` unless a source-specific rights review records exact scope, attribution and derived-use rights. A descriptive label is not a blanket commercial grant. | Create a reviewed per-source register before any external data product. |
| Snapshot records marked `restricted` or `commercial-report` | The snapshot itself signals a restriction or commercial source. | `restricted`. | Keep out of any resale, API, report or bulk export until written permission changes the record. |
| Candidate-ingestion manifests | The common ingestion framework requires `licence` and `usage_restriction`; tier `t3` explicitly avoids raw storage. | `review_required` by default; ingestion validation does not grant commercial rights. | Add reviewed rights fields before controlled commercial reuse. |
| Official program, institution, employer and job links | Links establish destinations, not reuse rights for their content or listings. | `unknown`. | Review terms and obtain agreement before creating provider/employer data products. |
| CampCareer normalization, relationships, score calculations and aggregates | Created by CampCareer on top of sources. | Rights are limited by source inputs; ownership of transformation does not grant redistribution of underlying inputs. | Trace source inputs and document the permitted output scope. |
| Historical snapshots and source excerpts | Provenance and historical records are retained for audit. | Follows the underlying source status. | Do not assume archival storage permits commercial distribution. |

## Per-source register required before a commercial data product

For every critical upstream source, record:

| Field | Requirement |
| --- | --- |
| Source ID, owner and canonical URL | Identifies the exact source and review owner. |
| Data fields and geography/time scope | Identifies which facts are proposed for commercial use. |
| License / terms URL and reviewed date | Records the exact governing text, not a guess. |
| Commercial-use and redistribution rights | State explicit permission, prohibition or unresolved status separately. |
| Attribution and notice | Records wording, link and placement requirements. |
| Derived-use and aggregation position | Records whether transformation, scoring, caching, API use or reporting is permitted. |
| Raw-storage tier and retention | Reuses the ingestion policy, including tier-`t3` restrictions. |
| Status, reviewer and evidence | Uses the status vocabulary above and a reviewable record. |

## Commercial data gate

A paid API, research report, data license or bulk export remains blocked until
critical inputs have stable schemas, documented historical depth, demonstrated
customer demand and an appropriate `verified` rights record. One unresolved
critical source blocks the product; it cannot be papered over by a derived
score or aggregation.
