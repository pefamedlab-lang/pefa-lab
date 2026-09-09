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
  let result =
    report.result_data ??
    report.result ??
    {};

  if (typeof result === "string") {
    try {
      result = JSON.parse(result);
    } catch {
      result = {};
    }
  }

  const specimen = String(
    result.specimen ??
      report.specimen ??
      ""
  ).toLowerCase();

  const organism = String(
    result.organism ??
      result.organismIsolated ??
      "No Growth"
  ).trim();

  const sensitivity = Array.isArray(result.sensitivity)
    ? result.sensitivity
    : [];

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  if (
    report.interpretation?.trim() ||
    report.impression?.trim() ||
    report.recommendation?.trim()
  ) {
    return createInterpretation({
      interpretation: report.interpretation,
      impression: report.impression,
      recommendation: report.recommendation,
    });
  }

  const organismLower = organism.toLowerCase();

  /* ======================================================
     NEGATIVE CULTURE
  ====================================================== */

  if (
    [
      "no growth",
      "nil growth",
      "sterile",
      "no pathogen isolated",
    ].includes(organismLower)
  ) {
    return createInterpretation({
      interpretation:
        "No pathogenic organism was isolated after the recommended incubation period.",
      impression:
        "Culture negative.",
      recommendation:
        "Interpret alongside the clinical presentation. Repeat culture may be considered if symptoms persist or antimicrobial therapy was initiated before specimen collection.",
    });
  }

  /* ======================================================
     MIXED GROWTH / CONTAMINATION
  ====================================================== */

  if (
    organismLower.includes("mixed growth") ||
    organismLower.includes("mixed flora") ||
    organismLower.includes("contamin")
  ) {
    return createInterpretation({
      interpretation:
        "Mixed bacterial growth is present and may represent specimen contamination.",
      impression:
        "Mixed bacterial growth.",
      recommendation:
        "Repeat specimen collection using appropriate aseptic technique if clinically indicated.",
    });
  }

  /* ======================================================
     BUILD INTERPRETATION
  ====================================================== */

  let interpretation =
    `${organism} was isolated from the submitted ${
      specimen || "specimen"
    }.`;


  const susceptible = sensitivity
    .filter(
      item =>
        String(item.result).toUpperCase() === "S"
    )
    .map(item => item.antibiotic);

  const intermediate = sensitivity
    .filter(
      item =>
        String(item.result).toUpperCase() === "I"
    )
    .map(item => item.antibiotic);

  const resistant = sensitivity
    .filter(
      item =>
        String(item.result).toUpperCase() === "R"
    )
    .map(item => item.antibiotic);

  if (susceptible.length) {
    interpretation +=
      ` The isolate is susceptible to ${susceptible.join(", ")}.`;
  }

  if (intermediate.length) {
    interpretation +=
      ` Intermediate susceptibility was demonstrated to ${intermediate.join(", ")}.`;
  }

  if (resistant.length) {
    interpretation +=
      ` Resistance was demonstrated to ${resistant.join(", ")}.`;
  }

  /* ======================================================
     SPECIAL ORGANISMS
  ====================================================== */

  if (
    organismLower.includes("candida")
  ) {
    interpretation +=
      " Isolation of Candida species should be interpreted in the clinical context, as colonisation may occur.";
  }

  if (
    organismLower.includes("plasmodium") ||
    organismLower.includes("trichomonas") ||
    organismLower.includes("entamoeba") ||
    organismLower.includes("giardia")
  ) {
    interpretation +=
      " A pathogenic parasite has been identified.";
  }

  /* ======================================================
     MULTI-DRUG RESISTANT ORGANISMS
  ====================================================== */

  if (
    organismLower.includes("mrsa") ||
    organismLower.includes("esbl") ||
    organismLower.includes("vre") ||
    organismLower.includes("cre")
  ) {
    interpretation +=
      " The isolate demonstrates important antimicrobial resistance characteristics.";
  }

  /* ======================================================
     IMPRESSION
  ====================================================== */

  let impression =
    "Positive microbiological culture.";

  if (specimen.includes("urine")) {
    impression =
      "Findings are consistent with urinary tract infection.";
  }
  else if (specimen.includes("blood")) {
    impression =
      "Positive blood culture.";
  }
  else if (specimen.includes("stool")) {
    impression =
      "Enteric pathogen isolated.";
  }
  else if (
    specimen.includes("wound") ||
    specimen.includes("pus")
  ) {
    impression =
      "Wound infection demonstrated.";
  }
  else if (
    specimen.includes("hvs") ||
    specimen.includes("vaginal")
  ) {
    impression =
      "Genital tract pathogen isolated.";
  }
  else if (
    specimen.includes("sputum")
  ) {
    impression =
      "Respiratory pathogen isolated.";
  }
  else if (
    specimen.includes("csf")
  ) {
    impression =
      "Central nervous system pathogen isolated.";
  }

  /* ======================================================
     RECOMMENDATION
  ====================================================== */

  let recommendation =
    "Antimicrobial therapy should be guided by the antimicrobial susceptibility profile together with the patient's clinical condition.";

  if (
    organismLower.includes("mrsa") ||
    organismLower.includes("esbl") ||
    organismLower.includes("vre") ||
    organismLower.includes("cre")
  ) {
    recommendation =
      "Implement appropriate infection prevention measures and select antimicrobial therapy based on susceptibility results and antimicrobial stewardship principles.";
  }

  if (
    specimen.includes("blood")
  ) {
    recommendation +=
      " Repeat blood cultures and correlate with inflammatory markers where clinically indicated.";
  }

  return createInterpretation({
    interpretation,
    impression,
    recommendation,
  });
}

/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default interpretMicrobiology;