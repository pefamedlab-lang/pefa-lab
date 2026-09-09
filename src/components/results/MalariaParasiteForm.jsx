import { useState } from "react";

export default function MalariaParasiteForm({
    test = {},
    resultData = {},
    setResultData,
}) {

    const testName = test?.test_name || "";

    const isRDT = testName.toLowerCase().includes("rdt");

    const [form, setForm] = useState({
        parasite_seen: resultData.parasite_seen || "",
        parasite_form: resultData.parasite_form || "",
        species: resultData.species || "",
        density: resultData.density || "",
        parasite_count: resultData.parasite_count || "",
        result: resultData.result || "",
        interpretation: resultData.interpretation || "",
        impression: resultData.impression || "",
        remark: resultData.remark || "",
    });

    const yesNo = [
        "",
        "No",
        "Yes",
    ];

    const rdtOptions = [
        "",
        "Negative",
        "Positive",
    ];

    const parasiteForms = [
        "",
        "Ring",
        "Trophozoite",
        "Schizont",
        "Gametocyte",
    ];

    const speciesOptions = [
        "",
        "Plasmodium falciparum",
        "Plasmodium vivax",
        "Plasmodium malariae",
        "Plasmodium ovale",
        "Plasmodium knowlesi",
        "Mixed Infection",
    ];

    const densityOptions = [
        "",
        "+",
        "++",
        "+++",
        "++++",
    ];

    function updateField(field, value) {

        const updated = {
            ...form,
            [field]: value,
        };

        /* ======================================
           MALARIA RDT
        ====================================== */

        if (isRDT) {

            updated.result = value;

            if (value === "Positive") {

                updated.interpretation =
                    "Malaria parasite antigen detected.";

                updated.impression =
                    "Positive Malaria Rapid Diagnostic Test.";

            } else if (value === "Negative") {

                updated.interpretation =
                    "Malaria parasite antigen not detected.";

                updated.impression =
                    "Negative Malaria Rapid Diagnostic Test.";

            } else {

                updated.interpretation = "";
                updated.impression = "";

            }

        }

        /* ======================================
           MICROSCOPY
        ====================================== */

        else {

            if (field === "parasite_seen") {

                if (value === "No") {

                    updated.parasite_form = "";
                    updated.species = "";
                    updated.density = "";
                    updated.parasite_count = "";

                    updated.result =
                        "No malaria parasite seen.";

                    updated.interpretation =
                        "Negative for malaria parasite.";

                    updated.impression =
                        "No malaria parasite detected.";

                } else {

                    updated.result = "";
                    updated.interpretation = "";
                    updated.impression = "";

                }

            }

            if (
                updated.parasite_seen === "Yes" &&
                updated.parasite_form &&
                updated.species &&
                updated.density
            ) {

                let report =
                    `${updated.parasite_form} forms of ${updated.species} seen (${updated.density}).`;

                if (updated.parasite_count) {

                    report +=
                        ` Estimated parasite count: ${updated.parasite_count} parasites/µL.`;

                }

                updated.result = report;

                updated.interpretation =
                    "Malaria parasite identified on microscopy.";

                updated.impression =
                    `Positive for ${updated.species}.`;

            }

        }

        setForm(updated);
        setResultData(updated);

    }

    /* ==========================================
       INLINE STYLES
    ========================================== */

    const styles = {

        container: {
            width: "100%",
            maxWidth: "900px",
            margin: "20px auto",
            padding: "22px",
            background: "#ffffff",
            border: "1px solid #d9dee7",
            borderRadius: "10px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
            fontFamily:
                "Arial, Helvetica, sans-serif",
            fontSize: "12px",
            color: "#263238",
            boxSizing: "border-box",
        },

        title: {
            margin: "0 0 18px 0",
            paddingBottom: "10px",
            borderBottom: "2px solid #1f4e78",
            fontSize: "15px",
            fontWeight: "700",
            color: "#1f4e78",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
        },

        table: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #cfd6df",
            fontSize: "12px",
            background: "#fff",
        },

        th: {
            padding: "9px 10px",
            textAlign: "left",
            background: "#eef3f8",
            border: "1px solid #cfd6df",
            color: "#1f3b53",
            fontWeight: "700",
            fontSize: "12px",
        },

        tdLabel: {
            width: "42%",
            padding: "8px 10px",
            border: "1px solid #d5dbe3",
            background: "#f8fafc",
            fontWeight: "600",
            color: "#34495e",
            verticalAlign: "middle",
        },

        tdInput: {
            padding: "6px 8px",
            border: "1px solid #d5dbe3",
            background: "#ffffff",
            verticalAlign: "middle",
        },

        input: {
            width: "100%",
            height: "32px",
            padding: "6px 9px",
            border: "1px solid #c9d1db",
            borderRadius: "5px",
            background: "#fff",
            color: "#263238",
            fontSize: "12px",
            outline: "none",
            boxSizing: "border-box",
        },

        readonlyInput: {
            width: "100%",
            height: "32px",
            padding: "6px 9px",
            border: "1px solid #d4dbe3",
            borderRadius: "5px",
            background: "#f5f7f9",
            color: "#455a64",
            fontSize: "12px",
            boxSizing: "border-box",
        },

        select: {
            width: "100%",
            height: "32px",
            padding: "5px 9px",
            border: "1px solid #c9d1db",
            borderRadius: "5px",
            background: "#fff",
            color: "#263238",
            fontSize: "12px",
            cursor: "pointer",
            outline: "none",
            boxSizing: "border-box",
        },

        sectionTitle: {
            margin: "22px 0 8px 0",
            padding: "8px 10px",
            background: "#f1f5f9",
            borderLeft: "4px solid #1f4e78",
            color: "#1f3b53",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
        },

        textarea: {
            width: "100%",
            minHeight: "72px",
            padding: "9px 10px",
            border: "1px solid #cbd3dc",
            borderRadius: "6px",
            background: "#fafbfc",
            color: "#263238",
            fontSize: "12px",
            lineHeight: "1.5",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily:
                "Arial, Helvetica, sans-serif",
        },

        remarkTextarea: {
            width: "100%",
            minHeight: "80px",
            padding: "9px 10px",
            border: "1px solid #c9d1db",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#263238",
            fontSize: "12px",
            lineHeight: "1.5",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily:
                "Arial, Helvetica, sans-serif",
        },

        reportBox: {
            marginTop: "5px",
            padding: "12px",
            background: "#fbfcfd",
            border: "1px solid #d9dee7",
            borderRadius: "6px",
        },

    };

    return (

        <div style={styles.container}>

            {/* ==========================================
                TITLE
            ========================================== */}

            <h3 style={styles.title}>
                {testName || "Malaria Parasite Examination"}
            </h3>

            {/* ==========================================
                RESULT TABLE
            ========================================== */}

            <table style={styles.table}>

                <thead>

                    <tr>

                        <th style={styles.th}>
                            Parameter
                        </th>

                        <th style={styles.th}>
                            Result
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {/* ==================================
                        METHOD
                    ================================== */}

                    {!isRDT && (

                        <tr>

                            <td style={styles.tdLabel}>
                                Method
                            </td>

                            <td style={styles.tdInput}>

                                <input
                                    type="text"
                                    readOnly
                                    value="Giemsa Stained Thick & Thin Blood Film"
                                    style={styles.readonlyInput}
                                />

                            </td>

                        </tr>

                    )}

                    {/* ==================================
                        RDT
                    ================================== */}

                    {isRDT ? (

                        <tr>

                            <td style={styles.tdLabel}>
                                Malaria Parasite (RDT)
                            </td>

                            <td style={styles.tdInput}>

                                <select
                                    value={form.result}
                                    onChange={(e) =>
                                        updateField(
                                            "result",
                                            e.target.value
                                        )
                                    }
                                    style={styles.select}
                                >

                                    {rdtOptions.map(option => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option || "Select"}
                                        </option>

                                    ))}

                                </select>

                            </td>

                        </tr>

                    ) : (

                        <>

                            {/* ==========================
                                PARASITE SEEN
                            ========================== */}

                            <tr>

                                <td style={styles.tdLabel}>
                                    Parasite Seen
                                </td>

                                <td style={styles.tdInput}>

                                    <select
                                        value={form.parasite_seen}
                                        onChange={(e) =>
                                            updateField(
                                                "parasite_seen",
                                                e.target.value
                                            )
                                        }
                                        style={styles.select}
                                    >

                                        {yesNo.map(option => (

                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option || "Select"}
                                            </option>

                                        ))}

                                    </select>

                                </td>

                            </tr>

                            {/* ==========================
                                POSITIVE MICROSCOPY
                            ========================== */}

                            {form.parasite_seen === "Yes" && (

                                <>

                                    <tr>

                                        <td style={styles.tdLabel}>
                                            Parasite Form
                                        </td>

                                        <td style={styles.tdInput}>

                                            <select
                                                value={form.parasite_form}
                                                onChange={(e) =>
                                                    updateField(
                                                        "parasite_form",
                                                        e.target.value
                                                    )
                                                }
                                                style={styles.select}
                                            >

                                                {parasiteForms.map(option => (

                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option || "Select"}
                                                    </option>

                                                ))}

                                            </select>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td style={styles.tdLabel}>
                                            Malaria Species
                                        </td>

                                        <td style={styles.tdInput}>

                                            <select
                                                value={form.species}
                                                onChange={(e) =>
                                                    updateField(
                                                        "species",
                                                        e.target.value
                                                    )
                                                }
                                                style={styles.select}
                                            >

                                                {speciesOptions.map(option => (

                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option || "Select"}
                                                    </option>

                                                ))}

                                            </select>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td style={styles.tdLabel}>
                                            Parasite Density
                                        </td>

                                        <td style={styles.tdInput}>

                                            <select
                                                value={form.density}
                                                onChange={(e) =>
                                                    updateField(
                                                        "density",
                                                        e.target.value
                                                    )
                                                }
                                                style={styles.select}
                                            >

                                                {densityOptions.map(option => (

                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option || "Select"}
                                                    </option>

                                                ))}

                                            </select>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td style={styles.tdLabel}>
                                            Estimated Parasite Count (/µL)
                                        </td>

                                        <td style={styles.tdInput}>

                                            <input
                                                type="number"
                                                placeholder="Optional"
                                                value={form.parasite_count}
                                                onChange={(e) =>
                                                    updateField(
                                                        "parasite_count",
                                                        e.target.value
                                                    )
                                                }
                                                style={styles.input}
                                            />

                                        </td>

                                    </tr>

                                </>

                            )}

                        </>

                    )}

                </tbody>

            </table>

            {/* ==========================================
                GENERATED REPORT
            ========================================== */}

            <div style={styles.sectionTitle}>
                Generated Report
            </div>

            <div style={styles.reportBox}>

                <textarea
                    readOnly
                    value={form.result}
                    style={styles.textarea}
                />

            </div>

            {/* ==========================================
                INTERPRETATION
            ========================================== */}

            <div style={styles.sectionTitle}>
                Interpretation
            </div>

            <div style={styles.reportBox}>

                <textarea
                    readOnly
                    value={form.interpretation}
                    style={styles.textarea}
                />

            </div>

            {/* ==========================================
                IMPRESSION
            ========================================== */}

            <div style={styles.sectionTitle}>
                Impression
            </div>

            <div style={styles.reportBox}>

                <textarea
                    readOnly
                    value={form.impression}
                    style={styles.textarea}
                />

            </div>

            {/* ==========================================
                SCIENTIST REMARK
            ========================================== */}

            <div style={styles.sectionTitle}>
                Scientist Remark
            </div>

            <div style={styles.reportBox}>

                <textarea
                    value={form.remark}
                    onChange={(e) =>
                        updateField(
                            "remark",
                            e.target.value
                        )
                    }
                    placeholder="Enter scientist remark..."
                    style={styles.remarkTextarea}
                />

            </div>

        </div>

    );
}