/* ==========================================================
   PEFA LAB
   CHEMISTRY ENGINE — PUBLIC FACADE
   ----------------------------------------------------------
   Central public API for Clinical Chemistry result processing.

   Responsibilities:
   - Reference resolution
   - Result flagging
   - Interpretation
   - Validation
   - Complete chemistry processing

   IMPORTANT:
   This file contains orchestration only.
   ========================================================== */

import {
  resolveChemistryReference,
  parseRange,
  getAgeYears,
  getSex,
} from "./chemistryReferenceEngine";

import {
  flagChemistryResult,
  applyChemistryFlags,
} from "./chemistryFlagEngine";

import {
  interpretChemistryParameters,
  buildChemistryInterpretation,
} from "./chemistryInterpretationEngine";

import {
  validateChemistryForm,
} from "./chemistryValidationEngine";


/* ==========================================================
   PUBLIC EXPORTS
   ========================================================== */

export {
  resolveChemistryReference,
  parseRange,
  getAgeYears,
  getSex,

  flagChemistryResult,
  applyChemistryFlags,

  interpretChemistryParameters,
  buildChemistryInterpretation,

  validateChemistryForm,
};


/* ==========================================================
   PROCESS COMPLETE CHEMISTRY RESULT
   ========================================================== */

export const processChemistryResult = ({
  analytes = [],
  parameters = {},
  patient = {},
  registration = {},
  test = {},
  interpretationRules = [],
} = {}) => {

  /* --------------------------------------------------------
     1. Apply references + flags
     -------------------------------------------------------- */

  const flaggedParameters = applyChemistryFlags({
    analytes,
    parameters,
    patient,
    registration,
    test,
    resolveReference: resolveChemistryReference,
  });


  /* --------------------------------------------------------
     2. Build interpretation
     -------------------------------------------------------- */

  const interpretation = buildChemistryInterpretation({
    analytes,
    parameters: flaggedParameters,
    patient,
    registration,
    test,
    rules: interpretationRules,
  });


  /* --------------------------------------------------------
     3. Detailed findings
     -------------------------------------------------------- */

  const findings = interpretChemistryParameters({
    analytes,
    parameters: flaggedParameters,
    patient,
    registration,
    test,
    rules: interpretationRules,
  });


  /* --------------------------------------------------------
     4. Validation
     -------------------------------------------------------- */

  const validation = validateChemistryForm({
    analytes,
    parameters: flaggedParameters,
  });


  /* --------------------------------------------------------
     5. Critical results
     -------------------------------------------------------- */

  const criticalResults = Object.values(flaggedParameters).filter(
    (parameter) => parameter?.critical === true
  );


  /* --------------------------------------------------------
     6. Abnormal results
     -------------------------------------------------------- */

  const abnormalResults = Object.values(flaggedParameters).filter(
    (parameter) =>
      ["LOW", "HIGH", "CRITICAL LOW", "CRITICAL HIGH"].includes(
        String(parameter?.flag || "").toUpperCase()
      )
  );


  return {
    parameters: flaggedParameters,

    interpretation,

    findings,

    validation,

    criticalResults,

    abnormalResults,

    hasCriticalResults:
      criticalResults.length > 0,

    hasAbnormalResults:
      abnormalResults.length > 0,
  };
};