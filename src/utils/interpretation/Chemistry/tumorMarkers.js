import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   TUMOUR MARKERS INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • PSA
   • AFP
   • CEA
   • CA 125
   • CA 15-3
   • CA 19-9
   • β-hCG

   Detects
   ----------------------------------------------------------
   • Normal tumour marker profile
   • Raised PSA
   • Raised AFP
   • Raised CEA
   • Raised CA-125
   • Raised CA15-3
   • Raised CA19-9
   • Raised β-hCG

   NOTE
   ----------------------------------------------------------
   Tumour markers are NOT diagnostic of malignancy.
   They should always be interpreted together with
   history, imaging and histopathology.
========================================================== */

export default function interpretTumourMarkers(

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

  const psa =
    getNumericResult(
      resultMap,
      "PSA"
    );

  const afp =
    getNumericResult(
      resultMap,
      "AFP"
    );

  const cea =
    getNumericResult(
      resultMap,
      "CEA"
    );

  const ca125 =
    getNumericResult(
      resultMap,
      "CA 125"
    ) ??
    getNumericResult(
      resultMap,
      "CA125"
    );

  const ca153 =
    getNumericResult(
      resultMap,
      "CA 15-3"
    ) ??
    getNumericResult(
      resultMap,
      "CA15-3"
    );

  const ca199 =
    getNumericResult(
      resultMap,
      "CA 19-9"
    ) ??
    getNumericResult(
      resultMap,
      "CA19-9"
    );

  const bhcg =
    getNumericResult(
      resultMap,
      "β-hCG"
    ) ??
    getNumericResult(
      resultMap,
      "Beta hCG"
    );

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const PSA_ULN = 4.0;
  const AFP_ULN = 10;
  const CEA_ULN = 5;
  const CA125_ULN = 35;
  const CA153_ULN = 30;
  const CA199_ULN = 37;
  const BHCG_ULN = 5;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const psaHigh =
    psa !== null &&
    psa > PSA_ULN;

  const afpHigh =
    afp !== null &&
    afp > AFP_ULN;

  const ceaHigh =
    cea !== null &&
    cea > CEA_ULN;

  const ca125High =
    ca125 !== null &&
    ca125 > CA125_ULN;

  const ca153High =
    ca153 !== null &&
    ca153 > CA153_ULN;

  const ca199High =
    ca199 !== null &&
    ca199 > CA199_ULN;

  const bhcgHigh =
    bhcg !== null &&
    bhcg > BHCG_ULN;

  /* Clinically significant elevations */

  const markedlyHighPSA =
    psa !== null &&
    psa >= 20;

  const markedlyHighAFP =
    afp !== null &&
    afp >= 400;

  const markedlyHighCEA =
    cea !== null &&
    cea >= 20;

  const markedlyHighCA125 =
    ca125 !== null &&
    ca125 >= 200;

  const markedlyHighCA153 =
    ca153 !== null &&
    ca153 >= 100;

  const markedlyHighCA199 =
    ca199 !== null &&
    ca199 >= 200;

  const markedlyHighBHCG =
    bhcg !== null &&
    bhcg >= 1000;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

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

  const psaFold =
    foldIncrease(
      psa,
      PSA_ULN
    );

  const afpFold =
    foldIncrease(
      afp,
      AFP_ULN
    );

  const ceaFold =
    foldIncrease(
      cea,
      CEA_ULN
    );

  const ca125Fold =
    foldIncrease(
      ca125,
      CA125_ULN
    );

  const ca153Fold =
    foldIncrease(
      ca153,
      CA153_ULN
    );

  const ca199Fold =
    foldIncrease(
      ca199,
      CA199_ULN
    );

  const bhcgFold =
    foldIncrease(
      bhcg,
      BHCG_ULN
    );

  /* ======================================================
     PROSTATE-SPECIFIC ANTIGEN (PSA)
  ====================================================== */

  if (psa !== null) {

    if (!psaHigh) {

      interpretation +=
        "Prostate-specific antigen (PSA) is within the reference interval.\n\n";

    }

    else if (!markedlyHighPSA) {

      interpretation +=
        "PSA is elevated. Benign prostatic hyperplasia, prostatitis, urinary tract instrumentation and prostate carcinoma should be considered in the appropriate clinical context.\n\n";

    }

    else {

      interpretation +=
        "PSA is markedly elevated. Significant prostatic pathology, including prostate carcinoma, should be considered, although PSA alone is not diagnostic.\n\n";

    }

  }

  /* ======================================================
     ALPHA-FETOPROTEIN (AFP)
  ====================================================== */

  if (afp !== null) {

    if (!afpHigh) {

      interpretation +=
        "Alpha-fetoprotein (AFP) is within the reference interval.\n\n";

    }

    else if (!markedlyHighAFP) {

      interpretation +=
        "AFP is elevated. This may occur in chronic liver disease, liver regeneration, pregnancy or germ cell tumours.\n\n";

    }

    else {

      interpretation +=
        "AFP is markedly elevated. Hepatocellular carcinoma or a non-seminomatous germ cell tumour should be considered in the appropriate clinical setting.\n\n";

    }

  }

  /* ======================================================
     CARCINOEMBRYONIC ANTIGEN (CEA)
  ====================================================== */

  if (cea !== null) {

    if (!ceaHigh) {

      interpretation +=
        "Carcinoembryonic antigen (CEA) is within the reference interval.\n\n";

    }

    else if (!markedlyHighCEA) {

      interpretation +=
        "CEA is elevated. Mild elevation may occur in smokers, inflammatory bowel disease, pancreatitis and other benign conditions.\n\n";

    }

    else {

      interpretation +=
        "CEA is markedly elevated. Malignancy should be considered, particularly colorectal carcinoma, although this finding is not diagnostic.\n\n";

    }

  }

  /* ======================================================
     CA 125
  ====================================================== */

  if (ca125 !== null) {

    if (!ca125High) {

      interpretation +=
        "CA 125 is within the reference interval.\n\n";

    }

    else if (!markedlyHighCA125) {

      interpretation +=
        "CA 125 is elevated. Benign gynaecological conditions, menstruation, pregnancy and inflammatory disorders may produce this finding.\n\n";

    }

    else {

      interpretation +=
        "CA 125 is markedly elevated. Ovarian malignancy should be considered in the appropriate clinical context, although benign causes remain possible.\n\n";

    }

  }

  /* ======================================================
     CA 15-3
  ====================================================== */

  if (ca153 !== null) {

    if (!ca153High) {

      interpretation +=
        "CA 15-3 is within the reference interval.\n\n";

    }

    else if (!markedlyHighCA153) {

      interpretation +=
        "CA 15-3 is elevated. This may occur in both benign breast disease and malignant conditions.\n\n";

    }

    else {

      interpretation +=
        "CA 15-3 is markedly elevated and may be associated with advanced breast carcinoma. Clinical correlation is essential.\n\n";

    }

  }

  /* ======================================================
     CA 19-9
  ====================================================== */

  if (ca199 !== null) {

    if (!ca199High) {

      interpretation +=
        "CA 19-9 is within the reference interval.\n\n";

    }

    else if (!markedlyHighCA199) {

      interpretation +=
        "CA 19-9 is elevated. Benign hepatobiliary disease, pancreatitis and cholestasis may produce elevated concentrations.\n\n";

    }

    else {

      interpretation +=
        "CA 19-9 is markedly elevated. Pancreatic or hepatobiliary malignancy should be considered, although benign biliary obstruction may also produce marked elevation.\n\n";

    }

  }

  /* ======================================================
     β-hCG
  ====================================================== */

  if (bhcg !== null) {

    if (!bhcgHigh) {

      interpretation +=
        "β-hCG is within the reference interval.\n\n";

    }

    else if (!markedlyHighBHCG) {

      interpretation +=
        "β-hCG is elevated. Pregnancy, trophoblastic disease and germ cell tumours should be considered where clinically appropriate.\n\n";

    }

    else {

      interpretation +=
        "β-hCG is markedly elevated and may occur in gestational trophoblastic disease or germ cell tumours. Clinical correlation is essential.\n\n";

    }

  }

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "Tumour marker concentrations should not be used in isolation for the diagnosis of malignancy. Results should always be interpreted together with the patient's clinical history, imaging findings and histopathological assessment where appropriate.\n\n";

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Multiple Tumour Marker Elevation
  ------------------------------------------------------ */

  if (

    [
      psaHigh,
      afpHigh,
      ceaHigh,
      ca125High,
      ca153High,
      ca199High,
      bhcgHigh,

    ].filter(Boolean).length >= 2

  ) {

    impression =
      "Multiple tumour markers are elevated.";

    recommendation =
      "Tumour markers are non-specific and should not be interpreted in isolation. Correlation with the clinical history, imaging studies and histopathological findings is recommended.";

  }

  /*
     Prostate Marker Pattern
  ------------------------------------------------------ */

  else if (

    psaHigh

  ) {

    impression =
      "Raised prostate-specific antigen (PSA).";

    recommendation =
      "Interpret together with age, digital rectal examination findings and prostate imaging where appropriate. Benign prostatic hyperplasia and prostatitis should also be considered.";

  }

  /*
     Hepatocellular / Germ Cell Pattern
  ------------------------------------------------------ */

  else if (

    afpHigh

  ) {

    impression =
      "Raised alpha-fetoprotein (AFP).";

    recommendation =
      "Interpret together with liver function tests, liver imaging and clinical findings. Pregnancy and germ cell tumours should also be excluded where appropriate.";

  }

  /*
     Colorectal / Gastrointestinal Pattern
  ------------------------------------------------------ */

  else if (

    ceaHigh

  ) {

    impression =
      "Raised carcinoembryonic antigen (CEA).";

    recommendation =
      "CEA is non-specific. Correlation with gastrointestinal evaluation, imaging and smoking history is recommended.";

  }

  /*
     Ovarian Marker Pattern
  ------------------------------------------------------ */

  else if (

    ca125High

  ) {

    impression =
      "Raised CA 125.";

    recommendation =
      "Interpret together with pelvic imaging and gynaecological assessment. Benign causes such as endometriosis and pelvic inflammatory disease should also be considered.";

  }

  /*
     Breast Marker Pattern
  ------------------------------------------------------ */

  else if (

    ca153High

  ) {

    impression =
      "Raised CA 15-3.";

    recommendation =
      "Interpret in conjunction with breast imaging and the patient's clinical history. CA 15-3 is most useful for monitoring known breast carcinoma.";

  }

  /*
     Pancreatobiliary Marker Pattern
  ------------------------------------------------------ */

  else if (

    ca199High

  ) {

    impression =
      "Raised CA 19-9.";

    recommendation =
      "Correlation with pancreatic and hepatobiliary imaging is recommended. Benign biliary obstruction should also be excluded.";

  }

  /*
     β-hCG Pattern
  ------------------------------------------------------ */

  else if (

    bhcgHigh

  ) {

    impression =
      "Raised β-hCG.";

    recommendation =
      "Interpret together with pregnancy status, clinical findings and imaging. Gestational trophoblastic disease and germ cell tumours should be considered where appropriate.";

  }

  /*
     Normal Tumour Marker Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Tumour marker profile is within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation is advised. A normal tumour marker profile does not exclude malignancy.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("within acceptable")

  ) {

    recommendation =
      "Routine clinical correlation is advised. Normal tumour marker concentrations do not exclude malignancy.";

  }

  else if (

    impression.includes("Multiple tumour markers")

  ) {

    recommendation =
      "Interpret all tumour marker results alongside the patient's history, physical examination, imaging findings and histopathological investigations. Tumour markers should not be used as standalone diagnostic tests.";

  }

  else if (

    impression.includes("prostate-specific antigen")

  ) {

    recommendation =
      "Correlation with digital rectal examination, prostate MRI and, where indicated, prostate biopsy is recommended. PSA is also elevated in benign prostatic hyperplasia and prostatitis.";

  }

  else if (

    impression.includes("alpha-fetoprotein")

  ) {

    recommendation =
      "Interpret together with liver function tests, liver ultrasound or CT/MRI, hepatitis serology and clinical findings. Pregnancy and germ cell tumours should also be considered.";

  }

  else if (

    impression.includes("carcinoembryonic antigen")

  ) {

    recommendation =
      "CEA is primarily useful for monitoring known malignancy rather than screening. Correlate with gastrointestinal imaging, colonoscopy and smoking history where appropriate.";

  }

  else if (

    impression.includes("CA 125")

  ) {

    recommendation =
      "Correlate with pelvic ultrasound or CT imaging and specialist gynaecological assessment. Benign causes including endometriosis, menstruation and pelvic inflammatory disease should be excluded.";

  }

  else if (

    impression.includes("CA 15-3")

  ) {

    recommendation =
      "CA 15-3 is mainly useful for monitoring breast carcinoma. Correlate with breast imaging and oncological assessment where clinically indicated.";

  }

  else if (

    impression.includes("CA 19-9")

  ) {

    recommendation =
      "Correlation with pancreatic and hepatobiliary imaging is recommended. Exclude benign biliary obstruction and pancreatitis before attributing the elevation to malignancy.";

  }

  else if (

    impression.includes("β-hCG")

  ) {

    recommendation =
      "Interpret together with pregnancy status, pelvic imaging and clinical findings. Gestational trophoblastic disease and germ cell tumours should be considered where appropriate.";

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