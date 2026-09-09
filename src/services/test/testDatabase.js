/* ==========================================================
   PEFA LAB
   TEST DATABASE SERVICE
   ----------------------------------------------------------
   FILE:
       src/services/test/testDatabase.js

   PURPOSE
   ----------------------------------------------------------
   Database-only access for master_tests.

   RESPONSIBILITIES
   ----------------------------------------------------------
   1. Fetch a master test by ID.
   2. Fetch tests by exact/normalized name.
   3. Resolve panel records.
   4. Resolve panel children.
   5. Resolve metadata required by result entry.

   IMPORTANT
   ----------------------------------------------------------
   This file does NOT decide whether AST is an LFT panel.

   Panel-name logic belongs to:

       panelResolver.js

   Name normalization belongs to:

       testNormalization.js

   This file only talks to Supabase and returns database
   records.

   NO React
   NO JSX
   NO result saving
   NO result grouping
   NO result dashboard logic
========================================================== */

import { supabase } from "../../lib/supabase";

import {
    normalizeTestName,
    getCanonicalTestName,
    getCanonicalPanelName,
} from "./testNormalization";

import {
    resolvePanelName,
} from "./panelResolver";


/* ==========================================================
   CONSTANTS
========================================================== */

const MASTER_TESTS_TABLE = "master_tests";


/* ==========================================================
   SAFE ERROR MESSAGE
========================================================== */

function getErrorMessage(
    error
) {

    if (!error) {
        return "";
    }

    return (
        error?.message ||
        error?.details ||
        error?.hint ||
        String(error)
    );

}


/* ==========================================================
   SAFE OBJECT
========================================================== */

function isObject(
    value
) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* ==========================================================
   NORMALIZE DATABASE TEST
   ----------------------------------------------------------
   Preserve the original database fields.

   We only add helper fields.

   IMPORTANT:
   We do NOT change test_name.
========================================================== */

export function normalizeDatabaseTest(
    test
) {

    if (
        !isObject(test)
    ) {
        return null;
    }

    const testName =
        String(
            test.test_name ??
            test.testName ??
            test.name ??
            ""
        ).trim();


    const panelName =
        String(
            test.panel_name ??
            test.panelName ??
            ""
        ).trim();


    return {

        ...test,

        testName,

        canonicalName:
            getCanonicalTestName(
                testName
            ),

        panelName,

        canonicalPanelName:
            getCanonicalPanelName(
                panelName
            ),

    };

}


/* ==========================================================
   GET TEST BY ID
========================================================== */

