/* ==========================================================
   PEFA LAB
   TEST METADATA SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Centralize extraction and normalization of test metadata.

   RESPONSIBILITIES
   ----------------------------------------------------------
   1. Extract test names.
   2. Extract panel names.
   3. Extract IDs.
   4. Extract units.
   5. Extract reference ranges.
   6. Extract result types.
   7. Normalize panel-child parameter records.
   8. Preserve database metadata without changing meaning.

   IMPORTANT
   ----------------------------------------------------------
   This file DOES NOT decide whether a test is a panel.

   Panel resolution belongs to:

       panelResolver.js

   Name normalization belongs to:

       testNormalization.js

   Supabase/database access belongs to:

       testService.js

========================================================== */


/* ==========================================================
   SAFE VALUE HELPERS
========================================================== */

export function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();

}


/* ==========================================================
   FIRST NON-EMPTY VALUE
========================================================== */

export function firstValue(
    ...values
) {

    for (
        const value of values
    ) {

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            return value;
        }

    }

    return "";

}


/* ==========================================================
   TEST ID
========================================================== */

export function getTestId(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return null;
    }

    return firstValue(

        test.master_test_id,

        test.masterTestId,

        test.test_id,

        test.testId,

        test.id

    );

}


/* ==========================================================
   TEST NAME
========================================================== */

export function getTestName(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.test_name,

            test.testName,

            test.name,

            test.parameter_name,

            test.parameter,

            test.component_name,

            test.componentName,

            test.title,

            test.label

        )
    );

}


/* ==========================================================
   PANEL NAME
========================================================== */

export function getPanelName(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.panel_name,

            test.panelName,

            test.parent_panel,

            test.parentPanel,

            test.panel_title,

            test.panelTitle,

            test.parent_test,

            test.parentTest

        )
    );

}


/* ==========================================================
   DEPARTMENT
========================================================== */

export function getDepartment(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.department,

            test.department_name,

            test.departmentName

        )
    );

}


/* ==========================================================
   UNIT
========================================================== */

export function getUnit(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.unit,

            test.result_unit,

            test.resultUnit

        )
    );

}


/* ==========================================================
   RESULT TYPE
========================================================== */

export function getResultType(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.result_type,

            test.resultType,

            test.type

        )
    );

}


/* ==========================================================
   REFERENCE VALUE
========================================================== */

export function getReferenceValue(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }

    return safeString(
        firstValue(

            test.reference_value,

            test.referenceValue,

            test.reference,

            test.reference_range,

            test.referenceRange

        )
    );

}


/* ==========================================================
   REFERENCE RANGE
========================================================== */

export function getReferenceRange(
    test = {},
    patient = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return "";
    }


    const age =
        parseFloat(
            String(
                patient?.age ??
                patient?.patient_age ??
                patient?.age_years ??
                ""
            )
                .replace(
                    /years?/gi,
                    ""
                )
                .trim()
        );


    const sex =
        safeString(
            patient?.sex ??
            patient?.gender ??
            patient?.patient_sex ??
            ""
        ).toLowerCase();


    /* ======================================================
       CHILD
    ====================================================== */

    if (
        Number.isFinite(age) &&
        age > 0 &&
        age < 18
    ) {

        const child =
            firstValue(

                test.child_range,

                test.childRange

            );

        if (
            safeString(child)
        ) {
            return safeString(child);
        }

    }


    /* ======================================================
       ELDERLY
    ====================================================== */

    if (
        Number.isFinite(age) &&
        age >= 65
    ) {

        const elderly =
            firstValue(

                test.elderly_range,

                test.elderlyRange

            );

        if (
            safeString(elderly)
        ) {
            return safeString(elderly);
        }

    }


    /* ======================================================
       FEMALE
    ====================================================== */

    if (
        sex === "female" ||
        sex === "f"
    ) {

        const female =
            firstValue(

                test.female_range,

                test.femaleRange

            );

        if (
            safeString(female)
        ) {
            return safeString(female);
        }

    }


    /* ======================================================
       MALE
    ====================================================== */

    if (
        sex === "male" ||
        sex === "m"
    ) {

        const male =
            firstValue(

                test.male_range,

                test.maleRange

            );

        if (
            safeString(male)
        ) {
            return safeString(male);
        }

    }


    /* ======================================================
       GENERIC REFERENCE RANGE
    ====================================================== */

    const genericRange =
        firstValue(

            test.reference_range,

            test.referenceRange,

            test.reference_value,

            test.referenceValue,

            test.reference

        );


    return safeString(
        genericRange
    );

}


