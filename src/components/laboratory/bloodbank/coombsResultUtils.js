/* ============================================================
   PEFA LAB — COOMBS RESULT UTILITIES
   PATH:
   src/components/laboratory/bloodbank/coombsResultUtils.js
   ============================================================ */

export const COOMBS_REACTION_GRADES = [
  "Negative",
  "±",
  "1+",
  "2+",
  "3+",
  "4+",
];

export const QUALITATIVE_OPTIONS = [
  "Positive",
  "Negative",
  "Not Tested",
];

export function isPositive(value) {
  if (!value) return false;

  const normalized = String(value).trim().toLowerCase();

  return (
    normalized === "positive" ||
    normalized === "1+" ||
    normalized === "2+" ||
    normalized === "3+" ||
    normalized === "4+"
  );
}

export function isNegative(value) {
  if (!value) return false;

  const normalized = String(value).trim().toLowerCase();

  return normalized === "negative";
}

/* ============================================================
   DAT INTERPRETATION
   ============================================================ */

export function getDATFinalResult({
  polyspecificAHG,
  antiIgG,
  antiC3d,
}) {
  const iggPositive = isPositive(antiIgG);
  const c3Positive = isPositive(antiC3d);
  const polyspecificPositive = isPositive(polyspecificAHG);

  if (iggPositive && c3Positive) {
    return "Positive — IgG + Complement";
  }

  if (iggPositive) {
    return "Positive — IgG";
  }

  if (c3Positive) {
    return "Positive — Complement";
  }

  if (polyspecificPositive) {
    return "Positive";
  }

  if (
    isNegative(polyspecificAHG) &&
    (isNegative(antiIgG) || antiIgG === "Not Tested") &&
    (isNegative(antiC3d) || antiC3d === "Not Tested")
  ) {
    return "Negative";
  }

  return "";
}

export function getDATInterpretation(finalResult) {
  switch (finalResult) {
    case "Positive — IgG":
      return "IgG detected on the patient's red blood cells. Clinical correlation is recommended.";

    case "Positive — Complement":
      return "Complement detected on the patient's red blood cells. Clinical correlation is recommended.";

    case "Positive — IgG + Complement":
      return "IgG and complement detected on the patient's red blood cells. Clinical correlation and further immunohematological investigation are recommended.";

    case "Positive":
      return "A positive Direct Antiglobulin Test was obtained. Clinical correlation and further investigation may be indicated.";

    case "Negative":
      return "No detectable IgG and/or complement coating of the patient's red blood cells was detected by the method used.";

    default:
      return "";
  }
}

/* ============================================================
   IAT INTERPRETATION
   ============================================================ */

export function getIATFinalResult({
  screeningCellI,
  screeningCellII,
  screeningCellIII,
  ahgPhase,
}) {
  if (
    isPositive(screeningCellI) ||
    isPositive(screeningCellII) ||
    isPositive(screeningCellIII) ||
    isPositive(ahgPhase)
  ) {
    return "Positive";
  }

  if (
    isNegative(screeningCellI) &&
    isNegative(screeningCellII) &&
    isNegative(screeningCellIII) &&
    isNegative(ahgPhase)
  ) {
    return "Negative";
  }

  return "";
}

export function getIATInterpretation(finalResult) {
  if (finalResult === "Positive") {
    return "An antibody capable of reacting with the reagent red cells was detected. Further antibody identification and compatibility testing may be indicated.";
  }

  if (finalResult === "Negative") {
    return "No detectable unexpected red-cell antibodies were detected by the method used.";
  }

  return "";
}