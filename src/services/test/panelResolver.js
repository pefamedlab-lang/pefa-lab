/* ==========================================================
   PEFA LAB
   PANEL RESOLVER
   ----------------------------------------------------------
   FILE:
      src/services/test/panelResolver.js

   PURPOSE
   ----------------------------------------------------------
   Resolve PANEL tests and their CHILD PARAMETERS safely.

   CORE RULE
   ----------------------------------------------------------
   A panel must be resolved from the PANEL itself.

   NEVER infer a panel from one of its children.

   Therefore:

      LFT  -> Liver Function Test + AST + ALT + ALP + GGT...
      RFT  -> Renal Function Test + Urea + Creatinine + eGFR...
      CBC  -> Complete Blood Count + CBC parameters
      FLP  -> Lipid Profile + lipid parameters
      TFT  -> Thyroid Function Test + TFT parameters

   But:

      AST  -> AST
      ALT  -> ALT
      GGT  -> GGT
      eGFR -> eGFR
      Urea -> Urea
      Creatinine -> Creatinine

   must NEVER become:

      AST        -> LFT
      ALT        -> LFT
      GGT        -> LFT
      eGFR       -> RFT
      Urea       -> RFT
      Creatinine -> RFT

   IMPORTANT
   ----------------------------------------------------------
   This module contains:

      - NO React
      - NO result saving
      - NO result grouping
      - NO UI

   Supabase access is isolated here.

   COMPATIBILITY EXPORTS
   ----------------------------------------------------------
   testService.js may import:

      resolvePanelById
      getPanelParameters
      resolvePanel
      resolveTest
      getPanelByName
      getPanelChildren
      ...

   Therefore all supported helpers are explicitly exported.
========================================================== */


/* ==========================================================
   SUPABASE
========================================================== */

import { supabase } from "../../supabase";


/* ==========================================================
   TEST NORMALIZATION
========================================================== */

import {
    normalizeTestName,
    getCanonicalTestName,
    getCanonicalPanelName,
    getPanelType,
    isKnownChildTest,
} from "./testNormalization";


/* ==========================================================
   PANEL DEFINITIONS
   ----------------------------------------------------------
   Fallback definitions only.

   Database remains the primary authority.

   These definitions prevent accidental promotion
   of child tests into panels.
========================================================== */

const PANEL_DEFINITIONS = {

    "liver function test": {

        type: "lft",

        aliases: [
            "lft",
            "liver function",
            "liver function tests",
            "liver function panel",
            "liver profile",
            "liver panel",
        ],

    },


    "renal function test": {

        type: "rft",

        aliases: [
            "rft",
            "renal function",
            "renal function tests",
            "renal function panel",
            "renal profile",
            "renal panel",
            "kidney function",
            "kidney function test",
            "kidney function tests",
        ],

    },


    "complete blood count": {

        type: "cbc",

        aliases: [
            "cbc",
            "full blood count",
            "fbc",
            "full blood examination",
            "complete blood examination",
        ],

    },


    "lipid profile": {

        type: "flp",

        aliases: [
            "flp",
            "lipid profile test",
            "lipid profile panel",
            "fasting lipid profile",
            "lipid panel",
            "cholesterol profile",
        ],

    },


    "thyroid function test": {

        type: "tft",

        aliases: [
            "tft",
            "thyroid function",
            "thyroid function tests",
            "thyroid profile",
            "thyroid panel",
        ],

    },

};


/* ==========================================================
   SAFE ARRAY
========================================================== */

function asArray(value) {

    return Array.isArray(value)
        ? value
        : [];

}


/* ==========================================================
   SAFE OBJECT
========================================================== */

function asObject(value) {

    if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {

        return value;

    }

    return {};

}


/* ==========================================================
   GET RAW TEST NAME
========================================================== */

function getRawTestName(test = {}) {

    if (
        typeof test === "string"
    ) {

        return test;

    }


    const source =
        asObject(test);


    return (
        source.test_name ??
        source.testName ??
        source.name ??
        source.parameter_name ??
        source.parameter ??
        source.panel_name ??
        source.panelName ??
        ""
    );

}


