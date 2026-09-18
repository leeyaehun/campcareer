import type { VisaDetail } from "./visa-detail"

type CostItemInput = { item: string; amount: number; optional?: boolean }

type DetailInput = {
  status: string
  processingTime: string
  duration: string
  requirements: string[]
  totalEstimatedTime?: string
  minSalary?: string
  currency?: string
  fee?: CostItemInput
  fees?: CostItemInput[]
  topCities?: string[]
  costNote: string
}

function makeDetail(input: DetailInput): VisaDetail {
  return {
    status: input.status,
    processingTime: input.processingTime,
    duration: input.duration,
    minSalary: input.minSalary,
    successRate: "Not published",
    requirements: input.requirements,
    process: [
      { step: "Confirm eligibility", duration: "Before applying", note: "Use the linked issuing-authority page and the route-specific document list." },
      { step: "Prepare and submit", duration: "Application stage", note: "Apply through the official online service, recognised sponsor, embassy or consulate, as applicable." },
      { step: "Authority assessment", duration: input.processingTime, note: "Published service standards are not approval guarantees and can vary by location and case complexity." },
      { step: "Complete post-approval steps", duration: "After approval", note: "Finish entry, registration or residence-permit formalities required by the destination country." },
    ],
    totalEstimatedTime: input.totalEstimatedTime ?? input.processingTime,
    costBreakdown: {
      currency: input.currency ?? "EUR",
      items: [...(input.fees ?? []), ...(input.fee ? [input.fee] : [])],
    },
    costNote: `${input.costNote} Fees and eligibility can change. Confirm the current amount and conditions on the linked official source before applying.`,
    topCities: input.topCities ?? [],
  }
}

