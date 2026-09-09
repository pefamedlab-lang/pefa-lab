/* ==============================================================
   PEFA LAB — ENDOCRINOLOGY INTERPRETATION ENGINE
   --------------------------------------------------------------
   Central, non-persistence interpretation service.

   Input:
     interpretEndocrinePanel({ rows, context, panelName, test })

   Output:
     {
       interpretation,
       summary,
       findings,
       flags,
       panelKey,
       confidence,
       requiresClinicalCorrelation
     }

   IMPORTANT:
   - Interpretation is laboratory decision support, not diagnosis.
   - Reference ranges/flags supplied by the LIS remain authoritative.
   - Cycle phase, pregnancy and collection timing are respected when
     supplied by the result-entry context.
   - Missing/discordant data should not be converted into a diagnosis.
   ==============================================================
*/

const text = (v) => String(v ?? "").trim();
const normalize = (v) =>
  text(v)
    .replace(/[()/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
};

const rowName = (r = {}) =>
  text(
    r.name ??
    r.test_name ??
    r.testName ??
    r.parameter_name ??
    r.parameterName ??
    r.label ??
    r.key
  );

const rowKey = (r = {}) => normalize(
  r.key ?? r.parameter_key ?? r.test_code ?? rowName(r)
);

const flagOf = (r = {}) => normalize(
  r.flag ?? r.result_flag ?? r.status ?? ""
);

const valueOf = (r = {}) => num(
  r.value ?? r.result ?? r.result_value ?? r.result_numeric
);

const findRow = (rows, aliases) => {
  const wanted = aliases.map(normalize);
  return rows.find((r) => {
    const candidates = [rowKey(r), normalize(rowName(r))];
    return candidates.some((candidate) =>
      wanted.some((alias) =>
        candidate === alias ||
        candidate.includes(alias) ||
        alias.includes(candidate)
      )
    );
  }) || null;
};

const hasFlag = (row, flag) => {
  const f = flagOf(row);
  return f === flag || f.includes(flag);
};

const isHigh = (r) => hasFlag(r, "high") || hasFlag(r, "critical high");
const isLow = (r) => hasFlag(r, "low") || hasFlag(r, "critical low");
const isNormal = (r) => hasFlag(r, "normal");

const formatList = (items) => {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
};

const panelKeyOf = (panelName = "", test = {}) => {
  const source = normalize(
    test?.panel_key ??
    test?.panelKey ??
    test?.panel_name ??
    test?.panelName ??
    panelName
  );

  if (source.includes("free thyroid") || source.includes("free tft")) return "free_tft";
  if (source.includes("total thyroid") || source.includes("total tft")) return "total_tft";
  if (source.includes("thyroid")) return "thyroid";
  if (source.includes("day 3") || source.includes("day3")) return "female_day3";
  if (source.includes("day 21") || source.includes("day21")) return "female_day21";
  if (source.includes("full female") || source.includes("complete female")) return "full_female";
  if (source === "female hormonal profile" || source.includes("female hormonal profile")) return "female";
  if (source.includes("male hormonal") || source.includes("male fertility")) return "male";
  if (source.includes("fertility hormonal")) return "fertility";
  if (source.includes("adrenal")) return "adrenal";
  if (source.includes("pituitary")) return "pituitary";
  if (source.includes("pancreatic endocrine")) return "pancreatic_endocrine";
  if (source.includes("pregnancy endocrine")) return "pregnancy_endocrine";
  return "general_endocrine";
};

/* --------------------------------------------------------------
   THYROID
   -------------------------------------------------------------- */
const interpretThyroid = (rows, panelKey) => {
  const tsh = findRow(rows, ["tsh"]);
  const ft4 = findRow(rows, ["free t4", "free thyroxine", "ft4"]);
  const ft3 = findRow(rows, ["free t3", "free triiodothyronine", "ft3"]);
  const tt4 = findRow(rows, ["total t4", "total thyroxine"]);
  const tt3 = findRow(rows, ["total t3", "total triiodothyronine"]);
  const t4 = findRow(rows, ["t4", "thyroxine"]);
  const t3 = findRow(rows, ["t3", "triiodothyronine"]);
  const antiTpo = findRow(rows, ["anti tpo", "anti thyroid peroxidase"]);
  const antiTg = findRow(rows, ["anti thyroglobulin", "thyroglobulin antibody"]);

  const findings = [];

  /*
   * Select the hormone pair that actually belongs to the panel.
   * This prevents a generic Thyroid Function Profile from being
   * evaluated as though it were a Free TFT or Total TFT.
   */
  const primaryT4 =
    panelKey === "free_tft" ? ft4 :
    panelKey === "total_tft" ? tt4 :
    t4 || tt4 || ft4;

  const primaryT3 =
    panelKey === "free_tft" ? ft3 :
    panelKey === "total_tft" ? tt3 :
    t3 || tt3 || ft3;

  if (tsh && primaryT4) {
    if (isHigh(tsh) && isLow(primaryT4)) {
      findings.push("Thyroid profile demonstrates a biochemical pattern consistent with primary hypothyroidism.");
    } else if (isLow(tsh) && isHigh(primaryT4)) {
      findings.push("Thyroid profile demonstrates a biochemical pattern consistent with primary hyperthyroidism.");
    } else if (isHigh(tsh) && isNormal(primaryT4)) {
      findings.push("Elevated TSH with T4 within the reference interval may be consistent with subclinical hypothyroidism.");
    } else if (isLow(tsh) && isNormal(primaryT4)) {
      findings.push("Suppressed TSH with T4 within the reference interval may be consistent with subclinical hyperthyroidism.");
    } else if ((isLow(tsh) || isNormal(tsh)) && isLow(primaryT4)) {
      findings.push("Low T4 with a non-elevated TSH is a discordant pattern; central hypothyroidism and other causes should be considered in the appropriate clinical context.");
    } else if (isNormal(tsh) && isNormal(primaryT4)) {
      findings.push("TSH and T4 are within their reference intervals, showing a euthyroid biochemical pattern.");
    }
  }

  if (tsh && primaryT3 && isLow(tsh) && isHigh(primaryT3) && !(primaryT4 && isHigh(primaryT4))) {
    findings.push("Suppressed TSH with elevated T3 and without a corresponding T4 elevation may represent a T3-predominant thyrotoxic pattern.");
  }

  if (tsh && primaryT3 && primaryT4) {
    if (isHigh(tsh) && isLow(primaryT3) && isLow(primaryT4)) {
      findings.push("TSH, T3 and T4 show a concordant hypothyroid biochemical pattern.");
    } else if (isLow(tsh) && isHigh(primaryT3) && isHigh(primaryT4)) {
      findings.push("TSH, T3 and T4 show a concordant hyperthyroid biochemical pattern.");
    }
  }

  if ((antiTpo && isHigh(antiTpo)) || (antiTg && isHigh(antiTg))) {
    findings.push("Positive thyroid autoantibody testing supports an autoimmune thyroid disease pattern; correlation with thyroid function and clinical findings is recommended.");
  }

  if (!findings.length && rows.some((r) => valueOf(r) !== null)) {
    findings.push("No specific thyroid biochemical pattern is identified from the supplied results. Interpret with the laboratory reference intervals and clinical context.");
  }

  return findings;
};

/* --------------------------------------------------------------
   FEMALE REPRODUCTIVE HORMONES
   -------------------------------------------------------------- */
const interpretFemale = (rows, panelKey, context = {}) => {
  const fsh = findRow(rows, ["fsh"]);
  const lh = findRow(rows, ["lh"]);
  const e2 = findRow(rows, ["estradiol", "estradiol e2", "e2"]);
  const progesterone = findRow(rows, ["progesterone"]);
  const prolactin = findRow(rows, ["prolactin"]);
  const testosterone = findRow(rows, ["testosterone"]);
  const shbg = findRow(rows, ["shbg"]);
  const amh = findRow(rows, ["amh", "anti mullerian hormone"]);
  const dheas = findRow(rows, ["dhea s", "dhea-s", "dheas"]);
  const tsh = findRow(rows, ["tsh"]);
  const ft4 = findRow(rows, ["free t4", "ft4"]);
  const findings = [];

  if (fsh && isHigh(fsh)) findings.push("FSH is elevated relative to the supplied reference interval; interpretation should take menstrual phase and reproductive status into account.");
  if (fsh && isLow(fsh)) findings.push("FSH is below the supplied reference interval; interpretation should take menstrual phase, age and clinical context into account.");
  if (lh && isHigh(lh)) findings.push("LH is elevated relative to the supplied reference interval; interpretation is cycle- and age-dependent.");
  if (lh && isLow(lh)) findings.push("LH is below the supplied reference interval; interpretation is cycle- and age-dependent.");
  if (e2 && isHigh(e2)) findings.push("Estradiol is elevated relative to the supplied reference interval; interpretation depends strongly on menstrual phase, ovarian stimulation and pregnancy status.");
  if (e2 && isLow(e2)) findings.push("Estradiol is low relative to the supplied reference interval; interpretation depends on menstrual phase and reproductive status.");
  if (progesterone && isHigh(progesterone)) findings.push("Progesterone is elevated relative to the supplied reference interval; timing within the menstrual cycle or pregnancy status should be considered.");
  if (progesterone && isLow(progesterone)) findings.push("Progesterone is low relative to the supplied reference interval; interpretation depends on the timing of collection and clinical indication.");
  if (prolactin && isHigh(prolactin)) findings.push("Prolactin is elevated. Physiological, medication-related and pathological causes should be considered, with repeat testing or further evaluation when clinically indicated.");
  if (testosterone && isHigh(testosterone)) findings.push("Testosterone is elevated; correlation with clinical features and other androgen markers is recommended.");
  if (testosterone && isLow(testosterone)) findings.push("Testosterone is low relative to the supplied reference interval; interpretation should consider age, sex, SHBG and clinical indication.");
  if (dheas && isHigh(dheas)) findings.push("DHEA-S is elevated and may indicate increased adrenal androgen production; age-specific interpretation is important.");
  if (amh && isLow(amh)) findings.push("AMH is below the supplied reference interval. AMH is a marker associated with ovarian reserve and should not be interpreted as a standalone measure of fertility.");
  if (amh && isHigh(amh)) findings.push("AMH is elevated relative to the supplied reference interval; interpretation should consider age, ovarian phenotype and clinical indication.");

  if (panelKey === "female_day21" && progesterone && isNormal(progesterone)) {
    findings.push("Progesterone is within the supplied reference interval for this laboratory; interpretation of luteal function depends on the exact day and clinical indication of collection.");
  }

  if (tsh && ft4 && isHigh(tsh) && isLow(ft4)) {
    findings.push("Concurrent thyroid results show a biochemical pattern consistent with primary hypothyroidism, which may be relevant to reproductive evaluation.");
  }

  if (context?.cyclePhase && normalize(context.cyclePhase) !== "unspecified") {
    findings.push(`Results have been interpreted with the supplied cycle phase (${text(context.cyclePhase)}); cycle timing remains important for reproductive hormone interpretation.`);
  }

  if (!findings.length && rows.some((r) => valueOf(r) !== null)) {
    findings.push("No specific reproductive endocrine abnormality is identified from the supplied flags. Correlate with cycle timing, age, reproductive status and clinical indication.");
  }

  return findings;
};

/* --------------------------------------------------------------
   MALE HORMONES
   -------------------------------------------------------------- */
const interpretMale = (rows) => {
  const fsh = findRow(rows, ["fsh"]);
  const lh = findRow(rows, ["lh"]);
  const prolactin = findRow(rows, ["prolactin"]);
  const testosterone = findRow(rows, ["testosterone"]);
  const freeT = findRow(rows, ["free testosterone"]);
  const estradiol = findRow(rows, ["estradiol", "e2"]);
  const shbg = findRow(rows, ["shbg"]);
  const findings = [];

  if (testosterone && isLow(testosterone)) {
    if (fsh && lh && (isHigh(fsh) || isHigh(lh))) {
      findings.push("Low testosterone with elevated gonadotropins demonstrates a pattern suggestive of primary hypogonadal physiology.");
    } else if (fsh && lh && (isLow(fsh) || isNormal(fsh)) && (isLow(lh) || isNormal(lh))) {
      findings.push("Low testosterone with non-elevated gonadotropins demonstrates a pattern that may indicate secondary or functional hypogonadal physiology.");
    } else {
      findings.push("Testosterone is below the supplied reference interval. Confirmation with appropriately timed repeat testing and clinical correlation may be appropriate.");
    }
  }

  if (testosterone && isHigh(testosterone)) findings.push("Testosterone is elevated relative to the supplied reference interval; clinical correlation is recommended.");
  if (freeT && isLow(freeT)) findings.push("Free testosterone is below the supplied reference interval; SHBG and total testosterone should be considered when interpreting androgen status.");
  if (prolactin && isHigh(prolactin)) findings.push("Prolactin is elevated; hyperprolactinaemia can affect reproductive and gonadal function and should be interpreted clinically.");
  if (estradiol && isHigh(estradiol)) findings.push("Estradiol is elevated relative to the supplied male reference interval; clinical correlation is recommended.");
  if (shbg && isHigh(shbg)) findings.push("SHBG is elevated and may influence interpretation of total versus free testosterone.");
  if (shbg && isLow(shbg)) findings.push("SHBG is reduced and may influence interpretation of total versus free testosterone.");

  if (!findings.length && rows.some((r) => valueOf(r) !== null)) {
    findings.push("Male reproductive hormone results do not demonstrate a specific abnormal biochemical pattern from the supplied flags.");
  }
  return findings;
};

/* --------------------------------------------------------------
   ADRENAL
   -------------------------------------------------------------- */
const interpretAdrenal = (rows) => {
  const cortisol = findRow(rows, ["cortisol"]);
  const acth = findRow(rows, ["acth", "adrenocorticotropic hormone"]);
  const aldosterone = findRow(rows, ["aldosterone"]);
  const renin = findRow(rows, ["renin", "plasma renin"]);
  const dheas = findRow(rows, ["dhea s", "dhea-s", "dheas"]);
  const met = findRow(rows, ["metanephrine", "metanephrines"]);
  const normet = findRow(rows, ["normetanephrine", "normetanephrines"]);
  const findings = [];

  if (cortisol && isLow(cortisol)) {
    if (acth && isHigh(acth)) findings.push("Low cortisol with elevated ACTH demonstrates a pattern compatible with primary adrenal insufficiency and requires clinical correlation.");
    else findings.push("Cortisol is below the supplied reference interval. Interpretation requires collection time and clinical context because cortisol has marked diurnal variation.");
  }
  if (cortisol && isHigh(cortisol)) {
    if (acth && isLow(acth)) findings.push("Elevated cortisol with suppressed ACTH demonstrates an ACTH-independent cortisol excess pattern; clinical confirmation is required.");
    else if (acth && isHigh(acth)) findings.push("Elevated cortisol with elevated ACTH demonstrates an ACTH-dependent cortisol excess pattern; further clinical evaluation may be required.");
    else findings.push("Cortisol is elevated relative to the supplied reference interval; collection time and clinical context should be reviewed.");
  }
  if (aldosterone && renin && isHigh(aldosterone) && isLow(renin)) findings.push("Elevated aldosterone with suppressed renin may demonstrate a primary aldosterone excess pattern; interpretation requires appropriate collection conditions and confirmatory testing.");
  if ((met && isHigh(met)) || (normet && isHigh(normet))) findings.push("An elevated metanephrine or normetanephrine result warrants clinical correlation and review of sampling conditions, medications and confirmatory testing where appropriate.");
  if (dheas && isHigh(dheas)) findings.push("DHEA-S is elevated relative to the supplied reference interval, indicating increased adrenal androgen activity may be present.");

  if (!findings.length && rows.some((r) => valueOf(r) !== null)) findings.push("No specific adrenal biochemical pattern is identified from the supplied results. Timing, posture, medications and clinical indication may materially affect interpretation.");
  return findings;
};

/* --------------------------------------------------------------
   PITUITARY
   -------------------------------------------------------------- */
const interpretPituitary = (rows) => {
  const fsh = findRow(rows, ["fsh"]);
  const lh = findRow(rows, ["lh"]);
  const prolactin = findRow(rows, ["prolactin"]);
  const gh = findRow(rows, ["growth hormone", "gh"]);
  const igf1 = findRow(rows, ["igf 1", "igf1", "insulin like growth factor 1"]);
  const acth = findRow(rows, ["acth"]);
  const findings = [];

  if (prolactin && isHigh(prolactin)) findings.push("Prolactin is elevated and may indicate hyperprolactinaemia; physiological and pathological causes should be considered.");
  if (fsh && lh && isLow(fsh) && isLow(lh)) findings.push("Low FSH and LH demonstrate hypogonadotropic gonadal-axis suppression; interpretation depends on sex, age and reproductive status.");
  if (igf1 && isHigh(igf1)) findings.push("IGF-1 is elevated relative to the supplied reference interval; interpretation should consider age-specific ranges and clinical context.");
  if (igf1 && isLow(igf1)) findings.push("IGF-1 is low relative to the supplied reference interval; nutritional status, hepatic function, endocrine disorders and clinical context may influence interpretation.");
  if (gh && isHigh(gh)) findings.push("Growth hormone is elevated. Because GH secretion is pulsatile, isolated random GH elevation should not be interpreted independently.");
  if (acth && isHigh(acth)) findings.push("ACTH is elevated relative to the supplied reference interval; interpretation should be integrated with cortisol and clinical findings.");
  if (acth && isLow(acth)) findings.push("ACTH is below the supplied reference interval; interpretation should be integrated with cortisol and clinical findings.");

  if (!findings.length && rows.some((r) => valueOf(r) !== null)) findings.push("No specific pituitary biochemical pattern is identified from the supplied results. Interpretation requires integration across the relevant endocrine axis.");
  return findings;
};

/* --------------------------------------------------------------
   PANCREATIC ENDOCRINE
   -------------------------------------------------------------- */
const interpretPancreatic = (rows) => {
  const insulin = findRow(rows, ["insulin"]);
  const cpep = findRow(rows, ["c peptide", "c-peptide", "cpeptide"]);
  const hba1c = findRow(rows, ["hba1c", "hb a1c", "glycated haemoglobin", "glycated hemoglobin"]);
  const glucose = findRow(rows, ["glucose", "fasting blood sugar", "fbs"]);
  const findings = [];

  if (hba1c && isHigh(hba1c)) findings.push("HbA1c is elevated relative to the supplied reference/decision interval, indicating increased average glycaemic exposure.");
  if (hba1c && isLow(hba1c)) findings.push("HbA1c is below the supplied reference interval; interpretation should consider glycaemic status and conditions affecting red-cell turnover where clinically relevant.");
  if (insulin && isHigh(insulin)) findings.push("Insulin is elevated relative to the supplied reference interval; interpretation depends on fasting status and concurrent glucose concentration.");
  if (cpep && isLow(cpep)) findings.push("C-peptide is reduced relative to the supplied reference interval, suggesting reduced endogenous insulin secretion when interpreted with the concurrent glucose concentration.");
  if (cpep && isHigh(cpep)) findings.push("C-peptide is elevated relative to the supplied reference interval, indicating increased endogenous insulin secretion in the appropriate glycaemic context.");
  if (glucose && isHigh(glucose) && cpep && isLow(cpep)) findings.push("Elevated glucose with reduced C-peptide suggests impaired endogenous insulin secretion and warrants clinical correlation.");
  if (!findings.length && rows.some((r) => valueOf(r) !== null)) findings.push("No specific pancreatic endocrine pattern is identified from the supplied results. Fasting status and concurrent glucose are important for insulin/C-peptide interpretation.");
  return findings;
};

/* --------------------------------------------------------------
   PREGNANCY
   -------------------------------------------------------------- */
const interpretPregnancy = (rows, context = {}) => {
  const hcg = findRow(rows, ["beta hcg", "β hcg", "beta-hcg", "bhcg"]);
  const progesterone = findRow(rows, ["progesterone"]);
  const e2 = findRow(rows, ["estradiol", "e2"]);
  const prolactin = findRow(rows, ["prolactin"]);
  const findings = [];

  if (hcg && isHigh(hcg)) findings.push("β-hCG is elevated relative to the supplied reference interval. Quantitative interpretation requires gestational age, clinical context and serial change where appropriate.");
  if (hcg && isLow(hcg)) findings.push("β-hCG is low relative to the supplied reference interval; interpretation depends on gestational age and the reason for testing.");
  if (progesterone && isLow(progesterone)) findings.push("Progesterone is below the supplied reference interval; interpretation requires gestational age and clinical context.");
  if (progesterone && isHigh(progesterone)) findings.push("Progesterone is elevated relative to the supplied reference interval; interpretation requires gestational age and clinical context.");
  if (e2 && isHigh(e2)) findings.push("Estradiol is elevated relative to the supplied reference interval; pregnancy stage and clinical context should be considered.");
  if (prolactin && isHigh(prolactin)) findings.push("Prolactin is elevated; pregnancy itself can physiologically increase prolactin, so gestational status must be considered.");
  if (context?.trimester && normalize(context.trimester) !== "unspecified") findings.push(`Pregnancy interpretation uses the supplied trimester (${text(context.trimester)}).`);
  if (!findings.length && rows.some((r) => valueOf(r) !== null)) findings.push("No specific pregnancy endocrine abnormality is identified from the supplied flags. Gestational age and clinical context remain essential for interpretation.");
  return findings;
};

/* --------------------------------------------------------------
   MAIN ENGINE
   -------------------------------------------------------------- */
export function interpretEndocrinePanel({
  rows = [],
  context = {},
  panelName = "",
  test = {},
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const panelKey = panelKeyOf(panelName, test);
  let findings = [];

  switch (panelKey) {
    case "free_tft":
    case "total_tft":
    case "thyroid":
      findings = interpretThyroid(safeRows, panelKey);
      break;
    case "female_day3":
    case "female_day21":
    case "full_female":
    case "female":
    case "fertility":
      findings = interpretFemale(safeRows, panelKey, context);
      break;
    case "male":
      findings = interpretMale(safeRows);
      break;
    case "adrenal":
      findings = interpretAdrenal(safeRows);
      break;
    case "pituitary":
      findings = interpretPituitary(safeRows);
      break;
    case "pancreatic_endocrine":
      findings = interpretPancreatic(safeRows);
      break;
    case "pregnancy_endocrine":
      findings = interpretPregnancy(safeRows, context);
      break;
    default:
      findings = safeRows.some((r) => valueOf(r) !== null)
        ? ["Endocrine results are available; interpretation should be based on the individual reference intervals, patient context and the relevant endocrine axis."]
        : [];
  }

  const abnormal = safeRows.filter((r) => isHigh(r) || isLow(r)).map(rowName);
  const summary = abnormal.length
    ? `Abnormal result(s): ${formatList(abnormal)}.`
    : safeRows.some((r) => valueOf(r) !== null)
      ? "Results do not show an abnormal flag within the supplied laboratory reference intervals."
      : "No reportable numeric endocrine result is available for interpretation.";

  const interpretation = [
    ...findings,
    summary,
    "Laboratory interpretation should be correlated with clinical findings, treatment history and appropriate collection conditions. This interpretation is decision support and is not a standalone diagnosis.",
  ].filter(Boolean).join(" ");

  return {
    interpretation,
    summary,
    findings,
    flags: abnormal,
    panelKey,
    confidence: findings.length ? "moderate" : "limited",
    requiresClinicalCorrelation: true,
  };
}

export default interpretEndocrinePanel;
