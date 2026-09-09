import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   CARDIAC BIOMARKER INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Troponin I
   • Troponin T
   • CK-MB
   • Total CK
   • Myoglobin
   • BNP
   • NT-proBNP

   Detects
   ----------------------------------------------------------
   • Normal cardiac biomarker profile
   • Acute myocardial injury
   • Acute myocardial infarction (possible)
   • Heart failure
   • Skeletal muscle injury
   • Cardiac biomarker combinations
========================================================== */

export default function interpretCardiacMarkers(

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
     RESULTS
  ====================================================== */

  const troponinI =
    getNumericResult(resultMap, "Troponin I");

  const troponinT =
    getNumericResult(resultMap, "Troponin T");

  const ckmb =
    getNumericResult(resultMap, "CK-MB");

  const totalCK =
    getNumericResult(resultMap, "CK") ??
    getNumericResult(resultMap, "Creatine Kinase");

  const myoglobin =
    getNumericResult(resultMap, "Myoglobin");

  const bnp =
    getNumericResult(resultMap, "BNP");

  const ntprobnp =
    getNumericResult(resultMap, "NT-proBNP");

  /* ======================================================
     REFERENCE LIMITS

     Replace with analyser-specific values if available.
  ====================================================== */

  const TROPONIN_I_ULN = 0.04;
  const TROPONIN_T_ULN = 0.014;
  const CKMB_ULN = 25;
  const TOTAL_CK_ULN = 190;
  const MYOGLOBIN_ULN = 85;
  const BNP_ULN = 100;
  const NTPROBNP_ULN = 125;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const troponinIHigh =
    troponinI !== null &&
    troponinI > TROPONIN_I_ULN;

  const troponinTHigh =
    troponinT !== null &&
    troponinT > TROPONIN_T_ULN;

  const troponinPositive =
    troponinIHigh ||
    troponinTHigh;

  const ckmbHigh =
    ckmb !== null &&
    ckmb > CKMB_ULN;

  const totalCKHigh =
    totalCK !== null &&
    totalCK > TOTAL_CK_ULN;

  const myoglobinHigh =
    myoglobin !== null &&
    myoglobin > MYOGLOBIN_ULN;

  const bnpHigh =
    bnp !== null &&
    bnp > BNP_ULN;

  const ntprobnpHigh =
    ntprobnp !== null &&
    ntprobnp > NTPROBNP_ULN;

  const heartFailureMarker =
    bnpHigh ||
    ntprobnpHigh;

  /* ======================================================
     MARKED ELEVATIONS
  ====================================================== */

  const markedlyHighTroponin =

    (troponinI !== null &&
      troponinI >= (TROPONIN_I_ULN * 10))

    ||

    (troponinT !== null &&
      troponinT >= (TROPONIN_T_ULN * 10));

  const markedlyHighCKMB =
    ckmb !== null &&
    ckmb >= (CKMB_ULN * 3);

  const markedlyHighCK =
    totalCK !== null &&
    totalCK >= (TOTAL_CK_ULN * 5);

  const markedlyHighBNP =
    bnp !== null &&
    bnp >= 500;

  const markedlyHighNTproBNP =
    ntprobnp !== null &&
    ntprobnp >= 900;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function hasValue(
    value
  ) {

    return (
      value !== null &&
      !Number.isNaN(value)
    );

  }

  function isHigh(
    value,
    upperLimit
  ) {

    return (
      value !== null &&
      value > upperLimit
    );

  }

  function foldIncrease(
    value,
    upperLimit
  ) {

    if (
      value === null ||
      upperLimit <= 0
    ) {

      return null;

    }

    return value / upperLimit;

  }

  const troponinIFold =
    foldIncrease(
      troponinI,
      TROPONIN_I_ULN
    );

  const troponinTFold =
    foldIncrease(
      troponinT,
      TROPONIN_T_ULN
    );

  const ckmbFold =
    foldIncrease(
      ckmb,
      CKMB_ULN
    );

  const ckFold =
    foldIncrease(
      totalCK,
      TOTAL_CK_ULN
    );

  const bnpFold =
    foldIncrease(
      bnp,
      BNP_ULN
    );

  const ntprobnpFold =
    foldIncrease(
      ntprobnp,
      NTPROBNP_ULN
    );

  /* ======================================================
     TROPONIN
  ====================================================== */

  if (hasValue(troponinI) || hasValue(troponinT)) {

    if (!troponinPositive) {

      interpretation +=
        "Cardiac troponin concentration is within the reference interval.\n\n";

    }

    else if (!markedlyHighTroponin) {

      interpretation +=
        "Cardiac troponin is elevated, indicating myocardial injury. This finding is not specific for acute myocardial infarction and should be interpreted together with the clinical presentation, ECG findings and serial troponin measurements.\n\n";

    }

    else {

      interpretation +=
        "Cardiac troponin is markedly elevated, indicating significant myocardial injury. Acute myocardial infarction should be considered in the appropriate clinical setting.\n\n";

    }

  }

  /* ======================================================
     CK-MB
  ====================================================== */

  if (hasValue(ckmb)) {

    if (!ckmbHigh) {

      interpretation +=
        "CK-MB is within the reference interval.\n\n";

    }

    else if (!markedlyHighCKMB) {

      interpretation +=
        "CK-MB is elevated, supporting myocardial injury when interpreted together with troponin and clinical findings.\n\n";

    }

    else {

      interpretation +=
        "CK-MB is markedly elevated, consistent with significant myocardial injury.\n\n";

    }

  }

  /* ======================================================
     TOTAL CK
  ====================================================== */

  if (hasValue(totalCK)) {

    if (!totalCKHigh) {

      interpretation +=
        "Total creatine kinase (CK) is within the reference interval.\n\n";

    }

    else if (!markedlyHighCK) {

      interpretation +=
        "Total CK is elevated. This may reflect skeletal muscle injury, strenuous exercise, intramuscular injections or myocardial injury.\n\n";

    }

    else {

      interpretation +=
        "Marked elevation of total CK is present, suggesting significant muscle injury. Correlation with CK-MB, troponin and the clinical findings is recommended.\n\n";

    }

  }

  /* ======================================================
     MYOGLOBIN
  ====================================================== */

  if (hasValue(myoglobin)) {

    if (!myoglobinHigh) {

      interpretation +=
        "Myoglobin concentration is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Myoglobin is elevated. This is an early but non-specific marker of muscle injury and should be interpreted together with troponin and CK results.\n\n";

    }

  }

  /* ======================================================
     BNP
  ====================================================== */

  if (hasValue(bnp)) {

    if (!bnpHigh) {

      interpretation +=
        "B-type natriuretic peptide (BNP) is within the reference interval.\n\n";

    }

    else if (!markedlyHighBNP) {

      interpretation +=
        "BNP is elevated, suggesting ventricular strain or heart failure. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        "BNP is markedly elevated, strongly supporting significant cardiac ventricular dysfunction or heart failure.\n\n";

    }

  }

  /* ======================================================
     NT-proBNP
  ====================================================== */

  if (hasValue(ntprobnp)) {

    if (!ntprobnpHigh) {

      interpretation +=
        "NT-proBNP is within the reference interval.\n\n";

    }

    else if (!markedlyHighNTproBNP) {

      interpretation +=
        "NT-proBNP is elevated, suggesting ventricular dysfunction or heart failure.\n\n";

    }

    else {

      interpretation +=
        "NT-proBNP is markedly elevated, strongly supporting significant heart failure or marked ventricular dysfunction.\n\n";

    }

  }

  /* ======================================================
     COMBINED CARDIAC BIOMARKER COMMENT
  ====================================================== */

  if (

    troponinPositive &&
    ckmbHigh

  ) {

    interpretation +=
      "Concurrent elevation of troponin and CK-MB provides biochemical evidence of myocardial injury. Correlation with symptoms, ECG findings and serial biomarker measurements is essential.\n\n";

  }

  if (

    totalCKHigh &&
    !troponinPositive

  ) {

    interpretation +=
      "Elevated total CK with normal troponin suggests skeletal muscle injury rather than myocardial necrosis, although early myocardial injury cannot be completely excluded.\n\n";

  }

  if (

    heartFailureMarker

  ) {

    interpretation +=
      "Elevated natriuretic peptide concentrations support increased ventricular wall stress and should be interpreted together with echocardiographic and clinical findings.\n\n";

  }

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "Cardiac biomarkers should not be interpreted in isolation. Diagnosis of acute coronary syndrome requires integration of clinical presentation, electrocardiographic findings, serial biomarker measurements and, where appropriate, cardiac imaging.\n\n";

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Acute Myocardial Infarction Pattern
  ------------------------------------------------------ */

  if (

    troponinPositive &&
    ckmbHigh

  ) {

    impression =
      "Biochemical findings are consistent with acute myocardial injury. Acute myocardial infarction should be considered in the appropriate clinical setting.";

    recommendation =
      "Correlate with symptoms, ECG findings and serial cardiac troponin measurements. Urgent cardiology assessment is recommended where clinically indicated.";

  }

  /*
     Acute Myocardial Injury
  ------------------------------------------------------ */

  else if (

    troponinPositive

  ) {

    impression =
      "Evidence of myocardial injury.";

    recommendation =
      "Interpret together with the clinical presentation, ECG findings and serial troponin measurements. Consider non-ischaemic causes including myocarditis, heart failure, pulmonary embolism, sepsis and renal impairment.";

  }

  /*
     Acute Heart Failure
  ------------------------------------------------------ */

  else if (

    heartFailureMarker &&
    markedlyHighBNP

  ) {

    impression =
      "Marked elevation of BNP consistent with significant heart failure.";

    recommendation =
      "Clinical assessment for acute decompensated heart failure is recommended. Correlate with echocardiography, chest imaging and clinical findings.";

  }

  else if (

    heartFailureMarker &&
    markedlyHighNTproBNP

  ) {

    impression =
      "Marked elevation of NT-proBNP consistent with significant heart failure.";

    recommendation =
      "Clinical assessment for acute decompensated heart failure is recommended. Correlate with echocardiography, chest imaging and clinical findings.";

  }

  /*
     Chronic / Mild Heart Failure Pattern
  ------------------------------------------------------ */

  else if (

    heartFailureMarker

  ) {

    impression =
      "Elevated natriuretic peptide suggesting ventricular dysfunction or heart failure.";

    recommendation =
      "Interpret together with clinical findings and echocardiography. Elevated natriuretic peptides may also occur in renal impairment, pulmonary hypertension and advanced age.";

  }

  /*
     Skeletal Muscle Injury
  ------------------------------------------------------ */

  else if (

    totalCKHigh &&
    !troponinPositive

  ) {

    impression =
      "Biochemical findings suggest skeletal muscle injury.";

    recommendation =
      "Consider recent exercise, trauma, intramuscular injections, myositis or rhabdomyolysis. Correlate with clinical findings.";

  }

  /*
     Early Muscle Injury Pattern
  ------------------------------------------------------ */

  else if (

    myoglobinHigh &&
    !troponinPositive

  ) {

    impression =
      "Elevated myoglobin indicating early or non-specific muscle injury.";

    recommendation =
      "Interpret together with serial troponin and CK measurements where myocardial injury is suspected.";

  }

  /*
     Combined Myocardial Injury + Heart Failure
  ------------------------------------------------------ */

  else if (

    troponinPositive &&
    heartFailureMarker

  ) {

    impression =
      "Evidence of myocardial injury with concurrent ventricular dysfunction.";

    recommendation =
      "Urgent cardiology assessment is recommended. Correlate with ECG, echocardiography and serial biomarker measurements.";

  }

  /*
     Normal Cardiac Biomarker Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Cardiac biomarker profile is within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation is advised. A normal cardiac biomarker profile does not completely exclude acute coronary syndrome, particularly in the early hours after symptom onset.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("acute myocardial injury")

  ) {

    recommendation =
      "Urgent clinical assessment is recommended. Correlate with symptoms, ECG findings and serial cardiac troponin measurements. Manage according to current acute coronary syndrome guidelines where appropriate.";

  }

  else if (

    impression.includes("myocardial injury")

  ) {

    recommendation =
      "Interpret together with clinical findings, ECG and serial troponin measurements. Consider both ischaemic and non-ischaemic causes of myocardial injury.";

  }

  else if (

    impression.includes("heart failure")

  ) {

    recommendation =
      "Correlate with echocardiography, chest imaging and the patient's clinical status. Optimisation of heart failure management may be required.";

  }

  else if (

    impression.includes("skeletal muscle injury")

  ) {

    recommendation =
      "Evaluate for trauma, recent strenuous exercise, inflammatory myopathy or rhabdomyolysis. Correlate with renal function and repeat CK measurements where indicated.";

  }

  else if (

    impression.includes("myoglobin")

  ) {

    recommendation =
      "Interpret together with CK and troponin concentrations. Repeat cardiac biomarkers if myocardial injury remains clinically suspected.";

  }

  else if (

    impression.includes("within acceptable")

  ) {

    recommendation =
      "Routine clinical correlation is advised. If acute coronary syndrome remains clinically suspected, repeat cardiac troponin testing according to institutional protocols.";

  }

  /* ======================================================
     RETURN INTERPRETATION
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}