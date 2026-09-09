/* ==========================================================
   PEFA LAB
   TEST LOOKUP SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Centralized lookup of tests/panels from `master_tests`.

   RESPONSIBILITIES
   ----------------------------------------------------------
   1. Find a master test by ID.
   2. Find a master test by name.
   3. Search master tests.
   4. Resolve a supplied test object.
   5. Preserve the original database record.
   6. Attach normalized helper information.

   IMPORTANT
   ----------------------------------------------------------
   This file DOES NOT determine panel membership.

   Panel resolution belongs to:

       ./panelResolver.js

   Therefore:

       AST  -> AST
       eGFR -> eGFR

   This service must NEVER convert:

       AST  -> LFT
       eGFR -> RFT

   It only retrieves records from `master_tests`.

   SUPABASE TABLE
   ----------------------------------------------------------
       master_tests
========================================================== */

import { supabase } from "../../lib/supabaseClient";

import {
    normalizeTestName,
    compactTestName,
    getCanonicalTestName,
    normalizeTestObject,
} from "./testNormalization";


/* ==========================================================
   CONSTANTS
========================================================== */

const MASTER_TESTS_TABLE = "master_tests";


/* ==========================================================
   SAFE SUPABASE ERROR
========================================================== */

function formatSupabaseError(
    error,
    context = "master_tests lookup"
) {

    if (!error) {
        return null;
    }

    return {

        message:
            error?.message ||
            `${context} failed.`,

        code:
            error?.code ||
            null,

        details:
            error?.details ||
            null,

        hint:
            error?.hint ||
            null,

    };

}


/* ==========================================================
   SAFE NUMBER CHECK
========================================================== */

export function isNumericId(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return false;
    }

    return /^[0-9]+$/.test(
        String(value).trim()
    );

}


/* ==========================================================
   NORMALIZE ID
========================================================== */

function normalizeId(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    return String(value).trim();

}


/* ==========================================================
   BASIC RECORD VALIDATION
========================================================== */

function isValidTestRecord(
    record
) {

    return Boolean(
        record &&
        typeof record === "object" &&
        !Array.isArray(record) &&
        (
            record.id !== null ||
            record.test_name ||
            record.panel_name
        )
    );

}


/* ==========================================================
   ENRICH TEST RECORD
   ----------------------------------------------------------
   We preserve EVERY original database field.

   Additional fields are only helpers.
========================================================== */

export function enrichTestRecord(
    record = {}
) {

    if (
        !isValidTestRecord(record)
    ) {
        return null;
    }

    const testName =
        record.test_name ??
        record.testName ??
        record.name ??
        "";

    const panelName =
        record.panel_name ??
        record.panelName ??
        "";


    const normalized =
        normalizeTestObject({
            ...record,
            test_name:
                testName,
            panel_name:
                panelName,
        });


    return {

        ...record,

        /* ----------------------------------------------
           Preserve original database identity
        ---------------------------------------------- */

        id:
            record.id ??
            null,

        test_name:
            record.test_name ??
            testName,

        panel_name:
            record.panel_name ??
            panelName,


        /* ----------------------------------------------
           Normalized helper fields
        ---------------------------------------------- */

        normalized_test_name:
            normalizeTestName(
                testName
            ),

        compact_test_name:
            compactTestName(
                testName
            ),

        canonical_test_name:
            getCanonicalTestName(
                testName
            ),

        normalized_panel_name:
            normalizeTestName(
                panelName
            ),

        compact_panel_name:
            compactTestName(
                panelName
            ),

        canonical_panel_name:
            getCanonicalTestName(
                panelName
            ),


        /* ----------------------------------------------
           Normalized object helpers
        ---------------------------------------------- */

        testName:
            normalized.testName,

        canonicalName:
            normalized.canonicalName,

        panelName:
            normalized.panelName,

        panelType:
            normalized.panelType,

        category:
            normalized.category,

    };

}


/* ==========================================================
   GET TEST BY ID
========================================================== */

export async function getTestById(
    testId
) {

    const id =
        normalizeId(testId);


    if (!id) {
        return null;
    }


    const { data, error } =
        await supabase

            .from(
                MASTER_TESTS_TABLE
            )

            .select("*")

            .eq(
                "id",
                id
            )

            .limit(1);


    if (error) {

        console.error(
            "[testLookup] getTestById failed:",
            formatSupabaseError(
                error,
                "getTestById"
            )
        );

        return null;

    }


    const record =
        Array.isArray(data)
            ? data[0]
            : data;


    if (
        !isValidTestRecord(record)
    ) {
        return null;
    }


    return enrichTestRecord(
        record
    );

}


