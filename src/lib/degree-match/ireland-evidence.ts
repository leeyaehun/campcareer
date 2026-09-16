import type {
  DegreeMatchAliasMapping,
  DegreeMatchEvidence,
  DegreeMatchMissingEvidence,
  DegreeMatchRelation,
} from "./contract"

/**
 * P3.1 Ireland Degree Match evidence registry.
 *
 * Raw, source-backed relations between the six reviewed Ireland Careers and
 * their canonical Degree / study-field concepts. This is evidence only: it
 * defines no ranking, no Match Score, no Programme publication, and no UI.
 */

type IrelandGeography = DegreeMatchRelation["geography"]

const irelandPathway: IrelandGeography = {
  scope: "country_pathway",
  countryCode: "IE",
  label: "Ireland",
}

const irelandProfessional: IrelandGeography = {
  scope: "country_professional_requirement",
  countryCode: "IE",
  label: "Ireland",
}

const checkedDate = "2026-09-16"

function evidence(
  input: Omit<DegreeMatchEvidence, "checkedDate">,
): DegreeMatchEvidence {
  return { ...input, checkedDate }
}

function missing(
  input: Omit<DegreeMatchMissingEvidence, "checkedDate">,
): DegreeMatchMissingEvidence {
  return { ...input, checkedDate }
}

