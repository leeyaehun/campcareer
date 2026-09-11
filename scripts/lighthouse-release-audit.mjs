import { spawnSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:3102"
const lcpBudgetMs = Number(process.env.LIGHTHOUSE_LCP_BUDGET_MS ?? "2500")
const ttfbBudgetMs = Number(process.env.LIGHTHOUSE_TTFB_BUDGET_MS ?? "800")
const clsBudget = Number(process.env.LIGHTHOUSE_CLS_BUDGET ?? "0.1")
const outputDir = path.resolve(process.env.LIGHTHOUSE_OUTPUT_DIR ?? "lighthouse-results")

const routes = [
  ["home", "/"],
  ["careers", "/careers"],
  ["career-au-registered-nurse", "/career/australia/registered-nurse"],
  ["country-au", "/countries/au"],
  ["program-au-bachelor-of-arts", "/programs/au/1-bachelor-of-arts"],
  ["institution-au-acu", "/institutions/au/australian-catholic-university"],
  ["sources", "/sources"],
]

await mkdir(outputDir, { recursive: true })

const npx = process.platform === "win32" ? "npx.cmd" : "npx"
const results = []

for (const [name, route] of routes) {
  const reportPath = path.join(outputDir, `${name}.json`)
  const target = new URL(route, baseUrl).href

  console.log(`\n[Lighthouse] ${route}`)

  const warmupStartedAt = performance.now()
  const warmupResponse = await fetch(target, {
    headers: { "user-agent": "CampCareer Phase 5 cache warmup" },
  })
  const warmupTtfbMs = Math.round(performance.now() - warmupStartedAt)
  await warmupResponse.arrayBuffer()
  const warmupTotalMs = Math.round(performance.now() - warmupStartedAt)
  if (!warmupResponse.ok) {
    throw new Error(`Warm-up request failed for ${route}: ${warmupResponse.status}`)
  }

  const run = spawnSync(
    npx,
    [
      "--no-install",
      "lighthouse",
      target,
      "--quiet",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${reportPath}`,
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
    ],
    { stdio: "inherit" },
  )

  if (run.status !== 0) {
    throw new Error(`Lighthouse failed for ${route} with exit code ${run.status ?? "unknown"}`)
  }

  const report = JSON.parse(await readFile(reportPath, "utf8"))
  const categoryScore = (id) => Math.round((report.categories[id]?.score ?? 0) * 100)
  const lcpMs = Math.round(report.audits["largest-contentful-paint"]?.numericValue ?? Number.POSITIVE_INFINITY)
  const cls = Number(report.audits["cumulative-layout-shift"]?.numericValue ?? Number.POSITIVE_INFINITY)
  const tbtMs = Math.round(report.audits["total-blocking-time"]?.numericValue ?? Number.POSITIVE_INFINITY)
  const pass =
    lcpMs <= lcpBudgetMs &&
    cls <= clsBudget &&
    warmupTtfbMs <= ttfbBudgetMs

  const row = {
    route,
    performance: categoryScore("performance"),
    accessibility: categoryScore("accessibility"),
    bestPractices: categoryScore("best-practices"),
    seo: categoryScore("seo"),
    lcpMs,
    cls,
    tbtMs,
    warmupTtfbMs,
    warmupTotalMs,
    lcpBudgetMs,
    ttfbBudgetMs,
    clsBudget,
    pass,
  }
  results.push(row)

  console.log(
    `[Lighthouse] ${route}: perf=${row.performance} a11y=${row.accessibility} best=${row.bestPractices} seo=${row.seo} LCP=${(lcpMs / 1000).toFixed(2)}s CLS=${cls.toFixed(3)} TBT=${tbtMs}ms warmTTFB=${warmupTtfbMs}ms warmTotal=${warmupTotalMs}ms budget=${pass ? "PASS" : "FAIL"}`,
  )
}

const markdown = [
  "# Phase 5 Lighthouse release audit",
  "",
  `LCP budget: **≤ ${(lcpBudgetMs / 1000).toFixed(2)} s** · CLS: **≤ ${clsBudget.toFixed(2)}** · warm-up TTFB: **≤ ${ttfbBudgetMs} ms**`,
  "",
  "| Route | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Warm-up TTFB | Budget |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ...results.map((row) =>
    `| \`${row.route}\` | ${row.performance} | ${row.accessibility} | ${row.bestPractices} | ${row.seo} | ${(row.lcpMs / 1000).toFixed(2)} s | ${row.cls.toFixed(3)} | ${row.tbtMs} ms | ${row.warmupTtfbMs} ms | ${row.pass ? "PASS" : "FAIL"} |`
  ),
  "",
].join("\n")

await writeFile(path.join(outputDir, "summary.json"), JSON.stringify({ lcpBudgetMs, ttfbBudgetMs, clsBudget, results }, null, 2) + "\n")
await writeFile(path.join(outputDir, "summary.md"), markdown)

console.log("\n" + markdown)

if (results.some((row) => !row.pass)) {
  process.exitCode = 1
}
