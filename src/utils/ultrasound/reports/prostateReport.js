/* ===========================================================
   PROSTATE ULTRASOUND REPORT GENERATOR
=========================================================== */

function add(report, text) {
  if (text && String(text).trim()) {
    report.push(String(text).trim());
  }
}

export function generateProstateReport(data = {}) {
  const report = [];

  /* =====================
     PROSTATE
  ===================== */

  if (
    data.length ||
    data.width ||
    data.height
  ) {
    add(
      report,
      `The prostate measures ${data.length || "—"} × ${
        data.width || "—"
      } × ${data.height || "—"} cm.`
    );
  }

  if (data.volume) {
    add(
      report,
      `Estimated prostate volume is ${data.volume} ml.`
    );
  }

  if (data.echotexture) {
    add(
      report,
      `The prostate demonstrates ${data.echotexture.toLowerCase()} echotexture.`
    );
  }

  if (data.capsule) {
    add(
      report,
      `The prostatic capsule is ${data.capsule.toLowerCase()}.`
    );
  }

  if (data.median_lobe) {
    add(
      report,
      `Median lobe is ${data.median_lobe.toLowerCase()}.`
    );
  }

  if (data.seminal_vesicles) {
    add(
      report,
      `Seminal vesicles are ${data.seminal_vesicles.toLowerCase()}.`
    );
  }

  if (data.calcification === "Present") {
    add(
      report,
      "Prostatic calcifications are present."
    );
  }

  if (data.prostate_nodule === "Present") {
    add(
      report,
      "A focal prostatic nodule is identified."
    );
  }

  /* =====================
     URINARY BLADDER
  ===================== */

  if (data.bladder_distension) {
    add(
      report,
      `The urinary bladder is ${data.bladder_distension.toLowerCase()}.`
    );
  }

  if (data.bladder_wall) {
    add(
      report,
      `The bladder wall is ${data.bladder_wall.toLowerCase()}.`
    );
  }

  if (data.bladder_stone === "Present") {
    add(
      report,
      "Urinary bladder calculus is present."
    );
  }

  if (data.bladder_mass === "Present") {
    add(
      report,
      "A urinary bladder mass is identified."
    );
  }

  if (data.residual_urine !== undefined && data.residual_urine !== "") {
    add(
      report,
      `Post-void residual urine volume measures ${data.residual_urine} ml.`
    );
  }

  if (data.bladder_notes) {
    add(report, data.bladder_notes);
  }

  /* =====================
     ADDITIONAL FINDINGS
  ===================== */

  if (data.additional_findings) {
    add(report, data.additional_findings);
  }

  return report.join("\n");
}