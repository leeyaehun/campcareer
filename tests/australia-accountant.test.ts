import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808211745_australia_accountant_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Accountant maps canonical Accountant to current OSCA 211131", () => {
  const career = getCanonicalCareer("accountant")
  const editorial = getOccupationEditorial("accountant")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Exact current occupation: OSCA 211131 Accountant \(General\)/)
  assert.match(migration, /'AU:accountant'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2111'/)
  assert.match(migration, /'211131', 'Accountant \(General\)', 'ANZSCO', '2022', '221111'/)
})

test("Australia Accountant does not treat legacy 221111 as exact current employment", () => {
  assert.match(migration, /Legacy ANZSCO 221111 is not one-to-one/)
  assert.match(migration, /OSCA 211133 Forensic Accountant also maps to 221111/)
  assert.match(migration, /'AU:accountant', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'employment_total', 139100/)
  assert.match(migration, /contextual rather than exact current 211131 values/)
})

test("Australia Accountant records 2025 national No Shortage", () => {
  const australia = getOccupationEditorial("accountant")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /No Shortage nationally and in all eight states and territories/)
  assert.match(australia.jobMarketNote, /No Shortage nationally and in every state and territory/i)
})

test("Australia Accountant preserves skilled occupation list and accounting assessors", () => {
  const australia = getOccupationEditorial("accountant")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /current skilled occupation list includes 221111/)
  assert.match(migration, /CPA Australia, Chartered Accountants Australia and New Zealand \(CA ANZ\), and the Institute of Public Accountants \(IPA\)/)
  assert.match(australia.registration, /CPA Australia, CA ANZ and IPA/i)
})

test("Australia Accountant scores broader labour data conservatively", () => {
  assert.match(migration, /3522\.33333, '2026-05-01', -4\.46/)
  assert.match(migration, /8\.44, 16\.63, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(migration, /vacancy intensity is not scored/i)
  assert.match(migration, /negative broader trend receives no vacancy-trend credit/i)
})

test("Australia Accountant stores broader state vacancies without false shortage flags", () => {
  const expected = new Map([
    ["ACT", "61.66667"],
    ["NSW", "1179.66667"],
    ["NT", "15.33333"],
    ["QLD", "846.66667"],
    ["SA", "175.33333"],
    ["TAS", "29.66667"],
    ["VIC", "843.33333"],
    ["WA", "370.66667"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:accountant', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Accountant links accredited Macquarie accounting pathways without generated IDs", () => {
  assert.match(migration, /macquarie-university'\n  and course_code = '099149E'/)
  assert.match(migration, /macquarie-university'\n  and course_code = '099183C'/)
  assert.match(migration, /Macquarie — Bachelor of Professional Accounting/)
  assert.match(migration, /Macquarie — Master of Professional Accounting/)
  assert.doesNotMatch(migration, /'au-program:237'/)
  assert.doesNotMatch(migration, /'au-program:264'/)
})
