/* ==========================================================
   PEFA LAB
   TEST IDENTITY SERVICE
   ----------------------------------------------------------
   FILE:
      src/services/test/testIdentity.js

   PURPOSE
   ----------------------------------------------------------
   SINGLE AUTHORITY FOR TEST IDENTITY.

   RESPONSIBILITIES
   ----------------------------------------------------------
      - Read test name
      - Read report identity
      - Read test ID
      - Read master test ID
      - Read child test ID
      - Read panel relationship ID
      - Read related panel ID
      - Read explicit panel name
      - Read confirmed panel identity
      - Read test type
      - Determine panel identity
      - Determine child identity
      - Determine single-test identity
      - Build normalized identity
      - Provide compatibility aliases

   CRITICAL ARCHITECTURAL RULE
   ----------------------------------------------------------

   panel_id means:

      "THIS TEST BELONGS TO THIS PANEL"

   It does NOT mean:

      "THIS TEST IS THE PANEL"

   Therefore:

      AST + panel_id=LFT
         -> AST CHILD

      ALT + panel_id=LFT
         -> ALT CHILD

      GGT + panel_id=LFT
         -> GGT CHILD

      LFT
         -> LFT PANEL

   NEVER promote a child to a panel because:

      - panel_id exists
      - panel_name exists
      - child belongs to a known panel

   PANEL IDENTITY requires explicit evidence.

   ----------------------------------------------------------
   IMPORTANT COMPATIBILITY API
   ----------------------------------------------------------

   Existing services may import:

      getPanelId()
      getRelatedPanelId()
      getConfirmedPanelId()
      getConfirmedPanelName()
      getReportIdentity()
      getTestIdentityName()
      getPanelIdentityName()

   These functions intentionally have different meanings.

   getPanelId()
      -> relationship / membership ID

   getRelatedPanelId()
      -> compatibility alias for panel membership

   getConfirmedPanelId()
      -> panel ID only when the supplied record itself
         is confirmed to represent a panel

   getReportIdentity()
      -> the registered/report test's own identity

   ----------------------------------------------------------
   NO SUPABASE
   NO REACT
   NO RESULT LOGIC
   NO GROUPING LOGIC
   ========================================================== */


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
   CLEAN TEXT
   ========================================================== */

export function cleanIdentityText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


/* ==========================================================
   NORMALIZE IDENTITY NAME
   ========================================================== */

