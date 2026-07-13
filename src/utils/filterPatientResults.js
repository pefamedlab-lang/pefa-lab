export default function filterPatientResults(

  results = [],

  selectedResult

) {

  if (

    !selectedResult ||

    !Array.isArray(results)

  ) {

    return [];

  }

  const labNumber =

    selectedResult.lab_number;

  const groupName = (

    selectedResult.test_type || ""

  )

    .toLowerCase()

    .trim();

  /* ==========================
     CHEMISTRY SINGLES
  ========================== */

  const chemistrySingles = [

    "fbs",
    "rbs",
    "hba1c",

    "urea",
    "creatinine",
    "uric acid",

    "calcium",
    "magnesium",
    "phosphorus",

    "d-dimer",

    "psa",
    "total psa",
    "free psa",

  ];

  /* ==========================
     HAEMATOLOGY SINGLES
  ========================== */

  const haematologySingles = [

    "pcv",

    "haemoglobin",
    "hemoglobin",

    "wbc",
    "total wbc",

    "platelet count",
    "platelets",

    "esr",

    "reticulocyte count",

  ];

  /* ==========================
     SEROLOGY SINGLES
  ========================== */

  const serologySingles = [

    "hbsag",
    "hcv",

    "hiv",
    "hiv i & ii",

    "vdrl",

    "blood group",
    "blood grouping",

    "genotype",
    "haemoglobin genotype",

    "mp",
    "malaria parasite",

    "rf",
    "rheumatoid factor",

    "crp qualitative",

  ];

  /* ==========================
     ENDOCRINOLOGY SINGLES
  ========================== */

  const endocrinologySingles = [

    "tsh",
    "ft3",
    "ft4",

    "t3",
    "t4",

    "fsh",
    "lh",

    "prolactin",
    "progesterone",

    "testosterone",
    "estradiol",

    "amh",

    "beta hcg",

    "cortisol",
    "insulin",

  ];

  /* ==========================
     FILTER RESULTS
  ========================== */

  return results.filter(

    (item) => {

      if (

        item.lab_number !==

        labNumber

      ) {

        return false;

      }

      const test = (

        item.test_type ||

        item.test_name ||

        ""

      )

        .toLowerCase()

        .trim();

      /* ======================
         CHEMISTRY SINGLE
      ====================== */

      if (

        [

          "chemistry single",

          "chemistry singles",

        ].includes(

          groupName

        )

      ) {

        return chemistrySingles.includes(

          test

        );

      }

      /* ======================
         HAEMATOLOGY SINGLE
      ====================== */

      if (

        [

          "haematology single",

          "haematology singles",

        ].includes(

          groupName

        )

      ) {

        return haematologySingles.includes(

          test

        );

      }

      /* ======================
         SEROLOGY SINGLE
      ====================== */

      if (

        [

          "serology single",

          "serology singles",

        ].includes(

          groupName

        )

      ) {

        return serologySingles.includes(

          test

        );

      }

      /* ======================
         ENDOCRINOLOGY SINGLE
      ====================== */

      if (

        [

          "endocrinology single",

          "endocrinology singles",

        ].includes(

          groupName

        )

      ) {

        return endocrinologySingles.includes(

          test

        );

      }

      /* ======================
         DEFAULT
      ====================== */

      return (

        test === groupName

      );

    }

  );

}