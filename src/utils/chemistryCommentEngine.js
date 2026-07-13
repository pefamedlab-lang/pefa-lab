export function getChemistryInterpretation(

  testName,
  results

) {

  const getValue = (name) =>

    Number(
      results?.[name]?.result
    );

  const getFlag = (name) =>

    results?.[name]?.flag;

  const diagnosis = [];
  const impression = [];

  /* ======================
     LFT
  ====================== */

  if (

    testName === "LFT"

  ) {

    if (

      getFlag("ALT") === "High" ||

      getFlag("AST") === "High"

    ) {

      diagnosis.push(

        "Elevated transaminases suggest hepatocellular injury"

      );

      impression.push(

        "Hepatocellular dysfunction"

      );

    }

    if (

      getFlag("ALP") === "High" ||

      getFlag("GGT") === "High"

    ) {

      diagnosis.push(

        "Cholestatic enzyme elevation detected"

      );

      impression.push(

        "Possible cholestasis"

      );

    }

    if (

      getFlag("Total Bilirubin") === "High"

    ) {

      diagnosis.push(

        "Hyperbilirubinaemia present"

      );

    }

  }

  /* ======================
     KFT
  ====================== */

  if (

    testName === "KFT"

  ) {

    if (

      getFlag("Urea") === "High" ||

      getFlag("Creatinine") === "High"

    ) {

      diagnosis.push(

        "Elevated Urea and Creatinine suggest impaired renal function"

      );

      impression.push(

        "Renal impairment"

      );

    }

  }

  /* ======================
     ELECTROLYTES
  ====================== */

  if (

    getFlag("Sodium") === "Low"

  ) {

    diagnosis.push(
      "Hyponatraemia present"
    );

  }

  if (

    getFlag("Sodium") === "High"

  ) {

    diagnosis.push(
      "Hypernatraemia present"
    );

  }

  if (

    getFlag("Potassium") === "Low"

  ) {

    diagnosis.push(
      "Hypokalaemia present"
    );

  }

  if (

    getFlag("Potassium") === "High"

  ) {

    diagnosis.push(
      "Hyperkalaemia present"
    );

  }

  /* ======================
     LIPID PROFILE
  ====================== */

  if (

    testName === "Lipid Profile"

  ) {

    if (

      getFlag("Total Cholesterol") === "High" ||

      getFlag("LDL Cholesterol") === "High" ||

      getFlag("Triglycerides") === "High"

    ) {

      diagnosis.push(

        "Findings are consistent with dyslipidaemia and increased cardiovascular risk"

      );

      impression.push(

        "Dyslipidaemia"

      );

    }

  }

  /* ======================
     DIABETES PROFILE
  ====================== */

  if (

    testName === "Diabetes Profile"

  ) {

    if (

      getFlag("Fasting Blood Sugar") === "High" ||

      getFlag("HbA1c") === "High"

    ) {

      diagnosis.push(

        "Poor glycaemic control noted"

      );

      impression.push(

        "Diabetes mellitus with poor glycaemic control"

      );

    }

  }

  /* ======================
     NORMAL
  ====================== */

  if (

    diagnosis.length === 0

  ) {

    return {

      interpretation:

        "Results are within normal limits.",

      impression:

        "No significant abnormality detected.",

    };

  }

  return {

    interpretation:

      diagnosis.join(". ") + ".",

    impression:

      [...new Set(impression)]

        .join(" with ")

        + ".",

  };

}