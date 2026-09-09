/* ==========================================================
   PEFA LAB
   MALARIA PARASITE RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/MalariaParasiteResultEntry.jsx

   PURPOSE:
   - Special result-entry form for Malaria Parasite testing
   - Supports:
       • Malaria Microscopy
       • Malaria RDT
   - Preserves the established malaria result fields
   - Generates result / interpretation / impression automatically
   - Sends the complete form state to the parent through
     setResultData()
   - Uses onSave() supplied by the parent for persistence

   IMPORTANT:
   This component does NOT:
       • query Supabase
       • create laboratory_results
       • update laboratory_results
       • resolve registrations
       • resolve master tests

   The parent LaboratoryResultEntry.jsx owns the
   laboratory_results record and saving process.

   DATA FIELDS:
       parasite_seen
       parasite_form
       species
       density
       parasite_count
       result
       interpretation
       impression
       remark
   ========================================================== */

import {
    useEffect,
    useMemo,
    useState,
} from "react";

/* ==========================================================
   DEFAULT FORM
   ========================================================== */

const EMPTY_FORM = {
    parasite_seen: "",
    parasite_form: "",
    species: "",
    density: "",
    parasite_count: "",
    result: "",
    interpretation: "",
    impression: "",
    remark: "",
};

/* ==========================================================
   HELPERS
   ========================================================== */

const text = (value) =>
    String(value ?? "").trim();

const lower = (value) =>
    text(value).toLowerCase();

/* ==========================================================
   NORMALIZE RESULT DATA
   ========================================================== */

