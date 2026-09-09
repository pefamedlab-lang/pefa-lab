/* ==========================================================
   PEFA LAB
   CHEMISTRY VALIDATION ENGINE
   ========================================================== */

const numeric = (
  value
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  const number =
    Number(
      String(value)
        .replace(/,/g, "")
        .trim()
    );


  return Number.isFinite(number)
    ? number
    : null;
};


/* ==========================================================
   VALIDATE CHEMISTRY FORM
   ========================================================== */

export const validateChemistryForm = ({
  analytes = [],
  parameters = {},
  requireAll = true,
} = {}) => {

  const errors = [];

  const warnings = [];


  analytes.forEach(
    (parameter) => {

      const key =
        String(
          parameter?.key ??
          parameter?.id ??
          parameter?.name ??
          parameter?.test_name ??
          ""
        )
          .trim()
          .replace(/\s+/g, "_")
          .toLowerCase();


      if (!key) {
        return;
      }


      const entry =
        parameters[key] || {};


      const required =
        parameter.required !== false;


      const calculated =
        parameter.calculated === true;


      const value =
        String(
          entry.value ?? ""
        ).trim();


      /* ----------------------------------------------------
         Required
         ---------------------------------------------------- */

      if (
        required &&
        requireAll &&
        !value
      ) {

        errors.push({
          key,

          message:
            `${parameter.name || key} is required.`,
        });


        return;
      }


      /* ----------------------------------------------------
         Numeric
         ---------------------------------------------------- */

      if (
        value &&
        numeric(value) === null &&
        !calculated
      ) {

        errors.push({
          key,

          message:
            `${parameter.name || key} must be numeric.`,
        });
      }


      /* ----------------------------------------------------
         Calculated unresolved
         ---------------------------------------------------- */

      if (
        calculated &&
        entry.status ===
          "UNRESOLVED"
      ) {

        warnings.push({
          key,

          message:
            `${parameter.name || key} could not be calculated.`,
        });
      }


      /* ----------------------------------------------------
         Reference missing
         ---------------------------------------------------- */

      if (
        value &&
        !entry.reference_range
      ) {

        warnings.push({
          key,

          message:
            `${parameter.name || key} has no configured reference range.`,
        });
      }
    }
  );


  return {

    valid:
      errors.length === 0,

    errors,

    warnings,
  };
};