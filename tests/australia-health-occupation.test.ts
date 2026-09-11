import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { AU_VOCATIONAL_PROGRAM_SHORTLIST } from "../src/data/au-vocational-program-shortlist"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()


const readMigration = (file: string) =>
  normalizeMigrationSql(readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"))

const migrations = {
  midwife: readMigration("20260807183555_australia_midwife_profile.sql"),
  careWorker: readMigration("20260807185954_australia_care_worker_profile.sql"),
  physiotherapist: readMigration("20260807205909_australia_physiotherapist_profile.sql"),
  medicalLaboratoryTechnician: readMigration(
    "20260808091600_australia_medical_laboratory_technician_profile.sql"
  ),
  radiographer: readMigration("20260808091726_australia_radiographer_profile.sql"),
  pharmacist: readMigration("20260808091934_australia_pharmacist_profile.sql"),
  occupationalTherapist: readMigration(
    "20260808092152_australia_occupational_therapist_profile.sql"
  ),
}

const HEALTH_IDS = [
  "registered-nurse",
  "midwife",
  "care-worker",
  "physiotherapist",
  "medical-laboratory-technician",
  "radiographer",
  "pharmacist",
  "occupational-therapist",
] as const

const REGIONS = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const

function expectEightRegions(migration: string, profileKey: string) {
  for (const region of REGIONS) {
    assert.match(
      migration,
      new RegExp(`'${profileKey}', '${region}', '2026-05-01'`)
    )
  }
}

test("Australia Health catalogue exposes all eight canonical occupations with editorial coverage", () => {
  for (const id of HEALTH_IDS) {
    const career = getCanonicalCareer(id)
    const editorial = getOccupationEditorial(id)
    const australia = editorial?.countries.AU

    assert.ok(career, `Missing canonical career ${id}`)
    assert.equal(career.categoryId, "health")
    assert.ok(editorial, `Missing editorial for ${id}`)
    assert.ok(australia, `Missing Australia editorial for ${id}`)
    assert.ok(editorial.tasks.length >= 6, `Expected at least six tasks for ${id}`)
  }
})

test("Australia Midwife keeps exact OSCA mapping, verified market values and regulated pathway", () => {
  const migration = migrations.midwife
  const australia = getOccupationEditorial("midwife")?.countries.AU

  assert.match(migration, /'AU:midwife'/)
  assert.match(migration, /'265131', 'Midwife'/)
  assert.match(migration, /'254111'/)
  assert.doesNotMatch(migration, /251911/)
  assert.match(migration, /19400, 2114, 56, 109928/)
  assert.match(migration, /197\.33333/)
  assert.match(migration, /9\.23/)
  assert.match(migration, /13\.91, 26\.74/)
  assert.match(migration, /Core Skills Occupation List includes legacy ANZSCO 254111 Midwife/)
  assert.ok(australia)
  assert.match(australia.entryPathway, /Bachelor of Midwifery/i)
  assert.match(australia.entryPathway, /postgraduate midwifery/i)
  assert.match(australia.registration, /Nursing and Midwifery Board of Australia/)
  expectEightRegions(migration, "AU:midwife")
})

test("Australia Care Worker preserves the narrow rollup, screening rules and vocational links", () => {
  const migration = migrations.careWorker
  const australia = getOccupationEditorial("care-worker")?.countries.AU
  const certificate = AU_VOCATIONAL_PROGRAM_SHORTLIST.find(
    (item) => item.id === "au-vet:training-gov:CHC33021"
  )

  assert.match(migration, /'421231', 'Community Aged Care Support Worker'/)
  assert.match(migration, /'422231', 'Disability Support Worker'/)
  assert.match(migration, /Residential Aged Care Worker is excluded/)
  assert.doesNotMatch(migration, /'421331', 'Residential Aged Care Worker'/)
  assert.match(migration, /376300, 1761, 46, 91572/)
  assert.match(migration, /3520\.33333/)
  assert.match(migration, /-0\.19/)
  assert.match(migration, /10\.75, 18\.12/)
  assert.match(migration, /Aged Care Industry Labour Agreement/)
  assert.match(migration, /disability-sector employers cannot use that agreement/)
  assert.match(migration, /'au-vet:training-gov:CHC33021', 'direct'/)
  assert.ok(certificate)
  assert.equal(certificate.courseCode, "CHC33021")
  assert.ok(australia)
  assert.match(australia.registration, /no single national Care Worker occupational licence/i)
  assert.match(australia.registration, /NDIS Worker Screening Clearance/i)
  expectEightRegions(migration, "AU:care-worker")
})

test("Australia Physiotherapist keeps exact mapping, full market inputs and approved study routes", () => {
  const migration = migrations.physiotherapist
  const australia = getOccupationEditorial("physiotherapist")?.countries.AU

  assert.match(migration, /'262431', 'Physiotherapist'/)
  assert.match(migration, /'252511'/)
  assert.match(migration, /46600, 1888, 50, 98176/)
  assert.match(migration, /1205\.66667/)
  assert.match(migration, /4\.42/)
  assert.match(migration, /19\.69, 35\.10/)
  assert.match(migration, /20, 15, 5, 6, 13, 5, 10, 10, 2, 86/)
  assert.match(migration, /'au-program:804', 'direct'/)
  assert.match(migration, /'au-program:19250', 'direct'/)
  assert.match(migration, /'au-program:4744', 'graduate_entry'/)
  assert.ok(australia)
  assert.match(australia.entryPathway, /Australian Physiotherapy Council/)
  assert.match(australia.registration, /Physiotherapy Board of Australia/)
  expectEightRegions(migration, "AU:physiotherapist")
})

test("Australia Medical Laboratory Technician does not promote broader-group data to exact occupation facts", () => {
  const migration = migrations.medicalLaboratoryTechnician
  const australia = getOccupationEditorial("medical-laboratory-technician")?.countries.AU

  assert.match(migration, /'311233', 'Medical Laboratory Technician'/)
  assert.match(migration, /'311213'/)
  assert.match(migration, /7600, null, null, null/)
  assert.match(migration, /468\.66667/)
  assert.match(migration, /7\.97, 17\.42/)
  assert.match(migration, /0, 0, 5, 0, 10, 0, 3, 0, 4, 22/)
  assert.match(migration, /earnings and annualised salary NULL/)
  assert.match(migration, /no shortage claim/i)
  assert.match(migration, /no visa-eligibility claim/i)
  assert.match(migration, /'au-program:18365', 'related'/)
  assert.match(migration, /'au-program:18366', 'direct'/)
  assert.ok(australia)
  assert.match(australia.entryPathway, /MSL40122/)
  assert.match(australia.entryPathway, /MSL50122/)
  assert.match(australia.registration, /no statutory national occupational registration/i)
  expectEightRegions(migration, "AU:medical-laboratory-technician")
})

test("Australia Radiographer keeps exact registration and visa signals while labelling broader JSA series", () => {
  const migration = migrations.radiographer
  const australia = getOccupationEditorial("radiographer")?.countries.AU

  assert.match(migration, /'263133', 'Radiographer'/)
  assert.match(migration, /'251211'/)
  assert.match(migration, /10200, null, null, null/)
  assert.match(migration, /737\.66667/)
  assert.match(migration, /18\.11, 33\.13/)
  assert.match(migration, /20, 0, 5, 5, 13, 0, 6, 10, 2, 61/)
  assert.match(migration, /Core Skills Occupation List/)
  assert.match(migration, /'au-program:19563', 'direct'/)
  assert.match(migration, /'au-program:865', 'direct'/)
  assert.match(migration, /'au-program:19533', 'graduate_entry'/)
  assert.ok(australia)
  assert.match(australia.registration, /Medical Radiation Practice Board of Australia/)
  expectEightRegions(migration, "AU:radiographer")
})

test("Australia Pharmacist rollup excludes Industrial Pharmacist and preserves the mixed shortage signal", () => {
  const migration = migrations.pharmacist
  const australia = getOccupationEditorial("pharmacist")?.countries.AU

  assert.match(migration, /'263431', 'Community Pharmacist'/)
  assert.match(migration, /'263432', 'Hospital Pharmacist'/)
  assert.match(migration, /251513/)
  assert.match(migration, /251511/)
  assert.match(migration, /Industrial Pharmacist/)
  assert.match(migration, /not part of the current OSCA 2634 roll-up/)
  assert.match(migration, /27100, null, null, null/)
  assert.match(migration, /15, 0, 5, 0, 12, 0, 5, 10, 1, 48/)
  assert.match(migration, /Community Pharmacist is in shortage in all eight jurisdictions/)
  assert.match(migration, /Hospital Pharmacist is in shortage in ACT/)
  assert.match(migration, /'au-program:886', 'direct'/)
  assert.match(migration, /'au-program:1483', 'direct'/)
  assert.match(migration, /'au-program:19666', 'graduate_entry'/)
  assert.ok(australia)
  assert.match(australia.registration, /Pharmacy Board of Australia/)
  assert.match(australia.entryPathway, /provisional registration/)
  assert.match(australia.entryPathway, /intern training program/)
  expectEightRegions(migration, "AU:pharmacist")
})

test("Australia Occupational Therapist keeps exact JSA scope, all-state shortage and study pathways", () => {
  const migration = migrations.occupationalTherapist
  const australia = getOccupationEditorial("occupational-therapist")?.countries.AU

  assert.match(migration, /'262331', 'Occupational Therapist'/)
  assert.match(migration, /'252411'/)
  assert.match(migration, /35600, 1913, 50, 99476/)
  assert.match(migration, /1436\.66667/)
  assert.match(migration, /-10\.19/)
  assert.match(migration, /18\.75, 33\.10/)
  assert.match(migration, /20, 15, 5, 0, 13, 5, 10, 10, 2, 80/)
  assert.match(migration, /Core Skills Occupation List/)
  assert.match(migration, /Occupational Therapy Council/)
  assert.match(migration, /'au-program:888', 'direct'/)
  assert.match(migration, /'au-program:1478', 'direct'/)
  assert.match(migration, /'au-program:855', 'graduate_entry'/)
  assert.ok(australia)
  assert.match(australia.registration, /Occupational Therapy Board of Australia/)
  expectEightRegions(migration, "AU:occupational-therapist")
})
