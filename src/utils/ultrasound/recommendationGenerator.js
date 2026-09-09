/* ===========================================================
   ULTRASOUND RECOMMENDATION GENERATOR
=========================================================== */

/* ===========================================================
   ABDOMINO-PELVIC ULTRASOUND
=========================================================== */

export function generateAbdominoPelvicRecommendation(data = {}) {
  const recommendations = [];

  /* =====================
     LIVER
  ===================== */

  if (
    data.liver === "Fatty Liver" ||
    data.liver === "Hepatomegaly"
  ) {
    recommendations.push(
      "Clinical correlation and Liver Function Tests are advised."
    );
  }

  if (data.liver === "Mass") {
    recommendations.push(
      "Triphasic CT/MRI of the liver is recommended."
    );
  }

  /* =====================
     GALL BLADDER
  ===================== */

  if (data.gallBladder === "Stone") {
    recommendations.push(
      "Surgical consultation is advised."
    );
  }

  if (data.gallBladder === "Acute Cholecystitis") {
    recommendations.push(
      "Urgent surgical review is recommended."
    );
  }

  /* =====================
     PANCREAS
  ===================== */

  if (data.pancreas === "Pancreatitis") {
    recommendations.push(
      "Serum amylase/lipase and clinical correlation."
    );
  }

  if (data.pancreas === "Mass") {
    recommendations.push(
      "Contrast-enhanced CT scan is recommended."
    );
  }

  /* =====================
     KIDNEYS
  ===================== */

  if (
    data.rightKidney === "Stone" ||
    data.leftKidney === "Stone"
  ) {
    recommendations.push(
      "Urology review is advised."
    );
  }

  if (
    data.rightKidney === "Hydronephrosis" ||
    data.leftKidney === "Hydronephrosis"
  ) {
    recommendations.push(
      "Further evaluation for urinary tract obstruction."
    );
  }

  /* =====================
     BLADDER
  ===================== */

  if (data.bladder === "Mass") {
    recommendations.push(
      "Cystoscopy and urology consultation are recommended."
    );
  }

  /* =====================
     UTERUS
  ===================== */

  if (data.uterus === "Fibroid") {
    recommendations.push(
      "Gynecological review is advised."
    );
  }

  if (data.uterus === "Pregnancy") {
    recommendations.push(
      "Routine antenatal care."
    );
  }

  /* =====================
     ENDOMETRIUM
  ===================== */

  if (data.endometrium === "Thickened") {
    recommendations.push(
      "Gynecological evaluation is recommended."
    );
  }

  /* =====================
     OVARIES
  ===================== */

  if (
    data.rightOvary === "Simple Cyst" ||
    data.leftOvary === "Simple Cyst"
  ) {
    recommendations.push(
      "Follow-up pelvic ultrasound in 6–12 weeks."
    );
  }

  if (
    data.rightOvary === "Complex Cyst" ||
    data.leftOvary === "Complex Cyst"
  ) {
    recommendations.push(
      "Further evaluation with MRI or gynecological review."
    );
  }

  /* =====================
     POUCH OF DOUGLAS
  ===================== */

  if (data.pouchOfDouglas === "Free Fluid") {
    recommendations.push(
      "Clinical correlation is advised."
    );
  }

  /* =====================
     NORMAL STUDY
  ===================== */

  if (recommendations.length === 0) {
    recommendations.push(
      "No further imaging is required."
    );
  }

  return recommendations;
}