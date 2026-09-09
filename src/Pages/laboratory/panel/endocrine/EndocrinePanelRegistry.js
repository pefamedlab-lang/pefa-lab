/*
 * ==========================================================
 * PEFA LAB — ENDOCRINE PANEL REGISTRY
 * ==========================================================
 *
 * Registry responsibilities:
 * - Panel fallback display metadata.
 * - Confirmed PEFA reference ranges.
 * - Sex / pregnancy / cycle-aware metadata.
 *
 * MASTER TEST / PANEL PARAMETERS REMAIN AUTHORITATIVE.
 * Empty referenceRanges mean the range must come from the
 * LIS master metadata or reference-range engine.
 * ==========================================================
 */

const maleHormonalRanges = {
  fsh: [
    {
      sex: "male",
      min: 1.5,
      max: 12.4,
      text: "1.5 – 12.4",
      source: "PEFA uploaded report",
    },
  ],
  lh: [
    {
      sex: "male",
      min: 0.7,
      max: 7.4,
      text: "0.7 – 7.4",
      source: "PEFA uploaded report",
    },
  ],
  prolactin: [
    {
      sex: "male",
      min: 1.8,
      max: 17.0,
      text: "1.8 – 17.0",
      source: "PEFA uploaded report",
    },
  ],
  testosterone: [
    {
      sex: "male",
      min: 2.5,
      max: 10.0,
      text: "2.5 – 10.0",
      source: "PEFA uploaded report",
    },
  ],
};

export const THYROID = [
  { key: "tsh", name: "TSH", unit: "mIU/L", referenceRanges: [] },
  { key: "free_t4", name: "Free T4", unit: "pmol/L", referenceRanges: [] },
  { key: "free_t3", name: "Free T3", unit: "pmol/L", referenceRanges: [] },
  { key: "total_t4", name: "Total T4", unit: "pmol/L", referenceRanges: [] },
  { key: "total_t3", name: "Total T3", unit: "pmol/L", referenceRanges: [] },
  { key: "anti_tpo", name: "Anti-TPO", unit: "IU/mL", referenceRanges: [] },
  { key: "anti_tg", name: "Anti-Thyroglobulin", unit: "IU/mL", referenceRanges: [] },
];

export const MALE = [
  {
    key: "fsh",
    name: "FSH",
    unit: "mIU/mL",
    referenceRanges: maleHormonalRanges.fsh,
  },
  {
    key: "lh",
    name: "LH",
    unit: "mIU/mL",
    referenceRanges: maleHormonalRanges.lh,
  },
  {
    key: "prolactin",
    name: "Prolactin",
    unit: "ng/mL",
    referenceRanges: maleHormonalRanges.prolactin,
  },
  {
    key: "testosterone",
    name: "Testosterone",
    unit: "ng/mL",
    referenceRanges: maleHormonalRanges.testosterone,
  },
  {
    key: "estradiol",
    name: "Estradiol",
    unit: "pg/mL",
    referenceRanges: [],
  },
  {
    key: "shbg",
    name: "SHBG",
    unit: "nmol/L",
    referenceRanges: [],
  },
  {
    key: "free_testosterone",
    name: "Free Testosterone",
    unit: "",
    referenceRanges: [],
  },
];

export const FEMALE = [
  { key: "fsh", name: "FSH", unit: "mIU/mL", referenceRanges: [] },
  { key: "lh", name: "LH", unit: "mIU/mL", referenceRanges: [] },
  { key: "prolactin", name: "Prolactin", unit: "ng/mL", referenceRanges: [] },
  { key: "estradiol", name: "Estradiol (E2)", unit: "pg/mL", referenceRanges: [] },
  { key: "progesterone", name: "Progesterone", unit: "ng/mL", referenceRanges: [] },
  { key: "testosterone", name: "Testosterone", unit: "ng/mL", referenceRanges: [] },
  { key: "shbg", name: "SHBG", unit: "nmol/L", referenceRanges: [] },
];

export const FERTILITY = [
  ...FEMALE,
  { key: "amh", name: "AMH", unit: "ng/mL", referenceRanges: [] },
  { key: "dhea_s", name: "DHEA-S", unit: "µg/dL", referenceRanges: [] },
];

export const ADRENAL = [
  { key: "cortisol", name: "Cortisol", unit: "µg/dL", referenceRanges: [] },
  { key: "acth", name: "ACTH", unit: "pg/mL", referenceRanges: [] },
  { key: "dhea_s", name: "DHEA-S", unit: "µg/dL", referenceRanges: [] },
  { key: "aldosterone", name: "Aldosterone", unit: "ng/dL", referenceRanges: [] },
  { key: "renin", name: "Renin", unit: "", referenceRanges: [] },
  { key: "metanephrine", name: "Metanephrine", unit: "", referenceRanges: [] },
  { key: "normetanephrine", name: "Normetanephrine", unit: "", referenceRanges: [] },
];

export const PITUITARY = [
  { key: "fsh", name: "FSH", unit: "mIU/mL", referenceRanges: [] },
  { key: "lh", name: "LH", unit: "mIU/mL", referenceRanges: [] },
  { key: "prolactin", name: "Prolactin", unit: "ng/mL", referenceRanges: [] },
  { key: "growth_hormone", name: "Growth Hormone", unit: "ng/mL", referenceRanges: [] },
  { key: "igf_1", name: "IGF-1", unit: "ng/mL", referenceRanges: [] },
  { key: "acth", name: "ACTH", unit: "pg/mL", referenceRanges: [] },
];

export const PANCREATIC_ENDOCRINE = [
  { key: "insulin", name: "Insulin", unit: "µIU/mL", referenceRanges: [] },
  { key: "c_peptide", name: "C-Peptide", unit: "ng/mL", referenceRanges: [] },
  { key: "hba1c", name: "HbA1c", unit: "%", referenceRanges: [] },
];

export const PREGNANCY_ENDOCRINE = [
  { key: "beta_hcg", name: "β-hCG", unit: "mIU/mL", referenceRanges: [] },
  { key: "progesterone", name: "Progesterone", unit: "ng/mL", referenceRanges: [] },
  { key: "estradiol", name: "Estradiol (E2)", unit: "pg/mL", referenceRanges: [] },
  { key: "prolactin", name: "Prolactin", unit: "ng/mL", referenceRanges: [] },
];

export const ENDOCRINE_PANELS = {
  thyroid: THYROID,
  male_hormonal_profile: MALE,
  female_hormonal_profile: FEMALE,
  fertility_hormonal_profile: FERTILITY,
  adrenal: ADRENAL,
  pituitary: PITUITARY,
  pancreatic_endocrine: PANCREATIC_ENDOCRINE,
  pregnancy_endocrine: PREGNANCY_ENDOCRINE,
};

export const getEndocrinePanelAnalytes = (panelKey) =>
  ENDOCRINE_PANELS[panelKey] || [];
