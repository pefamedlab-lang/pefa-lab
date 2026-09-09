/* ==========================================================
   PEFA LAB — CHEMISTRY INTERPRETATION ENGINE
   ----------------------------------------------------------
   PURPOSE
   - Generate ONE clinical interpretation
   - Use medical terminology rather than repeating H/L flags
   - Do NOT generate a separate impression
   - Support LFT, KFT/RFT, electrolytes, lipid profile,
     glucose and common chemistry parameters
   - Preserve legacy compatibility fields
   ========================================================== */

const clean = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const numericValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.+-]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeFlag = (flag) => {
  const f = normalize(flag);

  if (
    f === "h" ||
    f === "high" ||
    f === "elevated" ||
    f === "↑" ||
    f === "critical high"
  ) {
    return "HIGH";
  }

  if (
    f === "l" ||
    f === "low" ||
    f === "reduced" ||
    f === "decreased" ||
    f === "↓" ||
    f === "critical low"
  ) {
    return "LOW";
  }

  return "";
};

const getTestName = (item = {}) =>
  clean(
    item.test_name ??
      item.testName ??
      item.parameter ??
      item.parameter_name ??
      item.name ??
      item.analyte ??
      ""
  );

const getValue = (item = {}) =>
  item.value ??
  item.result ??
  item.result_value ??
  item.resultValue ??
  "";

const getFlag = (item = {}) =>
  normalizeFlag(
    item.flag ??
      item.result_flag ??
      item.resultFlag ??
      item.status ??
      ""
  );

/* ----------------------------------------------------------
   PARAMETER ALIASES
   ---------------------------------------------------------- */

const aliases = {
  urea: [
    "urea",
    "blood urea",
    "blood urea nitrogen",
    "bun",
  ],

  creatinine: [
    "creatinine",
    "serum creatinine",
  ],

  uricAcid: [
    "uric acid",
    "serum uric acid",
    "urate",
  ],

  sodium: [
    "sodium",
    "serum sodium",
    "na",
  ],

  potassium: [
    "potassium",
    "serum potassium",
    "k",
  ],

  chloride: [
    "chloride",
    "serum chloride",
    "cl",
  ],

  bicarbonate: [
    "bicarbonate",
    "serum bicarbonate",
    "hco3",
    "hco3-",
    "total co2",
    "total carbon dioxide",
  ],

  calcium: [
    "calcium",
    "serum calcium",
    "total calcium",
  ],

  magnesium: [
    "magnesium",
    "serum magnesium",
  ],

  phosphate: [
    "phosphate",
    "phosphorus",
    "serum phosphate",
    "serum phosphorus",
  ],

  totalProtein: [
    "total protein",
    "serum total protein",
    "protein total",
  ],

  albumin: [
    "albumin",
    "serum albumin",
  ],

  bilirubin: [
    "bilirubin",
    "total bilirubin",
    "serum bilirubin",
  ],

  directBilirubin: [
    "direct bilirubin",
    "conjugated bilirubin",
  ],

  indirectBilirubin: [
    "indirect bilirubin",
    "unconjugated bilirubin",
  ],

  ast: [
    "ast",
    "sgot",
    "aspartate aminotransferase",
  ],

  alt: [
    "alt",
    "sgpt",
    "alanine aminotransferase",
  ],

  alp: [
    "alp",
    "alkaline phosphatase",
  ],

  ggt: [
    "ggt",
    "gamma gt",
    "gamma glutamyl transferase",
    "gamma glutamyltranspeptidase",
  ],

  glucose: [
    "glucose",
    "blood glucose",
    "blood sugar",
    "fasting blood glucose",
    "fasting blood sugar",
    "fbs",
    "random blood glucose",
    "random blood sugar",
    "rbs",
  ],

  cholesterol: [
    "cholesterol",
    "total cholesterol",
    "serum cholesterol",
  ],

  triglycerides: [
    "triglyceride",
    "triglycerides",
    "tg",
    "serum triglyceride",
  ],

  hdl: [
    "hdl",
    "hdl cholesterol",
    "high density lipoprotein",
    "high density lipoprotein cholesterol",
  ],

  ldl: [
    "ldl",
    "ldl cholesterol",
    "low density lipoprotein",
    "low density lipoprotein cholesterol",
  ],

  vldl: [
    "vldl",
    "vldl cholesterol",
    "very low density lipoprotein",
  ],
};

const matchesAlias = (name, list) => {
  const n = normalize(name);

  return list.some(
    (alias) =>
      n === normalize(alias) ||
      n.includes(normalize(alias))
  );
};

