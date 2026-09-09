import interpretChemistry from "../../utils/interpretation/Chemistry";
import getReportTitle from "../../utils/printing/getReportTitle";

export default function PrintChemistryTable({
  results = [],
  patient = null,
  printMode = "record",
}) {
  /* ======================================================
     NO RESULTS
     ====================================================== */

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  /* ======================================================
     BASIC HELPERS
     ====================================================== */

  const isPlainObject = (value) =>
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);

  const normalize = (value) =>
    String(value ?? "").trim();

  const normalizeKey = (value) =>
    normalize(value)
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const hasOwn = (object, key) =>
    Object.prototype.hasOwnProperty.call(
      object || {},
      key
    );

  const firstValue = (...values) => {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "";
  };

  /* ======================================================
     SAFE RESULTS
     ====================================================== */

  const safeResults = results.filter(Boolean);

  /* ======================================================
     PARSE DATA
     ====================================================== */

  const parseData = (data) => {
    if (
      data === null ||
      data === undefined ||
      data === ""
    ) {
      return {};
    }

    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return parsed ?? {};
      } catch {
        return data;
      }
    }

    return data;
  };

  /* ======================================================
     UNWRAP NESTED RESULT OBJECT
     ====================================================== */

  const unwrapResultObject = (value) => {
    if (!isPlainObject(value)) {
      return value;
    }

    const isResultObject = (object) =>
      isPlainObject(object) &&
      (
        hasOwn(object, "result") ||
        hasOwn(object, "value") ||
        hasOwn(object, "display_value") ||
        hasOwn(object, "displayValue") ||
        hasOwn(object, "unit") ||
        hasOwn(object, "reference_range") ||
        hasOwn(object, "referenceRange") ||
        hasOwn(object, "reference") ||
        hasOwn(object, "flag") ||
        hasOwn(object, "status")
      );

    /* --------------------------------------------------
       {
         result: {
           result: "85",
           unit: "µmol/L"
         }
       }
    -------------------------------------------------- */

    if (
      isPlainObject(value.result) &&
      isResultObject(value.result)
    ) {
      const nested = value.result;

      return {
        ...value,
        ...nested,
        result: firstValue(
          nested.result,
          nested.value,
          nested.display_value,
          nested.displayValue
        ),
      };
    }

    /* --------------------------------------------------
       {
         value: {
           result: "5.2"
         }
       }
    -------------------------------------------------- */

    if (
      isPlainObject(value.value) &&
      isResultObject(value.value)
    ) {
      const nested = value.value;

      return {
        ...value,
        ...nested,
        result: firstValue(
          nested.result,
          nested.value,
          nested.display_value,
          nested.displayValue
        ),
      };
    }

    return value;
  };

  /* ======================================================
     NORMALIZE DISPLAY VALUE
     ====================================================== */

  const normalizeResultValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (isPlainObject(value)) {
      const unwrapped =
        unwrapResultObject(value);

      if (
        unwrapped !== value &&
        isPlainObject(unwrapped)
      ) {
        const scalar =
          firstValue(
            unwrapped.result,
            unwrapped.value,
            unwrapped.display_value,
            unwrapped.displayValue,
            unwrapped.text
          );

        if (
          scalar !== "" &&
          scalar !== undefined &&
          scalar !== null
        ) {
          return normalizeResultValue(scalar);
        }
      }

      const scalar =
        firstValue(
          value.result,
          value.value,
          value.display_value,
          value.displayValue,
          value.text
        );

      if (
        scalar !== "" &&
        scalar !== undefined &&
        scalar !== null
      ) {
        return normalizeResultValue(scalar);
      }

      return Object.entries(value)
        .filter(
          ([key]) =>
            ![
              "metadata",
              "internal",
              "demographics",
              "editMode",
              "edit_mode",
            ].includes(
              normalizeKey(key)
            )
        )
        .map(
          ([key, item]) =>
            `${normalize(key)}: ${normalizeResultValue(item)}`
        )
        .join(", ");
    }

    if (Array.isArray(value)) {
      return value
        .map(
          (item) =>
            normalizeResultValue(item)
        )
        .filter(
          (item) =>
            item !== "-" &&
            String(item).trim() !== ""
        )
        .join(", ");
    }

    return String(value);
  };

  /* ======================================================
     PARAMETER NAME
     ====================================================== */

  const getFullTestName = (
    parameter,
    report = {}
  ) => {
    if (
      parameter !== null &&
      parameter !== undefined
    ) {
      if (
        typeof parameter === "string" ||
        typeof parameter === "number"
      ) {
        const value = normalize(parameter);

        if (value) {
          return value;
        }
      }

      if (isPlainObject(parameter)) {
        const objectName =
          firstValue(
            parameter.parameter,
            parameter.parameter_name,
            parameter.parameterName,
            parameter.name,
            parameter.test_name,
            parameter.testName,
            parameter.analyte,
            parameter.test,
            parameter.label
          );

        if (normalize(objectName)) {
          return normalize(objectName);
        }
      }
    }

    const reportName =
      firstValue(
        report?.parameter,
        report?.parameter_name,
        report?.parameterName,
        report?.name,
        report?.test_name,
        report?.testName,
        report?.analyte,
        report?.test,
        report?.label
      );

    return normalize(reportName);
  };

  /* ======================================================
     RESULT DATA
     ====================================================== */

  const getResultData = (report = {}) => {
    const raw = firstValue(
      report?.result,
      report?.result_data,
      report?.resultData,
      report?.value,
      report?.resultValue
    );

    return parseData(raw);
  };

  /* ======================================================
     TEST TYPE
     ====================================================== */

  const getTestType = (report = {}) =>
    normalizeKey(
      firstValue(
        report?.test_type,
        report?.testType,
        report?.type
      )
    );

  /* ======================================================
     PANEL ID
     ====================================================== */

  const getPanelId = (report = {}) =>
    firstValue(
      report?.panel_id,
      report?.panelId
    );

  /* ======================================================
     PANEL NAME
     ====================================================== */

  const getPanelName = (report = {}) =>
    normalize(
      firstValue(
        report?.panel_name,
        report?.panelName
      )
    );

  /* ======================================================
     PANEL DETECTION
     ====================================================== */

  const isPanelParent = (report = {}) => {
    const type = getTestType(report);

    const explicitPanel =
      report?.is_panel === true ||
      report?.is_panel === 1 ||
      String(report?.is_panel ?? "")
        .trim()
        .toLowerCase() === "true";

    if (explicitPanel) {
      return true;
    }

    if (
      type === "panel" ||
      type === "profile" ||
      type === "group"
    ) {
      return true;
    }

    if (normalize(getPanelId(report))) {
      return true;
    }

    if (getPanelName(report)) {
      return true;
    }

    return false;
  };

  /* ======================================================
     DIRECT RESULT DETECTION
     ====================================================== */

  const hasDirectResult = (report = {}) => {
    const data = getResultData(report);

    if (
      data === null ||
      data === undefined ||
      data === ""
    ) {
      return false;
    }

    if (
      typeof data === "string" ||
      typeof data === "number"
    ) {
      return true;
    }

    if (isPlainObject(data)) {
      const normalized =
        unwrapResultObject(data);

      if (
        isPlainObject(normalized) &&
        (
          hasOwn(normalized, "result") ||
          hasOwn(normalized, "value")
        )
      ) {
        return true;
      }

      return Object.values(data).some(
        (value) => {
          if (!isPlainObject(value)) {
            return false;
          }

          const normalizedValue =
            unwrapResultObject(value);

          return (
            hasOwn(normalizedValue, "result") ||
            hasOwn(normalizedValue, "value")
          );
        }
      );
    }

    if (Array.isArray(data)) {
      return data.some(
        (item) => {
          if (!isPlainObject(item)) {
            return false;
          }

          const normalizedItem =
            unwrapResultObject(item);

          return (
            hasOwn(normalizedItem, "result") ||
            hasOwn(normalizedItem, "value")
          );
        }
      );
    }

    return false;
  };

  /* ======================================================
     FIND GROUP / PANEL
     ====================================================== */

  const firstResult =
    safeResults[0] || {};

  const group =
    firstResult?.group ||
    firstResult?.groupedReport ||
    firstResult;

  let childReports = [];

  if (
    Array.isArray(
      firstResult?.items
    )
  ) {
    childReports =
      firstResult.items.filter(Boolean);
  } else if (
    Array.isArray(
      group?.items
    )
  ) {
    childReports =
      group.items.filter(Boolean);
  } else if (
    safeResults.length > 1
  ) {
    childReports =
      safeResults
        .slice(1)
        .filter(Boolean);
  }

  /* ======================================================
     DETECT GROUPED PANEL
     ====================================================== */

  const groupedPanel =
    isPanelParent(group) &&
    childReports.length > 0;

  /* ======================================================
     REPORTS USED FOR ROWS
     ====================================================== */

  const renderableReports =
    groupedPanel
      ? childReports
      : safeResults;

  /* ======================================================
     REPORT TITLE
     ====================================================== */

  const titleSource =
    groupedPanel
      ? group
      : renderableReports[0] ||
        group ||
        {};

  let reportTitle = null;

  try {
    reportTitle =
      getReportTitle(
        titleSource,
        groupedPanel
          ? childReports
          : renderableReports
      );
  } catch (error) {
    console.error(
      "[PrintChemistryTable] getReportTitle error:",
      error
    );
  }

  const fallbackPanelTitle =
    normalize(
      firstValue(
        group?.panel_name,
        group?.panelName,
        group?.test_name,
        group?.testName,
        group?.name
      )
    );

  const finalReportTitle =
    normalize(
      firstValue(
        reportTitle?.title,
        fallbackPanelTitle
      )
    );

  /*
   * ==========================================================
   * PEFA TITLE RULE
   *
   * PANEL / PROFILE:
   *   CHEMICAL PATHOLOGY
   *   LIPID PROFILE
   *
   * SINGLE CHEMISTRY GROUP:
   *   CHEMICAL PATHOLOGY
   *   [no test title]
   *
   * The dashboard places reportType on the group wrapper.
   * ==========================================================
   */
  const groupedSingleChemistry =
    !groupedPanel &&
    (
      normalize(
        group?.reportType ||
        group?.report_type ||
        ""
      ) === "quantitative"
    );

  const showTestTitle =
    !groupedSingleChemistry &&
    reportTitle?.showTestTitle !== false &&
    Boolean(finalReportTitle);

  /* ======================================================
     FLAG CLASS
     ====================================================== */

  const getFlagClass = (flag = "") => {
    const value =
      normalizeKey(flag);

    if (
      value === "critical" ||
      value === "critical high" ||
      value === "critical low" ||
      value === "c"
    ) {
      return "flag-critical";
    }

    if (
      value === "high" ||
      value === "h" ||
      value.includes("high")
    ) {
      return "flag-high";
    }

    if (
      value === "low" ||
      value === "l" ||
      value.includes("low")
    ) {
      return "flag-low";
    }

    return "flag-normal";
  };

  /* ======================================================
     RESULT ROWS
     ====================================================== */

  const rows = [];

  const pushRow = ({
    parameter,
    report,
    result,
    unit,
    referenceRange,
    flag,
  }) => {
    const normalizedResultObject =
      unwrapResultObject(result);

    const resultObject =
      isPlainObject(
        normalizedResultObject
      )
        ? normalizedResultObject
        : null;

    const finalResult =
      resultObject
        ? normalizeResultValue(
            firstValue(
              resultObject.result,
              resultObject.value,
              resultObject.display_value,
              resultObject.displayValue,
              resultObject.text
            )
          )
        : normalizeResultValue(
            normalizedResultObject
          );

    const finalUnit =
      firstValue(
        unit,
        resultObject?.unit,
        report?.unit,
        report?.result_unit
      );

    const finalReferenceRange =
      firstValue(
        referenceRange,
        resultObject?.reference_range,
        resultObject?.referenceRange,
        resultObject?.reference,
        report?.reference_range,
        report?.referenceRange,
        report?.reference_value,
        report?.reference
      );

    const finalFlag =
      firstValue(
        flag,
        resultObject?.flag,
        resultObject?.status,
        report?.flag,
        report?.status,
        "Normal"
      );

    const finalParameter =
      getFullTestName(
        parameter,
        report
      );

    if (
      !finalParameter ||
      finalParameter === "-"
    ) {
      return;
    }

    rows.push({
      parameter:
        finalParameter,

      result:
        finalResult,

      unit:
        normalizeResultValue(
          finalUnit
        ),

      referenceRange:
        normalizeResultValue(
          finalReferenceRange
        ),

      flag:
        normalizeResultValue(
          finalFlag
        ),
    });
  };

  /* ======================================================
     BUILD RESULT ROWS
     ====================================================== */

  renderableReports.forEach(
    (report) => {
      if (!report) {
        return;
      }

      const data =
        getResultData(report);

      /* ==================================================
         FORMAT 1
         SINGLE RESULT OBJECT

         {
           result: "5.2",
           unit: "mmol/L",
           reference_range: "3.5 - 5.1",
           flag: "HIGH"
         }
      ================================================== */

      if (
        isPlainObject(data) &&
        (
          hasOwn(data, "result") ||
          hasOwn(data, "value") ||
          hasOwn(data, "display_value") ||
          hasOwn(data, "displayValue")
        )
      ) {
        const normalizedData =
          unwrapResultObject(data);

        pushRow({
          parameter:
            firstValue(
              normalizedData?.parameter,
              normalizedData?.parameter_name,
              normalizedData?.parameterName,
              normalizedData?.name,
              normalizedData?.test_name,
              normalizedData?.testName,
              normalizedData?.analyte,
              normalizedData?.test,
              normalizedData?.label,
              report?.parameter,
              report?.parameter_name,
              report?.parameterName,
              report?.name,
              report?.test_name,
              report?.testName,
              report?.analyte,
              report?.test,
              report?.label
            ),

          report,

          result:
            firstValue(
              normalizedData?.result,
              normalizedData?.value,
              normalizedData?.display_value,
              normalizedData?.displayValue,
              "-"
            ),

          unit:
            firstValue(
              normalizedData?.unit,
              report?.unit
            ),

          referenceRange:
            firstValue(
              normalizedData?.reference_range,
              normalizedData?.referenceRange,
              normalizedData?.reference,
              report?.reference_range,
              report?.referenceRange,
              report?.reference_value
            ),

          flag:
            firstValue(
              normalizedData?.flag,
              normalizedData?.status,
              report?.flag,
              report?.status,
              "Normal"
            ),
        });

        return;
      }

      /* ==================================================
         FORMAT 2
         PANEL OBJECT

         {
           Glucose: {
             result: "5.2",
             unit: "mmol/L"
           }
         }
      ================================================== */

      if (isPlainObject(data)) {
        Object.entries(data).forEach(
          ([parameter, value]) => {
            if (
              value === null ||
              value === undefined ||
              !isPlainObject(value)
            ) {
              return;
            }

            const normalizedValue =
              unwrapResultObject(value);

            if (
              !(
                hasOwn(
                  normalizedValue,
                  "result"
                ) ||
                hasOwn(
                  normalizedValue,
                  "value"
                ) ||
                hasOwn(
                  normalizedValue,
                  "display_value"
                ) ||
                hasOwn(
                  normalizedValue,
                  "displayValue"
                )
              )
            ) {
              return;
            }

            pushRow({
              parameter,

              report,

              result:
                firstValue(
                  normalizedValue.result,
                  normalizedValue.value,
                  normalizedValue.display_value,
                  normalizedValue.displayValue,
                  "-"
                ),

              unit:
                normalizedValue.unit,

              referenceRange:
                firstValue(
                  normalizedValue.reference_range,
                  normalizedValue.referenceRange,
                  normalizedValue.reference
                ),

              flag:
                firstValue(
                  normalizedValue.flag,
                  normalizedValue.status,
                  "Normal"
                ),
            });
          }
        );

        return;
      }

      /* ==================================================
         FORMAT 3
         ARRAY FORMAT

         [
           {
             parameter: "ALT",
             result: "30",
             unit: "U/L"
           }
         ]
      ================================================== */

      if (Array.isArray(data)) {
        data.forEach(
          (item) => {
            if (!isPlainObject(item)) {
              return;
            }

            const normalizedItem =
              unwrapResultObject(item);

            if (
              !(
                hasOwn(
                  normalizedItem,
                  "result"
                ) ||
                hasOwn(
                  normalizedItem,
                  "value"
                ) ||
                hasOwn(
                  normalizedItem,
                  "display_value"
                ) ||
                hasOwn(
                  normalizedItem,
                  "displayValue"
                )
              )
            ) {
              return;
            }

            pushRow({
              parameter:
                firstValue(
                  normalizedItem.parameter,
                  normalizedItem.parameter_name,
                  normalizedItem.parameterName,
                  normalizedItem.name,
                  normalizedItem.test_name,
                  normalizedItem.testName,
                  normalizedItem.analyte,
                  normalizedItem.test,
                  normalizedItem.label
                ),

              report,

              result:
                firstValue(
                  normalizedItem.result,
                  normalizedItem.value,
                  normalizedItem.display_value,
                  normalizedItem.displayValue,
                  "-"
                ),

              unit:
                normalizedItem.unit,

              referenceRange:
                firstValue(
                  normalizedItem.reference_range,
                  normalizedItem.referenceRange,
                  normalizedItem.reference
                ),

              flag:
                firstValue(
                  normalizedItem.flag,
                  normalizedItem.status,
                  "Normal"
                ),
            });
          }
        );
      }
    }
  );

  /* ======================================================
     FORMAT 4
     DIRECT PRIMITIVE RESULT
     ====================================================== */

  if (
    rows.length === 0 &&
    !groupedPanel
  ) {
    renderableReports.forEach(
      (report) => {
        const data =
          getResultData(report);

        if (
          typeof data === "string" ||
          typeof data === "number"
        ) {
          pushRow({
            parameter:
              getFullTestName(
                null,
                report
              ),

            report,

            result:
              data,

            unit:
              firstValue(
                report?.unit,
                report?.result_unit,
                "-"
              ),

            referenceRange:
              firstValue(
                report?.reference_range,
                report?.referenceRange,
                report?.reference_value,
                report?.reference,
                "-"
              ),

            flag:
              firstValue(
                report?.flag,
                report?.status,
                "Normal"
              ),
          });
        }
      }
    );
  }

  /* ======================================================
     REMOVE DUPLICATE ROWS
     ====================================================== */

  const uniqueRows = [];

  const seenRows = new Set();

  rows.forEach((row) => {
    const key = [
      normalizeKey(row.parameter),
      normalizeKey(row.result),
      normalizeKey(row.unit),
      normalizeKey(row.referenceRange),
      normalizeKey(row.flag),
    ].join("|");

    if (seenRows.has(key)) {
      return;
    }

    seenRows.add(key);
    uniqueRows.push(row);
  });

  /* ======================================================
     EMPTY TABLE
     ====================================================== */

  if (uniqueRows.length === 0) {
    return (
      <div className="chemistry-report">
        <table className="print-result-table">
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>

          <thead>
            <tr className="report-title-row">
              <th colSpan={5}>
                <div className="table-department-title">
                  CHEMICAL PATHOLOGY
                </div>

                {showTestTitle && (
                  <div className="table-test-title">
                    {finalReportTitle}
                  </div>
                )}
              </th>
            </tr>

            <tr>
              <th>Parameter</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Reference Range</th>
              <th>Flag</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No Result Available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /* ======================================================
     INTERPRETATION DATA
     ====================================================== */

  const parsedResults = {};

  uniqueRows.forEach((row) => {
    parsedResults[row.parameter] = {
      result: row.result,
      value: row.result,
      unit: row.unit,
      reference_range: row.referenceRange,
      referenceRange: row.referenceRange,
      flag: row.flag,
      status: row.flag,
    };
  });

  /* ======================================================
     INTERPRETATION
     ====================================================== */

  let interpretation = {};

  try {
    const interpretationSource =
      groupedPanel
        ? group
        : renderableReports[0] ||
          group ||
          {};

    interpretation =
      interpretChemistry(
        interpretationSource,
        parsedResults
      ) || {};
  } catch (error) {
    console.error(
      "[PrintChemistryTable] Chemistry interpretation error:",
      error
    );

    interpretation = {};
  }

  /* ======================================================
     INTERPRETATION TEXT
     ====================================================== */

  const interpretationParts = [
    interpretation?.interpretation,
    interpretation?.impression,
    interpretation?.comment,
    interpretation?.recommendation,
  ]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
    .map((value) => String(value).trim());

  const interpretationText =
    interpretationParts.length > 0
      ? interpretationParts
          .map((text) => `• ${text}`)
          .join("\n")
      : "";

  /* ======================================================
     REMARKS
     ====================================================== */

  const remarks = [];

  renderableReports.forEach((report) => {
    const data =
      getResultData(report);

    const directRemark =
      firstValue(
        report?.remark,
        report?.remarks
      );

    if (directRemark) {
      remarks.push(directRemark);
      return;
    }

    if (isPlainObject(data)) {
      const dataRemark =
        firstValue(
          data?.remark,
          data?.remarks
        );

      if (dataRemark) {
        remarks.push(dataRemark);
      }
    }
  });

  /* ======================================================
     UNIQUE REMARKS
     ====================================================== */

  const uniqueRemarks = [];

  const seenRemarks = new Set();

  remarks.forEach((remark) => {
    const normalized =
      normalizeKey(remark);

    if (
      !normalized ||
      seenRemarks.has(normalized)
    ) {
      return;
    }

    seenRemarks.add(normalized);
    uniqueRemarks.push(remark);
  });

  /* ======================================================
     DEBUG
     ====================================================== */

  if (
    typeof window !== "undefined"
  ) {
    console.log(
      "[PrintChemistryTable] FINAL PRINT DATA",
      {
        printMode,
        groupedPanel,
        reportTitle:
          finalReportTitle,
        rows:
          uniqueRows,
        interpretation,
        remarks:
          uniqueRemarks,
      }
    );
  }

  /* ======================================================
     REPORT
     ====================================================== */

  return (
    <div className="chemistry-report">

      {/* ==================================================
          RESULT TABLE
      ================================================== */}

      <table className="print-result-table">

        <colgroup>
          <col style={{ width: "30%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>

        <thead>

          {/* REPORT TITLE */}

          <tr className="report-title-row">
            <th colSpan={5}>

              <div className="table-department-title">
                CHEMICAL PATHOLOGY
              </div>

              {showTestTitle && (
                <div className="table-test-title">
                  {finalReportTitle}
                </div>
              )}

            </th>
          </tr>

          {/* COLUMN HEADERS */}

          <tr>
            <th>Parameter</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Flag</th>
          </tr>

        </thead>

        <tbody>

          {uniqueRows.map(
            (row, index) => {
              const currentFlagClass =
                getFlagClass(
                  row.flag
                );

              const rowClass =
                `result-row-${normalizeKey(
                  row.flag || "normal"
                ).replace(
                  /\s+/g,
                  "-"
                )}`;

              return (
                <tr
                  key={`${normalizeKey(
                    row.parameter
                  )}-${index}`}
                  className={rowClass}
                >

                  {/* PARAMETER */}

                  <td>
                    <div className="cell-wrap">
                      {normalizeResultValue(
                        row.parameter
                      )}
                    </div>
                  </td>

                  {/* RESULT */}

                  <td
                    className={
                      currentFlagClass
                    }
                  >
                    <div className="cell-wrap">
                      {normalizeResultValue(
                        row.result
                      )}
                    </div>
                  </td>

                  {/* UNIT */}

                  <td>
                    <div className="cell-wrap">
                      {normalizeResultValue(
                        row.unit
                      )}
                    </div>
                  </td>

                  {/* REFERENCE RANGE */}

                  <td>
                    <div className="cell-wrap">
                      {normalizeResultValue(
                        row.referenceRange
                      )}
                    </div>
                  </td>

                  {/* FLAG */}

                  <td>
                    <div className="cell-wrap">
                      <span
                        className={
                          currentFlagClass
                        }
                      >
                        {normalizeResultValue(
                          row.flag
                        )}
                      </span>
                    </div>
                  </td>

                </tr>
              );
            }
          )}

        </tbody>

      </table>

      {/* ==================================================
          INTERPRETATION
      ================================================== */}

      {interpretationText && (
        <div className="interpretation-section">

          <div className="interpretation-title">
            INTERPRETATION
          </div>

          <div
            className="interpretation-body"
            style={{
              whiteSpace:
                "pre-line",
            }}
          >
            {interpretationText}
          </div>

        </div>
      )}

      {/* ==================================================
          REMARKS
      ================================================== */}

      {uniqueRemarks.length > 0 && (
        <div className="remarks-section">

          <div className="remarks-title">
            REMARKS
          </div>

          <div
            className="remarks-body"
            style={{
              whiteSpace:
                "pre-line",
            }}
          >
            {uniqueRemarks
              .map(
                (remark) =>
                  `• ${String(
                    remark
                  )}`
              )
              .join("\n")}
          </div>

        </div>
      )}

    </div>
  );
}