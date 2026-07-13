import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   THYROID FUNCTION INTERPRETATION ENGINE

   Tests Supported
   ----------------
   • TSH
   • Free T3 (FT3)
   • Free T4 (FT4)
   • Total T3
   • Total T4
   • Anti-TPO
   • Anti-Thyroglobulin
   • TRAb

   Detects
   ----------------
   • Euthyroid
   • Primary Hypothyroidism
   • Primary Hyperthyroidism
   • Subclinical Hypothyroidism
   • Subclinical Hyperthyroidism
   • Secondary Hypothyroidism
   • Graves Disease
   • Autoimmune Thyroiditis
========================================================== */

import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

export default function interpretThyroid(

  report = {},

  resultMap = {}

) {

  const tsh =
    getNumericResult(
      resultMap,
      "TSH"
    );

  const ft4 =
    getNumericResult(
      resultMap,
      "FT4"
    ) ??
    getNumericResult(
      resultMap,
      "Free T4"
    );

  const ft3 =
    getNumericResult(
      resultMap,
      "FT3"
    ) ??
    getNumericResult(
      resultMap,
      "Free T3"
    );

  const t4 =
    getNumericResult(
      resultMap,
      "T4"
    );

  const t3 =
    getNumericResult(
      resultMap,
      "T3"
    );

  const antiTpo =
    getNumericResult(
      resultMap,
      "Anti-TPO"
    );

  const antiTg =
    getNumericResult(
      resultMap,
      "Anti-Thyroglobulin"
    );

  const trab =
    getNumericResult(
      resultMap,
      "TRAb"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     TSH
  ====================================================== */

  if (tsh !== null) {

    if (tsh < 0.40) {

      interpretation +=
        "TSH is suppressed.\n\n";

    }

    else if (tsh <= 4.50) {

      interpretation +=
        "TSH is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "TSH is elevated.\n\n";

    }

  }

  /* ======================================================
     FT4
  ====================================================== */

  if (ft4 !== null) {

    if (ft4 < 10) {

      interpretation +=
        "Free T4 is reduced.\n\n";

    }

    else if (ft4 <= 22) {

      interpretation +=
        "Free T4 is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Free T4 is elevated.\n\n";

    }

  }

  /* ======================================================
     FT3
  ====================================================== */

  if (ft3 !== null) {

    if (ft3 < 3.5) {

      interpretation +=
        "Free T3 is reduced.\n\n";

    }

    else if (ft3 <= 6.5) {

      interpretation +=
        "Free T3 is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Free T3 is elevated.\n\n";

    }

  }

  /* ======================================================
     TOTAL T3 / T4
  ====================================================== */

  if (t3 !== null) {

    interpretation +=
      "Total T3: " +
      t3 +
      ".\n\n";

  }

  if (t4 !== null) {

    interpretation +=
      "Total T4: " +
      t4 +
      ".\n\n";

  }

  /* ======================================================
     AUTOANTIBODIES
  ====================================================== */

  if (

    antiTpo !== null &&

    antiTpo > 35

  ) {

    interpretation +=
      "Anti-TPO antibody is positive.\n\n";

  }

  if (

    antiTg !== null &&

    antiTg > 40

  ) {

    interpretation +=
      "Anti-thyroglobulin antibody is positive.\n\n";

  }

  if (

    trab !== null &&

    trab > 1.75

  ) {

    interpretation +=
      "TSH receptor antibody (TRAb) is positive.\n\n";

  }

  /* ======================================================
     PRIMARY HYPOTHYROIDISM
  ====================================================== */

  if (

    tsh > 4.5 &&

    ft4 < 10

  ) {

    impression =
      "Primary hypothyroidism.";

    recommendation =
      "Clinical correlation is advised. Consider thyroid hormone replacement and assessment for autoimmune thyroid disease where appropriate.";

  }

  /* ======================================================
     SUBCLINICAL HYPOTHYROIDISM
  ====================================================== */

  else if (

    tsh > 4.5 &&

    ft4 >= 10 &&

    ft4 <= 22

  ) {

    impression =
      "Subclinical hypothyroidism.";

    recommendation =
      "Repeat thyroid function tests in 6–12 weeks. Anti-TPO antibody testing may help determine the risk of progression.";

  }

  /* ======================================================
     PRIMARY HYPERTHYROIDISM
  ====================================================== */

  else if (

    tsh < 0.40 &&

    (

      ft4 > 22 ||

      ft3 > 6.5

    )

  ) {

    impression =
      "Primary hyperthyroidism.";

    recommendation =
      "Clinical correlation is recommended. Endocrinology referral and thyroid imaging may be indicated.";

  }

  /* ======================================================
     SUBCLINICAL HYPERTHYROIDISM
  ====================================================== */

  else if (

    tsh < 0.40 &&

    ft4 >= 10 &&

    ft4 <= 22 &&

    ft3 >= 3.5 &&

    ft3 <= 6.5

  ) {

    impression =
      "Subclinical hyperthyroidism.";

    recommendation =
      "Repeat thyroid function testing and clinical follow-up are advised.";

  }

  /* ======================================================
     SECONDARY HYPOTHYROIDISM
  ====================================================== */

  else if (

    tsh >= 0.40 &&

    tsh <= 4.50 &&

    ft4 < 10

  ) {

    impression =
      "Possible secondary (central) hypothyroidism.";

    recommendation =
      "Further pituitary assessment and endocrinology review are recommended.";

  }

  /* ======================================================
     GRAVES DISEASE
  ====================================================== */

  if (

    trab !== null &&

    trab > 1.75 &&

    tsh < 0.40

  ) {

    impression =
      "Findings are suggestive of Graves disease.";

    recommendation =
      "Clinical correlation with thyroid ultrasound and endocrinology review is advised.";

  }

  /* ======================================================
     HASHIMOTO THYROIDITIS
  ====================================================== */

  if (

    antiTpo > 35 ||

    antiTg > 40

  ) {

    interpretation +=
      "Thyroid autoantibodies support autoimmune thyroid disease.\n\n";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  if (!impression) {

    impression =
      "Thyroid function tests are within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}