import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   SEMINAL FLUID ANALYSIS INTERPRETATION ENGINE
   WHO Laboratory Manual, 6th Edition (2021)

   PHYSICAL EXAMINATION
   ----------------------------
   • Abstinence
   • Volume
   • Colour
   • Appearance
   • Liquefaction Time
   • Viscosity
   • pH

   MICROSCOPY
   ----------------------------
   • Sperm Concentration
   • Total Sperm Number
   • Total Motility
   • Progressive Motility
   • Non-progressive Motility
   • Immotile Sperm
   • Morphology
   • Vitality
   • Agglutination
   • Round Cells
   • WBC
   • RBC
   • Epithelial Cells
   • Bacteria
   • Yeast

   DETECTS
   ----------------------------
   • Normozoospermia
   • Oligozoospermia
   • Severe oligozoospermia
   • Azoospermia
   • Cryptozoospermia
   • Asthenozoospermia
   • Teratozoospermia
   • Oligoasthenoteratozoospermia (OAT)
   • Necrozoospermia
   • Leukocytospermia
   • Haematospermia
   • Infection
========================================================== */

export default function interpretSFA(

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
     PHYSICAL EXAMINATION
  ====================================================== */

  const abstinence =
    getNumericResult(resultMap, "Abstinence");

  const volume =
    getNumericResult(resultMap, "Volume");

  const colour =
    getResult(resultMap, "Colour") ??
    getResult(resultMap, "Color") ??
    "";

  const appearance =
    getResult(resultMap, "Appearance") ??
    "";

  const liquefaction =
    getNumericResult(resultMap, "Liquefaction Time");

  const viscosity =
    getResult(resultMap, "Viscosity") ??
    "";

  const pH =
    getNumericResult(resultMap, "pH");

  /* ======================================================
     SPERM PARAMETERS
  ====================================================== */

  const concentration =
    getNumericResult(resultMap, "Sperm Concentration");

  const totalCount =
    getNumericResult(resultMap, "Total Sperm Number");

  const totalMotility =
    getNumericResult(resultMap, "Total Motility");

  const progressive =
    getNumericResult(resultMap, "Progressive Motility");

  const nonProgressive =
    getNumericResult(resultMap, "Non-progressive Motility");

  const immotile =
    getNumericResult(resultMap, "Immotile");

  const morphology =
    getNumericResult(resultMap, "Normal Morphology");

  const vitality =
    getNumericResult(resultMap, "Vitality");

  const agglutination =
    getResult(resultMap, "Agglutination") ?? "";

  /* ======================================================
     CELLS
  ====================================================== */

  const roundCells =
    getNumericResult(resultMap, "Round Cells");

  const wbc =
    getNumericResult(resultMap, "WBC");

  const rbc =
    getNumericResult(resultMap, "RBC");

  const epithelial =
    getNumericResult(resultMap, "Epithelial Cells");

  const bacteria =
    getResult(resultMap, "Bacteria") ?? "";

  const yeast =
    getResult(resultMap, "Yeast") ?? "";

  /* ======================================================
     FLAGS
  ====================================================== */

  const lowVolume =
    volume !== null &&
    volume < 1.4;

  const acidic =
    pH !== null &&
    pH < 7.2;

  const alkaline =
    pH !== null &&
    pH > 8.0;

  const azoospermia =
    concentration !== null &&
    concentration === 0;

  const cryptozoospermia =
    concentration !== null &&
    concentration > 0 &&
    concentration < 1;

  const oligozoospermia =
    concentration !== null &&
    concentration < 16;

  const severeOligo =
    concentration !== null &&
    concentration < 5;

  const asthenozoospermia =
    progressive !== null &&
    progressive < 30;

  const teratozoospermia =
    morphology !== null &&
    morphology < 4;

  const necrozoospermia =
    vitality !== null &&
    vitality < 54;

  const leukocytospermia =
    wbc !== null &&
    wbc >= 1;

  const haematospermia =
    rbc !== null &&
    rbc > 0;

  const bacteriospermia =
    bacteria &&
    bacteria.toLowerCase() !== "nil" &&
    bacteria.toLowerCase() !== "none";

  const yeastPresent =
    yeast &&
    yeast.toLowerCase() !== "nil" &&
    yeast.toLowerCase() !== "none";

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  if (abstinence !== null) {

    if (abstinence < 2) {

      interpretation +=
        `Abstinence period (${abstinence} day(s)) is shorter than the WHO recommended interval of 2–7 days and may reduce semen volume and sperm count.\n\n`;

    }

    else if (abstinence > 7) {

      interpretation +=
        `Abstinence period (${abstinence} days) exceeds the WHO recommended interval of 2–7 days and may influence motility and semen quality.\n\n`;

    }

    else {

      interpretation +=
        `Abstinence period (${abstinence} days) is within the WHO recommended range.\n\n`;

    }

  }

  if (volume !== null) {

    if (lowVolume) {

      interpretation +=
        `Semen volume (${volume} mL) is below the WHO lower reference limit (1.4 mL), consistent with hypospermia.\n\n`;

    }

    else {

      interpretation +=
        `Semen volume (${volume} mL) is within the WHO reference range.\n\n`;

    }

  }

  if (colour) {

    const colourText = colour.toLowerCase();

    if (

      colourText.includes("grey") ||

      colourText.includes("gray") ||

      colourText.includes("opalescent")

    ) {

      interpretation +=
        "Semen colour is within the expected appearance.\n\n";

    }

    else if (

      colourText.includes("yellow")

    ) {

      interpretation +=
        "Yellow discoloration may occur with prolonged abstinence, medications or infection.\n\n";

    }

    else if (

      colourText.includes("red") ||

      colourText.includes("brown")

    ) {

      interpretation +=
        "Red or brown discoloration may indicate haematospermia.\n\n";

    }

    else {

      interpretation +=
        `Semen colour reported as ${colour}.\n\n`;

    }

  }

  if (appearance) {

    interpretation +=
      `Appearance: ${appearance}.\n\n`;

  }

  if (liquefaction !== null) {

    if (liquefaction > 60) {

      interpretation +=
        `Liquefaction time (${liquefaction} minutes) is prolonged and may impair sperm motility.\n\n`;

    }

    else {

      interpretation +=
        `Liquefaction time (${liquefaction} minutes) is within the expected range.\n\n`;

    }

  }

  if (viscosity) {

    if (

      viscosity.toLowerCase().includes("increased") ||

      viscosity.toLowerCase().includes("high")

    ) {

      interpretation +=
        "Viscosity is increased and may interfere with sperm motility and laboratory assessment.\n\n";

    }

    else {

      interpretation +=
        "Viscosity is within the expected range.\n\n";

    }

  }

  if (pH !== null) {

    if (acidic) {

      interpretation +=
        `Semen pH (${pH}) is acidic. This may suggest ejaculatory duct obstruction or seminal vesicle dysfunction.\n\n`;

    }

    else if (alkaline) {

      interpretation +=
        `Semen pH (${pH}) is alkaline and may be associated with genital tract infection.\n\n`;

    }

    else {

      interpretation +=
        `Semen pH (${pH}) is within the expected physiological range.\n\n`;

    }

  }

  /* ======================================================
     SPERM CONCENTRATION
  ====================================================== */

  if (azoospermia) {

    interpretation +=
      "No spermatozoa were identified (azoospermia).\n\n";

  }

  else if (cryptozoospermia) {

    interpretation +=
      "Extremely low sperm concentration is present (cryptozoospermia).\n\n";

  }

  else if (severeOligo) {

    interpretation +=
      `Severe oligozoospermia is present (concentration ${concentration} million/mL).\n\n`;

  }

  else if (oligozoospermia) {

    interpretation +=
      `Sperm concentration (${concentration} million/mL) is below the WHO lower reference limit, consistent with oligozoospermia.\n\n`;

  }

  else if (concentration !== null) {

    interpretation +=
      `Sperm concentration (${concentration} million/mL) is within the WHO reference range.\n\n`;

  }

  /* ======================================================
     TOTAL SPERM NUMBER
  ====================================================== */

  if (totalCount !== null) {

    if (totalCount < 39) {

      interpretation +=
        `Total sperm number (${totalCount} million per ejaculate) is below the WHO lower reference limit.\n\n`;

    }

    else {

      interpretation +=
        `Total sperm number (${totalCount} million per ejaculate) is within the expected range.\n\n`;

    }

  }

  /* ======================================================
     MOTILITY
  ====================================================== */

  if (asthenozoospermia) {

    interpretation +=
      `Progressive motility (${progressive}%) is reduced, consistent with asthenozoospermia.\n\n`;

  }

  else if (progressive !== null) {

    interpretation +=
      `Progressive motility (${progressive}%) is within the WHO reference range.\n\n`;

  }

  if (totalMotility !== null) {

    interpretation +=
      `Total motility: ${totalMotility}%.\n\n`;

  }

  if (immotile !== null) {

    interpretation +=
      `Immotile sperm: ${immotile}%.\n\n`;

  }

  /* ======================================================
     MORPHOLOGY
  ====================================================== */

  if (teratozoospermia) {

    interpretation +=
      `Normal morphology (${morphology}%) is below the WHO lower reference limit, consistent with teratozoospermia.\n\n`;

  }

  else if (morphology !== null) {

    interpretation +=
      `Normal morphology (${morphology}%) is within the WHO reference range.\n\n`;

  }

  /* ======================================================
     VITALITY
  ====================================================== */

  if (necrozoospermia) {

    interpretation +=
      `Vitality (${vitality}%) is reduced, consistent with necrozoospermia.\n\n`;

  }

  else if (vitality !== null) {

    interpretation +=
      `Vitality (${vitality}%) is within the expected range.\n\n`;

  }

  /* ======================================================
     AGGLUTINATION
  ====================================================== */

  if (

    agglutination &&
    !agglutination.toLowerCase().includes("nil") &&
    !agglutination.toLowerCase().includes("none")

  ) {

    interpretation +=
      "Sperm agglutination is present and may suggest antisperm antibodies or genital tract inflammation.\n\n";

  }

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  if (roundCells !== null) {

    if (roundCells > 5) {

      interpretation +=
        `Round cells (${roundCells} million/mL) are increased. Differentiate leukocytes from immature germ cells where appropriate.\n\n`;

    } else {

      interpretation +=
        `Round cells (${roundCells} million/mL) are within the expected range.\n\n`;

    }

  }

  if (leukocytospermia) {

    interpretation +=
      `Leukocyte concentration (${wbc} million/mL) is elevated, consistent with leukocytospermia. This may indicate genital tract inflammation or infection and can adversely affect sperm function.\n\n`;

  }

  if (haematospermia) {

    interpretation +=
      "Red blood cells are present, consistent with haematospermia. Correlate with clinical history to exclude infection, trauma or prostatic disease.\n\n";

  }

  if (epithelial !== null && epithelial > 5) {

    interpretation +=
      "Numerous epithelial cells are present. Correlate with possible contamination or inflammation.\n\n";

  }

  if (bacteriospermia) {

    interpretation +=
      `Bacteria observed (${bacteria}). Significant bacteriospermia should be confirmed by semen culture.\n\n`;

  }

  if (yeastPresent) {

    interpretation +=
      "Yeast cells are present. Correlate with symptoms, diabetes mellitus and immunosuppression.\n\n";

  }

  /* ======================================================
     FERTILITY PATTERN RECOGNITION
  ====================================================== */

  const normozoospermia =

    !lowVolume &&
    !azoospermia &&
    !cryptozoospermia &&
    !oligozoospermia &&
    !asthenozoospermia &&
    !teratozoospermia &&
    !necrozoospermia &&
    !leukocytospermia &&
    !haematospermia &&
    !bacteriospermia &&
    !yeastPresent;

  if (normozoospermia) {

    impression =
      "Normozoospermia.";

    recommendation =
      "Semen parameters are within WHO reference limits. Interpretation should be correlated with the couple's fertility history.";

  }

  /*
  ---------------------------------------------------------
  AZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (azoospermia) {

    impression =
      "Azoospermia.";

    recommendation =
      "Repeat semen analysis is recommended. Endocrine evaluation, genetic studies and assessment for obstructive or non-obstructive azoospermia should be considered.";

  }

  /*
  ---------------------------------------------------------
  CRYPTOZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (cryptozoospermia) {

    impression =
      "Cryptozoospermia.";

    recommendation =
      "Repeat analysis and specialist fertility evaluation are recommended.";

  }

  /*
  ---------------------------------------------------------
  OAT SYNDROME
  ---------------------------------------------------------
  */

  else if (

    oligozoospermia &&
    asthenozoospermia &&
    teratozoospermia

  ) {

    impression =
      "Oligoasthenoteratozoospermia (OAT syndrome).";

    recommendation =
      "Comprehensive male infertility evaluation is recommended.";

  }

  /*
  ---------------------------------------------------------
  OLIGOZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (

    oligozoospermia &&
    !asthenozoospermia &&
    !teratozoospermia

  ) {

    impression =
      "Oligozoospermia.";

    recommendation =
      "Repeat semen analysis and evaluate for endocrine, genetic and environmental factors.";

  }

  /*
  ---------------------------------------------------------
  ASTHENOZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (

    asthenozoospermia &&
    !teratozoospermia

  ) {

    impression =
      "Asthenozoospermia.";

    recommendation =
      "Evaluate for infection, oxidative stress, varicocele and other reversible causes.";

  }

  /*
  ---------------------------------------------------------
  TERATOZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (

    teratozoospermia &&
    !oligozoospermia

  ) {

    impression =
      "Teratozoospermia.";

    recommendation =
      "Morphological abnormalities should be interpreted together with other semen parameters and fertility history.";

  }

  /*
  ---------------------------------------------------------
  NECROZOOSPERMIA
  ---------------------------------------------------------
  */

  else if (necrozoospermia) {

    impression =
      "Necrozoospermia.";

    recommendation =
      "Further evaluation is recommended to determine reversible causes including infection, oxidative stress and systemic disease.";

  }

  /*
  ---------------------------------------------------------
  LEUKOCYTOSPERMIA
  ---------------------------------------------------------
  */

  else if (

    leukocytospermia &&
    !bacteriospermia

  ) {

    impression =
      "Leukocytospermia.";

    recommendation =
      "Further evaluation for genital tract inflammation or occult infection is recommended.";

  }

  /*
  ---------------------------------------------------------
  GENITAL TRACT INFECTION
  ---------------------------------------------------------
  */

  else if (

    bacteriospermia ||
    yeastPresent

  ) {

    impression =
      "Findings suggest genital tract infection.";

    recommendation =
      "Recommend semen culture with antimicrobial susceptibility testing where clinically indicated.";

  }

  /*
  ---------------------------------------------------------
  HAEMATOSPERMIA
  ---------------------------------------------------------
  */

  else if (haematospermia) {

    impression =
      "Haematospermia.";

    recommendation =
      "Clinical correlation is recommended to exclude infection, trauma or prostatic pathology.";

  }

  /*
  ---------------------------------------------------------
  GENERAL ABNORMALITY
  ---------------------------------------------------------
  */

  else {

    impression =
      "Abnormal seminal fluid analysis.";

    recommendation =
      "Interpret findings together with clinical history, repeat semen analysis and fertility assessment.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "Normozoospermia.":

      recommendation =
        "Semen parameters are within WHO reference limits. Normal semen analysis does not exclude male-factor infertility; correlate with the couple's fertility history and female partner evaluation.";

      break;

    case "Azoospermia.":

      recommendation =
        "Repeat semen analysis on a separate specimen. Recommend endocrine evaluation (FSH, LH, testosterone), scrotal examination, genetic studies where indicated, and referral to a fertility specialist.";

      break;

    case "Cryptozoospermia.":

      recommendation =
        "Repeat semen analysis to confirm the finding. Consider referral to an andrologist or fertility specialist for further evaluation.";

      break;

    case "Oligozoospermia.":

      recommendation =
        "Repeat semen analysis and investigate reversible causes such as varicocele, endocrine disorders, systemic illness, medications and lifestyle factors.";

      break;

    case "Asthenozoospermia.":

      recommendation =
        "Evaluate for genital tract infection, oxidative stress, varicocele, prolonged abstinence and lifestyle factors. Repeat semen analysis is recommended.";

      break;

    case "Teratozoospermia.":

      recommendation =
        "Interpret morphology together with sperm concentration, motility and fertility history. Repeat testing may be appropriate.";

      break;

    case "Oligoasthenoteratozoospermia (OAT syndrome).":

      recommendation =
        "Comprehensive male infertility evaluation is recommended, including hormonal profile, scrotal imaging where indicated and specialist fertility referral.";

      break;

    case "Necrozoospermia.":

      recommendation =
        "Investigate potential causes including infection, oxidative stress, prolonged specimen delay, systemic illness and toxic exposures.";

      break;

    case "Leukocytospermia.":

      recommendation =
        "Consider semen culture, sexually transmitted infection screening where indicated and treatment of underlying genital tract inflammation or infection.";

      break;

    case "Haematospermia.":

      recommendation =
        "Correlate clinically. Persistent or recurrent haematospermia may require urological evaluation to exclude prostatic, seminal vesicle or urethral pathology.";

      break;

    case "Findings suggest genital tract infection.":

      recommendation =
        "Recommend semen culture and antimicrobial susceptibility testing where clinically indicated. Treat according to culture results and clinical guidelines.";

      break;

    default:

      recommendation =
        recommendation ||
        "Interpret seminal fluid findings together with clinical history, physical examination and repeat semen analysis where appropriate.";

  }

  /* ======================================================
     WHO 2021 GENERAL GUIDANCE
  ====================================================== */

  if (impression !== "Normozoospermia.") {

    interpretation +=
      "Abnormal semen parameters should ideally be confirmed on at least one repeat semen specimen collected after an appropriate interval, as semen quality shows considerable biological variation.\n\n";

  }

  /* ======================================================
     ADDITIONAL MICROSCOPY COMMENTS
  ====================================================== */

  if (agglutination &&
      !["nil", "none", "negative"].includes(agglutination.toLowerCase())) {

    interpretation +=
      "Sperm agglutination may indicate antisperm antibodies or genital tract inflammation. Further evaluation may be considered where clinically indicated.\n\n";

  }

  if (bacteriospermia && leukocytospermia) {

    interpretation +=
      "The coexistence of bacteriospermia and leukocytospermia increases the likelihood of an active genital tract infection.\n\n";

  }

  if (haematospermia && bacteriospermia) {

    interpretation +=
      "Haematospermia associated with bacteriospermia may reflect inflammatory disease of the prostate, seminal vesicles or other components of the male genital tract.\n\n";

  }

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Seminal fluid analysis should always be interpreted together with the patient's clinical history, physical examination, fertility history, endocrine profile and, where indicated, microbiological culture and imaging studies. A normal semen analysis does not completely exclude male-factor infertility.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation: interpretation.trim(),

    impression,

    recommendation,

  });

}