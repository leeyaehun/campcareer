# ADR-001: Retain Supabase on PostgreSQL

- Status: Accepted
- Date: 2026-09-10

## Context

The original Phase 4 proposal considered Neon and Prisma. CampCareer already
operates a substantial Supabase/PostgreSQL schema, migration history, RLS
policies, `security_invoker` views, and server-only product read models. Phases
1 through 3 were delivered on this stack without a provider-related product
blocker.

## Decision

CampCareer remains a modular monolith on Next.js App Router and Supabase's
managed PostgreSQL. Supabase migrations are the canonical schema history.

Standard PostgreSQL is still the database underneath the managed provider. New
domain code should depend on purposeful read models and repository adapters,
not on database-provider details. Supabase client creation stays contained in
the `src/lib/supabase*.ts` infrastructure boundary where practical.

## Consequences

- Preserve working Supabase migrations, Auth, RLS, views, and service-role
  server read paths.
- Do not introduce Prisma, Neon, a parallel ORM, or a second migration history
  during Phase 4.
- Use browser clients only for Auth or user-owned RLS-protected state; use
  server-only read models for authoritative product data.
- Reconsider a provider or ORM change only when it resolves a demonstrated
  product, reliability, or operational blocker with a migration plan.

## Superseded alternative

Neon plus Prisma remains a valid architecture option for a future product with
different constraints. It is superseded for CampCareer now because migration
risk and duplicated infrastructure outweigh its benefit.
