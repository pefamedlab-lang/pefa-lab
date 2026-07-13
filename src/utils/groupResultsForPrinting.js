export default function groupResultsForPrinting(results = []) {

  if (!Array.isArray(results)) {

    console.log(
      "INVALID RESULTS:",
      results
    );

    return {
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

  }

  const grouped = {

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

  /* ==========================
     REMOVE DUPLICATES
  ========================== */

  const chemistryMap = new Map();

  const haematologyMap = new Map();

  const qualitativeMap = new Map();

  const endocrinologyMap = new Map();

  /* ==========================
     MASTER LISTS
  ========================== */

  const chemistrySingles = [

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

];

  const chemistryPanels = [

    "lft",
    "liver_function_test",

    "kft",
    "kidney_function_test",

    "lipid profile",
    "lipid_profile",

  ];

  const haematologySingles = [

  "pcv",
  "packed cell volume",

  "hemoglobin",
  "haemoglobin",

  "wbc",
  "total wbc",
  "white blood cell count",

  "platelets",
  "platelet count",

  "esr",
  "erythrocyte sedimentation rate",

  "reticulocyte count",

  "d-dimer",
  "d dimer",
  "ddimer",

];

  const haematologyPanels = [

    "fbc",
    "cbc",

    "full_blood_count",

    "coagulation_profile",

    "cd4_count",

  ];

 const qualitativeTests = [

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
  "mp",

  "malaria parasite (mp)",

  "rheumatoid factor",
  "rf",

  "crp qualitative",

];

 const endocrinologySingles = [

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

];

  const endocrinologyPanels = [

    "free tft",
    "free_tft",

    "total tft",
    "total_tft",

    "hormonal profile",
    "hormonal_profile",

  ];

  /* ==========================
     LOOP THROUGH RESULTS
  ========================== */

  results.forEach((item) => {

    if (!item) return;

   const testType = (

  item.test_type ||

  item.test_name ||

  ""

)

  .toLowerCase()

  .replace(/[_-]/g, " ")

  .replace(/\s+/g, " ")

  .trim();

    const templateType = (

      item.template_type ||

      ""

    )

      .toLowerCase()

      .trim();

    const department = (

      item.department ||

      ""

    )

      .toLowerCase()

      .trim();

    console.log({

      testType,

      templateType,

      department,

    });

    /* ======================
       QUALITATIVE
    ====================== */

    if (

      qualitativeTests.includes(
        testType
      )

    ) {

      qualitativeMap.set(
        testType,
        item
      );

      return;

    }

    /* ======================
       CHEMISTRY SINGLES
    ====================== */

    if (

      chemistrySingles.includes(
        testType
      )

    ) {

      chemistryMap.set(
        testType,
        item
      );

      return;

    }

    /* ======================
       CHEMISTRY PANELS
    ====================== */

    if (

      chemistryPanels.includes(
        testType
      )

    ) {

      grouped.chemistryPanels.push(
        item
      );

      return;

    }

    /* ======================
       HAEMATOLOGY SINGLES
    ====================== */

    if (

      haematologySingles.includes(
        testType
      )

    ) {

      haematologyMap.set(
        testType,
        item
      );

      return;

    }

    /* ======================
       HAEMATOLOGY PANELS
    ====================== */

    if (

      haematologyPanels.includes(
        testType
      ) ||

      haematologyPanels.includes(
        templateType
      )

    ) {

      grouped.haematologyPanels.push(
        item
      );

      return;

    }

    /* ======================
       ENDOCRINOLOGY SINGLES
    ====================== */

    if (

      endocrinologySingles.includes(
        testType
      )

    ) {

      endocrinologyMap.set(
        testType,
        item
      );

      return;

    }

    /* ======================
       ENDOCRINOLOGY PANELS
    ====================== */

    if (

      endocrinologyPanels.includes(
        testType
      ) ||

      endocrinologyPanels.includes(
        templateType
      )

    ) {

      grouped.endocrinologyPanels.push(
        item
      );

      return;

    }

    /* ======================
       MICROBIOLOGY
    ====================== */

    if (

      department.includes(
        "micro"
      )

    ) {

      grouped.microbiology.push(
        item
      );

      return;

    }

    /* ======================
       RADIOLOGY
    ====================== */

    if (

      department.includes(
        "radio"
      )

    ) {

      grouped.radiology.push(
        item
      );

      return;

    }

    /* ======================
       HISTOLOGY
    ====================== */

    if (

      department.includes(
        "histo"
      )

    ) {

      grouped.histology.push(
        item
      );

      return;

    }

    /* ======================
       EVERYTHING ELSE
    ====================== */

    grouped.specialTests.push(
      item
    );

  });

  /* ==========================
     FINAL GROUPS
  ========================== */

  grouped.chemistrySingles = [
    ...chemistryMap.values(),
  ];

  grouped.haematologySingles = [
    ...haematologyMap.values(),
  ];

  grouped.qualitative = [
    ...qualitativeMap.values(),
  ];

  grouped.endocrinologySingles = [
    ...endocrinologyMap.values(),
  ];

  return grouped;

}