/* ==========================================================
   GET RAW PANEL NAME
========================================================== */

function getRawPanelName(test = {}) {

    if (
        typeof test === "string"
    ) {

        return "";

    }


    const source =
        asObject(test);


    return (
        source.panel_name ??
        source.panelName ??
        source.parent_panel ??
        source.parentPanel ??
        source.parent_panel_name ??
        source.parentPanelName ??
        ""
    );

}


/* ==========================================================
   RESOLVE PANEL NAME
   ----------------------------------------------------------
   CRITICAL RULE:

   Panel name comes ONLY from:

      1. Explicit panel metadata
      2. The supplied test itself being a known panel

   It NEVER looks at child-test membership to infer
   a panel.
========================================================== */

export function resolvePanelName(test = {}) {

    /* ------------------------------------------------------
       1. EXPLICIT PANEL NAME
    ------------------------------------------------------ */

    const rawPanelName =
        getRawPanelName(test);


    const explicitPanel =
        getCanonicalPanelName(
            rawPanelName
        );


    if (explicitPanel) {

        return explicitPanel;

    }


    /* ------------------------------------------------------
       2. TEST ITSELF IS A PANEL
    ------------------------------------------------------ */

    const rawName =
        getRawTestName(test);


    const canonicalPanel =
        getCanonicalPanelName(
            rawName
        );


    if (canonicalPanel) {

        return canonicalPanel;

    }


    /* ------------------------------------------------------
       3. NOT A PANEL
    ------------------------------------------------------ */

    return "";

}


/* ==========================================================
   RESOLVE PANEL TYPE
========================================================== */

export function resolvePanelType(test = {}) {

    const panelName =
        resolvePanelName(test);


    if (!panelName) {

        return "";

    }


    return getPanelType(
        panelName
    );

}


/* ==========================================================
   IS PANEL DEFINITION
   ----------------------------------------------------------
   Answers:

      "Does this object/value itself represent a panel?"

   It does NOT answer:

      "Does this child belong to a panel?"
========================================================== */

export function isPanelDefinition(test = {}) {

    /* ------------------------------------------------------
       STRING
    ------------------------------------------------------ */

    if (
        typeof test === "string"
    ) {

        return Boolean(
            getCanonicalPanelName(
                test
            )
        );

    }


    /* ------------------------------------------------------
       INVALID
    ------------------------------------------------------ */

    if (
        !test ||
        typeof test !== "object" ||
        Array.isArray(test)
    ) {

        return false;

    }


    const source =
        asObject(test);


    /* ------------------------------------------------------
       EXPLICIT PANEL NAME
    ------------------------------------------------------ */

    const explicitPanelName =
        getRawPanelName(source);


    if (
        String(
            explicitPanelName || ""
        ).trim()
    ) {

        return Boolean(
            getCanonicalPanelName(
                explicitPanelName
            )
        );

    }


    /* ------------------------------------------------------
       EXPLICIT PANEL FLAGS
    ------------------------------------------------------ */

    if (
        source.is_panel === true ||
        source.isPanel === true
    ) {

        return true;

    }


    /* ------------------------------------------------------
       EXPLICIT TEST TYPE
    ------------------------------------------------------ */

    const testType =
        String(
            source.test_type ??
            source.testType ??
            ""
        )
            .trim()
            .toLowerCase();


    if (
        testType === "panel" ||
        testType === "profile"
    ) {

        return true;

    }


    /* ------------------------------------------------------
       IMPORTANT PANEL_ID RULE
       ------------------------------------------------------
       panel_id means this row BELONGS TO a panel.

       It does NOT mean this row IS the panel.

       Therefore panel_id alone is deliberately ignored.
    ------------------------------------------------------ */


    /* ------------------------------------------------------
       CHILD PROTECTION
    ------------------------------------------------------ */

    const rawName =
        getRawTestName(source);


    if (
        isKnownChildTest(
            rawName
        )
    ) {

        return false;

    }


    /* ------------------------------------------------------
       FINAL PANEL NAME CHECK
    ------------------------------------------------------ */

    return Boolean(
        getCanonicalPanelName(
            rawName
        )
    );

}


