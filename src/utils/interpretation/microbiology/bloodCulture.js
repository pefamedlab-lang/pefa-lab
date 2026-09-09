import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   BLOOD CULTURE INTERPRETATION ENGINE

   Supports
   ------------------------------------------------
   • Blood Culture
   • Gram Stain
   • Organism Isolated
   • Number of Positive Bottles
   • Number of Sets Collected
   • Time To Positivity (TTP)
   • Antimicrobial Susceptibility

   Detects
   ------------------------------------------------
   • No Growth
   • True Bloodstream Infection
   • Possible Blood Culture Contamination
   • Gram Positive Septicaemia
   • Gram Negative Septicaemia
   • Candida Bloodstream Infection
   • Polymicrobial Bloodstream Infection
========================================================== */

export default function interpretBloodCulture(

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
     CULTURE
  ====================================================== */

  const culture =
    getResult(resultMap, "Blood Culture") ??
    getResult(resultMap, "Culture") ??
    "";

  const gramStain =
    getResult(resultMap, "Gram Stain") ??
    "";

  const organism =
    getResult(resultMap, "Organism Isolated") ??
    "";

  const susceptibility =
    getResult(resultMap, "Antimicrobial Susceptibility") ??
    "";

  /* ======================================================
     COLLECTION DETAILS
  ====================================================== */

  const positiveBottles =
    getNumericResult(resultMap, "Positive Bottles");

  const totalBottles =
    getNumericResult(resultMap, "Total Bottles");

  const cultureSets =
    getNumericResult(resultMap, "Blood Culture Sets");

  const ttp =
    getNumericResult(resultMap, "Time To Positivity");

  /* ======================================================
     NORMALISE
  ====================================================== */

  const cultureText =
    culture.toLowerCase();

  const gramText =
    gramStain.toLowerCase();

  const organismText =
    organism.toLowerCase();

  /* ======================================================
     FLAGS
  ====================================================== */

  const noGrowth =

    cultureText.includes("no growth") ||

    cultureText.includes("negative");

  const gramPositive =

    gramText.includes("gram positive");

  const gramNegative =

    gramText.includes("gram negative");

  const yeastSeen =

    gramText.includes("yeast");

  const positiveCulture =

    !noGrowth &&
    (
      organismText.length > 0 ||
      cultureText.includes("growth")
    );

  const polymicrobial =

    organismText.includes(",") ||

    organismText.includes("+") ||

    organismText.includes("mixed");

  const contaminant =

    organismText.includes("coagulase-negative staphylococcus") ||

    organismText.includes("coagulase negative staphylococcus") ||

    organismText.includes("micrococcus") ||

    organismText.includes("corynebacterium") ||

    organismText.includes("bacillus spp") ||

    organismText.includes("bacillus species");

  const candida =

    organismText.includes("candida");

  const significantPathogen =

    organismText.includes("staphylococcus aureus") ||

    organismText.includes("escherichia coli") ||

    organismText.includes("klebsiella") ||

    organismText.includes("pseudomonas") ||

    organismText.includes("enterobacter") ||

    organismText.includes("enterococcus") ||

    organismText.includes("streptococcus pneumoniae") ||

    organismText.includes("neisseria meningitidis") ||

    organismText.includes("salmonella") ||

    organismText.includes("candida");

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     CULTURE RESULT
  ====================================================== */

  if (noGrowth) {

    interpretation +=
      "No microbial growth was detected in the blood culture during the incubation period.\n\n";

  }

  else if (positiveCulture) {

    interpretation +=
      "Blood culture demonstrates significant microbial growth.\n\n";

  }

  /* ======================================================
     GRAM STAIN
  ====================================================== */

  if (gramPositive) {

    interpretation +=
      "Gram-positive organisms are observed on Gram stain. Preliminary antimicrobial therapy should include appropriate Gram-positive coverage pending organism identification and susceptibility testing.\n\n";

  }

  if (gramNegative) {

    interpretation +=
      "Gram-negative organisms are observed on Gram stain. Prompt clinical assessment and appropriate antimicrobial therapy are recommended.\n\n";

  }

  if (yeastSeen) {

    interpretation +=
      "Yeast cells are observed on Gram stain. This finding is highly suggestive of candidaemia and requires urgent clinical attention.\n\n";

  }

  /* ======================================================
     POSITIVE BOTTLES
  ====================================================== */

  if (

    positiveBottles !== null &&
    totalBottles !== null

  ) {

    interpretation +=
      `${positiveBottles} of ${totalBottles} blood culture bottle(s) demonstrated microbial growth.\n\n`;

    if (

      positiveBottles === totalBottles &&
      totalBottles > 1

    ) {

      interpretation +=
        "Growth in all collected bottles strongly supports true bloodstream infection.\n\n";

    }

    else if (

      positiveBottles === 1 &&
      totalBottles >= 2

    ) {

      interpretation +=
        "Growth in only one bottle may represent contamination, particularly when typical skin flora are isolated.\n\n";

    }

  }

  /* ======================================================
     BLOOD CULTURE SETS
  ====================================================== */

  if (

    cultureSets !== null

  ) {

    interpretation +=
      `${cultureSets} blood culture set(s) were submitted for microbiological investigation.\n\n`;

  }

  /* ======================================================
     TIME TO POSITIVITY
  ====================================================== */

  if (

    ttp !== null

  ) {

    interpretation +=
      `Time to positivity: ${ttp} hour(s).\n\n`;

    if (

      ttp <= 12

    ) {

      interpretation +=
        "Rapid positivity is commonly associated with a higher microbial burden and true bloodstream infection.\n\n";

    }

    else if (

      ttp > 36

    ) {

      interpretation +=
        "Delayed positivity may occur with slow-growing organisms or contaminants and should be interpreted together with organism identity and clinical findings.\n\n";

    }

  }

  /* ======================================================
     ORGANISM IDENTIFICATION
  ====================================================== */

  if (

    organism &&
    organism.trim() !== ""

  ) {

    interpretation +=
      `Organism isolated: ${organism}.\n\n`;

  }

  /* ======================================================
     POLYMICROBIAL CULTURE
  ====================================================== */

  if (

    polymicrobial

  ) {

    interpretation +=
      "Multiple organisms have been isolated. This may represent polymicrobial bloodstream infection or specimen contamination depending on the clinical context.\n\n";

  }

  /* ======================================================
     CANDIDA
  ====================================================== */

  if (

    candida

  ) {

    interpretation +=
      "Candida species isolated from blood culture should always be considered clinically significant until proven otherwise.\n\n";

  }

  /* ======================================================
     POSSIBLE CONTAMINATION
  ====================================================== */

  if (

    contaminant

  ) {

    interpretation +=
      "The isolated organism commonly forms part of normal skin flora and may represent blood culture contamination, particularly when isolated from a single bottle without compatible clinical findings.\n\n";

  }

  /* ======================================================
     SIGNIFICANT PATHOGEN
  ====================================================== */

  if (

    significantPathogen

  ) {

    interpretation +=
      "The isolated organism is a recognised bloodstream pathogen and should generally be regarded as clinically significant.\n\n";

  }

  /* ======================================================
     SUSCEPTIBILITY
  ====================================================== */

  if (

    susceptibility &&
    susceptibility.trim() !== ""

  ) {

    interpretation +=
      "Antimicrobial susceptibility results are available and should be used to optimise antimicrobial therapy.\n\n";

  }

  interpretation +=
    "Blood culture findings should always be interpreted together with the patient's clinical condition, inflammatory markers, source of infection and antimicrobial treatment history.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NO BLOODSTREAM INFECTION
  ---------------------------------------------------------
  */

  if (noGrowth) {

    impression =
      "No microbial growth detected in blood culture.";

    recommendation =
      "No microbiological evidence of bloodstream infection was identified. If clinical suspicion remains high, repeat blood cultures before initiating or changing antimicrobial therapy.";

  }

  /*
  ---------------------------------------------------------
  CANDIDAEMIA
  ---------------------------------------------------------
  */

  else if (

    candida ||
    yeastSeen

  ) {

    impression =
      "Candida bloodstream infection (candidaemia).";

    recommendation =
      "Candida isolated from blood culture should always be regarded as clinically significant. Prompt antifungal therapy, repeat blood cultures and investigation for the source of infection are recommended.";

  }

  /*
  ---------------------------------------------------------
  POLYMICROBIAL BACTERAEMIA
  ---------------------------------------------------------
  */

  else if (

    polymicrobial

  ) {

    impression =
      "Polymicrobial bloodstream infection.";

    recommendation =
      "Evaluate for an intra-abdominal, pelvic, diabetic foot, catheter-related or other deep-seated source of infection. Antimicrobial therapy should cover all clinically significant isolates.";

  }

  /*
  ---------------------------------------------------------
  PROBABLE CONTAMINATION
  ---------------------------------------------------------
  */

  else if (

    contaminant &&
    positiveBottles === 1 &&
    totalBottles > 1

  ) {

    impression =
      "Probable blood culture contamination.";

    recommendation =
      "Repeat blood cultures if bloodstream infection remains clinically suspected. Correlate with symptoms, inflammatory markers and catheter status.";

  }

  /*
  ---------------------------------------------------------
  TRUE BLOODSTREAM INFECTION
  ---------------------------------------------------------
  */

  else if (

    significantPathogen ||

    (
      positiveBottles !== null &&
      totalBottles !== null &&
      positiveBottles === totalBottles
    )

  ) {

    impression =
      "True bloodstream infection.";

    recommendation =
      "Treat according to antimicrobial susceptibility results. Investigate and control the primary source of infection.";

  }

  /*
  ---------------------------------------------------------
  GRAM-POSITIVE BACTERAEMIA
  ---------------------------------------------------------
  */

  else if (

    gramPositive

  ) {

    impression =
      "Gram-positive bacteraemia.";

    recommendation =
      "Adjust antimicrobial therapy after final organism identification and susceptibility testing.";

  }

  /*
  ---------------------------------------------------------
  GRAM-NEGATIVE BACTERAEMIA
  ---------------------------------------------------------
  */

  else if (

    gramNegative

  ) {

    impression =
      "Gram-negative bacteraemia.";

    recommendation =
      "Prompt source control and definitive antimicrobial therapy based on susceptibility testing are recommended.";

  }

  /*
  ---------------------------------------------------------
  POSITIVE BLOOD CULTURE
  ---------------------------------------------------------
  */

  else if (

    positiveCulture

  ) {

    impression =
      "Positive blood culture.";

    recommendation =
      "Interpret together with organism identification, susceptibility profile and the patient's clinical findings.";

  }

  /*
  ---------------------------------------------------------
  INDETERMINATE
  ---------------------------------------------------------
  */

  else {

    impression =
      "Blood culture findings require clinical correlation.";

    recommendation =
      "Review organism identification, repeat cultures where appropriate and correlate with clinical findings.";

  }

  /* ======================================================
     SUPPORTING COMMENTS
  ====================================================== */

  if (

    positiveBottles !== null &&
    totalBottles !== null &&
    positiveBottles === totalBottles &&
    totalBottles > 1

  ) {

    interpretation +=
      "Growth in all culture bottles strongly supports genuine bloodstream infection.\n\n";

  }

  if (

    positiveBottles === 1 &&
    totalBottles > 1 &&
    contaminant

  ) {

    interpretation +=
      "Isolation of a common skin commensal from only one bottle favors contamination rather than true bacteraemia.\n\n";

  }

  if (

    ttp !== null &&
    ttp <= 12

  ) {

    interpretation +=
      "Early time-to-positivity supports a higher circulating microbial burden.\n\n";

  }

  if (

    ttp !== null &&
    ttp > 36 &&
    contaminant

  ) {

    interpretation +=
      "Late positivity together with isolation of a common contaminant favors specimen contamination.\n\n";

  }

  if (

    susceptibility &&
    susceptibility.trim() !== ""

  ) {

    interpretation +=
      "Definitive antimicrobial selection should be based on the reported susceptibility profile.\n\n";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "No microbial growth detected in blood culture.":

      recommendation =
        "No laboratory evidence of bloodstream infection was identified. If sepsis remains clinically suspected, obtain repeat blood cultures before commencing or modifying antimicrobial therapy where feasible.";

      break;

    case "True bloodstream infection.":

      recommendation =
        "Initiate or optimize antimicrobial therapy according to susceptibility results. Prompt source identification and source control are essential.";

      break;

    case "Gram-positive bacteraemia.":

      recommendation =
        "Adjust antimicrobial therapy according to final organism identification and susceptibility profile. Evaluate for infective endocarditis where clinically indicated.";

      break;

    case "Gram-negative bacteraemia.":

      recommendation =
        "Investigate the primary source of infection, including urinary, biliary, gastrointestinal and respiratory sources. Tailor antimicrobial therapy to susceptibility results.";

      break;

    case "Candida bloodstream infection (candidaemia).":

      recommendation =
        "Candida isolated from blood should always be considered clinically significant. Repeat blood cultures until clearance is documented, remove intravascular catheters where appropriate and perform ophthalmologic assessment according to current guidelines.";

      break;

    case "Polymicrobial bloodstream infection.":

      recommendation =
        "Search for an underlying deep-seated or intra-abdominal source. Ensure antimicrobial therapy adequately covers all clinically significant isolates.";

      break;

    case "Probable blood culture contamination.":

      recommendation =
        "Repeat blood cultures if clinically indicated. Interpretation should consider symptoms, inflammatory markers, number of positive bottles and catheter status.";

      break;

    default:

      recommendation =
        recommendation ||
        "Interpret together with the patient's clinical presentation, inflammatory markers and antimicrobial susceptibility results.";

  }

  /* ======================================================
     ORGANISM-SPECIFIC COMMENTS
  ====================================================== */

  if (organismText.includes("staphylococcus aureus")) {

    interpretation +=
      "Staphylococcus aureus bacteraemia is always clinically significant until proven otherwise. Evaluate for infective endocarditis, metastatic infection and removable infection sources.\n\n";

  }

  if (

    organismText.includes("escherichia coli")

  ) {

    interpretation +=
      "Escherichia coli bacteraemia most commonly originates from the urinary tract, hepatobiliary tract or gastrointestinal tract.\n\n";

  }

  if (

    organismText.includes("klebsiella")

  ) {

    interpretation +=
      "Klebsiella species commonly cause healthcare-associated bloodstream infection and may produce extended-spectrum beta-lactamases (ESBLs). Review susceptibility carefully.\n\n";

  }

  if (

    organismText.includes("pseudomonas")

  ) {

    interpretation +=
      "Pseudomonas aeruginosa bacteraemia is frequently associated with healthcare exposure and may demonstrate multidrug resistance.\n\n";

  }

  if (

    organismText.includes("enterococcus")

  ) {

    interpretation +=
      "Enterococcus bloodstream infection should prompt evaluation for urinary tract infection, intra-abdominal infection or infective endocarditis where clinically appropriate.\n\n";

  }

  if (

    organismText.includes("streptococcus pneumoniae")

  ) {

    interpretation +=
      "Streptococcus pneumoniae bacteraemia is commonly associated with pneumonia, meningitis and invasive pneumococcal disease.\n\n";

  }

  if (

    organismText.includes("salmonella")

  ) {

    interpretation +=
      "Salmonella bloodstream infection should prompt evaluation for enteric fever, immunosuppression and focal metastatic infection.\n\n";

  }

  if (

    candida

  ) {

    interpretation +=
      "Candida isolated from blood culture is never considered a contaminant and requires urgent clinical management.\n\n";

  }

  if (

    contaminant

  ) {

    interpretation +=
      "Common skin commensals may represent contamination; however, repeated isolation from multiple blood culture sets may indicate genuine bloodstream infection.\n\n";

  }

  /* ======================================================
     CENTRAL LINE COMMENT
  ====================================================== */

  if (

    positiveCulture

  ) {

    interpretation +=
      "Where an intravascular catheter is present, evaluate for catheter-related bloodstream infection. Catheter removal or exchange may be required depending on the organism and clinical response.\n\n";

  }

  /* ======================================================
     IMPORTANT LIMITATIONS
  ====================================================== */

  interpretation +=
    "Negative blood cultures do not exclude bloodstream infection, particularly after prior antimicrobial therapy, intermittent bacteraemia or infection caused by fastidious organisms.\n\n";

  interpretation +=
    "Blood culture interpretation should incorporate the number of positive bottles, number of culture sets, time to positivity, organism identity and the patient's clinical condition.\n\n";

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Final interpretation should integrate microbiological findings with clinical assessment, inflammatory markers, imaging studies and antimicrobial susceptibility testing. Early recognition and appropriate management of bloodstream infection are essential to reduce morbidity and mortality.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation: interpretation.trim(),

    impression,

    recommendation,

  });

}