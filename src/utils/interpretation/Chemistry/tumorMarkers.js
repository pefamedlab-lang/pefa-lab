import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   TUMOUR MARKER INTERPRETATION ENGINE
========================================================== */

export default function interpretTumorMarkers(

  report = {},

  resultMap = {}

) {

  const psa =
    getNumericResult(
      resultMap,
      "PSA"
    );

  const freePsa =
    getNumericResult(
      resultMap,
      "Free PSA"
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
      "CA-125"
    );

  const ca153 =
    getNumericResult(
      resultMap,
      "CA15-3"
    );

  const ca199 =
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

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     PSA
  ====================================================== */

  if (psa !== null) {

    if (psa < 4.0) {

      interpretation +=
        "Total PSA is within the expected reference interval.\n\n";

    }

    else if (psa < 10) {

      interpretation +=
        "Total PSA is moderately elevated.\n\n";

    }

    else {

      interpretation +=
        "Total PSA is markedly elevated.\n\n";

    }

  }

  /* ======================================================
     FREE PSA RATIO
  ====================================================== */

  if (

    psa !== null &&

    freePsa !== null &&

    psa > 0

  ) {

    const ratio =
      (freePsa / psa) * 100;

    interpretation +=
      `Calculated Free PSA / Total PSA ratio is ${ratio.toFixed(1)}%.\n\n`;

    if (

      psa >= 4 &&
      psa <= 10

    ) {

      if (ratio < 10) {

        interpretation +=
          "A low Free PSA ratio is associated with an increased probability of prostate carcinoma.\n\n";

      }

      else if (ratio < 25) {

        interpretation +=
          "Free PSA ratio falls within an intermediate-risk range.\n\n";

      }

      else {

        interpretation +=
          "Free PSA ratio favours benign prostatic disease.\n\n";

      }

    }

  }

  /* ======================================================
     AFP
  ====================================================== */

  if (afp !== null) {

    if (afp <= 10) {

      interpretation +=
        "AFP is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "AFP is elevated.\n\n";

    }

  }

  /* ======================================================
     CEA
  ====================================================== */

  if (cea !== null) {

    if (cea <= 5) {

      interpretation +=
        "CEA is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CEA is elevated.\n\n";

    }

  }

  /* ======================================================
     CA-125
  ====================================================== */

  if (ca125 !== null) {

    if (ca125 <= 35) {

      interpretation +=
        "CA-125 is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CA-125 is elevated.\n\n";

    }

  }

  /* ======================================================
     CA15-3
  ====================================================== */

  if (ca153 !== null) {

    if (ca153 <= 30) {

      interpretation +=
        "CA15-3 is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CA15-3 is elevated.\n\n";

    }

  }

  /* ======================================================
     CA19-9
  ====================================================== */

  if (ca199 !== null) {

    if (ca199 <= 37) {

      interpretation +=
        "CA19-9 is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CA19-9 is elevated.\n\n";

    }

  }

  /* ======================================================
     β-hCG
  ====================================================== */

  if (bhcg !== null) {

    if (bhcg > 5) {

      interpretation +=
        "β-hCG is elevated.\n\n";

    }

  }

  /* ======================================================
     IMPRESSION
  ====================================================== */

  if (

    psa !== null &&
    psa > 10

  ) {

    impression =
      "Marked PSA elevation.";

    recommendation =
      "Clinical evaluation by a urologist is recommended. Correlate with digital rectal examination, imaging and, where appropriate, prostate biopsy.";

  }

  else if (

    afp !== null &&
    afp > 400

  ) {

    impression =
      "Marked AFP elevation.";

    recommendation =
      "Correlate with liver imaging and clinical assessment for hepatocellular carcinoma or germ cell tumours.";

  }

  else if (

    cea !== null &&
    cea > 10

  ) {

    impression =
      "Elevated CEA.";

    recommendation =
      "Interpret alongside clinical findings and imaging. CEA may be elevated in both malignant and benign conditions.";

  }

  else if (

    ca125 !== null &&
    ca125 > 35

  ) {

    impression =
      "Elevated CA-125.";

    recommendation =
      "Interpret in conjunction with pelvic imaging and clinical findings. Benign gynaecological conditions may also increase CA-125.";

  }

  else if (

    ca153 !== null &&
    ca153 > 30

  ) {

    impression =
      "Elevated CA15-3.";

    recommendation =
      "Interpret alongside breast imaging and clinical evaluation.";

  }

  else if (

    ca199 !== null &&
    ca199 > 37

  ) {

    impression =
      "Elevated CA19-9.";

    recommendation =
      "Clinical correlation with pancreatic and hepatobiliary evaluation is advised.";

  }

  else if (

    bhcg !== null &&
    bhcg > 5

  ) {

    impression =
      "Elevated β-hCG.";

    recommendation =
      "Interpret