/* ==========================================================
   IS PANEL OBJECT
========================================================== */

export function isPanelObject(test = {}) {

    return isPanelDefinition(
        test
    );

}


/* ==========================================================
   IS CHILD TEST OBJECT
========================================================== */

export function isChildTestObject(test = {}) {

    const rawName =
        getRawTestName(
            test
        );


    return isKnownChildTest(
        rawName
    );

}


/* ==========================================================
   GET PANEL DEFINITION
========================================================== */

export function getPanelDefinition(value) {

    const panelName =
        value &&
        typeof value === "object"

            ? resolvePanelName(value)

            : getCanonicalPanelName(
                value
            );


    if (!panelName) {

        return null;

    }


    const definition =
        PANEL_DEFINITIONS[
            panelName
        ];


    if (!definition) {

        return {

            name:
                panelName,

            type:
                getPanelType(
                    panelName
                ),

            aliases: [],

        };

    }


    return {

        name:
            panelName,

        type:
            definition.type,

        aliases: [
            ...definition.aliases,
        ],

    };

}


/* ==========================================================
   GET PANEL QUERY NAMES
========================================================== */

export function getPanelQueryNames(value) {

    const panelName =
        getCanonicalPanelName(
            value
        );


    if (!panelName) {

        return [];

    }


    const definition =
        getPanelDefinition(
            panelName
        );


    const names =
        new Set();


    names.add(
        panelName
    );


    asArray(
        definition?.aliases
    ).forEach(
        (name) => {

            const normalized =
                normalizeTestName(
                    name
                );


            if (normalized) {

                names.add(
                    normalized
                );

            }

        }
    );


    return [
        ...names,
    ];

}


/* ==========================================================
   FIND PANEL IN LOADED TESTS
========================================================== */

export function findPanelInTests(
    tests = [],
    panelName
) {

    const source =
        asArray(tests);


    const canonicalPanel =
        getCanonicalPanelName(
            panelName
        );


    if (!canonicalPanel) {

        return null;

    }


    /* ------------------------------------------------------
       FIRST: explicit panel_name
    ------------------------------------------------------ */

    const explicit =
        source.find(
            (item) => {

                const itemPanel =
                    getCanonicalPanelName(
                        getRawPanelName(item)
                    );


                return (
                    itemPanel ===
                    canonicalPanel
                );

            }
        );


    if (explicit) {

        return explicit;

    }


    /* ------------------------------------------------------
       SECOND: row itself is panel
    ------------------------------------------------------ */

    const direct =
        source.find(
            (item) => {

                const itemName =
                    getCanonicalPanelName(
                        getRawTestName(item)
                    );


                return (
                    itemName ===
                    canonicalPanel
                );

            }
        );


    return direct || null;

}


/* ==========================================================
   FIND PANEL CHILDREN
   ----------------------------------------------------------
   ONLY explicit parent relationships qualify.
========================================================== */

export function findPanelChildren(
    tests = [],
    panelName
) {

    const source =
        asArray(tests);


    const canonicalPanel =
        getCanonicalPanelName(
            panelName
        );


    if (!canonicalPanel) {

        return [];

    }


    return source.filter(
        (item) => {

            const sourceObject =
                asObject(item);


            /* ------------------------------------------------
               EXPLICIT panel_name
            ------------------------------------------------ */

            const itemPanel =
                getCanonicalPanelName(
                    getRawPanelName(
                        sourceObject
                    )
                );


            if (
                itemPanel ===
                canonicalPanel
            ) {

                return true;

            }


            /* ------------------------------------------------
               EXPLICIT PARENT FIELDS
            ------------------------------------------------ */

            const parentName =
                sourceObject.parent_test_name ??
                sourceObject.parentTestName ??
                sourceObject.parent_panel_name ??
                sourceObject.parentPanelName ??
                sourceObject.parent_panel ??
                sourceObject.parentPanel ??
                "";


            const canonicalParent =
                getCanonicalPanelName(
                    parentName
                );


            return (
                canonicalParent ===
                canonicalPanel
            );

        }
    );

}


