import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase";

export default function ChemistryPanelForm({
    test = {},
    patient = {},
    resultData = {},
    setResultData,
}) {
    /* =====================================================
       BASIC DATA
       ===================================================== */

    const panelName = String(
        test?.test_name ||
        test?.panel_name ||
        test?.name ||
        "Chemistry Panel"
    ).trim();

    const suppliedPanelId =
        test?.panel_id ??
        test?.panelId ??
        test?.id ??
        null;

    const patientAge = Number(
        patient?.age ??
        patient?.patient_age ??
        0
    );

    const patientSex = String(
        patient?.sex ??
        patient?.gender ??
        patient?.patient_sex ??
        ""
    ).trim().toLowerCase();

    const patientName =
        patient?.name ||
        patient?.patient_name ||
        patient?.full_name ||
        "Unknown";

    const results =
        resultData &&
        typeof resultData === "object" &&
        !Array.isArray(resultData)
            ? resultData
            : {};

    /* =====================================================
       SAFE PANEL ID

       panel_tests.panel_id is BIGINT.
       Never send a UUID to it.
       ===================================================== */

    const toNumericId = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const text = String(value).trim();

        if (!/^\d+$/.test(text)) {
            return null;
        }

        const number = Number(text);

        return Number.isSafeInteger(number) && number > 0
            ? number
            : null;
    };

    const suppliedNumericPanelId =
        toNumericId(suppliedPanelId);

    /* =====================================================
       DATABASE STATE
       ===================================================== */

    const [resolvedPanelId, setResolvedPanelId] =
        useState(null);

    const [panelRows, setPanelRows] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /* =====================================================
       RESOLVE PANEL ID
       ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const resolvePanel = async () => {
            setLoading(true);
            setError("");

            /* Use supplied numeric ID */
            if (suppliedNumericPanelId !== null) {
                setResolvedPanelId(
                    suppliedNumericPanelId
                );
                return;
            }

            /* Otherwise find panel by name */
            if (!panelName) {
                setResolvedPanelId(null);
                setPanelRows([]);
                setError(
                    "Chemistry panel name is missing."
                );
                setLoading(false);
                return;
            }

            const {
                data,
                error: lookupError,
            } = await supabase
                .from("master_tests")
                .select("id, test_name, is_panel")
                .eq("test_name", panelName)
                .eq("is_panel", true)
                .limit(1)
                .maybeSingle();

            if (cancelled) return;

            if (lookupError) {
                setResolvedPanelId(null);
                setPanelRows([]);
                setError(lookupError.message);
                setLoading(false);
                return;
            }

            const numericId =
                toNumericId(data?.id);

            if (numericId === null) {
                setResolvedPanelId(null);
                setPanelRows([]);
                setError(
                    `Chemistry panel "${panelName}" was not found.`
                );
                setLoading(false);
                return;
            }

            setResolvedPanelId(numericId);
        };

        resolvePanel();

        return () => {
            cancelled = true;
        };
    }, [
        panelName,
        suppliedNumericPanelId,
    ]);

    /* =====================================================
       LOAD PANEL TESTS
       ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadPanel = async () => {
            if (resolvedPanelId === null) {
                setPanelRows([]);
                return;
            }

            setLoading(true);
            setError("");

            const {
                data: panelTests,
                error: panelError,
            } = await supabase
                .from("panel_tests")
                .select(
                    "id, panel_id, test_id, display_order"
                )
                .eq(
                    "panel_id",
                    resolvedPanelId
                )
                .order(
                    "display_order",
                    { ascending: true }
                );

            if (cancelled) return;

            if (panelError) {
                setPanelRows([]);
                setError(panelError.message);
                setLoading(false);
                return;
            }

            if (
                !Array.isArray(panelTests) ||
                panelTests.length === 0
            ) {
                setPanelRows([]);
                setError(
                    `No parameters are configured for "${panelName}".`
                );
                setLoading(false);
                return;
            }

            /* Get valid master test IDs */
            const testIds = panelTests
                .map((row) =>
                    toNumericId(row.test_id)
                )
                .filter(
                    (id) => id !== null
                );

            if (testIds.length === 0) {
                setPanelRows([]);
                setError(
                    "Panel contains no valid test IDs."
                );
                setLoading(false);
                return;
            }

            /* Load test definitions */
            const {
                data: masterTests,
                error: masterError,
            } = await supabase
                .from("master_tests")
                .select(`
                    id,
                    test_name,
                    unit,
                    result_type,
                    result_category,
                    male_range,
                    female_range,
                    child_range,
                    elderly_range,
                    reference_value,
                    critical_low,
                    critical_high,
                    options,
                    decimal_places,
                    specimen,
                    methodology,
                    instrument,
                    template_type,
                    result_template
                `)
                .in("id", testIds);

            if (cancelled) return;

            if (masterError) {
                setPanelRows([]);
                setError(masterError.message);
                setLoading(false);
                return;
            }

            const masterMap = new Map(
                (masterTests || []).map(
                    (item) => [
                        String(item.id),
                        item,
                    ]
                )
            );

            const rows = panelTests
                .map((row) => {
                    const master =
                        masterMap.get(
                            String(row.test_id)
                        );

                    if (!master) {
                        return null;
                    }

                    return {
                        ...master,
                        panel_test_id: row.id,
                        panel_id: row.panel_id,
                        test_id: row.test_id,
                        display_order:
                            row.display_order,
                    };
                })
                .filter(Boolean);

            setPanelRows(rows);
            setError("");
            setLoading(false);
        };

        loadPanel();

        return () => {
            cancelled = true;
        };
    }, [
        resolvedPanelId,
        panelName,
    ]);

    /* =====================================================
       NORMALIZE PARAMETERS
       ===================================================== */

    const parameters = useMemo(() => {
        return panelRows
            .map((row, index) => ({
                id:
                    row.id ??
                    row.test_id ??
                    index,

                panelTestId:
                    row.panel_test_id,

                testId:
                    row.test_id ??
                    row.id,

                name:
                    String(
                        row.test_name || ""
                    ).trim(),

                unit:
                    row.unit || "",

                resultType:
                    row.result_type ||
                    "Numeric",

                resultCategory:
                    row.result_category ||
                    "",

                maleRange:
                    row.male_range || "",

                femaleRange:
                    row.female_range || "",

                childRange:
                    row.child_range || "",

                elderlyRange:
                    row.elderly_range || "",

                referenceValue:
                    row.reference_value || "",

                criticalLow:
                    row.critical_low || "",

                criticalHigh:
                    row.critical_high || "",

                options:
                    row.options || "",

                decimalPlaces:
                    row.decimal_places ?? 0,

                displayOrder:
                    row.display_order ??
                    index + 1,

                specimen:
                    row.specimen || "",

                methodology:
                    row.methodology || "",

                instrument:
                    row.instrument || "",

                templateType:
                    row.template_type || "",

                resultTemplate:
                    row.result_template || "",
            }))
            .filter(
                (parameter) =>
                    parameter.name
            )
            .sort(
                (a, b) =>
                    Number(
                        a.displayOrder
                    ) -
                    Number(
                        b.displayOrder
                    )
            );
    }, [panelRows]);

      /* =====================================================
       PART 2
       REFERENCE RANGES + RESULT HELPERS
       ===================================================== */

    const getReferenceRange = (parameter) => {
        if (
            patientAge > 0 &&
            patientAge < 18 &&
            parameter.childRange
        ) {
            return parameter.childRange;
        }

        if (
            patientAge >= 65 &&
            parameter.elderlyRange
        ) {
            return parameter.elderlyRange;
        }

        if (
            patientSex === "female" &&
            parameter.femaleRange
        ) {
            return parameter.femaleRange;
        }

        if (
            patientSex === "male" &&
            parameter.maleRange
        ) {
            return parameter.maleRange;
        }

        return (
            parameter.maleRange ||
            parameter.femaleRange ||
            parameter.referenceValue ||
            ""
        );
    };

    const parseNumber = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return NaN;
        }

        const number = Number(
            String(value)
                .trim()
                .replace(/,/g, "")
        );

        return Number.isFinite(number)
            ? number
            : NaN;
    };

    const determineFlag = (
        value,
        referenceRange,
        criticalLow = "",
        criticalHigh = ""
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const numericValue =
            parseNumber(value);

        if (Number.isNaN(numericValue)) {
            return "Normal";
        }

        const lowCritical =
            parseNumber(criticalLow);

        const highCritical =
            parseNumber(criticalHigh);

        if (
            !Number.isNaN(lowCritical) &&
            numericValue <= lowCritical
        ) {
            return "Critical Low";
        }

        if (
            !Number.isNaN(highCritical) &&
            numericValue >= highCritical
        ) {
            return "Critical High";
        }

        if (!referenceRange) {
            return "Normal";
        }

        const range = String(
            referenceRange
        )
            .trim()
            .toLowerCase();

        if (
            [
                "normal",
                "variable",
                "calculated",
                "n/a",
                "na",
                "not applicable",
            ].includes(range)
        ) {
            return "Normal";
        }

        if (range.startsWith("<")) {
            const match = range.match(
                /-?\d+(?:\.\d+)?/
            );

            if (!match) {
                return "Normal";
            }

            return numericValue <
                Number(match[0])
                ? "Normal"
                : "High";
        }

        if (range.startsWith(">")) {
            const match = range.match(
                /-?\d+(?:\.\d+)?/
            );

            if (!match) {
                return "Normal";
            }

            return numericValue >
                Number(match[0])
                ? "Normal"
                : "Low";
        }

        const values = range.match(
            /-?\d+(?:\.\d+)?/g
        );

        if (
            !values ||
            values.length < 2
        ) {
            return "Normal";
        }

        const low = Number(values[0]);
        const high = Number(values[1]);

        if (numericValue < low) {
            return "Low";
        }

        if (numericValue > high) {
            return "High";
        }

        return "Normal";
    };

    const getExistingResult = (
        parameterName
    ) => {
        if (
            results[parameterName] !==
            undefined
        ) {
            return (
                results[parameterName] || {}
            );
        }

        const normalizeName = (value) =>
            String(value)
                .trim()
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[()]/g, "")
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");

        const target =
            normalizeName(
                parameterName
            );

        const key = Object.keys(
            results
        ).find(
            (item) =>
                normalizeName(item) ===
                target
        );

        return key
            ? results[key] || {}
            : {};
    };

    const getInputType = (
        parameter
    ) => {
        if (
            String(
                parameter.options || ""
            ).trim()
        ) {
            return "select";
        }

        const type = String(
            parameter.resultType || ""
        ).toLowerCase();

        return type.includes("text") ||
            type.includes("qualitative") ||
            type.includes("select") ||
            type.includes("option") ||
            type.includes("comment")
            ? "text"
            : "number";
    };

    const getOptions = (value) => {
        if (!value) {
            return [];
        }

        return String(value)
            .split(/[,;|/]+/)
            .map((item) =>
                item.trim()
            )
            .filter(Boolean);
    };

    const getFlagClass = (flag) =>
        "flag-" +
        String(flag || "Normal")
            .toLowerCase()
            .replace(/\s+/g, "-");

       /* =====================================================
       PART 3
       RESULT UPDATE + CALCULATIONS
       ===================================================== */

    const updateResult = (
        parameter,
        value,
        referenceRange
    ) => {
        const updated = {
            ...results,

            [parameter.name]: {
                ...(results?.[parameter.name] || {}),

                result: value,

                unit:
                    parameter.unit || "",

                reference_range:
                    referenceRange || "",

                result_type:
                    parameter.resultType ||
                    "Numeric",

                flag:
                    determineFlag(
                        value,
                        referenceRange,
                        parameter.criticalLow,
                        parameter.criticalHigh
                    ),

                decimal_places:
                    parameter.decimalPlaces,

                result_category:
                    parameter.resultCategory || "",

                specimen:
                    parameter.specimen || "",

                methodology:
                    parameter.methodology || "",

                instrument:
                    parameter.instrument || "",
            },
        };

        calculateDerivedResults(updated);

        if (
            typeof setResultData ===
            "function"
        ) {
            setResultData(updated);
        }
    };

    /* =====================================================
       DERIVED CHEMISTRY RESULTS
       ===================================================== */

    const calculateDerivedResults = (
        updated
    ) => {
        const panel =
            panelName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");

        /* =================================================
           LIPID PANEL

           VLDL = Triglycerides / 5
           ================================================= */

        if (
            [
                "lipid_panel",
                "lipid_profile",
                "lipid_profile_flp",
            ].includes(panel)
        ) {
            const triglycerides =
                parseNumber(
                    updated?.Triglycerides
                        ?.result
                );

            if (
                !Number.isNaN(
                    triglycerides
                )
            ) {
                updated.VLDL = {
                    result:
                        formatCalculatedValue(
                            triglycerides / 5,
                            2
                        ),

                    unit: "mg/dL",

                    reference_range:
                        "Calculated",

                    result_type:
                        "Numeric",

                    flag: "Normal",

                    decimal_places: 2,

                    result_category:
                        "Calculated",

                    methodology:
                        "Calculated",
                };
            } else {
                delete updated.VLDL;
            }
        }

        /* =================================================
           LIVER FUNCTION TEST

           Globulin =
           Total Protein - Albumin

           A/G Ratio =
           Albumin / Globulin

           Indirect Bilirubin =
           Total - Direct
           ================================================= */

        if (
            [
                "lft",
                "liver_function_test",
                "liver_function_test_lft",
            ].includes(panel)
        ) {
            const totalProtein =
                parseNumber(
                    updated?.[
                        "Total Protein"
                    ]?.result
                );

            const albumin =
                parseNumber(
                    updated?.Albumin
                        ?.result
                );

            if (
                !Number.isNaN(
                    totalProtein
                ) &&
                !Number.isNaN(
                    albumin
                )
            ) {
                const globulin =
                    totalProtein -
                    albumin;

                if (globulin > 0) {
                    const globulinRange =
                        "2.0 - 3.5";

                    updated.Globulin = {
                        result:
                            formatCalculatedValue(
                                globulin,
                                1
                            ),

                        unit: "g/dL",

                        reference_range:
                            globulinRange,

                        result_type:
                            "Numeric",

                        flag:
                            determineFlag(
                                globulin,
                                globulinRange
                            ),

                        decimal_places: 1,

                        result_category:
                            "Calculated",

                        methodology:
                            "Calculated",
                    };

                    const ratio =
                        albumin /
                        globulin;

                    const ratioRange =
                        "1.0 - 2.2";

                    updated[
                        "Albumin/Globulin Ratio"
                    ] = {
                        result:
                            formatCalculatedValue(
                                ratio,
                                2
                            ),

                        unit: "Ratio",

                        reference_range:
                            ratioRange,

                        result_type:
                            "Numeric",

                        flag:
                            determineFlag(
                                ratio,
                                ratioRange
                            ),

                        decimal_places: 2,

                        result_category:
                            "Calculated",

                        methodology:
                            "Calculated",
                    };
                } else {
                    delete updated.Globulin;

                    delete updated[
                        "Albumin/Globulin Ratio"
                    ];
                }
            } else {
                delete updated.Globulin;

                delete updated[
                    "Albumin/Globulin Ratio"
                ];
            }

            /* ---------------------------------------------
               INDIRECT BILIRUBIN
               --------------------------------------------- */

            const totalBilirubin =
                parseNumber(
                    updated?.[
                        "Bilirubin Total"
                    ]?.result
                );

            const directBilirubin =
                parseNumber(
                    updated?.[
                        "Bilirubin Direct"
                    ]?.result
                );

            if (
                !Number.isNaN(
                    totalBilirubin
                ) &&
                !Number.isNaN(
                    directBilirubin
                )
            ) {
                const indirect =
                    totalBilirubin -
                    directBilirubin;

                const range =
                    "0.2 - 0.9";

                updated[
                    "Bilirubin Indirect"
                ] = {
                    result:
                        formatCalculatedValue(
                            indirect,
                            2
                        ),

                    unit: "mg/dL",

                    reference_range:
                        range,

                    result_type:
                        "Numeric",

                    flag:
                        determineFlag(
                            indirect,
                            range
                        ),

                    decimal_places: 2,

                    result_category:
                        "Calculated",

                    methodology:
                        "Calculated",
                };
            } else {
                delete updated[
                    "Bilirubin Indirect"
                ];
            }
        }
    };

    /* =====================================================
       FORMAT CALCULATED VALUE
       ===================================================== */

    const formatCalculatedValue = (
        value,
        decimalPlaces = 2
    ) => {
        const number =
            parseNumber(value);

        if (
            Number.isNaN(number)
        ) {
            return "";
        }

        return number.toFixed(
            Math.max(
                0,
                Number(
                    decimalPlaces
                ) || 0
            )
        );
    };

    /* =====================================================
       CALCULATED RESULTS TO DISPLAY
       ===================================================== */

    const calculatedNames = [
        "VLDL",
        "Globulin",
        "Albumin/Globulin Ratio",
        "Bilirubin Indirect",
    ];

   const calculatedParameters =
    [
        "VLDL",
        "Globulin",
        "Albumin/Globulin Ratio",
        "Bilirubin Indirect",
    ].filter(
        (name) =>
            results?.[name]?.result !==
            undefined
    );

    /* =====================================================
       PART 3 RENDER
       ===================================================== */

    return (
        <div className="chemistry-panel-form">

            <h3>{panelName}</h3>

            <div className="chemistry-reference-context">
                <strong>Patient:</strong>{" "}
                {patientName}
                {" | "}
                <strong>Age:</strong>{" "}
                {patientAge > 0
                    ? patientAge
                    : "Unknown"}
                {" | "}
                <strong>Sex:</strong>{" "}
                {patientSex
                    ? patientSex
                          .charAt(0)
                          .toUpperCase() +
                      patientSex.slice(1)
                    : "Unknown"}
            </div>

            {loading && (
                <div>
                    Loading panel parameters...
                </div>
            )}

            {!loading && error && (
                <div className="chemistry-panel-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                parameters.length > 0 && (
                    <table className="result-table">

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

                            {parameters.map(
                                (parameter) => {
                                    const existing =
                                        getExistingResult(
                                            parameter.name
                                        );

                                    const referenceRange =
                                        getReferenceRange(
                                            parameter
                                        );

                                    const inputType =
                                        getInputType(
                                            parameter
                                        );

                                    const options =
                                        getOptions(
                                            parameter.options
                                        );

                                    const flag =
                                        existing?.flag ||
                                        determineFlag(
                                            existing?.result,
                                            referenceRange,
                                            parameter.criticalLow,
                                            parameter.criticalHigh
                                        );

                                    const calculated =
                                        String(
                                            parameter.methodology ||
                                            ""
                                        )
                                            .toLowerCase()
                                            .trim() ===
                                        "calculated";

                                    return (
                                        <tr
                                            key={
                                                parameter.panelTestId ||
                                                parameter.id
                                            }
                                        >

                                            <td>
                                                {
                                                    parameter.name
                                                }
                                            </td>

                                            <td>

                                                {inputType ===
                                                "select" ? (
                                                    <select
                                                        value={
                                                            existing?.result ??
                                                            ""
                                                        }
                                                        disabled={
                                                            calculated
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateResult(
                                                                parameter,
                                                                event
                                                                    .target
                                                                    .value,
                                                                referenceRange
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>

                                                        {options.map(
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
                                                                    {
                                                                        option
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={
                                                            inputType
                                                        }
                                                        step={
                                                            inputType ===
                                                            "number"
                                                                ? "any"
                                                                : undefined
                                                        }
                                                        value={
                                                            existing?.result ??
                                                            ""
                                                        }
                                                        disabled={
                                                            calculated
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateResult(
                                                                parameter,
                                                                event
                                                                    .target
                                                                    .value,
                                                                referenceRange
                                                            )
                                                        }
                                                    />
                                                )}

                                            </td>

                                            <td>
                                                {
                                                    parameter.unit
                                                }
                                            </td>

                                            <td>
                                                {
                                                    referenceRange ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={getFlagClass(
                                                        flag
                                                    )}
                                                >
                                                    {flag ||
                                                        "Normal"}
                                                </span>
                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>
                )}

            {calculatedParameters.length >
                0 && (
                <div className="calculated-parameters">

                    <h4>
                        Calculated Parameters
                    </h4>

                    <table className="result-table">

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

                            {calculatedParameters.map(
                                (name) => {
                                    const result =
                                        results[name];

                                    return (
                                        <tr
                                            key={
                                                name
                                            }
                                        >
                                            <td>
                                                {name}
                                            </td>

                                            <td>
                                                {
                                                    result?.result
                                                }
                                            </td>

                                            <td>
                                                {
                                                    result?.unit
                                                }
                                            </td>

                                            <td>
                                                {
                                                    result?.reference_range
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={getFlagClass(
                                                        result?.flag
                                                    )}
                                                >
                                                    {
                                                        result?.flag ||
                                                        "Normal"
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}