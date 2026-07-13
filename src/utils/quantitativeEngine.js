/* =========================================
   ENTERPRISE QUANTITATIVE ENGINE
========================================= */

/* REFERENCE DATABASE */

export const referenceRanges = {
  PCV: {
    Male: {
      min: 40,
      max: 54,
      unit: "%",
    },

    Female: {
      min: 36,
      max: 48,
      unit: "%",
    },
  },

  Hemoglobin: {
    Male: {
      min: 13,
      max: 17,
      unit: "g/dL",
    },

    Female: {
      min: 12,
      max: 15,
      unit: "g/dL",
    },
  },

  Platelet: {
    Male: {
      min: 150,
      max: 450,
      unit: "x10⁹/L",
    },

    Female: {
      min: 150,
      max: 450,
      unit: "x10⁹/L",
    },
  },

  WBC: {
    Male: {
      min: 4,
      max: 11,
      unit: "x10⁹/L",
    },

    Female: {
      min: 4,
      max: 11,
      unit: "x10⁹/L",
    },
  },

  MCV: {
    Male: {
      min: 80,
      max: 96,
      unit: "fL",
    },

    Female: {
      min: 80,
      max: 96,
      unit: "fL",
    },
  },

  MCH: {
    Male: {
      min: 27,
      max: 33,
      unit: "pg",
    },

    Female: {
      min: 27,
      max: 33,
      unit: "pg",
    },
  },

  MCHC: {
    Male: {
      min: 32,
      max: 36,
      unit: "g/dL",
    },

    Female: {
      min: 32,
      max: 36,
      unit: "g/dL",
    },
  },

  Neutrophil: {
    Male: {
      min: 40,
      max: 75,
      unit: "%",
    },

    Female: {
      min: 40,
      max: 75,
      unit: "%",
    },
  },

  Lymphocyte: {
    Male: {
      min: 20,
      max: 45,
      unit: "%",
    },

    Female: {
      min: 20,
      max: 45,
      unit: "%",
    },
  },

  Monocyte: {
    Male: {
      min: 2,
      max: 10,
      unit: "%",
    },

    Female: {
      min: 2,
      max: 10,
      unit: "%",
    },
  },

  Eosinophil: {
    Male: {
      min: 1,
      max: 6,
      unit: "%",
    },

    Female: {
      min: 1,
      max: 6,
      unit: "%",
    },
  },

  Basophil: {
    Male: {
      min: 0,
      max: 1,
      unit: "%",
    },

    Female: {
      min: 0,
      max: 1,
      unit: "%",
    },
  },

  ESR: {
    Male: {
      min: 0,
      max: 15,
      unit: "mm/hr",
    },

    Female: {
      min: 0,
      max: 20,
      unit: "mm/hr",
    },
  },

  PT: {
    Male: {
      min: 11,
      max: 15,
      unit: "sec",
    },

    Female: {
      min: 11,
      max: 15,
      unit: "sec",
    },
  },

  PTTK: {
    Male: {
      min: 25,
      max: 40,
      unit: "sec",
    },

    Female: {
      min: 25,
      max: 40,
      unit: "sec",
    },
  },

  INR: {
    Male: {
      min: 0.8,
      max: 1.2,
      unit: "",
    },

    Female: {
      min: 0.8,
      max: 1.2,
      unit: "",
    },
  },
};

/* =========================================
   GET REFERENCE RANGE
========================================= */

export const getReferenceRange =
  (
    parameter,
    sex
  ) => {
    const test =
      referenceRanges[
        parameter
      ];

    if (!test)
      return null;

    return (
      test[sex] ||
      test["Male"]
    );
  };

/* =========================================
   GENERATE FLAG
========================================= */

export const generateFlag =
  (
    value,
    min,
    max
  ) => {
    const numeric =
      parseFloat(value);

    if (
      isNaN(numeric)
    )
      return "";

    if (numeric < min)
      return "L";

    if (numeric > max)
      return "H";

    return "N";
  };

/* =========================================
   GENERATE RESULT OBJECT
========================================= */

export const createQuantitativeResult =
  (
    parameter,
    result,
    sex
  ) => {
    const ref =
      getReferenceRange(
        parameter,
        sex
      );

    if (!ref)
      return null;

    return {
      parameter,

      result,

      unit: ref.unit,

      reference_range: `${ref.min} - ${ref.max}`,

      flag:
        generateFlag(
          result,
          ref.min,
          ref.max
        ),
    };
  };