export async function getTestById(
    id
) {

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {
        return null;
    }


    const {
        data,
        error,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .eq(
            "id",
            id
        )
        .maybeSingle();


    if (error) {

        console.error(
            "[testDatabase] getTestById:",
            error
        );

        throw error;

    }


    return normalizeDatabaseTest(
        data
    );

}


/* ==========================================================
   GET TESTS BY EXACT NAME
   ----------------------------------------------------------
   Uses the database directly.

   This intentionally does not use .single() because duplicate
   historical master-test records can exist and should not
   produce PGRST116.
========================================================== */

export async function getTestsByName(
    testName
) {

    const normalized =
        normalizeTestName(
            testName
        );


    if (!normalized) {
        return [];
    }


    const {
        data,
        error,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .ilike(
            "test_name",
            String(testName).trim()
        );


    if (error) {

        console.error(
            "[testDatabase] getTestsByName:",
            error
        );

        throw error;

    }


    return (
        Array.isArray(data)
            ? data
            : []
    )
        .map(
            normalizeDatabaseTest
        )
        .filter(Boolean);

}


/* ==========================================================
   GET TEST BY NAME
   ----------------------------------------------------------
   Returns the best available database match.

   IMPORTANT:
   This function does NOT convert a child into a panel.

   AST remains AST.
   eGFR remains eGFR.
========================================================== */

export async function getTestByName(
    testName
) {

    const rawName =
        String(
            testName ?? ""
        ).trim();


    if (!rawName) {
        return null;
    }


    /*
     * ------------------------------------------------------
     * FIRST: exact database name
     * ------------------------------------------------------
     */

    const exact =
        await getTestsByName(
            rawName
        );


    if (
        exact.length === 1
    ) {
        return exact[0];
    }


    if (
        exact.length > 1
    ) {

        /*
         * Prefer active records.
         */

        const active =
            exact.find(
                (test) =>
                    String(
                        test?.active_status ??
                        ""
                    ).toLowerCase() ===
                    "active"
            );


        if (active) {
            return active;
        }


        /*
         * Otherwise use the first database record.
         */

        return exact[0];

    }


    /*
     * ------------------------------------------------------
     * SECOND: canonical-name search
     * ------------------------------------------------------
     *
     * Example:
     *
     * LFT
     * -> liver function test
     *
     * AST
     * -> ast
     *
     * eGFR
     * -> egfr
     */

    const canonical =
        getCanonicalTestName(
            rawName
        );


    if (
        !canonical ||
        canonical ===
            normalizeTestName(
                rawName
            )
    ) {

        return null;

    }


    const canonicalMatches =
        await getTestsByName(
            canonical
        );


    if (
        canonicalMatches.length === 0
    ) {
        return null;
    }


    if (
        canonicalMatches.length === 1
    ) {
        return canonicalMatches[0];
    }


    const active =
        canonicalMatches.find(
            (test) =>
                String(
                    test?.active_status ??
                    ""
                ).toLowerCase() ===
                "active"
        );


    return (
        active ||
        canonicalMatches[0]
    );

}


/* ==========================================================
   GET TESTS BY PANEL NAME
   ----------------------------------------------------------
   Uses panel_name as the authoritative relationship.

   Example:

       panel_name = "Liver Function Test"

   may return:

       AST
       ALT
       ALP
       GGT
       etc.

   This is the critical function for preventing the previous
   LFT -> AST and RFT -> eGFR problem.
========================================================== */

export async function getTestsByPanelName(
    panelName
) {

    const canonicalPanel =
        getCanonicalPanelName(
            panelName
        );


    if (!canonicalPanel) {
        return [];
    }


    const {
        data,
        error,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .ilike(
            "panel_name",
            canonicalPanel
        );


    if (error) {

        console.error(
            "[testDatabase] getTestsByPanelName:",
            error
        );

        throw error;

    }


    return (
        Array.isArray(data)
            ? data
            : []
    )
        .map(
            normalizeDatabaseTest
        )
        .filter(Boolean);

}


/* ==========================================================
   GET TESTS BY RAW PANEL NAME
   ----------------------------------------------------------
   Some existing databases may contain:

       LFT

   while others contain:

       Liver Function Test

   Try the supplied value first, then canonical panel name.
========================================================== */

export async function getPanelChildrenByName(
    panelName
) {

    const raw =
        String(
            panelName ?? ""
        ).trim();


    if (!raw) {
        return [];
    }


    /*
     * ------------------------------------------------------
     * FIRST QUERY
     * ------------------------------------------------------
     */

    const {
        data: firstData,
        error: firstError,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .ilike(
            "panel_name",
            raw
        );


    if (firstError) {

        console.error(
            "[testDatabase] getPanelChildrenByName:",
            firstError
        );

        throw firstError;

    }


    const firstResults =
        (
            Array.isArray(firstData)
                ? firstData
                : []
        )
            .map(
                normalizeDatabaseTest
            )
            .filter(Boolean);


    if (
        firstResults.length > 0
    ) {
        return firstResults;
    }


    /*
     * ------------------------------------------------------
     * SECOND QUERY
     * ------------------------------------------------------
     */

    const canonical =
        getCanonicalPanelName(
            raw
        );


    if (
        !canonical ||
        normalizeTestName(raw) ===
            normalizeTestName(canonical)
    ) {
        return [];
    }


    const {
        data: canonicalData,
        error: canonicalError,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .ilike(
            "panel_name",
            canonical
        );


    if (canonicalError) {

        console.error(
            "[testDatabase] canonical panel lookup:",
            canonicalError
        );

        throw canonicalError;

    }


    return (
        Array.isArray(
            canonicalData
        )
            ? canonicalData
            : []
    )
        .map(
            normalizeDatabaseTest
        )
        .filter(Boolean);

}


/* ==========================================================
   GET PANEL MASTER RECORD
   ----------------------------------------------------------
   Some databases have a parent record where panel_name and
   test_name identify the panel.

   We search by canonical panel name.
========================================================== */

export async function getPanelMaster(
    panelName
) {

    const canonical =
        getCanonicalPanelName(
            panelName
        );


    if (!canonical) {
        return null;
    }


    /*
     * Try panel_name first.
     */

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
            canonical
        )
        .limit(1);


    if (panelError) {

        console.error(
            "[testDatabase] getPanelMaster:",
            panelError
        );

        throw panelError;

    }


    if (
        Array.isArray(panelData) &&
        panelData.length > 0
    ) {

        return normalizeDatabaseTest(
            panelData[0]
        );

    }


    /*
     * Try test_name as parent name.
     */

    const {
        data: testData,
        error: testError,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .ilike(
            "test_name",
            canonical
        )
        .limit(1);


    if (testError) {

        console.error(
            "[testDatabase] getPanelMaster test_name:",
            testError
        );

        throw testError;

    }


    if (
        Array.isArray(testData) &&
        testData.length > 0
    ) {

        return normalizeDatabaseTest(
            testData[0]
        );

    }


    return null;

}


/* ==========================================================
   GET PANEL
   ----------------------------------------------------------
   Returns:

       {
           panel,
           children
       }

   The children are fetched using panel_name.

   It does NOT use the first child test as the panel.
========================================================== */

export async function getPanel(
    panelName
) {

    const resolvedPanelName =
        resolvePanelName(
            panelName
        );


    if (!resolvedPanelName) {

        return {

            panel: null,

            children: [],

        };

    }


    const [
        panel,
        children,
    ] = await Promise.all([

        getPanelMaster(
            resolvedPanelName
        ),

        getPanelChildrenByName(
            resolvedPanelName
        ),

    ]);


    return {

        panel,

        children,

    };

}


/* ==========================================================
   GET PANEL PARAMETERS
   ----------------------------------------------------------
   Compatibility helper.

   This is intentionally exported because older parts of
   testService.js / ResultDashboard may already import:

       getPanelParameters()

   The implementation now lives here.
========================================================== */

export async function getPanelParameters(
    panelName
) {

    const result =
        await getPanel(
            panelName
        );


    return Array.isArray(
        result.children
    )
        ? result.children
        : [];

}


/* ==========================================================
   GET MASTER TEST METADATA
   ----------------------------------------------------------
   Used by result-entry forms.

   This function attempts:

       ID
       exact name
       canonical name
========================================================== */

export async function getMasterTest(
    identifier
) {

    if (
        identifier === null ||
        identifier === undefined ||
        identifier === ""
    ) {
        return null;
    }


    /*
     * Numeric/string ID lookup.
     */

    const looksLikeId =
        typeof identifier === "number" ||
        (
            typeof identifier === "string" &&
            /^\d+$/.test(
                identifier.trim()
            )
        );


    if (looksLikeId) {

        const byId =
            await getTestById(
                identifier
            );


        if (byId) {
            return byId;
        }

    }


    /*
     * Name lookup.
     */

    return getTestByName(
        identifier
    );

}


/* ==========================================================
   GET ACTIVE MASTER TESTS
   ----------------------------------------------------------
   Useful for registration/test selectors.
========================================================== */

export async function getActiveMasterTests() {

    const {
        data,
        error,
    } = await supabase
        .from(
            MASTER_TESTS_TABLE
        )
        .select("*")
        .eq(
            "active_status",
            "active"
        )
        .order(
            "department",
            {
                ascending: true,
            }
        )
        .order(
            "test_name",
            {
                ascending: true,
            }
        );


    if (error) {

        console.error(
            "[testDatabase] getActiveMasterTests:",
            error
        );

        throw error;

    }


    return (
        Array.isArray(data)
            ? data
            : []
    )
        .map(
            normalizeDatabaseTest
        )
        .filter(Boolean);

}


/* ==========================================================
   SEARCH MASTER TESTS
========================================================== */

export async function searchMasterTests(
    searchTerm = ""
) {

    const term =
        String(
            searchTerm ?? ""
        ).trim();


    let query =
        supabase
            .from(
                MASTER_TESTS_TABLE
            )
            .select("*");


    if (term) {

        query =
            query.or(
                [
                    `test_name.ilike.%${term}%`,
                    `panel_name.ilike.%${term}%`,
                    `department.ilike.%${term}%`,
                ].join(",")
            );

    }


    const {
        data,
        error,
    } = await query
        .order(
            "department",
            {
                ascending: true,
            }
        )
        .order(
            "test_name",
            {
                ascending: true,
            }
        );


    if (error) {

        console.error(
            "[testDatabase] searchMasterTests:",
            error
        );

        throw error;

    }


    return (
        Array.isArray(data)
            ? data
            : []
    )
        .map(
            normalizeDatabaseTest
        )
        .filter(Boolean);

}


/* ==========================================================
   GET PANEL CHILDREN FROM MASTER TEST ID
   ----------------------------------------------------------
   Convenience helper.

   Given a panel master test ID, retrieve the associated
   children using the panel_name stored on the master record.
========================================================== */

export async function getPanelParametersByTestId(
    testId
) {

    const panel =
        await getTestById(
            testId
        );


    if (!panel) {
        return [];
    }


    const panelName =
        resolvePanelName(
            panel
        );


    if (!panelName) {
        return [];
    }


    return getPanelParameters(
        panelName
    );

}


/* ==========================================================
   RESOLVE DATABASE TEST
   ----------------------------------------------------------
   Unified database lookup.

   It returns BOTH:

       test

   and, when applicable:

       panel
       parameters

   Example:

       LFT

       {
           test: ...,
           panel: ...,
           parameters: [...]
       }

   AST

       {
           test: AST,
           panel: null,
           parameters: []
       }
========================================================== */

export async function resolveDatabaseTest(
    identifier
) {

    const test =
        await getMasterTest(
            identifier
        );


    if (!test) {

        return {

            test: null,

            panel: null,

            parameters: [],

        };

    }


    const panelName =
        resolvePanelName(
            test
        );


    /*
     * ------------------------------------------------------
     * SINGLE TEST
     * ------------------------------------------------------
     */

    if (!panelName) {

        return {

            test,

            panel: null,

            parameters: [],

        };

    }


    /*
     * ------------------------------------------------------
     * PANEL
     * ------------------------------------------------------
     */

    const panel =
        await getPanel(
            panelName
        );


    return {

        test,

        panel:
            panel.panel ||
            test,

        parameters:
            Array.isArray(
                panel.children
            )
                ? panel.children
                : [],

    };

}


/* ==========================================================
   RESOLVE DATABASE TEST BY NAME
========================================================== */

export async function resolveDatabaseTestByName(
    testName
) {

    return resolveDatabaseTest(
        testName
    );

}


/* ==========================================================
   RESOLVE DATABASE PANEL
========================================================== */

export async function resolveDatabasePanel(
    panelName
) {

    const resolved =
        await getPanel(
            panelName
        );


    return {

        panel:
            resolved.panel,

        parameters:
            resolved.children,

    };

}


/* ==========================================================
   SAFE DATABASE OPERATION
   ----------------------------------------------------------
   Useful for UI/service code where a failed lookup should
   return an empty result instead of crashing the dashboard.

   IMPORTANT:
   This does not hide the original error from the console.
========================================================== */

export async function safeGetPanelParameters(
    panelName
) {

    try {

        return await getPanelParameters(
            panelName
        );

    } catch (error) {

        console.error(
            "[testDatabase] safeGetPanelParameters:",
            getErrorMessage(
                error
            )
        );

        return [];

    }

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

const testDatabase = {

    normalizeDatabaseTest,

    getTestById,

    getTestsByName,

    getTestByName,

    getTestsByPanelName,

    getPanelChildrenByName,

    getPanelMaster,

    getPanel,

    getPanelParameters,

    getMasterTest,

    getActiveMasterTests,

    searchMasterTests,

    getPanelParametersByTestId,

    resolveDatabaseTest,

    resolveDatabaseTestByName,

    resolveDatabasePanel,

    safeGetPanelParameters,

};


export default testDatabase;