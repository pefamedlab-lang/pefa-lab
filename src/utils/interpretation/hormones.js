import {
  createInterpretation,
  defaultInterpretation,
  getNumericResult,
} from "./helpers";

/* ==========================================================
   HORMONE / ENDOCRINOLOGY INTERPRETATION ENGINE
========================================================== */

export function interpretHormones(
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

  const lower =
    testName.toLowerCase();

  /* ======================================================
     THYROID FUNCTION TEST
  ====================================================== */

  if (

    lower.includes("thyroid") ||

    lower.includes("tft")

  ) {

    const tsh =
      getNumericResult(
        resultMap,
        "TSH"
      );

    const ft4 =
      getNumericResult(
        resultMap,
        "Free T4"
      ) ??
      getNumericResult(
        resultMap,
        "FT4"
      );

    const ft3 =
      getNumericResult(
        resultMap,
        "Free T3"
      ) ??
      getNumericResult(
        resultMap,
        "FT3"
      );

    if (

      tsh !== null &&
      tsh > 4.5 &&
      ft4 !== null &&
      ft4 < 10

    ) {

      return createInterpretation({

        interpretation:
          "The thyroid profile demonstrates elevated TSH with reduced Free T4, consistent with primary hypothyroidism.",

        impression:
          "Features suggestive of primary hypothyroidism.",

        recommendation:
          "Endocrinology review is recommended.",

      });

    }

    if (

      tsh !== null &&
      tsh < 0.4 &&
      ft4 !== null &&
      ft4 > 22

    ) {

      return createInterpretation({

        interpretation:
          "Suppressed TSH with elevated thyroid hormone levels is suggestive of hyperthyroidism.",

        impression:
          "Features suggestive of hyperthyroidism.",

        recommendation:
          "Clinical correlation and endocrine evaluation are advised.",

      });

    }

    return createInterpretation({

      interpretation:
        "The thyroid profile should be interpreted together with the patient's symptoms and clinical examination.",

      impression:
        "Thyroid function reviewed.",

      recommendation:
        "Clinical correlation advised.",

    });

  }

  /* ======================================================
     PSA
  ====================================================== */

  if (

    lower.includes("psa")

  ) {

    const psa =
      getNumericResult(
        resultMap,
        "PSA"
      );

    if (psa !== null) {

      if (psa > 4) {

        return createInterpretation({

          interpretation:
            "The prostate specific antigen level is elevated.",

          impression:
            "Raised PSA.",

          recommendation:
            "Interpret alongside digital rectal examination and urological assessment.",

        });

      }

      return createInterpretation({

        interpretation:
          "The prostate specific antigen level is within expected limits.",

        impression:
          "Normal PSA.",

        recommendation:
          "Routine clinical follow-up where indicated.",

      });

    }

  }

  /* ======================================================
     β-hCG
  ====================================================== */

  if (

    lower.includes("hcg")

  ) {

    const hcg =
      getNumericResult(
        resultMap,
        "β-hCG"
      ) ??
      getNumericResult(
        resultMap,
        "Beta HCG"
      ) ??
      getNumericResult(
        resultMap,
        "HCG"
      );

    if (

      hcg !== null &&
      hcg >= 25

    ) {

      return createInterpretation({

        interpretation:
          "The β-hCG level is compatible with pregnancy where clinically appropriate.",

        impression:
          "Positive pregnancy hormone.",

        recommendation:
          "Clinical correlation and obstetric evaluation are advised.",

      });

    }

    return createInterpretation({

      interpretation:
        "β-hCG level is not suggestive of pregnancy.",

      impression:
        "Negative pregnancy hormone.",

      recommendation:
        "Repeat testing may be considered if clinically indicated.",

    });

  }

  /* ======================================================
     FERTILITY PROFILE
  ====================================================== */

  if (

    lower.includes("fertility") ||

    lower.includes("fsh") ||

    lower.includes("lh") ||

    lower.includes("prolactin") ||

    lower.includes("estradiol") ||

    lower.includes("progesterone") ||

    lower.includes("testosterone")

  ) {

    return createInterpretation({

      interpretation:
        "Hormonal profile should be interpreted with respect to age, sex, menstrual cycle (where applicable), medications and clinical presentation.",

      impression:
        "Hormonal profile reviewed.",

      recommendation:
        "Correlation with reproductive history and endocrine assessment is advised.",

    });

  }

  /* ======================================================
     CORTISOL / INSULIN
  ====================================================== */

  if (

    lower.includes("cortisol") ||

    lower.includes("insulin")

  ) {

    return createInterpretation({

      interpretation:
        "Hormone levels should be interpreted alongside the clinical history, sampling time and relevant endocrine investigations.",

      impression:
        "Endocrine profile reviewed.",

      recommendation:
        "Specialist evaluation is recommended where clinically indicated.",

    });

  }

  /* ======================================================
     DEFAULT
  ====================================================== */

  return defaultInterpretation();

}

export default interpretHormones;