const identifyParameter = (name) => {
  const n = normalize(name);

  for (const [key, list] of Object.entries(aliases)) {
    if (matchesAlias(n, list)) {
      return key;
    }
  }

  return null;
};

/* ----------------------------------------------------------
   CLINICAL INTERPRETATION BUILDERS
   ---------------------------------------------------------- */

const buildInterpretationText = (parameter, flag) => {
  if (!parameter || !flag) return "";

  if (parameter === "urea" && flag === "HIGH") {
    return (
      "Azotaemia may occur with reduced renal perfusion, " +
      "renal impairment, dehydration, increased protein " +
      "catabolism or gastrointestinal blood loss."
    );
  }

  if (parameter === "urea" && flag === "LOW") {
    return (
      "Reduced blood urea may occur with low protein intake, " +
      "severe hepatic dysfunction, overhydration or reduced " +
      "urea synthesis."
    );
  }

  if (parameter === "creatinine" && flag === "HIGH") {
    return (
      "Creatininaemia may occur with reduced glomerular " +
      "filtration, renal impairment, urinary tract obstruction " +
      "or reduced renal perfusion."
    );
  }

  if (parameter === "creatinine" && flag === "LOW") {
    return (
      "Reduced serum creatinine may occur with low muscle mass, " +
      "frailty, reduced creatinine production or advanced liver disease."
    );
  }

  if (parameter === "uricAcid" && flag === "HIGH") {
    return (
      "Hyperuricaemia may occur with reduced renal urate " +
      "excretion, increased purine turnover, dehydration, " +
      "metabolic syndrome or excessive purine intake."
    );
  }

  if (parameter === "uricAcid" && flag === "LOW") {
    return (
      "Hypouricaemia may occur with increased renal urate " +
      "clearance, reduced urate production or certain medications."
    );
  }

  /* --------------------------------------------------------
     ELECTROLYTES
     -------------------------------------------------------- */

  if (parameter === "sodium" && flag === "HIGH") {
    return (
      "Hypernatraemia may occur with free-water deficit, " +
      "dehydration, excessive sodium administration or impaired " +
      "water regulation."
    );
  }

  if (parameter === "sodium" && flag === "LOW") {
    return (
      "Hyponatraemia may occur with excess free water, " +
      "gastrointestinal losses, diuretic therapy, heart failure, " +
      "renal disease or syndrome of inappropriate antidiuretic hormone secretion."
    );
  }

  if (parameter === "potassium" && flag === "HIGH") {
    return (
      "Hyperkalaemia may occur with impaired renal potassium " +
      "excretion, tissue breakdown, metabolic acidosis, adrenal " +
      "insufficiency or medication effects."
    );
  }

  if (parameter === "potassium" && flag === "LOW") {
    return (
      "Hypokalaemia may occur with gastrointestinal potassium " +
      "loss, diuretic therapy, inadequate intake or intracellular " +
      "potassium shift."
    );
  }

  if (parameter === "chloride" && flag === "HIGH") {
    return (
      "Hyperchloraemia may occur with dehydration, excess " +
      "chloride administration or hyperchloraemic metabolic acidosis."
    );
  }

  if (parameter === "chloride" && flag === "LOW") {
    return (
      "Hypochloraemia may occur with vomiting, gastric losses, " +
      "diuretic therapy, dilutional states or metabolic alkalosis."
    );
  }

  if (parameter === "bicarbonate" && flag === "HIGH") {
    return (
      "Increased bicarbonate may occur with metabolic alkalosis, " +
      "compensated respiratory acidosis or volume contraction."
    );
  }

  if (parameter === "bicarbonate" && flag === "LOW") {
    return (
      "Reduced bicarbonate may indicate metabolic acidosis and " +
      "may occur with renal dysfunction, gastrointestinal bicarbonate " +
      "loss or increased acid production."
    );
  }

  if (parameter === "calcium" && flag === "HIGH") {
    return (
      "Hypercalcaemia may occur with primary hyperparathyroidism, " +
      "malignancy, vitamin D excess or increased bone resorption."
    );
  }

  if (parameter === "calcium" && flag === "LOW") {
    return (
      "Hypocalcaemia may occur with vitamin D deficiency, " +
      "hypoparathyroidism, chronic kidney disease, hypoalbuminaemia " +
      "or impaired calcium absorption."
    );
  }

  if (parameter === "magnesium" && flag === "HIGH") {
    return (
      "Hypermagnesaemia may occur with renal impairment, excessive " +
      "magnesium intake or impaired magnesium excretion."
    );
  }

  if (parameter === "magnesium" && flag === "LOW") {
    return (
      "Hypomagnesaemia may occur with gastrointestinal losses, " +
      "poor intake, diuretic therapy or increased renal magnesium loss."
    );
  }

  if (parameter === "phosphate" && flag === "HIGH") {
    return (
      "Hyperphosphataemia may occur with chronic kidney disease, " +
      "reduced renal phosphate excretion, tissue breakdown or excessive phosphate load."
    );
  }

  if (parameter === "phosphate" && flag === "LOW") {
    return (
      "Hypophosphataemia may occur with poor intake, increased " +
      "cellular uptake, malabsorption or increased renal phosphate loss."
    );
  }

  /* --------------------------------------------------------
     LIVER FUNCTION
     -------------------------------------------------------- */

  if (parameter === "ast" && flag === "HIGH") {
    return (
      "Elevated AST may indicate hepatocellular injury and may " +
      "occur with viral hepatitis, metabolic fatty liver disease, " +
      "alcohol-related liver injury, muscle injury or other tissue damage."
    );
  }

  if (parameter === "alt" && flag === "HIGH") {
    return (
      "Elevated ALT is compatible with hepatocellular injury and " +
      "may occur with viral hepatitis, metabolic dysfunction-associated " +
      "steatotic liver disease, drug-induced liver injury or other hepatic insults."
    );
  }

  if (parameter === "alp" && flag === "HIGH") {
    return (
      "Elevated ALP may indicate cholestatic hepatobiliary disease " +
      "or increased osteoblastic activity."
    );
  }

  if (parameter === "ggt" && flag === "HIGH") {
    return (
      "Elevated GGT may occur with cholestasis, hepatobiliary " +
      "disease, alcohol exposure or hepatic enzyme induction."
    );
  }

  if (parameter === "bilirubin" && flag === "HIGH") {
    return (
      "Hyperbilirubinaemia may occur with increased bilirubin " +
      "production, impaired hepatic conjugation or uptake, hepatocellular " +
      "dysfunction or cholestatic obstruction."
    );
  }

  if (parameter === "directBilirubin" && flag === "HIGH") {
    return (
      "Conjugated hyperbilirubinaemia may occur with cholestasis, " +
      "biliary obstruction or hepatocellular dysfunction."
    );
  }

  if (parameter === "indirectBilirubin" && flag === "HIGH") {
    return (
      "Unconjugated hyperbilirubinaemia may occur with increased " +
      "erythrocyte destruction, impaired bilirubin conjugation or increased bilirubin production."
    );
  }

  if (parameter === "albumin" && flag === "LOW") {
    return (
      "Hypoalbuminaemia may occur with impaired hepatic synthesis, " +
      "protein loss, malnutrition, systemic inflammation or increased albumin redistribution."
    );
  }

  if (parameter === "albumin" && flag === "HIGH") {
    return (
      "Increased albumin concentration is most commonly associated " +
      "with haemoconcentration or dehydration."
    );
  }

  if (parameter === "totalProtein" && flag === "HIGH") {
    return (
      "Hyperproteinaemia may occur with dehydration, chronic " +
      "inflammation or increased immunoglobulin production."
    );
  }

  if (parameter === "totalProtein" && flag === "LOW") {
    return (
      "Hypoproteinaemia may occur with malnutrition, protein-losing " +
      "states, impaired hepatic synthesis or dilutional states."
    );
  }

  /* --------------------------------------------------------
     GLUCOSE
     -------------------------------------------------------- */

  if (parameter === "glucose" && flag === "HIGH") {
    return (
      "Hyperglycaemia may occur with diabetes mellitus, impaired " +
      "glucose tolerance, acute physiological stress, endocrine disorders " +
      "or medication effects."
    );
  }

  if (parameter === "glucose" && flag === "LOW") {
    return (
      "Hypoglycaemia may occur with excessive glucose-lowering " +
      "therapy, prolonged fasting, critical illness, endocrine dysfunction " +
      "or impaired hepatic glucose production."
    );
  }

  /* --------------------------------------------------------
     LIPID PROFILE
     -------------------------------------------------------- */

  if (parameter === "cholesterol" && flag === "HIGH") {
    return (
      "Hypercholesterolaemia may occur with metabolic dysfunction, " +
      "hypothyroidism, diabetes mellitus, nephrotic syndrome or familial dyslipidaemia."
    );
  }

  if (parameter === "cholesterol" && flag === "LOW") {
    return (
      "Hypocholesterolaemia may occur with malnutrition, malabsorption, " +
      "hyperthyroidism, chronic systemic illness or impaired hepatic synthesis."
    );
  }

  if (parameter === "triglycerides" && flag === "HIGH") {
    return (
      "Hypertriglyceridaemia may occur with insulin resistance, " +
      "diabetes mellitus, obesity, alcohol exposure, hypothyroidism " +
      "or familial dyslipidaemia."
    );
  }

  if (parameter === "triglycerides" && flag === "LOW") {
    return (
      "Low triglyceride concentration may occur with reduced dietary " +
      "fat intake, malabsorption, malnutrition or certain systemic disorders."
    );
  }

  if (parameter === "hdl" && flag === "LOW") {
    return (
      "Low HDL-cholesterol is associated with increased atherogenic " +
      "cardiovascular risk and may occur with insulin resistance, obesity, " +
      "hypertriglyceridaemia and physical inactivity."
    );
  }

  if (parameter === "hdl" && flag === "HIGH") {
    return (
      "Elevated HDL-cholesterol may occur with genetic variation, " +
      "certain medications, alcohol exposure or other metabolic factors."
    );
  }

  if (parameter === "ldl" && flag === "HIGH") {
    return (
      "Hyper-LDL-cholesterolaemia is associated with increased " +
      "atherogenic cardiovascular risk and may occur with familial " +
      "dyslipidaemia, metabolic dysfunction, hypothyroidism or dietary factors."
    );
  }

  if (parameter === "ldl" && flag === "LOW") {
    return (
      "Low LDL-cholesterol may occur with lipid-lowering therapy, " +
      "malnutrition, malabsorption, hyperthyroidism or reduced hepatic lipoprotein production."
    );
  }

  if (parameter === "vldl" && flag === "HIGH") {
    return (
      "Elevated VLDL may reflect increased hepatic triglyceride " +
      "production and is commonly associated with hypertriglyceridaemia and insulin resistance."
    );
  }

  if (parameter === "vldl" && flag === "LOW") {
    return (
      "Low VLDL concentration may occur with reduced triglyceride " +
      "availability or reduced hepatic lipoprotein production."
    );
  }

  return "";
};

