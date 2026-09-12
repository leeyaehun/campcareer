"use client"

import dynamic from "next/dynamic"

const OccupationExplorerView = dynamic(
  () => import("../occupation/occupation-explorer").then((module) => module.OccupationExplorer),
  {
    ssr: false,
    loading: () => (
      <div
        className="mt-6 min-h-[420px] rounded-cc-large border border-campcareer-border bg-campcareer-surface shadow-cc-surface"
        aria-hidden="true"
      />
    ),
  },
)

/**
 * The default /careers discovery landing is server-rendered and must not
 * preload the interactive search client graph. Result views mount this only
 * after the query parameters demand them.
 */
export function LazyOccupationExplorer(props: {
  initialQuery: string
  initialOccupation: string
  initialCountry: string
  initialCategory: string
  initialBrowseAll: boolean
}) {
  return <OccupationExplorerView basePath="/careers" {...props} />
}