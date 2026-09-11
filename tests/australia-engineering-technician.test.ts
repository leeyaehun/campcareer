import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808210500_australia_engineering_technician_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Engineering Technician is an OSCA 313 umbrella profile", () => {
  const career = getCanonicalCareer("engineering-technician")
  const editorial = getOccupationEditorial("engineering-technician")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:engineering-technician'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '313'/)
  assert.match(editorial.overview, /umbrella career/i)
})

test("Australia Engineering Technician keeps five current OSCA specialisations", () => {
  const expected = [
    ["313132", "Civil Engineering Technician", "312212"],
    ["313232", "Electrical Engineering Technician", "312312"],
    ["313932", "Electronic Engineering Technician", "312412"],
    ["313934", "Mechanical Engineering Technician", "312512"],
    ["313999", "Engineering Technicians nec", "312999"],
  ]

  for (const [osca, title, legacy] of expected) {
    assert.match(migration, new RegExp(`'${osca}', '${title}', 'ANZSCO', '2022', '${legacy}'`))
  }
})

test("Australia Engineering Technician sums only one-to-one six-digit employment", () => {
  assert.match(migration, /'AU:engineering-technician', '2026-05-01', 15100, null, null, null/)
  assert.match(migration, /312212 Civil Engineering Technician \(3,500\)/)
  assert.match(migration, /312312 Electrical Engineering Technician \(6,800\)/)
  assert.match(migration, /312412 Electronic Engineering Technician \(3,600\)/)
  assert.match(migration, /312512 Mechanical Engineering Technician \(1,200\)/)
  assert.match(migration, /Legacy ANZSCO 312999 Building and Engineering Technicians nec reports about 5,600 workers/)
  assert.match(migration, /excluded from the exact employment rollup/)
})

test("Australia Engineering Technician uses partial umbrella shortage credit", () => {
  const australia = getOccupationEditorial("engineering-technician")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /15, 0, 5, 5, 15, 0, 5, 10, 5, 60/)
  assert.match(migration, /four directly aligned discipline technician occupations are nationally shortage-rated/i)
  assert.match(australia.scoreCaveat, /partial rather than full credit/i)
})

test("Australia Engineering Technician keeps current CSOL assessing authorities distinct", () => {
  const australia = getOccupationEditorial("engineering-technician")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /312212 with VETASSESS as assessing authority/)
  assert.match(migration, /312312 with Trades Recognition Australia \(TRA\)/)
  assert.match(migration, /312412 with Trades Recognition Australia \(TRA\)/)
  assert.match(migration, /312512 with Trades Recognition Australia \(TRA\)/)
  assert.match(migration, /312999 with Engineers Australia and VETASSESS/)
  assert.match(australia.registration, /Migration assessment also varies by nominated ANZSCO occupation/i)
})

test("Australia Engineering Technician uses broader vacancy trend conservatively", () => {
  assert.match(migration, /1255\.00001, '2026-05-01', 6\.51/)
  assert.match(migration, /5\.90, 11\.72/)
  assert.match(migration, /vacancy intensity is not scored/i)
  assert.match(migration, /positive broader trend receives partial credit/i)
})

test("Australia Engineering Technician links two-year accredited study routes without generated IDs", () => {
  assert.match(migration, /swinburne-university-of-technology' and course_code = '108893E'/)
  assert.match(migration, /rmit-university' and course_code = '119171D'/)
  assert.match(migration, /Swinburne — Associate Degree of Engineering/)
  assert.match(migration, /RMIT — Advanced Diploma of Engineering Technology \(Civil Engineering Design\)/)
  assert.doesNotMatch(migration, /'au-program:12875'/)
  assert.doesNotMatch(migration, /'au-program:15252'/)
})
