export default function PrintDrugScreen({
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
       DRUG PANEL
    ====================================================== */

    const drugs = [

        {
            label: "Amphetamine",
            key: "amphetamine",
        },

        {
            label: "Methamphetamine",
            key: "methamphetamine",
        },

        {
            label: "Cannabis (THC)",
            key: "thc",
        },

        {
            label: "Cocaine",
            key: "cocaine",
        },

        {
            label: "Opiates",
            key: "opiates",
        },

        {
            label: "Morphine",
            key: "morphine",
        },

        {
            label: "Tramadol",
            key: "tramadol",
        },

        {
            label: "Benzodiazepines",
            key: "benzodiazepines",
        },

        {
            label: "Barbiturates",
            key: "barbiturates",
        },

        {
            label: "Phencyclidine (PCP)",
            key: "pcp",
        },

        {
            label: "MDMA (Ecstasy)",
            key: "mdma",
        },

    ];

    /* ======================================================
       RESULT STYLE
    ====================================================== */

    const getResultClass = (value = "") => {

        const result =
            String(value)
                .toLowerCase()
                .trim();

        if (
            result.includes("positive") ||
            result.includes("reactive") ||
            result.includes("detected")
        ) {
            return "flag-high";
        }

        if (
            result.includes("negative") ||
            result.includes("non reactive") ||
            result.includes("not detected")
        ) {
            return "flag-normal";
        }

        return "result-value";

    };

    /* ======================================================
       AVAILABLE DRUGS
    ====================================================== */

    const availableDrugs = drugs.filter(
        (drug) => data[drug.key] !== undefined
    );

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
       REPORT
    ====================================================== */

    return (

        <div className="toxicology-report">

            {/* ==========================================
                DEPARTMENT
            ========================================== */}

            <div style={departmentStyle}>
                {report.department_name ||
                    report.department ||
                    "TOXICOLOGY"}
            </div>

            {/* ==========================================
                TEST TITLE (ONLY FOR SINGLE TEST)
            ========================================== */}

            {results.length === 1 && (

                <div style={testTitleStyle}>
                    {report.test_name ||
                        report.test_type ||
                        "Drug Screening"}
                </div>

            )}

            <table className="premium-table">

                <thead>

                    <tr>

                        <th>
                            Drug
                        </th>

                        <th>
                            Result
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {availableDrugs.length > 0 ? (

                        availableDrugs.map((drug) => (

                            <tr key={drug.key}>

                                <td>
                                    {drug.label}
                                </td>

                                <td>

                                    <span
                                        className={getResultClass(
                                            data[drug.key]
                                        )}
                                    >
                                        {data[drug.key] || "Negative"}
                                    </span>

                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan={2}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                No Drug Screening Result Available
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

            {/* ==========================================
                COMMENT
            ========================================== */}

            {data.comment && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Comment
                    </h4>

                    <p style={commentTextStyle}>
                        {data.comment}
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