/* ==========================================================
   FIND TESTS BY EXACT NORMALIZED NAME
   ----------------------------------------------------------
   This first tries the most reliable database fields.

   We deliberately avoid:
       .single()

   because duplicate/legacy master test records can exist.

   Returning an array protects the application from PGRST116.
========================================================== */

export async function findTestsByName(
    testName
) {

    const normalized =
        normalizeTestName(
            testName
        );


    if (!normalized) {
        return [];
    }


    const compact =
        compactTestName(
            testName
        );


    /* ======================================================
       FIRST: DIRECT TEST NAME
    ====================================================== */

    const {
        data: directData,
        error: directError,
    } = await supabase

        .from(
            MASTER_TESTS_TABLE
        )

        .select("*")

        .ilike(
            "test_name",
            String(testName).trim()
        )

        .limit(100);


    if (directError) {

        console.warn(
            "[testLookup] direct test_name lookup:",
            formatSupabaseError(
                directError,
                "findTestsByName"
            )
        );

    }


    const directRecords =
        Array.isArray(directData)
            ? directData
            : [];


    /* ======================================================
       SECOND: PANEL NAME
    ====================================================== */

    const {
        data: panelData,
        error: panelError,
    } = await supabase

        .from(
            MASTER_TESTS_TABLE
        )

        .select("*")

        .ilike(
            "panel_name",
            String(testName).trim()
        )

        .limit(100);


    if (panelError) {

        console.warn(
            "[testLookup] panel_name lookup:",
            formatSupabaseError(
                panelError,
                "findTestsByName"
            )
        );

    }


    const panelRecords =
        Array.isArray(panelData)
            ? panelData
            : [];


    /* ======================================================
       COMBINE WITHOUT DUPLICATES
    ====================================================== */

    const combined = [
        ...directRecords,
        ...panelRecords,
    ];


    const unique =
        new Map();


    combined.forEach(
        (record) => {

            if (
                !isValidTestRecord(
                    record
                )
            ) {
                return;
            }


            const key =
                record.id !== null &&
                record.id !== undefined
                    ? String(record.id)
                    : [
                        record.test_name,
                        record.panel_name,
                        record.department,
                    ]
                        .map(
                            (value) =>
                                normalizeTestName(
                                    value
                                )
                        )
                        .join("|");


            if (
                !unique.has(key)
            ) {

                unique.set(
                    key,
                    record
                );

            }

        }
    );


    const records =
        Array.from(
            unique.values()
        );


    /* ======================================================
       ENRICH + FILTER
    ====================================================== */

    return records
        .map(
            enrichTestRecord
        )
        .filter(Boolean)
        .filter(
            (record) => {

                const testCanonical =
                    getCanonicalTestName(
                        record.test_name
                    );

                const panelCanonical =
                    getCanonicalTestName(
                        record.panel_name
                    );


                return (

                    testCanonical ===
                        getCanonicalTestName(
                            testName
                        ) ||

                    panelCanonical ===
                        getCanonicalTestName(
                            testName
                        ) ||

                    record.compact_test_name ===
                        compact ||

                    record.compact_panel_name ===
                        compact

                );

            }
        );

}


/* ==========================================================
   GET TEST BY NAME
   ----------------------------------------------------------
   Returns the BEST MATCH.

   IMPORTANT:
   This function does not turn child tests into panels.

   Example:

       getTestByName("AST")

   searches for AST.

       getTestByName("LFT")

   searches for the LFT/Liver Function Test records.

   It does NOT search for AST when asked for LFT.
========================================================== */

export async function getTestByName(
    testName
) {

    const normalized =
        normalizeTestName(
            testName
        );


    if (!normalized) {
        return null;
    }


    const records =
        await findTestsByName(
            testName
        );


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {
        return null;
    }


    const canonical =
        getCanonicalTestName(
            testName
        );


    /* ======================================================
       PRIORITY 1
       EXACT CANONICAL TEST NAME
    ====================================================== */

    const exactTest =
        records.find(
            (record) =>
                getCanonicalTestName(
                    record.test_name
                ) === canonical
        );


    if (exactTest) {
        return exactTest;
    }


    /* ======================================================
       PRIORITY 2
       EXACT CANONICAL PANEL NAME
    ====================================================== */

    const exactPanel =
        records.find(
            (record) =>
                getCanonicalTestName(
                    record.panel_name
                ) === canonical
        );


    if (exactPanel) {
        return exactPanel;
    }


    /* ======================================================
       PRIORITY 3
       EXACT NORMALIZED NAME
    ====================================================== */

    const normalizedMatch =
        records.find(
            (record) =>
                normalizeTestName(
                    record.test_name
                ) === normalized
        );


    if (normalizedMatch) {
        return normalizedMatch;
    }


    const normalizedPanelMatch =
        records.find(
            (record) =>
                normalizeTestName(
                    record.panel_name
                ) === normalized
        );


    if (
        normalizedPanelMatch
    ) {
        return normalizedPanelMatch;
    }


    /* ======================================================
       FALLBACK
    ====================================================== */

    return records[0] || null;

}


