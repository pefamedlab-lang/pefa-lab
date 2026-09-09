import {
  createInterpretation,
  getResult,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   MICROSCOPY, CULTURE & SENSITIVITY (MCS)
   INTERPRETATION ENGINE

   Supported Specimens
   ----------------------------------------------------------
   • Urine
   • Blood Culture
   • Sputum
   • CSF
   • Wound Swab
   • High Vaginal Swab (HVS)
   • Endocervical Swab (ECS)
   • Urethral Swab
   • Ear Swab
   • Eye Swab
   • Throat Swab
   • Nasal Swab
   • Aspirates
   • Catheter Tip
   • Tissue
   • Pleural Fluid
   • Ascitic Fluid
   • Synovial Fluid
   • Bronchoalveolar Lavage (BAL)
   • Endotracheal Aspirate
   • Other Sterile Body Fluids

   Detects
   ----------------------------------------------------------
   • No Growth
   • Significant Growth
   • Mixed Growth
   • Contamination
   • Significant Bacteriuria
   • Sterile Specimen Infection
   • Colonisation
   • MDR Organisms
   • ESBL
   • MRSA
   • VRE
   • CRE
   • Antimicrobial Susceptibility Patterns
========================================================== */

export default function interpretMCS(

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
     RESULT EXTRACTION
  ====================================================== */

  const specimen =
    getResult(resultMap, "Specimen") ??
    getResult(resultMap, "Sample") ??
    getResult(resultMap, "Specimen Type") ??
    "";

  const microscopy =
    getResult(resultMap, "Microscopy");

  const culture =
    getResult(resultMap, "Culture");

  const organism =
    getResult(resultMap, "Organism") ??
    getResult(resultMap, "Isolate") ??
    getResult(resultMap, "Culture Isolate") ??
    "";

  const growth =
    getResult(resultMap, "Growth") ??
    getResult(resultMap, "Culture Growth") ??
    "";

  const colonyCount =
    getResult(resultMap, "Colony Count") ??
    getResult(resultMap, "CFU") ??
    getResult(resultMap, "Bacterial Count");

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  const pusCells =
    getNumericResult(resultMap, "Pus Cells") ??
    getNumericResult(resultMap, "WBC");

  const epithelialCells =
    getNumericResult(resultMap, "Epithelial Cells");

  const redCells =
    getNumericResult(resultMap, "RBC");

  const casts =
    getResult(resultMap, "Casts");

  const crystals =
    getResult(resultMap, "Crystals");

  const yeast =
    getResult(resultMap, "Yeast");

  const bacteriaSeen =
    getResult(resultMap, "Bacteria");

  const parasites =
    getResult(resultMap, "Parasites");

  /* ======================================================
     SUSCEPTIBILITY
  ====================================================== */

  const susceptibility =
    getResult(resultMap, "Sensitivity") ??
    getResult(resultMap, "Susceptibility") ??
    "";

  const resistance =
    getResult(resultMap, "Resistance") ??
    "";

  /* ======================================================
     SPECIAL RESISTANCE MARKERS
  ====================================================== */

  const esbl =
    getResult(resultMap, "ESBL");

  const mrsa =
    getResult(resultMap, "MRSA");

  const vre =
    getResult(resultMap, "VRE");

  const cre =
    getResult(resultMap, "CRE");

  const carbapenemase =
    getResult(resultMap, "Carbapenemase");

  /* ======================================================
     NORMALISE TEXT
  ====================================================== */

  const specimenText =
    String(specimen).toLowerCase();

  const organismText =
    String(organism).toLowerCase();

  const growthText =
    String(growth).toLowerCase();

  const susceptibilityText =
    String(susceptibility).toLowerCase();

  const resistanceText =
    String(resistance).toLowerCase();

  /* ======================================================
     SPECIMEN IDENTIFICATION
  ====================================================== */

  const isUrine =
    specimenText.includes("urine");

  const isBloodCulture =
    specimenText.includes("blood");

  const isCSF =
    specimenText.includes("csf") ||
    specimenText.includes("cerebrospinal");

  const isSputum =
    specimenText.includes("sputum");

  const isWound =
    specimenText.includes("wound");

  const isHVS =
    specimenText.includes("high vaginal") ||
    specimenText === "hvs";

  const isECS =
    specimenText.includes("endocervical");

  const isUrethral =
    specimenText.includes("urethral");

  const isEar =
    specimenText.includes("ear");

  const isEye =
    specimenText.includes("eye");

  const isThroat =
    specimenText.includes("throat");

  const isNasal =
    specimenText.includes("nasal");

  const isBAL =
    specimenText.includes("bal") ||
    specimenText.includes("bronchoalveolar");

  const isETA =
    specimenText.includes("endotracheal");

  const isPleural =
    specimenText.includes("pleural");

  const isAscitic =
    specimenText.includes("ascitic");

  const isSynovial =
    specimenText.includes("synovial");

  const isCatheter =
    specimenText.includes("catheter");

  const isTissue =
    specimenText.includes("tissue");

  const isSterileFluid =

    isCSF ||

    isPleural ||

    isAscitic ||

    isSynovial;

  /* ======================================================
     OUTPUT VARIABLES
  ====================================================== */

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     GROWTH DETECTION
  ====================================================== */

  const noGrowth =

    growthText.includes("no growth") ||

    growthText.includes("nil growth") ||

    growthText.includes("sterile") ||

    culture?.toLowerCase().includes("no growth");

  const scantyGrowth =
    growthText.includes("scanty");

  const lightGrowth =
    growthText.includes("light");

  const moderateGrowth =
    growthText.includes("moderate");

  const heavyGrowth =

    growthText.includes("heavy") ||

    growthText.includes("profuse");

  const mixedGrowth =

    growthText.includes("mixed") ||

    growthText.includes("mixed flora") ||

    growthText.includes("mixed coliform") ||

    organismText.includes("mixed");

  const pureGrowth =

    !mixedGrowth &&
    !noGrowth &&
    organismText.length > 0;

  /* ======================================================
     COLONY COUNT
  ====================================================== */

  const colonyText =
    String(colonyCount ?? "").toLowerCase();

  let significantBacteriuria = false;

  if (

    colonyText.includes("10^5") ||

    colonyText.includes("100000") ||

    colonyText.includes("≥100000") ||

    colonyText.includes(">=100000") ||

    colonyText.includes("significant")

  ) {

    significantBacteriuria = true;

  }

  /* ======================================================
     MICROSCOPY FLAGS
  ====================================================== */

  const pyuria =

    pusCells !== null &&
    pusCells >= 5;

  const markedPyuria =

    pusCells !== null &&
    pusCells >= 20;

  const haematuria =

    redCells !== null &&
    redCells > 3;

  const epithelialContamination =

    epithelialCells !== null &&
    epithelialCells >= 15;

  const yeastSeen =

    yeast &&
    yeast.toLowerCase() !== "nil" &&
    yeast.toLowerCase() !== "none";

  const bacteriaPresent =

    bacteriaSeen &&
    bacteriaSeen.toLowerCase() !== "nil" &&
    bacteriaSeen.toLowerCase() !== "none";

  const parasiteSeen =

    parasites &&
    parasites.toLowerCase() !== "nil" &&
    parasites.toLowerCase() !== "none";

  /* ======================================================
     ORGANISM RECOGNITION
  ====================================================== */

  const isEcoli =
    organismText.includes("escherichia coli") ||
    organismText === "e. coli" ||
    organismText.includes("e coli");

  const isKlebsiella =
    organismText.includes("klebsiella");

  const isProteus =
    organismText.includes("proteus");

  const isPseudomonas =
    organismText.includes("pseudomonas");

  const isAcinetobacter =
    organismText.includes("acinetobacter");

  const isEnterobacter =
    organismText.includes("enterobacter");

  const isCitrobacter =
    organismText.includes("citrobacter");

  const isMorganella =
    organismText.includes("morganella");

  const isProvidencia =
    organismText.includes("providencia");

  const isEnterococcus =
    organismText.includes("enterococcus");

  const isStaphAureus =
    organismText.includes("staphylococcus aureus");

  const isCoNS =

    organismText.includes("coagulase negative") ||

    organismText.includes("coagulase-negative") ||

    organismText.includes("cons");

  const isStreptococcus =
    organismText.includes("streptococcus");

  const isPneumococcus =
    organismText.includes("streptococcus pneumoniae");

  const isGBS =
    organismText.includes("agalactiae");

  const isSalmonella =
    organismText.includes("salmonella");

  const isShigella =
    organismText.includes("shigella");

  const isNeisseria =
    organismText.includes("neisseria");

  const isGonococcus =
    organismText.includes("gonorrhoeae");

  const isCandida =
    organismText.includes("candida");

  const isCryptococcus =
    organismText.includes("cryptococcus");

  const isListeria =
    organismText.includes("listeria");

  const isAnaerobe =

    organismText.includes("bacteroides") ||

    organismText.includes("clostridium");

  /* ======================================================
     RESISTANCE FLAGS
  ====================================================== */

  const hasESBL =

    String(esbl).toLowerCase() === "positive" ||

    organismText.includes("esbl") ||

    resistanceText.includes("esbl");

  const hasMRSA =

    String(mrsa).toLowerCase() === "positive" ||

    organismText.includes("mrsa");

  const hasVRE =

    String(vre).toLowerCase() === "positive" ||

    organismText.includes("vre");

  const hasCRE =

    String(cre).toLowerCase() === "positive" ||

    organismText.includes("cre");

  const hasCarbapenemase =

    String(carbapenemase)
      .toLowerCase()
      .includes("positive");

  /* ======================================================
     MDR DETECTION
  ====================================================== */

  const multidrugResistance =

    resistanceText.includes("mdr") ||

    resistanceText.includes("multidrug") ||

    hasESBL ||

    hasCRE ||

    hasMRSA ||

    hasVRE ||

    hasCarbapenemase;

  /* ======================================================
     MICROSCOPY INTERPRETATION
  ====================================================== */

  if (pyuria) {

    if (markedPyuria) {

      interpretation +=
        "Marked pyuria is present, indicating significant inflammation or infection.\n\n";

    }

    else {

      interpretation +=
        "Pyuria is present, suggesting inflammation or infection.\n\n";

    }

  }

  if (haematuria) {

    interpretation +=
      "Red blood cells are present. Correlate with trauma, urinary tract pathology, infection or recent instrumentation.\n\n";

  }

  if (epithelialContamination) {

    interpretation +=
      "Numerous epithelial cells are present, suggesting possible specimen contamination during collection.\n\n";

  }

  if (bacteriaPresent) {

    interpretation +=
      "Bacteria were observed on microscopy.\n\n";

  }

  if (yeastSeen) {

    interpretation +=
      "Yeast cells are present. Correlate with culture findings and clinical risk factors for fungal infection.\n\n";

  }

  if (parasiteSeen) {

    interpretation +=
      "Parasitic forms were identified on microscopy. Correlate with parasite identification and clinical findings.\n\n";

  }

  /* ======================================================
     CULTURE INTERPRETATION
  ====================================================== */

  if (noGrowth) {

    interpretation +=
      "No significant bacterial growth was obtained on culture.\n\n";

  }

  else if (mixedGrowth) {

    interpretation +=
      "Mixed bacterial growth is present. This commonly reflects contamination during specimen collection, although polymicrobial infection may occur in selected clinical settings.\n\n";

  }

  else if (pureGrowth) {

    interpretation +=
      "A pure bacterial isolate was recovered on culture.\n\n";

  }

  if (scantyGrowth) {

    interpretation +=
      "Scanty growth was observed. Clinical significance depends on the specimen type and patient presentation.\n\n";

  }

  if (lightGrowth) {

    interpretation +=
      "Light bacterial growth was observed.\n\n";

  }

  if (moderateGrowth) {

    interpretation +=
      "Moderate bacterial growth was observed.\n\n";

  }

  if (heavyGrowth) {

    interpretation +=
      "Heavy bacterial growth was observed, supporting significant microbial proliferation.\n\n";

  }

  /* ======================================================
     ORGANISM-SPECIFIC INTERPRETATION
  ====================================================== */

  if (isEcoli) {

    interpretation +=
      "Escherichia coli was isolated. This is the commonest cause of community-acquired urinary tract infection and may also cause intra-abdominal, bloodstream and other invasive infections.\n\n";

  }

  else if (isKlebsiella) {

    interpretation +=
      "Klebsiella species were isolated. These organisms are recognised causes of urinary, respiratory and healthcare-associated infections.\n\n";

  }

  else if (isProteus) {

    interpretation +=
      "Proteus species were isolated. These organisms are commonly associated with urinary tract infection and may contribute to urinary stone formation.\n\n";

  }

  else if (isPseudomonas) {

    interpretation +=
      "Pseudomonas aeruginosa was isolated. This opportunistic pathogen is frequently associated with healthcare-associated infections and may exhibit multidrug resistance.\n\n";

  }

  else if (isAcinetobacter) {

    interpretation +=
      "Acinetobacter species were isolated. Clinical correlation is required, particularly in hospitalised or critically ill patients.\n\n";

  }

  else if (isEnterococcus) {

    interpretation +=
      "Enterococcus species were isolated. These organisms may represent urinary tract infection, endocarditis or other healthcare-associated infections depending on the specimen source.\n\n";

  }

  else if (isStaphAureus) {

    interpretation +=
      "Staphylococcus aureus was isolated. Isolation from a normally sterile site is usually clinically significant.\n\n";

  }

  else if (isCoNS) {

    interpretation +=
      "Coagulase-negative staphylococci were isolated. These organisms may represent contamination or true infection depending on the specimen type and clinical setting.\n\n";

  }

  else if (isStreptococcus) {

    interpretation +=
      "Streptococcus species were isolated. Clinical significance depends on the species and specimen source.\n\n";

  }

  else if (isSalmonella) {

    interpretation +=
      "Salmonella species were isolated. Correlate with clinical features of enteric fever or gastroenteritis and notify public health authorities where required.\n\n";

  }

  else if (isShigella) {

    interpretation +=
      "Shigella species were isolated. These organisms are recognised causes of bacillary dysentery.\n\n";

  }

  else if (isNeisseria || isGonococcus) {

    interpretation +=
      "Neisseria gonorrhoeae was identified. This finding is consistent with gonococcal infection and should be managed according to current sexually transmitted infection guidelines.\n\n";

  }

  else if (isCandida) {

    interpretation +=
      "Candida species were isolated. Clinical significance depends on the specimen type and patient risk factors, as colonisation is common at some body sites.\n\n";

  }

  else if (isCryptococcus) {

    interpretation +=
      "Cryptococcus species were identified. Isolation is clinically significant and requires urgent clinical evaluation, particularly in immunocompromised patients.\n\n";

  }

  else if (isListeria) {

    interpretation +=
      "Listeria monocytogenes was identified. This organism may cause invasive disease including meningitis and septicaemia, particularly in neonates, older adults and immunocompromised patients.\n\n";

  }

  else if (isAnaerobe) {

    interpretation +=
      "Anaerobic bacteria were isolated. Correlate with the specimen source and the possibility of deep-seated or polymicrobial infection.\n\n";

  }

  /* ======================================================
     SUSCEPTIBILITY INTERPRETATION
  ====================================================== */

  const susceptibleWords = [
    "sensitive",
    "susceptible"
  ];

  const resistantWords = [
    "resistant",
    "resistance"
  ];

  let susceptibleCount = 0;
  let resistantCount = 0;

  susceptibleWords.forEach(word => {

    const regex =
      new RegExp(word, "gi");

    susceptibleCount +=
      (susceptibility.match(regex) || []).length;

  });

  resistantWords.forEach(word => {

    const regex =
      new RegExp(word, "gi");

    resistantCount +=
      (susceptibility.match(regex) || []).length;

  });

  const fullySusceptible =

    susceptibleCount > 0 &&
    resistantCount === 0;

  const mixedSusceptibility =

    susceptibleCount > 0 &&
    resistantCount > 0;

  const predominantlyResistant =

    resistantCount >= 3;

  /* ======================================================
     RESISTANCE MARKERS
  ====================================================== */

  if (hasESBL) {

    interpretation +=
      "The isolate demonstrates extended-spectrum beta-lactamase (ESBL) production. ESBL-producing organisms are resistant to most penicillins and cephalosporins and require careful antimicrobial selection.\n\n";

  }

  if (hasMRSA) {

    interpretation +=
      "Methicillin-resistant Staphylococcus aureus (MRSA) was identified. Infection prevention measures and appropriate antimicrobial therapy should be considered.\n\n";

  }

  if (hasVRE) {

    interpretation +=
      "Vancomycin-resistant Enterococcus (VRE) was identified. Therapeutic options may be limited and specialist advice may be required.\n\n";

  }

  if (hasCRE) {

    interpretation +=
      "Carbapenem-resistant Enterobacterales (CRE) were identified. These organisms are associated with limited treatment options and require infection prevention precautions.\n\n";

  }

  if (hasCarbapenemase) {

    interpretation +=
      "A carbapenemase-producing organism was detected. This represents a significant antimicrobial resistance mechanism requiring urgent infection prevention measures.\n\n";

  }

  if (multidrugResistance) {

    interpretation +=
      "The isolate demonstrates multidrug resistance. Antimicrobial therapy should be guided by the reported susceptibility profile and antimicrobial stewardship principles.\n\n";

  }

  /* ======================================================
     SUSCEPTIBILITY PROFILE
  ====================================================== */

  if (fullySusceptible) {

    interpretation +=
      "The isolate appears susceptible to the tested antimicrobial agents.\n\n";

  }

  else if (mixedSusceptibility) {

    interpretation +=
      "The isolate demonstrates a mixed antimicrobial susceptibility pattern with both susceptible and resistant agents.\n\n";

  }

  else if (predominantlyResistant) {

    interpretation +=
      "The isolate demonstrates extensive antimicrobial resistance, limiting available therapeutic options.\n\n";

  }

  /* ======================================================
     SPECIFIC COMMENTS
  ====================================================== */

  if (

    hasESBL &&
    isEcoli

  ) {

    interpretation +=
      "ESBL-producing Escherichia coli is a recognised cause of complicated urinary tract and bloodstream infections.\n\n";

  }

  if (

    hasESBL &&
    isKlebsiella

  ) {

    interpretation +=
      "ESBL-producing Klebsiella species are important healthcare-associated pathogens and may require carbapenem-sparing or carbapenem-based therapy according to susceptibility results.\n\n";

  }

  if (

    hasMRSA &&
    isStaphAureus

  ) {

    interpretation +=
      "MRSA infection should be managed according to institutional antimicrobial guidelines and infection prevention policies.\n\n";

  }

  if (

    hasCRE &&
    isEnterobacter

  ) {

    interpretation +=
      "Carbapenem-resistant Enterobacter species are associated with significant healthcare-associated infections and limited treatment options.\n\n";

  }

  if (

    hasCRE &&
    isKlebsiella

  ) {

    interpretation +=
      "Carbapenem-resistant Klebsiella species require urgent clinical attention and strict infection prevention measures.\n\n";

  }

  if (

    hasVRE &&
    isEnterococcus

  ) {

    interpretation +=
      "Vancomycin-resistant Enterococcus may cause difficult-to-treat urinary tract, bloodstream and intra-abdominal infections.\n\n";

  }

  /* ======================================================
     ANTIMICROBIAL STEWARDSHIP
  ====================================================== */

  if (

    multidrugResistance

  ) {

    interpretation +=
      "Appropriate antimicrobial stewardship is recommended. Therapy should be selected using the reported susceptibility profile, specimen source and clinical severity rather than empirical broad-spectrum antimicrobial use alone.\n\n";

  }

  /* ======================================================
     SPECIMEN-SPECIFIC INTERPRETATION
  ====================================================== */

  /*
  ---------------------------------------------------------
  URINE
  ---------------------------------------------------------
  */

  if (isUrine) {

    if (noGrowth) {

      impression =
        "No significant bacteriuria.";

      recommendation =
        "If urinary tract infection remains clinically suspected, consider repeat culture with a properly collected midstream urine specimen.";

    }

    else if (

      mixedGrowth ||

      epithelialContamination

    ) {

      impression =
        "Mixed bacterial growth suggests probable specimen contamination.";

      recommendation =
        "Repeat urine culture using a properly collected clean-catch midstream specimen.";

    }

    else if (

      pureGrowth &&
      significantBacteriuria

    ) {

      impression =
        "Significant bacteriuria consistent with urinary tract infection.";

      recommendation =
        "Interpret together with urinary symptoms and treat according to the reported antimicrobial susceptibility profile.";

    }

    else if (

      pureGrowth

    ) {

      impression =
        "Bacterial growth detected.";

      recommendation =
        "Clinical significance depends on colony count, symptoms and patient risk factors.";

    }

  }

  /*
  ---------------------------------------------------------
  BLOOD CULTURE
  ---------------------------------------------------------
  */

  else if (

    isBloodCulture

  ) {

    if (

      noGrowth

    ) {

      impression =
        "No bacterial growth detected.";

      recommendation =
        "Negative culture does not exclude bacteraemia. Correlate with prior antimicrobial therapy, blood culture timing and clinical findings.";

    }

    else if (

      isCoNS

    ) {

      impression =
        "Coagulase-negative staphylococci isolated.";

      recommendation =
        "Interpret cautiously as this may represent contamination unless supported by repeated positive cultures or compatible clinical findings.";

    }

    else {

      impression =
        "Positive blood culture.";

      recommendation =
        "This finding is clinically significant. Prompt clinical assessment and targeted antimicrobial therapy based on susceptibility results are recommended.";

    }

  }

  /*
  ---------------------------------------------------------
  CSF
  ---------------------------------------------------------
  */

  else if (

    isCSF

  ) {

    if (

      noGrowth

    ) {

      impression =
        "No bacterial growth detected.";

      recommendation =
        "Interpret together with CSF chemistry, microscopy and molecular testing. Previous antimicrobial therapy may reduce culture yield.";

    }

    else {

      impression =
        "Clinically significant organism isolated from cerebrospinal fluid.";

      recommendation =
        "Urgent clinical management is required. Correlate with CSF cell count, chemistry, Gram stain and molecular investigations.";

    }

  }

  /*
  ---------------------------------------------------------
  SPUTUM
  ---------------------------------------------------------
  */

  else if (

    isSputum

  ) {

    if (

      mixedGrowth

    ) {

      impression =
        "Mixed respiratory flora.";

      recommendation =
        "This may represent upper respiratory tract contamination. Correlate with sputum quality and microscopy.";

    }

    else if (

      pureGrowth

    ) {

      impression =
        "Potential respiratory pathogen isolated.";

      recommendation =
        "Interpret together with sputum microscopy, radiological findings and the patient's clinical presentation.";

    }

  }

  /*
  ---------------------------------------------------------
  WOUND
  ---------------------------------------------------------
  */

  else if (

    isWound

  ) {

    if (

      noGrowth

    ) {

      impression =
        "No bacterial growth detected.";

      recommendation =
        "If wound infection remains clinically suspected, consider repeat sampling from deep tissue after appropriate wound preparation.";

    }

    else {

      impression =
        "Clinically significant wound pathogen isolated.";

      recommendation =
        "Correlate with wound appearance, evidence of systemic infection and susceptibility results before initiating targeted therapy.";

    }

  }

  /*
  ---------------------------------------------------------
  HIGH VAGINAL SWAB
  ---------------------------------------------------------
  */

  else if (

    isHVS

  ) {

    if (

      isCandida

    ) {

      impression =
        "Candida species isolated.";

      recommendation =
        "Interpret together with symptoms and microscopy. Candida may represent colonisation or vulvovaginal candidiasis.";

    }

    else if (

      mixedGrowth

    ) {

      impression =
        "Mixed vaginal flora.";

      recommendation =
        "Mixed flora is frequently part of the normal vaginal microbiota. Correlate with microscopy and clinical findings.";

    }

    else if (

      pureGrowth

    ) {

      impression =
        "Potential genital tract pathogen isolated.";

      recommendation =
        "Interpret together with vaginal microscopy and the patient's symptoms.";

    }

  }

  /*
  ---------------------------------------------------------
  EAR / EYE
  ---------------------------------------------------------
  */

  else if (

    isEar ||

    isEye

  ) {

    if (

      noGrowth

    ) {

      impression =
        "No significant bacterial growth.";

      recommendation =
        "Clinical correlation is recommended.";

    }

    else {

      impression =
        "Potential pathogen isolated.";

      recommendation =
        "Interpret together with local inflammatory findings and susceptibility results.";

    }

  }

  /*
  ---------------------------------------------------------
  STERILE BODY FLUIDS
  ---------------------------------------------------------
  */

  else if (

    isSterileFluid

  ) {

    if (

      noGrowth

    ) {

      impression =
        "No bacterial growth detected.";

      recommendation =
        "Negative culture does not completely exclude infection. Correlate with microscopy and clinical findings.";

    }

    else {

      impression =
        "Isolation of an organism from a normally sterile body fluid is clinically significant.";

      recommendation =
        "Urgent clinical review is advised. Therapy should be guided by susceptibility testing.";

    }

  }

  /*
  ---------------------------------------------------------
  OTHER SPECIMENS
  ---------------------------------------------------------
  */

  else {

    if (

      noGrowth

    ) {

      impression =
        "No significant bacterial growth.";

      recommendation =
        "Interpret together with the clinical presentation.";

    }

    else if (

      mixedGrowth

    ) {

      impression =
        "Mixed bacterial growth.";

      recommendation =
        "Mixed growth may represent contamination or polymicrobial infection depending on specimen type.";

    }

    else {

      impression =
        "Potentially significant organism isolated.";

      recommendation =
        "Interpret together with specimen source, microscopy and susceptibility results.";

    }

  }

  /* ======================================================
     ADVANCED PATTERN RECOGNITION
  ====================================================== */

  /*
  ---------------------------------------------------------
  URINARY TRACT INFECTION
  ---------------------------------------------------------
  */

  if (

    isUrine &&
    pureGrowth &&
    significantBacteriuria &&
    pyuria

  ) {

    impression =
      "Findings are consistent with urinary tract infection.";

    recommendation =
      "Interpret together with urinary symptoms. Select antimicrobial therapy according to the reported susceptibility profile.";

  }

  /*
  ---------------------------------------------------------
  POSSIBLE ASYMPTOMATIC BACTERIURIA
  ---------------------------------------------------------
  */

  else if (

    isUrine &&
    pureGrowth &&
    significantBacteriuria &&
    !pyuria

  ) {

    impression =
      "Significant bacteriuria without laboratory evidence of pyuria.";

    recommendation =
      "Correlate with symptoms. Consider asymptomatic bacteriuria where clinically appropriate. Treatment should follow current clinical guidelines.";

  }

  /*
  ---------------------------------------------------------
  CONTAMINATED URINE SPECIMEN
  ---------------------------------------------------------
  */

  else if (

    isUrine &&
    (
      mixedGrowth ||
      epithelialContamination
    )

  ) {

    impression =
      "Probable urine specimen contamination.";

    recommendation =
      "Repeat urine culture using a properly collected clean-catch midstream urine specimen.";

  }

  /*
  ---------------------------------------------------------
  BLOODSTREAM INFECTION
  ---------------------------------------------------------
  */

  else if (

    isBloodCulture &&
    pureGrowth &&
    !isCoNS

  ) {

    impression =
      "Positive blood culture consistent with bloodstream infection.";

    recommendation =
      "Urgent clinical review is recommended. Correlate with repeat blood cultures, inflammatory markers and susceptibility results.";

  }

  /*
  ---------------------------------------------------------
  BLOOD CULTURE CONTAMINANT
  ---------------------------------------------------------
  */

  else if (

    isBloodCulture &&
    isCoNS

  ) {

    impression =
      "Possible blood culture contaminant.";

    recommendation =
      "Interpret with caution. Correlate with the number of positive culture sets, time to positivity and the patient's clinical condition.";

  }

  /*
  ---------------------------------------------------------
  MENINGITIS
  ---------------------------------------------------------
  */

  else if (

    isCSF &&
    pureGrowth

  ) {

    impression =
      "Isolation of an organism from cerebrospinal fluid is highly suggestive of central nervous system infection.";

    recommendation =
      "Urgent clinical management is indicated. Correlate with CSF microscopy, chemistry, Gram stain and molecular testing.";

  }

  /*
  ---------------------------------------------------------
  HEALTHCARE-ASSOCIATED MDR INFECTION
  ---------------------------------------------------------
  */

  else if (

    multidrugResistance &&
    (
      isBloodCulture ||
      isCSF ||
      isBAL ||
      isETA ||
      isWound
    )

  ) {

    impression =
      "Multidrug-resistant organism isolated from a clinically significant specimen.";

    recommendation =
      "Review antimicrobial therapy immediately. Implement appropriate infection prevention and antimicrobial stewardship measures.";

  }

  /*
  ---------------------------------------------------------
  ESBL INFECTION
  ---------------------------------------------------------
  */

  else if (

    hasESBL

  ) {

    impression =
      "ESBL-producing organism isolated.";

    recommendation =
      "Avoid relying on penicillins and most cephalosporins. Select treatment according to the reported susceptibility profile and institutional guidelines.";

  }

  /*
  ---------------------------------------------------------
  MRSA
  ---------------------------------------------------------
  */

  else if (

    hasMRSA

  ) {

    impression =
      "Methicillin-resistant Staphylococcus aureus (MRSA) isolated.";

    recommendation =
      "Institute appropriate infection prevention measures and select therapy according to susceptibility results.";

  }

  /*
  ---------------------------------------------------------
  VRE
  ---------------------------------------------------------
  */

  else if (

    hasVRE

  ) {

    impression =
      "Vancomycin-resistant Enterococcus isolated.";

    recommendation =
      "Clinical correlation and antimicrobial stewardship are recommended. Therapeutic options may be limited.";

  }

  /*
  ---------------------------------------------------------
  CRE
  ---------------------------------------------------------
  */

  else if (

    hasCRE ||
    hasCarbapenemase

  ) {

    impression =
      "Carbapenem-resistant organism detected.";

    recommendation =
      "Urgent infection prevention measures are recommended. Therapy should be guided by susceptibility testing and specialist advice.";

  }

  /*
  ---------------------------------------------------------
  CANDIDA COLONISATION
  ---------------------------------------------------------
  */

  else if (

    isCandida &&
    (
      isHVS ||
      isSputum
    )

  ) {

    impression =
      "Candida species isolated.";

    recommendation =
      "Candida may represent colonisation rather than infection. Interpret together with microscopy, symptoms and patient risk factors.";

  }

  /*
  ---------------------------------------------------------
  STERILE SITE INFECTION
  ---------------------------------------------------------
  */

  else if (

    isSterileFluid &&
    pureGrowth

  ) {

    impression =
      "Isolation of an organism from a normally sterile site is clinically significant.";

    recommendation =
      "Urgent clinical assessment is recommended. Correlate with microscopy, imaging and susceptibility results.";

  }

  /*
  ---------------------------------------------------------
  NO SIGNIFICANT GROWTH
  ---------------------------------------------------------
  */

  else if (

    noGrowth

  ) {

    impression =
      "No significant bacterial growth.";

    recommendation =
      "Negative culture does not completely exclude infection. Correlate with specimen quality, prior antimicrobial therapy and clinical findings.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("urinary tract infection")

  ) {

    recommendation =
      "Correlate with urinary symptoms, risk factors and antimicrobial susceptibility results. Targeted antimicrobial therapy should be guided by the reported susceptibility profile and current treatment guidelines.";

  }

  else if (

    impression.includes("asymptomatic bacteriuria")

  ) {

    recommendation =
      "Treatment of asymptomatic bacteriuria is generally reserved for selected patient groups (e.g. pregnancy or before certain urological procedures). Correlate clinically before initiating antimicrobial therapy.";

  }

  else if (

    impression.includes("contamination")

  ) {

    recommendation =
      "Repeat specimen collection using appropriate aseptic technique if infection remains clinically suspected.";

  }

  else if (

    impression.includes("bloodstream infection")

  ) {

    recommendation =
      "This is a clinically significant finding. Repeat blood cultures where appropriate, identify the source of infection and institute targeted antimicrobial therapy based on susceptibility results.";

  }

  else if (

    impression.includes("central nervous system infection")

  ) {

    recommendation =
      "Urgent clinical management is required. Correlate with CSF chemistry, microscopy, Gram stain, molecular testing and neuroimaging where appropriate.";

  }

  else if (

    impression.includes("ESBL")

  ) {

    recommendation =
      "The isolate produces an extended-spectrum beta-lactamase. Therapy should be selected according to susceptibility testing and local antimicrobial stewardship guidelines.";

  }

  else if (

    impression.includes("Methicillin-resistant")

  ) {

    recommendation =
      "Institute appropriate infection prevention measures. Select antimicrobial therapy according to susceptibility results and institutional guidelines.";

  }

  else if (

    impression.includes("Vancomycin-resistant")

  ) {

    recommendation =
      "Review antimicrobial options carefully. Infection prevention precautions and specialist advice may be required.";

  }

  else if (

    impression.includes("Carbapenem-resistant")

  ) {

    recommendation =
      "Urgent infection prevention measures are recommended. Consult infectious diseases or antimicrobial stewardship services where available.";

  }

  else if (

    impression.includes("Candida")

  ) {

    recommendation =
      "Interpret Candida isolation in relation to the specimen source, microscopy and clinical findings, as colonisation is common at non-sterile sites.";

  }

  else if (

    impression.includes("sterile site")

  ) {

    recommendation =
      "Isolation of microorganisms from normally sterile body sites is clinically significant and requires prompt clinical assessment together with susceptibility-guided therapy.";

  }

  else if (

    impression.includes("No significant bacterial growth")

  ) {

    recommendation =
      "A negative culture does not exclude infection. Consider specimen quality, timing of collection, prior antimicrobial therapy and repeat sampling if clinically indicated.";

  }

  else {

    recommendation =
      recommendation ||
      "Interpret the microbiology findings together with specimen quality, microscopy, antimicrobial susceptibility results and the overall clinical presentation.";

  }

  /* ======================================================
     STANDARD REPORT FOOTNOTE
  ====================================================== */

  interpretation +=
    "Microbiology culture results should always be interpreted together with the specimen source, quality of collection, direct microscopy, antimicrobial susceptibility profile and the patient's clinical presentation.\n";

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}