/* ==========================================================
   NORMAL RANGE
========================================================== */

export function getNormalRange(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return {
            low: null,
            high: null,
        };
    }


    return {

        low:
            firstValue(

                test.normal_low,

                test.normalLow

            ),

        high:
            firstValue(

                test.normal_high,

                test.normalHigh

            ),

    };

}


/* ==========================================================
   CRITICAL RANGE
========================================================== */

export function getCriticalRange(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return {
            low: null,
            high: null,
        };
    }


    return {

        low:
            firstValue(

                test.critical_low,

                test.criticalLow

            ),

        high:
            firstValue(

                test.critical_high,

                test.criticalHigh

            ),

    };

}


/* ==========================================================
   DISPLAY ORDER
========================================================== */

export function getDisplayOrder(
    test = {},
    fallback = 999999
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return fallback;
    }


    const value =
        firstValue(

            test.display_order,

            test.displayOrder,

            test.sort_order,

            test.sortOrder,

            test.position,

            fallback

        );


    const numeric =
        Number(value);


    return Number.isFinite(
        numeric
    )
        ? numeric
        : fallback;

}


/* ==========================================================
   ACTIVE STATUS
========================================================== */

export function isActiveTest(
    test = {}
) {

    if (
        !test ||
        typeof test !== "object"
    ) {
        return false;
    }


    if (
        test.active_status === undefined &&
        test.activeStatus === undefined &&
        test.active === undefined
    ) {

        /*
         * If no active flag exists, assume the metadata
         * record is usable.
         */

        return true;

    }


    const value =
        firstValue(

            test.active_status,

            test.activeStatus,

            test.active

        );


    if (
        typeof value === "boolean"
    ) {
        return value;
    }


    const normalized =
        safeString(
            value
        ).toLowerCase();


    return (

        normalized === "active" ||

        normalized === "true" ||

        normalized === "1" ||

        normalized === "yes"

    );

}


/* ==========================================================
   PARAMETER NAME
========================================================== */

export function getParameterName(
    parameter = {}
) {

    return getTestName(
        parameter
    );

}


/* ==========================================================
   NORMALIZE PARAMETER
   ----------------------------------------------------------
   This creates the consistent structure expected by:

      CBCPanel
      ResultTemplateRenderer
      ResultDashboard
      ResultEntryModal
      resultService
========================================================== */

export function normalizeParameter(
    parameter = {},
    patient = {},
    index = 0
) {

    if (
        !parameter ||
        typeof parameter !== "object"
    ) {

        return {

            id:
                `parameter-${index}`,

            testId:
                null,

            parameter:
                "",

            test_name:
                "",

            panel_name:
                "",

            department:
                "",

            unit:
                "",

            result_type:
                "",

            reference_range:
                "",

            male_range:
                "",

            female_range:
                "",

            child_range:
                "",

            elderly_range:
                "",

            normal_low:
                "",

            normal_high:
                "",

            critical_low:
                "",

            critical_high:
                "",

            display_order:
                index + 1,

            original:
                parameter,

        };

    }


    const id =
        getTestId(
            parameter
        );


    const parameterName =
        getParameterName(
            parameter
        );


    const panelName =
        getPanelName(
            parameter
        );


    const referenceRange =
        getReferenceRange(
            parameter,
            patient
        );


    const normalRange =
        getNormalRange(
            parameter
        );


    const criticalRange =
        getCriticalRange(
            parameter
        );


    return {

        /*
         * Preserve every original database field.
         */
        ...parameter,


        /*
         * Standard identifiers.
         */
        id:
            id ??
            `parameter-${index}`,

        testId:
            id ?? null,

        master_test_id:
            parameter.master_test_id ??
            id ??
            null,

        test_id:
            parameter.test_id ??
            id ??
            null,


        /*
         * Standard names.
         */
        parameter:
            parameterName,

        test_name:
            safeString(
                parameter.test_name ??
                parameterName
            ),

        panel_name:
            panelName,


        /*
         * Department.
         */
        department:
            getDepartment(
                parameter
            ),


        /*
         * Result metadata.
         */
        unit:
            getUnit(
                parameter
            ),

        result_type:
            getResultType(
                parameter
            ),


        /*
         * Patient-specific reference.
         */
        reference_range:
            referenceRange,


        /*
         * Preserve explicit reference fields.
         */
        male_range:
            safeString(
                parameter.male_range ??
                parameter.maleRange ??
                ""
            ),

        female_range:
            safeString(
                parameter.female_range ??
                parameter.femaleRange ??
                ""
            ),

        child_range:
            safeString(
                parameter.child_range ??
                parameter.childRange ??
                ""
            ),

        elderly_range:
            safeString(
                parameter.elderly_range ??
                parameter.elderlyRange ??
                ""
            ),


        /*
         * Normal limits.
         */
        normal_low:
            normalRange.low,

        normal_high:
            normalRange.high,


        /*
         * Critical limits.
         */
        critical_low:
            criticalRange.low,

        critical_high:
            criticalRange.high,


        /*
         * Display order.
         */
        display_order:
            getDisplayOrder(
                parameter,
                index + 1
            ),

    };

}


