import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   LIVER FUNCTION INTERPRETATION ENGINE

   Supported Analytes
   ----------------------------------------------------------
   • ALT (SGPT)
   • AST (SGOT)
   • ALP
   • GGT
   • Total Bilirubin
   • Direct Bilirubin
   • Albumin
   • Total Protein
   • INR
   • Prothrombin Time (PT)

   Detects
   ----------------------------------------------------------
   • Normal liver profile
   • Hepatocellular injury
   • Cholestatic liver disease
   • Mixed liver injury
   • Alcohol-related liver disease
   • Acute viral hepatitis pattern
   • Drug-induced liver injury
   • Non-alcoholic fatty liver disease
   • Obstructive jaundice
   • Gilbert syndrome
   • Chronic liver dysfunction
   • Severe acute liver injury
========================================================== */

export default function interpretLiver(
  report = {},
  resultMap = {}
) {

  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  const override = getScientistOverride(report);

  if (override) {
    return override;
  }

  /* ======================================================
     RESULTS
  ====================================================== */

  const alt =
    getNumericResult(resultMap, "ALT") ??
    getNumericResult(resultMap, "SGPT");

  const ast =
    getNumericResult(resultMap, "AST") ??
    getNumericResult(resultMap, "SGOT");

  const alp =
    getNumericResult(resultMap, "ALP") ??
    getNumericResult(resultMap, "Alkaline Phosphatase");

  const ggt =
    getNumericResult(resultMap, "GGT") ??
    getNumericResult(resultMap, "Gamma GT");

  const totalBilirubin =
    getNumericResult(resultMap, "Total Bilirubin");

  const directBilirubin =
    getNumericResult(resultMap, "Direct Bilirubin");

  const albumin =
    getNumericResult(resultMap, "Albumin");

  const totalProtein =
    getNumericResult(resultMap, "Total Protein");

  const inr =
    getNumericResult(resultMap, "INR");

  const pt =
    getNumericResult(resultMap, "PT") ??
    getNumericResult(resultMap, "Prothrombin Time");

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const ALT_ULN = 40;
  const AST_ULN = 40;
  const ALP_ULN = 120;
  const GGT_ULN = 60;
  const TBIL_ULN = 21;
  const DBIL_ULN = 5;
  const ALBUMIN_LOW = 35;
  const TOTAL_PROTEIN_LOW = 60;
  const INR_ULN = 1.20;

  let interpretation = "";
  let impression = "";
  let recommendation = "";

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function foldIncrease(value, upperLimit) {

    if (
      value === null ||
      upperLimit <= 0
    ) {
      return null;
    }

    return value / upperLimit;

  }

  function isHigh(value, upperLimit) {

    return (
      value !== null &&
      value > upperLimit
    );

  }

  function isLow(value, lowerLimit) {

    return (
      value !== null &&
      value < lowerLimit
    );

  }

  /* ======================================================
     FOLD INCREASES
  ====================================================== */

  const altFold =
    foldIncrease(alt, ALT_ULN);

  const astFold =
    foldIncrease(ast, AST_ULN);

  const alpFold =
    foldIncrease(alp, ALP_ULN);

  const ggtFold =
    foldIncrease(ggt, GGT_ULN);

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const altHigh =
    isHigh(alt, ALT_ULN);

  const astHigh =
    isHigh(ast, AST_ULN);

  const alpHigh =
    isHigh(alp, ALP_ULN);

  const ggtHigh =
    isHigh(ggt, GGT_ULN);

  const bilirubinHigh =
    isHigh(totalBilirubin, TBIL_ULN);

  const directBilirubinHigh =
    isHigh(directBilirubin, DBIL_ULN);

  const albuminLow =
    isLow(albumin, ALBUMIN_LOW);

  const proteinLow =
    isLow(totalProtein, TOTAL_PROTEIN_LOW);

  const inrHigh =
    isHigh(inr, INR_ULN);

  const astAltRatio =
    (
      ast !== null &&
      alt !== null &&
      alt > 0
    )
      ? ast / alt
      : null;

  /* ======================================================
     ALT (Alanine Aminotransferase)
  ====================================================== */

  if (alt !== null) {

    if (!altHigh) {

      interpretation +=
        "Alanine aminotransferase (ALT) is within the reference interval.\n\n";

    }

    else if (altFold < 3) {

      interpretation +=
        "ALT is mildly elevated, consistent with mild hepatocellular injury.\n\n";

    }

    else if (altFold < 10) {

      interpretation +=
        "ALT is moderately elevated, indicating significant hepatocellular injury.\n\n";

    }

    else {

      interpretation +=
        "ALT is markedly elevated (>10 × the upper reference limit), compatible with severe acute hepatocellular injury such as acute viral hepatitis, drug-induced liver injury or hepatic ischaemia.\n\n";

    }

  }

  /* ======================================================
     AST (Aspartate Aminotransferase)
  ====================================================== */

  if (ast !== null) {

    if (!astHigh) {

      interpretation +=
        "Aspartate aminotransferase (AST) is within the reference interval.\n\n";

    }

    else if (astFold < 3) {

      interpretation +=
        "AST is mildly elevated.\n\n";

    }

    else if (astFold < 10) {

      interpretation +=
        "AST is moderately elevated.\n\n";

    }

    else {

      interpretation +=
        "AST is markedly elevated, indicating severe hepatocellular injury.\n\n";

    }

  }

  /* ======================================================
     AST / ALT RATIO
  ====================================================== */

  if (astAltRatio !== null) {

    interpretation +=
      `AST/ALT ratio is ${astAltRatio.toFixed(2)}.\n\n`;

    if (

      astAltRatio >= 2 &&
      astHigh

    ) {

      interpretation +=
        "An AST/ALT ratio of 2 or greater is suggestive of alcohol-related liver disease in the appropriate clinical setting, particularly when accompanied by elevated GGT.\n\n";

    }

    else if (

      astAltRatio > 1 &&
      altHigh

    ) {

      interpretation +=
        "AST predominance may indicate advanced hepatic fibrosis or cirrhosis.\n\n";

    }

    else if (

      astAltRatio < 1 &&
      altHigh

    ) {

      interpretation +=
        "ALT predominance is more consistent with hepatocellular injury such as acute viral hepatitis, non-alcoholic fatty liver disease or drug-induced liver injury.\n\n";

    }

  }

  /* ======================================================
     ALKALINE PHOSPHATASE (ALP)
  ====================================================== */

  if (alp !== null) {

    if (!alpHigh) {

      interpretation +=
        "Alkaline phosphatase (ALP) is within the reference interval.\n\n";

    }

    else if (alpFold < 2) {

      interpretation +=
        "ALP is mildly elevated.\n\n";

    }

    else if (alpFold < 4) {

      interpretation +=
        "ALP is moderately elevated, suggesting cholestasis or increased bone turnover.\n\n";

    }

    else {

      interpretation +=
        "ALP is markedly elevated, strongly suggesting cholestatic liver disease, biliary obstruction or infiltrative liver disease where hepatic origin is confirmed.\n\n";

    }

  }

  /* ======================================================
     GAMMA-GLUTAMYL TRANSFERASE (GGT)
  ====================================================== */

  if (ggt !== null) {

    if (!ggtHigh) {

      interpretation +=
        "Gamma-glutamyl transferase (GGT) is within the reference interval.\n\n";

    }

    else if (ggtFold < 3) {

      interpretation +=
        "GGT is mildly elevated.\n\n";

    }

    else {

      interpretation +=
        "GGT is markedly elevated, supporting a hepatobiliary source of enzyme elevation and may occur in cholestasis, alcohol-related liver disease or with enzyme-inducing medications.\n\n";

    }

  }

  /* ======================================================
     CHOLESTATIC ENZYME PATTERN
  ====================================================== */

  if (

    alpHigh &&
    ggtHigh

  ) {

    interpretation +=
      "Concurrent elevation of ALP and GGT supports a hepatobiliary source of cholestasis or biliary obstruction.\n\n";

  }

  else if (

    alpHigh &&
    !ggtHigh

  ) {

    interpretation +=
      "Raised ALP with a normal GGT suggests a non-hepatic source such as bone disease, pregnancy or physiological bone growth.\n\n";

  }

  else if (

    ggtHigh &&
    !alpHigh

  ) {

    interpretation +=
      "Isolated elevation of GGT may occur with alcohol consumption, fatty liver disease, enzyme-inducing medications or early hepatobiliary disease.\n\n";

  }

  /* ======================================================
     TOTAL BILIRUBIN
  ====================================================== */

  if (totalBilirubin !== null) {

    if (!bilirubinHigh) {

      interpretation +=
        "Total bilirubin is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Hyperbilirubinaemia is present.\n\n";

    }

  }

  /* ======================================================
     DIRECT BILIRUBIN
  ====================================================== */

  if (

    totalBilirubin !== null &&
    directBilirubin !== null &&
    bilirubinHigh

  ) {

    if (

      directBilirubin >
      (0.20 * totalBilirubin)

    ) {

      interpretation +=
        "Predominantly conjugated hyperbilirubinaemia is present, favouring hepatocellular dysfunction or biliary obstruction.\n\n";

    }

    else {

      interpretation +=
        "Predominantly unconjugated hyperbilirubinaemia is present, which may occur in haemolysis or Gilbert syndrome.\n\n";

    }

  }

  /* ======================================================
     ALBUMIN
  ====================================================== */

  if (albumin !== null) {

    if (albuminLow) {

      interpretation +=
        "Serum albumin is reduced, suggesting impaired hepatic synthetic function, malnutrition, protein loss or chronic systemic illness.\n\n";

    }

    else {

      interpretation +=
        "Serum albumin is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     TOTAL PROTEIN
  ====================================================== */

  if (totalProtein !== null) {

    if (proteinLow) {

      interpretation +=
        "Total serum protein is reduced.\n\n";

    }

    else {

      interpretation +=
        "Total serum protein is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     SYNTHETIC LIVER FUNCTION
  ====================================================== */

  if (

    albuminLow &&
    proteinLow

  ) {

    interpretation +=
      "Concurrent hypoalbuminaemia and hypoproteinaemia may indicate impaired hepatic synthetic function, advanced chronic liver disease or severe protein deficiency.\n\n";

  }

  else if (

    albuminLow

  ) {

    interpretation +=
      "Hypoalbuminaemia may occur in chronic liver disease, nephrotic syndrome, protein-losing enteropathy or malnutrition.\n\n";

  }

  /* ======================================================
     INR
  ====================================================== */

  if (inr !== null) {

    if (!inrHigh) {

      interpretation +=
        "INR is within the expected reference range.\n\n";

    }

    else {

      interpretation +=
        "INR is prolonged, indicating impaired coagulation. In the appropriate clinical setting this may reflect reduced hepatic synthetic function.\n\n";

    }

  }

  /* ======================================================
     PROTHROMBIN TIME
  ====================================================== */

  if (

    pt !== null &&
    inr === null

  ) {

    interpretation +=
      `Prothrombin time is ${pt} seconds.\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Severe Acute Hepatocellular Injury
  ------------------------------------------------------ */

  if (

    altFold >= 25 ||
    astFold >= 25

  ) {

    impression =
      "Severe acute hepatocellular injury.";

    recommendation =
      "Urgent clinical evaluation is recommended. Consider acute viral hepatitis, drug-induced liver injury, ischaemic hepatitis or toxin-related liver injury. Liver synthetic function and coagulation studies should be assessed promptly.";

  }

  /*
     Acute Viral Hepatitis Pattern
  ------------------------------------------------------ */

  else if (

    altHigh &&
    astHigh &&
    alt > ast &&
    bilirubinHigh

  ) {

    impression =
      "Pattern is compatible with acute hepatocellular injury, including acute viral hepatitis.";

    recommendation =
      "Interpret together with viral hepatitis serology, medication history, liver imaging and clinical findings.";

  }

  /*
     Drug-induced Liver Injury
  ------------------------------------------------------ */

  else if (

    altHigh &&
    astHigh &&
    bilirubinHigh &&
    !alpHigh

  ) {

    impression =
      "Predominantly hepatocellular liver injury. Drug-induced liver injury should be considered.";

    recommendation =
      "Review recent medications, herbal preparations and toxin exposure. Clinical assessment and further liver evaluation are recommended.";

  }

  /*
     Alcohol-related Liver Disease
  ------------------------------------------------------ */

  else if (

    astAltRatio !== null &&
    astAltRatio >= 2 &&
    astHigh &&
    ggtHigh

  ) {

    impression =
      "Pattern is suggestive of alcohol-related liver disease.";

    recommendation =
      "Interpret together with alcohol history, clinical findings and liver imaging.";

  }

  /*
     Hepatocellular Injury
  ------------------------------------------------------ */

  else if (

    altHigh &&
    astHigh &&
    !alpHigh

  ) {

    impression =
      "Predominantly hepatocellular liver injury.";

    recommendation =
      "Interpret alongside viral hepatitis screening, medication history, alcohol intake and liver imaging where clinically indicated.";

  }

  /*
     Cholestatic Liver Injury
  ------------------------------------------------------ */

  else if (

    alpHigh &&
    ggtHigh &&
    !altHigh &&
    !astHigh

  ) {

    impression =
      "Predominantly cholestatic liver injury.";

    recommendation =
      "Correlation with hepatobiliary imaging is recommended to exclude biliary obstruction or cholestatic liver disease.";

  }

  /*
     Mixed Liver Injury
  ------------------------------------------------------ */

  else if (

    altHigh &&
    astHigh &&
    alpHigh &&
    ggtHigh

  ) {

    impression =
      "Mixed hepatocellular and cholestatic liver injury.";

    recommendation =
      "Clinical correlation with liver imaging, viral hepatitis screening and medication review is recommended.";

  }

  /*
     Obstructive Jaundice
  ------------------------------------------------------ */

  else if (

    bilirubinHigh &&
    alpHigh &&
    ggtHigh

  ) {

    impression =
      "Pattern is suggestive of obstructive jaundice.";

    recommendation =
      "Abdominal ultrasound should be performed to evaluate for biliary obstruction. Additional hepatobiliary imaging may be required where appropriate.";

  }

  /*
     Non-alcoholic Fatty Liver Disease
  ------------------------------------------------------ */

  else if (

    altHigh &&
    !bilirubinHigh &&
    !albuminLow &&
    astAltRatio !== null &&
    astAltRatio < 1

  ) {

    impression =
      "Mild hepatocellular enzyme elevation compatible with non-alcoholic fatty liver disease (NAFLD) or early chronic liver disease.";

    recommendation =
      "Assess metabolic risk factors including obesity, diabetes mellitus, dyslipidaemia and consider liver ultrasound where appropriate.";

  }

  /*
     Gilbert Syndrome
  ------------------------------------------------------ */

  else if (

    bilirubinHigh &&
    !altHigh &&
    !astHigh &&
    !alpHigh &&
    !albuminLow

  ) {

    impression =
      "Isolated hyperbilirubinaemia compatible with Gilbert syndrome in the appropriate clinical setting.";

    recommendation =
      "Interpret together with bilirubin fractionation and clinical findings. Haemolysis should be excluded where clinically indicated.";

  }

  /*
     Chronic Liver Dysfunction
  ------------------------------------------------------ */

  else if (

    albuminLow &&
    (
      altHigh ||
      astHigh ||
      alpHigh ||
      inrHigh
    )

  ) {

    impression =
      "Abnormal liver profile with evidence of impaired hepatic synthetic function.";

    recommendation =
      "Further evaluation should include coagulation profile, liver imaging, viral hepatitis screening and specialist review where appropriate.";

  }

  /*
     Normal Liver Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Liver function tests are within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation is advised.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("Normal")

  ) {

    recommendation =
      "Interpret alongside the patient's clinical findings. Routine follow-up is advised where clinically indicated.";

  }

  else if (

    impression.includes("Gilbert syndrome")

  ) {

    recommendation =
      "Gilbert syndrome is a benign inherited disorder. Correlate with unconjugated bilirubin levels and exclude haemolysis where clinically indicated.";

  }

  else if (

    impression.includes("alcohol-related")

  ) {

    recommendation =
      "Clinical assessment of alcohol intake is recommended. Consider alcohol cessation counselling, nutritional assessment and liver ultrasound where appropriate.";

  }

  else if (

    impression.includes("viral hepatitis")

  ) {

    recommendation =
      "Perform viral hepatitis serology (HAV, HBV, HCV and others where appropriate), assess liver synthetic function and consider hepatology referral.";

  }

  else if (

    impression.includes("Drug-induced")

  ) {

    recommendation =
      "Review all prescription medications, herbal preparations and over-the-counter drugs. Withdrawal of the suspected offending agent should be considered where clinically appropriate.";

  }

  else if (

    impression.includes("obstructive jaundice")

  ) {

    recommendation =
      "Abdominal ultrasound is recommended as the initial imaging investigation. Further hepatobiliary imaging (MRCP, CT or ERCP) may be required depending on the clinical findings.";

  }

  else if (

    impression.includes("NAFLD")

  ) {

    recommendation =
      "Assess for obesity, diabetes mellitus, dyslipidaemia and metabolic syndrome. Lifestyle modification and liver ultrasound are recommended.";

  }

  else if (

    impression.includes("synthetic function")

  ) {

    recommendation =
      "Further evaluation should include coagulation profile, viral hepatitis screening, liver ultrasound and hepatology consultation where appropriate.";

  }

  else if (

    impression.includes("Severe acute")

  ) {

    recommendation =
      "Urgent medical assessment is recommended. Evaluate coagulation profile, bilirubin, albumin, viral hepatitis markers and possible drug toxicity. Early specialist referral is advised.";

  }

  /* ======================================================
     FINAL RETURN
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}

/* ======================================================
   PATTERN RECOGNITION
====================================================== */

if (

  altFold >= 25 ||
  astFold >= 25

) {

  impression =
    "Severe acute hepatocellular injury.";

  recommendation =
    "Urgent clinical evaluation is recommended. Consider acute viral hepatitis, drug-induced liver injury, ischaemic hepatitis or toxin-related liver injury. Liver synthetic function and coagulation studies should be assessed promptly.";

}

else if (

  isHigh(alt, ALT_ULN) &&
  isHigh(ast, AST_ULN) &&
  totalBilirubin !== null &&
  totalBilirubin > TBIL_ULN &&
  alt > ast

) {

  impression =
    "Pattern is compatible with acute hepatocellular injury, including viral hepatitis.";

  recommendation =
    "Interpret together with viral hepatitis serology, medication history, liver imaging and clinical findings.";

}

else if (

  isHigh(alt, ALT_ULN) &&
  isHigh(ast, AST_ULN) &&
  totalBilirubin !== null &&
  totalBilirubin > TBIL_ULN &&
  !isHigh(alp, ALP_ULN)

) {

  impression =
    "Predominantly hepatocellular liver injury. Drug-induced liver injury should be considered where clinically appropriate.";

  recommendation =
    "Review recent medications, herbal preparations and toxin exposure. Clinical assessment and further liver evaluation are recommended.";

}

else if (

  isHigh(alt, ALT_ULN) &&
  isHigh(ast, AST_ULN) &&
  !isHigh(alp, ALP_ULN)

) {

  impression =
    "Predominantly hepatocellular liver injury.";

  recommendation =
    "Interpret alongside viral hepatitis screening, medication history, alcohol intake and liver imaging where clinically indicated.";

}

else if (

  astAltRatio !== null &&
  astAltRatio >= 2 &&
  isHigh(ast, AST_ULN) &&
  isHigh(ggt, GGT_ULN)

) {

  impression =
    "Pattern is suggestive of alcohol-related liver disease.";

  recommendation =
    "Interpret together with alcohol history, clinical findings and liver imaging.";

}

else if (

  isHigh(alp, ALP_ULN) &&
  isHigh(ggt, GGT_ULN) &&
  totalBilirubin !== null &&
  totalBilirubin > TBIL_ULN

) {

  impression =
    "Pattern is suggestive of obstructive jaundice.";

  recommendation =
    "Abdominal ultrasound is recommended as the initial imaging investigation. Further hepatobiliary imaging may be required depending on clinical findings.";

}

else if (

  isHigh(alp, ALP_ULN) &&
  isHigh(ggt, GGT_ULN)

) {

  impression =
    "Predominantly cholestatic liver injury.";

  recommendation =
    "Correlation with hepatobiliary imaging is recommended to exclude biliary obstruction or cholestatic liver disease.";

}

else if (

  isHigh(alp, ALP_ULN) &&
  isHigh(ggt, GGT_ULN) &&
  isHigh(alt, ALT_ULN)

) {

  impression =
    "Mixed hepatocellular and cholestatic liver injury.";

  recommendation =
    "Clinical correlation with liver imaging, viral hepatitis screening and medication review is recommended.";

}

else if (

  isLow(albumin, ALBUMIN_LOW) &&
  (
    isHigh(alt, ALT_ULN) ||
    isHigh(ast, AST_ULN) ||
    isHigh(alp, ALP_ULN)
  )

) {

  impression =
    "Abnormal liver profile with evidence of impaired hepatic synthetic function.";

  recommendation =
    "Further evaluation should include coagulation profile, liver imaging and specialist review where appropriate.";

}

else if (

  totalBilirubin !== null &&
  totalBilirubin > TBIL_ULN &&
  !isHigh(alt, ALT_ULN) &&
  !isHigh(ast, AST_ULN) &&
  !isHigh(alp, ALP_ULN)

) {

  impression =
    "Isolated hyperbilirubinaemia.";

  recommendation =
    "Consider Gilbert syndrome, haemolysis or early hepatobiliary disease depending on bilirubin fractionation and clinical findings.";

}

else {

  impression =
    "Liver function tests are within acceptable laboratory limits.";

  recommendation =
    "Routine clinical correlation.";

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