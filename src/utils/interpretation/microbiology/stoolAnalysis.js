import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   STOOL ANALYSIS INTERPRETATION ENGINE

   Physical Examination
   --------------------
   • Colour
   • Consistency
   • Mucus
   • Blood
   • Worms
   • Adult parasites

   Chemical Examination
   --------------------
   • Occult Blood
   • pH
   • Reducing Substance
   • Fat Globules

   Microscopy
   --------------------
   • Pus Cells
   • RBC
   • Yeast
   • Ova
   • Cysts
   • Trophozoites
   • Larvae
   • Charcot-Leyden Crystals
   • Vegetable Cells
   • Starch Granules
   • Muscle Fibres

   Detects
   --------------------
   • Normal stool
   • Acute bacterial diarrhoea
   • Amoebiasis
   • Giardiasis
   • Helminthiasis
   • Inflammatory diarrhoea
   • Dysentery
   • Malabsorption
   • Gastrointestinal bleeding
   • Parasitic infestation
========================================================== */

export default function interpretStoolAnalysis(

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

  const colour =
    getResult(resultMap, "Colour") ??
    getResult(resultMap, "Color") ??
    "";

  const consistency =
    getResult(resultMap, "Consistency") ??
    "";

  const mucus =
    getResult(resultMap, "Mucus") ??
    "";

  const visibleBlood =
    getResult(resultMap, "Blood") ??
    "";

  const worms =
    getResult(resultMap, "Worms") ??
    "";

  /* ======================================================
     CHEMISTRY
  ====================================================== */

  const occultBlood =
    getResult(resultMap, "Occult Blood") ??
    "";

  const stoolPH =
    getNumericResult(resultMap, "pH");

  const reducingSubstance =
    getResult(resultMap, "Reducing Substance") ??
    "";

  const fatGlobules =
    getResult(resultMap, "Fat Globules") ??
    "";

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  const pusCells =
    getNumericResult(resultMap, "Pus Cells") ??
    getNumericResult(resultMap, "WBC");

  const rbc =
    getNumericResult(resultMap, "RBC");

  const yeast =
    getResult(resultMap, "Yeast") ??
    "";

  const ova =
    getResult(resultMap, "Ova") ??
    "";

  const cysts =
    getResult(resultMap, "Cysts") ??
    "";

  const trophozoites =
    getResult(resultMap, "Trophozoites") ??
    "";

  const larvae =
    getResult(resultMap, "Larvae") ??
    "";

  const charcotLeyden =
    getResult(resultMap, "Charcot Leyden Crystals") ??
    "";

  const vegetableCells =
    getResult(resultMap, "Vegetable Cells") ??
    "";

  const starch =
    getResult(resultMap, "Starch Granules") ??
    "";

  const muscleFibres =
    getResult(resultMap, "Muscle Fibres") ??
    "";

  /* ======================================================
     NORMALISE TEXT
  ====================================================== */

  const colourText = String(colour).toLowerCase();
  const consistencyText = String(consistency).toLowerCase();

  const mucusText = String(mucus).toLowerCase();

  const bloodText = String(visibleBlood).toLowerCase();

  const occultText = String(occultBlood).toLowerCase();

  const yeastText = String(yeast).toLowerCase();

  const ovaText = String(ova).toLowerCase();

  const cystText = String(cysts).toLowerCase();

  const trophText = String(trophozoites).toLowerCase();

  const larvaeText = String(larvae).toLowerCase();

  /* ======================================================
     FLAGS
  ====================================================== */

  const hasPus =

    pusCells !== null &&
    pusCells >= 5;

  const hasRBC =

    rbc !== null &&
    rbc > 3;

  const hasOccultBlood =
    occultText.includes("positive");

  const hasVisibleBlood =
    bloodText.includes("present") ||
    bloodText.includes("positive");

  const hasBlood =
    hasOccultBlood ||
    hasVisibleBlood;

  const hasMucus =
    mucusText.includes("present");

  const hasYeast =
    yeastText &&
    yeastText !== "nil" &&
    yeastText !== "none";

  const hasOva =
    ovaText &&
    ovaText !== "nil" &&
    ovaText !== "none";

  const hasCysts =
    cystText &&
    cystText !== "nil" &&
    cystText !== "none";

  const hasTrophozoites =
    trophText &&
    trophText !== "nil" &&
    trophText !== "none";

  const hasLarvae =
    larvaeText &&
    larvaeText !== "nil" &&
    larvaeText !== "none";

  const hasFat =
    String(fatGlobules)
      .toLowerCase()
      .includes("present");

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     PHYSICAL EXAMINATION INTERPRETATION
  ====================================================== */

  if (colourText) {

    switch (colourText) {

      case "brown":

        interpretation +=
          "Stool colour is within the expected range.\n\n";
        break;

      case "black":

      case "tarry":

        interpretation +=
          "Black or tarry stool may indicate upper gastrointestinal bleeding (melena). Iron therapy, bismuth preparations and certain foods should also be considered.\n\n";
        break;

      case "red":

        interpretation +=
          "Red stool may indicate lower gastrointestinal bleeding, although dietary pigments should also be considered.\n\n";
        break;

      case "green":

        interpretation +=
          "Green stool may occur with rapid intestinal transit, certain infections or dietary factors.\n\n";
        break;

      case "clay":

      case "pale":

      case "white":

        interpretation +=
          "Pale or clay-coloured stool may indicate reduced bile excretion and should be correlated with liver function tests.\n\n";
        break;

      case "yellow":

        interpretation +=
          "Yellow stool may occur with fat malabsorption or rapid intestinal transit.\n\n";
        break;

      default:

        interpretation +=
          `Stool colour reported as ${colour}.\n\n`;

    }

  }

  if (consistencyText) {

    if (

      consistencyText.includes("formed")

    ) {

      interpretation +=
        "Stool consistency is normal.\n\n";

    }

    else if (

      consistencyText.includes("soft")

    ) {

      interpretation +=
        "Soft stool is noted.\n\n";

    }

    else if (

      consistencyText.includes("loose") ||

      consistencyText.includes("watery")

    ) {

      interpretation +=
        "Loose or watery stool is consistent with diarrhoeal illness.\n\n";

    }

    else if (

      consistencyText.includes("hard")

    ) {

      interpretation +=
        "Hard stool may indicate constipation or dehydration.\n\n";

    }

  }

  if (hasMucus) {

    interpretation +=
      "Mucus is present in the stool, suggesting intestinal inflammation or irritation.\n\n";

  }

  if (hasBlood) {

    interpretation +=
      "Blood is detected in the stool. Clinical correlation is required to determine the source of gastrointestinal bleeding.\n\n";

  }

  if (

    worms &&
    worms.toLowerCase() !== "nil" &&
    worms.toLowerCase() !== "none"

  ) {

    interpretation +=
      `Adult worms identified (${worms}). This confirms intestinal helminth infection.\n\n`;

  }

  /* ======================================================
     CHEMICAL EXAMINATION
  ====================================================== */

  if (hasOccultBlood) {

    interpretation +=
      "Occult blood is positive, indicating microscopic gastrointestinal bleeding.\n\n";

  }

  if (

    stoolPH !== null

  ) {

    if (

      stoolPH < 5.5

    ) {

      interpretation +=
        `Stool pH (${stoolPH}) is acidic, which may occur with carbohydrate malabsorption.\n\n`;

    }

    else if (

      stoolPH > 8

    ) {

      interpretation +=
        `Stool pH (${stoolPH}) is alkaline, which may be associated with protein putrefaction or intestinal infection.\n\n`;

    }

  }

  if (

    String(reducingSubstance)
      .toLowerCase()
      .includes("positive")

  ) {

    interpretation +=
      "Reducing substances are present, suggesting carbohydrate malabsorption or lactose intolerance.\n\n";

  }

  if (hasFat) {

    interpretation +=
      "Fat globules are present, indicating possible fat malabsorption (steatorrhoea).\n\n";

  }

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  if (hasPus) {

    interpretation +=
      "Numerous pus cells are present, supporting intestinal inflammation or invasive bacterial infection.\n\n";

  }

  if (hasRBC) {

    interpretation +=
      "Red blood cells are present in stool microscopy, supporting intestinal bleeding or invasive colitis.\n\n";

  }

  if (hasYeast) {

    interpretation +=
      "Yeast cells are present. Their significance depends on the clinical setting and may represent colonisation.\n\n";

  }

  if (hasOva) {

    interpretation +=
      `Helminth ova identified (${ova}).\n\n`;

  }

  if (hasCysts) {

    interpretation +=
      `Protozoal cysts identified (${cysts}).\n\n`;

  }

  if (hasTrophozoites) {

    interpretation +=
      `Protozoal trophozoites identified (${trophozoites}).\n\n`;

  }

  if (hasLarvae) {

    interpretation +=
      `Helminth larvae identified (${larvae}).\n\n`;

  }

  if (

    charcotLeyden &&
    charcotLeyden.toLowerCase() !== "nil" &&
    charcotLeyden.toLowerCase() !== "none"

  ) {

    interpretation +=
      "Charcot-Leyden crystals are present, supporting eosinophilic inflammation commonly associated with parasitic infestation.\n\n";

  }

  if (

    vegetableCells &&
    vegetableCells.toLowerCase() !== "nil" &&
    vegetableCells.toLowerCase() !== "none"

  ) {

    interpretation +=
      "Vegetable cells are present and usually represent dietary residue.\n\n";

  }

  if (

    starch &&
    starch.toLowerCase() !== "nil" &&
    starch.toLowerCase() !== "none"

  ) {

    interpretation +=
      "Starch granules are present and may suggest carbohydrate maldigestion when increased.\n\n";

  }

  if (

    muscleFibres &&
    muscleFibres.toLowerCase() !== "nil" &&
    muscleFibres.toLowerCase() !== "none"

  ) {

    interpretation +=
      "Muscle fibres are present and may indicate impaired protein digestion when increased.\n\n";

  }

  interpretation +=
    "Stool analysis findings should be interpreted together with the patient's symptoms, duration of illness, travel history, dietary history and microbiological investigations where indicated.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NORMAL STOOL
  ---------------------------------------------------------
  */

  const normalStool =

    !hasPus &&
    !hasRBC &&
    !hasBlood &&
    !hasMucus &&
    !hasOva &&
    !hasCysts &&
    !hasTrophozoites &&
    !hasLarvae &&
    !hasFat &&
    !hasYeast;

  if (normalStool) {

    impression =
      "Stool analysis is within normal limits.";

    recommendation =
      "No significant abnormality detected. Correlate with the clinical presentation.";

  }

  /*
  ---------------------------------------------------------
  ACUTE BACTERIAL DIARRHOEA
  ---------------------------------------------------------
  */

  else if (

    hasPus &&
    !hasOva &&
    !hasCysts &&
    !hasTrophozoites

  ) {

    impression =
      "Findings are consistent with acute bacterial diarrhoea.";

    recommendation =
      "Recommend stool culture and antimicrobial susceptibility testing where clinically indicated.";

  }

  /*
  ---------------------------------------------------------
  BACILLARY DYSENTERY
  ---------------------------------------------------------
  */

  else if (

    hasPus &&
    hasRBC &&
    hasBlood &&
    hasMucus

  ) {

    impression =
      "Findings are suggestive of bacillary dysentery.";

    recommendation =
      "Recommend stool culture for enteric bacterial pathogens and appropriate clinical management.";

  }

  /*
  ---------------------------------------------------------
  AMOEBIASIS
  ---------------------------------------------------------
  */

  else if (

    hasCysts ||
    hasTrophozoites

  ) {

    impression =
      "Intestinal amoebiasis or other protozoal infection detected.";

    recommendation =
      "Correlate with parasite identification and clinical findings. Appropriate antiparasitic therapy should be considered.";

  }

  /*
  ---------------------------------------------------------
  AMOEBIC DYSENTERY
  ---------------------------------------------------------
  */

  else if (

    hasTrophozoites &&
    hasBlood &&
    hasMucus

  ) {

    impression =
      "Findings are highly suggestive of amoebic dysentery.";

    recommendation =
      "Recommend prompt antiparasitic therapy and clinical evaluation.";

  }

  /*
  ---------------------------------------------------------
  GIARDIASIS
  ---------------------------------------------------------
  */

  else if (

    cystText.includes("giardia") ||

    trophText.includes("giardia")

  ) {

    impression =
      "Giardiasis detected.";

    recommendation =
      "Correlate clinically and institute appropriate antiparasitic treatment.";

  }

  /*
  ---------------------------------------------------------
  HELMINTHIASIS
  ---------------------------------------------------------
  */

  else if (

    hasOva ||
    hasLarvae ||
    (
      worms &&
      worms.toLowerCase() !== "nil" &&
      worms.toLowerCase() !== "none"
    )

  ) {

    impression =
      "Helminth infection detected.";

    recommendation =
      "Treatment should be guided by the identified parasite species and current treatment guidelines.";

  }

  /*
  ---------------------------------------------------------
  MIXED PARASITIC INFECTION
  ---------------------------------------------------------
  */

  else if (

    (
      hasOva ? 1 : 0
    ) +

    (
      hasCysts ? 1 : 0
    ) +

    (
      hasTrophozoites ? 1 : 0
    ) +

    (
      hasLarvae ? 1 : 0
    ) >= 2

  ) {

    impression =
      "Mixed intestinal parasitic infection.";

    recommendation =
      "Correlate with identified parasites and institute appropriate antiparasitic therapy.";

  }

  /*
  ---------------------------------------------------------
  GASTROINTESTINAL BLEEDING
  ---------------------------------------------------------
  */

  else if (

    hasOccultBlood ||

    hasVisibleBlood

  ) {

    impression =
      "Evidence of gastrointestinal bleeding.";

    recommendation =
      "Further evaluation is recommended to determine the source of bleeding.";

  }

  /*
  ---------------------------------------------------------
  MALABSORPTION
  ---------------------------------------------------------
  */

  else if (

    hasFat &&
    String(reducingSubstance)
      .toLowerCase()
      .includes("positive")

  ) {

    impression =
      "Findings suggest malabsorption.";

    recommendation =
      "Clinical correlation and further evaluation for pancreatic insufficiency, coeliac disease or other malabsorptive disorders are recommended.";

  }

  /*
  ---------------------------------------------------------
  STEATORRHOEA
  ---------------------------------------------------------
  */

  else if (

    hasFat

  ) {

    impression =
      "Steatorrhoea.";

    recommendation =
      "Correlate with pancreatic function and other causes of fat malabsorption.";

  }

  /*
  ---------------------------------------------------------
  CARBOHYDRATE MALABSORPTION
  ---------------------------------------------------------
  */

  else if (

    String(reducingSubstance)
      .toLowerCase()
      .includes("positive") ||

    (
      stoolPH !== null &&
      stoolPH < 5.5
    )

  ) {

    impression =
      "Findings suggest carbohydrate malabsorption.";

    recommendation =
      "Consider lactose intolerance or other carbohydrate malabsorption disorders.";

  }

  /*
  ---------------------------------------------------------
  YEAST OVERGROWTH
  ---------------------------------------------------------
  */

  else if (

    hasYeast

  ) {

    impression =
      "Yeast identified in stool.";

    recommendation =
      "Yeast commonly represents gastrointestinal colonisation. Correlate with immune status and symptoms.";

  }

  /*
  ---------------------------------------------------------
  NON-SPECIFIC ABNORMALITY
  ---------------------------------------------------------
  */

  else {

    impression =
      "Abnormal stool analysis.";

    recommendation =
      "Interpret together with stool culture, parasite identification, clinical history and other relevant investigations.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression === "Stool analysis is within normal limits."

  ) {

    recommendation =
      "No significant abnormality is detected. Correlate with the patient's clinical presentation.";

  }

  else if (

    impression.includes("acute bacterial diarrhoea")

  ) {

    recommendation =
      "Recommend stool culture and antimicrobial susceptibility testing where clinically indicated. Maintain adequate hydration and correlate with clinical findings.";

  }

  else if (

    impression.includes("bacillary dysentery")

  ) {

    recommendation =
      "Urgent stool culture is recommended. Assess hydration status and institute appropriate antimicrobial therapy according to culture results.";

  }

  else if (

    impression.includes("amoebic dysentery")

  ) {

    recommendation =
      "Prompt antiparasitic treatment is recommended. Evaluate for extra-intestinal amoebiasis where clinically indicated.";

  }

  else if (

    impression.includes("amoebiasis")

  ) {

    recommendation =
      "Treat according to the identified protozoan species and current treatment guidelines.";

  }

  else if (

    impression.includes("Giardiasis")

  ) {

    recommendation =
      "Recommend appropriate antiprotozoal therapy. Consider evaluation of household contacts if clinically indicated.";

  }

  else if (

    impression.includes("Helminth")

  ) {

    recommendation =
      "Institute appropriate anthelminthic therapy according to the identified parasite species. Reinforce hygiene and sanitation measures.";

  }

  else if (

    impression.includes("Mixed intestinal parasitic")

  ) {

    recommendation =
      "Treat according to all identified parasites. Reinforce environmental sanitation, hand hygiene and safe food practices.";

  }

  else if (

    impression.includes("gastrointestinal bleeding")

  ) {

    recommendation =
      "Further evaluation including endoscopy or imaging may be required depending on the patient's age, symptoms and risk factors.";

  }

  else if (

    impression.includes("malabsorption")

  ) {

    recommendation =
      "Recommend further evaluation including coeliac disease screening, pancreatic function assessment and nutritional evaluation where appropriate.";

  }

  else if (

    impression.includes("Steatorrhoea")

  ) {

    recommendation =
      "Further evaluation for pancreatic insufficiency, bile salt deficiency and small bowel disease is recommended.";

  }

  else if (

    impression.includes("carbohydrate malabsorption")

  ) {

    recommendation =
      "Consider lactose intolerance testing or other investigations for carbohydrate malabsorption.";

  }

  else if (

    impression.includes("Yeast")

  ) {

    recommendation =
      "Yeast is often a colonising organism. Interpret together with symptoms and the patient's immune status.";

  }

  else {

    recommendation =
      recommendation ||
      "Interpret stool findings together with stool culture, parasite identification, clinical history and other laboratory investigations.";

  }

  /* ======================================================
     PARASITE-SPECIFIC ENHANCEMENTS
  ====================================================== */

  if (ovaText.includes("ascaris")) {

    interpretation +=
      "Ascaris lumbricoides ova are identified, consistent with ascariasis.\n\n";

  }

  if (ovaText.includes("trichuris")) {

    interpretation +=
      "Trichuris trichiura ova are identified, consistent with whipworm infection.\n\n";

  }

  if (

    ovaText.includes("hookworm") ||

    ovaText.includes("ancylostoma") ||

    ovaText.includes("necator")

  ) {

    interpretation +=
      "Hookworm ova are identified. Chronic infection may contribute to iron deficiency anaemia.\n\n";

  }

  if (larvaeText.includes("strongyloides")) {

    interpretation +=
      "Strongyloides stercoralis larvae are identified. Hyperinfection syndrome should be considered in immunocompromised patients.\n\n";

  }

  if (

    ovaText.includes("taenia")

  ) {

    interpretation +=
      "Taenia species infection is identified. Species differentiation may be required in selected cases.\n\n";

  }

  if (

    ovaText.includes("hymenolepis")

  ) {

    interpretation +=
      "Hymenolepis nana infection is identified.\n\n";

  }

  if (

    cystText.includes("entamoeba histolytica") ||

    trophText.includes("entamoeba histolytica")

  ) {

    interpretation +=
      "Entamoeba histolytica is identified, consistent with intestinal amoebiasis.\n\n";

  }

  if (

    cystText.includes("cryptosporidium")

  ) {

    interpretation +=
      "Cryptosporidium species are detected. Persistent infection should prompt assessment of immune status.\n\n";

  }

  if (

    cystText.includes("cyclospora")

  ) {

    interpretation +=
      "Cyclospora cayetanensis is identified.\n\n";

  }

  if (

    cystText.includes("isospora") ||

    cystText.includes("cystoisospora")

  ) {

    interpretation +=
      "Cystoisospora belli is identified. Consider underlying immunosuppression in persistent disease.\n\n";

  }

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Stool examination should always be interpreted together with the patient's symptoms, duration of illness, travel history, dietary history, stool culture where indicated and other relevant laboratory investigations.\n";

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