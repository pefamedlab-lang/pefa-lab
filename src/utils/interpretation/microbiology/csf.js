import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   CEREBROSPINAL FLUID (CSF) INTERPRETATION ENGINE

   Supports
   ------------------------------------------------
   • Appearance
   • Colour
   • Opening Pressure (optional)

   Chemistry
   ------------------------------------------------
   • Protein
   • Glucose
   • CSF/Serum Glucose Ratio
   • Lactate (optional)

   Microscopy
   ------------------------------------------------
   • WBC
   • RBC
   • Neutrophils
   • Lymphocytes
   • Gram Stain
   • India Ink
   • AFB
   • Cryptococcal Antigen

   Microbiology
   ------------------------------------------------
   • Culture
   • Organism Isolated

   Detects
   ------------------------------------------------
   • Normal CSF
   • Acute Bacterial Meningitis
   • Viral Meningitis
   • Tuberculous Meningitis
   • Cryptococcal Meningitis
   • Fungal Meningitis
   • Subarachnoid Haemorrhage
   • Traumatic Tap
========================================================== */

export default function interpretCSF(

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
     PHYSICAL APPEARANCE
  ====================================================== */

  const appearance =
    getResult(resultMap, "Appearance") ?? "";

  const colour =
    getResult(resultMap, "Colour") ??
    getResult(resultMap, "Color") ??
    "";

  const openingPressure =
    getNumericResult(resultMap, "Opening Pressure");

  /* ======================================================
     CHEMISTRY
  ====================================================== */

  const protein =
    getNumericResult(resultMap, "Protein");

  const glucose =
    getNumericResult(resultMap, "Glucose");

  const glucoseRatio =
    getNumericResult(resultMap, "CSF/Serum Glucose Ratio");

  const lactate =
    getNumericResult(resultMap, "Lactate");

  /* ======================================================
     CELL COUNTS
  ====================================================== */

  const wbc =
    getNumericResult(resultMap, "WBC");

  const rbc =
    getNumericResult(resultMap, "RBC");

  const neutrophils =
    getNumericResult(resultMap, "Neutrophils");

  const lymphocytes =
    getNumericResult(resultMap, "Lymphocytes");

  /* ======================================================
     MICROBIOLOGY
  ====================================================== */

  const gramStain =
    getResult(resultMap, "Gram Stain") ?? "";

  const indiaInk =
    getResult(resultMap, "India Ink") ?? "";

  const afb =
    getResult(resultMap, "AFB") ?? "";

  const cryptococcalAg =
    getResult(resultMap, "Cryptococcal Antigen") ?? "";

  const culture =
    getResult(resultMap, "Culture") ?? "";

  const organism =
    getResult(resultMap, "Organism Isolated") ?? "";

  /* ======================================================
     NORMALISE
  ====================================================== */

  const gramText =
    gramStain.toLowerCase();

  const indiaText =
    indiaInk.toLowerCase();

  const afbText =
    afb.toLowerCase();

  const cryptoText =
    cryptococcalAg.toLowerCase();

  const cultureText =
    culture.toLowerCase();

  const organismText =
    organism.toLowerCase();

  /* ======================================================
     FLAGS
  ====================================================== */

  const turbid =
    appearance.toLowerCase().includes("turbid") ||
    appearance.toLowerCase().includes("cloudy");

  const xanthochromia =
    colour.toLowerCase().includes("xantho") ||
    colour.toLowerCase().includes("yellow");

  const elevatedProtein =
    protein !== null &&
    protein > 45;

  const lowGlucose =
    glucose !== null &&
    glucose < 40;

  const lowRatio =
    glucoseRatio !== null &&
    glucoseRatio < 0.4;

  const elevatedLactate =
    lactate !== null &&
    lactate > 3.5;

  const pleocytosis =
    wbc !== null &&
    wbc > 5;

  const neutrophilic =
    neutrophils !== null &&
    neutrophils > lymphocytes;

  const lymphocytic =
    lymphocytes !== null &&
    lymphocytes >= neutrophils;

  const gramPositive =
    gramText.includes("positive") ||
    gramText.includes("organism");

  const indiaPositive =
    indiaText.includes("positive") ||
    indiaText.includes("encapsulated");

  const afbPositive =
    afbText.includes("positive");

  const cryptoPositive =
    cryptoText.includes("positive") ||
    cryptoText.includes("detected");

  const culturePositive =
    cultureText.includes("growth") ||
    organismText.length > 0;

  /* ======================================================
     OUTPUT
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  if (appearance) {

    if (turbid) {

      interpretation +=
        "The cerebrospinal fluid is turbid, suggesting increased cellular content, microorganisms and/or elevated protein. This finding is commonly associated with acute bacterial meningitis.\n\n";

    }

    else {

      interpretation +=
        `CSF appearance: ${appearance}.\n\n`;

    }

  }

  if (colour) {

    if (xanthochromia) {

      interpretation +=
        "Xanthochromia is present. This may indicate subarachnoid haemorrhage, previous intracranial bleeding or marked hyperbilirubinaemia. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        `CSF colour: ${colour}.\n\n`;

    }

  }

  if (openingPressure !== null) {

    if (openingPressure > 20) {

      interpretation +=
        `Opening pressure is elevated (${openingPressure} cmH₂O), suggesting raised intracranial pressure.\n\n`;

    }

    else {

      interpretation +=
        `Opening pressure: ${openingPressure} cmH₂O.\n\n`;

    }

  }

  /* ======================================================
     CHEMISTRY
  ====================================================== */

  if (protein !== null) {

    if (elevatedProtein) {

      interpretation +=
        `CSF protein is elevated (${protein} mg/dL). Increased protein may occur in bacterial, tuberculous or fungal meningitis, inflammatory disorders or intracranial haemorrhage.\n\n`;

    }

    else {

      interpretation +=
        `CSF protein: ${protein} mg/dL.\n\n`;

    }

  }

  if (glucose !== null) {

    if (lowGlucose) {

      interpretation +=
        `CSF glucose is reduced (${glucose} mg/dL), supporting bacterial, tuberculous or fungal meningitis when interpreted with other CSF findings.\n\n`;

    }

    else {

      interpretation +=
        `CSF glucose: ${glucose} mg/dL.\n\n`;

    }

  }

  if (glucoseRatio !== null) {

    if (lowRatio) {

      interpretation +=
        `The CSF/serum glucose ratio (${glucoseRatio}) is reduced and supports impaired glucose transport or increased glucose consumption within the CSF.\n\n`;

    }

  }

  if (lactate !== null) {

    if (elevatedLactate) {

      interpretation +=
        `CSF lactate is elevated (${lactate} mmol/L), supporting bacterial meningitis when interpreted together with microscopy and culture.\n\n`;

    }

    else {

      interpretation +=
        `CSF lactate: ${lactate} mmol/L.\n\n`;

    }

  }

  /* ======================================================
     CELL COUNTS
  ====================================================== */

  if (wbc !== null) {

    if (pleocytosis) {

      interpretation +=
        `Pleocytosis is present (${wbc} cells/µL), indicating inflammation within the central nervous system.\n\n`;

    }

    else {

      interpretation +=
        `CSF white cell count: ${wbc} cells/µL.\n\n`;

    }

  }

  if (rbc !== null) {

    if (rbc > 0) {

      interpretation +=
        `Red blood cells are present (${rbc} cells/µL). Correlate with traumatic lumbar puncture or intracranial haemorrhage.\n\n`;

    }

  }

  if (neutrophilic) {

    interpretation +=
      "Neutrophil predominance is demonstrated and is most consistent with acute bacterial meningitis, although it may occur early in viral meningitis.\n\n";

  }

  else if (lymphocytic) {

    interpretation +=
      "Lymphocyte predominance is demonstrated and is commonly associated with viral, tuberculous or fungal meningitis.\n\n";

  }

  /* ======================================================
     MICROBIOLOGY
  ====================================================== */

  if (gramPositive) {

    interpretation +=
      "Microorganisms are seen on Gram stain, providing strong evidence of bacterial meningitis.\n\n";

  }

  if (indiaPositive) {

    interpretation +=
      "India ink preparation demonstrates encapsulated yeast, consistent with Cryptococcus species.\n\n";

  }

  if (cryptoPositive) {

    interpretation +=
      "Cryptococcal antigen is detected, supporting cryptococcal meningitis.\n\n";

  }

  if (afbPositive) {

    interpretation +=
      "Acid-fast bacilli are detected, supporting tuberculous meningitis.\n\n";

  }

  if (culturePositive) {

    interpretation +=
      `CSF culture yielded ${organism || "significant microbial growth"}.\n\n`;

  }

  else if (

    culture &&
    culture.toLowerCase().includes("no growth")

  ) {

    interpretation +=
      "No bacterial growth was obtained on culture.\n\n";

  }

  interpretation +=
    "CSF results should always be interpreted together with the patient's neurological findings, neuroimaging where appropriate and other microbiological investigations.\n\n";

  /* ======================================================
     DISEASE PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  NORMAL CSF
  ---------------------------------------------------------
  */

  const normalCSF =

    !pleocytosis &&
    !elevatedProtein &&
    !lowGlucose &&
    !lowRatio &&
    !gramPositive &&
    !culturePositive &&
    !indiaPositive &&
    !cryptoPositive &&
    !afbPositive &&
    !xanthochromia &&
    !turbid;

  if (normalCSF) {

    impression =
      "Cerebrospinal fluid findings are within normal limits.";

    recommendation =
      "No significant laboratory evidence of central nervous system infection is identified. Correlate with the clinical presentation.";

  }

  /*
  ---------------------------------------------------------
  ACUTE BACTERIAL MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    (
      gramPositive ||
      culturePositive
    ) ||

    (
      pleocytosis &&
      neutrophilic &&
      elevatedProtein &&
      (
        lowGlucose ||
        lowRatio
      )
    )

  ) {

    impression =
      "Findings are consistent with acute bacterial meningitis.";

    recommendation =
      "Immediate antimicrobial therapy is indicated. Management should be guided by culture identification and antimicrobial susceptibility testing.";

  }

  /*
  ---------------------------------------------------------
  TUBERCULOUS MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    afbPositive ||

    (
      lymphocytic &&
      elevatedProtein &&
      (
        lowGlucose ||
        lowRatio
      )
    )

  ) {

    impression =
      "Findings are suggestive of tuberculous meningitis.";

    recommendation =
      "Recommend mycobacterial culture and/or nucleic acid amplification testing where available. Prompt specialist management is advised.";

  }

  /*
  ---------------------------------------------------------
  CRYPTOCOCCAL MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    cryptoPositive ||
    indiaPositive

  ) {

    impression =
      "Findings are consistent with cryptococcal meningitis.";

    recommendation =
      "Urgent antifungal therapy is recommended. HIV testing and assessment of immune status should be considered where appropriate.";

  }

  /*
  ---------------------------------------------------------
  FUNGAL MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    culturePositive &&
    organismText.includes("candida")

  ) {

    impression =
      "Findings suggest fungal meningitis.";

    recommendation =
      "Treatment should be guided by fungal identification and antifungal susceptibility where available.";

  }

  /*
  ---------------------------------------------------------
  VIRAL MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    lymphocytic &&
    pleocytosis &&
    !lowGlucose &&
    !gramPositive &&
    !culturePositive &&
    !afbPositive &&
    !cryptoPositive

  ) {

    impression =
      "Findings are suggestive of viral meningitis.";

    recommendation =
      "Supportive management is appropriate in most cases. Consider viral PCR testing where clinically indicated.";

  }

  /*
  ---------------------------------------------------------
  SUBARACHNOID HAEMORRHAGE
  ---------------------------------------------------------
  */

  else if (

    xanthochromia &&
    rbc !== null &&
    rbc > 0

  ) {

    impression =
      "Findings are suggestive of subarachnoid haemorrhage.";

    recommendation =
      "Urgent neurological assessment and neuroimaging are recommended.";

  }

  /*
  ---------------------------------------------------------
  TRAUMATIC TAP
  ---------------------------------------------------------
  */

  else if (

    rbc !== null &&
    rbc > 0 &&
    !xanthochromia &&
    !pleocytosis

  ) {

    impression =
      "Findings are compatible with a traumatic lumbar puncture.";

    recommendation =
      "Interpret red blood cell count together with the collection sequence and clinical findings.";

  }

  /*
  ---------------------------------------------------------
  NON-SPECIFIC CSF ABNORMALITY
  ---------------------------------------------------------
  */

  else if (

    pleocytosis ||
    elevatedProtein ||
    lowGlucose

  ) {

    impression =
      "Abnormal cerebrospinal fluid findings.";

    recommendation =
      "Further microbiological, molecular and clinical evaluation is recommended.";

  }

  /*
  ---------------------------------------------------------
  GENERAL ABNORMALITY
  ---------------------------------------------------------
  */

  else {

    impression =
      "Abnormal cerebrospinal fluid examination.";

    recommendation =
      "Interpret together with neuroimaging, microbiological investigations and the overall clinical picture.";

  }

  /* ======================================================
     SUPPORTING COMMENTS
  ====================================================== */

  if (

    pleocytosis &&
    neutrophilic

  ) {

    interpretation +=
      "The combination of pleocytosis with neutrophil predominance strongly supports an acute pyogenic inflammatory process.\n\n";

  }

  if (

    pleocytosis &&
    lymphocytic

  ) {

    interpretation +=
      "Lymphocytic pleocytosis is commonly encountered in viral, tuberculous and fungal meningitis.\n\n";

  }

  if (

    elevatedProtein &&
    lowGlucose

  ) {

    interpretation +=
      "The combination of elevated protein and reduced CSF glucose strongly supports bacterial, tuberculous or fungal meningitis when correlated with microbiological findings.\n\n";

  }

  if (

    gramPositive &&
    culturePositive

  ) {

    interpretation +=
      "Both Gram stain and culture support the microbiological diagnosis.\n\n";

  }

  if (

    cryptoPositive &&
    indiaPositive

  ) {

    interpretation +=
      "Positive India ink preparation together with cryptococcal antigen provides strong laboratory evidence of cryptococcal meningitis.\n\n";

  }

  if (

    afbPositive

  ) {

    interpretation +=
      "Detection of acid-fast bacilli is highly suggestive of central nervous system tuberculosis and requires urgent treatment.\n\n";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  switch (impression) {

    case "Cerebrospinal fluid findings are within normal limits.":

      recommendation =
        "No laboratory evidence of meningitis is identified. If clinical suspicion remains high, repeat CSF examination and consider molecular testing where appropriate.";

      break;

    case "Findings are consistent with acute bacterial meningitis.":

      recommendation =
        "Urgent antimicrobial therapy should not be delayed. Review Gram stain, culture and antimicrobial susceptibility results when available.";

      break;

    case "Findings are suggestive of viral meningitis.":

      recommendation =
        "Consider CSF viral PCR where available. Management should be guided by clinical assessment and suspected viral aetiology.";

      break;

    case "Findings are suggestive of tuberculous meningitis.":

      recommendation =
        "Recommend CSF GeneXpert MTB/RIF, mycobacterial culture and neuroimaging where appropriate. Early anti-tuberculous therapy is advised when clinically suspected.";

      break;

    case "Findings are consistent with cryptococcal meningitis.":

      recommendation =
        "Urgent antifungal therapy is recommended. Monitor intracranial pressure and investigate underlying immunosuppression.";

      break;

    case "Findings suggest fungal meningitis.":

      recommendation =
        "Management should be guided by fungal identification and antifungal susceptibility testing where available.";

      break;

    case "Findings are suggestive of subarachnoid haemorrhage.":

      recommendation =
        "Urgent neurosurgical assessment and brain imaging are recommended.";

      break;

    case "Findings are compatible with a traumatic lumbar puncture.":

      recommendation =
        "Interpret with caution and correlate with sequential tube counts, clinical findings and neuroimaging where indicated.";

      break;

    default:

      recommendation =
        recommendation ||
        "Interpret CSF findings together with clinical examination, neuroimaging and additional microbiological investigations.";

  }

  /* ======================================================
     ORGANISM-SPECIFIC COMMENTS
  ====================================================== */

  if (organismText.includes("streptococcus pneumoniae")) {

    interpretation +=
      "Streptococcus pneumoniae is a leading cause of community-acquired bacterial meningitis and requires urgent targeted antimicrobial therapy.\n\n";

  }

  if (

    organismText.includes("neisseria meningitidis")

  ) {

    interpretation +=
      "Neisseria meningitidis is identified. Public health notification and prophylaxis of close contacts should be considered according to national guidelines.\n\n";

  }

  if (

    organismText.includes("haemophilus influenzae")

  ) {

    interpretation +=
      "Haemophilus influenzae is identified and is a recognised cause of bacterial meningitis, particularly in unvaccinated individuals.\n\n";

  }

  if (

    organismText.includes("listeria")

  ) {

    interpretation +=
      "Listeria monocytogenes should be considered particularly in neonates, older adults, pregnant women and immunocompromised patients.\n\n";

  }

  if (

    organismText.includes("escherichia coli")

  ) {

    interpretation +=
      "Escherichia coli meningitis is most frequently encountered in neonates and immunocompromised patients.\n\n";

  }

  if (

    organismText.includes("cryptococcus")

  ) {

    interpretation +=
      "Cryptococcus species commonly cause opportunistic meningitis, especially in patients with advanced HIV infection or other causes of immunosuppression.\n\n";

  }

  if (

    organismText.includes("mycobacterium")

  ) {

    interpretation +=
      "Mycobacterium tuberculosis causes chronic granulomatous meningitis and requires prolonged multidrug therapy.\n\n";

  }

  /* ======================================================
     IMPORTANT LIMITATIONS
  ====================================================== */

  interpretation +=
    "Negative Gram stain or culture does not exclude meningitis, particularly after prior antimicrobial therapy or when organism numbers are low.\n\n";

  interpretation +=
    "Where clinically indicated, molecular assays such as multiplex PCR panels, viral PCR and GeneXpert MTB/RIF may improve diagnostic yield.\n\n";

  interpretation +=
    "CSF findings should always be interpreted alongside blood cultures, inflammatory markers and neuroimaging.\n\n";

  /* ======================================================
     FINAL COMMENT
  ====================================================== */

  interpretation +=
    "Final diagnosis should integrate clinical presentation, cerebrospinal fluid chemistry, microscopy, microbiology and radiological findings. Early recognition and prompt treatment are essential to reduce morbidity and mortality associated with central nervous system infections.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation: interpretation.trim(),

    impression,

    recommendation,

  });

}