/* ==========================================================
   SEARCH MASTER TESTS
   ----------------------------------------------------------
   General search used by registration/test selectors.

   Searches:
       test_name
       panel_name
       department
========================================================== */

export async function searchTests(
    searchTerm = "",
    options = {}
) {

    const term =
        String(
            searchTerm ?? ""
        ).trim();


    const limit =
        Number(
            options?.limit
        ) > 0
            ? Number(
                options.limit
            )
            : 100;


    let query =
        supabase

            .from(
                MASTER_TESTS_TABLE
            )

            .select("*");


    /* ======================================================
       SEARCH FILTER
    ====================================================== */

    if (term) {

        const escaped =
            term.replace(
                /[%_,]/g,
                ""
            );


        query =
            query.or(
                [
                    `test_name.ilike.%${escaped}%`,
                    `panel_name.ilike.%${escaped}%`,
                    `department.ilike.%${escaped}%`,
                ].join(",")
            );

    }


    /* ======================================================
       OPTIONAL ACTIVE FILTER
    ====================================================== */

    if (
        options?.activeOnly
    ) {

        query =
            query.eq(
                "active_status",
                true
            );

    }


    /* ======================================================
       OPTIONAL DEPARTMENT
    ====================================================== */

    if (
        options?.department
    ) {

        query =
            query.eq(
                "department",
                options.department
            );

    }


    /* ======================================================
       LIMIT
    ====================================================== */

    query =
        query.limit(
            limit
        );


    const {
        data,
        error,
    } =
        await query;


    if (error) {

        console.error(
            "[testLookup] searchTests failed:",
            formatSupabaseError(
                error,
                "searchTests"
            )
        );

        return [];

    }


    return (
        Array.isArray(data)
            ? data
            : []
    )
        .map(
            enrichTestRecord
        )
        .filter(Boolean);

}


/* ==========================================================
   GET ALL ACTIVE TESTS
========================================================== */

export async function getActiveTests(
    options = {}
) {

    return searchTests(
        "",
        {
            ...options,
            activeOnly: true,
        }
    );

}


/* ==========================================================
   GET TESTS BY DEPARTMENT
========================================================== */

export async function getTestsByDepartment(
    department,
    options = {}
) {

    const value =
        String(
            department ?? ""
        ).trim();


    if (!value) {
        return [];
    }


    return searchTests(
        "",
        {
            ...options,
            department: value,
        }
    );

}


/* ==========================================================
   RESOLVE SUPPLIED TEST
   ----------------------------------------------------------
   This is intentionally conservative.

   It checks the supplied object in this order:

       1. ID
       2. test_name
       3. panel_name

   It does NOT infer a parent panel from a child.
========================================================== */

export async function resolveTest(
    test
) {

    if (
        test === null ||
        test === undefined
    ) {
        return null;
    }


    /* ======================================================
       STRING / NUMBER
    ====================================================== */

    if (
        typeof test === "string" ||
        typeof test === "number"
    ) {

        const value =
            String(test).trim();


        if (
            isNumericId(value)
        ) {

            const byId =
                await getTestById(
                    value
                );


            if (byId) {
                return byId;
            }

        }


        return getTestByName(
            value
        );

    }


    /* ======================================================
       OBJECT
    ====================================================== */

    if (
        typeof test !== "object" ||
        Array.isArray(test)
    ) {
        return null;
    }


    /* ======================================================
       ID FIRST
    ====================================================== */

    const testId =
        test.id ??
        test.test_id ??
        test.master_test_id ??
        test.masterTestId ??
        null;


    if (
        isNumericId(testId)
    ) {

        const byId =
            await getTestById(
                testId
            );


        if (byId) {

            return {

                ...byId,

                /* Preserve useful caller metadata */
                ...test,

                /* Database test identity wins */
                id:
                    byId.id,

                test_name:
                    byId.test_name,

                panel_name:
                    byId.panel_name,

            };

        }

    }


    /* ======================================================
       TEST NAME
    ====================================================== */

    const testName =
        test.test_name ??
        test.testName ??
        test.name ??
        test.parameter_name ??
        test.parameter ??
        "";


    if (
        String(testName).trim()
    ) {

        const byName =
            await getTestByName(
                testName
            );


        if (byName) {

            return {

                ...byName,

                ...test,

                id:
                    byName.id,

                test_name:
                    byName.test_name ??
                    testName,

                panel_name:
                    byName.panel_name ??
                    test.panel_name ??
                    null,

            };

        }

    }


    /* ======================================================
       PANEL NAME
    ====================================================== */

    const panelName =
        test.panel_name ??
        test.panelName ??
        "";


    if (
        String(panelName).trim()
    ) {

        const byPanel =
            await getTestByName(
                panelName
            );


        if (byPanel) {

            return {

                ...byPanel,

                ...test,

                id:
                    byPanel.id,

                test_name:
                    byPanel.test_name,

                panel_name:
                    byPanel.panel_name ??
                    panelName,

            };

        }

    }


    /* ======================================================
       LAST RESORT
       ------------------------------------------------------
       Return normalized local object rather than throwing.
    ====================================================== */

    return enrichTestRecord(
        test
    );

}


