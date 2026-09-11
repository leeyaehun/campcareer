import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const softwareDeveloperMigration = readFileSync(
  new URL("../supabase/migrations/20260808104602_australia_software_developer_profile.sql", import.meta.url),
  "utf8",
)

const softwareDeveloperProgramAlignment = readFileSync(
  new URL("../supabase/migrations/20260808104953_australia_software_developer_program_alignment.sql", import.meta.url),
  "utf8",
)

const dataAnalystMigration = readFileSync(
  new URL("../supabase/migrations/20260808112800_australia_data_analyst_profile.sql", import.meta.url),
  "utf8",
)

const dataEngineerMigration = readFileSync(
  new URL("../supabase/migrations/20260808113455_australia_data_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Software Developer maps exactly to current OSCA Software Engineer", () => {
  const career = getCanonicalCareer("software-developer")
  const editorial = getOccupationEditorial("software-developer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(softwareDeveloperMigration, /'AU:software-developer'/)
  assert.match(softwareDeveloperMigration, /'273333', 'Software Engineer'/)
  assert.match(softwareDeveloperMigration, /'OSCA', '2024 v1\.0', '2733'/)
  assert.match(
    softwareDeveloperMigration,
    /'273333', 'Software Engineer', null, null, null, null, true/,
  )
})

test("Australia Software Developer does not fabricate exact current-OSCA labour metrics", () => {
  assert.match(
    softwareDeveloperMigration,
    /'AU:software-developer', '2026-05-01', null, null, null, null/,
  )
  assert.match(softwareDeveloperMigration, /'broader_anzsco_2613_context'/)
  assert.match(softwareDeveloperMigration, /'employment_total', 203200/)
  assert.match(softwareDeveloperMigration, /'median_weekly_earnings_aud', 2537/)
  assert.match(softwareDeveloperMigration, /'median_hourly_earnings_aud', 67/)
  assert.match(softwareDeveloperMigration, /3392, '2026-05-01', -9\.86/)
  assert.match(softwareDeveloperMigration, /15\.69, 26\.67/)
  assert.match(softwareDeveloperMigration, /0, 0, 5, 0, 13, 0, 5, 10, 4, 37/)
})

test("Australia Software Developer keeps 2025 no-shortage and CSOL evidence separate", () => {
  const editorial = getOccupationEditorial("software-developer")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(softwareDeveloperMigration, /S, S, NS/)
  assert.match(softwareDeveloperMigration, /national shortage component is therefore zero/)
  assert.match(softwareDeveloperMigration, /Core Skills Occupation List/)
  assert.match(softwareDeveloperMigration, /Australian Computer Society \(ACS\)/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.jobMarketNote, /No Shortage in 2025/)
})

test("Australia Software Developer stores broader 2613 vacancies without inventing state shortages", () => {
  const expected = new Map([
    ["ACT", "312"],
    ["NSW", "1196.66667"],
    ["NT", "15.33333"],
    ["QLD", "507"],
    ["SA", "195.33333"],
    ["TAS", "24"],
    ["VIC", "910.33333"],
    ["WA", "231.33333"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      softwareDeveloperMigration,
      new RegExp(`'AU:software-developer', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Software Developer ends with representative ACS-accredited study routes", () => {
  assert.match(softwareDeveloperProgramAlignment, /program_ref = 'au-program:7132'/)
  assert.match(softwareDeveloperProgramAlignment, /'au-program:3384', 'direct'/)
  assert.match(softwareDeveloperMigration, /'au-program:5838', 'direct'/)
  assert.match(softwareDeveloperMigration, /'au-program:4972', 'graduate_entry'/)
  assert.match(softwareDeveloperMigration, /ACS — Accredited courses/)
  assert.match(softwareDeveloperMigration, /ACS — Migration skills assessment/)
})

test("Australia Data Analyst maps current OSCA 223231 to legacy ANZSCO 224114", () => {
  const career = getCanonicalCareer("data-analyst")
  const editorial = getOccupationEditorial("data-analyst")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(dataAnalystMigration, /'AU:data-analyst'/)
  assert.match(dataAnalystMigration, /'OSCA', '2024 v1\.0', '2232'/)
  assert.match(
    dataAnalystMigration,
    /'223231', 'Data Analyst', 'ANZSCO', '2022', '224114', null, true/,
  )
})

test("Australia Data Analyst keeps broader 2241 labour metrics out of exact fields", () => {
  assert.match(
    dataAnalystMigration,
    /'AU:data-analyst', '2026-05-01', null, null, null, null/,
  )
  assert.match(dataAnalystMigration, /'broader_anzsco_2241_context'/)
  assert.match(dataAnalystMigration, /'employment_total', 12600/)
  assert.match(dataAnalystMigration, /'median_weekly_earnings_aud', 2072/)
  assert.match(dataAnalystMigration, /'median_hourly_earnings_aud', 56/)
  assert.match(dataAnalystMigration, /148\.66667, '2026-05-01', -22\.03/)
  assert.match(dataAnalystMigration, /16\.08, 27\.51/)
  assert.match(dataAnalystMigration, /0, 0, 5, 0, 13, 0, 5, 10, 4, 37/)
})

test("Australia Data Analyst records 2025 no-shortage while retaining CSOL and ACS assessment", () => {
  const editorial = getOccupationEditorial("data-analyst")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(dataAnalystMigration, /No Shortage nationally and in all eight states and territories/)
  assert.match(dataAnalystMigration, /shortage score component is zero/)
  assert.match(dataAnalystMigration, /Core Skills Occupation List/)
  assert.match(dataAnalystMigration, /Australian Computer Society/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.jobMarketNote, /No Shortage nationally and in all states and territories/)
})

test("Australia Data Analyst stores broader 2241 regional vacancies without numeric shortage claims", () => {
  const expected = new Map([
    ["ACT", "2.33333"],
    ["NSW", "66.33333"],
    ["NT", "0"],
    ["QLD", "16.66667"],
    ["SA", "5.33333"],
    ["TAS", "0.33333"],
    ["VIC", "50"],
    ["WA", "7.66667"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      dataAnalystMigration,
      new RegExp(`'AU:data-analyst', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Data Analyst links representative analytics study routes", () => {
  assert.match(dataAnalystMigration, /'au-program:5332', 'direct'/)
  assert.match(dataAnalystMigration, /'au-program:93', 'direct'/)
  assert.match(dataAnalystMigration, /'au-program:6748', 'graduate_entry'/)
  assert.match(dataAnalystMigration, /ACS — Data Science occupations and ANZSCO codes/)
  assert.match(dataAnalystMigration, /Australian Public Service — Data Stream/)
})

test("Australia Data Engineer maps exactly to current OSCA 223233 without inventing a dedicated legacy code", () => {
  const career = getCanonicalCareer("data-engineer")
  const editorial = getOccupationEditorial("data-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(dataEngineerMigration, /'AU:data-engineer'/)
  assert.match(dataEngineerMigration, /'OSCA', '2024 v1\.0', '2232'/)
  assert.match(
    dataEngineerMigration,
    /'223233', 'Data Engineer', 'ANZSCO', '2022', '261313', null, true/,
  )
  assert.match(dataEngineerMigration, /did not have a dedicated ANZSCO 2022 six-digit occupation/)
})

test("Australia Data Engineer keeps broader 2613 labour metrics out of exact fields", () => {
  assert.match(
    dataEngineerMigration,
    /'AU:data-engineer', '2026-05-01', null, null, null, null/,
  )
  assert.match(dataEngineerMigration, /'broader_anzsco_2613_context'/)
  assert.match(dataEngineerMigration, /'employment_total', 203200/)
  assert.match(dataEngineerMigration, /'median_weekly_earnings_aud', 2537/)
  assert.match(dataEngineerMigration, /3392, '2026-05-01', -9\.86/)
  assert.match(dataEngineerMigration, /15\.69, 26\.67/)
  assert.match(dataEngineerMigration, /0, 0, 5, 0, 10, 0, 5, 10, 4, 34/)
})

test("Australia Data Engineer leaves shortage unscored and qualifies visa evidence", () => {
  const editorial = getOccupationEditorial("data-engineer")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(dataEngineerMigration, /No exact current OSCA 223233 national or state shortage rating has been verified/)
  assert.match(dataEngineerMigration, /Shortage rating remains null and the shortage component is zero/)
  assert.match(dataEngineerMigration, /current legal CSOL instrument lists ANZSCO 261313 rather than Data Engineer by title/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.scoreCaveat, /reviewed OSCA-to-ANZSCO CSOL correspondence/)
})

test("Australia Data Engineer stores broader 2613 regional vacancies without state shortage claims", () => {
  const expected = new Map([
    ["ACT", "312"],
    ["NSW", "1196.66667"],
    ["NT", "15.33333"],
    ["QLD", "507"],
    ["SA", "195.33333"],
    ["TAS", "24"],
    ["VIC", "910.33333"],
    ["WA", "231.33333"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      dataEngineerMigration,
      new RegExp(`'AU:data-engineer', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Data Engineer links direct bachelor and graduate-entry data engineering routes", () => {
  assert.match(dataEngineerMigration, /'au-program:18429', 'direct'/)
  assert.match(dataEngineerMigration, /'au-program:8247', 'graduate_entry'/)
  assert.match(dataEngineerMigration, /TAFE NSW — Bachelor of Information Technology \(Data Engineering\)/)
  assert.match(dataEngineerMigration, /ACS — Migration skills assessment/)
})

test("Technology editorial composition preserves existing occupation editorial", () => {
  assert.ok(getOccupationEditorial("registered-nurse"))
  assert.ok(getOccupationEditorial("construction-manager"))
  assert.ok(getOccupationEditorial("software-developer"))
  assert.ok(getOccupationEditorial("data-analyst"))
  assert.ok(getOccupationEditorial("data-engineer"))
})
