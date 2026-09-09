import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   MALARIA PARASITE INTERPRETATION ENGINE

   Supports
   ----------------------------
   • Thick Film
   • Thin Film
   • Rapid Diagnostic Test (RDT)
   • Parasite Density
   • Species Identification
   • Parasite Count (/µL)

   Detects
   ----------------------------
   • Malaria not detected
   • Plasmodium falciparum
   • Plasmodium vivax
   • Plasmodium malariae
   • Plasmodium ovale
   • Mixed malaria infection
   • Low parasitaemia
   • Moderate parasitaemia
   • High parasitaemia
========================================================== */

export default function interpretMalaria(

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

  const thickFilm =
    getResult(resultMap, "Thick Film") ??
    "";

  const thinFilm =
    getResult(resultMap, "Thin Film") ??
    "";

  const rdt =
    getResult(resultMap, "RDT") ??
    getResult(resultMap, "Malaria RDT") ??
    "";

  const species =
    getResult(resultMap, "Species") ??
    "";

  const parasiteDensity =
    getNumericResult(resultMap, "Parasite Density");

  const parasiteCount =
    getNumericResult(resultMap, "Parasite Count");

  /* ======================================================
     NORMALISE
  ====================================================== */

  const thickText =
    String(thickFilm).toLowerCase();

  const thinText =
    String(thinFilm).toLowerCase();

  const rdtText =
    String(rdt).toLowerCase();

  const speciesText =
    String(species).toLowerCase();

  /* ======================================================
     FLAGS
  ====================================================== */

  const microscopyPositive =

    thickText.includes("positive") ||

    thinText.includes("positive") ||

    speciesText.length > 0;

  const rdtPositive =

    rdtText.includes("positive");

  const pf =

    speciesText.includes("falciparum");

  const pv =

    speciesText.includes("vivax");

  const pm =

    speciesText.includes("malariae");

  const po =

    speciesText.includes("ovale");

  const mixedSpecies =

    [pf, pv, pm, po]
      .filter(Boolean)
      .length > 1;

  /* ======================================================
     PARASITAEMIA
  ====================================================== */

  let parasitaemia = "";

  if (parasiteDensity !== null) {

    if (parasiteDensity < 1000) {

      parasitaemia = "Low";

    }

    else if (parasiteDensity < 10000) {

      parasitaemia = "Moderate";

    }

    else {

      parasitaemia = "High";

    }

  }

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  if (microscopyPositive) {

    interpretation +=
      "Malaria parasites are demonstrated on microscopy.\n\n";

  } else {

    interpretation +=
      "No malaria parasites are seen on microscopy.\n\n";

  }

  /* ======================================================
     THICK FILM
  ====================================================== */

  if (thickFilm) {

    if (thickText.includes("positive")) {

      interpretation +=
        "Thick blood film is positive for malaria parasites. Thick films are more sensitive for parasite detection, particularly at low parasite densities.\n\n";

    }

    else if (thickText.includes("negative")) {

      interpretation +=
        "Thick blood film is negative for malaria parasites.\n\n";

    }

  }

  /* ======================================================
     THIN FILM
  ====================================================== */

  if (thinFilm) {

    if (thinText.includes("positive")) {

      interpretation +=
        "Thin blood film is positive and permits parasite species identification and assessment of parasite morphology.\n\n";

    }

    else if (thinText.includes("negative")) {

      interpretation +=
        "Thin blood film is negative for malaria parasites.\n\n";

    }

  }

  /* ======================================================
     RAPID DIAGNOSTIC TEST
  ====================================================== */

  if (rdt) {

    if (rdtPositive) {

      interpretation +=
        "Malaria rapid diagnostic test (RDT) is positive, indicating malaria antigen detection.\n\n";

    }

    else if (

      rdtText.includes("negative")

    ) {

      interpretation +=
        "Malaria rapid diagnostic test (RDT) is negative.\n\n";

    }

  }

  /* ======================================================
     SPECIES IDENTIFICATION
  ====================================================== */

  if (mixedSpecies) {

    interpretation +=
      `Mixed Plasmodium species infection identified (${species}). Mixed infections require careful clinical management.\n\n`;

  }

  else if (pf) {

    interpretation +=
      "Plasmodium falciparum is identified. This species is associated with the greatest risk of severe malaria and requires prompt treatment.\n\n";

  }

  else if (pv) {

    interpretation +=
      "Plasmodium vivax is identified. Relapse may occur because of dormant liver hypnozoites; radical cure should be considered where appropriate.\n\n";

  }

  else if (pm) {

    interpretation +=
      "Plasmodium malariae is identified. Chronic low-grade infection may occur if untreated.\n\n";

  }

  else if (po) {

    interpretation +=
      "Plasmodium ovale is identified. Relapse may occur because of dormant liver stages.\n\n";

  }

  else if (

    species &&
    species.trim() !== ""

  ) {

    interpretation +=
      `Plasmodium species reported: ${species}.\n\n`;

  }

  /* ======================================================
     PARASITE DENSITY
  ====================================================== */

  if (parasiteDensity !== null) {

    interpretation +=
      `Estimated parasite density: ${parasiteDensity.toLocaleString()} parasites/µL.\n\n`;

    if (parasitaemia === "Low") {

      interpretation +=
        "Parasitaemia is low.\n\n";

    }

    else if (

      parasitaemia === "Moderate"

    ) {

      interpretation +=
        "Parasitaemia is moderate.\n\n";

    }

    else if (

      parasitaemia === "High"

    ) {

      interpretation +=
        "High parasitaemia is present and may be associated with severe malaria, particularly in Plasmodium falciparum infection.\n\n";

    }

  }

  /* ======================================================
     PARASITE COUNT
  ====================================================== */

  if (parasiteCount !== null) {

    interpretation +=
      `Parasite count: ${parasiteCount.toLocaleString()} parasites/µL.\n\n";

  }

  /* ======================================================
     MICROSCOPY / RDT DISCORDANCE
  ====================================================== */

  if (

    microscopyPositive &&
    !rdtPositive &&
    rdt

  ) {

    interpretation +=
      "Microscopy is positive while the RDT is negative. Possible explanations include low antigen concentration, non-falciparum infection or technical factors.\n\n";

  }

  if (

    !microscopyPositive &&
    rdtPositive

  ) {

    interpretation +=
      "RDT is positive while microscopy is negative. This may occur with low-level parasitaemia, recently treated malaria or persistent circulating antigen. Repeat microscopy or molecular testing may be considered where clinically indicated.\n\n";

  }

  interpretation +=
    "Malaria microscopy findings should always be interpreted together with the patient's symptoms, travel history, antimalarial treatment history and epidemiological risk.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  MALARIA NOT DETECTED
  ---------------------------------------------------------
  */

  if (

    !microscopyPositive &&
    !rdtPositive

  ) {

    impression =
      "Malaria parasites not detected.";

    recommendation =
      "If malaria is still clinically suspected, repeat microscopy within 12–24 hours (up to 2–3 additional sets) because parasitaemia may be below the detection threshold during early infection.";

  }

  /*
  ---------------------------------------------------------
  MIXED MALARIA INFECTION
  ---------------------------------------------------------
  */

  else if (

    mixedSpecies

  ) {

    impression =
      "Mixed Plasmodium species infection.";

    recommendation =
      "Treat according to current malaria treatment guidelines for mixed-species infection. Prompt treatment is recommended.";

  }

  /*
  ---------------------------------------------------------
  PLASMODIUM FALCIPARUM
  ---------------------------------------------------------
  */

  else if (

    pf

  ) {

    impression =
      "Plasmodium falciparum malaria.";

    recommendation =
      "Initiate appropriate antimalarial therapy immediately according to national or WHO treatment guidelines. Assess for features of severe malaria.";

  }

  /*
  ---------------------------------------------------------
  PLASMODIUM VIVAX
  ---------------------------------------------------------
  */

  else if (

    pv

  ) {

    impression =
      "Plasmodium vivax malaria.";

    recommendation =
      "Treat with an appropriate blood-stage antimalarial. Where appropriate and safe, consider radical cure after assessment for G6PD deficiency.";

  }

  /*
  ---------------------------------------------------------
  PLASMODIUM MALARIAE
  ---------------------------------------------------------
  */

  else if (

    pm

  ) {

    impression =
      "Plasmodium malariae malaria.";

    recommendation =
      "Treat according to current malaria treatment guidelines and monitor clinical response.";

  }

  /*
  ---------------------------------------------------------
  PLASMODIUM OVALE
  ---------------------------------------------------------
  */

  else if (

    po

  ) {

    impression =
      "Plasmodium ovale malaria.";

    recommendation =
      "Treat with an appropriate blood-stage antimalarial. Radical cure may be considered after assessment for G6PD deficiency.";

  }

  /*
  ---------------------------------------------------------
  UNSPECIATED MALARIA
  ---------------------------------------------------------
  */

  else if (

    microscopyPositive ||
    rdtPositive

  ) {

    impression =
      "Malaria infection detected.";

    recommendation =
      "Treat according to current malaria treatment guidelines. Species identification should be performed where possible.";

  }

  /*
  ---------------------------------------------------------
  HIGH PARASITAEMIA
  ---------------------------------------------------------
  */

  if (

    parasitaemia === "High"

  ) {

    interpretation +=
      "High parasite density is associated with an increased risk of severe malaria and requires urgent clinical assessment.\n\n";

    recommendation +=
      " Evaluate immediately for severe malaria and organ dysfunction.";

  }

  /*
  ---------------------------------------------------------
  LOW PARASITAEMIA
  ---------------------------------------------------------
  */

  if (

    parasitaemia === "Low" &&
    microscopyPositive

  ) {

    interpretation +=
      "Low-level parasitaemia is present. Clinical correlation is important because symptoms may still be significant depending on host immunity.\n\n";

  }

  /*
  ---------------------------------------------------------
  FALCIPARUM + HIGH PARASITAEMIA
  ---------------------------------------------------------
  */

  if (

    pf &&
    parasitaemia === "High"

  ) {

    interpretation +=
      "The combination of Plasmodium falciparum infection and high parasitaemia substantially increases the likelihood of severe malaria.\n\n";

  }

  /*
  ---------------------------------------------------------
  RDT POSITIVE ONLY
  ---------------------------------------------------------
  */

  if (

    rdtPositive &&
    !microscopyPositive

  ) {

    interpretation +=
      "A positive malaria RDT in the absence of demonstrable parasites on microscopy should be interpreted cautiously and correlated with treatment history and repeat microscopy where appropriate.\n\n";

  }

  /*
  ---------------------------------------------------------
  MICROSCOPY POSITIVE ONLY
  ---------------------------------------------------------
  */

  if (

    microscopyPositive &&
    !rdtPositive &&
    rdt

  ) {

    interpretation +=
      "Positive microscopy remains diagnostic despite a negative RDT and should guide clinical management.\n\n";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "Malaria parasites not detected.":

      recommendation =
        "Malaria was not demonstrated on the submitted specimen. If clinical suspicion remains high, repeat thick and thin blood film examination every 12–24 hours (up to three sets) and investigate alternative causes of fever.";

      break;

    case "Plasmodium falciparum malaria.":

      recommendation =
        "Commence appropriate antimalarial therapy according to current national or WHO guidelines. Assess immediately for features of severe malaria and monitor parasite clearance where clinically indicated.";

      break;

    case "Plasmodium vivax malaria.":

      recommendation =
        "Treat according to current treatment guidelines. Where appropriate, assess G6PD status before administering radical cure to eradicate dormant liver stages.";

      break;

    case "Plasmodium malariae malaria.":

      recommendation =
        "Treat according to current malaria treatment guidelines. Monitor clinical response and parasite clearance.";

      break;

    case "Plasmodium ovale malaria.":

      recommendation =
        "Treat according to current guidelines. Consider radical cure after confirmation of adequate G6PD activity.";

      break;

    case "Mixed Plasmodium species infection.":

      recommendation =
        "Treat according to current recommendations for mixed-species malaria. Careful follow-up is advised.";

      break;

    case "Malaria infection detected.":

      recommendation =
        "Treat according to current malaria treatment guidelines. Species identification and parasite quantification should be performed where possible.";

      break;

    default:

      recommendation =
        recommendation ||
        "Interpret malaria findings together with clinical presentation, travel history and epidemiological risk.";

  }

  /* ======================================================
     FOLLOW-UP COMMENTS
  ====================================================== */

  if (microscopyPositive) {

    interpretation +=
      "Follow-up microscopy may be useful to assess parasite clearance after initiation of treatment where clinically indicated.\n\n";

  }

  if (pf) {

    interpretation +=
      "Plasmodium falciparum infection may progress rapidly. Prompt recognition and treatment are essential to reduce the risk of severe disease and mortality.\n\n";

  }

  if (pv || po) {

    interpretation +=
      "Plasmodium vivax and Plasmodium ovale can relapse because of dormant liver hypnozoites. Radical cure should only be given after assessment for G6PD deficiency where applicable.\n\n";

  }

  if (parasitaemia === "High") {

    interpretation +=
      "High parasite density should prompt careful assessment for complications such as severe anaemia, cerebral malaria, acute kidney injury, respiratory distress and hypoglycaemia.\n\n";

  }

  /* ======================================================
     LIMITATIONS
  ====================================================== */

  interpretation +=
    "A negative malaria smear does not completely exclude malaria, particularly during early infection or when parasite density is very low. Repeat microscopy may be required if clinical suspicion remains high.\n\n";

  interpretation +=
    "Rapid diagnostic tests detect parasite antigens and may remain positive for a period after successful treatment. They should be interpreted together with microscopy and the clinical picture.\n\n";

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Malaria results should always be interpreted together with the patient's symptoms, travel or exposure history, previous antimalarial therapy, complete blood count and other relevant laboratory investigations. Microscopy remains the reference method for parasite detection, species identification and parasite quantification.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation: interpretation.trim(),

    impression,

    recommendation,

  });

}