/* ==========================================================
   RESOLVE PANEL PARAMETERS FROM LOADED TESTS
========================================================== */

export function resolvePanelParametersFromTests(
    tests = [],
    panel
) {

    const source =
        asArray(tests);


    const panelName =
        getCanonicalPanelName(
            typeof panel === "object"
                ? resolvePanelName(panel)
                : panel
        );


    if (!panelName) {

        return [];

    }


    /* ------------------------------------------------------
       EXPLICIT CHILDREN
    ------------------------------------------------------ */

    const explicitChildren =
        findPanelChildren(
            source,
            panelName
        );


    if (
        explicitChildren.length > 0
    ) {

        return normalizePanelParameters(
            explicitChildren
        );

    }


    /* ------------------------------------------------------
       PANEL OBJECT
    ------------------------------------------------------ */

    const panelObject =
        findPanelInTests(
            source,
            panelName
        );


    if (!panelObject) {

        return [];

    }


    const panelParameters =
        panelObject.parameters ??
        panelObject.panelTests ??
        panelObject.panel_tests ??
        panelObject.tests ??
        panelObject.testParameters ??
        panelObject.test_parameters ??
        [];


    return normalizePanelParameters(
        panelParameters
    );

}


/* ==========================================================
   NORMALIZE PANEL PARAMETER
========================================================== */

export function normalizePanelParameter(
    item = {},
    index = 0
) {

    const source =
        asObject(item);


    const nested =
        asObject(
            source.master_test ??
            source.masterTest ??
            source.test
        );


    const merged = {

        ...nested,
        ...source,

    };


    const parameterName =
        merged.parameter_name ??
        merged.parameter ??
        merged.component_name ??
        merged.name ??
        merged.test_name ??
        "";


    const name =
        String(
            parameterName
        ).trim();


    return {

        ...merged,


        id:
            merged.id ??
            merged.master_test_id ??
            merged.test_id ??
            `panel-parameter-${index}`,


        master_test_id:
            merged.master_test_id ??
            merged.masterTestId ??
            merged.test_id ??
            merged.id ??
            null,


        test_id:
            merged.test_id ??
            merged.master_test_id ??
            merged.masterTestId ??
            merged.id ??
            null,


        parameter:
            name,


        test_name:
            merged.test_name ??
            name,


        unit:
            merged.unit ??
            "",


        result_type:
            merged.result_type ??
            merged.resultType ??
            "Numeric",


        male_range:
            merged.male_range ??
            merged.maleRange ??
            "",


        female_range:
            merged.female_range ??
            merged.femaleRange ??
            "",


        child_range:
            merged.child_range ??
            merged.childRange ??
            "",


        elderly_range:
            merged.elderly_range ??
            merged.elderlyRange ??
            "",


        reference_range:
            merged.reference_range ??
            merged.referenceRange ??
            merged.reference_value ??
            merged.referenceValue ??
            "",


        reference_value:
            merged.reference_value ??
            merged.referenceValue ??
            "",


        display_order:
            merged.display_order ??
            merged.displayOrder ??
            index + 1,

    };

}


/* ==========================================================
   NORMALIZE PANEL PARAMETERS
========================================================== */

export function normalizePanelParameters(
    parameters = []
) {

    return asArray(
        parameters
    )

        .map(
            (item, index) =>
                normalizePanelParameter(
                    item,
                    index
                )
        )

        .filter(
            (item) =>
                Boolean(
                    item.parameter
                )
        )

        .sort(
            (a, b) =>
                Number(
                    a.display_order ?? 999999
                ) -
                Number(
                    b.display_order ?? 999999
                )
        );

}


/* ==========================================================
   GET PANEL PARAMETERS
   ----------------------------------------------------------
   COMPATIBILITY FUNCTION.

   testService.js expects this named export.

   It accepts:

      - a panel object
      - a panel name
      - optionally an array of loaded tests

   DATABASE resolution is used when necessary.
========================================================== */

