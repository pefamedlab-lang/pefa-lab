/* ===========================================================
   SOFT TISSUE ULTRASOUND REPORT GENERATOR
=========================================================== */

function add(report, text) {
  if (text && String(text).trim()) {
    report.push(String(text).trim());
  }
}

export function generateSoftTissueReport(data = {}) {
  const report = [];

  /* =====================
     SITE
  ===================== */

  if (data.site) {
    add(
      report,
      `Ultrasound examination was performed over the ${data.site}.`
    );
  }

  /* =====================
     MASS
  ===================== */

  if (data.mass) {
    add(
      report,
      `Soft tissue mass: ${data.mass}.`
    );
  }

  /* =====================
     COLLECTION
  ===================== */

  if (data.collection) {
    add(
      report,
      `Fluid collection: ${data.collection}.`
    );
  }

  /* =====================
     FOREIGN BODY
  ===================== */

  if (data.foreignBody) {
    add(
      report,
      `Foreign body: ${data.foreignBody}.`
    );
  }

  /* =====================
     VASCULARITY
  ===================== */

  if (data.vascularity) {
    add(
      report,
      `Colour Doppler demonstrates ${data.vascularity}.`
    );
  }

  /* =====================
     SURROUNDING TISSUES
  ===================== */

  if (data.surroundingTissues) {
    add(
      report,
      `Surrounding soft tissues: ${data.surroundingTissues}.`
    );
  }

  /* =====================
     ADDITIONAL FINDINGS
  ===================== */

  if (data.additional_findings) {
    add(report, data.additional_findings);
  }

  return report.join("\n");
}