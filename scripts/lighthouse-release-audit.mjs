import { spawnSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:3102"
const lcpBudgetMs = Number(process.env.LIGHTHOUSE_LCP_BUDGET_MS ?? "2500")
const ttfbBudgetMs = Number(process.env.LIGHTHOUSE_TTFB_BUDGET_MS ?? "800")
const clsBudget = Number(process.env.LIGHTHOUSE_CLS_BUDGET ?? "0.1")
const sampleCount = Number(process.env.LIGHTHOUSE_SAMPLE_COUNT ?? "3")
const outputDir = path.resolve(process.env.LIGHTHOUSE_OUTPUT_DIR ?? "lighthouse-results")

if (!Number.isInteger(sampleCount) || sampleCount < 3 || sampleCount % 2 === 0) {
  throw new Error("LIGHTHOUSE_SAMPLE_COUNT must be an odd integer of at least 3")
}

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

function median(values) {
  const ordered = [...values].sort((a, b) => a - b)
  return ordered[Math.floor(ordered.length / 2)]
}

function roundedMedian(values) {
  return Math.round(median(values))
}

for (const [name, route] of routes) {
  const target = new URL(route, baseUrl).href
  const samples = []

  console.log(`\n[Lighthouse] ${route} · ${sampleCount} samples`)

  for (let sample = 1; sample <= sampleCount; sample += 1) {
    const reportPath = path.join(outputDir, `${name}-sample-${sample}.json`)

    const warmupStartedAt = performance.now()
    const warmupResponse = await fetch(target, {
      headers: { "user-agent": `CampCareer Phase 5 cache warmup ${sample}/${sampleCount}` },
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
      throw new Error(
        `Lighthouse failed for ${route} sample ${sample} with exit code ${run.status ?? "unknown"}`,
      )
    }

    const report = JSON.parse(await readFile(reportPath, "utf8"))
    const categoryScore = (id) => Math.round((report.categories[id]?.score ?? 0) * 100)
    const sampleResult = {
      sample,
      performance: categoryScore("performance"),
      accessibility: categoryScore("accessibility"),
      bestPractices: categoryScore("best-practices"),
      seo: categoryScore("seo"),
      lcpMs: Math.round(
        report.audits["largest-contentful-paint"]?.numericValue ?? Number.POSITIVE_INFINITY,
      ),
      cls: Number(
        report.audits["cumulative-layout-shift"]?.numericValue ?? Number.POSITIVE_INFINITY,
      ),
      tbtMs: Math.round(
        report.audits["total-blocking-time"]?.numericValue ?? Number.POSITIVE_INFINITY,
      ),
      warmupTtfbMs,
      warmupTotalMs,
    }
    samples.push(sampleResult)

    console.log(
      `[Lighthouse] ${route} sample ${sample}/${sampleCount}: LCP=${(sampleResult.lcpMs / 1000).toFixed(2)}s CLS=${sampleResult.cls.toFixed(3)} TBT=${sampleResult.tbtMs}ms warmTTFB=${warmupTtfbMs}ms`,
    )
  }

  const row = {
    route,
    sampleCount,
    performance: roundedMedian(samples.map((sample) => sample.performance)),
    accessibility: roundedMedian(samples.map((sample) => sample.accessibility)),
    bestPractices: roundedMedian(samples.map((sample) => sample.bestPractices)),
    seo: roundedMedian(samples.map((sample) => sample.seo)),
    lcpMs: roundedMedian(samples.map((sample) => sample.lcpMs)),
    cls: median(samples.map((sample) => sample.cls)),
    tbtMs: roundedMedian(samples.map((sample) => sample.tbtMs)),
    warmupTtfbMs: roundedMedian(samples.map((sample) => sample.warmupTtfbMs)),
    warmupTotalMs: roundedMedian(samples.map((sample) => sample.warmupTotalMs)),
    lcpBudgetMs,
    ttfbBudgetMs,
    clsBudget,
    samples,
  }
  row.pass =
    row.lcpMs <= lcpBudgetMs &&
    row.cls <= clsBudget &&
    row.warmupTtfbMs <= ttfbBudgetMs

  results.push(row)

  console.log(
    `[Lighthouse] ${route} median: perf=${row.performance} a11y=${row.accessibility} best=${row.bestPractices} seo=${row.seo} LCP=${(row.lcpMs / 1000).toFixed(2)}s CLS=${row.cls.toFixed(3)} TBT=${row.tbtMs}ms warmTTFB=${row.warmupTtfbMs}ms budget=${row.pass ? "PASS" : "FAIL"}`,
  )
}

const markdown = [
  "# Phase 5 Lighthouse release audit",
  "",
  `Method: **median of ${sampleCount} independent Lighthouse runs per route** after a cache warm-up before each run.`,
  "",
  `LCP budget: **≤ ${(lcpBudgetMs / 1000).toFixed(2)} s** · CLS: **≤ ${clsBudget.toFixed(2)}** · median warm-up TTFB: **≤ ${ttfbBudgetMs} ms**`,
  "",
  "| Route | Performance | Accessibility | Best Practices | SEO | Median LCP | Median CLS | Median TBT | Median warm-up TTFB | Budget |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ...results.map((row) =>
    `| \`${row.route}\` | ${row.performance} | ${row.accessibility} | ${row.bestPractices} | ${row.seo} | ${(row.lcpMs / 1000).toFixed(2)} s | ${row.cls.toFixed(3)} | ${row.tbtMs} ms | ${row.warmupTtfbMs} ms | ${row.pass ? "PASS" : "FAIL"} |`
  ),
  "",
  "### LCP samples",
  "",
  ...results.map((row) =>
    `- \`${row.route}\`: ${row.samples.map((sample) => `${(sample.lcpMs / 1000).toFixed(2)} s`).join(" · ")} → median **${(row.lcpMs / 1000).toFixed(2)} s**`
  ),
  "",
].join("\n")

await writeFile(
  path.join(outputDir, "summary.json"),
  JSON.stringify({ lcpBudgetMs, ttfbBudgetMs, clsBudget, sampleCount, results }, null, 2) + "\n",
)
await writeFile(path.join(outputDir, "summary.md"), markdown)

console.log("\n" + markdown)

if (results.some((row) => !row.pass)) {
  process.exitCode = 1
}
