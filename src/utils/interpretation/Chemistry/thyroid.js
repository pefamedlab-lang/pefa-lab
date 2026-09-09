import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   THYROID FUNCTION INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • TSH
   • Free T4 (FT4)
   • Free T3 (FT3)
   • Total T4 (optional)
   • Total T3 (optional)

   Detects
   ----------------------------------------------------------
   • Normal thyroid function
   • Primary hypothyroidism
   • Subclinical hypothyroidism
   • Primary hyperthyroidism
   • Subclinical hyperthyroidism
   • Secondary hypothyroidism
   • Possible non-thyroidal illness
========================================================== */

export default function interpretThyroid(

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
      "Total T4"
    );

  const t3 =
    getNumericResult(
      resultMap,
      "Total T3"
    );

  /* ======================================================
     REFERENCE LIMITS

     (May later be loaded dynamically from the LIS)
  ====================================================== */

  const TSH_LOW = 0.40;
  const TSH_HIGH = 4.50;

  const FT4_LOW = 10;
  const FT4_HIGH = 22;

  const FT3_LOW = 3.5;
  const FT3_HIGH = 6.5;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const tshHigh =
    tsh !== null &&
    tsh > TSH_HIGH;

  const tshLow =
    tsh !== null &&
    tsh < TSH_LOW;

  const ft4High =
    ft4 !== null &&
    ft4 > FT4_HIGH;

  const ft4Low =
    ft4 !== null &&
    ft4 < FT4_LOW;

  const ft3High =
    ft3 !== null &&
    ft3 > FT3_HIGH;

  const ft3Low =
    ft3 !== null &&
    ft3 < FT3_LOW;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function isHigh(
    value,
    upperLimit
  ) {

    return (
      value !== null &&
      value > upperLimit
    );

  }

  function isLow(
    value,
    lowerLimit
  ) {

    return (
      value !== null &&
      value < lowerLimit
    );

  }

  /* ======================================================
     TSH
  ====================================================== */

  if (tsh !== null) {

    if (!tshLow && !tshHigh) {

      interpretation +=
        "Thyroid-stimulating hormone (TSH) is within the reference interval.\n\n";

    }

    else if (tshHigh) {

      interpretation +=
        "TSH is elevated, indicating increased pituitary stimulation of the thyroid gland. This finding is compatible with hypothyroidism when interpreted alongside thyroid hormone concentrations.\n\n";

    }

    else {

      interpretation +=
        "TSH is suppressed below the reference interval, suggesting increased thyroid hormone activity or reduced pituitary stimulation. Interpretation should be made together with free thyroid hormone concentrations.\n\n";

    }

  }

  /* ======================================================
     FREE T4
  ====================================================== */

  if (ft4 !== null) {

    if (!ft4Low && !ft4High) {

      interpretation +=
        "Free thyroxine (FT4) is within the reference interval.\n\n";

    }

    else if (ft4Low) {

      interpretation +=
        "Free thyroxine (FT4) is reduced, indicating decreased circulating thyroid hormone.\n\n";

    }

    else {

      interpretation +=
        "Free thyroxine (FT4) is elevated, indicating increased circulating thyroid hormone.\n\n";

    }

  }

  /* ======================================================
     FREE T3
  ====================================================== */

  if (ft3 !== null) {

    if (!ft3Low && !ft3High) {

      interpretation +=
        "Free triiodothyronine (FT3) is within the reference interval.\n\n";

    }

    else if (ft3Low) {

      interpretation +=
        "Free triiodothyronine (FT3) is reduced.\n\n";

    }

    else {

      interpretation +=
        "Free triiodothyronine (FT3) is elevated, supporting increased thyroid hormone activity.\n\n";

    }

  }

  /* ======================================================
     COMBINED THYROID HORMONE ASSESSMENT
  ====================================================== */

  if (

    ft4High &&
    ft3High

  ) {

    interpretation +=
      "Concurrent elevation of FT4 and FT3 is consistent with biochemical thyrotoxicosis.\n\n";

  }

  else if (

    ft4Low &&
    ft3Low

  ) {

    interpretation +=
      "Concurrent reduction of FT4 and FT3 is consistent with biochemical hypothyroidism.\n\n";

  }

  else if (

    ft4High &&
    !ft3High

  ) {

    interpretation +=
      "Elevation of FT4 with a normal FT3 may represent early thyrotoxicosis, thyroid hormone therapy or other causes requiring clinical correlation.\n\n";

  }

  else if (

    ft3High &&
    !ft4High

  ) {

    interpretation +=
      "Isolated FT3 elevation may occur in early or T3-predominant hyperthyroidism.\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Primary Hypothyroidism
  ------------------------------------------------------ */

  if (

    tshHigh &&
    ft4Low

  ) {

    impression =
      "Biochemical findings are consistent with primary hypothyroidism.";

    recommendation =
      "Interpret together with the clinical findings. Measurement of thyroid peroxidase antibodies (TPOAb) may help identify autoimmune thyroiditis. Thyroid hormone replacement should be considered where clinically indicated.";

  }

  /*
     Subclinical Hypothyroidism
  ------------------------------------------------------ */

  else if (

    tshHigh &&
    !ft4Low &&
    !ft4High

  ) {

    impression =
      "Biochemical findings are consistent with subclinical hypothyroidism.";

    recommendation =
      "Repeat thyroid function testing after an appropriate interval. Management should consider symptoms, pregnancy status, cardiovascular risk and TSH level.";

  }

  /*
     Primary Hyperthyroidism
  ------------------------------------------------------ */

  else if (

    tshLow &&
    (
      ft4High ||
      ft3High
    )

  ) {

    impression =
      "Biochemical findings are consistent with primary hyperthyroidism (thyrotoxicosis).";

    recommendation =
      "Clinical correlation is recommended. Consider Graves' disease, toxic multinodular goitre or toxic adenoma. Thyroid antibody testing and thyroid imaging may be indicated.";

  }

  /*
     Subclinical Hyperthyroidism
  ------------------------------------------------------ */

  else if (

    tshLow &&
    !ft4High &&
    !ft4Low &&
    !ft3High &&
    !ft3Low

  ) {

    impression =
      "Biochemical findings are consistent with subclinical hyperthyroidism.";

    recommendation =
      "Repeat thyroid function tests and assess for persistent TSH suppression. Clinical management depends on age, cardiovascular risk and symptom profile.";

  }

  /*
     Secondary (Central) Hypothyroidism
  ------------------------------------------------------ */

  else if (

    !tshHigh &&
    !tshLow &&
    ft4Low

  ) {

    impression =
      "Pattern is suggestive of secondary (central) hypothyroidism.";

    recommendation =
      "Assessment of pituitary function and endocrine specialist review are recommended. Correlation with pituitary imaging may be appropriate.";

  }

  /*
     Possible Non-thyroidal Illness
  ------------------------------------------------------ */

  else if (

    ft3Low &&
    !ft4Low &&
    !tshHigh &&
    !tshLow

  ) {

    impression =
      "Pattern may be compatible with non-thyroidal illness (euthyroid sick syndrome).";

    recommendation =
      "Interpret within the clinical context of acute or chronic systemic illness. Repeat thyroid function testing after recovery may be appropriate.";

  }

  /*
     Normal Thyroid Function
  ------------------------------------------------------ */

  else {

    impression =
      "Thyroid function tests are within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation is advised.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("within acceptable")

  ) {

    recommendation =
      "Routine clinical correlation is advised. Repeat thyroid function testing only if clinically indicated.";

  }

  else if (

    impression.includes("primary hypothyroidism")

  ) {

    recommendation =
      "Correlation with clinical features is recommended. Consider thyroid peroxidase antibody (TPOAb) testing to assess for autoimmune thyroiditis. Thyroid hormone replacement therapy should be considered where appropriate.";

  }

  else if (

    impression.includes("subclinical hypothyroidism")

  ) {

    recommendation =
      "Repeat thyroid function testing after 6–12 weeks or according to clinical circumstances. Management should consider symptoms, pregnancy, cardiovascular risk and the degree of TSH elevation.";

  }

  else if (

    impression.includes("primary hyperthyroidism")

  ) {

    recommendation =
      "Further evaluation with thyroid autoantibodies (TRAb where appropriate), thyroid ultrasound or radionuclide imaging may be indicated. Endocrinology referral should be considered.";

  }

  else if (

    impression.includes("subclinical hyperthyroidism")

  ) {

    recommendation =
      "Repeat thyroid function tests to confirm persistent TSH suppression. Management depends on age, symptoms, cardiovascular risk and bone health.";

  }

  else if (

    impression.includes("secondary")

  ) {

    recommendation =
      "Assessment of pituitary hormones and pituitary imaging should be considered. Endocrinology referral is recommended.";

  }

  else if (

    impression.includes("non-thyroidal illness")

  ) {

    recommendation =
      "Thyroid function abnormalities may resolve following recovery from systemic illness. Repeat testing after clinical recovery is recommended unless thyroid disease is strongly suspected.";

  }

  /* ======================================================
     RETURN INTERPRETATION
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}