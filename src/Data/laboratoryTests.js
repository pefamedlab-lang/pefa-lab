/* =========================
   ENTERPRISE LABORATORY
   MASTER TEST REGISTRY
========================= */

export const laboratoryTests =
  [
    /* =========================
       COMPLETE BLOOD COUNT
    ========================= */

    {
      id: 1,

      testName:
        "Complete Blood Count",

      shortName:
        "CBC",

      category:
        "Hematology",

      testMode:
        "Panel/Profile",

      resultType:
        "Quantitative",

      price: 5000,

      parameters: [
        {
          parameterName:
            "WBC",

          parameterType:
            "Quantitative",

          unit:
            "x10⁹/L",

          referenceMode:
            "Universal",

          referenceRange:
            "4.0 - 11.0",
        },

        {
          parameterName:
            "RBC",

          parameterType:
            "Quantitative",

          unit:
            "x10¹²/L",

          referenceMode:
            "Sex + Age",

          adultMaleReference:
            "4.5 - 5.9",

          adultFemaleReference:
            "4.1 - 5.1",

          childMaleReference:
            "4.0 - 5.2",

          childFemaleReference:
            "4.0 - 5.2",
        },

        {
          parameterName:
            "Hemoglobin",

          parameterType:
            "Quantitative",

          unit:
            "g/dL",

          referenceMode:
            "Sex + Age",

          adultMaleReference:
            "13 - 18",

          adultFemaleReference:
            "11.5 - 16",

          childMaleReference:
            "11 - 14",

          childFemaleReference:
            "11 - 14",
        },

        {
          parameterName:
            "PCV",

          parameterType:
            "Quantitative",

          unit:
            "%",

          referenceMode:
            "Sex + Age",

          adultMaleReference:
            "40 - 54",

          adultFemaleReference:
            "36 - 48",

          childMaleReference:
            "32 - 44",

          childFemaleReference:
            "32 - 44",
        },

        {
          parameterName:
            "Platelet",

          parameterType:
            "Quantitative",

          unit:
            "x10⁹/L",

          referenceMode:
            "Universal",

          referenceRange:
            "150 - 450",
        },
      ],
    },

    /* =========================
       WIDAL TEST
    ========================= */

    {
      id: 2,

      testName:
        "Widal Test",

      shortName:
        "WIDAL",

      category:
        "Microbiology",

      testMode:
        "Panel/Profile",

      resultType:
        "Titration",

      price: 3500,

      parameters: [
        {
          parameterName:
            "S. Typhi O",

          parameterType:
            "Titration",

          options:
            "1/20,1/40,1/80,1/160,1/320",
        },

        {
          parameterName:
            "S. Typhi H",

          parameterType:
            "Titration",

          options:
            "1/20,1/40,1/80,1/160,1/320",
        },

        {
          parameterName:
            "S. Paratyphi A",

          parameterType:
            "Titration",

          options:
            "1/20,1/40,1/80,1/160,1/320",
        },

        {
          parameterName:
            "S. Paratyphi B",

          parameterType:
            "Titration",

          options:
            "1/20,1/40,1/80,1/160,1/320",
        },
      ],
    },

    /* =========================
       HIV
    ========================= */

    {
      id: 3,

      testName:
        "HIV I & II",

      shortName:
        "HIV",

      category:
        "Serology",

      testMode:
        "Single Test",

      resultType:
        "Qualitative",

      price: 2500,

      parameters: [
        {
          parameterName:
            "HIV Result",

          parameterType:
            "Qualitative",

          options:
            "Reactive,Non-Reactive",
        },
      ],
    },

    /* =========================
       FSH
    ========================= */

    {
      id: 4,

      testName:
        "Follicle Stimulating Hormone",

      shortName:
        "FSH",

      category:
        "Hormonal Assay",

      testMode:
        "Single Test",

      resultType:
        "Quantitative",

      price: 12000,

      parameters: [
        {
          parameterName:
            "FSH",

          parameterType:
            "Quantitative",

          unit:
            "mIU/mL",

          referenceMode:
            "Phase-Based",

          follicularReference:
            "3.5 - 12.5",

          ovulationReference:
            "4.7 - 21.5",

          lutealReference:
            "1.7 - 7.7",

          postMenopausalReference:
            "25 - 135",
        },
      ],
    },

    /* =========================
       B-HCG
    ========================= */

    {
      id: 5,

      testName:
        "Beta hCG",

      shortName:
        "β-hCG",

      category:
        "Hormonal Assay",

      testMode:
        "Single Test",

      resultType:
        "Quantitative",

      price: 15000,

      parameters: [
        {
          parameterName:
            "β-hCG",

          parameterType:
            "Quantitative",

          unit:
            "mIU/mL",

          referenceMode:
            "Pregnancy-Based",

          firstTrimester:
            "5 - 426",

          secondTrimester:
            "540 - 74000",

          thirdTrimester:
            "1000 - 50000",
        },
      ],
    },

    /* =========================
       URINALYSIS
    ========================= */

    {
      id: 6,

      testName:
        "Urinalysis",

      shortName:
        "Urine",

      category:
        "Urinalysis",

      testMode:
        "Panel/Profile",

      resultType:
        "Mixed",

      price: 4000,

      parameters: [
        {
          parameterName:
            "Appearance",

          parameterType:
            "Text",
        },

        {
          parameterName:
            "Protein",

          parameterType:
            "Qualitative",

          options:
            "Negative,Trace,+,++,+++",
        },

        {
          parameterName:
            "Glucose",

          parameterType:
            "Qualitative",

          options:
            "Negative,Trace,+,++,+++",
        },

        {
          parameterName:
            "Pus Cells",

          parameterType:
            "Text",
        },
      ],
    },
  ];