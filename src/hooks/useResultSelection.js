/* ==========================================================
   RESULT SELECTION / EXISTING RESULT PREPARATION
========================================================== */

/*
 * IMPORTANT:
 * Do NOT import generateVerificationId from
 * resultEntryService here.
 *
 * resultEntryService already imports prepareResultData,
 * so importing it back would create a circular dependency.
 */

/* ==========================================================
   GENERATE VERIFICATION ID
========================================================== */

function generateVerificationId(
  labNumber,
  testName
) {
  return `${labNumber || ""}-${testName || ""}`
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/* ==========================================================
   GET TEST NAME
========================================================== */

function getTestName(test) {
  return (
    test?.test_name ||
    test?.testName ||
    test?.name ||
    ""
  );
}

/* ==========================================================
   GET LAB NUMBER
========================================================== */

function getLabNumber(test) {
  return (
    test?.lab_number ||
    test?.labNumber ||
    ""
  );
}

/* ==========================================================
   EXTRACT STORED RESULT VALUE
========================================================== */

function extractResultValue(existing) {
  if (!existing) {
    return null;
  }

  const stored = existing?.result;

  /* --------------------------------------------------------
     NO RESULT
  -------------------------------------------------------- */

  if (
    stored === null ||
    stored === undefined ||
    stored === ""
  ) {
    return null;
  }

  /* --------------------------------------------------------
     OBJECT RESULT
  -------------------------------------------------------- */

  if (
    typeof stored === "object" &&
    !Array.isArray(stored)
  ) {
    /*
     * Grouped / qualitative result:
     *
     * {
     *   parameter: "HIV I & II",
     *   result: "Negative"
     * }
     */

    if (
      Object.prototype.hasOwnProperty.call(
        stored,
        "result"
      )
    ) {
      return stored.result;
    }

    /*
     * Alternative structure:
     *
     * {
     *   value: "Negative"
     * }
     */

    if (
      Object.prototype.hasOwnProperty.call(
        stored,
        "value"
      )
    ) {
      return stored.value;
    }

    /*
     * Complex laboratory result.
     *
     * CBC, chemistry, urinalysis, MCS,
     * SFA, etc. may require the entire
     * object.
     */

    return stored;
  }

  /* --------------------------------------------------------
     ARRAY RESULT
  -------------------------------------------------------- */

  if (Array.isArray(stored)) {
    return stored;
  }

  /* --------------------------------------------------------
     PRIMITIVE RESULT
  -------------------------------------------------------- */

  return stored;
}

/* ==========================================================
   FIND RESULT BY VERIFICATION ID
========================================================== */

function findByVerificationId(
  labNumber,
  testName,
  existingResults
) {
  if (
    !labNumber ||
    !testName ||
    !Array.isArray(existingResults)
  ) {
    return null;
  }

  const verificationId =
    generateVerificationId(
      labNumber,
      testName
    );

  return (
    existingResults.find(
      (result) =>
        result?.verification_id ===
        verificationId
    ) || null
  );
}

/* ==========================================================
   FIND RESULT BY TEST NAME
========================================================== */

function findByTestName(
  testName,
  existingResults
) {
  if (
    !testName ||
    !Array.isArray(existingResults)
  ) {
    return null;
  }

  const normalizedName =
    testName
      .trim()
      .toLowerCase();

  return (
    existingResults.find(
      (result) => {
        const resultTestType =
          (
            result?.test_type ||
            ""
          )
            .trim()
            .toLowerCase();

        const resultTestName =
          (
            result?.test_name ||
            ""
          )
            .trim()
            .toLowerCase();

        return (
          resultTestType ===
            normalizedName ||
          resultTestName ===
            normalizedName
        );
      }
    ) || null
  );
}

/* ==========================================================
   FIND EXISTING RESULT
========================================================== */

function findExistingResult(
  test,
  existingResults = []
) {
  if (
    !test ||
    !Array.isArray(existingResults)
  ) {
    return null;
  }

  const testName =
    getTestName(test);

  if (!testName) {
    return null;
  }

  const labNumber =
    getLabNumber(test);

  /* --------------------------------------------------------
     FIRST: VERIFICATION ID
  -------------------------------------------------------- */

  if (labNumber) {
    const byVerificationId =
      findByVerificationId(
        labNumber,
        testName,
        existingResults
      );

    if (byVerificationId) {
      return byVerificationId;
    }
  }

  /* --------------------------------------------------------
     SECOND: TEST NAME
  -------------------------------------------------------- */

  return findByTestName(
    testName,
    existingResults
  );
}

/* ==========================================================
   GET GROUPED / PANEL TESTS
========================================================== */

function getGroupedTests(test) {
  if (!test) {
    return [];
  }

  /*
   * Older structure
   *
   * test.groupedTests
   */

  if (
    Array.isArray(
      test.groupedTests
    ) &&
    test.groupedTests.length
  ) {
    return test.groupedTests;
  }

  /*
   * Current enriched structure
   *
   * test.parameters
   */

  if (
    Array.isArray(
      test.parameters
    ) &&
    test.parameters.length
  ) {
    return test.parameters;
  }

  return [];
}

/* ==========================================================
   FIND GROUPED RESULT
========================================================== */

function findGroupedResult(
  patient,
  item,
  existingResults
) {
  if (
    !item ||
    !Array.isArray(existingResults)
  ) {
    return null;
  }

  const itemName =
    getTestName(item);

  if (!itemName) {
    return null;
  }

  /*
   * Patient lab number must be used here.
   *
   * The registered test item normally does not
   * contain lab_number.
   */

  const labNumber =
    patient?.lab_number ||
    patient?.labNumber ||
    "";

  /* --------------------------------------------------------
     FIRST: VERIFICATION ID
  -------------------------------------------------------- */

  if (labNumber) {
    const byVerificationId =
      findByVerificationId(
        labNumber,
        itemName,
        existingResults
      );

    if (byVerificationId) {
      return byVerificationId;
    }
  }

  /* --------------------------------------------------------
     SECOND: TEST NAME
  -------------------------------------------------------- */

  return findByTestName(
    itemName,
    existingResults
  );
}

/* ==========================================================
   PREPARE GROUPED RESULTS
========================================================== */

function prepareGroupedResults(
  test,
  patient,
  existingResults
) {
  const groupedTests =
    getGroupedTests(test);

  const groupedResults = {};

  groupedTests.forEach((item) => {
    const itemName =
      getTestName(item);

    if (!itemName) {
      return;
    }

    const existing =
      findGroupedResult(
        patient,
        item,
        existingResults
      );

    const value =
      extractResultValue(existing);

    groupedResults[itemName] =
      value === null ||
      value === undefined
        ? ""
        : value;
  });

  return groupedResults;
}

/* ==========================================================
   PREPARE SINGLE RESULT
========================================================== */

function prepareSingleResult(
  test,
  existingResults
) {
  const existing =
    findExistingResult(
      test,
      existingResults
    );

  const value =
    extractResultValue(existing);

  if (
    value === null ||
    value === undefined
  ) {
    return {};
  }

  return value;
}

/* ==========================================================
   PREPARE RESULT DATA
========================================================== */

export function prepareResultData(
  test,
  existingResults = [],
  patient = {}
) {
  if (!test) {
    return {};
  }

  if (!Array.isArray(existingResults)) {
    existingResults = [];
  }

  /* ========================================================
     GROUPED / PANEL TEST
  ======================================================== */

  const groupedTests =
    getGroupedTests(test);

  if (groupedTests.length > 0) {
    return prepareGroupedResults(
      test,
      patient,
      existingResults
    );
  }

  /* ========================================================
     SINGLE TEST
  ======================================================== */

  return prepareSingleResult(
    test,
    existingResults
  );
}

/* ==========================================================
   OPTIONAL EXPORT
========================================================== */

export {
  generateVerificationId,
  extractResultValue,
  findExistingResult,
};