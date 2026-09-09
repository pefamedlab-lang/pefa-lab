/* ==========================================================
   CBC REFERENCE RANGES
   PEFA Medical Diagnostic Services

   STAND-ALONE CBC REFERENCE ENGINE

   This file intentionally does NOT depend on master_tests.

   Age groups:
   - Child: <18 years
   - Adult: 18–64 years
   - Elderly: ≥65 years

   Sex-dependent parameters:
   - Haemoglobin
   - PCV / HCT
   - RBC

   Other CBC parameters use the defined age-independent ranges.
========================================================== */


/* ==========================================================
   CBC REFERENCE DEFINITIONS
========================================================== */

export const CBC_REFERENCE_RANGES = {

    "Haemoglobin (Hb)": {
        unit: "g/dL",

        child: {
            male: "11.0 - 14.5",
            female: "11.0 - 14.5",
        },

        adult: {
            male: "13.0 - 17.0",
            female: "12.0 - 15.0",
        },

        elderly: {
            male: "12.0 - 16.0",
            female: "11.0 - 15.0",
        },
    },


    "PCV/HCT": {
        unit: "%",

        child: {
            male: "33 - 43",
            female: "33 - 43",
        },

        adult: {
            male: "40 - 52",
            female: "36 - 46",
        },

        elderly: {
            male: "36 - 48",
            female: "35 - 45",
        },
    },


    "RBC": {
        unit: "×10¹²/L",

        child: {
            male: "3.8 - 5.2",
            female: "3.8 - 5.2",
        },

        adult: {
            male: "4.5 - 5.9",
            female: "4.0 - 5.2",
        },

        elderly: {
            male: "4.0 - 5.6",
            female: "3.8 - 5.2",
        },
    },


    "WBC": {
        unit: "×10⁹/L",
        all: "4.0 - 10.0",
    },


    "Platelet Count": {
        unit: "×10⁹/L",
        all: "150 - 450",
    },


    "MCV": {
        unit: "fL",
        all: "80 - 100",
    },


    "MCH": {
        unit: "pg",
        all: "27 - 33",
    },


    "MCHC": {
        unit: "g/dL",
        all: "32 - 36",
    },


    "RDW": {
        unit: "%",
        all: "11.5 - 14.5",
    },


    "MPV": {
        unit: "fL",
        all: "7.5 - 11.5",
    },


    "Neutrophils": {
        unit: "%",
        all: "40 - 75",
    },


    "Lymphocytes": {
        unit: "%",
        all: "20 - 45",
    },


    "Monocytes": {
        unit: "%",
        all: "2 - 10",
    },


    "Eosinophils": {
        unit: "%",
        all: "1 - 6",
    },


    "Basophils": {
        unit: "%",
        all: "0 - 2",
    },

};


/* ==========================================================
   PARAMETER NAME NORMALIZATION
========================================================== */

export const normalizeCBCParameterName = (
    value
) => {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\u2010-\u2015]/g, "-")
        .replace(/[()]/g, "")
        .replace(/\s+/g, " ");

};


/* ==========================================================
   PARAMETER ALIASES
========================================================== */

const CBC_PARAMETER_ALIASES = {

    "haemoglobin": "Haemoglobin (Hb)",
    "hemoglobin": "Haemoglobin (Hb)",
    "hb": "Haemoglobin (Hb)",

    "pcv": "PCV/HCT",
    "hct": "PCV/HCT",
    "hematocrit": "PCV/HCT",
    "haematocrit": "PCV/HCT",

    "rbc": "RBC",
    "red blood cell": "RBC",
    "red blood cells": "RBC",

    "wbc": "WBC",
    "white blood cell": "WBC",
    "white blood cells": "WBC",

    "platelet": "Platelet Count",
    "platelets": "Platelet Count",
    "platelet count": "Platelet Count",

    "mcv": "MCV",
    "mch": "MCH",
    "mchc": "MCHC",
    "rdw": "RDW",
    "mpv": "MPV",

    "neutrophil": "Neutrophils",
    "neutrophils": "Neutrophils",

    "lymphocyte": "Lymphocytes",
    "lymphocytes": "Lymphocytes",

    "monocyte": "Monocytes",
    "monocytes": "Monocytes",

    "eosinophil": "Eosinophils",
    "eosinophils": "Eosinophils",

    "basophil": "Basophils",
    "basophils": "Basophils",

};


/* ==========================================================
   GET CANONICAL CBC PARAMETER
========================================================== */

export const getCanonicalCBCParameter = (
    parameterName
) => {

    const normalized =
        normalizeCBCParameterName(
            parameterName
        );

    return (
        CBC_PARAMETER_ALIASES[normalized] ||
        Object.keys(
            CBC_REFERENCE_RANGES
        ).find(
            (name) =>
                normalizeCBCParameterName(name) ===
                normalized
        ) ||
        parameterName
    );

};


/* ==========================================================
   SEX NORMALIZATION
========================================================== */

