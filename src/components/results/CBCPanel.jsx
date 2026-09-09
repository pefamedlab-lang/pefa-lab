import React, { useEffect, useMemo } from "react";

import {
    CBC_REFERENCE_RANGES,
    getCBCReferenceRange,
    getCBCUnit,
    getCanonicalCBCParameter,
    getCBCAgeGroup,
    normalizeCBCSex,
    calculateCBCFlag,
} from "./CBCReferenceRanges";


/* ==========================================================
   CBC PANEL
   PEFA MEDICAL DIAGNOSTIC SERVICES

   STAND-ALONE CBC ENGINE

   IMPORTANT
   ----------------------------------------------------------
   CBC does NOT depend on master_tests for:

   - Parameters
   - Units
   - Reference ranges
   - Age groups
   - Sex-specific ranges
   - Flags

   Patient information supplies only:
   - Age
   - Sex

   Scientist enters ONLY:
   - Result
========================================================== */

export default function CBCPanel({
    test = {},
    patient = {},
    resultData = {},
    setResultData,
}) {


    /* ======================================================
       SAFE RESULT DATA
    ====================================================== */

    const results =
        resultData &&
        typeof resultData === "object" &&
        !Array.isArray(resultData)
            ? resultData
            : {};


    /* ======================================================
       PATIENT AGE
    ====================================================== */

    const patientAge = useMemo(() => {

        const rawAge =
            patient?.age ??
            patient?.patient_age ??
            patient?.age_years ??
            "";

        if (
            typeof rawAge === "number" &&
            Number.isFinite(rawAge)
        ) {
            return rawAge;
        }

        const parsed =
            parseFloat(
                String(rawAge)
                    .replace(/years?/gi, "")
                    .trim()
            );

        return Number.isFinite(parsed)
            ? parsed
            : 0;

    }, [
        patient?.age,
        patient?.patient_age,
        patient?.age_years,
    ]);


    /* ======================================================
       PATIENT SEX
    ====================================================== */

    const patientSex = useMemo(() => {

        return normalizeCBCSex(
            patient?.sex ??
            patient?.gender ??
            patient?.patient_sex ??
            ""
        );

    }, [
        patient?.sex,
        patient?.gender,
        patient?.patient_sex,
    ]);


    /* ======================================================
       AGE GROUP
    ====================================================== */

    const ageGroup = useMemo(
        () =>
            getCBCAgeGroup(
                patientAge
            ),
        [patientAge]
    );


    /* ======================================================
       STAND-ALONE CBC PARAMETERS
       ------------------------------------------------------
       These are controlled by CBCReferenceRanges.js.

       master_tests is NOT consulted.
    ====================================================== */

    const parameters = useMemo(() => {

        return Object.keys(
            CBC_REFERENCE_RANGES
        );

    }, []);


    /* ======================================================
       PARAMETER METADATA
    ====================================================== */

    const parameterMetadata = useMemo(() => {

        return parameters.map(
            (
                parameter,
                index
            ) => {

                const canonical =
                    getCanonicalCBCParameter(
                        parameter
                    );

                const referenceRange =
                    getCBCReferenceRange(
                        canonical,
                        patientAge,
                        patientSex
                    );

                const unit =
                    getCBCUnit(
                        canonical
                    );

                return {

                    parameter:
                        canonical,

                    unit,

                    referenceRange,

                    displayOrder:
                        index + 1,

                };

            }
        );

    }, [
        parameters,
        patientAge,
        patientSex,
    ]);


    /* ======================================================
       UPDATE RESULT
       ------------------------------------------------------
       ONLY RESULT IS EDITABLE.

       Unit:
       automatic

       Reference:
       automatic

       Flag:
       automatic
    ====================================================== */

    const updateParameter = (
        parameter,
        value
    ) => {

        if (
            typeof setResultData !==
            "function"
        ) {
            return;
        }


        const definition =
            parameterMetadata.find(
                (item) =>
                    item.parameter ===
                    parameter
            );


        if (!definition) {
            return;
        }


        const flag =
            calculateCBCFlag(
                value,
                definition.referenceRange
            );


        setResultData(
            (previous) => {

                const current =
                    previous?.[
                        parameter
                    ] || {};


                return {

                    ...previous,

                    [parameter]: {

                        ...current,

                        result:
                            value,

                        unit:
                            definition.unit,

                        reference_range:
                            definition.referenceRange,

                        flag,

                        result_type:
                            "Numeric",

                        age_group:
                            ageGroup,

                        sex:
                            patientSex,

                    },

                };

            }
        );

    };


    /* ======================================================
       RE-CALCULATE FLAGS WHEN PATIENT AGE/SEX CHANGES
       ------------------------------------------------------
       Example:

       Female → Male

       The reference range changes automatically,
       and the existing result is re-evaluated.
    ====================================================== */

    useEffect(() => {

        if (
            typeof setResultData !==
            "function"
        ) {
            return;
        }


        let changed = false;

        const next = {
            ...results,
        };


        parameterMetadata.forEach(
            (definition) => {

                const parameter =
                    definition.parameter;

                const current =
                    results?.[
                        parameter
                    ];


                if (!current) {
                    return;
                }


                const result =
                    current?.result ??
                    "";


                const newFlag =
                    calculateCBCFlag(
                        result,
                        definition.referenceRange
                    );


                const nextValue = {

                    ...current,

                    unit:
                        definition.unit,

                    reference_range:
                        definition.referenceRange,

                    flag:
                        newFlag,

                    age_group:
                        ageGroup,

                    sex:
                        patientSex,

                };


                const different =
                    current?.unit !==
                        nextValue.unit ||

                    current?.reference_range !==
                        nextValue.reference_range ||

                    current?.flag !==
                        nextValue.flag ||

                    current?.age_group !==
                        nextValue.age_group ||

                    current?.sex !==
                        nextValue.sex;


                if (different) {

                    next[parameter] =
                        nextValue;

                    changed = true;

                }

            }
        );


        if (changed) {

            setResultData(
                next
            );

        }

        // Deliberately do not include `results`
        // to avoid an update loop.

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        parameterMetadata,
        ageGroup,
        patientSex,
        setResultData,
    ]);


    /* ======================================================
       TEXT FIELDS
    ====================================================== */

    const updateText = (
        field,
        value
    ) => {

        if (
            typeof setResultData !==
            "function"
        ) {
            return;
        }


        setResultData(
            (previous) => ({

                ...previous,

                [field]:
                    value,

            })
        );

    };


    /* ======================================================
       FLAG CLASS
    ====================================================== */

    const getFlagClass = (
        flag
    ) => {

        return String(
            flag || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    };


    /* ======================================================
       DISPLAY SEX
    ====================================================== */

    const displaySex =
        patientSex
            ? patientSex
                  .charAt(0)
                  .toUpperCase() +
              patientSex.slice(1)
            : "Unknown";


    /* ======================================================
       DISPLAY AGE GROUP
    ====================================================== */

    const displayAgeGroup = {

        child:
            "Child (<18 years)",

        adult:
            "Adult (18–64 years)",

        elderly:
            "Elderly (≥65 years)",

    }[ageGroup] ||
        ageGroup;


    /* ======================================================
       RENDER
    ====================================================== */

    return (

        <div className="cbc-panel">

            <h3>
                Complete Blood Count (CBC)
            </h3>


            {/* ==================================================
                PATIENT REFERENCE CONTEXT
            ================================================== */}

            <div
                className="cbc-reference-context"
                style={{
                    marginBottom: "15px",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    fontSize: "13px",
                }}
            >

                <strong>
                    Reference Group:
                </strong>

                {" "}

                {displayAgeGroup}

                {" | "}

                <strong>
                    Sex:
                </strong>

                {" "}

                {displaySex}

            </div>


            {/* ==================================================
                CBC TABLE
            ================================================== */}

            <table className="result-table">

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

                    {parameterMetadata.map(
                        (item) => {

                            const current =
                                results?.[
                                    item.parameter
                                ] || {};


                            const result =
                                current?.result ??
                                "";


                            const referenceRange =
                                item.referenceRange ||
                                "";


                            const unit =
                                item.unit ||
                                "";


                            const flag =
                                calculateCBCFlag(
                                    result,
                                    referenceRange
                                );


                            return (

                                <tr
                                    key={
                                        item.parameter
                                    }
                                >

                                    {/* PARAMETER */}

                                    <td>

                                        <strong>
                                            {
                                                item.parameter
                                            }
                                        </strong>

                                    </td>


                                    {/* RESULT */}

                                    <td>

                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={
                                                result
                                            }
                                            placeholder="Enter result"
                                            onChange={(
                                                event
                                            ) =>
                                                updateParameter(
                                                    item.parameter,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </td>


                                    {/* UNIT */}

                                    <td>

                                        <span className="cbc-metadata-value">
                                            {
                                                unit ||
                                                "—"
                                            }
                                        </span>

                                    </td>


                                    {/* REFERENCE */}

                                    <td>

                                        <span className="cbc-metadata-value">
                                            {
                                                referenceRange ||
                                                "—"
                                            }
                                        </span>

                                    </td>


                                    {/* FLAG */}

                                    <td>

                                        <span
                                            className={`cbc-auto-flag ${getFlagClass(
                                                flag
                                            )}`}
                                        >
                                            {
                                                flag ||
                                                "—"
                                            }
                                        </span>

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

            <div
                style={{
                    marginTop: 20,
                }}
            >

                <label>

                    <strong>
                        Interpretation
                    </strong>

                </label>

                <textarea
                    rows={3}
                    value={
                        results?.Interpretation ||
                        ""
                    }
                    onChange={(
                        event
                    ) =>
                        updateText(
                            "Interpretation",
                            event.target.value
                        )
                    }
                />

            </div>


            {/* ==================================================
                IMPRESSION
            ================================================== */}

            <div
                style={{
                    marginTop: 15,
                }}
            >

                <label>

                    <strong>
                        Impression
                    </strong>

                </label>

                <textarea
                    rows={3}
                    value={
                        results?.Impression ||
                        ""
                    }
                    onChange={(
                        event
                    ) =>
                        updateText(
                            "Impression",
                            event.target.value
                        )
                    }
                />

            </div>


            {/* ==================================================
                SCIENTIST REMARK
            ================================================== */}

            <div
                style={{
                    marginTop: 15,
                }}
            >

                <label>

                    <strong>
                        Scientist Remark
                    </strong>

                </label>

                <textarea
                    rows={3}
                    value={
                        results?.[
                            "Scientist Remark"
                        ] || ""
                    }
                    onChange={(
                        event
                    ) =>
                        updateText(
                            "Scientist Remark",
                            event.target.value
                        )
                    }
                />

            </div>

        </div>

    );

}