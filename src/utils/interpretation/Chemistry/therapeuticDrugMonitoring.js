import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   THERAPEUTIC DRUG MONITORING INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Lithium
   • Digoxin
   • Valproic Acid
   • Phenytoin
   • Carbamazepine
   • Phenobarbital
   • Vancomycin
   • Gentamicin (Peak/Trough)
   • Tacrolimus
   • Cyclosporine

   Detects
   ----------------------------------------------------------
   • Subtherapeutic drug concentration
   • Therapeutic concentration
   • Supratherapeutic concentration
   • Toxic concentration
   • Multiple abnormal drug levels
========================================================== */

export default function interpretTherapeuticDrugMonitoring(

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

  const lithium =
    getNumericResult(resultMap, "Lithium");

  const digoxin =
    getNumericResult(resultMap, "Digoxin");

  const valproate =
    getNumericResult(resultMap, "Valproic Acid") ??
    getNumericResult(resultMap, "Valproate");

  const phenytoin =
    getNumericResult(resultMap, "Phenytoin");

  const carbamazepine =
    getNumericResult(resultMap, "Carbamazepine");

  const phenobarbital =
    getNumericResult(resultMap, "Phenobarbital");

  const vancomycin =
    getNumericResult(resultMap, "Vancomycin");

  const gentamicinPeak =
    getNumericResult(resultMap, "Gentamicin Peak");

  const gentamicinTrough =
    getNumericResult(resultMap, "Gentamicin Trough");

  const tacrolimus =
    getNumericResult(resultMap, "Tacrolimus");

  const cyclosporine =
    getNumericResult(resultMap, "Cyclosporine");

  /* ======================================================
     THERAPEUTIC RANGES

     These should ideally be configurable per laboratory
     and clinical indication.
  ====================================================== */

  const LITHIUM_LOW = 0.6;
  const LITHIUM_HIGH = 1.2;
  const LITHIUM_TOXIC = 1.5;

  const DIGOXIN_LOW = 0.5;
  const DIGOXIN_HIGH = 2.0;
  const DIGOXIN_TOXIC = 2.5;

  const VALPROATE_LOW = 50;
  const VALPROATE_HIGH = 100;
  const VALPROATE_TOXIC = 150;

  const PHENYTOIN_LOW = 10;
  const PHENYTOIN_HIGH = 20;
  const PHENYTOIN_TOXIC = 30;

  const CARBAMAZEPINE_LOW = 4;
  const CARBAMAZEPINE_HIGH = 12;
  const CARBAMAZEPINE_TOXIC = 15;

  const PHENOBARBITAL_LOW = 15;
  const PHENOBARBITAL_HIGH = 40;
  const PHENOBARBITAL_TOXIC = 50;

  const VANCOMYCIN_LOW = 10;
  const VANCOMYCIN_HIGH = 20;
  const VANCOMYCIN_TOXIC = 25;

  const GENTAMICIN_PEAK_LOW = 5;
  const GENTAMICIN_PEAK_HIGH = 10;

  const GENTAMICIN_TROUGH_HIGH = 2;

  const TACROLIMUS_LOW = 5;
  const TACROLIMUS_HIGH = 15;

  const CYCLOSPORINE_LOW = 100;
  const CYCLOSPORINE_HIGH = 400;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function hasValue(value) {

    return (
      value !== null &&
      !Number.isNaN(value)
    );

  }

  function classifyLevel(
    value,
    low,
    high,
    toxic = null
  ) {

    if (!hasValue(value)) {

      return null;

    }

    if (value < low) {

      return "subtherapeutic";

    }

    if (toxic !== null && value >= toxic) {

      return "toxic";

    }

    if (value > high) {

      return "supratherapeutic";

    }

    return "therapeutic";

  }

  /* ======================================================
     DRUG CLASSIFICATIONS
  ====================================================== */

  const lithiumStatus =
    classifyLevel(
      lithium,
      LITHIUM_LOW,
      LITHIUM_HIGH,
      LITHIUM_TOXIC
    );

  const digoxinStatus =
    classifyLevel(
      digoxin,
      DIGOXIN_LOW,
      DIGOXIN_HIGH,
      DIGOXIN_TOXIC
    );

  const valproateStatus =
    classifyLevel(
      valproate,
      VALPROATE_LOW,
      VALPROATE_HIGH,
      VALPROATE_TOXIC
    );

  const phenytoinStatus =
    classifyLevel(
      phenytoin,
      PHENYTOIN_LOW,
      PHENYTOIN_HIGH,
      PHENYTOIN_TOXIC
    );

  const carbamazepineStatus =
    classifyLevel(
      carbamazepine,
      CARBAMAZEPINE_LOW,
      CARBAMAZEPINE_HIGH,
      CARBAMAZEPINE_TOXIC
    );

  const phenobarbitalStatus =
    classifyLevel(
      phenobarbital,
      PHENOBARBITAL_LOW,
      PHENOBARBITAL_HIGH,
      PHENOBARBITAL_TOXIC
    );

  const vancomycinStatus =
    classifyLevel(
      vancomycin,
      VANCOMYCIN_LOW,
      VANCOMYCIN_HIGH,
      VANCOMYCIN_TOXIC
    );

  const tacrolimusStatus =
    classifyLevel(
      tacrolimus,
      TACROLIMUS_LOW,
      TACROLIMUS_HIGH
    );

  const cyclosporineStatus =
    classifyLevel(
      cyclosporine,
      CYCLOSPORINE_LOW,
      CYCLOSPORINE_HIGH
    );

  /* ======================================================
     GENTAMICIN INTERPRETATION
  ====================================================== */

  let gentamicinStatus = null;

  if (
    hasValue(gentamicinPeak) ||
    hasValue(gentamicinTrough)
  ) {

    if (
      hasValue(gentamicinPeak) &&
      gentamicinPeak < GENTAMICIN_PEAK_LOW
    ) {

      gentamicinStatus =
        "subtherapeutic";

    }

    else if (
      hasValue(gentamicinPeak) &&
      gentamicinPeak > GENTAMICIN_PEAK_HIGH
    ) {

      gentamicinStatus =
        "supratherapeutic";

    }

    else if (
      hasValue(gentamicinTrough) &&
      gentamicinTrough > GENTAMICIN_TROUGH_HIGH
    ) {

      gentamicinStatus =
        "toxic";

    }

    else {

      gentamicinStatus =
        "therapeutic";

    }

  }

  /* ======================================================
     ABNORMAL RESULT COUNT
  ====================================================== */

  const abnormalCount = [

    lithiumStatus,
    digoxinStatus,
    valproateStatus,
    phenytoinStatus,
    carbamazepineStatus,
    phenobarbitalStatus,
    vancomycinStatus,
    gentamicinStatus,
    tacrolimusStatus,
    cyclosporineStatus,

  ].filter(

    status =>
      status &&
      status !== "therapeutic"

  ).length;

  /* ======================================================
     HELPER - DRUG INTERPRETATION
  ====================================================== */

  function interpretDrug(
    drugName,
    status,
    therapeuticNote = ""
  ) {

    if (!status) return;

    switch (status) {

      case "subtherapeutic":

        interpretation +=
          `${drugName} concentration is below the therapeutic range. This may be associated with inadequate therapeutic effect.${therapeuticNote}\n\n`;
        break;

      case "therapeutic":

        interpretation +=
          `${drugName} concentration is within the therapeutic range.${therapeuticNote}\n\n`;
        break;

      case "supratherapeutic":

        interpretation +=
          `${drugName} concentration is above the therapeutic range and may increase the risk of adverse effects.${therapeuticNote}\n\n`;
        break;

      case "toxic":

        interpretation +=
          `${drugName} concentration is within the toxic range and is associated with an increased risk of drug toxicity. Immediate clinical correlation is recommended.${therapeuticNote}\n\n`;
        break;

      default:
        break;

    }

  }

  /* ======================================================
     LITHIUM
  ====================================================== */

  interpretDrug(
    "Lithium",
    lithiumStatus,
    " Sampling should be performed at the appropriate post-dose interval (usually a 12-hour trough)."
  );

  /* ======================================================
     DIGOXIN
  ====================================================== */

  interpretDrug(
    "Digoxin",
    digoxinStatus,
    " Digoxin should ideally be measured at least 6–8 hours after the last dose."
  );

  /* ======================================================
     VALPROATE
  ====================================================== */

  interpretDrug(
    "Valproic acid",
    valproateStatus,
    " Interpretation should consider seizure control, adverse effects and sampling time."
  );

  /* ======================================================
     PHENYTOIN
  ====================================================== */

  interpretDrug(
    "Phenytoin",
    phenytoinStatus,
    " Interpretation should consider serum albumin concentration and free phenytoin where appropriate."
  );

  /* ======================================================
     CARBAMAZEPINE
  ====================================================== */

  interpretDrug(
    "Carbamazepine",
    carbamazepineStatus,
    " Correlate with seizure control, adverse effects and trough sampling where applicable."
  );

  /* ======================================================
     PHENOBARBITAL
  ====================================================== */

  interpretDrug(
    "Phenobarbital",
    phenobarbitalStatus,
    " Correlate with clinical response and sedation."
  );

  /* ======================================================
     VANCOMYCIN
  ====================================================== */

  interpretDrug(
    "Vancomycin",
    vancomycinStatus,
    " Interpretation should be based on correctly timed trough sampling or AUC-guided monitoring where implemented."
  );

  /* ======================================================
     GENTAMICIN
  ====================================================== */

  if (gentamicinStatus) {

    interpretDrug(
      "Gentamicin",
      gentamicinStatus,
      " Interpretation requires both peak and trough concentrations together with renal function."
    );

  }

  /* ======================================================
     TACROLIMUS
  ====================================================== */

  interpretDrug(
    "Tacrolimus",
    tacrolimusStatus,
    " Interpretation should consider transplant type, time after transplantation and trough sampling."
  );

  /* ======================================================
     CYCLOSPORINE
  ====================================================== */

  interpretDrug(
    "Cyclosporine",
    cyclosporineStatus,
    " Interpretation depends on transplant protocol and specimen collection time."
  );

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "Therapeutic drug concentrations should always be interpreted together with the prescribed dose, dosing interval, time of specimen collection, renal and hepatic function, potential drug interactions and the patient's clinical response.\n\n";

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  const toxicStatuses = [
    lithiumStatus,
    digoxinStatus,
    valproateStatus,
    phenytoinStatus,
    carbamazepineStatus,
    phenobarbitalStatus,
    vancomycinStatus,
    gentamicinStatus,
  ].filter(status => status === "toxic").length;

  const supratherapeuticStatuses = [
    lithiumStatus,
    digoxinStatus,
    valproateStatus,
    phenytoinStatus,
    carbamazepineStatus,
    phenobarbitalStatus,
    vancomycinStatus,
    gentamicinStatus,
    tacrolimusStatus,
    cyclosporineStatus,
  ].filter(status => status === "supratherapeutic").length;

  const subtherapeuticStatuses = [
    lithiumStatus,
    digoxinStatus,
    valproateStatus,
    phenytoinStatus,
    carbamazepineStatus,
    phenobarbitalStatus,
    vancomycinStatus,
    gentamicinStatus,
    tacrolimusStatus,
    cyclosporineStatus,
  ].filter(status => status === "subtherapeutic").length;

  /*
     Toxic Drug Level(s)
  ------------------------------------------------------ */

  if (toxicStatuses > 0) {

    impression =
      "One or more drug concentrations are within the toxic range.";

    recommendation =
      "Urgent clinical assessment is recommended. Review the dosing history, renal and hepatic function, ECG where appropriate, and consider dose omission, antidotal therapy or extracorporeal removal according to current treatment guidelines.";

  }

  /*
     Multiple Abnormal Drug Levels
  ------------------------------------------------------ */

  else if (abnormalCount >= 2) {

    impression =
      "Multiple therapeutic drug concentrations are outside their target ranges.";

    recommendation =
      "Review medication adherence, dosing schedule, sampling time, renal and hepatic function, and potential drug interactions.";

  }

  /*
     Immunosuppressant Monitoring
  ------------------------------------------------------ */

  else if (

    tacrolimusStatus &&
    tacrolimusStatus !== "therapeutic"

  ) {

    impression =
      `Tacrolimus concentration is ${tacrolimusStatus}.`;

    recommendation =
      "Correlate with transplant protocol, graft function, trough sampling time and concomitant medications before dose adjustment.";

  }

  else if (

    cyclosporineStatus &&
    cyclosporineStatus !== "therapeutic"

  ) {

    impression =
      `Cyclosporine concentration is ${cyclosporineStatus}.`;

    recommendation =
      "Interpret according to the transplant protocol and sampling schedule. Assess for nephrotoxicity and drug interactions.";

  }

  /*
     Antiepileptic Drugs
  ------------------------------------------------------ */

  else if (

    [
      valproateStatus,
      phenytoinStatus,
      carbamazepineStatus,
      phenobarbitalStatus,
    ].some(
      status =>
        status &&
        status !== "therapeutic"
    )

  ) {

    impression =
      "Abnormal antiepileptic drug concentration.";

    recommendation =
      "Correlate with seizure control, adverse effects, adherence and specimen collection time before modifying therapy.";

  }

  /*
     Antimicrobial Monitoring
  ------------------------------------------------------ */

  else if (

    (
      vancomycinStatus &&
      vancomycinStatus !== "therapeutic"
    ) ||

    (
      gentamicinStatus &&
      gentamicinStatus !== "therapeutic"
    )

  ) {

    impression =
      "Abnormal antimicrobial drug concentration.";

    recommendation =
      "Review renal function, dosing interval and specimen collection time. Adjust therapy in accordance with antimicrobial stewardship recommendations.";

  }

  /*
     Single Subtherapeutic Drug
  ------------------------------------------------------ */

  else if (

    subtherapeuticStatuses === 1

  ) {

    impression =
      "A drug concentration is below the therapeutic range.";

    recommendation =
      "Assess adherence, timing of specimen collection and the adequacy of the current dosing regimen before considering dose escalation.";

  }

  /*
     Single Supratherapeutic Drug
  ------------------------------------------------------ */

  else if (

    supratherapeuticStatuses === 1

  ) {

    impression =
      "A drug concentration is above the therapeutic range.";

    recommendation =
      "Review dosing regimen, renal and hepatic function, and monitor closely for adverse drug effects.";

  }

  /*
     Therapeutic Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Therapeutic drug concentrations are within their target ranges.";

    recommendation =
      "Continue routine therapeutic drug monitoring according to the clinical indication and institutional protocol.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("toxic range")

  ) {

    recommendation =
      "Urgent clinical assessment is recommended. Review the medication history, timing of the last dose, renal and hepatic function, and assess the patient for clinical features of drug toxicity. Consider dose omission, antidotal therapy or extracorporeal removal where indicated.";

  }

  else if (

    impression.includes("Multiple therapeutic drug")

  ) {

    recommendation =
      "Review medication adherence, specimen collection timing, dosing schedule, renal and hepatic function, and potential drug interactions before modifying therapy.";

  }

  else if (

    impression.includes("Tacrolimus")

  ) {

    recommendation =
      "Interpret the result according to the transplant protocol and trough sampling time. Correlate with graft function, renal function and interacting medications before adjusting the dose.";

  }

  else if (

    impression.includes("Cyclosporine")

  ) {

    recommendation =
      "Interpret the concentration according to the transplant protocol and sampling schedule. Assess for nephrotoxicity, hepatotoxicity and clinically significant drug interactions.";

  }

  else if (

    impression.includes("antiepileptic")

  ) {

    recommendation =
      "Correlate with seizure control, adverse effects, medication adherence and sampling time. Dose adjustment should be based on both the concentration and the patient's clinical response.";

  }

  else if (

    impression.includes("antimicrobial")

  ) {

    recommendation =
      "Review renal function, dosing interval and specimen collection time. Where appropriate, use AUC-guided monitoring for vancomycin and protocol-based monitoring for aminoglycosides.";

  }

  else if (

    impression.includes("below the therapeutic")

  ) {

    recommendation =
      "Evaluate medication adherence, dosing schedule and specimen collection time before increasing the dose. Repeat measurement at steady state if clinically indicated.";

  }

  else if (

    impression.includes("above the therapeutic")

  ) {

    recommendation =
      "Assess the patient for adverse drug effects and review renal and hepatic function. Consider dose reduction or extending the dosing interval where appropriate.";

  }

  else if (

    impression.includes("within their target")

  ) {

    recommendation =
      "Continue the current therapeutic regimen if clinically appropriate. Repeat therapeutic drug monitoring according to institutional protocol, changes in clinical status or dose adjustments.";

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