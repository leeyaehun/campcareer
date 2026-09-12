import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { isCareerScoreReady } from "../src/lib/workspace/career-coverage"

const activationSql = readFileSync(
  "supabase/migrations/20260912193000_ie_wave_a_public_activation.sql",
  "utf8",
)
const marketReadSource = readFileSync(
  "src/lib/workspace/career-market-read.ts",
  "utf8",
)

const READY = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "radiographer",
] as const

test("Ireland Wave A public score allowlist contains exactly the six reviewed Careers", () => {
  for (const careerId of READY) {
    assert.equal(isCareerScoreReady("IE", careerId), true, careerId)
  }

  assert.equal(isCareerScoreReady("IE", "accountant"), false)
  assert.equal(isCareerScoreReady("IE", "architect"), false)
})

test("Ireland activation migration is strict, bounded and keeps incomplete Careers off", () => {
  assert.match(activationSql, /requires 8 backfilled profiles/)
  assert.match(activationSql, /requires 6 strict public-score profiles/)
  assert.match(activationSql, /expected 6 publish-ready profiles/)
  assert.match(activationSql, /unexpectedly published % incomplete profiles/)

  for (const careerId of READY) {
    assert.match(activationSql, new RegExp(`'${careerId}'`))
  }

  assert.match(activationSql, /when 'accountant' then 'Ireland Wave A remains incomplete/)
  assert.match(activationSql, /when 'architect' then 'Ireland Wave A remains incomplete/)
})

test("reviewed foundation recommendations replace older provisional legacy scores", () => {
  assert.match(
    marketReadSource,
    /if \(!isCareerScoreReady\(foundation\.countryCode, careerId\)\) continue/,
  )
  assert.match(
    marketReadSource,
    /if \(!foundation\.strictPublicScoreEvidence\) continue/,
  )
  assert.doesNotMatch(
    marketReadSource,
    /if \(byCountry\.has\(foundation\.countryCode\)\) continue/,
  )
})