export async function getPanelParameters(
    panel,
    tests = []
) {

    /* ------------------------------------------------------
       INVALID
    ------------------------------------------------------ */

    if (
        panel === null ||
        panel === undefined
    ) {

        return [];

    }


    /* ------------------------------------------------------
       ARRAY INPUT
       ------------------------------------------------------
       If caller passes loaded tests only, attempt to find
       panel definitions from that collection.
    ------------------------------------------------------ */

    if (
        Array.isArray(panel)
    ) {

        return normalizePanelParameters(
            panel
        );

    }


    /* ------------------------------------------------------
       OBJECT INPUT
    ------------------------------------------------------ */

    if (
        typeof panel === "object"
    ) {

        const source =
            asObject(panel);


        /* Directly attached parameters */

        const directParameters =
            source.parameters ??
            source.panelTests ??
            source.panel_tests ??
            source.tests ??
            source.testParameters ??
            source.test_parameters ??
            null;


        if (
            Array.isArray(
                directParameters
            ) &&
            directParameters.length > 0
        ) {

            return normalizePanelParameters(
                directParameters
            );

        }


        /* Loaded-test resolution */

        if (
            Array.isArray(tests) &&
            tests.length > 0
        ) {

            const fromTests =
                resolvePanelParametersFromTests(
                    tests,
                    source
                );


            if (
                fromTests.length > 0
            ) {

                return fromTests;

            }

        }


        /* Database resolution */

        return getPanelChildren(
            source
        );

    }


    /* ------------------------------------------------------
       STRING PANEL NAME
    ------------------------------------------------------ */

    const panelName =
        getCanonicalPanelName(
            panel
        );


    if (!panelName) {

        return [];

    }


    /* Loaded tests first */

    if (
        Array.isArray(tests) &&
        tests.length > 0
    ) {

        const fromTests =
            resolvePanelParametersFromTests(
                tests,
                panelName
            );


        if (
            fromTests.length > 0
        ) {

            return fromTests;

        }

    }


    /* Resolve panel from database */

    const panelRecord =
        await getPanelByName(
            panelName
        );


    if (!panelRecord) {

        return [];

    }


    return getPanelChildren(
        panelRecord
    );

}


/* ==========================================================
   DATABASE: FIND PANEL BY NAME
========================================================== */

export async function getPanelByName(
    panelName
) {

    const canonicalPanel =
        getCanonicalPanelName(
            panelName
        );


    if (!canonicalPanel) {

        return null;

    }


    const queryNames =
        getPanelQueryNames(
            canonicalPanel
        );


    if (
        queryNames.length === 0
    ) {

        return null;

    }


    /* ======================================================
       1. EXACT CANONICAL TEST NAME
    ====================================================== */

    const {
        data: exactData,
        error: exactError,
    } = await supabase

        .from("master_tests")

        .select("*")

        .eq(
            "test_name",
            canonicalPanel
        )

        .limit(1);


    if (
        !exactError &&
        Array.isArray(exactData) &&
        exactData.length > 0
    ) {

        const candidate =
            exactData[0];


        if (
            isPanelDefinition(candidate)
        ) {

            return candidate;

        }

    }


    /* ======================================================
       2. ALIAS TEST NAME
    ====================================================== */

    for (
        const queryName of queryNames
    ) {

        if (
            queryName ===
            canonicalPanel
        ) {

            continue;

        }


        const {
            data,
            error,
        } = await supabase

            .from("master_tests")

            .select("*")

            .ilike(
                "test_name",
                queryName
            )

            .limit(1);


        if (
            !error &&
            Array.isArray(data) &&
            data.length > 0
        ) {

            const panelRow =
                data.find(
                    (item) =>
                        isPanelDefinition(item)
                );


            if (panelRow) {

                return panelRow;

            }

        }

    }


    /* ======================================================
       3. PANEL_NAME SEARCH
    ====================================================== */

    for (
        const queryName of queryNames
    ) {

        const {
            data,
            error,
        } = await supabase

            .from("master_tests")

            .select("*")

            .ilike(
                "panel_name",
                queryName
            )

            .limit(100);


        if (
            error ||
            !Array.isArray(data) ||
            data.length === 0
        ) {

            continue;

        }


        /* --------------------------------------------------
           Prefer an actual panel row.

           Do NOT return a child merely because it has
           panel_name.
        -------------------------------------------------- */

        const panelRow =
            data.find(
                (item) => {

                    const itemName =
                        getCanonicalPanelName(
                            getRawTestName(item)
                        );


                    return (
                        itemName ===
                        canonicalPanel
                    );

                }
            );


        if (panelRow) {

            return panelRow;

        }


        /* --------------------------------------------------
           If no explicit panel row exists, a row with
           explicit panel metadata may still represent the
           requested panel context.
        -------------------------------------------------- */

        const explicitPanelRow =
            data.find(
                (item) => {

                    const itemPanel =
                        getCanonicalPanelName(
                            getRawPanelName(item)
                        );


                    return (
                        itemPanel ===
                        canonicalPanel &&
                        (
                            item.is_panel === true ||
                            item.isPanel === true ||
                            String(
                                item.test_type ??
                                item.testType ??
                                ""
                            )
                                .trim()
                                .toLowerCase() ===
                                "panel"
                        )
                    );

                }
            );


        if (explicitPanelRow) {

            return explicitPanelRow;

        }

    }


    return null;

}


