import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   WIDAL TEST INTERPRETATION ENGINE

   Detects antibodies against:

   Salmonella enterica serovar Typhi
      • O Antigen
      • H Antigen

   Salmonella Paratyphi A
      • AH Antigen

   Salmonella Paratyphi B
      • BH Antigen

   Interpretation Notes
   ----------------------------
   • Endemic vs non-endemic regions
   • Single titre interpretation
   • Significant titre
   • Rising titre
   • Past infection
   • Vaccination effect
   • Cross-reactivity
   • Recommend blood culture where indicated

========================================================== */

export default function interpretWidal(

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

  const typhiO =
    getResult(resultMap, "S. Typhi O") ??
    getResult(resultMap, "Typhi O") ??
    "";

  const typhiH =
    getResult(resultMap, "S. Typhi H") ??
    getResult(resultMap, "Typhi H") ??
    "";

  const paraAH =
    getResult(resultMap, "Paratyphi AH") ??
    "";

  const paraBH =
    getResult(resultMap, "Paratyphi BH") ??
    "";

  /* ======================================================
     HELPER
  ====================================================== */

  function extractTitre(value) {

    if (!value) return null;

    const match =
      String(value).match(/1\s*:\s*(\d+)/i);

    if (!match) return null;

    return Number(match[1]);

  }

  const oTitre =
    extractTitre(typhiO);

  const hTitre =
    extractTitre(typhiH);

  const ahTitre =
    extractTitre(paraAH);

  const bhTitre =
    extractTitre(paraBH);

  /* ======================================================
     REFERENCE VALUES

     NOTE:
     These values should ideally be configurable
     according to local laboratory baseline titres.
  ====================================================== */

  const SIGNIFICANT_TITRE = 160;

  /* ======================================================
     FLAGS
  ====================================================== */

  const oPositive =
    oTitre !== null &&
    oTitre >= SIGNIFICANT_TITRE;

  const hPositive =
    hTitre !== null &&
    hTitre >= SIGNIFICANT_TITRE;

  const ahPositive =
    ahTitre !== null &&
    ahTitre >= SIGNIFICANT_TITRE;

  const bhPositive =
    bhTitre !== null &&
    bhTitre >= SIGNIFICANT_TITRE;

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";
  /* ======================================================
     TYPHI O ANTIGEN
  ====================================================== */

  if (oTitre !== null) {

    if (oPositive) {

      interpretation +=
        `Salmonella Typhi O antibody titre is 1:${oTitre}, which is at or above the laboratory significant titre. Elevated O antibodies may suggest recent or active Salmonella Typhi infection when interpreted with compatible clinical findings.\n\n`;

    } else {

      interpretation +=
        `Salmonella Typhi O antibody titre is 1:${oTitre}, which is below the laboratory significant titre.\n\n`;

    }

  }

  /* ======================================================
     TYPHI H ANTIGEN
  ====================================================== */

  if (hTitre !== null) {

    if (hPositive) {

      interpretation +=
        `Salmonella Typhi H antibody titre is 1:${hTitre}, which is at or above the laboratory significant titre. Elevated H antibodies may reflect current infection, previous infection or prior vaccination.\n\n`;

    } else {

      interpretation +=
        `Salmonella Typhi H antibody titre is 1:${hTitre}, which is below the laboratory significant titre.\n\n`;

    }

  }

  /* ======================================================
     PARATYPHI A (AH)
  ====================================================== */

  if (ahTitre !== null) {

    if (ahPositive) {

      interpretation +=
        `Salmonella Paratyphi A (AH) antibody titre is 1:${ahTitre}, suggesting exposure to Salmonella Paratyphi A. Correlate with clinical findings.\n\n`;

    } else {

      interpretation +=
        `Salmonella Paratyphi A (AH) antibody titre is 1:${ahTitre}, below the laboratory significant titre.\n\n`;

    }

  }

  /* ======================================================
     PARATYPHI B (BH)
  ====================================================== */

  if (bhTitre !== null) {

    if (bhPositive) {

      interpretation +=
        `Salmonella Paratyphi B (BH) antibody titre is 1:${bhTitre}, suggesting exposure to Salmonella Paratyphi B. Correlate clinically.\n\n`;

    } else {

      interpretation +=
        `Salmonella Paratyphi B (BH) antibody titre is 1:${bhTitre}, below the laboratory significant titre.\n\n`;

    }

  }

  /* ======================================================
     GENERAL WIDAL COMMENTS
  ====================================================== */

  if (

    oPositive ||
    hPositive ||
    ahPositive ||
    bhPositive

  ) {

    interpretation +=
      "A single significant Widal titre is supportive but not diagnostic of enteric fever. Results should always be interpreted together with the patient's clinical presentation and local baseline antibody titres.\n\n";

  }

  if (

    !oPositive &&
    !hPositive &&
    !ahPositive &&
    !bhPositive

  ) {

    interpretation +=
      "No antibody titre reaches the laboratory significant threshold. This does not completely exclude early enteric fever, particularly during the first week of illness.\n\n";

  }

  interpretation +=
    "The Widal test has limited specificity and sensitivity. False-positive reactions may occur because of previous Salmonella infection, vaccination, malaria, other Gram-negative infections and cross-reacting antibodies.\n\n";

  interpretation +=
    "Whenever possible, interpretation should be supported by blood culture, stool culture, bone marrow culture (where indicated) and other relevant laboratory investigations.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NEGATIVE WIDAL TEST
  ---------------------------------------------------------
  */

  if (

    !oPositive &&
    !hPositive &&
    !ahPositive &&
    !bhPositive

  ) {

    impression =
      "Widal test is not suggestive of enteric fever.";

    recommendation =
      "If clinical suspicion remains high, repeat serology after 5–7 days or perform blood culture where available.";

  }

  /*
  ---------------------------------------------------------
  PROBABLE ACUTE TYPHOID FEVER
  ---------------------------------------------------------
  */

  else if (

    oPositive &&
    hPositive

  ) {

    impression =
      "Serological findings are suggestive of enteric fever (Salmonella Typhi).";

    recommendation =
      "Recommend blood culture (preferably before antibiotic therapy) where feasible. Correlate with clinical findings and local epidemiology.";

  }

  /*
  ---------------------------------------------------------
  RECENT / ACTIVE INFECTION
  ---------------------------------------------------------
  */

  else if (

    oPositive &&
    !hPositive

  ) {

    impression =
      "Raised Salmonella Typhi O antibody titre suggests recent or active Salmonella Typhi infection.";

    recommendation =
      "Interpret together with clinical findings. Blood culture is recommended for confirmation.";

  }

  /*
  ---------------------------------------------------------
  PAST INFECTION / VACCINATION
  ---------------------------------------------------------
  */

  else if (

    hPositive &&
    !oPositive

  ) {

    impression =
      "Raised Salmonella Typhi H antibody titre may reflect previous infection, immunization or resolving infection.";

    recommendation =
      "Interpret with clinical history. A single elevated H titre alone is insufficient to diagnose acute enteric fever.";

  }

  /*
  ---------------------------------------------------------
  PARATYPHI A
  ---------------------------------------------------------
  */

  else if (

    ahPositive &&
    !bhPositive

  ) {

    impression =
      "Serological findings suggest possible Salmonella Paratyphi A infection.";

    recommendation =
      "Recommend blood culture for organism identification and correlate clinically.";

  }

  /*
  ---------------------------------------------------------
  PARATYPHI B
  ---------------------------------------------------------
  */

  else if (

    bhPositive &&
    !ahPositive

  ) {

    impression =
      "Serological findings suggest possible Salmonella Paratyphi B infection.";

    recommendation =
      "Recommend blood culture for confirmation and correlate with the patient's clinical presentation.";

  }

  /*
  ---------------------------------------------------------
  MIXED PARATYPHI
  ---------------------------------------------------------
  */

  else if (

    ahPositive &&
    bhPositive

  ) {

    impression =
      "Antibodies to both Salmonella Paratyphi A and B are detected.";

    recommendation =
      "Mixed antibody responses should be interpreted cautiously because cross-reactivity may occur. Culture confirmation is recommended.";

  }

  /*
  ---------------------------------------------------------
  MULTIPLE SIGNIFICANT ANTIBODIES
  ---------------------------------------------------------
  */

  else if (

    (
      oPositive ? 1 : 0
    ) +

    (
      hPositive ? 1 : 0
    ) +

    (
      ahPositive ? 1 : 0
    ) +

    (
      bhPositive ? 1 : 0
    ) >= 3

  ) {

    impression =
      "Multiple significant Salmonella antibody titres detected.";

    recommendation =
      "Interpret cautiously. Cross-reactivity and previous exposure should be considered. Blood culture remains the preferred confirmatory investigation.";

  }

  /*
  ---------------------------------------------------------
  GENERAL POSITIVE WIDAL
  ---------------------------------------------------------
  */

  else {

    impression =
      "Positive Widal serology.";

    recommendation =
      "Interpret together with clinical findings, local baseline titres and culture results where available.";

  }

  /* ======================================================
     PAIRED SERA COMMENT
  ====================================================== */

  interpretation +=
    "A single Widal result cannot reliably distinguish acute infection from previous exposure in endemic regions.\n\n";

  interpretation +=
    "Demonstration of a fourfold or greater rise in antibody titre between acute and convalescent serum samples collected 7–14 days apart provides stronger evidence of recent Salmonella infection.\n\n";

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "Widal test is not suggestive of enteric fever.":

      recommendation =
        "Enteric fever is not supported serologically. If symptoms are of short duration or clinical suspicion remains high, repeat Widal testing after 5–7 days and obtain blood culture where available.";

      break;

    case "Serological findings are suggestive of enteric fever (Salmonella Typhi).":

      recommendation =
        "Correlate with clinical features. Blood culture obtained before antibiotic therapy remains the preferred confirmatory investigation. Stool or bone marrow culture may also be appropriate in selected cases.";

      break;

    case "Raised Salmonella Typhi O antibody titre suggests recent or active Salmonella Typhi infection.":

      recommendation =
        "Interpret together with clinical findings and local baseline titres. Blood culture is recommended for confirmation.";

      break;

    case "Raised Salmonella Typhi H antibody titre may reflect previous infection, immunization or resolving infection.":

      recommendation =
        "An isolated elevated H antibody titre is insufficient for the diagnosis of acute enteric fever. Correlate with vaccination history, previous infection and clinical findings.";

      break;

    case "Serological findings suggest possible Salmonella Paratyphi A infection.":

      recommendation =
        "Recommend blood culture for definitive organism identification. Correlate with compatible clinical findings.";

      break;

    case "Serological findings suggest possible Salmonella Paratyphi B infection.":

      recommendation =
        "Recommend blood culture for confirmation and appropriate antimicrobial management where indicated.";

      break;

    case "Antibodies to both Salmonella Paratyphi A and B are detected.":

      recommendation =
        "Mixed antibody responses should be interpreted cautiously because cross-reactivity may occur. Culture confirmation is strongly recommended.";

      break;

    case "Multiple significant Salmonella antibody titres detected.":

      recommendation =
        "Interpret with caution because previous exposure and cross-reactivity are common in endemic regions. Culture confirmation is recommended.";

      break;

    case "Positive Widal serology.":

      recommendation =
        "Interpret together with symptoms, duration of illness, local baseline titres and microbiological culture results.";

      break;

    default:

      recommendation =
        recommendation ||
        "Interpret Widal results together with clinical findings and confirm with microbiological culture whenever possible.";

  }

  /* ======================================================
     IMPORTANT LIMITATIONS
  ====================================================== */

  interpretation +=
    "The diagnostic value of the Widal test depends on locally established baseline antibody titres. Laboratories should validate their own significant cut-off titres according to regional epidemiology.\n\n";

  interpretation +=
    "False-positive reactions may occur following previous Salmonella infection, vaccination, malaria, dengue, brucellosis, chronic liver disease and infections caused by other Enterobacterales.\n\n";

  interpretation +=
    "False-negative results may occur during the early stage of infection, following prior antibiotic therapy or in immunocompromised patients.\n\n";

  /* ======================================================
     GOOD LABORATORY PRACTICE
  ====================================================== */

  interpretation +=
    "Whenever feasible, blood culture obtained before initiation of antimicrobial therapy remains the reference laboratory method for confirming enteric fever. Stool, urine or bone marrow cultures may provide additional diagnostic information depending on the stage of illness.\n\n";

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Widal test results should never be interpreted in isolation. Final diagnosis should be based on clinical assessment, epidemiological risk factors, microbiological culture, molecular methods where available and serial serological findings.\n";

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