export const EUROPE_VISA_DETAILS: Record<string, VisaDetail> = {
  "UK:Student visa": makeDetail({
    status: "Study",
    processingTime: "Usually 3 weeks outside the UK; 8 weeks inside the UK",
    duration: "Usually up to 5 years at degree level or 2 years below degree level",
    currency: "GBP",
    fee: { item: "Student visa application fee", amount: 558 },
    costNote: "The immigration health surcharge is additional and depends on visa length.",
    requirements: [
      "Unconditional offer from a licensed student sponsor and a Confirmation of Acceptance for Studies (CAS)",
      "Evidence of course fees and living costs unless an official exemption applies",
      "English-language evidence at the level required for the course and sponsor",
      "Valid passport and any required tuberculosis test or ATAS certificate",
    ],
  }),
  "UK:Skilled Worker": makeDetail({
    status: "Work",
    processingTime: "Usually 3 weeks outside the UK; 8 weeks inside the UK",
    duration: "Up to 5 years per grant, subject to sponsorship",
    minSalary: "Role-specific official threshold applies",
    currency: "GBP",
    costNote: "The application fee varies by visa length and circumstances; the immigration health surcharge may also apply.",
    requirements: [
      "Job offer from a Home Office-approved sponsor",
      "Certificate of Sponsorship for an eligible occupation",
      "Salary meeting the applicable general and occupation-specific threshold",
      "Required English-language evidence and maintenance funds unless certified by the sponsor",
    ],
  }),
  "UK:Graduate visa": makeDetail({
    status: "Post-study work",
    processingTime: "Usually within 8 weeks",
    duration: "2 years through 31 December 2026; 18 months from 1 January 2027; 3 years for doctoral graduates",
    currency: "GBP",
    costNote: "The route has an application fee and immigration health surcharge.",
    requirements: [
      "Current permission under the Student or Tier 4 route",
      "Successful completion of an eligible UK course",
      "Education provider has notified the Home Office of course completion",
      "Application from inside the UK before current permission expires",
    ],
  }),
  "UK:Health and Care Worker": makeDetail({
    status: "Work",
    processingTime: "Usually 3 weeks outside the UK; 8 weeks inside the UK",
    duration: "Up to 5 years per grant, subject to sponsorship",
    minSalary: "Role-specific official threshold applies",
    currency: "GBP",
    costNote: "Reduced fees apply compared with the main Skilled Worker route; eligible applicants do not pay the immigration health surcharge.",
    requirements: [
      "Eligible health or adult social care job",
      "Certificate of Sponsorship from an approved UK employer",
      "Salary meeting the applicable route and occupation threshold",
      "English-language evidence and professional registration where required",
    ],
  }),
  "UK:Youth Mobility Scheme": makeDetail({
    status: "Working holiday",
    processingTime: "Usually 3 weeks outside the UK",
    duration: "Usually 2 years; some nationalities can qualify for 3 years",
    currency: "GBP",
    costNote: "The route has an application fee and immigration health surcharge.",
    requirements: [
      "Nationality and age within current Youth Mobility Scheme rules",
      "Required personal savings held for the specified period",
      "No dependent children living with or financially dependent on the applicant",
      "Any ballot, sponsorship or country-specific condition applying to the nationality",
    ],
  }),

  "IE:Student visa": makeDetail({
    status: "Study",
    processingTime: "Usually around 8 weeks once a complete application is received",
    duration: "Linked to the approved course and registered Stamp 2 immigration permission",
    fees: [
      { item: "Long-stay 'D' study visa application (single entry)", amount: 60 },
      { item: "Multiple-entry visa upgrade", amount: 40, optional: true },
      { item: "First-time immigration registration (IRP card)", amount: 300 },
    ],
    topCities: ["Dublin", "Cork", "Galway", "Limerick"],
    costNote: "Students on Stamp 2 permission can usually work up to 20 hours a week during term and 40 hours a week during holidays. Tuition, living costs and private medical insurance are separate from the fees above.",
    requirements: [
      "Acceptance on an eligible full-time course from a recognised Irish education provider",
      "Evidence of tuition payment and sufficient finances for the stay",
      "Private medical insurance covering the stay",
      "Academic, English-language and immigration documents required by Immigration Service Delivery",
    ],
  }),
  "IE:Stamp 1G": makeDetail({
    status: "Post-study work",
    processingTime: "Usually a few weeks for a completed online registration",
    duration: "12 months for Level 8 graduates; up to 24 months for Level 9 or above, subject to programme limits",
    fees: [{ item: "Stamp 1G registration and IRP card", amount: 300 }],
    topCities: ["Dublin", "Cork", "Galway", "Limerick"],
    costNote: "Stamp 1G allows full-time work without a separate employment permit, but it does not lead directly to long-term residence on its own and the overall Third Level Graduate Programme time limit applies.",
    requirements: [
      "Eligible Irish qualification under the Third Level Graduate Programme",
      "Current or recent eligible Stamp 2 student permission",
      "Final award results and application within the permitted period after notification",
      "Compliance with overall student-pathway time limits",
    ],
  }),
  "IE:Working Holiday / Youth Mobility": makeDetail({
    status: "Working holiday",
    processingTime: "Varies by participating embassy or consulate",
    duration: "Usually up to 12 months, subject to the bilateral agreement",
    topCities: ["Dublin", "Cork", "Galway"],
    costNote: "Programme fees, financial-evidence rules and quotas are set by each bilateral agreement, so no single amount is shown.",
    requirements: [
      "Citizenship of a country with an Irish working-holiday agreement",
      "Age within the bilateral programme limit",
      "Evidence of sufficient funds, insurance and onward or return travel",
      "Application through the responsible Irish embassy or consulate",
    ],
  }),
  "IE:Critical Skills Employment Permit": makeDetail({
    status: "Skilled work",
    processingTime: "Use the current employment-permit processing dates published by DETE",
    duration: "Normally issued for 2 years before transition to eligible residence permission",
    minSalary: "Occupation-specific remuneration thresholds apply and are updated regularly",
    fees: [{ item: "Critical Skills Employment Permit application fee", amount: 1000 }],
    topCities: ["Dublin", "Cork", "Galway", "Limerick"],
    costNote: "The permit fee is €1,000 and 90% of it may be refunded if the application is refused. Eligible family members can apply to join under certain conditions.",
    requirements: [
      "Qualifying two-year job offer from a bona fide Irish employer",
      "Eligible occupation and remuneration level under current Critical Skills rules",
      "Relevant qualifications, skills or experience",
      "Employment permit application by the employer or employee",
    ],
  }),

  "DE:Student visa": makeDetail({
    status: "Study",
    processingTime: "Varies by German mission and local foreigners authority",
    duration: "Course or preparatory-study period, subject to residence-permit renewal",
    fee: { item: "Standard national visa fee", amount: 75 },
    costNote: "Residence-permit and document costs may be additional; exemptions can apply.",
    requirements: [
      "Admission to recognised higher education or a qualifying preparatory course",
      "Proof of secure financing through an accepted method",
      "Valid health insurance",
      "Academic and language evidence required for the programme and visa",
    ],
  }),
  "DE:EU Blue Card": makeDetail({
    status: "Skilled work",
    processingTime: "Varies by German mission and local foreigners authority",
    duration: "Up to 4 years, or contract term plus 3 months when shorter",
    minSalary: "Annual statutory threshold applies and is updated regularly",
    costNote: "Visa and residence-title fees depend on the application route and permit duration.",
    requirements: [
      "Recognised or comparable higher-education qualification or another qualifying route",
      "Specific job offer or employment contract in Germany",
      "Salary meeting the current general or shortage-occupation threshold",
      "Employment appropriate to the applicant's qualification",
    ],
  }),
  "DE:Skilled Worker visa": makeDetail({
    status: "Skilled work",
    processingTime: "Varies by German mission and local foreigners authority",
    duration: "Usually up to 4 years, or contract term plus 3 months when shorter",
    minSalary: "Employment conditions must be comparable and legally compliant",
    fee: { item: "Standard national visa fee", amount: 75 },
    costNote: "Recognition and residence-title fees may be additional.",
    requirements: [
      "Recognised vocational or academic qualification, or completed recognition where required",
      "Concrete qualified job offer in Germany",
      "Federal Employment Agency approval where required",
      "Any occupation-specific professional licence or language requirement",
    ],
  }),
  "DE:Working Holiday": makeDetail({
    status: "Working holiday",
    processingTime: "Varies by the responsible German mission",
    duration: "Usually up to 12 months under the relevant bilateral programme",
    fee: { item: "Standard national visa fee", amount: 75 },
    costNote: "Some bilateral arrangements or nationalities may have different fees or procedures.",
    requirements: [
      "Citizenship and age within a German working-holiday or youth-mobility agreement",
      "Evidence of sufficient funds and valid health insurance",
      "Valid passport and country-specific programme documents",
      "Return or onward travel evidence where required",
    ],
  }),
  "DE:Job Seeker Visa": makeDetail({
    status: "Job search",
    processingTime: "Varies by German mission and local foreigners authority",
    duration: "Opportunity Card generally up to 12 months; other job-search permissions depend on eligibility",
    fee: { item: "Standard national visa fee", amount: 75 },
    costNote: "Check the current Opportunity Card rules instead of relying on older job-seeker guidance.",
    requirements: [
      "Eligibility through a recognised qualification or the Opportunity Card points route",
      "Proof of sufficient funds for the stay",
      "Required language evidence where the points route applies",
      "Health insurance and a valid passport",
    ],
  }),
  "DE:Family Reunion Visa": makeDetail({
    status: "Family",
    processingTime: "Varies by German mission and local foreigners authority",
    duration: "Linked to the sponsor's status and the residence title granted",
    costNote: "Fees and exemptions depend on the sponsor's nationality and the applicant's circumstances.",
    requirements: [
      "Qualifying family relationship with the person in Germany",
      "Evidence of the sponsor's lawful residence or German citizenship",
      "Accommodation, financial and health-insurance evidence where required",
      "Basic German-language evidence where no exemption applies",
    ],
  }),

  "NL:Student visa": makeDetail({
    status: "Study",
    processingTime: "IND statutory and target decision periods apply",
    duration: "Linked to programme duration and study progress",
    costNote: "IND fees are updated periodically and are normally handled through the sponsoring institution.",
    requirements: [
      "Admission to an IND-recognised educational institution",
      "Institution acts as recognised sponsor and submits the application",
      "Evidence of sufficient funds and any required tuition payment",
      "Ongoing study progress meeting IND requirements",
    ],
  }),
  "NL:Highly Skilled Migrant": makeDetail({
    status: "Skilled work",
    processingTime: "IND decision period applies; recognised sponsors may use facilitated processing",
    duration: "Up to 5 years, normally linked to employment",
    minSalary: "Monthly IND salary criterion applies and is updated annually",
    costNote: "The recognised sponsor normally pays or arranges the IND application fee.",
    requirements: [
      "Employment contract with an IND-recognised sponsor",
      "Salary meeting the current age and category-specific IND criterion",
      "Market-conform employment conditions",
      "Passport and residence documents required by IND",
    ],
  }),
  "NL:Orientation Year": makeDetail({
    status: "Post-study work",
    processingTime: "IND decision period applies",
    duration: "1 year and not extendable",
    costNote: "Use the current IND fee schedule for the orientation-year residence permit.",
    requirements: [
      "Eligible Dutch qualification, research appointment or qualifying foreign degree",
      "Application within three years of the qualifying graduation or research date",
      "Valid passport and any required antecedents declaration",
      "Specific institution or ranking conditions for foreign qualifications where applicable",
    ],
  }),
  "NL:Working Holiday": makeDetail({
    status: "Working holiday",
    processingTime: "Varies by nationality and application channel",
    duration: "Up to 1 year",
    costNote: "Fees and procedures differ between Working Holiday Programme partner countries.",
    requirements: [
      "Nationality and age within a Dutch working-holiday agreement",
      "Primary purpose of cultural exchange rather than regular employment",
      "Sufficient funds, health insurance and return-travel arrangements",
      "Any quota, pre-registration or embassy step applying to the nationality",
    ],
  }),

  "BE:Student visa": makeDetail({
    status: "Study",
    processingTime: "Varies by diplomatic post and Immigration Office review",
    duration: "Normally linked to the academic year and renewable while study conditions are met",
    costNote: "Visa fees, administrative contributions and exemptions depend on the application.",
    requirements: [
      "Admission or enrolment at a recognised Belgian higher-education institution",
      "Evidence of sufficient means of subsistence",
      "Health insurance and required medical or police documents",
      "Proof of payment of any applicable administrative contribution",
    ],
  }),
  "BE:Single Permit": makeDetail({
    status: "Work",
    processingTime: "Regional and federal authorities each complete their part of the procedure",
    duration: "Linked to the employment authorisation and residence decision",
    costNote: "Administrative contributions and regional requirements vary by case.",
    requirements: [
      "Belgian employer submits the combined work-and-residence application",
      "Role meets the competent region's employment conditions",
      "Federal residence conditions and public-order checks are satisfied",
      "Required employment contract, qualifications and identity documents",
    ],
  }),
  "BE:Working Holiday": makeDetail({
    status: "Working holiday",
    processingTime: "Varies by the responsible Belgian diplomatic post",
    duration: "Up to 12 months under the bilateral programme",
    costNote: "Programme fees and required documents vary by nationality.",
    requirements: [
      "Citizenship and age within a Belgian working-holiday agreement",
      "Sufficient funds, health insurance and return-travel arrangements",
      "No accompanying dependants unless bilateral rules allow them",
      "Application through the diplomatic post specified for the programme",
    ],
  }),

  "FR:Student visa": makeDetail({
    status: "Study",
    processingTime: "Varies by France-Visas centre, consulate and Campus France procedure",
    duration: "Long-stay student visa generally 4 to 12 months before renewal or residence steps",
    costNote: "Student visa fees can differ for Études en France countries and exemptions.",
    requirements: [
      "Admission or pre-enrolment at a French higher-education institution",
      "Completion of the Études en France procedure where it applies",
      "Evidence of sufficient funds, accommodation and insurance where required",
      "Academic, language and identity documents requested by France-Visas",
    ],
  }),
  "FR:Talent Passport": makeDetail({
    status: "Skilled work",
    processingTime: "Varies by France-Visas centre, consulate and prefecture",
    duration: "Up to 4 years depending on the qualifying category and contract",
    minSalary: "Category-specific remuneration threshold may apply",
    costNote: "Visa, tax and residence-card charges depend on the category and place of application.",
    requirements: [
      "Eligibility under a current Talent Passport or equivalent talent category",
      "Qualifying employment contract, research agreement, project or professional status",
      "Required remuneration or qualification evidence for the category",
      "Long-stay visa or residence application through the official channel",
    ],
  }),
  "FR:Working Holiday": makeDetail({
    status: "Working holiday",
    processingTime: "Varies by the responsible French consulate",
    duration: "Usually up to 1 year under the bilateral agreement",
    costNote: "Fees and exemptions are governed by the applicable bilateral agreement.",
    requirements: [
      "Citizenship and age within a French working-holiday agreement",
      "Sufficient funds and comprehensive insurance",
      "Return ticket or resources to purchase one",
      "Application through the consulate specified for nationality or residence",
    ],
  }),
}
