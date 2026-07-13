export const generateAutoInterpretation = (
  results = {}
) => {

  const comments = [];

  const getFlag = (
    parameter
  ) => {

    return (
      results?.[parameter]
        ?.flag || ""
    );

  };

  const getValue = (
    parameter
  ) => {

    return Number(
      results?.[parameter]
        ?.result
    );

  };

  /* =====================================
     FBC
  ===================================== */

  if (

    getFlag("Hb") === "Low" ||

    getFlag("Haemoglobin") === "Low"

  ) {

    comments.push(
      "Findings are suggestive of anaemia."
    );

  }

  if (

    getFlag("Hb") === "High" ||

    getFlag("Haemoglobin") === "High"

  ) {

    comments.push(
      "Elevated haemoglobin concentration noted."
    );

  }

  if (
    getFlag("WBC") === "High"
  ) {

    comments.push(
      "Leukocytosis present, which may indicate infection or inflammation."
    );

  }

  if (
    getFlag("WBC") === "Low"
  ) {

    comments.push(
      "Leucopenia present."
    );

  }

  if (

    getFlag("Platelets") ===
    "Low"

  ) {

    comments.push(
      "Thrombocytopenia present."
    );

  }

  if (

    getFlag("Platelets") ===
    "High"

  ) {

    comments.push(
      "Thrombocytosis present."
    );

  }

  /* =====================================
     HbA1c
  ===================================== */

  const hba1c =

    getValue("HbA1c");

  if (
    !isNaN(hba1c)
  ) {

    if (
      hba1c >= 6.5
    ) {

      comments.push(
        "HbA1c is within the diabetic range and indicates poor glycaemic control."
      );

    }

    else if (
      hba1c >= 5.7
    ) {

      comments.push(
        "HbA1c is within the prediabetic range."
      );

    }

    else if (
      hba1c >= 4
    ) {

      comments.push(
        "HbA1c suggests satisfactory glycaemic control."
      );

    }

  }

  /* =====================================
     GLUCOSE
  ===================================== */

  if (

    getFlag("Glucose") ===
    "High" ||

    getFlag("FBS") ===
    "High"

  ) {

    comments.push(
      "Hyperglycaemia detected."
    );

  }

  if (

    getFlag("Glucose") ===
    "Low" ||

    getFlag("FBS") ===
    "Low"

  ) {

    comments.push(
      "Hypoglycaemia detected."
    );

  }

  /* =====================================
     LFT
  ===================================== */

  if (

    getFlag("ALT") ===
      "High"

    &&

    getFlag("AST") ===
      "High"

  ) {

    comments.push(
      "Elevated transaminases suggest hepatocellular injury."
    );

  }

  if (

    getFlag("ALP") ===
    "High"

    &&

    (

      getFlag(
        "Total Bilirubin"
      ) === "High"

      ||

      getFlag(
        "Direct Bilirubin"
      ) === "High"

    )

  ) {

    comments.push(
      "Findings are suggestive of cholestatic liver dysfunction or biliary obstruction."
    );

  }

  if (

    getFlag(
      "Total Bilirubin"
    ) === "High"

    ||

    getFlag(
      "Direct Bilirubin"
    ) === "High"

  ) {

    comments.push(
      "Hyperbilirubinaemia detected."
    );

  }

  if (

    getFlag("Albumin") ===
    "Low"

  ) {

    comments.push(
      "Reduced serum albumin level noted."
    );

  }

  /* =====================================
     RFT
  ===================================== */

  if (

    getFlag(
      "Creatinine"
    ) === "High"

    &&

    getFlag(
      "Urea"
    ) === "High"

  ) {

    comments.push(
      "Elevated renal indices suggest impaired renal function."
    );

  }

  if (

    getFlag(
      "Potassium"
    ) === "High"

  ) {

    comments.push(
      "Hyperkalaemia detected."
    );

  }

  if (

    getFlag(
      "Potassium"
    ) === "Low"

  ) {

    comments.push(
      "Hypokalaemia detected."
    );

  }

  /* =====================================
     LIPID PROFILE
  ===================================== */

  if (

    getFlag(
      "Total Cholesterol"
    ) === "High"

  ) {

    comments.push(
      "Hypercholesterolaemia detected."
    );

  }

  if (

    getFlag("LDL") ===
    "High"

  ) {

    comments.push(
      "Elevated LDL cholesterol may increase cardiovascular risk."
    );

  }

  if (

    getFlag(
      "Triglycerides"
    ) === "High"

  ) {

    comments.push(
      "Hypertriglyceridaemia detected."
    );

  }

  /* =====================================
     TFT / FTFT
  ===================================== */

  if (

    getFlag("TSH") ===
      "High"

    &&

    getFlag("FT4") ===
      "Low"

  ) {

    comments.push(
      "Findings are suggestive of primary hypothyroidism."
    );

  }

  if (

    getFlag("TSH") ===
      "Low"

    &&

    getFlag("FT4") ===
      "High"

  ) {

    comments.push(
      "Findings are suggestive of hyperthyroidism."
    );

  }

  if (

    getFlag("TSH") ===
      "High"

    &&

    getFlag("FT4") ===
      "Normal"

  ) {

    comments.push(
      "Pattern is suggestive of subclinical hypothyroidism."
    );

  }

  /* =====================================
     HORMONAL PROFILE
  ===================================== */

  if (

    getFlag("Prolactin") ===
    "High"

  ) {

    comments.push(
      "Hyperprolactinaemia detected."
    );

  }

  if (

    getFlag(
      "Testosterone"
    ) === "Low"

  ) {

    comments.push(
      "Low testosterone level detected."
    );

  }

  if (

    getFlag(
      "Estradiol"
    ) === "High"

  ) {

    comments.push(
      "Elevated estradiol level detected."
    );

  }

  if (

    getFlag("FSH") ===
    "High"

  ) {

    comments.push(
      "Elevated FSH level noted."
    );

  }

  if (

    getFlag("LH") ===
    "High"

  ) {

    comments.push(
      "Elevated LH level noted."
    );

  }

  /* =====================================
     PSA
  ===================================== */

  const psa =
    getValue("PSA");

  if (
    !isNaN(psa)
  ) {

    if (
      psa > 10
    ) {

      comments.push(
        "Markedly elevated PSA level detected. Further urological assessment is recommended."
      );

    }

    else if (
      psa > 4
    ) {

      comments.push(
        "Elevated PSA level detected. Clinical evaluation is advised."
      );

    }

  }

  /* =====================================
     CARDIAC MARKERS
  ===================================== */

  if (

    getFlag(
      "Troponin"
    ) === "High"

  ) {

    comments.push(
      "Elevated troponin level suggestive of myocardial injury."
    );

  }

  if (

    getFlag("CK-MB") ===
    "High"

  ) {

    comments.push(
      "Elevated CK-MB level detected."
    );

  }

  /* =====================================
     TUMOUR MARKERS
  ===================================== */

  if (

    getFlag("AFP") ===
    "High"

  ) {

    comments.push(
      "Elevated AFP level detected."
    );

  }

  if (

    getFlag("CEA") ===
    "High"

  ) {

    comments.push(
      "Elevated CEA level detected."
    );

  }

  if (

    getFlag("CA125") ===
    "High"

  ) {

    comments.push(
      "Elevated CA-125 level detected."
    );

  }

  /* =====================================
     NORMAL REPORT
  ===================================== */

  if (
    comments.length === 0
  ) {

    comments.push(
      "Results are within normal laboratory reference limits."
    );

  }

  comments.push(
    "Laboratory findings should be interpreted alongside clinical findings."
  );

  return [

    ...new Set(
      comments
    )

  ].join(" ");

};