import {
  createInterpretation,
  defaultInterpretation,
  getNumericResult,
} from "./helpers";

/* ==========================================================
   HAEMATOLOGY INTERPRETATION ENGINE
========================================================== */

export function interpretHaematology(
  report = {},
  resultMap = {}
) {
  const testName = (
    report.test_type ||
    report.test_name ||
    ""
  )
    .trim()
    .toLowerCase();

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  if (
    report.interpretation?.trim() ||
    report.impression?.trim() ||
    report.recommendation?.trim()
  ) {
    return createInterpretation({
      interpretation: report.interpretation,
      impression: report.impression,
      recommendation: report.recommendation,
    });
  }

  /* ======================================================
     FULL BLOOD COUNT
  ====================================================== */

  if (
    [
      "fbc",
      "cbc",
      "complete blood count",
      "full blood count",
    ].includes(testName)
  ) {
    const hb =
      getNumericResult(resultMap, "Haemoglobin") ??
      getNumericResult(resultMap, "Hemoglobin");

    const pcv =
      getNumericResult(resultMap, "PCV") ??
      getNumericResult(resultMap, "HCT");

    const rbc =
      getNumericResult(resultMap, "RBC");

    const mcv =
      getNumericResult(resultMap, "MCV");

    const mch =
      getNumericResult(resultMap, "MCH");

    const mchc =
      getNumericResult(resultMap, "MCHC");

    const rdw =
      getNumericResult(resultMap, "RDW");

    const wbc =
      getNumericResult(resultMap, "Total WBC") ??
      getNumericResult(resultMap, "WBC");

    const neutrophils =
      getNumericResult(resultMap, "Neutrophils");

    const lymphocytes =
      getNumericResult(resultMap, "Lymphocytes");

    const eosinophils =
      getNumericResult(resultMap, "Eosinophils");

    const platelets =
      getNumericResult(resultMap, "Platelets");

    let interpretation = "";
    let impression = "";
    let recommendation = "";

    /* ---------------- Hemoglobin ---------------- */

    if (hb !== null) {
      if (hb < 11) {
        interpretation +=
          "Haemoglobin is reduced, indicating anaemia.\n\n";
      } else if (hb > 17) {
        interpretation +=
          "Haemoglobin is elevated.\n\n";
      } else {
        interpretation +=
          "Haemoglobin is within the reference interval.\n\n";
      }
    }

    /* ---------------- RBC Indices ---------------- */

    if (mcv !== null) {
      if (mcv < 80) {
        interpretation +=
          "MCV indicates microcytosis.\n\n";
      } else if (mcv > 100) {
        interpretation +=
          "MCV indicates macrocytosis.\n\n";
      } else {
        interpretation +=
          "MCV is within the reference interval.\n\n";
      }
    }

    if (mch !== null && mch < 27) {
      interpretation +=
        "Reduced MCH indicates hypochromia.\n\n";
    }

    if (rdw !== null && rdw > 15) {
      interpretation +=
        "RDW is increased, indicating anisocytosis.\n\n";
    }

    /* ---------------- WBC ---------------- */

    if (wbc !== null) {
      if (wbc < 4) {
        interpretation +=
          "Total white blood cell count is reduced (leucopenia).\n\n";
      } else if (wbc > 11) {
        interpretation +=
          "Total white blood cell count is elevated (leucocytosis).\n\n";
      } else {
        interpretation +=
          "White blood cell count is within the reference interval.\n\n";
      }
    }

    /* ---------------- Differential ---------------- */

    if (neutrophils !== null) {
      if (neutrophils > 70) {
        interpretation +=
          "Neutrophilia is present.\n\n";
      } else if (neutrophils < 40) {
        interpretation +=
          "Neutropenia is present.\n\n";
      }
    }

    if (lymphocytes !== null) {
      if (lymphocytes > 45) {
        interpretation +=
          "Lymphocytosis is present.\n\n";
      } else if (lymphocytes < 20) {
        interpretation +=
          "Lymphopenia is present.\n\n";
      }
    }

    if (eosinophils !== null && eosinophils > 6) {
      interpretation +=
        "Eosinophilia is present.\n\n";
    }

    /* ---------------- Platelets ---------------- */

    if (platelets !== null) {
      if (platelets < 150) {
        interpretation +=
          "Platelet count is reduced (thrombocytopenia).\n\n";
      } else if (platelets > 450) {
        interpretation +=
          "Platelet count is elevated (thrombocytosis).\n\n";
      } else {
        interpretation +=
          "Platelet count is within the reference interval.\n\n";
      }
    }

    /* ---------------- Impression ---------------- */

    if (
      hb !== null &&
      hb < 11 &&
      mcv !== null &&
      mcv < 80
    ) {
      impression =
        "Microcytic hypochromic anaemia.";
      recommendation =
        "Iron studies are recommended together with clinical evaluation for chronic blood loss or iron deficiency.";
    } else if (
      hb !== null &&
      hb < 11 &&
      mcv !== null &&
      mcv > 100
    ) {
      impression =
        "Macrocytic anaemia.";
      recommendation =
        "Assess vitamin B12, folate and thyroid function where clinically indicated.";
    } else if (
      wbc !== null &&
      wbc > 11 &&
      neutrophils !== null &&
      neutrophils > 70
    ) {
      impression =
        "Neutrophilic leucocytosis.";
      recommendation =
        "Findings may indicate acute bacterial infection or inflammation. Correlate clinically.";
    } else if (
      wbc !== null &&
      wbc > 11 &&
      lymphocytes !== null &&
      lymphocytes > 45
    ) {
      impression =
        "Lymphocytosis.";
      recommendation =
        "Clinical correlation for viral infection or lymphoproliferative disorders is advised.";
    } else if (
      platelets !== null &&
      platelets < 150
    ) {
      impression =
        "Thrombocytopenia.";
      recommendation =
        "Evaluate for bleeding risk and underlying causes.";
    } else if (
      platelets !== null &&
      platelets > 450
    ) {
      impression =
        "Thrombocytosis.";
      recommendation =
        "Correlate clinically and investigate reactive or myeloproliferative causes.";
    } else {
      impression =
        "Full blood count is within acceptable laboratory limits.";
      recommendation =
        "Routine clinical correlation.";
    }

    return createInterpretation({
      interpretation: interpretation.trim(),
      impression,
      recommendation,
    });
  }

  /* ======================================================
     ESR
  ====================================================== */

  if (testName === "esr") {
    const esr =
      getNumericResult(resultMap, "ESR");

    if (esr === null) {
      return defaultInterpretation();
    }

    if (esr <= 20) {
      return createInterpretation({
        interpretation:
          "Erythrocyte sedimentation rate is within the reference interval.",
        impression:
          "Normal ESR.",
        recommendation:
          "Routine clinical correlation.",
      });
    }

    return createInterpretation({
      interpretation:
        "Erythrocyte sedimentation rate is elevated, supporting the presence of inflammation or other systemic disease.",
      impression:
        "Raised ESR.",
      recommendation:
        "Interpret alongside CRP and the clinical presentation.",
    });
  }

  /* ======================================================
     PCV
  ====================================================== */

  if (testName === "pcv") {
    const pcv =
      getNumericResult(resultMap, "PCV");

    if (pcv === null) {
      return defaultInterpretation();
    }

    if (pcv < 30) {
      return createInterpretation({
        interpretation:
          "Packed cell volume is reduced, suggesting anaemia.",
        impression:
          "Low PCV.",
        recommendation:
          "Further evaluation of anaemia is recommended.",
      });
    }

    if (pcv > 54) {
      return createInterpretation({
        interpretation:
          "Packed cell volume is elevated.",
        impression:
          "Raised PCV.",
        recommendation:
          "Interpret with hydration status and evaluate for polycythaemia where appropriate.",
      });
    }

    return createInterpretation({
      interpretation:
        "Packed cell volume is within the reference interval.",
      impression:
        "Normal PCV.",
      recommendation:
        "Routine clinical correlation.",
    });
  }

  /* ======================================================
     BLOOD FILM
  ====================================================== */

  if (testName.includes("blood film")) {
    return createInterpretation({
      interpretation:
        "Peripheral blood film findings should be interpreted together with the full blood count and the patient's clinical presentation.",
      impression:
        "Peripheral blood film reviewed.",
      recommendation:
        "Clinical correlation is recommended.",
    });
  }

  /* ======================================================
     DEFAULT
  ====================================================== */

  return defaultInterpretation();
}

export default interpretHaematology;