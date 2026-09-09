export default function PrintHistology({
    results = [],
}) {

    /* ======================================================
       NO RESULT
    ====================================================== */

    if (!results?.length) {
        return null;
    }

    /* ======================================================
       JSON SAFETY
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
        marginBottom: "18px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    };

    const sectionStyle = {
        marginBottom: "18px",
        pageBreakInside: "avoid",
    };

    const headingStyle = {
        fontSize: "13px",
        fontWeight: "700",
        color: "#003366",
        borderBottom: "1px solid #d6d6d6",
        paddingBottom: "4px",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    };

    const textStyle = {
        fontSize: "12px",
        lineHeight: "1.7",
        color: "#222",
        margin: 0,
        whiteSpace: "pre-wrap",
        textAlign: "justify",
    };

    /* ======================================================
       REPORT
    ====================================================== */

    return (

        <div className="histology-report">

            {/* ==========================================
                DEPARTMENT
            ========================================== */}

            <div style={departmentStyle}>
                {results[0]?.department_name ||
                    results[0]?.department ||
                    "HISTOPATHOLOGY"}
            </div>

            {/* ==========================================
                TEST TITLE (ONLY FOR SINGLE TEST)
            ========================================== */}

            {results.length === 1 && (
                <div style={testTitleStyle}>
                    {results[0]?.test_name ||
                        results[0]?.test_type ||
                        "Histopathology Examination"}
                </div>
            )}

            {results.map((item, index) => {

                const data = parseData(
                    item.result ||
                    item.result_data
                );

                return (

                    <div
                        key={index}
                        className="report-block"
                    >

                        {/* ==========================================
                            CLINICAL DETAILS
                        ========================================== */}

                        {data.clinicalDetails && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Clinical Details
                                </h4>

                                <p style={textStyle}>
                                    {data.clinicalDetails}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            SPECIMEN RECEIVED
                        ========================================== */}

                        {data.specimen && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Specimen Received
                                </h4>

                                <p style={textStyle}>
                                    {data.specimen}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            GROSS DESCRIPTION
                        ========================================== */}

                        {data.grossDescription && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Gross Description
                                </h4>

                                <p style={textStyle}>
                                    {data.grossDescription}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            MICROSCOPIC EXAMINATION
                        ========================================== */}

                        {data.microscopy && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Microscopic Examination
                                </h4>

                                <p style={textStyle}>
                                    {data.microscopy}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            HISTOPATHOLOGICAL DIAGNOSIS
                        ========================================== */}

                        {data.diagnosis && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Histopathological Diagnosis
                                </h4>

                                <p
                                    style={{
                                        ...textStyle,
                                        fontWeight: "600",
                                    }}
                                >
                                    {data.diagnosis}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            RECOMMENDATION
                        ========================================== */}

                        {data.recommendation && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Recommendation
                                </h4>

                                <p style={textStyle}>
                                    {data.recommendation}
                                </p>

                            </div>

                        )}

                        {/* ==========================================
                            PATHOLOGIST COMMENT
                        ========================================== */}

                        {data.comment && (

                            <div
                                className="report-comment"
                                style={sectionStyle}
                            >

                                <h4 style={headingStyle}>
                                    Pathologist Comment
                                </h4>

                                <p style={textStyle}>
                                    {data.comment}
                                </p>

                            </div>

                        )}

                    </div>

                );

            })}

        </div>

    );

}