/* ==========================================================
   EXTRACT PARAMETER ARRAY
   ----------------------------------------------------------
   Supports the structures currently found in the project.
========================================================== */

export function extractParameters(
    test = {}
) {

    if (
        Array.isArray(test)
    ) {
        return test;
    }


    if (
        !test ||
        typeof test !== "object"
    ) {
        return [];
    }


    const candidates = [

        test.parameters,

        test.panelTests,

        test.panel_tests,

        test.testParameters,

        test.test_parameters,

        test.children,

        test.childTests,

        test.child_tests,

        test.items,

        test.rows,

        test.tests,

        test.defaultParameters,

        test.default_parameters,

    ];


    for (
        const candidate of candidates
    ) {

        if (
            Array.isArray(candidate)
        ) {

            return candidate;

        }

    }


    return [];

}


/* ==========================================================
   NORMALIZE PARAMETER ARRAY
========================================================== */

export function normalizeParameters(
    test = {},
    patient = {}
) {

    const parameters =
        extractParameters(
            test
        );


    if (
        parameters.length === 0
    ) {
        return [];
    }


    return parameters
        .map(
            (
                parameter,
                index
            ) =>
                normalizeParameter(
                    parameter,
                    patient,
                    index
                )
        )
        .filter(
            (parameter) =>
                Boolean(
                    parameter.parameter
                )
        )
        .sort(
            (
                first,
                second
            ) =>
                Number(
                    first.display_order ??
                    999999
                ) -
                Number(
                    second.display_order ??
                    999999
                )
        );

}


/* ==========================================================
   NORMALIZE TEST METADATA
========================================================== */

export function normalizeTestMetadata(
    test = {},
    patient = {}
) {

    if (
        !test ||
        typeof test !== "object" ||
        Array.isArray(test)
    ) {

        return {

            original:
                test,

            id:
                null,

            test_name:
                "",

            panel_name:
                "",

            department:
                "",

            unit:
                "",

            result_type:
                "",

            reference_range:
                "",

            parameters:
                [],

        };

    }


    return {

        /*
         * Preserve database object.
         */
        ...test,


        /*
         * Standard metadata.
         */
        id:
            getTestId(
                test
            ),

        test_name:
            getTestName(
                test
            ),

        panel_name:
            getPanelName(
                test
            ),

        department:
            getDepartment(
                test
            ),

        unit:
            getUnit(
                test
            ),

        result_type:
            getResultType(
                test
            ),

        reference_range:
            getReferenceRange(
                test,
                patient
            ),


        /*
         * Normalized child parameters.
         */
        parameters:
            normalizeParameters(
                test,
                patient
            ),

    };

}


/* ==========================================================
   FIND PARAMETER BY NAME
========================================================== */

export function findParameter(
    parameters = [],
    name
) {

    if (
        !Array.isArray(parameters) ||
        !name
    ) {
        return null;
    }


    const target =
        safeString(
            name
        ).toLowerCase();


    return (
        parameters.find(
            (parameter) => {

                const candidates = [

                    parameter?.parameter,

                    parameter?.parameter_name,

                    parameter?.test_name,

                    parameter?.testName,

                    parameter?.name,

                ];


                return candidates.some(
                    (candidate) =>
                        safeString(
                            candidate
                        ).toLowerCase() ===
                        target
                );

            }
        ) ||
        null
    );

}


