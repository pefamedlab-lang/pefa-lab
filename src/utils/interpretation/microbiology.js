import {
  createInterpretation,
  defaultInterpretation,
} from "./helpers";

/* ==========================================================
   MICROBIOLOGY INTERPRETATION ENGINE
========================================================== */

export function interpretMicrobiology(
  report = {},
  resultMap = {}
) {

  const data =
    report.result_data ||
    report.result ||
    {};

  let result = data;

  if (typeof result === "string") {

    try {

      result = JSON.parse(result);

    }

    catch {

      result = {};

    }

  }

  const specimen = String(

    result.specimen ||

    report.specimen ||

    ""

  ).toLowerCase();

  const organism = (

    result.organism ||

    result.organismIsolated ||

    "No Growth"

  ).trim();

  const sensitivity =
    result.sensitivity || [];

  const interpretation =
    report.interpretation?.trim();

  const impression =
    report.impression?.trim();

  const recommendation =
    report.recommendation?.trim();

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  if (

    interpretation ||

    impression ||

    recommendation

  ) {

    return createInterpretation({

      interpretation,

      impression,

      recommendation,

    });

  }

  /* ======================================================
     NO GROWTH
  ====================================================== */

  if (

    organism.toLowerCase() === "no growth" ||

    organism.toLowerCase() === "nil growth" ||

    organism.toLowerCase() === "sterile"

  ) {

    return createInterpretation({

      interpretation:

        "No pathogenic organism was isolated after the recommended incubation period.",

      impression:

        "Culture negative.",

      recommendation:

        "Interpret alongside clinical findings. Repeat culture if symptoms persist or antimicrobial therapy has already commenced.",

    });

  }

  /* ======================================================
     ORGANISM ISOLATED
  ====================================================== */

  let interpretationText =

    `${organism} was isolated from the submitted ${

      specimen || "specimen"

    }.`;

  if (sensitivity.length) {

    const sensitive = sensitivity

      .filter(

        item =>

          String(

            item.result

          ).toUpperCase() === "S"

      )

      .map(

        item => item.antibiotic

      );

    const resistant = sensitivity

      .filter(

        item =>

          String(

            item.result

          ).toUpperCase() === "R"

      )

      .map(

        item => item.antibiotic

      );

    if (sensitive.length) {

      interpretationText +=

        ` The isolate is susceptible to ${

          sensitive.join(", ")

        }.`;

    }

    if (resistant.length) {

      interpretationText +=

        ` Resistance was demonstrated to ${

          resistant.join(", ")

        }.`;

    }

  }

  /* ======================================================
     SPECIMEN SPECIFIC IMPRESSION
  ====================================================== */

  let finalImpression =
    "Positive bacterial culture.";

  if (

    specimen.includes("urine")

  ) {

    finalImpression =

      "Findings are consistent with a urinary tract infection.";

  }

  else if (

    specimen.includes("stool")

  ) {

    finalImpression =

      "Enteric pathogen isolated.";

  }

  else if (

    specimen.includes("blood")

  ) {

    finalImpression =

      "Positive blood culture.";

  }

  else if (

    specimen.includes("hvs")

  ) {

    finalImpression =

      "Vaginal pathogen isolated.";

  }

  else if (

    specimen.includes("wound")

  ) {

    finalImpression =

      "Wound infection demonstrated.";

  }

  return createInterpretation({

    interpretation:
      interpretationText,

    impression:
      finalImpression,

    recommendation:
      "Antimicrobial therapy should be guided by the susceptibility pattern together with the patient's clinical condition.",

  });

}

/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default interpretMicrobiology;