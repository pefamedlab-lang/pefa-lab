/* ==========================================================
   PEFA LAB
   TEST SERVICE — PUBLIC FACADE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   This file contains NO business logic.

   It exposes the public API of the separated test-service
   modules while preserving compatibility with the previous
   monolithic testService.js.

   IMPORTANT IDENTITY RULE

   A panel is the REPORT IDENTITY.

   panel_id / panel_name on a child does NOT make the child
   itself a panel.

   Example:

      LFT
        ├── AST
        ├── ALT
        ├── ALP
        └── GGT

   AST remains AST.

   LFT remains LFT.

   ----------------------------------------------------------
   COMPATIBILITY RULE

   Older code may still request:

      isPanelRecord

   The current identity service exposes:

      isPanelTest

   Therefore:

      isPanelRecord === isPanelTest

   is provided here as a compatibility alias.

   ========================================================== */


/* ==========================================================
   MASTER TEST SERVICE
   ========================================================== */

export {
  getTestById,
  getAllTests,
  getTestsByDepartment,
  getPanels,

  resolveMasterTestByName,
  resolveMasterTest,

  resolveVerifiedMaster,

  masterMatchesRequestedTest,

  getResolvedMasterId,

  findPanelMasterCandidates,
  findChildMasterTest,
} from "./test/masterTestService";


/* ==========================================================
   MASTER TEST COMPATIBILITY ALIASES
   ========================================================== */

export {
  resolveMasterTestByName as getTestByName,
} from "./test/masterTestService";


/* ==========================================================
   REGISTERED TEST NORMALIZATION
   ========================================================== */

export {
  normalizeRegisteredTest,
  normalizeRegisteredTests,

  mergeRegisteredTest,

  getRegisteredTestId,
  getRegisteredMasterTestId,
  getRegisteredChildTestId,
  getRegisteredPanelId,

  isRegisteredPanel,

  getRegisteredTestName,
  getRegisteredPanelName,

  getRegisteredParameters,
} from "./test/registeredTestNormalizer";


/* ==========================================================
   REGISTERED TEST ENRICHMENT
   ========================================================== */

export {
  enrichOneRegisteredTest,
  enrichRegisteredTests,

  resolveTest,

  getEnrichedParameters,
} from "./test/registeredTestEnrichment";


/* ==========================================================
   PANEL PARAMETER SERVICE
   ----------------------------------------------------------
   IMPORTANT

   panelParameterService.js must expose these compatibility
   functions because older ResultDashboard/testService code
   may still request them.
   ========================================================== */

export {
  getPanelParameters,
  getPanelChildren,

  resolvePanelId,
  resolvePanelName,

  normalizePanelParameter,
  normalizePanelParameters,
} from "./test/panelParameterService";


/* ==========================================================
   PANEL TEST SERVICE
   ========================================================== */

export {
  getPanelById,
  getPanelTests,
  getPanelTestById,

  createPanelTest,
  updatePanelTest,
  deletePanelTest,
} from "./test/panelTestService";


/* ==========================================================
   TEST IDENTITY
   ----------------------------------------------------------
   IMPORTANT COMPATIBILITY FIX

   testIdentity.js provides:

      isPanelTest

   It does NOT provide:

      isPanelRecord

   Older code may still import isPanelRecord.

   We therefore expose:

      isPanelTest as isPanelRecord

   without changing the underlying identity implementation.
   ========================================================== */

export {
  isPanelTest,

  isPanelTest as isPanelRecord,

  isPanelChild,
  isSingleTest,

  getTestIdentity,

  getMasterTestId,
  getChildTestId,
  getPanelId,

  toNumericId,
  firstIdentityValue,

  isKnownPanelName,
  normalizeIdentityName,
  getCanonicalPanelIdentity,
  getTestIdentityName,
  masterMatchesReport,
} from "./test/testIdentity";


/* ==========================================================
   TEST NORMALIZATION
   ========================================================== */

export {
  normalizeTest,
  normalizeTestName,
  normalizeTestType,
  normalizeResultType,

  normalizeDepartment,
  normalizePanelName,

  compactTestName,
  getCanonicalTestName,
  getCanonicalPanelName,

  getCanonicalName,
  getCanonicalPanel,

  getTestPanelType,

  isKnownChildTest,
} from "./test/testNormalization";


/* ==========================================================
   UTILITY EXPORTS
   ========================================================== */

export {
  isNumericId,
  firstValue,
  toBoolean,
  normalizeText,

  toNumericId as toNumericUtilityId,
  normalizeId,

  hasValue,
  safeArray,
  safeObject,
} from "./test/testUtils";


/* ==========================================================
   DEFAULT SERVICE OBJECT
   ----------------------------------------------------------
   Compatibility for code using:

      import testService from "./testService";

   ========================================================== */

import * as masterTestService
  from "./test/masterTestService";

import * as registeredTestNormalizer
  from "./test/registeredTestNormalizer";

import * as registeredTestEnrichment
  from "./test/registeredTestEnrichment";

import * as panelParameterService
  from "./test/panelParameterService";

import * as panelTestService
  from "./test/panelTestService";

import * as testIdentity
  from "./test/testIdentity";

import * as testNormalization
  from "./test/testNormalization";

import * as testUtils
  from "./test/testUtils";


/* ==========================================================
   PUBLIC COMPATIBILITY OBJECT
   ========================================================== */

const testService = {

  /* --------------------------------------------------------
     MASTER TESTS
     -------------------------------------------------------- */

  ...masterTestService,

  /*
   * Legacy compatibility.
   */
  getTestByName:
    masterTestService.resolveMasterTestByName,


  /* --------------------------------------------------------
     REGISTERED TESTS
     -------------------------------------------------------- */

  ...registeredTestNormalizer,

  ...registeredTestEnrichment,


  /* --------------------------------------------------------
     PANEL PARAMETERS
     -------------------------------------------------------- */

  ...panelParameterService,


  /* --------------------------------------------------------
     PANEL DATABASE OPERATIONS
     -------------------------------------------------------- */

  ...panelTestService,


  /* --------------------------------------------------------
     TEST IDENTITY
     -------------------------------------------------------- */

  ...testIdentity,

  /*
   * Legacy compatibility.
   *
   * testIdentity.js exposes isPanelTest, while older code
   * expects isPanelRecord.
   */
  isPanelRecord:
    testIdentity.isPanelTest,


  /* --------------------------------------------------------
     TEST NORMALIZATION
     -------------------------------------------------------- */

  ...testNormalization,


  /* --------------------------------------------------------
     UTILITIES
     -------------------------------------------------------- */

  ...testUtils,
};


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default testService;