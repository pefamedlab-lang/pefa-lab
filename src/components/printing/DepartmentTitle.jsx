import SectionTitle from "./SectionTitle";

/* ==========================================================
   DEPARTMENT MAPPING
========================================================== */

const DEPARTMENT_MAP = {
  /* ===============================
     CHEMICAL PATHOLOGY
  =============================== */

  chemistry: "Chemical Pathology Report",
  "clinical chemistry": "Chemical Pathology Report",

  lft: "Chemical Pathology Report",
  kft: "Chemical Pathology Report",

  lipid: "Chemical Pathology Report",
  "lipid profile": "Chemical Pathology Report",

  fbs: "Chemical Pathology Report",
  rbs: "Chemical Pathology Report",
  hba1c: "Chemical Pathology Report",

  electrolytes: "Chemical Pathology Report",
  urea: "Chemical Pathology Report",
  creatinine: "Chemical Pathology Report",
  glucose: "Chemical Pathology Report",

  psa: "Chemical Pathology Report",

  hormone: "Chemical Pathology Report",
  tsh: "Chemical Pathology Report",
  t3: "Chemical Pathology Report",
  t4: "Chemical Pathology Report",

  prolactin: "Chemical Pathology Report",
  progesterone: "Chemical Pathology Report",
  testosterone: "Chemical Pathology Report",
  estradiol: "Chemical Pathology Report",
  lh: "Chemical Pathology Report",
  fsh: "Chemical Pathology Report",
  amh: "Chemical Pathology Report",

  "d-dimer": "Chemical Pathology Report",

  /* ===============================
     HAEMATOLOGY
  =============================== */

  haematology: "Haematology Report",
  hematology: "Haematology Report",

  cbc: "Haematology Report",
  fbc: "Haematology Report",

  pcv: "Haematology Report",
  esr: "Haematology Report",

  bloodfilm: "Haematology Report",
  "blood film": "Haematology Report",

  pt: "Haematology Report",
  aptt: "Haematology Report",
  pttk: "Haematology Report",
  inr: "Haematology Report",

  genotype: "Haematology Report",

  bloodgroup: "Haematology Report",
  "blood group": "Haematology Report",

  rhesus: "Haematology Report",

  /* ===============================
     MICROBIOLOGY
  =============================== */

  microbiology: "Microbiology Report",

  mcs: "Microbiology Report",

  urineculture: "Microbiology Report",
  "urine culture": "Microbiology Report",

  stoolculture: "Microbiology Report",

  sputum: "Microbiology Report",

  sensitivity: "Microbiology Report",

  /* ===============================
     SEROLOGY
  =============================== */

  serology: "Serology Report",

  hbsag: "Serology Report",
  hcv: "Serology Report",
  hiv: "Serology Report",
  vdrl: "Serology Report",
  widal: "Serology Report",

  malaria: "Serology Report",
  mp: "Serology Report",

  /* ===============================
     URINALYSIS
  =============================== */

  urinalysis: "Urinalysis Report",
  urine: "Urinalysis Report",

  /* ===============================
     STOOL ANALYSIS
  =============================== */

  stool: "Stool Analysis Report",
};

/* ==========================================================
   RESOLVE DEPARTMENT TITLE
========================================================== */

function resolveDepartment(report = {}) {
  const value = (
    report.department ||
    report.test_type ||
    report.test_name ||
    ""
  )
    .toLowerCase()
    .trim();

  if (!value) {
    return "Laboratory Report";
  }

  if (DEPARTMENT_MAP[value]) {
    return DEPARTMENT_MAP[value];
  }

  for (const key in DEPARTMENT_MAP) {
    if (value.includes(key)) {
      return DEPARTMENT_MAP[key];
    }
  }

  return "Laboratory Report";
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function DepartmentTitle({ report = {}, title }) {
  return (
    <SectionTitle
      title={title || resolveDepartment(report)}
      color="primary"
      uppercase
    />
  );
}