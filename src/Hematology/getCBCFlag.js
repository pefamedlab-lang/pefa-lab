import { cbcReferenceRanges } from "./cbcReferenceRanges";

export const getCBCFlag = (
  parameterCode,
  value,
  sex,
  age
) => {
  const numericValue =
    Number(value);

  if (
    value === "" ||
    isNaN(numericValue)
  ) {
    return "";
  }

  const parameter =
    cbcReferenceRanges[
      parameterCode
    ];

  if (!parameter)
    return "";

  let range = null;

  /* =========================
     INFANT
  ========================= */

  if (
    age < 1 &&
    parameter.infant
  ) {
    range =
      parameter.infant;
  }

  /* =========================
     CHILD
  ========================= */

  else if (
    age < 18 &&
    parameter.child
  ) {
    range =
      parameter.child;
  }

  /* =========================
     ADULT
  ========================= */

  else if (
    parameter[sex]
  ) {
    range =
      parameter[sex];
  }

  if (!range)
    return "";

  /* =========================
     CRITICAL VALUES
  ========================= */

  /* HB */

  if (
    parameterCode ===
      "hb" &&
    numericValue < 6
  ) {
    return "CRITICAL";
  }

  /* WBC */

  if (
    parameterCode ===
      "wbc" &&
    numericValue > 50
  ) {
    return "CRITICAL";
  }

  /* PLATELET */

  if (
    parameterCode ===
      "platelet" &&
    numericValue < 20
  ) {
    return "CRITICAL";
  }

  /* =========================
     NORMAL FLAGS
  ========================= */

  if (
    numericValue <
    range.min
  ) {
    return "L";
  }

  if (
    numericValue >
    range.max
  ) {
    return "H";
  }

  return "N";
};