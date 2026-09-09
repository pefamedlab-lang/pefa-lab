export default function groupResultsForPrinting(results = []) {
  const empty = {
    chemistrySingles: [],
    chemistryPanels: [],

    haematologySingles: [],
    haematologyPanels: [],

    qualitative: [],

    endocrinologySingles: [],
    endocrinologyPanels: [],

    microbiology: [],
    radiology: [],
    histology: [],

    specialTests: [],
  };

  if (!Array.isArray(results)) {
    return empty;
  }

  const grouped = structuredClone(empty);

  /* =====================================================
     HELPERS
  ===================================================== */

  const normalize = (value = "") =>
    String(value)
      .toLowerCase()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /* =====================================================
     MASTER LISTS
  ===================================================== */

  const chemistrySingles = new Set([
    "fbs",
    "fasting blood sugar",

    "rbs",
    "random blood sugar",

    "hba1c",
    "glycated haemoglobin",

    "psa",
    "total psa",
    "free psa",
    "prostate specific antigen",

    "creatinine",
    "serum creatinine",

    "urea",
    "blood urea",

    "uric acid",

    "calcium",
    "magnesium",

    "phosphorus",
    "phosphate",
  ].map(normalize));

  const chemistryPanels = new Set([
    "lft",
    "liver function test",

    "kft",
    "kidney function test",

    "lipid profile",
  ].map(normalize));

  const haematologySingles = new Set([
    "pcv",
    "packed cell volume",

    "haemoglobin",
    "hemoglobin",

    "wbc",
    "white blood cell count",
    "total wbc",

    "platelets",
    "platelet count",

    "esr",
    "erythrocyte sedimentation rate",

    "reticulocyte count",

    "d-dimer",
    "d dimer",
    "ddimer",
  ].map(normalize));

  const haematologyPanels = new Set([
    "fbc",
    "cbc",
    "full blood count",
    "full blood count",
    "coagulation profile",
    "cd4 count",
  ].map(normalize));

  const qualitativeTests = new Set([
    "hbsag",
    "hcv",

    "hiv",
    "hiv i & ii",

    "vdrl",

    "blood group",
    "blood grouping",

    "genotype",
    "haemoglobin genotype",

    "pregnancy test",

    "malaria parasite",
    "malaria parasite (mp)",
    "mp",

    "rheumatoid factor",
    "rf",

    "crp qualitative",
  ].map(normalize));

  const endocrinologySingles = new Set([
    "tsh",
    "thyroid stimulating hormone",

    "ft3",
    "free t3",

    "ft4",
    "free t4",

    "t3",
    "t4",

    "fsh",
    "follicle stimulating hormone",

    "lh",
    "luteinizing hormone",

    "prolactin",

    "progesterone",

    "testosterone",

    "estradiol",
    "e2",

    "amh",

    "cortisol",

    "insulin",

    "beta hcg",
  ].map(normalize));

  const endocrinologyPanels = new Set([
    "free tft",
    "total tft",
    "hormonal profile",
  ].map(normalize));

  /* =====================================================
     GROUP RESULTS
  ===================================================== */

  for (const item of results) {
    if (!item) continue;

    const testType = normalize(
      item.test_type || item.test_name
    );

    const templateType = normalize(
      item.template_type
    );

    const department = normalize(
      item.department
    );

    /* ---------------- QUALITATIVE ---------------- */

    if (qualitativeTests.has(testType)) {
      grouped.qualitative.push(item);
      continue;
    }

    /* ---------------- CHEMISTRY ---------------- */

    if (chemistrySingles.has(testType)) {
      grouped.chemistrySingles.push(item);
      continue;
    }

    if (
      chemistryPanels.has(testType) ||
      chemistryPanels.has(templateType)
    ) {
      grouped.chemistryPanels.push(item);
      continue;
    }

    /* ---------------- HAEMATOLOGY ---------------- */

    if (haematologySingles.has(testType)) {
      grouped.haematologySingles.push(item);
      continue;
    }

    if (
      haematologyPanels.has(testType) ||
      haematologyPanels.has(templateType)
    ) {
      grouped.haematologyPanels.push(item);
      continue;
    }

    /* ---------------- ENDOCRINOLOGY ---------------- */

    if (endocrinologySingles.has(testType)) {
      grouped.endocrinologySingles.push(item);
      continue;
    }

    if (
      endocrinologyPanels.has(testType) ||
      endocrinologyPanels.has(templateType)
    ) {
      grouped.endocrinologyPanels.push(item);
      continue;
    }

    /* ---------------- MICROBIOLOGY ---------------- */

    if (department.includes("micro")) {
      grouped.microbiology.push(item);
      continue;
    }

    /* ---------------- RADIOLOGY ---------------- */

    if (department.includes("radio")) {
      grouped.radiology.push(item);
      continue;
    }

    /* ---------------- HISTOLOGY ---------------- */

    if (department.includes("histo")) {
      grouped.histology.push(item);
      continue;
    }

    /* ---------------- EVERYTHING ELSE ---------------- */

    grouped.specialTests.push(item);
  }

  return grouped;
}