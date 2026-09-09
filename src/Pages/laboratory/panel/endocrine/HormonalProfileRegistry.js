/* ==========================================================
 * PEFA LAB — HORMONAL PROFILE REGISTRY
 * ONE UNIVERSAL FORM / FIVE HORMONAL PROFILES
 *
 * This registry is ONLY for Hormonal Profile.
 * TFT / Free TFT / Total TFT / Thyroid and other endocrine
 * panels are intentionally excluded.
 * ========================================================== */

export const HORMONAL_PROFILE_DEFINITIONS = {
  female_day3: {
    key: "female_day3",
    label: "Female Hormonal Profile — Day 3",
    sex: "female",
    aliases: ["day 3", "day3", "female day 3", "female hormonal day 3", "day_3"],
    analytes: ["FSH", "LH", "Estradiol", "Prolactin", "Testosterone", "AMH"],
    description: "Early follicular / cycle day 3 hormonal assessment.",
  },
  female_day21: {
    key: "female_day21",
    label: "Female Hormonal Profile — Day 21",
    sex: "female",
    aliases: ["day 21", "day21", "female day 21", "female hormonal day 21", "day_21"],
    analytes: ["Progesterone", "Prolactin", "Estradiol", "FSH", "LH"],
    description: "Mid-luteal / cycle day 21 hormonal assessment.",
  },
  full_female: {
    key: "full_female",
    label: "Full Female Hormonal Profile",
    sex: "female",
    aliases: ["full female", "female hormonal profile", "full hormonal profile", "full female hormonal"],
    analytes: ["FSH", "LH", "Estradiol", "Progesterone", "Prolactin", "Testosterone", "DHEA-S", "AMH"],
    description: "Comprehensive female reproductive hormone profile.",
  },
  male: {
    key: "male",
    label: "Male Hormonal Profile",
    sex: "male",
    aliases: ["male hormonal", "male profile", "male hormone profile"],
    analytes: ["FSH", "LH", "Prolactin", "Testosterone", "Estradiol", "SHBG", "Free Testosterone"],
    description: "Male reproductive / androgen hormonal assessment.",
  },
  fertility: {
    key: "fertility",
    label: "Fertility Hormonal Profile",
    sex: "female",
    aliases: ["fertility", "fertility hormone", "fertility hormonal", "fertility profile"],
    analytes: ["FSH", "LH", "Estradiol", "Progesterone", "Prolactin", "AMH"],
    description: "Hormonal assessment used in fertility evaluation.",
  },
};

export const HORMONAL_PROFILE_KEYS = Object.keys(HORMONAL_PROFILE_DEFINITIONS);

export const canonicalHormonalAnalyteKey = (value = "") => {
  const n = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ");

  const aliases = {
    fsh: "fsh",
    "follicle stimulating hormone": "fsh",
    "follicle-stimulating hormone": "fsh",
    lh: "lh",
    "luteinizing hormone": "lh",
    "luteinising hormone": "lh",
    e2: "estradiol",
    estradiol: "estradiol",
    oestradiol: "estradiol",
    "17 beta estradiol": "estradiol",
    progesterone: "progesterone",
    prolactin: "prolactin",
    testosterone: "testosterone",
    amh: "amh",
    "anti mullerian hormone": "amh",
    "anti-mullerian hormone": "amh",
    "dhea-s": "dhea_s",
    "dhea s": "dhea_s",
    dheas: "dhea_s",
    shbg: "shbg",
    "sex hormone binding globulin": "shbg",
    "free testosterone": "free_testosterone",
  };

  return aliases[n] || n.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
};

export const getHormonalProfileDefinition = (profileKey) =>
  HORMONAL_PROFILE_DEFINITIONS[profileKey] || null;

export const isHormonalProfilePanel = (value = "") => {
  const n = String(value ?? "").toLowerCase().replace(/[_-]+/g, " ");
  if (!n.trim()) return false;
  if (/\b(tft|thyroid|free t4|free t3|total t4|total t3)\b/.test(n)) return false;
  if (/\b(adrenal|cortisol|pituitary|growth hormone|insulin|c peptide|pancreatic endocrine)\b/.test(n)) return false;
  return /\bhormonal\b|\bhormone\b|\bfertility\b/.test(n);
};