const normalizeForm = (data = {}) => ({
    ...EMPTY_FORM,

    parasite_seen:
        data?.parasite_seen ?? "",

    parasite_form:
        data?.parasite_form ?? "",

    species:
        data?.species ?? "",

    density:
        data?.density ?? "",

    parasite_count:
        data?.parasite_count ?? "",

    result:
        data?.result ?? "",

    interpretation:
        data?.interpretation ?? "",

    impression:
        data?.impression ?? "",

    remark:
        data?.remark ?? "",
});

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function MalariaParasiteResultEntry({
    test = {},
    resultData = {},
    setResultData,
    onSave,
    saving = false,
    readOnly = false,
    disabled = false,
    editMode = false,
}) {
    /* ======================================================
       TEST NAME
       ====================================================== */

    const testName =
        test?.test_name ||
        test?.testName ||
        test?.name ||
        "";

    /* ======================================================
       TEST TYPE
       ------------------------------------------------------
       Detect malaria RDT from test name.
       ====================================================== */

    const isRDT = useMemo(() => {
        const name =
            lower(testName);

        return (
            name.includes("rdt") ||
            name.includes("rapid diagnostic")
        );
    }, [testName]);

    /* ======================================================
       FORM STATE
       ====================================================== */

    const [form, setForm] = useState(() =>
        normalizeForm(resultData)
    );

    /* ======================================================
       LOCAL UI MESSAGE
       ====================================================== */

    const [validationMessage, setValidationMessage] =
        useState("");

    /* ======================================================
       SYNC WHEN DIFFERENT RESULT IS SELECTED
       ====================================================== */

    useEffect(() => {
        setForm(
            normalizeForm(resultData)
        );

        setValidationMessage("");
    }, [resultData?.id]);

    /* ======================================================
       OPTIONS
       ====================================================== */

    const yesNoOptions = [
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
        "Plasmodium species",
    ];

    const densityOptions = [
        "",
        "+",
        "++",
        "+++",
        "++++",
    ];

    /* ======================================================
       GENERATE AUTOMATIC RESULT
       ====================================================== */

    function buildResult(next) {
        /* --------------------------------------------------
           MALARIA RDT
           -------------------------------------------------- */

        if (isRDT) {
            if (next.result === "Positive") {
                return {
                    ...next,

                    interpretation:
                        "Malaria parasite antigen detected.",

                    impression:
                        "Positive Malaria Rapid Diagnostic Test.",
                };
            }

            if (next.result === "Negative") {
                return {
                    ...next,

                    interpretation:
                        "Malaria parasite antigen not detected.",

                    impression:
                        "Negative Malaria Rapid Diagnostic Test.",
                };
            }

            return {
                ...next,
                interpretation: "",
                impression: "",
            };
        }

        /* --------------------------------------------------
           MICROSCOPY — NEGATIVE
           -------------------------------------------------- */

        if (
            next.parasite_seen === "No"
        ) {
            return {
                ...next,

                parasite_form: "",
                species: "",
                density: "",
                parasite_count: "",

                result:
                    "No malaria parasite seen.",

                interpretation:
                    "Negative for malaria parasite.",

                impression:
                    "No malaria parasite detected.",
            };
        }

        /* --------------------------------------------------
           MICROSCOPY — NOTHING SELECTED
           -------------------------------------------------- */

        if (
            next.parasite_seen !== "Yes"
        ) {
            return {
                ...next,

                result: "",
                interpretation: "",
                impression: "",
            };
        }

        /* --------------------------------------------------
           MICROSCOPY — POSITIVE / COMPLETE
           -------------------------------------------------- */

        if (
            next.parasite_form &&
            next.species &&
            next.density
        ) {
            let report =
                `${next.parasite_form} forms of ${next.species} seen (${next.density}).`;

            if (
                text(next.parasite_count)
            ) {
                report +=
                    ` Estimated parasite count: ${text(
                        next.parasite_count
                    )} parasites/µL.`;
            }

            return {
                ...next,

                result: report,

                interpretation:
                    "Malaria parasite identified on microscopy.",

                impression:
                    `Positive for ${next.species}.`,
            };
        }

        /* --------------------------------------------------
           MICROSCOPY — POSITIVE / INCOMPLETE
           -------------------------------------------------- */

        return {
            ...next,

            result: "",
            interpretation: "",
            impression: "",
        };
    }

    /* ======================================================
       UPDATE FIELD
       ====================================================== */

    function updateField(
        field,
        value
    ) {
        const next = {
            ...form,
            [field]: value,
        };

        const generated =
            buildResult(next);

        setForm(generated);

        setValidationMessage("");

        if (
            typeof setResultData ===
            "function"
        ) {
            setResultData(
                generated
            );
        }
    }

    /* ======================================================
       VALIDATE BEFORE SAVE
       ====================================================== */

    function validateBeforeSave() {
        /* --------------------------------------------------
           RDT
           -------------------------------------------------- */

        if (isRDT) {
            if (
                form.result !==
                "Positive" &&
                form.result !==
                "Negative"
            ) {
                return {
                    valid: false,
                    message:
                        "Please select the Malaria RDT result before saving.",
                };
            }

            return {
                valid: true,
                message: "",
            };
        }

        /* --------------------------------------------------
           MICROSCOPY
           -------------------------------------------------- */

        if (
            form.parasite_seen !==
                "Yes" &&
            form.parasite_seen !==
                "No"
        ) {
            return {
                valid: false,
                message:
                    "Please indicate whether malaria parasite was seen.",
            };
        }

        /* --------------------------------------------------
           NEGATIVE MICROSCOPY
           -------------------------------------------------- */

        if (
            form.parasite_seen ===
            "No"
        ) {
            return {
                valid: true,
                message: "",
            };
        }

        /* --------------------------------------------------
           POSITIVE MICROSCOPY
           -------------------------------------------------- */

        if (
            !form.parasite_form
        ) {
            return {
                valid: false,
                message:
                    "Please select the parasite form.",
            };
        }

        if (
            !form.species
        ) {
            return {
                valid: false,
                message:
                    "Please select the malaria species.",
            };
        }

        if (
            !form.density
        ) {
            return {
                valid: false,
                message:
                    "Please select the parasite density.",
            };
        }

        return {
            valid: true,
            message: "",
        };
    }

    /* ======================================================
       SAVE RESULT
       ------------------------------------------------------
       Persistence belongs to the parent.
       ====================================================== */

    async function handleSave() {
        setValidationMessage("");

        /* --------------------------------------------------
           Parent save callback is required.
           -------------------------------------------------- */

        if (
            typeof onSave !==
            "function"
        ) {
            setValidationMessage(
                "Save function is not available. Please contact the laboratory system administrator."
            );

            return;
        }

        /* --------------------------------------------------
           Do not submit while already saving.
           -------------------------------------------------- */

        if (saving) {
            return;
        }

        /* --------------------------------------------------
           Validate.
           -------------------------------------------------- */

        const validation =
            validateBeforeSave();

        if (
            !validation.valid
        ) {
            setValidationMessage(
                validation.message
            );

            return;
        }

        /* --------------------------------------------------
           Make sure generated fields are current.
           -------------------------------------------------- */

        const finalForm =
            buildResult(form);

        setForm(finalForm);

        if (
            typeof setResultData ===
            "function"
        ) {
            setResultData(
                finalForm
            );
        }

        /* --------------------------------------------------
           Parent owns persistence.
           -------------------------------------------------- */

        try {
            await onSave(
                finalForm
            );
        } catch (error) {
            console.error(
                "MalariaParasiteResultEntry save failed:",
                error
            );

            setValidationMessage(
                error?.message ||
                "Failed to save malaria parasite result."
            );
        }
    }

    /* ======================================================
       INLINE STYLES
       ====================================================== */

    const styles = {
        container: {
            width: "100%",
            maxWidth: "900px",
            margin: "20px auto",
            padding: "22px",
            background: "#ffffff",
            border: "1px solid #d9dee7",
            borderRadius: "10px",
            boxShadow:
                "0 4px 18px rgba(0,0,0,0.07)",
            fontFamily:
                "Arial, Helvetica, sans-serif",
            fontSize: "12px",
            color: "#263238",
            boxSizing: "border-box",
        },

        title: {
            margin:
                "0 0 18px 0",
            paddingBottom:
                "10px",
            borderBottom:
                "2px solid #1f4e78",
            fontSize: "15px",
            fontWeight: "700",
            color: "#1f4e78",
            textTransform:
                "uppercase",
            letterSpacing:
                "0.4px",
        },

        table: {
            width: "100%",
            borderCollapse:
                "collapse",
            border:
                "1px solid #cfd6df",
            fontSize: "12px",
            background: "#fff",
        },

        th: {
            padding:
                "9px 10px",
            textAlign:
                "left",
            background:
                "#eef3f8",
            border:
                "1px solid #cfd6df",
            color:
                "#1f3b53",
            fontWeight:
                "700",
            fontSize:
                "12px",
        },

        tdLabel: {
            width: "42%",
            padding:
                "8px 10px",
            border:
                "1px solid #d5dbe3",
            background:
                "#f8fafc",
            fontWeight:
                "600",
            color:
                "#34495e",
            verticalAlign:
                "middle",
        },

        tdInput: {
            padding:
                "6px 8px",
            border:
                "1px solid #d5dbe3",
            background:
                "#ffffff",
            verticalAlign:
                "middle",
        },

        input: {
            width: "100%",
            height: "32px",
            padding:
                "6px 9px",
            border:
                "1px solid #c9d1db",
            borderRadius:
                "5px",
            background:
                "#fff",
            color:
                "#263238",
            fontSize:
                "12px",
            outline:
                "none",
            boxSizing:
                "border-box",
        },

        readonlyInput: {
            width: "100%",
            height: "32px",
            padding:
                "6px 9px",
            border:
                "1px solid #d4dbe3",
            borderRadius:
                "5px",
            background:
                "#f5f7f9",
            color:
                "#455a64",
            fontSize:
                "12px",
            boxSizing:
                "border-box",
        },

        select: {
            width: "100%",
            height: "32px",
            padding:
                "5px 9px",
            border:
                "1px solid #c9d1db",
            borderRadius:
                "5px",
            background:
                "#fff",
            color:
                "#263238",
            fontSize:
                "12px",
            cursor:
                "pointer",
            outline:
                "none",
            boxSizing:
                "border-box",
        },

        sectionTitle: {
            margin:
                "22px 0 8px 0",
            padding:
                "8px 10px",
            background:
                "#f1f5f9",
            borderLeft:
                "4px solid #1f4e78",
            color:
                "#1f3b53",
            fontSize:
                "12px",
            fontWeight:
                "700",
            textTransform:
                "uppercase",
            letterSpacing:
                "0.3px",
        },

        textarea: {
            width: "100%",
            minHeight:
                "72px",
            padding:
                "9px 10px",
            border:
                "1px solid #cbd3dc",
            borderRadius:
                "6px",
            background:
                "#fafbfc",
            color:
                "#263238",
            fontSize:
                "12px",
            lineHeight:
                "1.5",
            resize:
                "vertical",
            outline:
                "none",
            boxSizing:
                "border-box",
            fontFamily:
                "Arial, Helvetica, sans-serif",
        },

        remarkTextarea: {
            width: "100%",
            minHeight:
                "80px",
            padding:
                "9px 10px",
            border:
                "1px solid #c9d1db",
            borderRadius:
                "6px",
            background:
                "#ffffff",
            color:
                "#263238",
            fontSize:
                "12px",
            lineHeight:
                "1.5",
            resize:
                "vertical",
            outline:
                "none",
            boxSizing:
                "border-box",
            fontFamily:
                "Arial, Helvetica, sans-serif",
        },

        reportBox: {
            marginTop:
                "5px",
            padding:
                "12px",
            background:
                "#fbfcfd",
            border:
                "1px solid #d9dee7",
            borderRadius:
                "6px",
        },

        validationBox: {
            marginTop:
                "18px",
            padding:
                "10px 12px",
            border:
                "1px solid #e5b7b7",
            borderRadius:
                "6px",
            background:
                "#fff5f5",
            color:
                "#a33a3a",
            fontSize:
                "12px",
            lineHeight:
                "1.4",
        },

        saveArea: {
            marginTop:
                "24px",
            paddingTop:
                "16px",
            borderTop:
                "1px solid #d9dee7",
            display:
                "flex",
            justifyContent:
                "flex-end",
            alignItems:
                "center",
            gap:
                "10px",
        },

        saveButton: {
            minWidth:
                "150px",
            height:
                "38px",
            padding:
                "0 18px",
            border:
                "1px solid #1f4e78",
            borderRadius:
                "6px",
            background:
                "#1f4e78",
            color:
                "#ffffff",
            fontSize:
                "12px",
            fontWeight:
                "700",
            cursor:
                saving
                    ? "not-allowed"
                    : "pointer",
            opacity:
                saving
                    ? 0.7
                    : 1,
            boxSizing:
                "border-box",
        },

        saveStatus: {
            fontSize:
                "11px",
            color:
                "#607d8b",
        },
    };

    /* ======================================================
       RENDER
       ====================================================== */

    return (
        <div
            style={{
                ...styles.container,
                pointerEvents:
                    readOnly || disabled
                        ? "none"
                        : undefined,
            }}
        >
            {/* ==================================================
                TITLE
               ================================================== */}

            <h3
                style={
                    styles.title
                }
            >
                {testName ||
                    "Malaria Parasite Examination"}
            </h3>

            {/* ==================================================
                RESULT TABLE
               ================================================== */}

            <table
                style={
                    styles.table
                }
            >
                <thead>
                    <tr>
                        <th
                            style={
                                styles.th
                            }
                        >
                            Parameter
                        </th>

                        <th
                            style={
                                styles.th
                            }
                        >
                            Result
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {/* ==================================================
                        MICROSCOPY METHOD
                       ================================================== */}

                    {!isRDT && (
                        <tr>
                            <td
                                style={
                                    styles.tdLabel
                                }
                            >
                                Method
                            </td>

                            <td
                                style={
                                    styles.tdInput
                                }
                            >
                                <input
                                    type="text"
                                    readOnly
                                    value="Giemsa Stained Thick & Thin Blood Film"
                                    style={
                                        styles.readonlyInput
                                    }
                                />
                            </td>
                        </tr>
                    )}

                    {/* ==================================================
                        RDT
                       ================================================== */}

                    {isRDT ? (
                        <tr>
                            <td
                                style={
                                    styles.tdLabel
                                }
                            >
                                Malaria Parasite (RDT)
                            </td>

                            <td
                                style={
                                    styles.tdInput
                                }
                            >
                                <select
                                    value={
                                        form.result
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "result",
                                            e.target.value
                                        )
                                    }
                                    style={
                                        styles.select
                                    }
                                >
                                    {rdtOptions.map(
                                        (
                                            option
                                        ) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {option ||
                                                    "Select"}
                                            </option>
                                        )
                                    )}
                                </select>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {/* ==================================================
                                PARASITE SEEN
                               ================================================== */}

                            <tr>
                                <td
                                    style={
                                        styles.tdLabel
                                    }
                                >
                                    Parasite Seen
                                </td>

                                <td
                                    style={
                                        styles.tdInput
                                    }
                                >
                                    <select
                                        value={
                                            form.parasite_seen
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "parasite_seen",
                                                e.target.value
                                            )
                                        }
                                        style={
                                            styles.select
                                        }
                                    >
                                        {yesNoOptions.map(
                                            (
                                                option
                                            ) => (
                                                <option
                                                    key={
                                                        option
                                                    }
                                                    value={
                                                        option
                                                    }
                                                >
                                                    {option ||
                                                        "Select"}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>
                            </tr>

                            {/* ==================================================
                                POSITIVE MICROSCOPY
                               ================================================== */}

                            {form.parasite_seen ===
                                "Yes" && (
                                <>
                                    {/* ------------------------------------------
                                        PARASITE FORM
                                       ------------------------------------------ */}

                                    <tr>
                                        <td
                                            style={
                                                styles.tdLabel
                                            }
                                        >
                                            Parasite Form
                                        </td>

                                        <td
                                            style={
                                                styles.tdInput
                                            }
                                        >
                                            <select
                                                value={
                                                    form.parasite_form
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "parasite_form",
                                                        e.target.value
                                                    )
                                                }
                                                style={
                                                    styles.select
                                                }
                                            >
                                                {parasiteForms.map(
                                                    (
                                                        option
                                                    ) => (
                                                        <option
                                                            key={
                                                                option
                                                            }
                                                            value={
                                                                option
                                                            }
                                                        >
                                                            {option ||
                                                                "Select"}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>

                                    {/* ------------------------------------------
                                        MALARIA SPECIES
                                       ------------------------------------------ */}

                                    <tr>
                                        <td
                                            style={
                                                styles.tdLabel
                                            }
                                        >
                                            Malaria Species
                                        </td>

                                        <td
                                            style={
                                                styles.tdInput
                                            }
                                        >
                                            <select
                                                value={
                                                    form.species
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "species",
                                                        e.target.value
                                                    )
                                                }
                                                style={
                                                    styles.select
                                                }
                                            >
                                                {speciesOptions.map(
                                                    (
                                                        option
                                                    ) => (
                                                        <option
                                                            key={
                                                                option
                                                            }
                                                            value={
                                                                option
                                                            }
                                                        >
                                                            {option ||
                                                                "Select"}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>

                                    {/* ------------------------------------------
                                        PARASITE DENSITY
                                       ------------------------------------------ */}

                                    <tr>
                                        <td
                                            style={
                                                styles.tdLabel
                                            }
                                        >
                                            Parasite Density
                                        </td>

                                        <td
                                            style={
                                                styles.tdInput
                                            }
                                        >
                                            <select
                                                value={
                                                    form.density
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "density",
                                                        e.target.value
                                                    )
                                                }
                                                style={
                                                    styles.select
                                                }
                                            >
                                                {densityOptions.map(
                                                    (
                                                        option
                                                    ) => (
                                                        <option
                                                            key={
                                                                option
                                                            }
                                                            value={
                                                                option
                                                            }
                                                        >
                                                            {option ||
                                                                "Select"}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>

                                    {/* ------------------------------------------
                                        PARASITE COUNT
                                       ------------------------------------------ */}

                                    <tr>
                                        <td
                                            style={
                                                styles.tdLabel
                                            }
                                        >
                                            Estimated Parasite Count (/µL)
                                        </td>

                                        <td
                                            style={
                                                styles.tdInput
                                            }
                                        >
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Optional"
                                                value={
                                                    form.parasite_count
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "parasite_count",
                                                        e.target.value
                                                    )
                                                }
                                                style={
                                                    styles.input
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>
                            )}
                        </>
                    )}
                </tbody>
            </table>

            {/* ==================================================
                GENERATED REPORT
               ================================================== */}

            <div
                style={
                    styles.sectionTitle
                }
            >
                Generated Report
            </div>

            <div
                style={
                    styles.reportBox
                }
            >
                <textarea
                    readOnly
                    value={
                        form.result
                    }
                    style={
                        styles.textarea
                    }
                />
            </div>

            {/* ==================================================
                INTERPRETATION
               ================================================== */}

            <div
                style={
                    styles.sectionTitle
                }
            >
                Interpretation
            </div>

            <div
                style={
                    styles.reportBox
                }
            >
                <textarea
                    readOnly
                    value={
                        form.interpretation
                    }
                    style={
                        styles.textarea
                    }
                />
            </div>

            {/* ==================================================
                IMPRESSION
               ================================================== */}

            <div
                style={
                    styles.sectionTitle
                }
            >
                Impression
            </div>

            <div
                style={
                    styles.reportBox
                }
            >
                <textarea
                    readOnly
                    value={
                        form.impression
                    }
                    style={
                        styles.textarea
                    }
                />
            </div>

            {/* ==================================================
                SCIENTIST REMARK
               ================================================== */}

            <div
                style={
                    styles.sectionTitle
                }
            >
                Scientist Remark
            </div>

            <div
                style={
                    styles.reportBox
                }
            >
                <textarea
                    value={
                        form.remark
                    }
                    onChange={(e) =>
                        updateField(
                            "remark",
                            e.target.value
                        )
                    }
                    placeholder="Enter scientist remark..."
                    style={
                        styles.remarkTextarea
                    }
                />
            </div>

            {/* ==================================================
                VALIDATION MESSAGE
               ================================================== */}

            {validationMessage && (
                <div
                    role="alert"
                    style={
                        styles.validationBox
                    }
                >
                    {validationMessage}
                </div>
            )}

            {/* ==================================================
                SAVE RESULT
                --------------------------------------------------
                IMPORTANT:
                The special form does NOT write to Supabase.

                onSave(finalForm) is delegated to the parent
                LaboratoryResultEntry.jsx.
               ================================================== */}

            {!readOnly && !disabled && (
            <div
                style={
                    styles.saveArea
                }
            >
                {saving && (
                    <span
                        style={
                            styles.saveStatus
                        }
                    >
                        Saving laboratory result...
                    </span>
                )}

                <button
                    type="button"
                    disabled={
                        saving
                    }
                    onClick={
                        handleSave
                    }
                    style={
                        styles.saveButton
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save Result"}
                </button>
            </div>
            )}
        </div>
    );
}