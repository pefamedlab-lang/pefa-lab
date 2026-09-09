import {
    getFullTestName,
} from "../../utils/fullTestName";

export default function PrintEndocrinologyPanel({
    results = [],
}) {

    /* ======================================================
       NO RESULT
    ====================================================== */

    if (!results?.length) {
        return null;
    }

    /* ======================================================
       HELPERS
    ====================================================== */

    const parseData = (data) => {

        if (!data) {
            return {};
        }

        if (typeof data === "string") {

            try {
                return JSON.parse(data);
            } catch {
                return {};
            }

        }

        return data;

    };

    const getFlagClass = (flag = "") => {

        const value =
            String(flag)
                .toLowerCase()
                .trim();

        if (
            value === "high" ||
            value === "h"
        ) {
            return "flag-high";
        }

        if (
            value === "low" ||
            value === "l"
        ) {
            return "flag-low";
        }

        if (
            value === "critical" ||
            value === "c"
        ) {
            return "flag-critical";
        }

        return "flag-normal";

    };

    /* ======================================================
       INLINE STYLES
    ====================================================== */

    const departmentStyle = {
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "700",
        color: "#003366",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: results.length === 1 ? "6px" : "14px",
    };

    const testTitleStyle = {
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "700",
        color: "#0f4c81",
        background: "#eef5fb",
        border: "1px solid #c9d9ea",
        borderRadius: "4px",
        padding: "8px",
        marginBottom: "16px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    };

    /* ======================================================
       BUILD ROWS
    ====================================================== */

    const rows = [];

    results.forEach((item) => {

        const data = parseData(
            item.result ||
            item.result_data
        );

        /* ==========================================
           SINGLE TEST
        ========================================== */

        if (data?.parameter) {

            rows.push({

                parameter:
                    getFullTestName(
                        data.parameter ||
                        item.test_type ||
                        "-"
                    ),

                result:
                    data.result ?? "-",

                unit:
                    data.unit || "-",

                referenceRange:
                    data.reference_range ||
                    data.referenceRange ||
                    "-",

                flag:
                    data.flag || "Normal",

            });

        }

        /* ==========================================
           PANEL OBJECT
        ========================================== */

        else if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data)
        ) {

            Object.entries(data).forEach(
                ([parameter, value]) => {

                    if (
                        value &&
                        typeof value === "object" &&
                        "result" in value
                    ) {

                        rows.push({

                            parameter:
                                getFullTestName(parameter),

                            result:
                                value.result ?? "-",

                            unit:
                                value.unit || "-",

                            referenceRange:
                                value.reference_range ||
                                value.referenceRange ||
                                "-",

                            flag:
                                value.flag || "Normal",

                        });

                    }

                }
            );

        }

        /* ==========================================
           ARRAY FORMAT
        ========================================== */

        else if (Array.isArray(data)) {

            data.forEach((value) => {

                rows.push({

                    parameter:
                        getFullTestName(
                            value.parameter ||
                            value.name ||
                            "-"
                        ),

                    result:
                        value.result ?? "-",

                    unit:
                        value.unit || "-",

                    referenceRange:
                        value.reference_range ||
                        value.referenceRange ||
                        "-",

                    flag:
                        value.flag || "Normal",

                });

            });

        }

    });

    /* ======================================================
       REPORT
    ====================================================== */

    return (

        <div className="endocrinology-report">

            {/* ==========================================
                DEPARTMENT
            ========================================== */}

            <div style={departmentStyle}>
                {results[0]?.department_name ||
                    results[0]?.department ||
                    "ENDOCRINOLOGY"}
            </div>

            {/* ==========================================
                TEST TITLE (ONLY FOR SINGLE TEST)
            ========================================== */}

            {results.length === 1 && (

                <div style={testTitleStyle}>
                    {results[0]?.test_name ||
                        results[0]?.test_type ||
                        "Endocrinology Panel"}
                </div>

            )}

            <table className="premium-table">

                <thead>

                    <tr>

                        <th>Parameter</th>

                        <th>Result</th>

                        <th>Unit</th>

                        <th>Reference Range</th>

                        <th>Flag</th>

                    </tr>

                </thead>

                <tbody>

                    {rows.length ? (

                        rows.map((row, index) => (

                            <tr
                                key={index}
                                className={`result-row-${(
                                    row.flag || "normal"
                                )
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                            >

                                <td>
                                    {row.parameter}
                                </td>

                                <td>

                                    <span
                                        className={getFlagClass(
                                            row.flag
                                        )}
                                    >
                                        {row.result}
                                    </span>

                                </td>

                                <td>
                                    {row.unit}
                                </td>

                                <td>
                                    {row.referenceRange}
                                </td>

                                <td>

                                    <span
                                        className={getFlagClass(
                                            row.flag
                                        )}
                                    >
                                        {row.flag}
                                    </span>

                                </td>

                            </tr>

                        ))

                    ) : (

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

                    )}

                </tbody>

            </table>

        </div>

    );

}