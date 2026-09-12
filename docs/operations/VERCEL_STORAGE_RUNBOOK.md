# Vercel Storage Runbook

Last reviewed: 12 September 2026

## P0 baseline and verified inventory

The connected Vercel account verifies 82.4 GB / 10 GB Deployment Storage and
15.22 GB / 10 GB Functions Storage. It contains at least 420 deployments.
Among the latest 400 deployments, 379 are Preview and 21 Production; 159 are
READY, 114 CANCELED and 127 ERROR.

The largest repeated refs in that sample are:

| Ref | Deployments in latest-400 sample |
| --- | ---: |
| `cleanup/phase1-reset` | 106 |
| `prelaunch/release-blockers` | 105 |
| `feature/fifo-report-commerce` | 60 |
| `agent/campus-career-product-constitution` | 42 |

This is verified retention evidence and makes Vercel resource remediation the
first operational **P0 / NOW** task. It is not an instruction to bulk-delete a
ref or a status class. The connector does not expose byte-per-deployment or
function-bundle sizes, so this runbook does not estimate or fabricate them.

No deployment is deleted by this runbook. A GitHub deployment is not a Vercel
deployment ID and must not be passed to a Vercel delete command.

## Evidence already available

- The Phase 8 production commit `e3e085de` has a successful GitHub Production
  deployment record created on 12 September 2026.
- The Vercel inventory above is the source of truth for the current deployment
  count, environments and states. The earlier GitHub deployment sample is only
  a supporting churn signal, not a Vercel retention count.
- A local production build has approximately 268 MB under `.next/server`
  before Vercel packages it. Its largest route families are `maps` (~89 MB),
  `blog` (~21 MB), `map` (~14 MB), `ko` (~12 MB) and `institutions`
  (~11 MB). Source maps and compiled data chunks are prominent.
- Local `.next/cache` and `.next/dev` are developer-machine caches, not
  Vercel storage evidence.
- `.vercelignore` already excludes several raw map/PDF datasets and scripts.
  Do not add trace exclusions without showing that a packaged function does
  not use the file at runtime.

## Exact candidate procedure

Use the Vercel dashboard or authenticated CLI/API to obtain the current
production alias, exact deployment IDs, protection state, source ref and
creation time. Record size and function-size data only if that interface
actually provides them. Do not copy secrets into this repository.

For each deployment, place an exact Vercel deployment ID in this table before
any deletion:

| Classification | Exact deployment ID | Environment / state | Ref and age | Size | Reason / approval |
| --- | --- | --- | ---: | ---: | --- |
| KEEP | Current production deployment for `e3e085de` | Production / READY | | | Required live alias. |
| KEEP | Most recent known-good rollback-safe production deployment(s) | Production / READY | | | Preserve per owner rollback policy. |
| KEEP | Explicitly protected deployment | Any | | | Record protection owner. |
| DELETE CANDIDATE | _None approved yet._ | | | | Counts and refs alone do not establish a safe ID. |
| NEEDS REVIEW | All remaining deployments | Preview, failed or old production | | | Confirm age, use, alias and protection. |

The current exact delete-candidate list is deliberately empty. The verified
counts establish P0 urgency, but the available connector does not expose the
individual capacity data needed to rank deployment or function contributors.
That is an evidence gap for deletion, not permission to bulk-remove Preview
deployments.

## Decision rules

Keep:

1. The deployment serving the current production alias.
2. The owner-approved rollback-safe production set.
3. Explicitly protected releases, active incident investigations and legally
   required evidence.

A deployment can become a delete candidate only after it is unaliased, not in
the protected set, not an active incident/review artifact, older than the
owner's agreed retention period, and its deletion effect is understood.
Failed, canceled and stale Preview deployments are candidates for review, not
automatic deletion.

## Function-storage diagnosis

For the largest current production functions, record function name, size,
trace contents and whether data is shared or duplicated. Inspect in order:

1. large map and route families;
2. compiled source-data chunks;
3. source maps and dependency duplication;
4. file-tracing inclusions;
5. static assets that should be CDN-served rather than traced into functions.

Fix one demonstrated cause at a time and compare a fresh deployment's actual
function storage. Preserve every runtime file required by the function.

## Future deployment reduction

Review deployment retention and Preview churn first. A docs-only ignored build
is only eligible after a repository rule proves the changed paths cannot affect
runtime, generated product inputs, metadata or deployment configuration. This
review does not add an ignored-build command because that proof and its
production validation have not yet been recorded.
