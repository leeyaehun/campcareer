export const IRELAND_VERIFIED_INSTITUTIONS = [
  { slug: "dublin-city-university", name: "Dublin City University", kind: "university", city: "Dublin" },
  { slug: "mary-immaculate-college", name: "Mary Immaculate College", kind: "college", city: "Limerick" },
  { slug: "rcsi-university-of-medicine-and-health-sciences", name: "RCSI University of Medicine and Health Sciences", kind: "university", city: "Dublin" },
  { slug: "technological-university-dublin", name: "Technological University Dublin", kind: "university", city: "Dublin" },
  { slug: "trinity-college-dublin", name: "Trinity College Dublin", kind: "university", city: "Dublin" },
  { slug: "university-college-cork", name: "University College Cork", kind: "university", city: "Cork" },
  { slug: "university-college-dublin", name: "University College Dublin", kind: "university", city: "Dublin" },
  { slug: "university-of-galway", name: "University of Galway", kind: "university", city: "Galway" },
  { slug: "university-of-limerick", name: "University of Limerick", kind: "university", city: "Limerick" },
] as const

export type IrelandVerifiedInstitutionSlug = (typeof IRELAND_VERIFIED_INSTITUTIONS)[number]["slug"]

export const IRELAND_VERIFIED_INSTITUTION_SLUGS = IRELAND_VERIFIED_INSTITUTIONS.map(
  (institution) => institution.slug,
)

export function getIrelandVerifiedInstitution(slug: string) {
  return IRELAND_VERIFIED_INSTITUTIONS.find((institution) => institution.slug === slug) ?? null
}
