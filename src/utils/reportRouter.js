export const routeReports = (

  tests = []

) => {

  const grouped = {

    panels: [],

    qualitativeSingles: [],

    haematologySingles: [],

    chemistrySingles: [],

    endocrinologySingles: [],

    specialTests: [],

  };

  /* =====================
     QUALITATIVE TESTS
  ===================== */

  const qualitativeTests = [

    "HBSAG",
    "HCV",
    "HIV",
    "HIV I & II",
    "VDRL",
    "BLOOD GROUP",
    "BLOOD GROUPING",
    "GENOTYPE",
    "HAEMOGLOBIN GENOTYPE",
    "PREGNANCY TEST",
    "MALARIA PARASITE",
    "MP",
    "CRP QUALITATIVE",
    "RHEUMATOID FACTOR",

  ];

  /* =====================
     HAEMATOLOGY SINGLES
  ===================== */

  const haematologySingles = [

    "PCV",
    "HEMOGLOBIN",
    "HAEMOGLOBIN",
    "WBC",
    "TOTAL WBC",
    "PLATELET COUNT",
    "PLATELETS",
    "ESR",
    "PT",
    "APTT",
    "INR",
    "RETICULOCYTE COUNT",
    "CD4 COUNT",

  ];

  /* =====================
     CHEMISTRY SINGLES
  ===================== */

  const chemistrySingles = [

    "FBS",
    "RBS",
    "HBA1C",
    "UREA",
    "CREATININE",
    "URIC ACID",
    "CALCIUM",
    "MAGNESIUM",
    "PHOSPHATE",
    "PHOSPHORUS",
    "D-DIMER",
    "PSA",
    "TOTAL PSA",
    "FREE PSA",
    "AFP",
    "CEA",
    "CA-125",
    "CA-19-9",
    "CA-15-3",
    "FERRITIN",
    "CRP QUANTITATIVE",

  ];

  /* =====================
     ENDOCRINOLOGY SINGLES
  ===================== */

  const endocrinologySingles = [

    "TSH",
    "FT3",
    "FT4",
    "T3",
    "T4",
    "PROLACTIN",
    "PROGESTERONE",
    "TESTOSTERONE",
    "FSH",
    "LH",
    "AMH",
    "ESTRADIOL",
    "B-HCG",
    "β-HCG",
    "CORTISOL",
    "INSULIN",
    "C-PEPTIDE",
    "VITAMIN D",
    "PTH",

  ];

  /* =====================
     SPECIAL TESTS
  ===================== */

  const specialTests = [

    "WIDAL TEST",
    "WIDAL",
    "GROUPING & CROSS MATCHING",
    "GROUPING AND CROSS MATCHING",
    "URINE DRUG SCREENING",

  ];

  tests.forEach((test) => {

    const testName = (

      test.test_name ||

      test.testType ||

      ""

    ).toUpperCase();

    /* =====================
       PANELS
    ===================== */

    if (

      test.category === "Panel"

    ) {

      grouped.panels.push(test);

      return;

    }

    /* =====================
       SPECIAL TESTS
    ===================== */

    if (

      specialTests.includes(
        testName
      )

    ) {

      grouped.specialTests.push(test);

      return;

    }

    /* =====================
       QUALITATIVE
    ===================== */

    if (

      qualitativeTests.includes(
        testName
      )

    ) {

      grouped.qualitativeSingles.push(
        test
      );

      return;

    }

    /* =====================
       HAEMATOLOGY
    ===================== */

    if (

      haematologySingles.includes(
        testName
      )

    ) {

      grouped.haematologySingles.push(
        test
      );

      return;

    }

    /* =====================
       ENDOCRINOLOGY
    ===================== */

    if (

      endocrinologySingles.includes(
        testName
      )

    ) {

      grouped.endocrinologySingles.push(
        test
      );

      return;

    }

    /* =====================
       CHEMISTRY
    ===================== */

    if (

      chemistrySingles.includes(
        testName
      )

    ) {

      grouped.chemistrySingles.push(
        test
      );

      return;

    }

    /* =====================
       FALLBACK
    ===================== */

    grouped.specialTests.push(
      test
    );

  });

  return grouped;

};