/* ==========================================================
   GET PARAMETER METADATA MAP
   ----------------------------------------------------------
   Useful for CBC and other panel forms.

   Result:

   {
       "Haemoglobin": {
           ...
       },
       "PCV": {
           ...
       }
   }
========================================================== */

export function buildParameterMap(
    parameters = [],
    patient = {}
) {

    if (
        !Array.isArray(parameters)
    ) {
        return {};
    }


    const map = {};


    parameters.forEach(
        (
            parameter,
            index
        ) => {

            const normalized =
                normalizeParameter(
                    parameter,
                    patient,
                    index
                );


            if (
                !normalized.parameter
            ) {
                return;
            }


            map[
                normalized.parameter
            ] = normalized;

        }
    );


    return map;

}


/* ==========================================================
   MERGE PARAMETER METADATA
   ----------------------------------------------------------
   Existing result values are preserved.

   Metadata fills only missing fields.
========================================================== */

export function mergeParameterMetadata(
    existing = {},
    metadata = {}
) {

    const current =
        existing &&
        typeof existing === "object"
            ? existing
            : {};


    const source =
        metadata &&
        typeof metadata === "object"
            ? metadata
            : {};


    return {

        ...current,


        /*
         * Preserve existing result.
         */
        result:
            current.result ??
            current.value ??
            "",


        /*
         * Metadata fields.
         */
        unit:
            current.unit ||
            source.unit ||
            "",

        reference_range:
            current.reference_range ||
            source.reference_range ||
            "",

        master_test_id:
            current.master_test_id ??
            source.master_test_id ??
            source.testId ??
            source.id ??
            null,

        test_id:
            current.test_id ??
            source.test_id ??
            source.testId ??
            source.id ??
            null,

        result_type:
            current.result_type ||
            source.result_type ||
            "",

    };

}


/* ==========================================================
   MERGE RESULT DATA WITH PARAMETERS
   ----------------------------------------------------------
   This is useful before rendering a panel.

   IMPORTANT:
   It does not overwrite entered result values.
========================================================== */

export function hydrateParameterResults(
    parameters = [],
    resultData = {},
    patient = {}
) {

    const safeResults =
        resultData &&
        typeof resultData === "object" &&
        !Array.isArray(resultData)
            ? resultData
            : {};


    const normalizedParameters =
        normalizeParameters(
            {
                parameters,
            },
            patient
        );


    const hydrated = {};


    normalizedParameters.forEach(
        (parameter) => {

            const name =
                parameter.parameter;


            const existing =
                safeResults?.[name] || {};


            hydrated[name] =
                mergeParameterMetadata(
                    existing,
                    parameter
                );

        }
    );


    /*
     * Preserve non-parameter fields such as:

         Interpretation
         Impression
         Scientist Remark

     */
    Object.keys(
        safeResults
    ).forEach(
        (key) => {

            if (
                !hydrated[key]
            ) {

                hydrated[key] =
                    safeResults[key];

            }

        }
    );


    return hydrated;

}


/* ==========================================================
   METADATA VALIDATION
========================================================== */

export function validateParameterMetadata(
    parameter = {}
) {

    const errors = [];


    if (
        !getParameterName(
            parameter
        )
    ) {

        errors.push(
            "Parameter name is missing."
        );

    }


    if (
        parameter.unit === undefined
    ) {

        errors.push(
            "Unit field is missing."
        );

    }


    if (
        parameter.reference_range === undefined &&
        parameter.reference_value === undefined &&
        parameter.referenceValue === undefined
    ) {

        errors.push(
            "Reference metadata is missing."
        );

    }


    return {

        valid:
            errors.length === 0,

        errors,

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

const testMetadata = {

    safeString,

    firstValue,

    getTestId,

    getTestName,

    getPanelName,

    getDepartment,

    getUnit,

    getResultType,

    getReferenceValue,

    getReferenceRange,

    getNormalRange,

    getCriticalRange,

    getDisplayOrder,

    isActiveTest,

    getParameterName,

    normalizeParameter,

    extractParameters,

    normalizeParameters,

    normalizeTestMetadata,

    findParameter,

    buildParameterMap,

    mergeParameterMetadata,

    hydrateParameterResults,

    validateParameterMetadata,

};


export default testMetadata;