export const normalizeCBCSex = (
    sex
) => {

    const value =
        String(sex || "")
            .trim()
            .toLowerCase();

    if (
        [
            "m",
            "male",
            "man",
            "boy",
        ].includes(value)
    ) {
        return "male";
    }

    if (
        [
            "f",
            "female",
            "woman",
            "girl",
        ].includes(value)
    ) {
        return "female";
    }

    return "";

};


/* ==========================================================
   AGE GROUP
========================================================== */

export const getCBCAgeGroup = (
    age
) => {

    const numericAge =
        Number(age);

    if (
        !Number.isFinite(numericAge) ||
        numericAge < 0
    ) {
        return "adult";
    }

    if (numericAge < 18) {
        return "child";
    }

    if (numericAge >= 65) {
        return "elderly";
    }

    return "adult";

};


/* ==========================================================
   GET CBC REFERENCE RANGE
========================================================== */

export const getCBCReferenceRange = (
    parameterName,
    age,
    sex
) => {

    const canonicalName =
        getCanonicalCBCParameter(
            parameterName
        );

    const definition =
        CBC_REFERENCE_RANGES[
            canonicalName
        ];

    if (!definition) {
        return "";
    }


    /* ------------------------------------------
       Age/sex dependent parameters
    ------------------------------------------ */

    const ageGroup =
        getCBCAgeGroup(age);

    const normalizedSex =
        normalizeCBCSex(sex);


    if (
        definition[ageGroup]
    ) {

        if (
            normalizedSex &&
            definition[ageGroup][
                normalizedSex
            ]
        ) {
            return definition[
                ageGroup
            ][normalizedSex];
        }

        /*
         * If sex is unavailable, do not
         * silently select male/female.
         */
        return "";
    }


    /* ------------------------------------------
       Age-independent parameters
    ------------------------------------------ */

    if (definition.all) {
        return definition.all;
    }


    return "";

};


/* ==========================================================
   GET CBC UNIT
========================================================== */

export const getCBCUnit = (
    parameterName
) => {

    const canonicalName =
        getCanonicalCBCParameter(
            parameterName
        );

    return (
        CBC_REFERENCE_RANGES[
            canonicalName
        ]?.unit ||
        ""
    );

};


/* ==========================================================
   NUMBER PARSER
========================================================== */

const parseNumber = (
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .trim()
        );

    return Number.isFinite(number)
        ? number
        : null;

};


/* ==========================================================
   PARSE REFERENCE RANGE
========================================================== */

const parseReferenceRange = (
    referenceRange
) => {

    const text =
        String(
            referenceRange || ""
        )
            .trim()
            .replace(/,/g, "")
            .replace(/−/g, "-")
            .replace(/–/g, "-")
            .replace(/—/g, "-");


    if (!text) {
        return null;
    }


    const range =
        text.match(
            /^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/
        );


    if (range) {

        return {
            type: "range",
            low: Number(range[1]),
            high: Number(range[2]),
        };

    }


    const greaterEqual =
        text.match(
            /^>=\s*(-?\d+(?:\.\d+)?)$/
        );


    if (greaterEqual) {

        return {
            type: "min",
            low: Number(
                greaterEqual[1]
            ),
        };

    }


    const greaterThan =
        text.match(
            /^>\s*(-?\d+(?:\.\d+)?)$/
        );


    if (greaterThan) {

        return {
            type: "greater",
            low: Number(
                greaterThan[1]
            ),
        };

    }


    const lessEqual =
        text.match(
            /^<=\s*(-?\d+(?:\.\d+)?)$/
        );


    if (lessEqual) {

        return {
            type: "max",
            high: Number(
                lessEqual[1]
            ),
        };

    }


    const lessThan =
        text.match(
            /^<\s*(-?\d+(?:\.\d+)?)$/
        );


    if (lessThan) {

        return {
            type: "less",
            high: Number(
                lessThan[1]
            ),
        };

    }


    return null;

};


/* ==========================================================
   AUTOMATIC CBC FLAG
========================================================== */

export const calculateCBCFlag = (
    result,
    referenceRange,
    criticalLow = "",
    criticalHigh = ""
) => {

    const value =
        parseNumber(result);

    if (value === null) {
        return "";
    }


    const lowCritical =
        parseNumber(
            criticalLow
        );

    const highCritical =
        parseNumber(
            criticalHigh
        );


    if (
        lowCritical !== null &&
        value <= lowCritical
    ) {
        return "Critical Low";
    }


    if (
        highCritical !== null &&
        value >= highCritical
    ) {
        return "Critical High";
    }


    const parsed =
        parseReferenceRange(
            referenceRange
        );


    if (!parsed) {
        return "";
    }


    switch (
        parsed.type
    ) {

        case "range":

            if (
                value < parsed.low
            ) {
                return "Low";
            }

            if (
                value > parsed.high
            ) {
                return "High";
            }

            return "Normal";


        case "min":

            return value >= parsed.low
                ? "Normal"
                : "Low";


        case "greater":

            return value > parsed.low
                ? "Normal"
                : "Low";


        case "max":

            return value <= parsed.high
                ? "Normal"
                : "High";


        case "less":

            return value < parsed.high
                ? "Normal"
                : "High";


        default:
            return "";

    }

};