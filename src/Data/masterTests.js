const masterTests = [
  // =========================
  // HEMATOLOGY
  // =========================

  {
    name: "FBC",

    department:
      "Hematology",

    category: "Panel",

    reportType:
      "Hematology",

    price: 5000,

    parameters: [
      "WBC",
      "RBC",
      "Hemoglobin",
      "PCV",
      "Platelets",
      "MCV",
      "MCH",
      "MCHC",
      "Neutrophils",
      "Lymphocytes",
      "Monocytes",
      "Eosinophils",
      "Basophils",
    ],
  },

  {
    name: "ESR",

    department:
      "Hematology",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 2000,
  },

  {
    name: "D-Dimer",

    department:
      "Hematology",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 15000,
  },

  // =========================
  // CHEMISTRY
  // =========================

  {
    name: "LFT",

    department:
      "Chemistry",

    category: "Panel",

    reportType:
      "Chemistry",

    price: 12000,

    parameters: [
      "AST",
      "ALT",
      "ALP",
      "Total Bilirubin",
      "Albumin",
      "Total Protein",
    ],
  },

  {
    name: "EUCR",

    department:
      "Chemistry",

    category: "Panel",

    reportType:
      "Chemistry",

    price: 15000,

    parameters: [
      "Sodium",
      "Potassium",
      "Chloride",
      "Bicarbonate",
      "Urea",
      "Creatinine",
    ],
  },

  {
    name: "FLP",

    department:
      "Chemistry",

    category: "Panel",

    reportType:
      "Chemistry",

    price: 15000,

    parameters: [
      "Total Cholesterol",
      "Triglyceride",
      "HDL",
      "LDL",
    ],
  },

  {
    name: "FBS",

    department:
      "Chemistry",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 2500,
  },

  {
    name: "RBS",

    department:
      "Chemistry",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 2500,
  },

  {
    name: "HbA1c",

    department:
      "Chemistry",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 12000,
  },

  {
    name: "Uric Acid",

    department:
      "Chemistry",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 5000,
  },

  {
    name: "Troponin I",

    department:
      "Chemistry",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 18000,
  },

  // =========================
  // SEROLOGY
  // =========================

  {
    name: "HBsAg",

    department:
      "Serology",

    category:
      "Single",

    reportType:
      "Qualitative",

    price: 3500,
  },

  {
    name: "HCV",

    department:
      "Serology",

    category:
      "Single",

    reportType:
      "Qualitative",

    price: 3500,
  },

  {
    name: "HIV I & II",

    department:
      "Serology",

    category:
      "Single",

    reportType:
      "Qualitative",

    price: 3500,
  },

  {
    name: "VDRL",

    department:
      "Serology",

    category:
      "Single",

    reportType:
      "Qualitative",

    price: 3000,
  },

  {
    name: "β-hCG",

    department:
      "Serology",

    category:
      "Single",

    reportType:
      "Quantitative",

    price: 12000,
  },

  // =========================
  // MICROBIOLOGY
  // =========================

  {
    name:
      "Urine M/C/S",

    department:
      "Microbiology",

    category: "Panel",

    reportType:
      "Microbiology",

    price: 8000,
  },

  {
    name:
      "Stool M/C/S",

    department:
      "Microbiology",

    category: "Panel",

    reportType:
      "Microbiology",

    price: 8000,
  },

  {
    name:
      "Blood Culture",

    department:
      "Microbiology",

    category: "Panel",

    reportType:
      "Microbiology",

    price: 15000,
  },

  // =========================
  // CARDIOLOGY
  // =========================

  {
    name: "ECG",

    department:
      "Cardiology",

    category: "Panel",

    reportType:
      "ECG",

    price: 15000,
  },

  // =========================
  // RADIOLOGY
  // =========================

  {
    name:
      "Pelvic Scan",

    department:
      "Radiology",

    category: "Panel",

    reportType:
      "Ultrasound",

    price: 15000,
  },

  {
    name:
      "Abdominopelvic Scan",

    department:
      "Radiology",

    category: "Panel",

    reportType:
      "Ultrasound",

    price: 18000,
  },

  {
    name:
      "Breast Scan",

    department:
      "Radiology",

    category: "Panel",

    reportType:
      "Ultrasound",

    price: 15000,
  },

  {
    name:
      "Scrotal Scan",

    department:
      "Radiology",

    category: "Panel",

    reportType:
      "Ultrasound",

    price: 15000,
  },
];

export default masterTests;