export function normalizeIdentityName(value) {
    return cleanIdentityText(value)
        .toUpperCase()
        .replace(/[‐-‒–—−]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}


/* ==========================================================
   FIRST IDENTITY VALUE
   ----------------------------------------------------------
   Return the first meaningful value.

   IMPORTANT:
   Zero is considered a valid value.
   ========================================================== */

export function firstIdentityValue(...values) {
    for (const value of values) {
        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
}


/* ==========================================================
   NUMERIC ID
   ----------------------------------------------------------
   Convert numeric-looking IDs safely.

   Invalid IDs become null.
   ========================================================== */

export function toNumericId(value) {
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

    const numeric = Number(text);

    if (!Number.isSafeInteger(numeric)) {
        return null;
    }

    return numeric;
}


/* ==========================================================
   GET TEST NAME
   ----------------------------------------------------------
   The test's own identity name.

   Priority:
      test_name
      testName
      name
      parameter_name
      parameter
      component_name
      componentName

   IMPORTANT:
   This function does NOT substitute panel_name.

   Therefore:

      AST + panel_name=LFT

   still returns:

      AST
   ========================================================== */

export function getTestName(test = {}) {
    const source = asObject(test);

    return cleanIdentityText(
        firstIdentityValue(
            source.test_name,
            source.testName,
            source.name,
            source.parameter_name,
            source.parameter,
            source.component_name,
            source.componentName
        )
    );
}


/* ==========================================================
   GET REPORT IDENTITY
   ----------------------------------------------------------
   The report-level identity of the supplied record.

   IMPORTANT:

      panel_name is relationship metadata.

   It must NEVER replace the test's own name.

   Examples:

      LFT -> LFT

      AST + panel_id=LFT
          -> AST

      ALT + panel_id=LFT
          -> ALT

      GGT + panel_id=LFT
          -> GGT
   ========================================================== */

export function getReportIdentity(test = {}) {
    return getTestName(test);
}


/* ==========================================================
   GET TEST ID
   ----------------------------------------------------------
   General identity ID.

   IMPORTANT:
   This is NOT automatically master_tests.id.
   ========================================================== */

export function getTestId(test = {}) {
    const source = asObject(test);

    return toNumericId(
        firstIdentityValue(
            source.id,
            source.test_id,
            source.testId
        )
    );
}


/* ==========================================================
   GET MASTER TEST ID
   ========================================================== */

export function getMasterTestId(test = {}) {
    const source = asObject(test);

    return toNumericId(
        firstIdentityValue(
            source.master_test_id,
            source.masterTestId,
            source.master_test?.id,
            source.masterTest?.id
        )
    );
}


/* ==========================================================
   GET CHILD TEST ID
   ----------------------------------------------------------
   Child identity only.

   Priority:

      child_test_id
      childTestId
      test_id
      testId

   DOES NOT use panel_id.
   ========================================================== */

export function getChildTestId(test = {}) {
    const source = asObject(test);

    return toNumericId(
        firstIdentityValue(
            source.child_test_id,
            source.childTestId,
            source.test_id,
            source.testId
        )
    );
}


/* ==========================================================
   GET PANEL ID
   ----------------------------------------------------------
   PANEL MEMBERSHIP / RELATIONSHIP ONLY.

   This means:

      "Which panel does this record belong to?"

   It does NOT mean:

      "Is this record itself a panel?"

   Therefore:

      AST.panel_id = LFT_ID

   returns:

      LFT_ID

   while AST still remains a child.
   ========================================================== */

export function getPanelId(test = {}) {
    const source = asObject(test);

    return toNumericId(
        firstIdentityValue(
            source.panel_id,
            source.panelId,
            source.parent_panel_id,
            source.parentPanelId
        )
    );
}


/* ==========================================================
   GET RELATED PANEL ID
   ----------------------------------------------------------
   COMPATIBILITY HELPER.

   This function deliberately represents the PANEL
   RELATIONSHIP, not panel identity.

   Therefore:

      AST + panel_id=LFT
         -> LFT ID

      ALT + panel_id=LFT
         -> LFT ID

      LFT panel itself
         -> its relationship ID if explicitly supplied

   IMPORTANT:

   Calling this function NEVER changes classification.

   It does NOT make:

      AST -> PANEL

   It only answers:

      "What panel is this test related to?"
   ========================================================== */

export function getRelatedPanelId(test = {}) {
    return getPanelId(test);
}


/* ==========================================================
   GET EXPLICIT PANEL NAME
   ----------------------------------------------------------
   Relationship metadata only.

   IMPORTANT:
   This does NOT mean the record is a panel.
   ========================================================== */

export function getExplicitPanelName(test = {}) {
    const source = asObject(test);

    return cleanIdentityText(
        firstIdentityValue(
            source.panel_name,
            source.panelName,
            source.parent_panel_name,
            source.parentPanelName
        )
    );
}


/* ==========================================================
   EXPLICIT PANEL FLAG
   ----------------------------------------------------------
   Only explicit boolean/semantic panel markers are accepted.
   ========================================================== */

function getExplicitPanelFlag(test = {}) {
    const source = asObject(test);

    const value = firstIdentityValue(
        source.is_panel,
        source.isPanel,
        source.is_panel_test,
        source.isPanelTest,
        source.is_panel_record,
        source.isPanelRecord
    );

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    if (typeof value === "string") {
        const normalized = value
            .trim()
            .toLowerCase();

        if (
            [
                "true",
                "1",
                "yes",
                "y",
                "panel",
                "profile"
            ].includes(normalized)
        ) {
            return true;
        }

        if (
            [
                "false",
                "0",
                "no",
                "n",
                "single",
                "child",
                "test"
            ].includes(normalized)
        ) {
            return false;
        }
    }

    return null;
}


/* ==========================================================
   GET TEST TYPE
   ========================================================== */

export function getTestType(test = {}) {
    const source = asObject(test);

    return cleanIdentityText(
        firstIdentityValue(
            source.test_type,
            source.testType,
            source.type
        )
    );
}


/* ==========================================================
   PANEL TEST TYPE
   ========================================================== */

function isPanelTestType(testType) {
    const normalized = normalizeIdentityName(testType)
        .toLowerCase();

    return [
        "panel",
        "test panel",
        "profile",
        "test_panel",
        "panel_test",
        "panel profile"
    ].includes(normalized);
}


/* ==========================================================
   CHILD TEST TYPE
   ========================================================== */

function isChildTestType(testType) {
    const normalized = normalizeIdentityName(testType)
        .toLowerCase();

    return [
        "child",
        "panel child",
        "panel_child",
        "child_test",
        "parameter",
        "component",
        "panel parameter"
    ].includes(normalized);
}


/* ==========================================================
   SELF IDENTIFYING PANEL
   ----------------------------------------------------------
   A record can explicitly identify itself as a panel when
   its own test name matches its explicit panel name.

   Example:

      test_name  = LFT
      panel_name = LFT

   This is different from:

      test_name  = AST
      panel_name = LFT

   AST is NOT a panel.
   ========================================================== */

function hasSelfIdentifyingPanelMetadata(source) {
    const testName = normalizeIdentityName(
        getTestName(source)
    );

    const panelName = normalizeIdentityName(
        getExplicitPanelName(source)
    );

    if (
        !testName ||
        !panelName
    ) {
        return false;
    }

    return testName === panelName;
}


/* ==========================================================
   IS PANEL IDENTITY
   ----------------------------------------------------------
   Determines whether THIS RECORD is itself a panel.

   Priority:

      1. Explicit boolean panel flag
      2. Explicit panel test type
      3. Explicit self-identifying panel metadata
      4. Explicit identity/record type

   IMPORTANT:

      panel_id alone -> FALSE
      panel_name alone -> FALSE

   This is the critical protection against:

      AST -> LFT
      ALT -> LFT
      GGT -> LFT
   ========================================================== */

export function isPanelIdentity(test = {}) {
    const source = asObject(test);

    /* ------------------------------------------------------
       1. EXPLICIT BOOLEAN
       ------------------------------------------------------ */

    const explicitFlag = getExplicitPanelFlag(source);

    if (explicitFlag === true) {
        return true;
    }

    if (explicitFlag === false) {
        return false;
    }


    /* ------------------------------------------------------
       2. EXPLICIT TEST TYPE
       ------------------------------------------------------ */

    const testType = getTestType(source);

    if (isPanelTestType(testType)) {
        return true;
    }

    if (isChildTestType(testType)) {
        return false;
    }


    /* ------------------------------------------------------
       3. EXPLICIT SELF-IDENTIFYING PANEL
       ------------------------------------------------------ */

    if (
        hasSelfIdentifyingPanelMetadata(source)
    ) {
        return true;
    }


    /* ------------------------------------------------------
       4. EXPLICIT PANEL MARKER
       ------------------------------------------------------

       Some datasets may contain:

          identity_type
          identityType
          record_type
          recordType

       These are accepted only when they explicitly say
       panel/profile.

       IMPORTANT:
       panel_id is deliberately NOT checked here.
       panel_name is deliberately NOT checked here.
       ------------------------------------------------------ */

    const identityType = normalizeIdentityName(
        firstIdentityValue(
            source.identity_type,
            source.identityType,
            source.record_type,
            source.recordType
        )
    ).toLowerCase();

    if (
        [
            "panel",
            "profile",
            "test panel"
        ].includes(identityType)
    ) {
        return true;
    }


    /* ------------------------------------------------------
       5. DEFAULT
       ------------------------------------------------------

       Relationship metadata does not create panel identity.
       ------------------------------------------------------ */

    return false;
}


/* ==========================================================
   IS PANEL TEST
   ----------------------------------------------------------
   Legacy / compatibility alias.
   ========================================================== */

export function isPanelTest(test = {}) {
    return isPanelIdentity(test);
}


/* ==========================================================
   IS PANEL RECORD
   ----------------------------------------------------------
   Legacy / compatibility alias.
   ========================================================== */

export function isPanelRecord(test = {}) {
    return isPanelIdentity(test);
}


/* ==========================================================
   IS PANEL CHILD
   ----------------------------------------------------------
   A record is a child when:

      - it is not a panel
      - and explicit child identity exists

   or:

      - it has a panel relationship

   or:

      - it has a different own name from its explicit panel name
   ========================================================== */

export function isPanelChild(test = {}) {
    const source = asObject(test);

    /* ------------------------------------------------------
       A confirmed panel can never simultaneously be a child.
       ------------------------------------------------------ */

    if (
        isPanelIdentity(source)
    ) {
        return false;
    }


    /* ------------------------------------------------------
       Explicit child type.
       ------------------------------------------------------ */

    if (
        isChildTestType(
            getTestType(source)
        )
    ) {
        return true;
    }


    /* ------------------------------------------------------
       Explicit panel relationship.

       panel_id indicates membership.
       It does NOT promote the child to a panel.
       ------------------------------------------------------ */

    if (
        getPanelId(source) !== null
    ) {
        return true;
    }


    /* ------------------------------------------------------
       Different own test name and panel name.

       Example:

          AST
          LFT

       -> AST child
       ------------------------------------------------------ */

    const testName = normalizeIdentityName(
        getTestName(source)
    );

    const panelName = normalizeIdentityName(
        getExplicitPanelName(source)
    );

    return Boolean(
        testName &&
        panelName &&
        testName !== panelName
    );
}


/* ==========================================================
   IS CHILD IDENTITY
   ----------------------------------------------------------
   Compatibility alias.
   ========================================================== */

export function isChildIdentity(test = {}) {
    return isPanelChild(test);
}


/* ==========================================================
   IS SINGLE TEST
   ----------------------------------------------------------
   Single means:

      NOT PANEL
      AND
      NOT CHILD
   ========================================================== */

export function isSingleTest(test = {}) {
    return (
        !isPanelIdentity(test) &&
        !isPanelChild(test)
    );
}


/* ==========================================================
   GET TEST IDENTITY NAME
   ----------------------------------------------------------
   Compatibility alias.

   This is the test's own identity, NOT panel_name.
   ========================================================== */

export function getTestIdentityName(test = {}) {
    return getTestName(test);
}


/* ==========================================================
   GET PANEL IDENTITY NAME
   ----------------------------------------------------------
   Returns the name of the panel only when the record itself
   has confirmed panel identity.

   Priority:

      confirmed panel name
      test name when record is panel

   A child's panel_name is NOT returned here as panel identity.
   ========================================================== */

export function getPanelIdentityName(test = {}) {
    const source = asObject(test);

    const confirmed = getConfirmedPanelName(source);

    if (confirmed) {
        return confirmed;
    }

    if (
        isPanelIdentity(source)
    ) {
        return getTestName(source);
    }

    return "";
}


/* ==========================================================
   CONFIRMED PANEL ID
   ----------------------------------------------------------
   A panel ID is confirmed ONLY when THIS RECORD is confirmed
   to represent a panel.

   IMPORTANT:

      AST
         panel_id = 10

   returns:

      null

   because AST is a child.

   For an actual panel master:

      LFT
         master_test_id = 10

   returns:

      10
   ========================================================== */

export function getConfirmedPanelId(test = {}) {
    const source = asObject(test);

    if (
        !isPanelIdentity(source)
    ) {
        return null;
    }

    return getMasterTestId(source);
}


/* ==========================================================
   CONFIRMED PANEL NAME
   ----------------------------------------------------------
   Only returns a panel name when THIS RECORD is confirmed
   to be a panel.
   ========================================================== */

export function getConfirmedPanelName(test = {}) {
    const source = asObject(test);

    if (
        !isPanelIdentity(source)
    ) {
        return "";
    }

    const name = getTestName(source);

    if (name) {
        return name;
    }

    return getExplicitPanelName(source);
}


/* ==========================================================
   GET TEST IDENTITY
   ----------------------------------------------------------
   Builds a normalized identity object.

   IMPORTANT:

      panelId
         = relationship

      isPanel
         = actual panel identity

      isChild
         = child identity

   These are intentionally separate.
   ========================================================== */

export function getTestIdentity(test = {}) {
    const source = asObject(test);

    const testName = getTestName(source);

    const panelId = getPanelId(source);

    const relatedPanelId = getRelatedPanelId(source);

    const panelName = getExplicitPanelName(source);

    const masterTestId = getMasterTestId(source);

    const isPanel = isPanelIdentity(source);

    const isChild = isPanelChild(source);

    return {
        testName,

        canonicalName:
            normalizeIdentityName(
                testName
            ),

        reportIdentity:
            getReportIdentity(source),

        masterTestId,

        panelId,

        relatedPanelId,

        panelName,

        canonicalPanelName:
            normalizeIdentityName(
                panelName
            ),

        testType:
            getTestType(source),

        isPanel,

        isChild,

        isSingle:
            !isPanel &&
            !isChild,

        hasMasterTestId:
            masterTestId !== null,

        hasPanelId:
            panelId !== null,

        hasRelatedPanelId:
            relatedPanelId !== null,

        hasPanelName:
            Boolean(panelName)
    };
}


/* ==========================================================
   RESOLVE TEST IDENTITY
   ----------------------------------------------------------
   Compatibility alias.
   ========================================================== */

export function resolveTestIdentity(test = {}) {
    return getTestIdentity(test);
}


/* ==========================================================
   NORMALIZE TEST IDENTITY
   ----------------------------------------------------------
   Adds normalized identity fields while preserving the
   original record.
   ========================================================== */

export function normalizeTestIdentity(test = {}) {
    const source = asObject(test);

    const identity = getTestIdentity(source);

    return {
        ...source,

        id:
            source.id ??
            null,

        master_test_id:
            source.master_test_id ??
            identity.masterTestId ??
            null,

        masterTestId:
            source.masterTestId ??
            identity.masterTestId ??
            null,

        test_name:
            source.test_name ??
            identity.testName ??
            "",

        testName:
            source.testName ??
            identity.testName ??
            "",

        panel_id:
            source.panel_id ??
            identity.panelId ??
            null,

        panelId:
            source.panelId ??
            identity.panelId ??
            null,

        panel_name:
            source.panel_name ??
            identity.panelName ??
            "",

        panelName:
            source.panelName ??
            identity.panelName ??
            "",

        test_type:
            source.test_type ??
            identity.testType ??
            "",

        testType:
            source.testType ??
            identity.testType ??
            "",

        is_panel:
            identity.isPanel,

        isPanel:
            identity.isPanel,

        is_panel_child:
            identity.isChild,

        isPanelChild:
            identity.isChild,

        isChild:
            identity.isChild,

        isSingle:
            identity.isSingle,

        canonicalName:
            identity.canonicalName,

        canonicalPanelName:
            identity.canonicalPanelName,

        reportIdentity:
            identity.reportIdentity,

        relatedPanelId:
            identity.relatedPanelId
    };
}


/* ==========================================================
   KNOWN PANEL NAMES
   ----------------------------------------------------------
   IMPORTANT:

   This is ONLY a name classifier.

   It does NOT convert the supplied record into a panel.

   Therefore:

      AST + panel_name=LFT

   remains AST child.
   ========================================================== */

const KNOWN_PANEL_NAMES = new Set([
    "LFT",
    "LIVER FUNCTION TEST",
    "LIVER FUNCTION TESTS",

    "RFT",
    "RENAL FUNCTION TEST",
    "RENAL FUNCTION TESTS",

    "CBC",
    "COMPLETE BLOOD COUNT",
    "FULL BLOOD COUNT",

    "FLP",
    "FULL LIPID PROFILE",
    "LIPID PROFILE",

    "TFT",
    "THYROID FUNCTION TEST",
    "THYROID FUNCTION TESTS",

    "FBC",

    "ELECTROLYTES",

    "ELECTROLYTES UREA CREATININE",

    "E/U/CR",

    "UEC"
]);


/* ==========================================================
   IS KNOWN PANEL NAME
   ========================================================== */

export function isKnownPanelName(value) {
    const normalized = normalizeIdentityName(value);

    return KNOWN_PANEL_NAMES.has(
        normalized
    );
}


/* ==========================================================
   CANONICAL PANEL IDENTITY
   ========================================================== */

export function getCanonicalPanelIdentity(value) {
    return normalizeIdentityName(value);
}


/* ==========================================================
   MASTER MATCHES REPORT
   ----------------------------------------------------------
   Compares master identity with report identity.

   Compatible forms:

      masterMatchesReport(master, report)

   The function does NOT promote children.

   Matching priority:

      1. master_test_id
      2. canonical test name
   ========================================================== */

export function masterMatchesReport(
    master,
    report
) {
    const masterIdentity =
        getTestIdentity(master);

    const reportIdentity =
        getTestIdentity(report);

    /* ------------------------------------------------------
       Master ID comparison
       ------------------------------------------------------ */

    if (
        masterIdentity.masterTestId !== null &&
        reportIdentity.masterTestId !== null
    ) {
        if (
            masterIdentity.masterTestId ===
            reportIdentity.masterTestId
        ) {
            return true;
        }
    }


    /* ------------------------------------------------------
       Name comparison
       ------------------------------------------------------ */

    if (
        masterIdentity.canonicalName &&
        reportIdentity.canonicalName
    ) {
        return (
            masterIdentity.canonicalName ===
            reportIdentity.canonicalName
        );
    }


    return false;
}


/* ==========================================================
   HAS CONFIRMED PANEL IDENTITY
   ========================================================== */

export function hasConfirmedPanelIdentity(
    test = {}
) {
    return isPanelIdentity(test);
}


/* ==========================================================
   DEFAULT EXPORT
   ----------------------------------------------------------
   Keep all public helpers available to services that use:

      import testIdentity from "./testIdentity";

   ========================================================== */

const testIdentity = {
    cleanIdentityText,
    normalizeIdentityName,

    firstIdentityValue,
    toNumericId,

    getTestId,
    getTestName,
    getReportIdentity,

    getMasterTestId,
    getChildTestId,

    getPanelId,
    getRelatedPanelId,

    getExplicitPanelName,

    getConfirmedPanelId,
    getConfirmedPanelName,

    getPanelIdentityName,

    getTestType,

    isPanelIdentity,
    isPanelTest,
    isPanelRecord,

    isPanelChild,
    isChildIdentity,
    isSingleTest,

    getTestIdentityName,
    getTestIdentity,
    resolveTestIdentity,
    normalizeTestIdentity,

    isKnownPanelName,
    getCanonicalPanelIdentity,

    hasConfirmedPanelIdentity,

    masterMatchesReport
};

export default testIdentity;