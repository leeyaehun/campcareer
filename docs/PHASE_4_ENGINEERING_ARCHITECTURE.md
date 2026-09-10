# Phase 4 — Engineering Architecture

## Official stack

CampCareer is a modular monolith on Next.js App Router and Supabase-managed
PostgreSQL. Supabase migrations are the canonical schema history. No Neon,
Prisma, GraphQL, microservice, search-service, URL, Career Score, publication
gate, or database-provider migration is introduced by Phase 4. ADR-001 records
the provider decision.

```text
Browser
  ↓
Next.js App Router
  ↓
Server Components / Route Handlers / Server boundaries
  ↓
Domain read models and services
  ↓
Supabase data access
  ↓
PostgreSQL
```

The default App Router model is server rendering. Client Components exist only
where they need browser state, event handling, dialogs, filters, comparison
selection, Auth/session interaction, or saved-state actions.

## Domain boundaries

| Domain | Primary boundary |
| --- | --- |
| Career | `src/lib/career-data-foundation`, `src/lib/workspace`, canonical Career routes |
| Country | `src/lib/workspace`, country read models |
| Degree / Program | `src/lib/programs`, `src/lib/study-product` |
| Education / Institution | `src/lib/institutions` |
| Compare | `src/lib/career-comparison`, comparison read adapters |
| Search | static catalogues and bounded read helpers |
| Auth / user state | `src/lib/supabase-client.ts`, `src/lib/supabase-server.ts`, saved-state components |
| Data ingestion | `scripts/data-foundation`, Supabase migrations, normalized read models |

Career remains the reference: the UI consumes `CareerProfile` through the
public Career read boundary. The foundation is preferred; the reviewed legacy
country-occupation source is an explicit compatibility fallback and never a
competing public contract.

Do not add layers around static lookups. Add a boundary only for data-access
isolation, business rules, reuse, validation, security, or testability.

## Supabase client boundaries

| Category | Module | Allowed use |
| --- | --- | --- |
| Browser session client | `src/lib/supabase-client.ts` | Auth, RLS-protected saved state, and legitimate client-only session work. It never receives a service-role key. |
| Server session/read client | `src/lib/supabase-server.ts` and server-only domain read modules | Request-bound Auth/RLS work and server-rendered public read models. The module is marked `server-only`. |
| Admin/service-role client | `src/lib/supabase-admin.ts` | Private evidence/read-model queries, trusted ingestion, and privileged account operations. It is `server-only` and may not cross a Client Component boundary. |

`src/lib/supabase.ts` is a browser-compatible public-data client retained for
intentionally public Data API reads. It is not a path to raw, staging, or
privileged data. The many direct server calls in established `*.server.ts`
adapters are retained because they already form narrow domain read boundaries;
Phase 4 does not perform a cosmetic repository-wide query rewrite.

## Validation and derived logic

External input follows:

```text
External input → runtime validation → typed domain value → business logic
```

Zod is introduced only at the public route-interest form boundary in
`src/lib/validation/route-request.ts`. It validates payload shape and semantic
requirements before the route handler writes a request. Existing TypeScript
contracts remain compile-time types, not runtime validation claims.

Scoring, readiness, normalization, route resolution, and ranking remain in
non-React modules. Presentation components render their results and do not
recalculate authoritative Career facts.

## Data pipeline and provenance

```text
External source → Raw → Validation → Normalization → Derived data
  → Publication gate → Public read model → Product
```

Critical records retain source identity, URL, period/as-of date, verification
date where applicable, mapping, and derivation/formula version. Raw evidence,
normalized values, internal decision inputs, and public output remain distinct.
The public UI consumes shaped read models when one exists.

## Security model

The 2026-09-10 audit found every `public` table inspected has RLS enabled.
Public views inspected use `security_invoker=true`; the six existing
`SECURITY DEFINER` functions have no anon or authenticated execute privilege.

Supabase Security Advisor findings were classified as follows:

| Finding | Classification | Action |
| --- | --- | --- |
| RLS enabled with no policy | Intended private/internal tables and service-role-only staging/read models | Retain; do not add browser policies. |
| Leaked password protection disabled | Auth configuration warning | Record for an explicit Auth-scope decision; do not change sign-in behavior in Phase 4. |

Performance Advisor informational findings for unindexed foreign keys and
unused indexes are not changed in this architecture phase; they require
query-usage and migration-history review.

## Migration discipline and current drift

Use the workflow below for every schema change:

```text
Schema change → migration → review → apply → verify → commit
```

For risky changes: add → deploy compatibility → backfill → switch reads →
remove the old path later. Never delete legacy columns or data solely for
naming consistency.

The current checkout and deployed migration history diverge. The separate
[migration drift audit](architecture/MIGRATION_DRIFT_AUDIT_2026-09-10.md)
records the counts and resolution path. Therefore no schema migration or
privilege change was applied in Phase 4, including P0.5 raw Career isolation.
The `42501` fallback stays until the existing migration can be applied through
reconciled normal history.

## Environments

| Class | Examples | Rule |
| --- | --- | --- |
| Browser-public | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` | May be bundled; never use for privileged data. |
| Server-secret | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, Resend, Stripe, partner API keys | Server/CLI only; never import into Client Components. |
| Optional build-time | Public Supabase configuration in lazy clients | Builds may analyse modules without live credentials. Browser requests fail closed if public configuration is absent. |
| Required runtime | Credentials used by the route actually handling a database, Auth, mail, payment, or partner request | Validate at the first real request and return a clear operational error. |

`.env.example` documents the direct database URL as migration-workflow-only.
Placeholder credentials are never used for browser requests.

## CI and tests

CI retains dependency installation, high-severity production dependency audit,
typecheck, lint, unit tests, production build, and Git-history secret scanning.
It now also runs `git diff --check`.

Existing Playwright smoke coverage remains local because CI has no stable
credentials or data fixture contract for live Career reads. It is intentionally
not added as a flaky broad browser suite. The focused Phase 4 unit test covers
the new external-input validation boundary; existing Career canonical-route,
Career read-model, comparison, and raw Career gateway tests protect the core
flow.

## Intentional exceptions and deferrals

- Storybook remains deferred: no setup exists and it is not required to harden
  the architecture.
- Generated database types are deferred until migration history is reconciled.
  Domain contracts remain purpose-built at the product boundary.
- The raw Career migration and its fallback removal are blocked by documented
  migration drift, not by a decision to preserve anonymous raw-table access.
- Existing direct Supabase calls are retained where they are narrow, server-only
  adapters or real client/Auth boundaries. No calls were moved solely to satisfy
  a folder diagram.
