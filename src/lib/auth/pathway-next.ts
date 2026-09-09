import { getSafeNextPath } from "./safe-next"

/** Keeps a validated internal destination while removing the one-time save trigger. */
export function getPathwayBackPath(requestedNext: string | null) {
  const next = getSafeNextPath(requestedNext)
  const url = new URL(next, "https://campcareer.local")

  url.searchParams.delete("save")
  return `${url.pathname}${url.search}${url.hash}`
}
