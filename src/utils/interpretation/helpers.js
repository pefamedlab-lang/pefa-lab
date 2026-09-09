export function defaultInterpretation() {

  return createInterpretation({

    interpretation:
      "Interpretation is not available for this test.",

    impression:
      "No automated interpretation.",

    recommendation:
      "Interpret together with the patient's clinical findings.",

  });

}

/* ==========================================================
   INTERPRETATION HELPERS
========================================================== */

/**
 * Safely converts a laboratory result to a numeric value.
 *
 * @param {Object} resultMap
 * @param {string} analyte
 * @returns {number|null}
 */
export function getNumericResult(resultMap = {}, analyte) {
  const item = resultMap?.[analyte];

  if (!item) return null;

  const value =
    item.value ??
    item.result ??
    item.numeric_result ??
    item.numericValue;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

/**
 * Returns the raw textual result.
 *
 * @param {Object} resultMap
 * @param {string} analyte
 * @returns {string|null}
 */
export function getTextResult(resultMap = {}, analyte) {
  const item = resultMap?.[analyte];

  if (!item) return null;

  const value =
    item.result ??
    item.value ??
    item.text ??
    item.display;

  if (value === undefined || value === null) {
    return null;
  }

  return String(value).trim();
}

/**
 * Determines whether a value exists.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function hasValue(value) {
  return value !== null &&
         value !== undefined &&
         value !== "";
}

/**
 * Checks if a numeric value lies within a reference interval.
 *
 * @param {number|null} value
 * @param {number} low
 * @param {number} high
 * @returns {boolean}
 */
export function isWithinRange(value, low, high) {
  return (
    value !== null &&
    value >= low &&
    value <= high
  );
}

/**
 * Standardizes interpretation output.
 *
 * @param {Object} data
 * @returns {Object}
 */
export function createInterpretation({
  interpretation = "",
  impression = "",
  recommendation = "",
} = {}) {
  return {
    interpretation: interpretation.trim(),
    impression: impression.trim(),
    recommendation: recommendation.trim(),
  };
}

/**
 * Checks whether the reporting scientist has supplied
 * a manual interpretation.
 *
 * @param {Object} report
 * @returns {Object|null}
 */
export function getScientistOverride(report = {}) {
  const interpretation =
    report.interpretation?.trim();

  const impression =
    report.impression?.trim();

  const recommendation =
    report.recommendation?.trim();

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

  return null;
}