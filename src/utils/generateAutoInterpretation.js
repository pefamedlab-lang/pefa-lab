export const generateAutoInterpretation = (

  results = {}

) => {

  const comments = [];

  /* =====================================
     HELPERS
  ===================================== */

  const getFlag = (

    parameter

  ) => {

    return (

      results?.[parameter]

        ?.flag ||

      ""

    );

  };

  const getValue = (

    parameter

  ) => {

    const value =

      results?.[parameter]

        ?.result;

    return Number(value);

  };

  const addComment = (

    text

  ) => {

    if (

      text &&

      !comments.includes(text)

    ) {

      comments.push(text);

    }

  };

  /* =====================================
     FBC / CBC
  ===================================== */

  if (

    getFlag("Hb") === "Low" ||

    getFlag("Haemoglobin") === "Low"

  ) {

    addComment(

      "Findings are suggestive of anaemia."

    );

  }

  if (

    getFlag("Hb") === "High" ||

    getFlag("Haemoglobin") === "High"

  ) {

    addComment(

      "Elevated haemoglobin concentration detected."

    );

  }

  if (

    getFlag("WBC") === "High"

  ) {

    addComment(

      "Leukocytosis present, suggestive of infection or inflammation."

    );

  }

  if (

    getFlag("WBC") === "Low"

  ) {

    addComment(

      "Leucopenia detected."

    );

  }

  if (

    getFlag("Platelets") === "Low"

  ) {

    addComment(

      "Thrombocytopenia detected."

    );

  }

  if (

    getFlag("Platelets") === "High"

  ) {

    addComment(

      "Thrombocytosis detected."

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

      addComment(

        "HbA1c is within the diabetic range and indicates poor glycaemic control."

      );

    }

    else if (

      hba1c >= 5.7

    ) {

      addComment(

        "HbA1c is within the prediabetic range."

      );

    }

    else if (

      hba1c >= 4

    ) {

      addComment(

        "HbA1c suggests satisfactory glycaemic control."

      );

    }

  }

  /* =====================================
     FBS / GLUCOSE
  ===================================== */

  if (

    getFlag("FBS") === "High" ||

    getFlag("Glucose") === "High"

  ) {

    addComment(

      "Hyperglycaemia detected."

    );

  }

  if (

    getFlag("FBS") === "Low" ||

    getFlag("Glucose") === "Low"

  ) {

    addComment(

      "Hypoglycaemia detected."

    );

  }

  /* =====================================
     LFT
  ===================================== */

  if (

    getFlag("ALT") === "High" ||

    getFlag("AST") === "High"

  ) {

    addComment(

      "Elevated transaminases suggest hepatocellular injury."

    );

  }

  if (

    getFlag("ALP") === "High" &&

    (

      getFlag(

        "Total Bilirubin"

      ) === "High" ||

      getFlag(

        "Direct Bilirubin"

      ) === "High"

    )

  ) {

    addComment(

      "Findings are suggestive of cholestatic liver dysfunction or biliary obstruction."

    );

  }

  if (

    getFlag(

      "Total Bilirubin"

    ) === "High" ||

    getFlag(

      "Direct Bilirubin"

    ) === "High"

  ) {

    addComment(

      "Hyperbilirubinaemia detected."

    );

  }

  if (

    getFlag("Albumin") === "Low"

  ) {

    addComment(

      "Reduced serum albumin level detected."

    );

  }

  /* =====================================
     KFT / ELECTROLYTES
  ===================================== */

  if (

    getFlag(

      "Creatinine"

    ) === "High" &&

    getFlag(

      "Urea"

    ) === "High"

  ) {

    addComment(

      "Elevated renal indices suggest impaired renal function."

    );

  }

  if (

    getFlag(

      "Sodium"

    ) === "Low"

  ) {

    addComment(

      "Hyponatraemia detected."

    );

  }

  if (

    getFlag(

      "Sodium"

    ) === "High"

  ) {

    addComment(

      "Hypernatraemia detected."

    );

  }

  if (

    getFlag(

      "Potassium"

    ) === "Low"

  ) {

    addComment(

      "Hypokalaemia detected."

    );

  }

  if (

    getFlag(

      "Potassium"

    ) === "High"

  ) {

    addComment(

      "Hyperkalaemia detected."

    );

  }

  if (

    getFlag(

      "Bicarbonate"

    ) === "Low"

  ) {

    addComment(

      "Reduced bicarbonate level may indicate metabolic acidosis."

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

    addComment(

      "Hypercholesterolaemia detected."

    );

  }

  if (

    getFlag("LDL") === "High" ||

    getFlag(

      "LDL Cholesterol"

    ) === "High"

  ) {

    addComment(

      "Elevated LDL cholesterol may increase cardiovascular risk."

    );

  }

  if (

    getFlag(

      "Triglycerides"

    ) === "High"

  ) {

    addComment(

      "Hypertriglyceridaemia detected."

    );

  }

  if (

    getFlag("HDL") === "Low"

  ) {

    addComment(

      "Reduced HDL cholesterol may increase cardiovascular risk."

    );

  }

  /* =====================================
     THYROID FUNCTION TEST
  ===================================== */

  if (

    getFlag("TSH") === "High" &&

    getFlag("FT4") === "Low"

  ) {

    addComment(

      "Findings are suggestive of primary hypothyroidism."

    );

  }

  if (

    getFlag("TSH") === "Low" &&

    getFlag("FT4") === "High"

  ) {

    addComment(

      "Findings are suggestive of hyperthyroidism."

    );

  }

  if (

    getFlag("TSH") === "High" &&

    getFlag("FT4") === "Normal"

  ) {

    addComment(

      "Pattern is suggestive of subclinical hypothyroidism."

    );

  }

  /* =====================================
     HORMONAL PROFILE
  ===================================== */

  if (

    getFlag("Prolactin") === "High"

  ) {

    addComment(

      "Hyperprolactinaemia detected."

    );

  }

  if (

    getFlag(

      "Testosterone"

    ) === "Low"

  ) {

    addComment(

      "Low testosterone level detected."

    );

  }

  if (

    getFlag(

      "Estradiol"

    ) === "High"

  ) {

    addComment(

      "Elevated estradiol level detected."

    );

  }

  if (

    getFlag("FSH") === "High"

  ) {

    addComment(

      "Elevated FSH level detected."

    );

  }

  if (

    getFlag("LH") === "High"

  ) {

    addComment(

      "Elevated LH level detected."

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

      addComment(

        "Markedly elevated PSA detected. Further urological assessment is recommended."

      );

    }

    else if (

      psa > 4

    ) {

      addComment(

        "Elevated PSA level detected. Clinical evaluation is advised."

      );

    }

    else {

      addComment(

        "PSA level is within normal limits."

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

    addComment(

      "Elevated troponin level suggestive of myocardial injury."

    );

  }

  if (

    getFlag("CK-MB") === "High"

  ) {

    addComment(

      "Elevated CK-MB level detected."

    );

  }

  /* =====================================
     TUMOUR MARKERS
  ===================================== */

  if (

    getFlag("AFP") === "High"

  ) {

    addComment(

      "Elevated AFP level detected."

    );

  }

  if (

    getFlag("CEA") === "High"

  ) {

    addComment(

      "Elevated CEA level detected."

    );

  }

  if (

    getFlag("CA125") === "High"

  ) {

    addComment(

      "Elevated CA-125 level detected."

    );

  }

  /* =====================================
     NORMAL REPORT
  ===================================== */

  if (

    comments.length === 0

  ) {

    addComment(

      "Results are within normal laboratory reference limits."

    );

  }

  addComment(

    "Laboratory findings should be interpreted alongside clinical findings."

  );

  return comments.join(" ");

};