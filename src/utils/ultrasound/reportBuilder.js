/* ==========================================================
   REPORT BUILDER
   Shared helper functions for all ultrasound report generators.
========================================================== */

/**
 * Removes null, undefined and empty strings.
 */
export function clean(items = []) {
  return items.filter(
    (item) =>
      item !== null &&
      item !== undefined &&
      item !== ""
  );
}

/**
 * Builds a simple report section.
 */
export function buildSection(
  title,
  body = [],
  notes = ""
) {
  return clean([
    title,
    ...(Array.isArray(body) ? body : [body]),
    notes,
    "",
  ]);
}

/**
 * Builds an organ/system report.
 */
export function buildOrgan({
  title,
  subject,
  descriptions = [],
  abnormalities = [],
  normalStatement = "",
  notes = "",
}) {
  const section = [];

  section.push(title);

  /* -------------------------
     Main descriptive sentence
  ------------------------- */

  const desc = clean(descriptions);

  if (desc.length) {
    section.push(
      `${subject} ${desc.join(", ")}.`
    );
  } else {
    section.push(`${subject}.`);
  }

  /* -------------------------
     Findings
  ------------------------- */

  const findings = clean(abnormalities);

  if (findings.length) {
    findings.forEach((item) =>
      section.push(
        item.endsWith(".")
          ? item
          : `${item}.`
      )
    );
  } else if (normalStatement) {
    section.push(
      normalStatement.endsWith(".")
        ? normalStatement
        : `${normalStatement}.`
    );
  }

  /* -------------------------
     Additional notes
  ------------------------- */

  if (notes) {
    section.push(notes);
  }

  section.push("");

  return section;
}

/**
 * Builds an impression list.
 */
export function buildImpression(
  impressions = []
) {
  return clean(impressions);
}

/**
 * Builds a recommendation list.
 */
export function buildRecommendation(
  recommendations = []
) {
  return clean(recommendations);
}

/**
 * Converts an array of report lines
 * into the final printable report.
 */
export function finalizeReport(
  report = []
) {
  return clean(report).join("\n\n");
}