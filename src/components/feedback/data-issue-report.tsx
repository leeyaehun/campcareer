"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

const DATA_ISSUE_CATEGORIES = [
  ["data_outdated", "Outdated"],
  ["data_incorrect", "Incorrect"],
  ["data_wrong_source", "Wrong source"],
  ["data_missing", "Missing data"],
  ["other", "Other"],
] as const

type DataIssueCategory = (typeof DATA_ISSUE_CATEGORIES)[number][0]

export function DataIssueReport({ entityType = "data_policy" }: { entityType?: "source" | "methodology" | "data_policy" | "other" }) {
  const pathname = usePathname()
  const [category, setCategory] = useState<DataIssueCategory | "">("")
  const [detail, setDetail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!category || state === "sending") return
    setState("sending")
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "issue",
          category,
          description: detail.trim() || "No additional details provided.",
          context: { pagePath: pathname, entityType },
        }),
      })
      if (!response.ok) throw new Error("Data issue was not accepted")
      setState("success")
    } catch {
      setState("error")
    }
  }

  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <summary className="cursor-pointer text-sm font-semibold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Report a data issue</summary>
      {state === "success" ? <p className="mt-3 text-sm text-slate-600" role="status">Thank you. The report is queued for review.</p> : (
        <form className="mt-4 space-y-3" onSubmit={submit} noValidate>
          <label className="block text-sm font-medium text-slate-800" htmlFor="data-issue-category">Issue type</label>
          <select id="data-issue-category" required value={category} onChange={(event) => setCategory(event.target.value as DataIssueCategory | "")} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25">
            <option value="">Choose an issue</option>
            {DATA_ISSUE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="block text-sm font-medium text-slate-800" htmlFor="data-issue-detail">Optional detail</label>
          <textarea id="data-issue-detail" value={detail} maxLength={2000} rows={3} onChange={(event) => setDetail(event.target.value)} placeholder="Do not include personal, account or payment information." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
          {state === "error" ? <p className="text-sm text-rose-700" role="alert">The report could not be sent. Please try again.</p> : null}
          <button type="submit" disabled={!category || state === "sending"} className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300">{state === "sending" ? "Sending…" : "Send report"}</button>
        </form>
      )}
    </details>
  )
}
