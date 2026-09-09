
import { useEffect, useMemo, useState } from "react";

/*=========================================================*
 * ENTERPRISE CHEMISTRY SINGLE RESULT FORM
 *
 * DATABASE-FIRST DESIGN
 *
 * Unit and reference range come from:
 *
 * test.unit
 * test.reference_range
 *
 * Legacy TEST_CONFIG is retained only as a fallback
 * when the database does not contain the values.
 *=========================================================*/

export default function ChemistrySingleForm({
  test = {},
  patient = {},
  resultData = {},
  setResultData,
}) {
  /*=======================================================*
   * TEST NAME
   *=======================================================*/

  const testName = String(
    test?.test_name ||
      test?.testName ||
      test?.name ||
      ""
  )
    .trim()
    .toUpperCase();

  /*=======================================================*
   * LEGACY FALLBACK CONFIGURATION
   *
   * DATABASE VALUES TAKE PRIORITY.
   *=======================================================*/

  const TEST_CONFIG = {
    FBS: {
      unit: "mmol/L",
      male: "3.9 - 5.5",
      female: "3.9 - 5.5",
      child: "3.3 - 5.6",
    },

    RBS: {
      unit: "mmol/L",
      male: "4.0 - 7.8",
      female: "4.0 - 7.8",
      child: "4.0 - 7.8",
    },

    HBA1C: {
      unit: "%",
      male: "4.0 - 5.6",
      female: "4.0 - 5.6",
      child: "4.0 - 5.6",
    },

    UREA: {
      unit: "mmol/L",
      male: "2.5 - 7.1",
      female: "2.5 - 7.1",
      child: "1.8 - 6.4",
    },

    CREATININE: {
      unit: "µmol/L",
      male: "62 - 115",
      female: "53 - 97",
      child: "27 - 88",
    },

    URIC_ACID: {
      unit: "µmol/L",
      male: "210 - 420",
      female: "150 - 360",
      child: "120 - 320",
    },

    CALCIUM: {
      unit: "mmol/L",
      male: "2.10 - 2.60",
      female: "2.10 - 2.60",
      child: "2.10 - 2.70",
    },

    MAGNESIUM: {
      unit: "mmol/L",
      male: "0.70 - 1.10",
      female: "0.70 - 1.10",
      child: "0.65 - 1.05",
    },

    PHOSPHORUS: {
      unit: "mmol/L",
      male: "0.80 - 1.50",
      female: "0.80 - 1.50",
      child: "1.20 - 2.10",
    },

    PSA: {
      unit: "ng/mL",
      male: "0 - 4",
      female: "N/A",
      child: "N/A",
    },
  };

  const fallbackConfig =
    TEST_CONFIG[testName] || {};

  /*=======================================================*
   * PATIENT SEX
   *=======================================================*/

  const patientSex = String(
    patient?.sex || ""
  )
    .trim()
    .toLowerCase();

  /*=======================================================*
   * PATIENT AGE
   *=======================================================*/

  const patientAge = Number(
    patient?.age || 0
  );

  /*=======================================================*
   * DATABASE UNIT
   *
   * DATABASE FIRST.
   *=======================================================*/

  const databaseUnit =
    test?.unit ??
    test?.unit_of_measure ??
    test?.parameter_unit ??
    "";

  /*=======================================================*
   * DATABASE REFERENCE RANGE
   *=======================================================*/

  const databaseReferenceRange =
    test?.reference_range ??
    test?.referenceRange ??
    test?.reference_value ??
    test?.normal_range ??
    "";

  /*=======================================================*
   * DATABASE SEX-SPECIFIC RANGES
   *
   * These are optional. If your master_tests table
   * eventually contains them, they will automatically
   * be used.
   *=======================================================*/

  const databaseMaleRange =
    test?.male_range ??
    test?.male_reference_range ??
    "";

  const databaseFemaleRange =
    test?.female_range ??
    test?.female_reference_range ??
    "";

  const databaseChildRange =
    test?.child_range ??
    test?.child_reference_range ??
    "";

  /*=======================================================*
   * FINAL UNIT
   *
   * DATABASE FIRST
   * FALLBACK SECOND
   *=======================================================*/

  const finalUnit =
    String(databaseUnit).trim() ||
    fallbackConfig.unit ||
    "";

  /*=======================================================*
   * GET REFERENCE RANGE
   *=======================================================*/

  const getReferenceRange = () => {
    /*-------------------------------------------------------
     * 1. Database child range
     *-------------------------------------------------------*/

    if (
      patientAge < 18 &&
      String(databaseChildRange).trim()
    ) {
      return String(
        databaseChildRange
      ).trim();
    }

    /*-------------------------------------------------------
     * 2. Database female range
     *-------------------------------------------------------*/

    if (
      patientSex === "female" &&
      String(databaseFemaleRange).trim()
    ) {
      return String(
        databaseFemaleRange
      ).trim();
    }

    /*-------------------------------------------------------
     * 3. Database male range
     *-------------------------------------------------------*/

    if (
      patientSex === "male" &&
      String(databaseMaleRange).trim()
    ) {
      return String(
        databaseMaleRange
      ).trim();
    }

    /*-------------------------------------------------------
     * 4. General database reference range
     *
     * This is the main value from master_tests.
     *-------------------------------------------------------*/

    if (
      String(databaseReferenceRange).trim()
    ) {
      return String(
        databaseReferenceRange
      ).trim();
    }

    /*-------------------------------------------------------
     * 5. Legacy child fallback
     *-------------------------------------------------------*/

    if (
      patientAge < 18 &&
      fallbackConfig.child
    ) {
      return fallbackConfig.child;
    }

    /*-------------------------------------------------------
     * 6. Legacy female fallback
     *-------------------------------------------------------*/

    if (
      patientSex === "female" &&
      fallbackConfig.female
    ) {
      return fallbackConfig.female;
    }

    /*-------------------------------------------------------
     * 7. Legacy male fallback
     *-------------------------------------------------------*/

    if (fallbackConfig.male) {
      return fallbackConfig.male;
    }

    return "";
  };

  /*=======================================================*
   * FINAL REFERENCE RANGE
   *=======================================================*/

  const referenceRange =
    useMemo(
      () => getReferenceRange(),
      [
        patientAge,
        patientSex,
        databaseReferenceRange,
        databaseMaleRange,
        databaseFemaleRange,
        databaseChildRange,
        fallbackConfig,
      ]
    );

  /*=======================================================*
   * INITIAL RESULT
   *=======================================================*/

  const initialResult =
    resultData &&
    typeof resultData === "object"
      ? resultData
      : {};

  /*=======================================================*
   * FORM STATE
   *=======================================================*/

  const [form, setForm] =
    useState(() => ({
      parameter:
        initialResult.parameter ||
        testName,

      result:
        initialResult.result ??
        "",

      unit:
        initialResult.unit ||
        finalUnit,

      reference_range:
        initialResult.reference_range ||
        referenceRange,

      flag:
        initialResult.flag ||
        "Normal",

      interpretation:
        initialResult.interpretation ||
        "",

      impression:
        initialResult.impression ||
        "",

      remark:
        initialResult.remark ||
        "",
    }));

  /*=======================================================*
   * SYNCHRONIZE TEST / PATIENT INFORMATION
   *=======================================================*/

  useEffect(() => {
    setForm((previous) => ({
      ...previous,

      parameter:
        testName,

      unit:
        previous.result !== ""
          ? previous.unit || finalUnit
          : finalUnit,

      reference_range:
        previous.result !== ""
          ? previous.reference_range ||
            referenceRange
          : referenceRange,
    }));
  }, [
    testName,
    finalUnit,
    referenceRange,
  ]);

  /*=======================================================*
   * DEBUG
   *=======================================================*/

  useEffect(() => {
    console.log(
      "========== CHEMISTRY SINGLE =========="
    );

    console.log(
      "Test:",
      test
    );

    console.log(
      "Test Name:",
      testName
    );

    console.log(
      "Database Unit:",
      databaseUnit
    );

    console.log(
      "Final Unit:",
      finalUnit
    );

    console.log(
      "Database Reference:",
      databaseReferenceRange
    );

    console.log(
      "Final Reference:",
      referenceRange
    );

    console.log(
      "======================================"
    );
  }, [
    test,
    testName,
    databaseUnit,
    finalUnit,
    databaseReferenceRange,
    referenceRange,
  ]);

  /*=======================================================*
   * DETERMINE FLAG
   *=======================================================*/

  const determineFlag = (
    value,
    range
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }

    if (!range) {
      return "Normal";
    }

    const numericValue =
      Number(value);

    if (
      Number.isNaN(numericValue)
    ) {
      return "Normal";
    }

    const normalizedRange =
      String(range)
        .trim()
        .toLowerCase();

    /*-------------------------------------------------------
     * NOT APPLICABLE
     *-------------------------------------------------------*/

    if (
      [
        "n/a",
        "na",
        "not applicable",
        "variable",
        "calculated",
      ].includes(
        normalizedRange
      )
    ) {
      return "Normal";
    }

    /*-------------------------------------------------------
     * LESS THAN
     *
     * Example:
     * <200
     *-------------------------------------------------------*/

    if (
      normalizedRange.startsWith("<")
    ) {
      const limit = Number(
        normalizedRange.replace(
          /[^\d.-]/g,
          ""
        )
      );

      if (
        Number.isNaN(limit)
      ) {
        return "Normal";
      }

      return numericValue < limit
        ? "Normal"
        : "High";
    }

    /*-------------------------------------------------------
     * GREATER THAN
     *
     * Example:
     * >40
     *-------------------------------------------------------*/

    if (
      normalizedRange.startsWith(">")
    ) {
      const limit = Number(
        normalizedRange.replace(
          /[^\d.-]/g,
          ""
        )
      );

      if (
        Number.isNaN(limit)
      ) {
        return "Normal";
      }

      return numericValue > limit
        ? "Normal"
        : "Low";
    }

    /*-------------------------------------------------------
     * NUMERIC RANGE
     *
     * Examples:
     *
     * 3.5 - 5.1
     * 62-115
     * 0 - 4
     *-------------------------------------------------------*/

    const numbers =
      normalizedRange.match(
        /-?\d+(?:\.\d+)?/g
      );

    if (
      !numbers ||
      numbers.length < 2
    ) {
      return "Normal";
    }

    const low =
      Number(numbers[0]);

    const high =
      Number(numbers[1]);

    if (
      Number.isNaN(low) ||
      Number.isNaN(high)
    ) {
      return "Normal";
    }

    if (
      numericValue < low
    ) {
      return "Low";
    }

    if (
      numericValue > high
    ) {
      return "High";
    }

    return "Normal";
  };

  /*=======================================================*
   * GENERATE COMMENT
   *=======================================================*/

  const generateComment = (
    flag
  ) => {
    if (
      flag === "Low"
    ) {
      return {
        interpretation:
          `${testName} is below the reference range.`,

        impression:
          "Reduced value detected. Clinical correlation is advised.",
      };
    }

    if (
      flag === "High"
    ) {
      return {
        interpretation:
          `${testName} is above the reference range.`,

        impression:
          "Elevated value detected. Clinical correlation is advised.",
      };
    }

    return {
      interpretation:
        `${testName} is within normal limits.`,

      impression:
        "No significant abnormality detected.",
    };
  };

  /*=======================================================*
   * UPDATE RESULT
   *=======================================================*/

  const updateResult = (
    value
  ) => {
    const flag =
      determineFlag(
        value,
        form.reference_range
      );

    const comments =
      generateComment(flag);

    const updated = {
      ...form,

      result:
        value,

      unit:
        form.unit ||
        finalUnit,

      reference_range:
        form.reference_range ||
        referenceRange,

      flag,

      interpretation:
        comments.interpretation,

      impression:
        comments.impression,
    };

    setForm(updated);

    if (
      typeof setResultData ===
      "function"
    ) {
      setResultData(updated);
    }
  };

  /*=======================================================*
   * UPDATE REMARK
   *=======================================================*/

  const updateRemark = (
    value
  ) => {
    const updated = {
      ...form,

      remark:
        value,
    };

    setForm(updated);

    if (
      typeof setResultData ===
      "function"
    ) {
      setResultData(updated);
    }
  };

  /*=======================================================*
   * RENDER
   *=======================================================*/

  return (
    <div className="chemistry-single-form">

      <h3>
        Chemistry Result Entry
      </h3>

      <table className="result-table">

        <thead>
          <tr>
            <th>
              Parameter
            </th>

            <th>
              Result
            </th>

            <th>
              Unit
            </th>

            <th>
              Reference Range
            </th>

            <th>
              Flag
            </th>
          </tr>
        </thead>

        <tbody>

          <tr>

            <td>
              {form.parameter}
            </td>

            <td>

              <input
                type="number"
                step="any"
                value={
                  form.result
                }
                onChange={(e) =>
                  updateResult(
                    e.target.value
                  )
                }
              />

            </td>

            <td>
              {form.unit || "—"}
            </td>

            <td>
              {
                form.reference_range ||
                "—"
              }
            </td>

            <td>

              <span
                className={`flag-${String(
                  form.flag ||
                    "Normal"
                ).toLowerCase()}`}
              >
                {
                  form.flag ||
                  "Normal"
                }
              </span>

            </td>

          </tr>

        </tbody>

      </table>

      {/*===================================================
       * INTERPRETATION
       *===================================================*/}

      <h4>
        Interpretation
      </h4>

      <textarea
        readOnly
        value={
          form.interpretation ||
          ""
        }
      />

      {/*===================================================
       * IMPRESSION
       *===================================================*/}

      <h4>
        Impression
      </h4>

      <textarea
        readOnly
        value={
          form.impression ||
          ""
        }
      />

      {/*===================================================
       * SCIENTIST REMARK
       *===================================================*/}

      <h4>
        Scientist Remark
      </h4>

      <textarea
        value={
          form.remark ||
          ""
        }
        onChange={(e) =>
          updateRemark(
            e.target.value
          )
        }
      />

    </div>
  );
}