export const inferHormonalProfileKey = ({ test = null, title = "", patient = null } = {}) => {
  const parts = [
    test?.key, test?.code, test?.name, test?.test_name, test?.testName,
    test?.panel_key, test?.panelKey, test?.panel_name, test?.panelName,
    title,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/tft|thyroid|free t4|free t3|total t4|total t3/.test(parts)) return null;
  if (/day[ _-]*3|day[ _-]*03/.test(parts)) return "female_day3";
  if (/day[ _-]*21/.test(parts)) return "female_day21";
  if (/amenorr/.test(parts)) return "full_female";
  if (/fertility|infertility|ovarian reserve/.test(parts)) return "fertility";
  if (/male/.test(parts)) return "male";
  if (/full female|female hormonal/.test(parts)) return "full_female";

  const sex = String(patient?.sex ?? patient?.gender ?? "").toLowerCase();
  if (sex === "male") return "male";
  return "full_female";
};

/* Fallbacks are intentionally limited to ranges already defined for the
 * hormonal-profile architecture. Blank means: use database/master metadata. */
export const HORMONAL_FALLBACK_RANGES = {
  female_day3: {
    fsh: { range: "3.8 – 8.8", low: 3.8, high: 8.8 },
    lh: { range: "2.95 – 13.7", low: 2.95, high: 13.7 },
    estradiol: { range: "25 – 166", low: 25, high: 166 },
    prolactin: { range: "1.2 – 19.5", low: 1.2, high: 19.5 },
    testosterone: { range: "15 – 70", low: 15, high: 70 },
  },

  female_day21: {
    prolactin: { range: "4.8 – 23.3", low: 4.8, high: 23.3 },
    estradiol: { range: "44 – 211", low: 44, high: 211 },
  },

  male: {
    fsh: { range: "1.5 – 12.4", low: 1.5, high: 12.4 },
    lh: { range: "0.7 – 7.4", low: 0.7, high: 7.4 },
    prolactin: { range: "1.8 – 17.0", low: 1.8, high: 17.0 },
    testosterone: { range: "2.5 – 10.0", low: 2.5, high: 10.0 },
  },
};

/*
 * Phase fallback map.
 *
 * Only values already established in the PEFA hormonal-profile
 * material are carried forward here. We deliberately do not
 * manufacture ranges for analytes where PEFA has not defined a
 * validated value.
 *
 * Day 3 represents the early-follicular sampling context.
 * Day 21 represents the mid-luteal sampling context.
 * Therefore, where only those established PEFA references exist,
 * follicular/luteal fallback can use the corresponding profile
 * reference. Ovulatory remains unresolved unless database/master
 * metadata supplies an ovulatory range.
 */
export const HORMONAL_PHASE_FALLBACK_RANGES = {
  day_3: {
    ...HORMONAL_FALLBACK_RANGES.female_day3,
  },

  follicular: {
    ...HORMONAL_FALLBACK_RANGES.female_day3,
  },

  day_21: {
    ...HORMONAL_FALLBACK_RANGES.female_day21,
  },

  luteal: {
    ...HORMONAL_FALLBACK_RANGES.female_day21,
  },

  ovulatory: {},
};


export const getHormonalFallbackForParameter = (
  parameter,
  profileKey,
  cyclePhase = ""
) => {
  const key = canonicalHormonalAnalyteKey(
    parameter?.name ||
      parameter?.test_name ||
      parameter?.key ||
      ""
  );

  const phase = String(cyclePhase || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const normalizedPhase =
    phase === "day 3" || phase === "day03"
      ? "day_3"
      : phase === "day 21" || phase === "day21"
        ? "day_21"
        : phase;

  /*
   * For female cycle-aware profiles, an explicitly selected
   * cycle phase has priority over the profile-level fallback.
   */
  if (
    normalizedPhase &&
    normalizedPhase !== "unspecified" &&
    HORMONAL_PHASE_FALLBACK_RANGES?.[normalizedPhase]?.[key]
  ) {
    return HORMONAL_PHASE_FALLBACK_RANGES[
      normalizedPhase
    ][key];
  }

  return HORMONAL_FALLBACK_RANGES?.[profileKey]?.[key] || null;
};

export default HORMONAL_PROFILE_DEFINITIONS;
