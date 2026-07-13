import interpretChemistry from "./chemistry";
import interpretHaematology from "./haematology";
import interpretMicrobiology from "./microbiology";
import interpretSerology from "./serology";
import interpretHormones from "./hormones";

import {
  createInterpretation,
  defaultInterpretation,
  buildResultMap,
} from "./helpers";

/* ==========================================================
   DEPARTMENT DETECTION
========================================================== */

function detectDepartment(report = {}) {

  const value = (

    report.department ||

    report.department_name ||

    report.test_group ||

    report.category ||

    report.test_category ||

    report.test_type ||

    report.test_name ||

    ""

  ).toLowerCase();

  /* ======================================================
     CHEMISTRY
  ====================================================== */

  if (

    value.includes("chem") ||

    value.includes("lft") ||

    value.includes("kft") ||

    value.includes("lipid") ||

    value.includes("electrolyte") ||

    value.includes("glucose") ||

    value.includes("diabetes")

  ) {

    return "chemistry";

  }

  /* ======================================================
     HAEMATOLOGY
  ====================================================== */

  if (

    value.includes("haem") ||

    value.includes("hemat") ||

    value.includes("cbc") ||

    value.includes("fbc") ||

    value.includes("pcv") ||

    value.includes("esr") ||

    value.includes("blood film") ||

    value.includes("reticulocyte")

  ) {

    return "haematology";

  }

  /* ======================================================
     MICROBIOLOGY
  ====================================================== */

  if (

    value.includes("culture") ||

    value.includes("mcs") ||

    value.includes("urine") ||

    value.includes("stool") ||

    value.includes("hvs") ||

    value.includes("swab") ||

    value.includes("micro")

  ) {

    return "microbiology";

  }

  /* ======================================================
     SEROLOGY
  ====================================================== */

  if (

    value.includes("serology") ||

    value.includes("hiv") ||

    value.includes("hbsag") ||

    value.includes("hcv") ||

    value.includes("vdrl") ||

    value.includes("rpr") ||

    value.includes("widal")

  ) {

    return "serology";

  }

  /* ======================================================
     HORMONES
  ====================================================== */

  if (

    value.includes("hormone") ||

    value.includes("thyroid") ||

    value.includes("tft") ||

    value.includes("psa") ||

    value.includes("hcg") ||

    value.includes("fertility") ||

    value.includes("prolactin") ||

    value.includes("fsh") ||

    value.includes("lh") ||

    value.includes("testosterone") ||

    value.includes("progesterone")

  ) {

    return "hormones";

  }

  return "general";

}

/* ==========================================================
   SCIENTIST OVERRIDE
========================================================== */

function hasScientistInterpretation(
  report = {}
) {

  return Boolean(

    report.interpretation?.trim() ||

    report.impression?.trim() ||

    report.comment?.trim() ||

    report.recommendation?.trim()

  );

}

/* ==========================================================
   MAIN ENGINE
========================================================== */

export function generateInterpretation(

  report = {},

  results = []

) {

  /* ======================================================
     SCIENTIST INTERPRETATION ALWAYS WINS
  ====================================================== */

  if (

    hasScientistInterpretation(report)

  ) {

    return createInterpretation({

      interpretation:
        report.interpretation,

      impression:
        report.impression,

      comment:
        report.comment,

      recommendation:
        report.recommendation,

    });

  }

  /* ======================================================
     BUILD RESULT MAP
  ====================================================== */

  const resultMap =
    buildResultMap(results);

  /* ======================================================
     ROUTE
  ====================================================== */

  switch (

    detectDepartment(report)

  ) {

    case "chemistry":

      return interpretChemistry(

        report,

        resultMap

      );

    case "haematology":

      return interpretHaematology(

        report,

        resultMap

      );

    case "microbiology":

      return interpretMicrobiology(

        report,

        resultMap

      );

    case "serology":

      return interpretSerology(

        report,

        resultMap

      );

    case "hormones":

      return interpretHormones(

        report,

        resultMap

      );

    default:

      return defaultInterpretation();

  }

}

export default generateInterpretation;