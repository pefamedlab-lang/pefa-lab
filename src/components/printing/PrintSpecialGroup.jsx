export default function PrintSpecialGroup({
    results = [],
}) {
    if (!results.length) {
        return null;
    }

    /* ==========================================
       INLINE STYLES
    ========================================== */

    const titleStyle = {
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "bold",
        textTransform: "uppercase",
        marginBottom: "18px",
        borderBottom: "2px solid #000",
        paddingBottom: "6px",
        letterSpacing: "0.5px",
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
        color: "#222",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        fontSize: "12px",
        marginBottom: "15px",
    };

    const thTdStyle = {
        border: "1px solid #444",
        padding: "6px 8px",
        verticalAlign: "top",
    };

    const labelStyle = {
        ...thTdStyle,
        width: "35%",
        fontWeight: "600",
        background: "#f5f5f5",
    };

    const valueStyle = {
        ...thTdStyle,
        width: "65%",
    };

    const sectionTitleStyle = {
        fontSize: "12px",
        fontWeight: "bold",
        marginTop: "10px",
        marginBottom: "3px",
    };

    const commentStyle = {
        fontSize: "12px",
        lineHeight: 1.5,
        marginBottom: "12px",
    };

    return (
        <div className="special-group-report">

            <div style={titleStyle}>
                SPECIAL LABORATORY TESTS
            </div>

            {results.map((report, index) => {

                let data =
                    report.result ||
                    report.result_data ||
                    {};

                if (typeof data === "string") {
                    try {
                        data = JSON.parse(data);
                    } catch {
                        data = {};
                    }
                }

                return (
                    <div
                        key={index}
                        style={{
                            marginBottom: "22px",
                        }}
                    >

                        {/* ===================================== */}
                        {/* Department */}
                        {/* ===================================== */}

                        <div style={departmentStyle}>
                            Department:{" "}
                            {report.department_name ||
                                report.department ||
                                "Special Laboratory"}
                        </div>

                        {/* ===================================== */}
                        {/* Test */}
                        {/* ===================================== */}

                        <div style={testStyle}>
                            Test:{" "}
                            {report.test_name ||
                                report.test_type ||
                                "Special Test"}
                        </div>

                        {/* ===================================== */}
                        {/* Results */}
                        {/* ===================================== */}

                        <table style={tableStyle}>
                            <tbody>

                                {Object.entries(data)
                                    .filter(
                                        ([key]) =>
                                            ![
                                                "interpretation",
                                                "impression",
                                                "remark",
                                            ].includes(key)
                                    )
                                    .map(([key, value]) => (

                                        <tr key={key}>

                                            <td style={labelStyle}>
                                                {key
                                                    .replace(/_/g, " ")
                                                    .replace(
                                                        /\b\w/g,
                                                        (c) =>
                                                            c.toUpperCase()
                                                    )}
                                            </td>

                                            <td style={valueStyle}>
                                                {typeof value === "object"
                                                    ? value.result || "-"
                                                    : value || "-"}
                                            </td>

                                        </tr>

                                    ))}

                            </tbody>
                        </table>

                        {/* ===================================== */}
                        {/* Interpretation */}
                        {/* ===================================== */}

                        {data.interpretation && (
                            <>
                                <div style={sectionTitleStyle}>
                                    Interpretation
                                </div>

                                <div style={commentStyle}>
                                    {data.interpretation}
                                </div>
                            </>
                        )}

                        {/* ===================================== */}
                        {/* Impression */}
                        {/* ===================================== */}

                        {data.impression && (
                            <>
                                <div style={sectionTitleStyle}>
                                    Impression
                                </div>

                                <div style={commentStyle}>
                                    {data.impression}
                                </div>
                            </>
                        )}

                        {/* ===================================== */}
                        {/* Scientist Remark */}
                        {/* ===================================== */}

                        {data.remark && (
                            <>
                                <div style={sectionTitleStyle}>
                                    Scientist Remark
                                </div>

                                <div style={commentStyle}>
                                    {data.remark}
                                </div>
                            </>
                        )}

                    </div>
                );
            })}
        </div>
    );
}