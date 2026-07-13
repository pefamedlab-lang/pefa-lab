export const getFullTestName = (

  testName = ""

) => {

  const names = {

    /* =========================
       CHEMISTRY
    ========================= */

    FBS:
      "Fasting Blood Sugar",

    RBS:
      "Random Blood Sugar",

    HbA1c:
      "Glycated Haemoglobin (HbA1c)",

    KFT:
      "Kidney Function Test",

    LFT:
      "Liver Function Test",

    "Lipid Profile":
      "Lipid Profile",

    "Diabetes Profile":
      "Diabetes Profile",

    Urea:
      "Blood Urea",

    Creatinine:
      "Serum Creatinine",

    UricAcid:
      "Serum Uric Acid",

    Calcium:
      "Serum Calcium",

    Magnesium:
      "Serum Magnesium",

    Phosphorus:
      "Serum Phosphorus",

    /* =========================
       HAEMATOLOGY
    ========================= */

    FBC:
      "Full Blood Count",

    PCV:
      "Packed Cell Volume",

    ESR:
      "Erythrocyte Sedimentation Rate",

    PT:
      "Prothrombin Time",

    PTTK:
      "Partial Thromboplastin Time with Kaolin",

    INR:
      "International Normalized Ratio",

    /* =========================
       SEROLOGY
    ========================= */

    VDRL:
      "Venereal Disease Research Laboratory Test",

    HBsAg:
      "Hepatitis B Surface Antigen",

    HCV:
      "Hepatitis C Virus Screening",

    HIV:
      "Human Immunodeficiency Virus Screening",

    WidalTest:
      "Widal Test Report",

    /* =========================
       MICROBIOLOGY
    ========================= */

    MCS:
      "Microscopy, Culture & Sensitivity",

    Urinalysis:
      "Urinalysis Report",

    StoolAnalysis:
      "Stool Analysis Report",

    /* =========================
       BLOOD BANK
    ========================= */

    BloodGroup:
      "Blood Grouping Report",

    GroupingCrossMatch:
      "Grouping & Cross Match Report",

    /* =========================
       TOXICOLOGY
    ========================= */

    UrineDrugScreening:
      "Urine Drug Screening Report",

Urinalysis:
  "Urinalysis Report",

UrineMCS:
  "Urine Microscopy, Culture & Sensitivity",

StoolAnalysis:
  "Stool Analysis Report",

StoolMCS:
  "Stool Microscopy Report",

SemenAnalysis:
  "Semen Analysis Report",

HVS:
  "High Vaginal Swab Microscopy, Culture & Sensitivity",

EarSwab:
  "Ear Swab Microscopy, Culture & Sensitivity",

EyeSwab:
  "Eye Swab Microscopy, Culture & Sensitivity",

SputumMCS:
  "Sputum Microscopy, Culture & Sensitivity",

WoundSwab:
  "Wound Swab Microscopy, Culture & Sensitivity",

HISTOLOGY: "Histopathology Examination",

BIOPSY: "Tissue Biopsy Examination",

CERVICAL_BIOPSY: "Cervical Biopsy",

ENDOMETRIAL_BIOPSY: "Endometrial Biopsy",

PROSTATE_BIOPSY: "Prostate Biopsy",

BREAST_BIOPSY: "Breast Biopsy",

LYMPH_NODE_BIOPSY: "Lymph Node Biopsy",

SKIN_BIOPSY: "Skin Biopsy",

BONE_MARROW: "Bone Marrow Examination",

CYTOLOGY: "Cytology Examination",

FNAC: "Fine Needle Aspiration Cytology (FNAC)",

  };

  return (

    names[testName] ||

    testName

  );

};