/* ==========================================================
   DATABASE: FIND PANEL CHILDREN
   ----------------------------------------------------------
   Resolution order:

      1. panel_tests.panel_id
      2. master_tests.panel_id
      3. master_tests.panel_name
      4. joined panel_tests/master_tests

   No child-name inference.
========================================================== */

export async function getPanelChildren(
    panel
) {

    const panelObject =
        asObject(panel);


    const panelId =
        panelObject.id ??
        panelObject.master_test_id ??
        panelObject.panel_id ??
        null;


    const panelName =
        resolvePanelName(
            panelObject
        ) ||
        getCanonicalPanelName(
            getRawTestName(
                panelObject
            )
        );


    if (
        !panelId &&
        !panelName
    ) {

        return [];

    }


    /* ======================================================
       ATTEMPT 1
       panel_tests.panel_id
    ====================================================== */

    if (panelId) {

        const {
            data,
            error,
        } = await supabase

            .from("panel_tests")

            .select("*")

            .eq(
                "panel_id",
                panelId
            )

            .order(
                "display_order",
                {
                    ascending: true,
                }
            );


        if (
            !error &&
            Array.isArray(data) &&
            data.length > 0
        ) {

            return normalizePanelParameters(
                data
            );

        }

    }


    /* ======================================================
       ATTEMPT 2
       master_tests.panel_id
    ====================================================== */

    if (panelId) {

        const {
            data,
            error,
        } = await supabase

            .from("master_tests")

            .select("*")

            .eq(
                "panel_id",
                panelId
            )

            .order(
                "display_order",
                {
                    ascending: true,
                }
            );


        if (
            !error &&
            Array.isArray(data) &&
            data.length > 0
        ) {

            const children =
                data.filter(
                    (item) => {

                        return (
                            String(item.id) !==
                            String(panelId)
                        );

                    }
                );


            if (
                children.length > 0
            ) {

                return normalizePanelParameters(
                    children
                );

            }

        }

    }


    /* ======================================================
       ATTEMPT 3
       master_tests.panel_name
    ====================================================== */

    if (panelName) {

        const {
            data,
            error,
        } = await supabase

            .from("master_tests")

            .select("*")

            .ilike(
                "panel_name",
                panelName
            )

            .order(
                "display_order",
                {
                    ascending: true,
                }
            );


        if (
            !error &&
            Array.isArray(data) &&
            data.length > 0
        ) {

            const children =
                data.filter(
                    (item) => {

                        const itemPanel =
                            getCanonicalPanelName(
                                getRawPanelName(item)
                            );


                        /* Explicit parent relationship */

                        if (
                            itemPanel ===
                            panelName
                        ) {

                            return true;

                        }


                        /* Do not return the actual panel */

                        const itemName =
                            getCanonicalPanelName(
                                getRawTestName(item)
                            );


                        return (
                            itemName !==
                            panelName
                        );

                    }
                );


            if (
                children.length > 0
            ) {

                return normalizePanelParameters(
                    children
                );

            }

        }

    }


    /* ======================================================
       ATTEMPT 4
       panel_tests joined with master_tests
    ====================================================== */

    if (panelId) {

        const {
            data,
            error,
        } = await supabase

            .from("panel_tests")

            .select(`
                *,
                master_test:master_tests(*)
            `)

            .eq(
                "panel_id",
                panelId
            )

            .order(
                "display_order",
                {
                    ascending: true,
                }
            );


        if (
            !error &&
            Array.isArray(data) &&
            data.length > 0
        ) {

            return normalizePanelParameters(
                data
            );

        }

    }


    return [];

}