export const IRELAND_DEGREE_MATCH_RELATIONS: readonly DegreeMatchRelation[] = [
  {
    id: "IE:software-developer:computer-science",
    countryCode: "IE",
    careerId: "software-developer",
    degree: {
      kind: "degree",
      id: "computer-science",
      slug: "computer-science",
      canonicalName: "Computer Science",
      description: "A canonical degree field for computing foundations, software development and related technical study.",
    },
    relationshipType: "common",
    strength: "strong",
    evidenceLevel: "estimated",
    geography: irelandPathway,
    rationale: "Computer Science is a common and well-established academic pathway into software-development work in Ireland. It is not a verified statutory or legal entry requirement: employers may accept other computing study, adjacent STEM degrees, practical experience or demonstrable skill.",
    qualification: {
      state: "none_verified",
      additionalTrainingRequired: false,
      details: "No universal professional registration, accreditation or legally mandated degree was verified for software development work in Ireland.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: false,
      regulatorName: null,
      regulatorUrl: null,
      accreditationRequired: null,
      registrationRequired: false,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "dcu-dc121-computer-science",
        title: "BSc in Computer Science (DC121)",
        publisher: "Dublin City University",
        url: "https://www.dcu.ie/courses/undergraduate/school-computing/computer-science",
        kind: "official_institution",
        level: "estimated",
        directness: "proxy",
        geography: irelandPathway,
        referencePeriod: "Current provider programme page reviewed for the Ireland programme cohort",
        limitations: "A provider course page supports a plausible Computer Science pathway to software careers; it is not a census of all Irish entry routes and does not make the Degree a legal requirement.",
      }),
    ],
    missingEvidence: [
      missing({
        id: "ie-software-developer-official-degree-requirement",
        level: "unavailable",
        reason: "No verified official Irish regulator, government authority or qualification source defines a single mandatory Degree for software development; a claimed legal requirement would be fabricated.",
        geography: irelandProfessional,
      }),
    ],
    checkedDate,
  },
  {
    id: "IE:cybersecurity-analyst:cybersecurity",
    countryCode: "IE",
    careerId: "cybersecurity-analyst",
    degree: {
      kind: "degree",
      id: "cybersecurity",
      slug: "cybersecurity",
      canonicalName: "Cybersecurity",
      description: "A canonical degree field for cyber-security, information-security and digital-forensics study.",
    },
    relationshipType: "common",
    strength: "strong",
    evidenceLevel: "estimated",
    geography: irelandPathway,
    rationale: "Cybersecurity study is a common specialist pathway into security-analyst work. The Degree is not a verified legal entry requirement: security roles are also reached through general computing/IT study, experience and industry certifications, and clearance or work-right conditions may apply independently of any Degree.",
    qualification: {
      state: "none_verified",
      additionalTrainingRequired: false,
      details: "No universal registration, accreditation or legally mandatory Degree was verified for cybersecurity-analyst work in Ireland. Industry certifications are common value-adds but were not verified as universal requirements.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: false,
      regulatorName: null,
      regulatorUrl: null,
      accreditationRequired: null,
      registrationRequired: false,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "tud-tu863-digital-forensics-cyber-security",
        title: "BSc (Hons) in Computing in Digital Forensics and Cyber Security (TU863)",
        publisher: "Technological University Dublin",
        url: "https://www.tudublin.ie/study/undergraduate/courses/computing-dig-forensics-and-cyber-sec-tu863/",
        kind: "official_institution",
        level: "estimated",
        directness: "direct",
        geography: irelandPathway,
        referencePeriod: "Current provider programme page (2026) explicitly lists Cyber Security Analyst among graduate roles; checked for the Ireland programme cohort",
        limitations: "The provider page directly names the target role yet does not establish a legal Degree requirement or a complete census of Irish entry routes.",
      }),
    ],
    missingEvidence: [
      missing({
        id: "ie-cybersecurity-analyst-official-degree-requirement",
        level: "unavailable",
        reason: "No verified official Irish regulator or government source makes a specific Degree mandatory for cybersecurity-analyst work; a claimed statutory entry route would be fabricated.",
        geography: irelandProfessional,
      }),
    ],
    checkedDate,
  },
  {
    id: "IE:data-engineer:data-science",
    countryCode: "IE",
    careerId: "data-engineer",
    degree: {
      kind: "degree",
      id: "data-science",
      slug: "data-science",
      canonicalName: "Data Science",
      description: "A canonical degree field for data science, analytics, artificial intelligence and data-platform preparation.",
    },
    relationshipType: "alternative",
    strength: "contextual",
    evidenceLevel: "estimated",
    geography: irelandPathway,
    rationale: "Data Science is an adjacent/alternative academic route that can lead toward data-engineering work, but a data-science curriculum alone does not verify full data-platform, pipeline, production-infrastructure or software-engineering preparation. It is a contextual alternative rather than a degree of first choice, and no verified official source makes it a legal or statutory entry requirement for data-engineering work.",
    qualification: {
      state: "none_verified",
      additionalTrainingRequired: true,
      details: "No universal registration requirement was verified. Production data-engineering readiness commonly depends on additional technical skills or experience beyond a Data Science curriculum; that is a role expectation, not a legal rule.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: false,
      regulatorName: null,
      regulatorUrl: null,
      accreditationRequired: null,
      registrationRequired: false,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "dcu-dc123-data-science-ai",
        title: "BSc in Data Science and Artificial Intelligence (DC123)",
        publisher: "Dublin City University",
        url: "https://www.dcu.ie/courses/undergraduate/school-computing/data-science-and-artificial-intelligence",
        kind: "official_institution",
        level: "estimated",
        directness: "proxy",
        geography: irelandPathway,
        referencePeriod: "Current provider programme page reviewed for the Ireland programme cohort",
        limitations: "The provider page supports Data Science as an adjacent field but does not establish that every graduate is prepared for production data-engineering work.",
      }),
    ],
    missingEvidence: [
      missing({
        id: "ie-data-engineer-official-requirement",
        level: "unavailable",
        reason: "No verified official Irish source directly maps a specific Degree to data-engineering readiness; the relation is retained as an evidence-backed alternative, not a verified direct requirement.",
        geography: irelandProfessional,
      }),
    ],
    checkedDate,
  },
  {
    id: "IE:civil-engineer:civil-engineering",
    countryCode: "IE",
    careerId: "civil-engineer",
    degree: {
      kind: "degree",
      id: "civil-engineering",
      slug: "civil-engineering",
      canonicalName: "Civil Engineering",
      description: "A canonical degree field for civil-engineering professional preparation.",
    },
    relationshipType: "direct",
    strength: "strong",
    evidenceLevel: "verified",
    geography: irelandPathway,
    rationale: "Civil Engineering is the direct academic field for civil-engineering work in Ireland. Engineers Ireland accreditation is the recognised standard for programme quality and progression toward Chartered Engineer status; accreditation is programme-specific and must be verified per programme.",
    qualification: {
      state: "accredited_programme_required",
      additionalTrainingRequired: true,
      details: "Professional recognition in Ireland (e.g. progression toward Chartered Engineer via Engineers Ireland) follows an accredited engineering degree plus subsequent professional development and review. Accreditation is programme-specific; the degree must be verified against the regulator's accredited list.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: false,
      regulatorName: "Engineers Ireland",
      regulatorUrl: "https://www.engineersireland.ie/Students/Student-Membership/Become-a-student-member/Is-your-course-accredited",
      accreditationRequired: true,
      registrationRequired: false,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "galway-be-me-civil-engineering",
        title: "Bachelor and Master of Engineering (Civil) (GY402)",
        publisher: "University of Galway",
        url: "https://www.universityofgalway.ie/courses/undergraduate-courses/civil-engineering.html",
        kind: "official_institution",
        level: "estimated",
        directness: "direct",
        geography: irelandPathway,
        referencePeriod: "Current provider course page (2026) states the professional degrees are accredited by Engineers Ireland",
        limitations: "A provider page supports the direct academic-field relationship and cites its accreditation; it does not by itself prove every civil-engineering programme is accredited.",
      }),
      evidence({
        id: "engineers-ireland-course-accreditation",
        title: "Is your course accredited? — Engineers Ireland accreditation of engineering programmes",
        publisher: "Engineers Ireland",
        url: "https://www.engineersireland.ie/Students/Student-Membership/Become-a-student-member/Is-your-course-accredited",
        kind: "official_regulator",
        level: "verified",
        directness: "direct",
        geography: irelandProfessional,
        referencePeriod: "Current regulator guidance on accredited engineering programmes",
        limitations: "Accreditation is programme-specific and underpins professional recognition (e.g. Chartered Engineer); it is a professional-credentialing matter, not a licence to practise every civil-engineering role.",
      }),
    ],
    checkedDate,
  },
  {
    id: "IE:construction-manager:construction-management",
    countryCode: "IE",
    careerId: "construction-manager",
    degree: {
      kind: "degree",
      id: "construction-management",
      slug: "construction-management",
      canonicalName: "Construction Management",
      description: "A canonical degree field for construction-management and construction-management-and-engineering study.",
    },
    relationshipType: "direct",
    strength: "strong",
    evidenceLevel: "estimated",
    geography: irelandPathway,
    rationale: "Construction Management is a direct academic pathway into construction-management work in Ireland. Professional accreditation (e.g. CIOB and SCSI) supports the field, but senior responsibility and specific roles normally depend on additional experience and employer requirements.",
    qualification: {
      state: "none_verified",
      additionalTrainingRequired: true,
      details: "No universal statutory registration requirement was verified for the general construction-manager pathway. Professional bodies (CIOB, SCSI) accredit programmes and membership is career-relevant, but no legal degree mandate was established.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: false,
      regulatorName: null,
      regulatorUrl: null,
      accreditationRequired: null,
      registrationRequired: false,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "tud-tu833-construction-management",
        title: "BSc (Hons) in Construction Management (TU833)",
        publisher: "Technological University Dublin",
        url: "https://www.tudublin.ie/study/undergraduate/courses/construction-management-tu833/",
        kind: "official_institution",
        level: "estimated",
        directness: "direct",
        geography: irelandPathway,
        referencePeriod: "Current provider programme page (2026) lists Contract Manager and Site Manager among graduate roles and cites CIOB/SCSI accreditation",
        limitations: "The provider page supports the study-field pathway and cites professional accreditation, but does not establish a universal statutory qualification requirement for every construction-management role.",
      }),
    ],
    checkedDate,
  },
  {
    id: "IE:radiographer:diagnostic-radiography",
    countryCode: "IE",
    careerId: "radiographer",
    degree: {
      kind: "degree",
      id: "diagnostic-radiography",
      slug: "diagnostic-radiography",
      canonicalName: "Diagnostic Radiography",
      description: "A canonical degree field for diagnostic-radiography professional preparation.",
    },
    relationshipType: "direct",
    strength: "strong",
    evidenceLevel: "verified",
    geography: irelandProfessional,
    rationale: "Diagnostic Radiography is the direct academic field for diagnostic-radiographer practice in Ireland, and the Degree alone does not grant permission to practise. CORU registration and an approved qualification are required before practising as a radiographer in Ireland.",
    qualification: {
      state: "professional_registration_required",
      additionalTrainingRequired: true,
      details: "An approved (CORU-recognised) qualification and subsequent registration with the CORU Radiographers Registration Board are required before practising as a radiographer in Ireland. The academic relationship is separate from this professional eligibility.",
      professionalEligibilitySeparate: true,
    },
    regulation: {
      regulatedCareer: true,
      regulatorName: "CORU Radiographers Registration Board",
      regulatorUrl: "https://coru.ie/health-and-social-care-professionals/registration/registration-requirements/approved-qualifications/approved-qualifications/",
      accreditationRequired: true,
      registrationRequired: true,
      jurisdiction: "IE",
    },
    evidence: [
      evidence({
        id: "trinity-diagnostic-radiography-msc",
        title: "Diagnostic Radiography (M.Sc.)",
        publisher: "Trinity College Dublin",
        url: "https://www.tcd.ie/courses/postgraduate/courses/diagnostic-radiography-msc/",
        kind: "official_institution",
        level: "verified",
        directness: "direct",
        geography: irelandPathway,
        referencePeriod: "Course page updated 10 September 2026; states the programme is approved by CORU",
        limitations: "This is one CORU-approved provider programme used as evidence for the canonical field, not a public Programme publication.",
      }),
      evidence({
        id: "coru-radiographers-approved-qualifications",
        title: "Approved Qualifications — Radiographers (CORU Registration Boards)",
        publisher: "CORU",
        url: "https://coru.ie/health-and-social-care-professionals/registration/registration-requirements/approved-qualifications/approved-qualifications/",
        kind: "official_regulator",
        level: "verified",
        directness: "direct",
        geography: irelandProfessional,
        referencePeriod: "Current regulator guidance on programme approval and registration",
        limitations: "Registration eligibility depends on completion of an approved qualification and the applicable CORU registration process; the Degree is necessary but not alone sufficient to practise.",
      }),
    ],
    checkedDate,
  },
] as const

