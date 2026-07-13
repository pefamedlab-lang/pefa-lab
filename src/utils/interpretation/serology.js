import {
  createInterpretation,
  defaultInterpretation,
} from "./helpers";

/* ==========================================================
   SEROLOGY INTERPRETATION ENGINE
========================================================== */

export function interpretSerology(
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

  const values = Object.values(resultMap);

  if (!values.length) {

    return defaultInterpretation();

  }

  const result = String(

    values[0]?.result ||

    ""

  ).toLowerCase();

  /* ======================================================
     HIV
  ====================================================== */

  if (

    testName.toLowerCase().includes("hiv")

  ) {

    if (

      result.includes("non") ||

      result.includes("negative")

    ) {

      return createInterpretation({

        interpretation:
          "No serological evidence of HIV antibodies/antigen was detected by the assay performed.",

        impression:
          "HIV screen: Non-reactive.",

        recommendation:
          "Repeat testing may be indicated where recent exposure is suspected.",

      });

    }

    if (

      result.includes("reactive") ||

      result.includes("positive")

    ) {

      return createInterpretation({

        interpretation:
          "Reactive HIV screening result obtained. Screening assays require confirmation according to national testing algorithms.",

        impression:
          "Reactive HIV screening test.",

        recommendation:
          "Confirmatory testing is recommended before establishing diagnosis.",

      });

    }

  }

  /* ======================================================
     HBsAg
  ====================================================== */

  if (

    testName.toLowerCase().includes("hbsag")

  ) {

    if (

      result.includes("negative") ||

      result.includes("non")

    ) {

      return createInterpretation({

        interpretation:
          "Hepatitis B surface antigen was not detected.",

        impression:
          "HBsAg Negative.",

        recommendation:
          "Interpret alongside vaccination history and clinical findings.",

      });

    }

    if (

      result.includes("positive") ||

      result.includes("reactive")

    ) {

      return createInterpretation({

        interpretation:
          "Hepatitis B surface antigen was detected, suggesting current Hepatitis B infection.",

        impression:
          "HBsAg Positive.",

        recommendation:
          "Further evaluation including HBV profile and liver assessment is recommended.",

      });

    }

  }

  /* ======================================================
     HCV
  ====================================================== */

  if (

    testName.toLowerCase().includes("hcv")

  ) {

    if (

      result.includes("negative") ||

      result.includes("non")

    ) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Hepatitis C infection was detected.",

        impression:
          "HCV antibody: Non-reactive.",

        recommendation:
          "Clinical correlation advised where recent exposure is suspected.",

      });

    }

    if (

      result.includes("positive") ||

      result.includes("reactive")

    ) {

      return createInterpretation({

        interpretation:
          "Hepatitis C antibody was detected.",

        impression:
          "Reactive HCV antibody.",

        recommendation:
          "HCV RNA testing is recommended to determine active infection.",

      });

    }

  }

  /* ======================================================
     VDRL / RPR
  ====================================================== */

  if (

    testName.toLowerCase().includes("vdrl") ||

    testName.toLowerCase().includes("rpr")

  ) {

    if (

      result.includes("negative") ||

      result.includes("non")

    ) {

      return createInterpretation({

        interpretation:
          "No serological evidence of syphilis was detected.",

        impression:
          "Non-reactive syphilis screen.",

        recommendation:
          "Interpret with clinical findings where appropriate.",

      });

    }

    if (

      result.includes("positive") ||

      result.includes("reactive")

    ) {

      return createInterpretation({

        interpretation:
          "Reactive syphilis screening result obtained.",

        impression:
          "Reactive syphilis screen.",

        recommendation:
          "Treponemal confirmatory testing is recommended.",

      });

    }

  }

  /* ======================================================
     WIDAL
  ====================================================== */

  if (

    testName.toLowerCase().includes("widal")

  ) {

    return createInterpretation({

      interpretation:
        "Widal test results should be interpreted together with clinical findings and local baseline antibody titres.",

      impression:
        "Interpret with caution.",

      recommendation:
        "Blood culture remains the preferred investigation where typhoid fever is suspected.",

    });

  }

  /* ======================================================
     DEFAULT POSITIVE / NEGATIVE
  ====================================================== */

  if (

    result.includes("negative") ||

    result.includes("non")

  ) {

    return createInterpretation({

      interpretation:
        "The tested serological marker was not detected.",

      impression:
        "Negative serological result.",

      recommendation:
        "Clinical correlation advised.",

    });

  }

  if (

    result.includes("positive") ||

    result.includes("reactive")

  ) {

    return createInterpretation({

      interpretation:
        "The tested serological marker was detected.",

      impression:
        "Positive serological result.",

      recommendation:
        "Interpret alongside clinical findings and confirmatory testing where appropriate.",

    });

  }

  return defaultInterpretation();

}

export default interpretSerology;