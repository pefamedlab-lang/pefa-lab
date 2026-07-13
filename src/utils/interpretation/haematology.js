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
  ).trim();

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  if (
    report.interpretation?.trim() ||
    report.impression?.trim() ||
    report.recommendation?.trim()
  ) {

    return createInterpretation({

      interpretation:
        report.interpretation,

      impression:
        report.impression,

      recommendation:
        report.recommendation,

    });

  }

  /* ======================================================
     FULL BLOOD COUNT
  ====================================================== */

  if (
    [
      "FBC",
      "CBC",
      "Complete Blood Count",
      "Full Blood Count",
    ].includes(testName)
  ) {

    const hb =
      getNumericResult(
        resultMap,
        "Haemoglobin"
      ) ??
      getNumericResult(
        resultMap,
        "Hemoglobin"
      );

    const wbc =
      getNumericResult(
        resultMap,
        "Total WBC"
      ) ??
      getNumericResult(
        resultMap,
        "WBC"
      );

    const platelets =
      getNumericResult(
        resultMap,
        "Platelets"
      );

    let findings = [];

    if (hb !== null) {

      if (hb < 11) {

        findings.push(
          "reduced haemoglobin level suggesting anaemia"
        );

      }
      else if (hb > 17) {

        findings.push(
          "elevated haemoglobin concentration"
        );

      }

    }

    if (wbc !== null) {

      if (wbc > 11) {

        findings.push(
          "leucocytosis"
        );

      }
      else if (wbc < 4) {

        findings.push(
          "leucopenia"
        );

      }

    }

    if (platelets !== null) {

      if (platelets < 150) {

        findings.push(
          "thrombocytopenia"
        );

      }
      else if (platelets > 450) {

        findings.push(
          "thrombocytosis"
        );

      }

    }

    if (!findings.length) {

      return createInterpretation({

        interpretation:
          "The full blood count parameters are within expected laboratory reference limits.",

        impression:
          "Essentially normal full blood count.",

        recommendation:
          "Interpret together with the patient's clinical findings.",

      });

    }

    return createInterpretation({

      interpretation:
        `The full blood count demonstrates ${findings.join(", ")}.`,

      impression:
        findings
          .map(item =>
            item.charAt(0).toUpperCase() +
            item.slice(1)
          )
          .join("; "),

      recommendation:
        "Clinical correlation and further evaluation are recommended where indicated.",

    });

  }

  /* ======================================================
     ESR
  ====================================================== */

  if (
    testName === "ESR"
  ) {

    const esr =
      getNumericResult(
        resultMap,
        "ESR"
      );

    if (esr === null) {

      return defaultInterpretation();

    }

    if (esr <= 20) {

      return createInterpretation({

        interpretation:
          "The erythrocyte sedimentation rate is within normal limits.",

        impression:
          "Normal ESR.",

        recommendation:
          "Interpret alongside the clinical presentation.",

      });

    }

    return createInterpretation({

      interpretation:
        "The erythrocyte sedimentation rate is elevated and may indicate inflammation, infection or other systemic disorders.",

      impression:
        "Raised ESR.",

      recommendation:
        "Clinical correlation is advised.",

    });

  }

  /* ======================================================
     PCV
  ====================================================== */

  if (
    testName === "PCV"
  ) {

    const pcv =
      getNumericResult(
        resultMap,
        "PCV"
      );

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
          "Interpret with hydration status and clinical findings.",

      });

    }

    return createInterpretation({

      interpretation:
        "Packed cell volume is within normal limits.",

      impression:
        "Normal PCV.",

      recommendation:
        "Clinical correlation advised.",

    });

  }

  /* ======================================================
     BLOOD FILM
  ====================================================== */

  if (
    testName
      .toLowerCase()
      .includes("blood film")
  ) {

    return createInterpretation({

      interpretation:
        "Microscopic findings should be interpreted together with the complete blood count and clinical presentation.",

      impression:
        "Peripheral blood film reviewed.",

      recommendation:
        "Clinical correlation is advised.",

    });

  }

  /* ======================================================
     DEFAULT
  ====================================================== */

  return defaultInterpretation();

}

export default interpretHaematology;