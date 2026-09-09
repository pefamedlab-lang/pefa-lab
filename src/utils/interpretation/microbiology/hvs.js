import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   HIGH VAGINAL SWAB (HVS) INTERPRETATION ENGINE

   Physical Examination
   --------------------
   • Appearance
   • Colour
   • Odour

   Microscopy
   --------------------
   • Pus Cells (WBC)
   • RBC
   • Epithelial Cells
   • Yeast Cells
   • Budding Yeast
   • Pseudohyphae
   • Clue Cells
   • Trichomonas vaginalis

   Gram Stain
   --------------------
   • Gram Positive Bacilli (Lactobacilli)
   • Gram Positive Cocci
   • Gram Negative Bacilli
   • Gram Variable Coccobacilli
   • Nugent Score

   Culture
   --------------------
   • Organism Isolated
   • Growth
   • Candida species

   Detects
   --------------------
   • Normal vaginal flora
   • Bacterial vaginosis
   • Vulvovaginal candidiasis
   • Trichomoniasis
   • Mixed vaginitis
   • Aerobic vaginitis
   • Non-specific vaginitis
========================================================== */

export default function interpretHVS(

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
     PHYSICAL FINDINGS
  ====================================================== */

  const appearance =
    getResult(resultMap, "Appearance") ?? "";

  const colour =
    getResult(resultMap, "Colour") ??
    getResult(resultMap, "Color") ??
    "";

  const odour =
    getResult(resultMap, "Odour") ??
    getResult(resultMap, "Odor") ??
    "";

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  const pusCells =
    getNumericResult(resultMap, "Pus Cells") ??
    getNumericResult(resultMap, "WBC");

  const rbc =
    getNumericResult(resultMap, "RBC");

  const epithelial =
    getNumericResult(resultMap, "Epithelial Cells");

  const yeast =
    getResult(resultMap, "Yeast Cells") ?? "";

  const buddingYeast =
    getResult(resultMap, "Budding Yeast") ?? "";

  const pseudohyphae =
    getResult(resultMap, "Pseudohyphae") ?? "";

  const clueCells =
    getResult(resultMap, "Clue Cells") ?? "";

  const trichomonas =
    getResult(resultMap, "Trichomonas vaginalis") ?? "";

  /* ======================================================
     GRAM STAIN
  ====================================================== */

  const lactobacilli =
    getResult(resultMap, "Gram Positive Bacilli") ?? "";

  const gramPositiveCocci =
    getResult(resultMap, "Gram Positive Cocci") ?? "";

  const gramNegativeBacilli =
    getResult(resultMap, "Gram Negative Bacilli") ?? "";

  const gramVariable =
    getResult(resultMap, "Gram Variable Coccobacilli") ?? "";

  const nugent =
    getNumericResult(resultMap, "Nugent Score");

  /* ======================================================
     CULTURE
  ====================================================== */

  const organism =
    getResult(resultMap, "Organism Isolated") ?? "";

  const growth =
    getResult(resultMap, "Growth") ?? "";

  /* ======================================================
     FLAGS
  ====================================================== */

  const inflammation =
    pusCells !== null &&
    pusCells >= 10;

  const haemorrhage =
    rbc !== null &&
    rbc > 5;

  const cluePositive =
    clueCells &&
    !["nil", "none", "negative", "absent"]
      .includes(clueCells.toLowerCase());

  const yeastPositive =
    (
      yeast &&
      !["nil", "none", "negative", "absent"]
      .includes(yeast.toLowerCase())
    ) ||

    (
      buddingYeast &&
      !["nil", "none", "negative", "absent"]
      .includes(buddingYeast.toLowerCase())
    ) ||

    (
      pseudohyphae &&
      !["nil", "none", "negative", "absent"]
      .includes(pseudohyphae.toLowerCase())
    );

  const trichPositive =
    trichomonas &&
    !["nil", "none", "negative", "absent"]
      .includes(trichomonas.toLowerCase());

  const culturePositive =
    organism &&
    !["nil", "none", "no growth"]
      .includes(organism.toLowerCase());

  const bacterialVaginosis =

    cluePositive ||

    (
      nugent !== null &&
      nugent >= 7
    );

  const intermediateFlora =

    nugent !== null &&
    nugent >= 4 &&
    nugent <= 6;

  const normalFlora =

    nugent !== null &&
    nugent <= 3;

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  if (appearance) {

    interpretation +=
      `Specimen appearance: ${appearance}.\n\n`;

  }

  if (colour) {

    const colourText = colour.toLowerCase();

    if (colourText.includes("white")) {

      interpretation +=
        "White vaginal discharge may be physiological or associated with candidiasis.\n\n";

    }

    else if (colourText.includes("yellow")) {

      interpretation +=
        "Yellow vaginal discharge may indicate inflammation or genital tract infection.\n\n";

    }

    else if (

      colourText.includes("green") ||

      colourText.includes("greenish")

    ) {

      interpretation +=
        "Greenish vaginal discharge is commonly associated with Trichomonas vaginalis infection.\n\n";

    }

    else if (

      colourText.includes("grey") ||

      colourText.includes("gray")

    ) {

      interpretation +=
        "Grey vaginal discharge is suggestive of bacterial vaginosis.\n\n";

    }

    else if (

      colourText.includes("blood")

    ) {

      interpretation +=
        "Blood-stained discharge is noted. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        `Discharge colour: ${colour}.\n\n`;

    }

  }

  if (odour) {

    const odourText = odour.toLowerCase();

    if (

      odourText.includes("fish")

    ) {

      interpretation +=
        "A fishy odour is characteristic of bacterial vaginosis.\n\n";

    }

    else if (

      odourText.includes("offensive") ||

      odourText.includes("foul")

    ) {

      interpretation +=
        "An offensive odour suggests vaginal infection.\n\n";

    }

  }

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  if (inflammation) {

    interpretation +=
      `Numerous pus cells (${pusCells}/HPF) indicate significant vaginal inflammation.\n\n`;

  }

  else if (pusCells !== null) {

    interpretation +=
      `Pus cells: ${pusCells}/HPF.\n\n`;

  }

  if (haemorrhage) {

    interpretation +=
      "Red blood cells are present. Correlate with menstruation, trauma or genital tract pathology.\n\n";

  }

  if (epithelial !== null) {

    interpretation +=
      `Epithelial cells: ${epithelial}/HPF.\n\n`;

  }

  /* ======================================================
     YEAST
  ====================================================== */

  if (yeastPositive) {

    interpretation +=
      "Yeast cells and/or pseudohyphae are identified, supporting vulvovaginal candidiasis.\n\n";

  }

  /* ======================================================
     CLUE CELLS
  ====================================================== */

  if (cluePositive) {

    interpretation +=
      "Clue cells are present, supporting bacterial vaginosis.\n\n";

  }

  /* ======================================================
     TRICHOMONAS
  ====================================================== */

  if (trichPositive) {

    interpretation +=
      "Trichomonas vaginalis is identified on wet preparation.\n\n";

  }

  /* ======================================================
     NUGENT SCORE
  ====================================================== */

  if (nugent !== null) {

    if (normalFlora) {

      interpretation +=
        `Nugent score (${nugent}) is consistent with normal vaginal flora.\n\n`;

    }

    else if (intermediateFlora) {

      interpretation +=
        `Nugent score (${nugent}) indicates intermediate vaginal flora.\n\n`;

    }

    else if (bacterialVaginosis) {

      interpretation +=
        `Nugent score (${nugent}) is diagnostic of bacterial vaginosis.\n\n`;

    }

  }

  /* ======================================================
     GRAM STAIN
  ====================================================== */

  if (lactobacilli) {

    interpretation +=
      `Gram-positive bacilli (Lactobacillus flora): ${lactobacilli}.\n\n`;

  }

  if (gramPositiveCocci) {

    interpretation +=
      `Gram-positive cocci observed: ${gramPositiveCocci}.\n\n`;

  }

  if (gramNegativeBacilli) {

    interpretation +=
      `Gram-negative bacilli observed: ${gramNegativeBacilli}.\n\n`;

  }

  if (gramVariable) {

    interpretation +=
      `Gram-variable coccobacilli observed: ${gramVariable}.\n\n`;

  }

  /* ======================================================
     CULTURE
  ====================================================== */

  if (culturePositive) {

    interpretation +=
      `Culture yielded ${organism}.\n\n`;

  }

  else if (

    growth &&
    growth.toLowerCase().includes("no growth")

  ) {

    interpretation +=
      "No significant bacterial growth was obtained on culture.\n\n";

  }

  interpretation +=
    "High vaginal swab findings should always be interpreted together with clinical symptoms, examination findings, pregnancy status and sexually transmitted infection risk assessment.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NORMAL VAGINAL FLORA
  ---------------------------------------------------------
  */

  const noPathogen =

    !yeastPositive &&
    !cluePositive &&
    !trichPositive &&
    !culturePositive &&
    !inflammation;

  if (

    normalFlora &&
    noPathogen

  ) {

    impression =
      "Normal vaginal flora.";

    recommendation =
      "No significant microbiological abnormality detected. Correlate with clinical findings.";

  }

  /*
  ---------------------------------------------------------
  BACTERIAL VAGINOSIS
  ---------------------------------------------------------
  */

  else if (

    bacterialVaginosis &&
    !yeastPositive &&
    !trichPositive

  ) {

    impression =
      "Bacterial vaginosis.";

    recommendation =
      "Clinical management according to current treatment guidelines is recommended. Consider treatment of symptomatic patients.";

  }

  /*
  ---------------------------------------------------------
  INTERMEDIATE FLORA
  ---------------------------------------------------------
  */

  else if (

    intermediateFlora &&
    !yeastPositive &&
    !trichPositive

  ) {

    impression =
      "Intermediate vaginal flora.";

    recommendation =
      "Clinical correlation is recommended. Repeat testing may be considered if symptoms persist.";

  }

  /*
  ---------------------------------------------------------
  VULVOVAGINAL CANDIDIASIS
  ---------------------------------------------------------
  */

  else if (

    yeastPositive &&
    !cluePositive &&
    !trichPositive

  ) {

    impression =
      "Vulvovaginal candidiasis.";

    recommendation =
      "Recommend appropriate antifungal therapy and evaluation for predisposing factors such as diabetes mellitus, pregnancy or recent antibiotic use.";

  }

  /*
  ---------------------------------------------------------
  TRICHOMONIASIS
  ---------------------------------------------------------
  */

  else if (

    trichPositive &&
    !yeastPositive

  ) {

    impression =
      "Trichomoniasis.";

    recommendation =
      "Appropriate antiprotozoal therapy is recommended. Sexual partner evaluation and treatment should also be considered.";

  }

  /*
  ---------------------------------------------------------
  MIXED VAGINITIS
  ---------------------------------------------------------
  */

  else if (

    (yeastPositive && bacterialVaginosis) ||

    (yeastPositive && trichPositive) ||

    (bacterialVaginosis && trichPositive)

  ) {

    impression =
      "Mixed vaginitis.";

    recommendation =
      "Mixed vaginal infection is present. Therapy should address all identified pathogens.";

  }

  /*
  ---------------------------------------------------------
  AEROBIC VAGINITIS
  ---------------------------------------------------------
  */

  else if (

    inflammation &&
    culturePositive &&
    !bacterialVaginosis &&
    !yeastPositive &&
    !trichPositive

  ) {

    impression =
      "Findings are suggestive of aerobic vaginitis.";

    recommendation =
      "Management should be guided by the culture result and antimicrobial susceptibility pattern.";

  }

  /*
  ---------------------------------------------------------
  SIGNIFICANT BACTERIAL ISOLATE
  ---------------------------------------------------------
  */

  else if (

    culturePositive

  ) {

    impression =
      `Significant growth of ${organism}.`;

    recommendation =
      "Interpret together with antimicrobial susceptibility results and the patient's clinical presentation.";

  }

  /*
  ---------------------------------------------------------
  NON-SPECIFIC VAGINITIS
  ---------------------------------------------------------
  */

  else if (

    inflammation

  ) {

    impression =
      "Non-specific vaginitis.";

    recommendation =
      "Clinical correlation is recommended. Consider further microbiological investigations if symptoms persist.";

  }

  /*
  ---------------------------------------------------------
  GENERAL ABNORMALITY
  ---------------------------------------------------------
  */

  else {

    impression =
      "Abnormal high vaginal swab findings.";

    recommendation =
      "Interpret together with symptoms, examination findings, pregnancy status and culture results where available.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "Normal vaginal flora.":

      recommendation =
        "Normal vaginal flora is demonstrated. No microbiological evidence of vaginitis is identified. Correlate with clinical findings.";

      break;

    case "Bacterial vaginosis.":

      recommendation =
        "Treat according to current bacterial vaginosis guidelines. Clinical correlation is recommended, particularly in pregnancy and patients with recurrent symptoms.";

      break;

    case "Intermediate vaginal flora.":

      recommendation =
        "Intermediate flora is not diagnostic of bacterial vaginosis. Repeat evaluation may be considered if symptoms persist.";

      break;

    case "Vulvovaginal candidiasis.":

      recommendation =
        "Appropriate antifungal therapy is recommended. Evaluate for recurrent infection, diabetes mellitus, pregnancy or recent antibiotic exposure where appropriate.";

      break;

    case "Trichomoniasis.":

      recommendation =
        "Treat with an appropriate antiprotozoal agent according to current guidelines. Sexual partner(s) should also be evaluated and treated to reduce reinfection.";

      break;

    case "Mixed vaginitis.":

      recommendation =
        "Management should address each identified pathogen. Clinical follow-up is recommended if symptoms persist.";

      break;

    case "Findings are suggestive of aerobic vaginitis.":

      recommendation =
        "Treatment should be guided by culture identification and antimicrobial susceptibility results.";

      break;

    case "Non-specific vaginitis.":

      recommendation =
        "Further clinical evaluation may be required. Additional testing for sexually transmitted infections should be considered when clinically indicated.";

      break;

    default:

      if (culturePositive) {

        recommendation =
          "Interpret the isolate together with antimicrobial susceptibility testing, symptoms and clinical examination.";

      }

  }

  /* ======================================================
     ORGANISM-SPECIFIC COMMENTS
  ====================================================== */

  const organismText = organism.toLowerCase();

  if (organismText.includes("candida albicans")) {

    interpretation +=
      "Candida albicans is the most common cause of vulvovaginal candidiasis and usually responds well to standard antifungal therapy.\n\n";

  }

  else if (organismText.includes("candida")) {

    interpretation +=
      "Candida species are isolated. Species identification may be useful in recurrent or treatment-resistant infections.\n\n";

  }

  if (

    organismText.includes("gardnerella")

  ) {

    interpretation +=
      "Gardnerella vaginalis is commonly associated with bacterial vaginosis and should be interpreted together with Gram stain findings and Nugent score.\n\n";

  }

  if (

    organismText.includes("streptococcus agalactiae") ||

    organismText.includes("group b streptococcus")

  ) {

    interpretation +=
      "Group B Streptococcus is isolated. In pregnant patients, correlate with current obstetric screening and management guidelines.\n\n";

  }

  if (

    organismText.includes("escherichia coli")

  ) {

    interpretation +=
      "Escherichia coli may represent aerobic vaginitis or contamination. Clinical correlation is recommended.\n\n";

  }

  if (

    organismText.includes("staphylococcus aureus")

  ) {

    interpretation +=
      "Staphylococcus aureus may represent colonization or infection depending on the clinical setting.\n\n";

  }

  if (

    organismText.includes("enterococcus")

  ) {

    interpretation +=
      "Enterococcus species may be associated with aerobic vaginitis and should be interpreted with inflammatory findings.\n\n";

  }

  if (

    organismText.includes("klebsiella")

  ) {

    interpretation +=
      "Klebsiella species are opportunistic Gram-negative bacilli that may contribute to aerobic vaginal infection.\n\n";

  }

  if (

    organismText.includes("pseudomonas")

  ) {

    interpretation +=
      "Pseudomonas species are uncommon vaginal pathogens and should be interpreted together with symptoms and inflammatory findings.\n\n";

  }

  /* ======================================================
     CULTURE COMMENT
  ====================================================== */

  if (culturePositive) {

    interpretation +=
      "Culture results should be interpreted together with antimicrobial susceptibility testing to guide appropriate therapy.\n\n";

  }

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "High vaginal swab findings should be interpreted together with the patient's symptoms, pelvic examination, pregnancy status, risk factors for sexually transmitted infections and other relevant laboratory investigations. Isolation of an organism does not always indicate disease, and microbiological findings should be correlated with the clinical picture.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation: interpretation.trim(),

    impression,

    recommendation,

  });

}