export const IRELAND_DEGREE_MATCH_ALIASES: readonly DegreeMatchAliasMapping[] = [
  {
    sourceLabel: "Computing",
    canonicalDegreeId: "computer-science",
    relationship: "related",
    mappingConfidence: "low",
    evidenceRequired: true,
    canonicalEquivalent: false,
    rationale: "Computing is a broader generic label than Computer Science; do not silently equate without reviewed curriculum evidence.",
  },
  {
    sourceLabel: "Applied Computing",
    canonicalDegreeId: "computer-science",
    relationship: "related",
    mappingConfidence: "low",
    evidenceRequired: true,
    canonicalEquivalent: false,
    rationale: "Applied Computing may overlap with Computer Science, but title similarity alone is insufficient for equivalence.",
  },
  {
    sourceLabel: "Cyber Security",
    canonicalDegreeId: "cybersecurity",
    relationship: "synonym",
    mappingConfidence: "medium",
    evidenceRequired: true,
    canonicalEquivalent: false,
    rationale: "Spelling variation ('Cyber Security' vs 'Cybersecurity') is common, but each programme's curriculum still requires review before use.",
  },
  {
    sourceLabel: "Data Analytics",
    canonicalDegreeId: "data-science",
    relationship: "related",
    mappingConfidence: "medium",
    evidenceRequired: true,
    canonicalEquivalent: false,
    rationale: "Data Analytics is related to Data Science but is not its canonical equivalent; mapping requires reviewed curriculum evidence.",
  },
  {
    sourceLabel: "Radiography",
    canonicalDegreeId: "diagnostic-radiography",
    relationship: "broader",
    mappingConfidence: "medium",
    evidenceRequired: true,
    canonicalEquivalent: false,
    rationale: "Radiography may include diagnostic and radiation-therapy scopes; it must not be silently narrowed to Diagnostic Radiography.",
  },
]

export const IRELAND_DEGREE_MATCH_CAREER_IDS = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "radiographer",
] as const

export const IRELAND_DEGREE_MATCH_DEGREE_IDS = [
  "computer-science",
  "cybersecurity",
  "data-science",
  "civil-engineering",
  "construction-management",
  "diagnostic-radiography",
] as const