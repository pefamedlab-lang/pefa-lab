import SectionTitle from "./SectionTitle";

/* ==========================================================
   TEST NAME MAP
========================================================== */

const TEST_NAMES = {

  /* ==========================
     CHEMISTRY
  ========================== */

  LFT: "Liver Function Test",

  KFT: "Kidney Function Test",

  RFT: "Renal Function Test",

  FBS: "Fasting Blood Sugar",

  RBS: "Random Blood Sugar",

  OGTT: "Oral Glucose Tolerance Test",

  HBA1C: "Glycated Haemoglobin (HbA1c)",

  LIPID: "Lipid Profile",

  "LIPID PROFILE": "Lipid Profile",

  ELECTROLYTES: "Serum Electrolytes",

  UREA: "Serum Urea",

  CREATININE: "Serum Creatinine",

  URIC: "Serum Uric Acid",

  CALCIUM: "Serum Calcium",

  MAGNESIUM: "Serum Magnesium",

  PHOSPHORUS: "Serum Phosphorus",

  PSA: "Prostate Specific Antigen",

  TSH: "Thyroid Stimulating Hormone",

  T3: "Triiodothyronine",

  T4: "Thyroxine",

  LH: "Luteinizing Hormone",

  FSH: "Follicle Stimulating Hormone",

  AMH: "Anti-Müllerian Hormone",

  PROLACTIN: "Prolactin",

  PROGESTERONE: "Progesterone",

  TESTOSTERONE: "Testosterone",

  E2: "Estradiol",

  DDIMER: "D-Dimer",

  "D-DIMER": "D-Dimer",

  /* ==========================
     HAEMATOLOGY
  ========================== */

  CBC: "Complete Blood Count",

  FBC: "Full Blood Count",

  PCV: "Packed Cell Volume",

  ESR: "Erythrocyte Sedimentation Rate",

  PT: "Prothrombin Time",

  APTT: "Activated Partial Thromboplastin Time",

  PTTK: "Partial Thromboplastin Time with Kaolin",

  INR: "International Normalized Ratio",

  GENOTYPE: "Haemoglobin Genotype",

  "BLOOD GROUP": "ABO Blood Group",

  RHESUS: "Rhesus Blood Group",

  /* ==========================
     MICROBIOLOGY
  ========================== */

  MCS: "Microscopy, Culture & Sensitivity",

  URINALYSIS: "Urinalysis",

  STOOL: "Stool Analysis",

  SPUTUM: "Sputum Microscopy",

  /* ==========================
     SEROLOGY
  ========================== */

  HIV: "Human Immunodeficiency Virus",

  HBSAG: "Hepatitis B Surface Antigen",

  HCV: "Hepatitis C Virus",

  VDRL: "Venereal Disease Research Laboratory Test",

  WIDAL: "Widal Test",

  MP: "Malaria Parasite",

};

/* ==========================================================
   RESOLVE NAME
========================================================== */

function getTestName(report = {}) {

  const value = (

    report.test_name ||

    report.test_type ||

    ""

  )

    .trim()

    .toUpperCase();

  if (!value) {

    return "LABORATORY REPORT";

  }

  if (TEST_NAMES[value]) {

    return TEST_NAMES[value];

  }

  return report.test_name || report.test_type || "Laboratory Report";

}

/* ==========================================================
   COMPONENT
========================================================== */

export default function TestTitle({

  report = {},

}) {

  return (

    <div className="test-title">

      {getTestName(report)}

    </div>

  );

}