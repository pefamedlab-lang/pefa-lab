/* ==========================================================
   PEFA LAB
   LABORATORY RESULT UTILS
   ----------------------------------------------------------
   FRESH IMPLEMENTATION
   ---------------------------------------------------------- */

export const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export const isValidId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  return Number.isFinite(Number(value));
};

export const uniqueIds = (values = []) => {
  return [
    ...new Set(
      values
        .filter(isValidId)
        .map(Number)
    ),
  ];
};

export const getResultValue = (row) => {
  if (
    row?.result !== null &&
    row?.result !== undefined
  ) {
    return String(row.result);
  }

  if (
    row?.result_numeric !== null &&
    row?.result_numeric !== undefined
  ) {
    return String(row.result_numeric);
  }

  return "";
};

export const isResultComplete = (row) => {
  const value = getResultValue(row);

  return value.trim() !== "";
};

export const getResultStatus = (row) => {
  if (!row) {
    return "Pending";
  }

  if (row.result_status) {
    return String(row.result_status);
  }

  return isResultComplete(row)
    ? "Entered"
    : "Pending";
};

export const isNumericResult = (row) => {
  const type = normalizeText(
    row?.result_type ||
      row?.masterTest?.result_type ||
      row?.masterTest?.template_type ||
      ""
  );

  return (
    type.includes("numeric") ||
    type.includes("number") ||
    type === "decimal" ||
    type === "integer"
  );
};

export const getTestDisplayName = (row) =>
  row?.test_name ||
  row?.testName ||
  row?.name ||
  row?.masterTest?.test_name ||
  row?.master_test?.test_name ||
  "Laboratory Test";

export const getDepartment = (row) =>
  row?.department ||
  row?.masterTest?.department ||
  row?.master_test?.department ||
  "Laboratory";

export const getUnit = (row) =>
  row?.unit ||
  row?.masterTest?.unit ||
  row?.master_test?.unit ||
  "";

export const getReferenceValue = (row) =>
  row?.reference_value ||
  row?.masterTest?.reference_value ||
  row?.master_test?.reference_value ||
  "";

export const getRegistrationTests = (registration) => {
  if (!registration) {
    return [];
  }

  if (Array.isArray(registration.tests)) {
    return registration.tests;
  }

  return [];
};

export const getRegistrationTestName = (test) =>
  test?.test_name ||
  test?.name ||
  test?.test ||
  test?.service_name ||
  "Laboratory Test";

export const getRegistrationTestId = (test) =>
  test?.test_id ||
  test?.master_test_id ||
  test?.id ||
  null;

export const getRegistrationTestPrice = (test) =>
  Number(
    test?.price ??
      test?.unit_price ??
      test?.single_test_price ??
      0
  );

export const buildEmptyWorkspace = () => ({
  registration: null,
  tests: [],
  results: [],
  groups: [],
});

export const buildResultPayload = (
  row,
  value
) => {
  const trimmed = String(
    value ?? ""
  ).trim();

  const payload = {
    result: trimmed,
    result_status:
      trimmed === ""
        ? "Pending"
        : "Entered",
  };

  if (isNumericResult(row)) {
    payload.result_numeric =
      trimmed === ""
        ? null
        : Number.isFinite(Number(trimmed))
          ? Number(trimmed)
          : null;
  }

  return payload;
};