/* ----------------------------------------------------------
   NORMAL RESULT HANDLING
   ---------------------------------------------------------- */

const buildNormalInterpretation = (findings) => {
  if (!findings.length) {
    return "";
  }

  return (
    "Chemistry results reviewed. No abnormal parameters identified " +
    "based on the configured reference ranges."
  );
};

/* ----------------------------------------------------------
   MAIN ENGINE
   ---------------------------------------------------------- */

export function buildChemistryInterpretation(items = [], options = {}) {
  const source = Array.isArray(items)
    ? items
    : items
      ? [items]
      : [];

  const findings = [];

  source.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const name = getTestName(item);
    const value = getValue(item);
    const flag = getFlag(item);

    if (!name || !flag) {
      return;
    }

    const parameter = identifyParameter(name);

    const text = buildInterpretationText(
      parameter,
      flag
    );

    if (!text) {
      return;
    }

    findings.push({
      parameter,
      name,
      value,
      flag,
      text,
    });
  });

  /*
   * Remove duplicate clinical statements.
   *
   * This is important where the same parameter may be present
   * more than once because of panel/result-record duplication.
   */
  const uniqueFindings = [];

  const seen = new Set();

  findings.forEach((finding) => {
    const key = `${finding.parameter}|${finding.flag}|${finding.text}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    uniqueFindings.push(finding);
  });

  /*
   * If no abnormal finding was detected, return a normal result
   * interpretation only when actual numeric/result-bearing rows exist.
   */
  const hasResultRows = source.some((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    return (
      getTestName(item) &&
      clean(getValue(item)) !== ""
    );
  });

  if (!hasResultRows) {
    return {
      interpretation: "",
      impression: "",
      clinicalCorrelation: "",
      clinical_correlation: "",
      findings: [],
    };
  }

  const interpretation = uniqueFindings.length
    ? uniqueFindings
        .map((finding) => finding.text)
        .filter(Boolean)
        .join(" ")
    : buildNormalInterpretation(source);

  /*
   * SINGLE INTERPRETATION ARCHITECTURE
   *
   * The old system generated:
   *
   *   Interpretation
   *   Impression
   *
   * That caused duplication in the final report.
   *
   * The new system uses the clinical interpretation as the
   * single authoritative narrative.
   */
  const impression = "";

  /*
   * Keep clinicalCorrelation for backward compatibility,
   * but do not generate a second visible interpretation block.
   */
  const clinicalCorrelation = "";

  return {
    interpretation,
    impression,
    clinicalCorrelation,
    clinical_correlation: clinicalCorrelation,
    findings: uniqueFindings,
  };
}

/* ----------------------------------------------------------
   DEFAULT EXPORT
   ---------------------------------------------------------- */

export default buildChemistryInterpretation;