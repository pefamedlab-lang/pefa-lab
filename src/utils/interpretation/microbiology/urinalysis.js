import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   ROUTINE URINALYSIS INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   Physical Examination
   • Colour
   • Appearance
   • Specific Gravity

   Chemical Examination
   • pH
   • Protein
   • Glucose
   • Ketones
   • Blood
   • Bilirubin
   • Urobilinogen
   • Nitrite
   • Leukocyte Esterase

   Microscopy
   • WBC (Pus Cells)
   • RBC
   • Epithelial Cells
   • Casts
   • Crystals
   • Bacteria
   • Yeast
   • Parasites

   Detects
   ----------------------------------------------------------
   • Normal urinalysis
   • Urinary tract infection
   • Glomerular disease
   • Nephrotic syndrome
   • Haematuria
   • Proteinuria
   • Glycosuria
   • Ketonuria
   • Hepatobiliary disease
   • Dehydration
   • Renal tubular disease
   • Crystalluria
========================================================== */

export default function interpretUrinalysis(

  report = {},

  resultMap = {}

) {

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  const override =
    getScientistOverride(report);

  if (override) {
    return override;
  }

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  const colour =
    getResult(resultMap, "Colour") ??
    getResult(resultMap, "Color") ??
    "";

  const appearance =
    getResult(resultMap, "Appearance") ??
    getResult(resultMap, "Clarity") ??
    "";

  const specificGravity =
    getNumericResult(resultMap, "Specific Gravity") ??
    getNumericResult(resultMap, "SG");

  /* ======================================================
     CHEMICAL EXAMINATION
  ====================================================== */

  const pH =
    getNumericResult(resultMap, "pH");

  const protein =
    getResult(resultMap, "Protein") ?? "";

  const glucose =
    getResult(resultMap, "Glucose") ?? "";

  const ketones =
    getResult(resultMap, "Ketones") ?? "";

  const blood =
    getResult(resultMap, "Blood") ?? "";

  const bilirubin =
    getResult(resultMap, "Bilirubin") ?? "";

  const urobilinogen =
    getResult(resultMap, "Urobilinogen") ?? "";

  const nitrite =
    getResult(resultMap, "Nitrite") ?? "";

  const leukocyteEsterase =
    getResult(resultMap, "Leukocyte Esterase") ??
    getResult(resultMap, "Leucocyte Esterase") ??
    "";

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  const wbc =
    getNumericResult(resultMap, "Pus Cells") ??
    getNumericResult(resultMap, "WBC");

  const rbc =
    getNumericResult(resultMap, "RBC");

  const epithelialCells =
    getNumericResult(resultMap, "Epithelial Cells");

  const casts =
    getResult(resultMap, "Casts") ?? "";

  const crystals =
    getResult(resultMap, "Crystals") ?? "";

  const bacteria =
    getResult(resultMap, "Bacteria") ?? "";

  const yeast =
    getResult(resultMap, "Yeast") ?? "";

  const parasites =
    getResult(resultMap, "Parasites") ?? "";

  /* ======================================================
     NORMALISE TEXT
  ====================================================== */

  const proteinText = String(protein).toLowerCase();
  const glucoseText = String(glucose).toLowerCase();
  const ketoneText = String(ketones).toLowerCase();
  const bloodText = String(blood).toLowerCase();
  const bilirubinText = String(bilirubin).toLowerCase();
  const urobilinogenText = String(urobilinogen).toLowerCase();
  const nitriteText = String(nitrite).toLowerCase();
  const leukocyteText = String(leukocyteEsterase).toLowerCase();

  const appearanceText = String(appearance).toLowerCase();
  const colourText = String(colour).toLowerCase();

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const proteinPositive =
    !["", "negative", "nil", "none"].includes(proteinText);

  const glucosePositive =
    !["", "negative", "nil", "none"].includes(glucoseText);

  const ketonePositive =
    !["", "negative", "nil", "none"].includes(ketoneText);

  const bloodPositive =
    !["", "negative", "nil", "none"].includes(bloodText);

  const bilirubinPositive =
    !["", "negative", "nil", "none"].includes(bilirubinText);

  const nitritePositive =
    nitriteText.includes("positive");

  const leukocytePositive =
    leukocyteText.includes("positive");

  const pyuria =
    wbc !== null &&
    wbc >= 5;

  const haematuria =
    rbc !== null &&
    rbc > 3;

  const bacteriuria =
    bacteria &&
    bacteria.toLowerCase() !== "nil" &&
    bacteria.toLowerCase() !== "none";

  const yeastPresent =
    yeast &&
    yeast.toLowerCase() !== "nil" &&
    yeast.toLowerCase() !== "none";

  const crystalsPresent =
    crystals &&
    crystals.toLowerCase() !== "nil" &&
    crystals.toLowerCase() !== "none";

  const castsPresent =
    casts &&
    casts.toLowerCase() !== "nil" &&
    casts.toLowerCase() !== "none";

  const concentratedUrine =
    specificGravity !== null &&
    specificGravity > 1.025;

  const diluteUrine =
    specificGravity !== null &&
    specificGravity < 1.005;

  const acidicUrine =
    pH !== null &&
    pH < 5.5;

  const alkalineUrine =
    pH !== null &&
    pH > 8.0;

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";
}

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  if (colourText) {

    switch (colourText) {

      case "straw":

      case "pale yellow":

      case "yellow":

        interpretation +=
          "Urine colour is within the expected range.\n\n";
        break;

      case "amber":

        interpretation +=
          "Amber urine may indicate concentrated urine or the presence of pigments. Correlate with hydration status and clinical findings.\n\n";
        break;

      case "red":

        interpretation +=
          "Red urine may be due to haematuria, haemoglobinuria, myoglobinuria, medications or dietary pigments. Clinical correlation is recommended.\n\n";
        break;

      case "brown":

        interpretation +=
          "Brown urine may occur with bilirubinuria, myoglobinuria or haemoglobinuria.\n\n";
        break;

      case "orange":

        interpretation +=
          "Orange urine may result from medications, bilirubinuria or dehydration.\n\n";
        break;

      case "green":

      case "blue":

        interpretation +=
          "Unusual urine colour may be associated with medications, dyes or uncommon metabolic disorders.\n\n";
        break;

      default:

        interpretation +=
          `Urine colour reported as ${colour}.\n\n`;

    }

  }

  if (appearanceText) {

    if (

      appearanceText.includes("clear")

    ) {

      interpretation +=
        "Urine appearance is clear.\n\n";

    }

    else if (

      appearanceText.includes("slightly cloudy")

    ) {

      interpretation +=
        "Urine is slightly cloudy, which may be associated with cells, crystals or bacteria.\n\n";

    }

    else if (

      appearanceText.includes("cloudy") ||

      appearanceText.includes("turbid")

    ) {

      interpretation +=
        "Cloudy urine may reflect infection, crystalluria or increased cellular content.\n\n";

    }

  }

  if (specificGravity !== null) {

    if (concentratedUrine) {

      interpretation +=
        `Specific gravity (${specificGravity}) is elevated, suggesting concentrated urine which may occur with dehydration.\n\n`;

    }

    else if (diluteUrine) {

      interpretation +=
        `Specific gravity (${specificGravity}) is low, indicating dilute urine. Correlate with hydration status and renal concentrating ability.\n\n`;

    }

    else {

      interpretation +=
        `Specific gravity (${specificGravity}) is within the expected range.\n\n`;

    }

  }

  /* ======================================================
     CHEMICAL EXAMINATION
  ====================================================== */

  if (proteinPositive) {

    interpretation +=
      "Proteinuria is present. Persistent proteinuria may indicate renal disease and should be correlated with renal function and urinary protein quantification.\n\n";

  }

  if (glucosePositive) {

    interpretation +=
      "Glucose is detected in urine (glycosuria). Correlate with blood glucose concentration and evaluate for diabetes mellitus or renal glycosuria.\n\n";

  }

  if (ketonePositive) {

    interpretation +=
      "Ketonuria is present. This may occur in diabetic ketoacidosis, prolonged fasting, starvation or vomiting.\n\n";

  }

  if (bloodPositive) {

    interpretation +=
      "Blood is detected by dipstick. Correlate with urine microscopy to distinguish haematuria from haemoglobinuria or myoglobinuria.\n\n";

  }

  if (bilirubinPositive) {

    interpretation +=
      "Bilirubin is present in urine, suggesting conjugated hyperbilirubinaemia or hepatobiliary disease.\n\n";

  }

  if (

    urobilinogenText &&
    !urobilinogenText.includes("normal")

  ) {

    interpretation +=
      "Abnormal urinary urobilinogen should be interpreted together with liver function tests and the clinical presentation.\n\n";

  }

  if (nitritePositive) {

    interpretation +=
      "Nitrite is positive, supporting the presence of nitrate-reducing bacteria in the urinary tract.\n\n";

  }

  if (leukocytePositive) {

    interpretation +=
      "Leukocyte esterase is positive, indicating the presence of white blood cells in urine.\n\n";

  }

  if (pH !== null) {

    if (acidicUrine) {

      interpretation +=
        `Urine pH (${pH}) is acidic.\n\n`;

    }

    else if (alkalineUrine) {

      interpretation +=
        `Urine pH (${pH}) is alkaline. Alkaline urine may occur with urinary tract infection caused by urease-producing organisms or after meals.\n\n`;

    }

    else {

      interpretation +=
        `Urine pH (${pH}) is within the expected physiological range.\n\n`;

    }

  }

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  if (pyuria) {

    interpretation +=
      "Pyuria is present, suggesting urinary tract inflammation or infection.\n\n";

  }

  if (haematuria) {

    interpretation +=
      "Microscopic haematuria is present.\n\n";

  }

  if (bacteriuria) {

    interpretation +=
      "Bacteria are observed on urine microscopy.\n\n";

  }

  if (yeastPresent) {

    interpretation +=
      "Yeast cells are present. Correlate with symptoms and consider fungal urinary tract infection or contamination.\n\n";

  }

  if (castsPresent) {

    interpretation +=
      `Urinary casts reported (${casts}). Cast interpretation depends on cast type and clinical context.\n\n`;

  }

  if (crystalsPresent) {

    interpretation +=
      `Urinary crystals reported (${crystals}). Correlate with urine pH, metabolic disorders and the risk of urinary stone disease.\n\n`;

  }

  if (

    epithelialCells !== null &&
    epithelialCells > 10

  ) {

    interpretation +=
      "Numerous epithelial cells are present, suggesting possible contamination of the urine specimen.\n\n";

  }

  if (

    parasites &&
    parasites.toLowerCase() !== "nil" &&
    parasites.toLowerCase() !== "none"

  ) {

    interpretation +=
      "Parasites are present in urine. Correlate with parasite identification and clinical findings.\n\n";

  }

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "Urinalysis findings should be interpreted together with the patient's symptoms, renal function, urine culture (where indicated) and other relevant laboratory investigations.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NORMAL URINALYSIS
  ---------------------------------------------------------
  */

  const normalUrinalysis =

    !proteinPositive &&
    !glucosePositive &&
    !ketonePositive &&
    !bloodPositive &&
    !bilirubinPositive &&
    !nitritePositive &&
    !leukocytePositive &&
    !pyuria &&
    !haematuria &&
    !bacteriuria &&
    !yeastPresent &&
    !castsPresent &&
    !crystalsPresent;

  if (normalUrinalysis) {

    impression =
      "Urinalysis is within normal limits.";

    recommendation =
      "No significant abnormality detected. Interpret together with the clinical presentation.";

  }

  /*
  ---------------------------------------------------------
  URINARY TRACT INFECTION
  ---------------------------------------------------------
  */

  else if (

    (
      nitritePositive ||
      leukocytePositive
    ) &&

    (
      pyuria ||
      bacteriuria
    )

  ) {

    impression =
      "Findings are consistent with urinary tract infection.";

    recommendation =
      "Recommend urine culture and antimicrobial susceptibility testing if not already performed. Correlate with urinary symptoms.";

  }

  /*
  ---------------------------------------------------------
  STERILE PYURIA
  ---------------------------------------------------------
  */

  else if (

    pyuria &&
    !bacteriuria &&
    !nitritePositive

  ) {

    impression =
      "Sterile pyuria.";

    recommendation =
      "Consider partially treated urinary tract infection, genitourinary tuberculosis, sexually transmitted infections or non-infectious inflammatory conditions.";

  }

  /*
  ---------------------------------------------------------
  GLOMERULAR DISEASE
  ---------------------------------------------------------
  */

  else if (

    proteinPositive &&
    haematuria &&
    castsPresent

  ) {

    impression =
      "Urinalysis suggests possible glomerular disease.";

    recommendation =
      "Correlate with renal function tests, urine protein quantification and nephrology assessment where appropriate.";

  }

  /*
  ---------------------------------------------------------
  NEPHROTIC SYNDROME
  ---------------------------------------------------------
  */

  else if (

    proteinPositive &&
    !haematuria

  ) {

    impression =
      "Significant proteinuria detected.";

    recommendation =
      "Persistent proteinuria warrants further evaluation including urine protein quantification, serum albumin and renal function assessment.";

  }

  /*
  ---------------------------------------------------------
  HAEMATURIA
  ---------------------------------------------------------
  */

  else if (

    haematuria &&
    !proteinPositive

  ) {

    impression =
      "Microscopic haematuria.";

    recommendation =
      "Correlate with urinary symptoms, imaging and urological evaluation where clinically indicated.";

  }

  /*
  ---------------------------------------------------------
  GLYCOSURIA
  ---------------------------------------------------------
  */

  else if (

    glucosePositive &&
    !ketonePositive

  ) {

    impression =
      "Glycosuria detected.";

    recommendation =
      "Correlate with blood glucose concentration to assess for diabetes mellitus or renal glycosuria.";

  }

  /*
  ---------------------------------------------------------
  DIABETIC KETOACIDOSIS
  ---------------------------------------------------------
  */

  else if (

    glucosePositive &&
    ketonePositive

  ) {

    impression =
      "Combined glycosuria and ketonuria.";

    recommendation =
      "Correlate urgently with blood glucose, serum ketones and acid-base status to exclude diabetic ketoacidosis.";

  }

  /*
  ---------------------------------------------------------
  HEPATOBILIARY DISEASE
  ---------------------------------------------------------
  */

  else if (

    bilirubinPositive

  ) {

    impression =
      "Bilirubinuria detected.";

    recommendation =
      "Correlate with liver function tests and evaluate for hepatobiliary disease or biliary obstruction.";

  }

  /*
  ---------------------------------------------------------
  DEHYDRATION
  ---------------------------------------------------------
  */

  else if (

    concentratedUrine &&
    !proteinPositive

  ) {

    impression =
      "Concentrated urine.";

    recommendation =
      "This may reflect dehydration. Correlate with fluid status and clinical findings.";

  }

  /*
  ---------------------------------------------------------
  DILUTE URINE
  ---------------------------------------------------------
  */

  else if (

    diluteUrine

  ) {

    impression =
      "Dilute urine.";

    recommendation =
      "Consider increased fluid intake, diabetes insipidus or impaired renal concentrating ability if persistent.";

  }

  /*
  ---------------------------------------------------------
  CRYSTALLURIA
  ---------------------------------------------------------
  */

  else if (

    crystalsPresent

  ) {

    impression =
      "Crystalluria.";

    recommendation =
      "Interpret according to crystal type, urine pH and risk factors for urinary stone disease.";

  }

  /*
  ---------------------------------------------------------
  YEAST
  ---------------------------------------------------------
  */

  else if (

    yeastPresent

  ) {

    impression =
      "Yeast detected in urine.";

    recommendation =
      "Interpret in relation to symptoms, urinary catheterisation, diabetes mellitus and immunosuppression. Contamination should also be considered.";

  }

  /*
  ---------------------------------------------------------
  PARASITES
  ---------------------------------------------------------
  */

  else if (

    parasites &&
    parasites.toLowerCase() !== "nil" &&
    parasites.toLowerCase() !== "none"

  ) {

    impression =
      "Parasites detected in urine.";

    recommendation =
      "Correlate with parasite identification and clinical findings. Additional parasitological evaluation may be required.";

  }

  /*
  ---------------------------------------------------------
  NON-SPECIFIC ABNORMALITY
  ---------------------------------------------------------
  */

  else {

    impression =
      "Abnormal urinalysis.";

    recommendation =
      "Interpret the findings together with renal function, urine culture where indicated and the overall clinical picture.";

  }
  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression === "Urinalysis is within normal limits."

  ) {

    recommendation =
      "No significant abnormality is detected. Correlate with the patient's clinical presentation.";

  }

  else if (

    impression.includes("urinary tract infection")

  ) {

    recommendation =
      "Recommend urine microscopy, culture and susceptibility testing if not already performed. Initiate antimicrobial therapy according to culture results and clinical guidelines.";

  }

  else if (

    impression.includes("Sterile pyuria")

  ) {

    recommendation =
      "Consider sexually transmitted infections, genitourinary tuberculosis, nephrolithiasis, interstitial nephritis or partially treated urinary tract infection.";

  }

  else if (

    impression.includes("glomerular")

  ) {

    recommendation =
      "Recommend urine protein quantification, renal function tests, serum albumin and nephrology consultation where clinically appropriate.";

  }

  else if (

    impression.includes("proteinuria")

  ) {

    recommendation =
      "Persistent proteinuria should be further evaluated with urine protein quantification, serum creatinine and estimated glomerular filtration rate.";

  }

  else if (

    impression.includes("haematuria")

  ) {

    recommendation =
      "Persistent haematuria warrants further evaluation including repeat urinalysis, urine microscopy, imaging and urological assessment where indicated.";

  }

  else if (

    impression.includes("Glycosuria")

  ) {

    recommendation =
      "Correlate with fasting or random plasma glucose and glycated haemoglobin (HbA1c) to assess for diabetes mellitus.";

  }

  else if (

    impression.includes("ketonuria") ||

    impression.includes("ketoacidosis")

  ) {

    recommendation =
      "Urgent assessment of blood glucose, serum ketones, electrolytes and acid-base status is recommended where diabetic ketoacidosis is suspected.";

  }

  else if (

    impression.includes("Bilirubinuria")

  ) {

    recommendation =
      "Recommend liver function tests and clinical assessment for hepatobiliary disease.";

  }

  else if (

    impression.includes("Concentrated urine")

  ) {

    recommendation =
      "Assess hydration status and encourage adequate fluid intake where clinically appropriate.";

  }

  else if (

    impression.includes("Dilute urine")

  ) {

    recommendation =
      "Persistent dilute urine may warrant evaluation of renal concentrating ability and endocrine causes such as diabetes insipidus.";

  }

  else if (

    impression.includes("Crystalluria")

  ) {

    recommendation =
      "Identify the crystal type, correlate with urine pH and consider metabolic evaluation if recurrent.";

  }

  else if (

    impression.includes("Yeast")

  ) {

    recommendation =
      "Correlate with symptoms, diabetes status, urinary catheterisation and urine culture where indicated.";

  }

  else if (

    impression.includes("Parasites")

  ) {

    recommendation =
      "Identify the parasite species and investigate according to the suspected parasitic infection.";

  }

  /* ======================================================
     FINAL CLINICAL COMMENT
  ====================================================== */

  interpretation +=
    "Routine urinalysis should always be interpreted together with the patient's history, physical examination, renal function, urine culture (where indicated) and relevant imaging findings.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}