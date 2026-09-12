# Daily Check

Target duration: 10–20 minutes.
Owner:
Date:

This is an incident and signal triage, not a daily SEO review.

| Check | Evidence source | Result / action |
| --- | --- | --- |
| Current production deployment and domain health | Vercel deployment state; representative public HTTP response | |
| Critical runtime errors | Vercel logs | |
| Failed import, source-run or publication workflow | Source-run records and CI | |
| P0/P1 feedback or data issue | Feedback/data-issue queue | |
| Unexpected analytics or consent breakage | GA4 DebugView / Vercel Analytics when available | |
| Vercel resource or billing alert | Vercel dashboard | |

Output exactly one of:

- **No action** — record any unavailable provider data without guessing.
- **Immediate incident** — assign severity, owner, affected route/data,
  timestamp and verification. Follow
  [OBSERVABILITY.md](OBSERVABILITY.md) and
  [release-and-recovery.md](release-and-recovery.md).

Do not request indexing, publish data, remove deployments, alter scoring or
start a feature from this check alone.
