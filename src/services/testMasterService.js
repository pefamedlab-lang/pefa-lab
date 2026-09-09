/* ==========================================================
   PEFA MEDICAL DIAGNOSTIC SERVICES
   TEST MASTER SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Centralized access to master_tests.

   RESPONSIBILITIES:
   1. Fetch master tests.
   2. Resolve a master test by ID.
   3. Resolve a master test by name.
   4. Resolve aliases safely.
   5. Provide department/panel queries.

   IMPORTANT:
   ----------------------------------------------------------
   This file does NOT:
   - group result records
   - create panel children
   - determine ResultDashboard report grouping
   - modify result data
   - replace a panel with one of its children
========================================================== */

import { supabase } from "../lib/supabase";


/* ==========================================================
   NORMALIZE TEXT
========================================================== */

export function normalizeTestText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[()[\]{}]/g, " ")
        .replace(/[-_/]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


/* ==========================================================
   NORMALIZE TEST NAME
========================================================== */

export function normalizeTestName(value) {

    return normalizeTestText(value);

}


/* ==========================================================
   NUMERIC ID
========================================================== */

export function toNumericId(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isInteger(number)
        ? number
        : null;

}


/* ==========================================================
   TEST NAME ALIASES
   ----------------------------------------------------------
   These aliases are deliberately conservative.

   They are used only when resolving a master test by name.

   They MUST NOT convert:
      LFT -> AST
      RFT -> eGFR
      CBC -> Haemoglobin
========================================================== */

const TEST_NAME_ALIASES = {

    /* Liver Function Test */

    "lft":
        "liver function test",

    "liver function":
        "liver function test",

    "liver function tests":
        "liver function test",


    /* Renal Function Test */

    "rft":
        "renal function test",

    "renal function":
        "renal function test",

    "renal function tests":
        "renal function test",


    /* Full Blood Count / CBC */

    "fbc":
        "complete blood count",

    "full blood count":
        "complete blood count",

    "full blood count fbc":
        "complete blood count",


    /* Lipid Profile */

    "flp":
        "lipid profile",

    "lipid profile test":
        "lipid profile",

    "lipid profile tests":
        "lipid profile",

};


/* ==========================================================
   GET ALIAS
========================================================== */

export function getTestNameAlias(value) {

    const normalized =
        normalizeTestName(value);

    return (
        TEST_NAME_ALIASES[normalized] ||
        normalized
    );

}


/* ==========================================================
   MASTER TEST SELECT
========================================================== */

const MASTER_TEST_COLUMNS = "*";


/* ==========================================================
   GET TEST BY ID
   ----------------------------------------------------------
   ID ALWAYS HAS PRIORITY OVER NAME.
========================================================== */

export async function getTestById(
    testId
) {

    const id =
        toNumericId(testId);

    if (id === null) {

        return {
            data: null,
            error: new Error(
                "A valid master test ID is required."
            ),
        };

    }


    const response =
        await supabase
            .from("master_tests")
            .select(
                MASTER_TEST_COLUMNS
            )
            .eq("id", id)
            .maybeSingle();


    if (response.error) {

        console.error(
            "[testMasterService] getTestById failed:",
            response.error
        );

    }


    return response;

}


/* ==========================================================
   GET TEST BY NAME
   ----------------------------------------------------------
   IMPORTANT:
   ----------------------------------------------------------
   We first try exact normalized candidates.

   We do NOT use broad partial matching first because:

       AST
       ALT
       eGFR
       Haemoglobin

   can otherwise accidentally become the "resolved" test
   for a panel.
========================================================== */

export async function getTestByName(
    testName
) {

    const original =
        String(testName ?? "")
            .trim();

    if (!original) {

        return {
            data: null,
            error: new Error(
                "A test name is required."
            ),
        };

    }


    const normalized =
        normalizeTestName(
            original
        );

    const alias =
        getTestNameAlias(
            original
        );


    /* ======================================================
       CANDIDATE NAMES
    ====================================================== */

    const candidates = [
        original,
        normalized,
        alias,
    ]
        .map(
            (value) =>
                String(value ?? "")
                    .trim()
        )
        .filter(Boolean)
        .filter(
            (value, index, array) =>
                array.indexOf(value) === index
        );


    /* ======================================================
       EXACT NAME LOOKUP
    ====================================================== */

    for (
        const candidate
        of candidates
    ) {

        const response =
            await supabase
                .from("master_tests")
                .select(
                    MASTER_TEST_COLUMNS
                )
                .ilike(
                    "test_name",
                    candidate
                )
                .limit(20);


        if (response.error) {

            console.error(
                "[testMasterService] Name lookup failed:",
                {
                    candidate,
                    error:
                        response.error,
                }
            );

            continue;

        }


        const rows =
            Array.isArray(
                response.data
            )
                ? response.data
                : [];


        if (
            rows.length === 0
        ) {
            continue;
        }


        /*
         * Prefer exact normalized match.
         */

        const exact =
            rows.find(
                (row) =>
                    normalizeTestName(
                        row?.test_name
                    ) ===
                    normalizeTestName(
                        candidate
                    )
            );


        if (exact) {

            return {
                data: exact,
                error: null,
            };

        }


        /*
         * If the database has only one matching
         * candidate, it is safe to use it.
         */

        if (
            rows.length === 1
        ) {

            return {
                data: rows[0],
                error: null,
            };

        }

    }


    /* ======================================================
       PANEL NAME FALLBACK
       ------------------------------------------------------
       Some installations store the report name in
       panel_name rather than test_name.

       This lookup is still exact and conservative.
    ====================================================== */

    for (
        const candidate
        of candidates
    ) {

        const response =
            await supabase
                .from("master_tests")
                .select(
                    MASTER_TEST_COLUMNS
                )
                .ilike(
                    "panel_name",
                    candidate
                )
                .limit(20);


        if (response.error) {

            console.error(
                "[testMasterService] Panel-name lookup failed:",
                {
                    candidate,
                    error:
                        response.error,
                }
            );

            continue;

        }


        const rows =
            Array.isArray(
                response.data
            )
                ? response.data
                : [];


        if (
            rows.length === 0
        ) {
            continue;
        }


        const exact =
            rows.find(
                (row) =>
                    normalizeTestName(
                        row?.panel_name
                    ) ===
                    normalizeTestName(
                        candidate
                    )
            );


        if (exact) {

            return {
                data: exact,
                error: null,
            };

        }

    }


    /* ======================================================
       NOT FOUND
    ====================================================== */

    return {
        data: null,
        error: null,
    };

}


/* ==========================================================
   RESOLVE MASTER TEST BY NAME
   ----------------------------------------------------------
   Compatibility alias used by existing code.
========================================================== */

export async function resolveMasterTestByName(
    testName
) {

    return getTestByName(
        testName
    );

}


/* ==========================================================
   GET ALL MASTER TESTS
========================================================== */

export async function getAllTests() {

    return await supabase
        .from("master_tests")
        .select(
            MASTER_TEST_COLUMNS
        )
        .order(
            "test_name",
            {
                ascending: true,
            }
        );

}


/* ==========================================================
   GET TESTS BY DEPARTMENT
========================================================== */

export async function getTestsByDepartment(
    department
) {

    const normalizedDepartment =
        String(
            department ?? ""
        ).trim();


    if (
        !normalizedDepartment
    ) {

        return {
            data: [],
            error: new Error(
                "Department is required."
            ),
        };

    }


    return await supabase
        .from("master_tests")
        .select(
            MASTER_TEST_COLUMNS
        )
        .eq(
            "department",
            normalizedDepartment
        )
        .order(
            "test_name",
            {
                ascending: true,
            }
        );

}


/* ==========================================================
   GET PANELS ONLY
========================================================== */

export async function getPanels() {

    return await supabase
        .from("master_tests")
        .select(
            MASTER_TEST_COLUMNS
        )
        .eq(
            "is_panel",
            true
        )
        .order(
            "test_name",
            {
                ascending: true,
            }
        );

}


/* ==========================================================
   GET PANEL MASTER TEST BY NAME
   ----------------------------------------------------------
   This is intentionally separate from getTestByName().

   It allows panel resolution code to explicitly request
   a PANEL instead of accidentally accepting a child test.
========================================================== */

export async function getPanelByName(
    panelName
) {

    const original =
        String(
            panelName ?? ""
        ).trim();


    if (!original) {

        return {
            data: null,
            error: new Error(
                "A panel name is required."
            ),
        };

    }


    const normalized =
        normalizeTestName(
            original
        );

    const alias =
        getTestNameAlias(
            original
        );


    const candidates = [
        original,
        normalized,
        alias,
    ]
        .filter(Boolean)
        .filter(
            (value, index, array) =>
                array.indexOf(value) === index
        );


    for (
        const candidate
        of candidates
    ) {

        const response =
            await supabase
                .from("master_tests")
                .select(
                    MASTER_TEST_COLUMNS
                )
                .eq(
                    "is_panel",
                    true
                )
                .ilike(
                    "test_name",
                    candidate
                )
                .limit(20);


        if (response.error) {

            console.error(
                "[testMasterService] getPanelByName failed:",
                {
                    candidate,
                    error:
                        response.error,
                }
            );

            continue;

        }


        const rows =
            Array.isArray(
                response.data
            )
                ? response.data
                : [];


        const exact =
            rows.find(
                (row) =>
                    normalizeTestName(
                        row?.test_name
                    ) ===
                    normalizeTestName(
                        candidate
                    )
            );


        if (exact) {

            return {
                data: exact,
                error: null,
            };

        }

    }


    return {
        data: null,
        error: null,
    };

}


/* ==========================================================
   RESOLVE MASTER TEST
   ----------------------------------------------------------
   Accepts:
       ID
       master_test_id
       test_name
       panel_name

   IMPORTANT:
   ----------------------------------------------------------
   Existing master ID is always preferred.

   This prevents:

       LFT -> AST
       RFT -> eGFR
       CBC -> Haemoglobin
========================================================== */

export async function resolveMasterTest(
    test = {}
) {

    const source =
        test &&
        typeof test === "object"
            ? test
            : {};


    /* ======================================================
       1. EXPLICIT MASTER TEST ID
    ====================================================== */

    const explicitMasterId =
        toNumericId(
            source.master_test_id ??
            source.masterTestId ??
            source.master_tests_id
        );


    if (
        explicitMasterId !== null
    ) {

        const response =
            await getTestById(
                explicitMasterId
            );


        if (
            response?.data
        ) {

            return response;

        }

    }


    /* ======================================================
       2. DIRECT ID
    ====================================================== */

    const directId =
        toNumericId(
            source.id
        );


    if (
        directId !== null
    ) {

        const response =
            await getTestById(
                directId
            );


        if (
            response?.data
        ) {

            return response;

        }

    }


    /* ======================================================
       3. PANEL NAME
    ====================================================== */

    const panelName =
        source.panel_name ??
        source.panelName ??
        "";


    if (
        String(
            panelName
        ).trim()
    ) {

        const panel =
            await getPanelByName(
                panelName
            );


        if (
            panel?.data
        ) {

            return panel;

        }

    }


    /* ======================================================
       4. TEST NAME
    ====================================================== */

    const testName =
        source.test_name ??
        source.testName ??
        source.name ??
        "";


    if (
        String(
            testName
        ).trim()
    ) {

        return getTestByName(
            testName
        );

    }


    /* ======================================================
       NOTHING TO RESOLVE
    ====================================================== */

    return {
        data: null,
        error: null,
    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    normalizeTestText,

    normalizeTestName,

    toNumericId,

    getTestNameAlias,

    getTestById,

    getTestByName,

    resolveMasterTestByName,

    getAllTests,

    getTestsByDepartment,

    getPanels,

    getPanelByName,

    resolveMasterTest,

};