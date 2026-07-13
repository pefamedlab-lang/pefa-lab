export const reportTitle = (testName = "") => {

  const name = testName.trim().toUpperCase();

  const titles = {

    /* ===========================
       CHEMICAL PATHOLOGY
    =========================== */

    "LFT": "LIVER FUNCTION TEST",

    "KFT": "KIDNEY FUNCTION TEST",

    "RFT": "RENAL FUNCTION TEST",

    "LIPID PROFILE": "LIPID PROFILE",

    "FASTING BLOOD SUGAR": "FASTING BLOOD SUGAR",

    "FBS": "FASTING BLOOD SUGAR",

    "RBS": "RANDOM BLOOD SUGAR",

    "OGTT": "ORAL GLUCOSE TOLERANCE TEST",

    "HBA1C": "GLYCATED HAEMOGLOBIN (HbA1c)",

    "ELECTROLYTES": "SERUM ELECTROLYTES",

    "E/U/CR": "UREA, ELECTROLYTES & CREATININE",

    "UREA": "SERUM UREA",

    "CREATININE": "SERUM CREATININE",

    "URIC ACID": "SERUM URIC ACID",

    "CALCIUM": "SERUM CALCIUM",

    "MAGNESIUM": "SERUM MAGNESIUM",

    "PHOSPHORUS": "SERUM PHOSPHORUS",

    "PSA": "PROSTATE SPECIFIC ANTIGEN",

    "CRP": "C-REACTIVE PROTEIN",

    /* ===========================
       HAEMATOLOGY
    =========================== */

    "CBC": "COMPLETE BLOOD COUNT",

    "FBC": "FULL BLOOD COUNT",

    "ESR": "ERYTHROCYTE SEDIMENTATION RATE",

    "PCV": "PACKED CELL VOLUME",

    "HB": "HAEMOGLOBIN ESTIMATION",

    "WBC": "TOTAL WHITE BLOOD CELL COUNT",

    "RETIC": "RETICULOCYTE COUNT",

    "PT": "PROTHROMBIN TIME",

    "APTT": "ACTIVATED PARTIAL THROMBOPLASTIN TIME",

    "INR": "INTERNATIONAL NORMALIZED RATIO",

    "D-DIMER": "D-DIMER ASSAY",

    /* ===========================
       MICROBIOLOGY
    =========================== */

    "URINE MCS": "URINE MICROSCOPY, CULTURE & SENSITIVITY",

    "MCS": "MICROSCOPY, CULTURE & SENSITIVITY",

    "HVS": "HIGH VAGINAL SWAB MICROSCOPY, CULTURE & SENSITIVITY",

    "EAR SWAB": "EAR SWAB MICROSCOPY, CULTURE & SENSITIVITY",

    "SEMEN MCS": "SEMEN MICROSCOPY, CULTURE & SENSITIVITY",

    "STOOL MCS": "STOOL MICROSCOPY, CULTURE & SENSITIVITY",

    "SPUTUM MCS": "SPUTUM MICROSCOPY, CULTURE & SENSITIVITY",

    "URINALYSIS": "URINALYSIS",

    "STOOL ANALYSIS": "STOOL ANALYSIS",

    /* ===========================
       BLOOD BANK
    =========================== */

    "BLOOD GROUP": "ABO & RH BLOOD GROUPING",

    "GENOTYPE": "HAEMOGLOBIN GENOTYPE",

    "CROSS MATCH": "BLOOD CROSS MATCHING",

    "G6PD": "GLUCOSE-6-PHOSPHATE DEHYDROGENASE SCREENING",

    /* ===========================
       SEROLOGY
    =========================== */

    "HIV": "HUMAN IMMUNODEFICIENCY VIRUS SCREENING",

    "HBsAg": "HEPATITIS B SURFACE ANTIGEN",

    "HCV": "HEPATITIS C VIRUS SCREENING",

    "VDRL": "VENEREAL DISEASE RESEARCH LABORATORY TEST",

    "WIDAL": "WIDAL TEST",

    "COVID-19": "COVID-19 SCREENING",

    /* ===========================
       HISTOLOGY
    =========================== */

    "HISTOLOGY": "HISTOPATHOLOGY REPORT",

    "CYTOLOGY": "CYTOLOGY REPORT",

    /* ===========================
       RADIOLOGY
    =========================== */

    "ULTRASOUND": "ULTRASOUND REPORT",

    "SCAN": "ULTRASOUND REPORT",

    "ECG": "ELECTROCARDIOGRAM REPORT"

  };

  return titles[name] || testName;

};