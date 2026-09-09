/* ==========================================================
   PEFA LAB
   CHEMISTRY FLAG ENGINE
   ========================================================== */

const toNumber = (value) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(number)
    ? number
    : null;
};


/* ==========================================================
   FLAG SINGLE CHEMISTRY RESULT
   ========================================================== */

export const flagChemistryResult = ({
  value,
  reference = {},
  criticalLow = null,
  criticalHigh = null,
} = {}) => {

  const numericValue = toNumber(value);

  const low = toNumber(reference?.low);
  const high = toNumber(reference?.high);

  const cLow = toNumber(criticalLow);
  const cHigh = toNumber(criticalHigh);


  /* --------------------------------------------------------
     No result
     -------------------------------------------------------- */

  if (numericValue === null) {

    return {
      flag: "",
      status: "MISSING",
      critical: false,
    };
  }


  /* --------------------------------------------------------
     Critical low
     -------------------------------------------------------- */

  if (
    cLow !== null &&
    numericValue <= cLow
  ) {

    return {
      flag: "CRITICAL LOW",
      status: "CRITICAL",
      critical: true,
    };
  }


  /* --------------------------------------------------------
     Critical high
     -------------------------------------------------------- */

  if (
    cHigh !== null &&
    numericValue >= cHigh
  ) {

    return {
      flag: "CRITICAL HIGH",
      status: "CRITICAL",
      critical: true,
    };
  }


  /* --------------------------------------------------------
     Low
     -------------------------------------------------------- */

  if (
    low !== null &&
    numericValue < low
  ) {

    return {
      flag: "LOW",
      status: "LOW",
      critical: false,
    };
  }


  /* --------------------------------------------------------
     High
     -------------------------------------------------------- */

  if (
    high !== null &&
    numericValue > high
  ) {

    return {
      flag: "HIGH",
      status: "HIGH",
      critical: false,
    };
  }


  /* --------------------------------------------------------
     Normal
     -------------------------------------------------------- */

  if (
    low !== null &&
    high !== null
  ) {

    return {
      flag: "NORMAL",
      status: "NORMAL",
      critical: false,
    };
  }


  /* --------------------------------------------------------
     Reference unresolved
     -------------------------------------------------------- */

  return {
    flag: "",
    status: "UNRESOLVED",
    critical: false,
  };
};


/* ==========================================================
   NORMALIZE PARAMETER KEY
   ========================================================== */

const getParameterKey = (parameter) => {

  const raw =
    parameter?.key ??
    parameter?.id ??
    parameter?.name ??
    parameter?.test_name ??
    "";

  return String(raw)
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
};


/* ==========================================================
   APPLY FLAGS TO COMPLETE PANEL
   ========================================================== */

export const applyChemistryFlags = ({
  analytes = [],
  parameters = {},
  patient = {},
  registration = {},
  test = {},
  resolveReference,
} = {}) => {

  const next = {
    ...(parameters || {}),
  };


  if (
    typeof resolveReference !== "function"
  ) {
    return next;
  }


  analytes.forEach((parameter) => {

    const key = getParameterKey(parameter);

    if (!key) return;


    const entry =
      next[key] || {};


    /* ------------------------------------------------------
       Resolve applicable reference
       ------------------------------------------------------ */

    const reference =
      resolveReference({
        parameter,
        patient,
        registration,
        test,
        defaultRange:
          parameter?.reference_range ??
          parameter?.referenceRange ??
          parameter?.reference_value ??
          parameter?.referenceValue ??
          "",
      });


    /* ------------------------------------------------------
       Flag
       ------------------------------------------------------ */

    const flagged =
      flagChemistryResult({
        value: entry.value,

        reference: {
          low: reference?.low,
          high: reference?.high,
        },

        criticalLow:
          reference?.criticalLow ??
          parameter?.critical_low ??
          parameter?.criticalLow,

        criticalHigh:
          reference?.criticalHigh ??
          parameter?.critical_high ??
          parameter?.criticalHigh,
      });


    next[key] = {

      ...parameter,

      ...entry,

      key,

      name:
        entry.name ||
        parameter?.name ||
        parameter?.test_name ||
        key,

      unit:
        entry.unit ||
        parameter?.unit ||
        "",

      value:
        entry.value ??
        parameter?.value ??
        "",

      reference_range:
        reference?.display ||
        reference?.referenceRange ||
        entry.reference_range ||
        "",

      referenceRange:
        reference?.display ||
        reference?.referenceRange ||
        entry.referenceRange ||
        "",

      reference_meta:
        reference,

      flag:
        flagged.flag,

      status:
        flagged.status,

      critical:
        flagged.critical,
    };
  });


  return next;
};