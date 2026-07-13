const investigations = {
  haematology: [
    {
      code: "FBC",
      name: "Full Blood Count",
    },
    {
      code: "PCV",
      name: "Packed Cell Volume (PCV)",
    },
    {
      code: "WBC",
      name: "White Blood Cell Count",
    },
    {
      code: "PLT",
      name: "Platelet Count",
    },
    {
      code: "RET",
      name: "Reticulocyte Count",
    },
    {
      code: "ESR",
      name: "Erythrocyte Sedimentation Rate (ESR)",
    },
    {
      code: "HBG",
      name: "Haemoglobin Genotype",
    },
    {
      code: "BF",
      name: "Blood Film",
    },
    {
      code: "PT",
      name: "Prothrombin Time (PT)",
    },
    {
      code: "APTT",
      name: "Activated Partial Thromboplastin Time (APTT)",
    },
    {
      code: "INR",
      name: "International Normalized Ratio (INR)",
    },
    {
      code: "BTCT",
      name: "Bleeding Time / Clotting Time",
    },
    {
      code: "SICK",
      name: "Sickling Test",
    },
    {
      code: "G6PD",
      name: "G6PD Screening",
    },
    {
      code: "MP",
      name: "Malaria Parasite",
    },
    {
      code: "DDIMER",
      name: "D-Dimer",
    },
  ],

  clinicalChemistry: [
    {
      code: "FBS",
      name: "Fasting Blood Sugar",
    },
    {
      code: "RBS",
      name: "Random Blood Sugar",
    },
    {
      code: "OGTT",
      name: "Oral Glucose Tolerance Test",
    },
    {
      code: "HBA1C",
      name: "HbA1c",
    },
    {
      code: "UREA",
      name: "Urea",
    },
    {
      code: "CREAT",
      name: "Creatinine",
    },
    {
      code: "EUC",
      name: "Electrolytes (Na+, K+, Cl-, HCO₃)",
    },
    {
      code: "LFT",
      name: "Liver Function Test",
    },
    {
      code: "AST",
      name: "AST (SGOT)",
    },
    {
      code: "ALT",
      name: "ALT (SGPT)",
    },
    {
      code: "ALP",
      name: "Alkaline Phosphatase",
    },
    {
      code: "BILI",
      name: "Bilirubin",
    },
    {
      code: "TP",
      name: "Total Protein",
    },
    {
      code: "ALB",
      name: "Albumin",
    },
    {
      code: "LIPID",
      name: "Lipid Profile",
    },
    {
      code: "TC",
      name: "Total Cholesterol",
    },
    {
      code: "HDL",
      name: "HDL Cholesterol",
    },
    {
      code: "LDL",
      name: "LDL Cholesterol",
    },
    {
      code: "TG",
      name: "Triglycerides",
    },
    {
      code: "URIC",
      name: "Uric Acid",
    },
    {
      code: "AMYL",
      name: "Amylase",
    },
    {
      code: "CRP",
      name: "C-Reactive Protein (CRP)",
    },
  ],

  microbiology: [
    {
      code: "UA",
      name: "Urinalysis",
    },
    {
      code: "UMCS",
      name: "Urine Microscopy, Culture & Sensitivity",
    },
    {
      code: "SMCS",
      name: "Stool Microscopy, Culture & Sensitivity",
    },
    {
      code: "BMCS",
      name: "Blood Culture",
    },
    {
      code: "SPMCS",
      name: "Sputum Microscopy, Culture & Sensitivity",
    },
    {
      code: "HVSMCS",
      name: "High Vaginal Swab (M/C/S)",
    },
    {
      code: "EWMCS",
      name: "Ear Swab (M/C/S)",
    },
    {
      code: "WMCS",
      name: "Wound Swab (M/C/S)",
    },
    {
      code: "SEM",
      name: "Semen Analysis",
    },
    {
      code: "AFB",
      name: "AFB Test",
    },
    {
      code: "GENE",
      name: "GeneXpert",
    },
    {
      code: "WIDAL",
      name: "Widal Test",
    },
  ],

  serology: [
    {
      code: "HIV",
      name: "HIV Screening",
    },
    {
      code: "HBV",
      name: "Hepatitis B Surface Antigen (HBsAg)",
    },
    {
      code: "HCV",
      name: "Hepatitis C Screening",
    },
    {
      code: "VDRL",
      name: "VDRL",
    },
    {
      code: "RF",
      name: "Rheumatoid Factor",
    },
    {
      code: "ASOT",
      name: "ASO Titre",
    },
    {
      code: "HCG",
      name: "Pregnancy Test",
    },
  ],

  endocrinology: [
    {
      code: "TSH",
      name: "TSH",
    },
    {
      code: "FT3",
      name: "Free T3",
    },
    {
      code: "FT4",
      name: "Free T4",
    },
    {
      code: "TT3",
      name: "Total T3",
    },
    {
      code: "TT4",
      name: "Total T4",
    },
    {
      code: "FSH",
      name: "FSH",
    },
    {
      code: "LH",
      name: "LH",
    },
    {
      code: "PRL",
      name: "Prolactin",
    },
    {
      code: "EST",
      name: "Oestradiol",
    },
    {
      code: "PROG",
      name: "Progesterone",
    },
    {
      code: "TEST",
      name: "Testosterone",
    },
    {
      code: "CORT",
      name: "Cortisol",
    },
    {
      code: "PSA",
      name: "Prostate Specific Antigen (PSA)",
    },
  ],

  bloodTransfusion: [
    {
      code: "ABO",
      name: "Blood Group (ABO & Rh)",
    },
    {
      code: "XMATCH",
      name: "Cross Match",
    },
    {
      code: "SCREEN",
      name: "Antibody Screening",
    },
  ],

  ultrasound: [
    {
      code: "PELVIS",
      name: "Pelvic Scan",
    },
    {
      code: "OBS",
      name: "Obstetric Scan",
    },
    {
      code: "ABD",
      name: "Abdominal Scan",
    },
    {
      code: "RENAL",
      name: "Renal Scan",
    },
    {
      code: "PROSTATE",
      name: "Prostate Scan",
    },
    {
      code: "SCROTAL",
      name: "Scrotal Scan",
    },
    {
      code: "THYROID",
      name: "Thyroid Scan",
    },
    {
      code: "BREAST",
      name: "Breast Scan",
    },
  ],
};

export default investigations;