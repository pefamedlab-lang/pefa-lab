export default function PrintHaematologySingle({
    results = [],
}) {
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
       FLAG HELPERS
    ====================================================== */

    const getRowClass = (flag = "") => {
        const value = String(flag).toLowerCase().trim();

        if (value === "high" || value === "h")
            return "result-row-high";

        if (value === "low" || value === "l")
            return "result-row-low";

        if (value === "critical" || value === "c")
            return "result-row-critical";

        return "result-row-normal";
    };

    const getFlagClass = (flag = "") => {
        const value = String(flag).toLowerCase().trim();

        if (value === "high" || value === "h")
            return "flag-high";

        if (value === "low" || value === "l")
            return "flag-low";

        if (value === "critical" || value === "c")
            return "flag-critical";

        return "flag-normal";
    };

    const getResultClass = (flag = "") => {
        const value = String(flag).toLowerCase().trim();

        if (value === "high" || value === "h")
            return "result-high";

        if (value === "low" || value === "l")
            return "result-low";

        if (value === "critical" || value === "c")
            return "result-critical";

        return "result-value";
    };

    /* ======================================================
       INLINE STYLES
    ====================================================== */

    const titleStyle = {
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "bold",
        textTransform: "uppercase",
        borderBottom: "2px solid #000",
        paddingBottom: "6px",
        marginBottom: "16px",
    };

    const departmentStyle = {
        fontSize: "14px",
        fontWeight: "bold",
        marginBottom: "3px",
        textTransform: "uppercase",
    };

    const testStyle = {
        fontSize: "13px",
        fontWeight: "600",
        marginBottom: "10px",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px",
        marginBottom: "15px",
    };

    const thStyle = {
        border: "1px solid #444",
        padding: "6px",
        background: "#f3f3f3",
        fontWeight: "bold",
        textAlign: "center",
    };

    const tdStyle = {
        border: "1px solid #444",
        padding: "6px",
        textAlign: "center",
    };

    const labelStyle = {
        ...tdStyle,
        textAlign: "left",
        fontWeight: "600",
    };

    const commentTitleStyle = {
        fontSize: "12px",
        fontWeight: "bold",
        marginBottom: "4px",
    };

    const commentStyle = {
        fontSize: "12px",
        lineHeight: 1.5,
        marginBottom: "10px",
    };

    /* ======================================================
       REPORT
    ====================================================== */

    return (
        <div className="haematology-single-report">

            <div style={titleStyle}>
                HAEMATOLOGY REPORT
            </div>

            <div style={departmentStyle}>
                Department:{" "}
                {report.department_name ||
                    report.department ||
                    "Haematology"}
            </div>

            <div style={testStyle}>
                Test:{" "}
                {report.test_name ||
                    report.test_type ||
                    data.parameter ||
                    "-"}
            </div>

            <table
                className="premium-table"
                style={tableStyle}
            >
                <thead>
                    <tr>
                        <th style={thStyle}>
                            Parameter
                        </th>

                        <th style={thStyle}>
                            Result
                        </th>

                        <th style={thStyle}>
                            Unit
                        </th>

                        <th style={thStyle}>
                            Reference Range
                        </th>

                        <th style={thStyle}>
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
                        <td style={labelStyle}>
                            {data.parameter ||
                                report.test_name ||
                                report.test_type ||
                                "-"}
                        </td>

                        <td style={tdStyle}>
                            <span
                                className={getResultClass(
                                    data.flag
                                )}
                            >
                                {data.result ||
                                    "-"}
                            </span>
                        </td>

                        <td style={tdStyle}>
                            {data.unit || "-"}
                        </td>

                        <td style={tdStyle}>
                            {data.reference_range ||
                                data.referenceRange ||
                                "-"}
                        </td>

                        <td style={tdStyle}>
                            <span
                                className={getFlagClass(
                                    data.flag
                                )}
                            >
                                {data.flag ||
                                    "Normal"}
                            </span>
                        </td>
                    </tr>

                </tbody>
            </table>

            {data.interpretation && (
                <div className="report-comment">
                    <div
                        style={commentTitleStyle}
                    >
                        Interpretation
                    </div>

                    <div style={commentStyle}>
                        {data.interpretation}
                    </div>
                </div>
            )}

            {data.impression && (
                <div className="report-comment">
                    <div
                        style={commentTitleStyle}
                    >
                        Impression
                    </div>

                    <div style={commentStyle}>
                        {data.impression}
                    </div>
                </div>
            )}

            {data.remark && (
                <div className="report-comment">
                    <div
                        style={commentTitleStyle}
                    >
                        Scientist Remark
                    </div>

                    <div style={commentStyle}>
                        {data.remark}
                    </div>
                </div>
            )}

        </div>
    );
}