/* ==========================================================
   RESOLVE MANY TESTS
========================================================== */

export async function resolveTests(
    tests = []
) {

    if (
        !Array.isArray(tests) ||
        tests.length === 0
    ) {
        return [];
    }


    const resolved = [];


    for (
        const test of tests
    ) {

        try {

            const result =
                await resolveTest(
                    test
                );


            if (result) {

                resolved.push(
                    result
                );

            }

        } catch (error) {

            console.warn(
                "[testLookup] Failed to resolve test:",
                test,
                error
            );

        }

    }


    return resolved;

}


/* ==========================================================
   FIND PANEL CHILD RECORDS
   ----------------------------------------------------------
   This function retrieves records whose panel_name matches
   the supplied panel.

   IMPORTANT:

   It does NOT call getTestByName() and it does NOT use a
   child test to infer the panel.

   Example:

       findPanelChildren("LFT")

   searches:

       panel_name = Liver Function Test

   and returns AST, ALT, ALP, GGT, etc. IF those records
   actually exist in master_tests.

   This is exactly what panelResolver will use later.
========================================================== */

export async function findPanelChildren(
    panelName,
    options = {}
) {

    const canonicalPanel =
        getCanonicalTestName(
            panelName
        );


    if (!canonicalPanel) {
        return [];
    }


    const limit =
        Number(
            options?.limit
        ) > 0
            ? Number(
                options.limit
            )
            : 100;


    /* ======================================================
       DIRECT PANEL NAME QUERY
    ====================================================== */

    const {
        data,
        error,
    } =
        await supabase

            .from(
                MASTER_TESTS_TABLE
            )

            .select("*")

            .ilike(
                "panel_name",
                String(
                    panelName
                ).trim()
            )

            .limit(
                limit
            );


    if (error) {

        console.warn(
            "[testLookup] findPanelChildren direct lookup:",
            formatSupabaseError(
                error,
                "findPanelChildren"
            )
        );

    }


    let records =
        Array.isArray(data)
            ? data
            : [];


    /* ======================================================
       IF DIRECT ALIAS DID NOT MATCH,
       SEARCH BY CANONICAL PANEL ALIAS
    ====================================================== */

    if (
        records.length === 0 &&
        canonicalPanel !==
            normalizeTestName(
                panelName
            )
    ) {

        const {
            data: aliasData,
            error: aliasError,
        } =
            await supabase

                .from(
                    MASTER_TESTS_TABLE
                )

                .select("*")

                .ilike(
                    "panel_name",
                    canonicalPanel
                )

                .limit(
                    limit
                );


        if (aliasError) {

            console.warn(
                "[testLookup] findPanelChildren alias lookup:",
                formatSupabaseError(
                    aliasError,
                    "findPanelChildren"
                )
            );

        }


        if (
            Array.isArray(aliasData)
        ) {

            records =
                aliasData;

        }

    }


    /* ======================================================
       FINAL FILTER
       ------------------------------------------------------
       We verify the returned panel_name rather than blindly
       trusting the query.

       This prevents an unrelated child test from becoming a
       panel child.
    ====================================================== */

    return records

        .map(
            enrichTestRecord
        )

        .filter(Boolean)

        .filter(
            (record) => {

                const recordPanel =
                    getCanonicalTestName(
                        record.panel_name
                    );


                return (
                    recordPanel ===
                    canonicalPanel
                );

            }
        )

        .sort(
            (a, b) => {

                const orderA =
                    Number(
                        a.display_order ??
                        a.displayOrder ??
                        999999
                    );

                const orderB =
                    Number(
                        b.display_order ??
                        b.displayOrder ??
                        999999
                    );

                return (
                    orderA -
                    orderB
                );

            }
        );

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

const testLookup = {

    isNumericId,

    enrichTestRecord,

    getTestById,

    findTestsByName,

    getTestByName,

    searchTests,

    getActiveTests,

    getTestsByDepartment,

    resolveTest,

    resolveTests,

    findPanelChildren,

};


export default testLookup;