/* ==========================================================
   DATABASE: FIND PANEL BY ID
   ----------------------------------------------------------
   IMPORTANT:

   The supplied ID must belong to the PANEL itself.

   A child ID must return null.

   We never search a child and infer its parent panel.
========================================================== */

export async function resolvePanelById(
    panelId
) {

    /* ------------------------------------------------------
       Validate
    ------------------------------------------------------ */

    if (
        panelId === null ||
        panelId === undefined ||
        String(panelId).trim() === ""
    ) {

        return null;

    }


    /* ------------------------------------------------------
       Query master_tests
    ------------------------------------------------------ */

    const {
        data,
        error,
    } = await supabase

        .from("master_tests")

        .select("*")

        .eq(
            "id",
            panelId
        )

        .limit(1);


    if (error) {

        console.error(
            "[panelResolver] resolvePanelById:",
            error
        );

        return null;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return null;

    }


    const panel =
        data[0];


    /* ------------------------------------------------------
       CRITICAL PROTECTION

       panel_id alone does NOT make a panel.

       The row itself must identify the panel.
    ------------------------------------------------------ */

    if (
        !isPanelDefinition(panel)
    ) {

        return null;

    }


    return panel;

}


/* ==========================================================
   GET PANEL PARAMETERS BY PANEL ID
   ----------------------------------------------------------
   Compatibility helper.

   This is useful when testService.js has a panel ID and
   needs the panel's children.
========================================================== */

export async function getPanelParametersById(
    panelId
) {

    const panel =
        await resolvePanelById(
            panelId
        );


    if (!panel) {

        return [];

    }


    return getPanelChildren(
        panel
    );

}


/* ==========================================================
   RESOLVE COMPLETE PANEL
========================================================== */

export async function resolvePanel(
    test
) {

    const rawName =
        getRawTestName(
            test
        );


    const panelName =
        resolvePanelName(
            test
        );


    /* ------------------------------------------------------
       NOT A PANEL
    ------------------------------------------------------ */

    if (!panelName) {

        return {

            panel: null,

            panelName: "",

            panelType: "",

            parameters: [],

            isPanel: false,

            requestedName:
                String(
                    rawName || ""
                ).trim(),

            canonicalName:
                getCanonicalTestName(
                    rawName
                ),

        };

    }


    /* ------------------------------------------------------
       FIND PANEL
    ------------------------------------------------------ */

    const panel =
        await getPanelByName(
            panelName
        );


    /* ------------------------------------------------------
       PANEL NOT FOUND

       Still identify it as a panel because the supplied
       name itself explicitly identifies a known panel.

       Never replace it with a child.
    ------------------------------------------------------ */

    if (!panel) {

        return {

            panel: null,

            panelName,

            panelType:
                getPanelType(
                    panelName
                ),

            parameters: [],

            isPanel: true,

            requestedName:
                String(
                    rawName || ""
                ).trim(),

            canonicalName:
                panelName,

        };

    }


    /* ------------------------------------------------------
       PARAMETERS ATTACHED DIRECTLY TO PANEL
    ------------------------------------------------------ */

    let parameters =
        normalizePanelParameters(

            panel.parameters ??
            panel.panelTests ??
            panel.panel_tests ??
            panel.tests ??
            panel.testParameters ??
            panel.test_parameters ??
            []

        );


    /* ------------------------------------------------------
       DATABASE CHILD RESOLUTION
    ------------------------------------------------------ */

    if (
        parameters.length === 0
    ) {

        parameters =
            await getPanelChildren(
                panel
            );

    }


    return {

        panel,

        panelName,

        panelType:
            getPanelType(
                panelName
            ),

        parameters,

        isPanel: true,

        requestedName:
            String(
                rawName || ""
            ).trim(),

        canonicalName:
            panelName,

    };

}


