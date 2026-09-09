import {
    getFullTestName,
} from "../../utils/fullTestName";

export default function PrintEndocrinologySingle({
    results = [],
}) {

    /* ======================================================
       NO RESULT
    ====================================================== */

    if (!results.length) {
        return null;
    }

    const report = results[0];

    let data =
        report.result ||
        report.result_data ||
        {};

    /* ======================================================
       JSON SAFETY
    ====================================================== */

    if (typeof data === "string") {

        try {

            data = JSON.parse(data);

        } catch {

            data = {};

        }

    }

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
        marginBottom: "6px",
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

    const commentTitleStyle = {
        fontSize: "13px",
        fontWeight: "700",
        color: "#003366",
        marginBottom: "4px",
    };

    const commentTextStyle = {
        fontSize: "12px",
        lineHeight: 1.6,
        margin: 0,
        whiteSpace: "pre-wrap",
        textAlign: "justify",
    };

    /* ======================================================
       FLAG HELPERS
    ====================================================== */

    const getRowClass = (flag = "") => {

        const value =
            String(flag)
                .toLowerCase()
                .trim();

        if (
            value === "high" ||
            value === "h"
        ) {
            return "result-row-high";
        }

        if (
            value === "low" ||
            value === "l"
        ) {
            return "result-row-low";
        }

        if (
            value === "critical" ||
            value === "c"
        ) {
            return "result-row-critical";
        }

        return "result-row-normal";

    };

    const getResultClass = (flag = "") => {

        const value =
            String(flag)
                .toLowerCase()
                .trim();

        if (
            value === "high" ||
            value === "h"
        ) {
            return "result-high";
        }

        if (
            value === "low" ||
            value === "l"
        ) {
            return "result-low";
        }

        if (
            value === "critical" ||
            value === "c"
        ) {
            return "result-critical";
        }

        return "result-value";

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
       DISPLAY NAME
    ====================================================== */

    const parameter =
        getFullTestName(
            data.parameter ||
            report.test_type ||
            report.test_name ||
            "-"
        );

    /* ======================================================
       REPORT
    ====================================================== */

    return (

        <div className="endocrinology-report">

            {/* ==========================================
                DEPARTMENT
            ========================================== */}

            <div style={departmentStyle}>
                {report.department_name ||
                    report.department ||
                    "ENDOCRINOLOGY"}
            </div>

            {/* ==========================================
                TEST TITLE
            ========================================== */}

            <div style={testTitleStyle}>
                {report.test_name ||
                    report.test_type ||
                    parameter}
            </div>

            <table className="premium-table">

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

                    <tr
                        className={getRowClass(
                            data.flag
                        )}
                    >

                        <td>
                            {parameter}
                        </td>

                        <td>

                            <span
                                className={getResultClass(
                                    data.flag
                                )}
                            >
                                {data.result || "-"}
                            </span>

                        </td>

                        <td>
                            {data.unit || "-"}
                        </td>

                        <td>
                            {data.reference_range ||
                                data.referenceRange ||
                                "-"}
                        </td>

                        <td>

                            <span
                                className={getFlagClass(
                                    data.flag
                                )}
                            >
                                {data.flag || "Normal"}
                            </span>

                        </td>

                    </tr>

                </tbody>

            </table>

            {/* ==========================================
                INTERPRETATION
            ========================================== */}

            {data.interpretation && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Interpretation
                    </h4>

                    <p style={commentTextStyle}>
                        {data.interpretation}
                    </p>

                </div>

            )}

            {/* ==========================================
                IMPRESSION
            ========================================== */}

            {data.impression && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Impression
                    </h4>

                    <p style={commentTextStyle}>
                        {data.impression}
                    </p>

                </div>

            )}

            {/* ==========================================
                SCIENTIST REMARK
            ========================================== */}

            {data.remark && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Scientist Remark
                    </h4>

                    <p style={commentTextStyle}>
                        {data.remark}
                    </p>

                </div>

            )}

        </div>

    );

}