/* ==========================================================
   RESOLVE TEST
   ----------------------------------------------------------
   PANEL:

      LFT -> LFT
      RFT -> RFT
      CBC -> CBC
      FLP -> FLP
      TFT -> TFT

   SINGLE:

      AST -> AST
      ALT -> ALT
      eGFR -> eGFR

   NEVER promote child -> panel.
========================================================== */

export async function resolveTest(
    test
) {

    const rawName =
        getRawTestName(
            test
        );


    const canonicalName =
        getCanonicalTestName(
            rawName
        );


    const panelName =
        resolvePanelName(
            test
        );


    /* ------------------------------------------------------
       PANEL
    ------------------------------------------------------ */

    if (panelName) {

        return resolvePanel(
            test
        );

    }


    /* ------------------------------------------------------
       SINGLE / CHILD
    ------------------------------------------------------ */

    return {

        panel: null,

        panelName: "",

        panelType: "",

        parameters: [],

        isPanel: false,

        isChild:
            isKnownChildTest(
                canonicalName
            ),

        requestedName:
            String(
                rawName || ""
            ).trim(),

        canonicalName,

        test:
            asObject(
                test
            ),

    };

}


/* ==========================================================
   PANEL TYPE HELPERS
========================================================== */

export function isLFT(test) {

    return (
        resolvePanelType(test) ===
        "lft"
    );

}


export function isRFT(test) {

    return (
        resolvePanelType(test) ===
        "rft"
    );

}


export function isCBC(test) {

    return (
        resolvePanelType(test) ===
        "cbc"
    );

}


export function isFLP(test) {

    return (
        resolvePanelType(test) ===
        "flp"
    );

}


export function isTFT(test) {

    return (
        resolvePanelType(test) ===
        "tft"
    );

}


/* ==========================================================
   DEFAULT EXPORT
   ----------------------------------------------------------
   Keep named exports above AND expose them here for
   backward compatibility with any code importing the
   resolver object itself.
========================================================== */

const panelResolver = {

    /* ------------------------------------------------------
       Name resolution
    ------------------------------------------------------ */

    resolvePanelName,

    resolvePanelType,


    /* ------------------------------------------------------
       Panel identification
    ------------------------------------------------------ */

    isPanelDefinition,

    isPanelObject,

    isChildTestObject,


    /* ------------------------------------------------------
       Definitions
    ------------------------------------------------------ */

    getPanelDefinition,

    getPanelQueryNames,


    /* ------------------------------------------------------
       In-memory resolution
    ------------------------------------------------------ */

    findPanelInTests,

    findPanelChildren,

    resolvePanelParametersFromTests,


    /* ------------------------------------------------------
       Parameter normalization
    ------------------------------------------------------ */

    normalizePanelParameter,

    normalizePanelParameters,

    getPanelParameters,


    /* ------------------------------------------------------
       Database resolution
    ------------------------------------------------------ */

    getPanelByName,

    getPanelChildren,

    resolvePanelById,

    getPanelParametersById,


    /* ------------------------------------------------------
       Complete resolution
    ------------------------------------------------------ */

    resolvePanel,

    resolveTest,


    /* ------------------------------------------------------
       Panel helpers
    ------------------------------------------------------ */

    isLFT,

    isRFT,

    isCBC,

    isFLP,

    isTFT,

};


export default panelResolver;