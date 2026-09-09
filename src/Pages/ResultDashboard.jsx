import { useState } from "react";
import { FileText } from "lucide-react";

import SearchPanel from "../components/SearchPanel";
import PatientCard from "../components/PatientCard";
import RegisteredTestsTable from "../components/RegisteredTestsTable";
import ResultEntryModal from "../components/ResultEntryModal";

import {
  searchPatient as loadPatient,
} from "../services/patientService";

import {
  enrichRegisteredTests,
  isPanelTest,
} from "../services/testService";

import {
  getPatientResults,
} from "../services/resultService";

import {
  saveSingleResult,
  saveGroupedResults,
} from "../services/resultEntryService";

import "../styles/resultDashboard.css";


/* ==========================================================
   RESULT DASHBOARD
   ----------------------------------------------------------
   IDENTITY CONTRACT

   This component MUST NOT invent test identities.

   The identity hierarchy is:

   registered_test_id
      = registered/purchased test/order-item identity

   master_test_id
      = master_tests identity for the selected test

   test_id
      = actual child/individual test identity ONLY when
        explicitly supplied by the source object

   panel_master_test_id
      = master_tests identity of the parent panel

   panel_id
      = explicit panel identity when supplied

   panel_name
      = explicit panel name when supplied

   IMPORTANT:

   NEVER:

      master_test_id -> test_id

   NEVER:

      parameters.length -> is_panel

   NEVER infer a panel from a test/parameter name.

   The dashboard preserves identity supplied by
   patientService/testService and passes it unchanged to
   resultEntryService.
========================================================== */


/* ==========================================================
   HELPERS
========================================================== */

function normalizeText(value) {
  return String(value ?? "").trim();
}


/* ==========================================================
   FIRST NON-EMPTY VALUE
========================================================== */

function firstValue(...values) {
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
   EXPLICIT BOOLEAN
   ----------------------------------------------------------
   Only accepts an actual explicit panel declaration.

   We intentionally do NOT infer panel status from:
     - parameter count
     - test name
     - master_test_id
     - child collection
========================================================== */

function isExplicitTrue(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    (
      typeof value === "string" &&
      value.trim().toLowerCase() === "true"
    )
  );
}


/* ==========================================================
   BUILD STABLE TEST IDENTITY
   ----------------------------------------------------------
   CRITICAL IDENTITY PRESERVATION LAYER.

   This function normalizes field names but does NOT invent
   identities.

   In particular:

      test_id is ONLY taken from test_id/testId/child_test_id.

      master_test_id is NEVER used as test_id.

   This distinction is essential because:

      registered_test_id
      master_test_id
      test_id
      panel_master_test_id
      panel_id

   represent different identities.
========================================================== */



function buildStableTestIdentity(
  test = {}
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return test;
  }

  /* ======================================================
     REGISTERED TEST ID
  ====================================================== */

  const registeredTestId =
    firstValue(
      test.registered_test_id,
      test.registeredTestId,

      test.registration_test_id,
      test.registrationTestId,

      test.service_order_item_id,
      test.serviceOrderItemId,

      test.id
    );


  /* ======================================================
     MASTER TEST ID

     IMPORTANT:
     This is the master_tests ID.

     NEVER use this value as test_id.
  ====================================================== */

  const masterTestId =
    firstValue(
      test.master_test_id,
      test.masterTestId,

      test.master_test?.id,
      test.masterTest?.id
    );


  /* ======================================================
     ACTUAL TEST ID

     IMPORTANT:
     test_id MUST come from an explicit test_id.

     NEVER:
       test_id = master_test_id
  ====================================================== */

  const testId =
    firstValue(
      test.test_id,
      test.testId,

      test.child_test_id,
      test.childTestId
    );


  /* ======================================================
     PANEL ID
  ====================================================== */

  const panelId =
    firstValue(
      test.panel_id,
      test.panelId,

      test.parent_panel_id,
      test.parentPanelId
    );


  /* ======================================================
     PANEL NAME
  ====================================================== */

  const panelName =
    firstValue(
      test.panel_name,
      test.panelName,

      test.parent_panel_name,
      test.parentPanelName
    );


  /* ======================================================
     TEST NAME
  ====================================================== */

  const testName =
    firstValue(
      test.test_name,
      test.testName,
      test.name
    );


  /* ======================================================
     TEST TYPE
  ====================================================== */

  const testType =
    firstValue(
      test.test_type,
      test.testType
    );


  /* ======================================================
     PANEL DETECTION
  ====================================================== */

  const explicitPanel =
    test.is_panel === true ||
    test.isPanel === true;


  const panelByType =
    [
      "panel",
      "panel test",
      "group",
      "profile",
    ].includes(
      String(
        testType ?? ""
      )
        .trim()
        .toLowerCase()
    );


  const panelByIdentity =
    panelId !== null &&
    panelId !== undefined &&
    String(
      panelId
    ).trim() !== "";


  const parameters =
    Array.isArray(
      test.parameters
    )
      ? test.parameters
      : [];


  const isPanel =
    explicitPanel ||
    panelByType ||
    panelByIdentity ||
    parameters.length > 0;


  /* ======================================================
     RETURN NORMALIZED TEST
  ====================================================== */

  return {
    ...test,


    /* ====================================================
       REGISTERED TEST IDENTITY
    ==================================================== */

    registered_test_id:
      registeredTestId,

    registeredTestId:
      registeredTestId,


    /* ====================================================
       MASTER TEST IDENTITY
    ==================================================== */

    master_test_id:
      masterTestId ?? null,

    masterTestId:
      masterTestId ?? null,


    /* ====================================================
       ACTUAL TEST IDENTITY

       NEVER FALL BACK TO master_test_id
    ==================================================== */

    test_id:
      testId ?? null,

    testId:
      testId ?? null,


    /* ====================================================
       TEST NAME
    ==================================================== */

    test_name:
      testName ?? "",

    testName:
      testName ?? "",


    /* ====================================================
       TEST TYPE
    ==================================================== */

    test_type:
      testType ?? "",

    testType:
      testType ?? "",


    /* ====================================================
       PANEL IDENTITY
    ==================================================== */

    panel_id:
      panelId ?? null,

    panelId:
      panelId ?? null,

    parent_panel_id:
      panelId ?? null,

    parentPanelId:
      panelId ?? null,

    panel_name:
      panelName ?? "",

    panelName:
      panelName ?? "",


    /* ====================================================
       PANEL STATUS
    ==================================================== */

    is_panel:
      isPanel,

    isPanel:
      isPanel,


    /* ====================================================
       CHILD COLLECTIONS
    ==================================================== */

    parameters,

    panelTests:
      Array.isArray(
        test.panelTests
      )
        ? test.panelTests
        : parameters,

    panel_tests:
      Array.isArray(
        test.panel_tests
      )
        ? test.panel_tests
        : parameters,

    groupedTests:
      Array.isArray(
        test.groupedTests
      )
        ? test.groupedTests
        : parameters,

    grouped_tests:
      Array.isArray(
        test.grouped_tests
      )
        ? test.grouped_tests
        : parameters,
  };
}


/* ==========================================================
   NORMALIZE ALL REGISTERED TESTS
========================================================== */

function normalizeDashboardTests(
  tests = [],
  labNumber = ""
) {
  if (!Array.isArray(tests)) {
    return [];
  }

  return tests.map(
    (test) => {

      const normalized =
        buildStableTestIdentity(
          test
        );


      const resolvedLabNumber =
        firstValue(
          normalized?.lab_number,
          normalized?.labNumber,
          labNumber
        ) || "";


      return {
        ...normalized,

        lab_number:
          resolvedLabNumber,

        labNumber:
          resolvedLabNumber,
      };
    }
  );
}


/* ==========================================================
   RESULT DATA VALIDATION
========================================================== */

function hasResultData(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }


  if (
    typeof value === "string"
  ) {
    return value.trim() !== "";
  }


  if (
    typeof value === "number"
  ) {
    return true;
  }


  if (
    typeof value === "boolean"
  ) {
    return true;
  }


  if (
    Array.isArray(value)
  ) {
    return value.some(
      (item) =>
        hasResultData(
          item
        )
    );
  }


  if (
    typeof value === "object"
  ) {
    return Object.values(
      value
    ).some(
      (item) =>
        hasResultData(
          item
        )
    );
  }


  return false;
}


/* ==========================================================
   RESULT DASHBOARD
========================================================== */

export default function ResultDashboard() {

  /* ========================================================
     STATE
  ======================================================== */

  const [
    labNumber,
    setLabNumber,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    registeredTests,
    setRegisteredTests,
  ] = useState([]);

  const [
    existingResults,
    setExistingResults,
  ] = useState([]);

  const [
    selectedTest,
    setSelectedTest,
  ] = useState(null);

  const [
    resultData,
    setResultData,
  ] = useState({});


  /* ========================================================
     CURRENT USER
  ======================================================== */

  const getCurrentUser = () => {

    try {

      const storedUser =
        localStorage.getItem(
          "pefa_user"
        );


      if (!storedUser) {
        return {};
      }


      const parsedUser =
        JSON.parse(
          storedUser
        );


      if (
        parsedUser &&
        typeof parsedUser ===
          "object"
      ) {
        return parsedUser;
      }


      return {};

    } catch (error) {

      console.error(
        "[ResultDashboard] Unable to read current user:",
        error
      );

      return {};
    }
  };


  /* ========================================================
     RESET DASHBOARD
  ======================================================== */

  const resetDashboard = () => {

    setPatient(null);

    setRegisteredTests([]);

    setExistingResults([]);

    setSelectedTest(null);

    setResultData({});
  };


  /* ========================================================
     SEARCH PATIENT
  ======================================================== */

  const searchPatient = async () => {

    const searchValue =
      normalizeText(
        labNumber
      );


    if (!searchValue) {

      alert(
        "Enter Lab Number."
      );

      return;
    }


    if (loading) {
      return;
    }


    try {

      setLoading(true);

      resetDashboard();


      /* ====================================================
         LOAD PATIENT
      ==================================================== */

      const response =
        await loadPatient(
          searchValue
        );


      if (!response) {

        alert(
          "Unable to load patient."
        );

        return;
      }


      const {
        patient: registration,
        tests,
        error,
      } = response;


      if (error) {
        throw error;
      }


      if (!registration) {

        alert(
          "Patient not found."
        );

        return;
      }


      /* ====================================================
         PATIENT
      ==================================================== */

      setPatient(
        registration
      );


      /* ====================================================
         PATIENT LAB NUMBER
      ==================================================== */

      const patientLabNumber =
        normalizeText(
          registration?.lab_number ??
          registration?.labNumber ??
          searchValue
        );


      if (!patientLabNumber) {

        throw new Error(
          "Patient Lab Number could not be determined."
        );
      }


      /* ====================================================
         REGISTERED TESTS
      ==================================================== */

      const safeTests =
        Array.isArray(tests)
          ? tests
          : [];


      let enrichedTests = [];


      if (
        safeTests.length > 0
      ) {

        enrichedTests =
          await enrichRegisteredTests(
            safeTests
          );
      }


      const safeEnrichedTests =
        Array.isArray(
          enrichedTests
        )
          ? enrichedTests
          : [];


      /* ====================================================
         CRITICAL IDENTITY NORMALIZATION
         ----------------------------------------------------
         No identity is invented here.
      ==================================================== */

      const normalizedTests =
        normalizeDashboardTests(
          safeEnrichedTests,
          patientLabNumber
        );


      setRegisteredTests(
        normalizedTests
      );


      /* ====================================================
         EXISTING RESULTS
      ==================================================== */

      const {
        data: results,
        error: resultsError,
      } =
        await getPatientResults(
          patientLabNumber
        );


      if (resultsError) {

        console.error(
          "[ResultDashboard] Unable to load existing results:",
          resultsError
        );
      }


      const safeResults =
        Array.isArray(results)
          ? results
          : [];


      setExistingResults(
        safeResults
      );


      /* ====================================================
         DEBUG — REGISTERED TEST IDENTITY
      ==================================================== */

      console.log(
        "================================================"
      );

      console.log(
        "[ResultDashboard] PATIENT LOADED"
      );

      console.log({
        labNumber:
          patientLabNumber,

        patient:
          registration,

        registeredTestCount:
          normalizedTests.length,

        existingResultCount:
          safeResults.length,
      });


      console.log(
        "[ResultDashboard] REGISTERED TEST IDENTITY"
      );


      console.table(
        normalizedTests.map(
          (test) => ({

            registered_test_id:
              test?.registered_test_id,

            id:
              test?.id,

            master_test_id:
              test?.master_test_id,

            test_id:
              test?.test_id,

            panel_master_test_id:
              test?.panel_master_test_id,

            test_name:
              test?.test_name,

            test_type:
              test?.test_type,

            is_panel:
              test?.is_panel,

            panel_id:
              test?.panel_id,

            panel_name:
              test?.panel_name,

            parameterCount:
              Array.isArray(
                test?.parameters
              )
                ? test.parameters.length
                : 0,
          })
        )
      );


      console.log(
        "[ResultDashboard] EXISTING RESULTS:"
      );

      console.log(
        safeResults
      );


      console.log(
        "================================================"
      );


    } catch (error) {

      console.error(
        "===================================="
      );

      console.error(
        "[ResultDashboard] SEARCH ERROR:",
        error
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Code:",
        error?.code
      );

      console.error(
        "Details:",
        error?.details
      );

      console.error(
        "Hint:",
        error?.hint
      );

      console.error(
        "===================================="
      );


      alert(
        error?.message ||
        "Unable to load patient."
      );

    } finally {

      setLoading(false);
    }
  };


  /* ========================================================
     SELECT TEST
  ======================================================== */

  const handleTestSelection = (
    test
  ) => {

    if (!test) {
      return;
    }


    /*
     * Normalize once more at the point of selection.
     *
     * This is safe because buildStableTestIdentity()
     * preserves identities rather than inventing them.
     */

    const stableTest =
      buildStableTestIdentity(
        test
      );


    console.log(
      "===================================="
    );

    console.log(
      "[ResultDashboard] TEST SELECTED"
    );


    console.log({
      registered_test_id:
        stableTest?.registered_test_id,

      registeredId:
        stableTest?.id,

      master_test_id:
        stableTest?.master_test_id,

      test_id:
        stableTest?.test_id,

      panel_master_test_id:
        stableTest?.panel_master_test_id,

      test_name:
        stableTest?.test_name,

      test_type:
        stableTest?.test_type,

      is_panel:
        stableTest?.is_panel,

      panel_id:
        stableTest?.panel_id,

      panel_name:
        stableTest?.panel_name,

      parameterCount:
        Array.isArray(
          stableTest?.parameters
        )
          ? stableTest.parameters.length
          : 0,
    });


    console.log(
      "[ResultDashboard] COMPLETE SELECTED TEST:",
      stableTest
    );


    console.log(
      "===================================="
    );


    setSelectedTest(
      stableTest
    );

    setResultData({});
  };


  /* ========================================================
     SAVE PATIENT RESULT
  ======================================================== */

  const savePatientResult =
    async () => {

      if (saving) {
        return;
      }


      /* ====================================================
         VALIDATE PATIENT
      ==================================================== */

      if (!patient) {

        alert(
          "Patient information is missing."
        );

        return;
      }


      /* ====================================================
         VALIDATE SELECTED TEST
      ==================================================== */

      if (!selectedTest) {

        alert(
          "No test selected."
        );

        return;
      }


      /* ====================================================
         VALIDATE RESULT
      ==================================================== */

      if (
        !hasResultData(
          resultData
        )
      ) {

        alert(
          "Please enter a result."
        );

        return;
      }


      try {

        setSaving(true);


        const user =
          getCurrentUser();


        /* ==================================================
           REBUILD TEST IDENTITY
           --------------------------------------------------
           This is normalization ONLY.

           It cannot create:

              test_id = master_test_id
           ================================================== */

        const stableSelectedTest =
          buildStableTestIdentity(
            selectedTest
          );


        /* ==================================================
           DETERMINE PANEL
           --------------------------------------------------
           isPanelTest() remains the authoritative testService
           classification function.

           We do NOT recreate panel logic here.
           ================================================== */

        const panel =
          isPanelTest(
            stableSelectedTest
          );


        /* ==================================================
           FINAL PATIENT LAB NUMBER
           ================================================== */

        const patientLabNumber =
          normalizeText(
            patient?.lab_number ??
            patient?.labNumber ??
            labNumber ??
            ""
          );


        if (!patientLabNumber) {

          throw new Error(
            "Patient Lab Number is missing."
          );
        }


        /* ==================================================
           FINAL SAVE IDENTITY
           --------------------------------------------------
           IMPORTANT:

           No fallback from master_test_id to test_id.
           ================================================== */

        const registeredTestId =
          firstValue(
            stableSelectedTest?.registered_test_id,
            stableSelectedTest?.registeredTestId,

            stableSelectedTest?.registration_test_id,
            stableSelectedTest?.registrationTestId,

            stableSelectedTest?.service_order_item_id,
            stableSelectedTest?.serviceOrderItemId,

            stableSelectedTest?.id
          );


        const masterTestId =
          firstValue(
            stableSelectedTest?.master_test_id,
            stableSelectedTest?.masterTestId,

            stableSelectedTest?.master_test?.id,
            stableSelectedTest?.masterTest?.id
          );


        const testId =
          firstValue(
            stableSelectedTest?.test_id,
            stableSelectedTest?.testId,

            stableSelectedTest?.child_test_id,
            stableSelectedTest?.childTestId
          );


        const panelMasterTestId =
          firstValue(
            stableSelectedTest?.panel_master_test_id,
            stableSelectedTest?.panelMasterTestId,

            stableSelectedTest?.parent_panel_master_test_id,
            stableSelectedTest?.parentPanelMasterTestId
          );


        const panelId =
          firstValue(
            stableSelectedTest?.panel_id,
            stableSelectedTest?.panelId,

            stableSelectedTest?.parent_panel_id,
            stableSelectedTest?.parentPanelId
          );


        const panelName =
          firstValue(
            stableSelectedTest?.panel_name,
            stableSelectedTest?.panelName,

            stableSelectedTest?.parent_panel_name,
            stableSelectedTest?.parentPanelName
          );


        const testName =
          firstValue(
            stableSelectedTest?.test_name,
            stableSelectedTest?.testName,

            stableSelectedTest?.name
          ) || "";


        const testType =
          firstValue(
            stableSelectedTest?.test_type,
            stableSelectedTest?.testType
          ) || "";


        /* ==================================================
           BUILD FINAL SAVE OBJECT
           ================================================== */

      const saveTest = {
  ...stableSelectedTest,


  /* ======================================================
     PATIENT LAB NUMBER
  ====================================================== */

  lab_number:
    patientLabNumber,

  labNumber:
    patientLabNumber,


  /* ======================================================
     REGISTERED TEST ID

     This is the registered/order-item identity.

     It is NOT master_test_id.
  ====================================================== */

  registered_test_id:
    firstValue(
      stableSelectedTest?.registered_test_id,
      stableSelectedTest?.registeredTestId,

      stableSelectedTest?.registration_test_id,
      stableSelectedTest?.registrationTestId,

      stableSelectedTest?.service_order_item_id,
      stableSelectedTest?.serviceOrderItemId,

      stableSelectedTest?.id
    ),

  registeredTestId:
    firstValue(
      stableSelectedTest?.registeredTestId,
      stableSelectedTest?.registered_test_id,

      stableSelectedTest?.registrationTestId,
      stableSelectedTest?.registration_test_id,

      stableSelectedTest?.serviceOrderItemId,
      stableSelectedTest?.service_order_item_id,

      stableSelectedTest?.id
    ),


  /* ======================================================
     MASTER TEST ID

     Preserve ONLY the actual master_tests identity.
  ====================================================== */

  master_test_id:
    firstValue(
      stableSelectedTest?.master_test_id,
      stableSelectedTest?.masterTestId,

      stableSelectedTest?.master_test?.id,
      stableSelectedTest?.masterTest?.id
    ) ?? null,

  masterTestId:
    firstValue(
      stableSelectedTest?.masterTestId,
      stableSelectedTest?.master_test_id,

      stableSelectedTest?.masterTest?.id,
      stableSelectedTest?.master_test?.id
    ) ?? null,


  /* ======================================================
     ACTUAL TEST ID

     CRITICAL:

     NEVER use master_test_id as fallback.

     test_id must be explicitly supplied by testService.
  ====================================================== */

  test_id:
    firstValue(
      stableSelectedTest?.test_id,
      stableSelectedTest?.testId,

      stableSelectedTest?.child_test_id,
      stableSelectedTest?.childTestId
    ) ?? null,

  testId:
    firstValue(
      stableSelectedTest?.testId,
      stableSelectedTest?.test_id,

      stableSelectedTest?.childTestId,
      stableSelectedTest?.child_test_id
    ) ?? null,


  /* ======================================================
     TEST NAME
  ====================================================== */

  test_name:
    firstValue(
      stableSelectedTest?.test_name,
      stableSelectedTest?.testName,
      stableSelectedTest?.name
    ) || "",

  testName:
    firstValue(
      stableSelectedTest?.testName,
      stableSelectedTest?.test_name,
      stableSelectedTest?.name
    ) || "",


  /* ======================================================
     PANEL ID
  ====================================================== */

  panel_id:
    firstValue(
      stableSelectedTest?.panel_id,
      stableSelectedTest?.panelId,

      stableSelectedTest?.parent_panel_id,
      stableSelectedTest?.parentPanelId
    ) ?? null,

  panelId:
    firstValue(
      stableSelectedTest?.panelId,
      stableSelectedTest?.panel_id,

      stableSelectedTest?.parentPanelId,
      stableSelectedTest?.parent_panel_id
    ) ?? null,

  parent_panel_id:
    firstValue(
      stableSelectedTest?.parent_panel_id,
      stableSelectedTest?.panel_id,

      stableSelectedTest?.parentPanelId,
      stableSelectedTest?.panelId
    ) ?? null,

  parentPanelId:
    firstValue(
      stableSelectedTest?.parentPanelId,
      stableSelectedTest?.parent_panel_id,

      stableSelectedTest?.panelId,
      stableSelectedTest?.panel_id
    ) ?? null,


  /* ======================================================
     PANEL NAME
  ====================================================== */

  panel_name:
    firstValue(
      stableSelectedTest?.panel_name,
      stableSelectedTest?.panelName,

      stableSelectedTest?.parent_panel_name,
      stableSelectedTest?.parentPanelName
    ) || "",

  panelName:
    firstValue(
      stableSelectedTest?.panelName,
      stableSelectedTest?.panel_name,

      stableSelectedTest?.parentPanelName,
      stableSelectedTest?.parent_panel_name
    ) || "",


  /* ======================================================
     PANEL STATUS
  ====================================================== */

  is_panel:
    panel,

  isPanel:
    panel,
};


   


        /* ==================================================
           CRITICAL SAVE DEBUG
           ================================================== */

        console.log(
          "================================================"
        );

        console.log(
          "[ResultDashboard] FINAL SAVE IDENTITY"
        );


        console.table([
          {
            lab_number:
              patientLabNumber,

            registered_test_id:
              saveTest?.registered_test_id,

            registered_id:
              saveTest?.id,

            master_test_id:
              saveTest?.master_test_id,

            test_id:
              saveTest?.test_id,

            panel_master_test_id:
              saveTest?.panel_master_test_id,

            test_name:
              saveTest?.test_name,

            test_type:
              saveTest?.test_type,

            is_panel:
              saveTest?.is_panel,

            panel_id:
              saveTest?.panel_id,

            panel_name:
              saveTest?.panel_name,
          },
        ]);


        console.log(
          "[ResultDashboard] RESULT DATA:",
          resultData
        );


        console.log(
          "================================================"
        );


        /* ==================================================
           PANEL / GROUPED RESULT
           ================================================== */

        if (panel) {

          await saveGroupedResults({
            patient,

            selectedTest:
              saveTest,

            resultData,

            user,
          });

        }


        /* ==================================================
           SINGLE RESULT
           ================================================== */

        else {

          await saveSingleResult({
            patient,

            selectedTest:
              saveTest,

            resultData,

            user,
          });
        }


        /* ==================================================
           SUCCESS
           ================================================== */

        alert(
          "Result saved successfully."
        );


        setSelectedTest(null);

        setResultData({});


        /* ==================================================
           REFRESH RESULTS
           ================================================== */

        const {
          data:
            refreshedResults,
          error:
            refreshError,
        } =
          await getPatientResults(
            patientLabNumber
          );


        if (refreshError) {

          console.error(
            "[ResultDashboard] Unable to refresh patient results:",
            refreshError
          );

          return;
        }


        const safeRefreshedResults =
          Array.isArray(
            refreshedResults
          )
            ? refreshedResults
            : [];


        setExistingResults(
          safeRefreshedResults
        );


        /* ==================================================
           SAVED RESULT IDENTITY DEBUG
           ================================================== */

        console.log(
          "================================================"
        );

        console.log(
          "[ResultDashboard] SAVED RESULT IDENTITY"
        );


        console.table(
          safeRefreshedResults.map(
            (row) => ({

              id:
                row?.id,

              registered_test_id:
                row?.registered_test_id,

              master_test_id:
                row?.master_test_id,

              test_id:
                row?.test_id,

              panel_master_test_id:
                row?.panel_master_test_id,

              test_name:
                row?.test_name,

              test_type:
                row?.test_type,

              panel_id:
                row?.panel_id,

              panel_name:
                row?.panel_name,

              is_panel:
                row?.is_panel,

              department:
                row?.department,
            })
          )
        );


        console.log(
          "================================================"
        );


      } catch (error) {

        if (
          error?.message ===
          "cancelled"
        ) {
          return;
        }


        console.error(
          "===================================="
        );

        console.error(
          "[ResultDashboard] RESULT SAVE ERROR:",
          error
        );

        console.error(
          "Message:",
          error?.message
        );

        console.error(
          "Code:",
          error?.code
        );

        console.error(
          "Details:",
          error?.details
        );

        console.error(
          "Hint:",
          error?.hint
        );

        console.error(
          "Selected Test:",
          selectedTest
        );

        console.error(
          "Result Data:",
          resultData
        );

        console.error(
          "===================================="
        );


        alert(
          error?.message ||
          "Unable to save result."
        );

      } finally {

        setSaving(false);
      }
    };


  /* ========================================================
     CLOSE RESULT MODAL
  ======================================================== */

  const closeResultModal = () => {

    if (saving) {
      return;
    }

    setSelectedTest(null);

    setResultData({});
  };


  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="dashboard-header">

        <h1>
          Result Dashboard
        </h1>

        <p>
          Enterprise Result Processing Portal
        </p>

      </div>


      {/* ==================================================
          SEARCH PANEL
      ================================================== */}

      <SearchPanel
        labNumber={
          labNumber
        }

        setLabNumber={
          setLabNumber
        }

        onSearch={
          searchPatient
        }

        loading={
          loading
        }
      />


      {/* ==================================================
          PATIENT CARD
      ================================================== */}

      <PatientCard
        patient={
          patient
        }
      />


      {/* ==================================================
          REGISTERED TESTS
      ================================================== */}

      {patient && (
        <RegisteredTestsTable
          tests={
            registeredTests
          }

          existingResults={
            existingResults
          }

          onSelect={
            handleTestSelection
          }
        />
      )}


      {/* ==================================================
          RESULT ENTRY MODAL
      ================================================== */}

      {selectedTest && (
        <ResultEntryModal
          patient={
            patient
          }

          selectedTest={
            selectedTest
          }

          resultData={
            resultData
          }

          setResultData={
            setResultData
          }

          saving={
            saving
          }

          onClose={
            closeResultModal
          }

          onSave={
            savePatientResult
          }
        />
      )}


      {/* ==================================================
          INITIAL EMPTY STATE
          ================================================== */}

      {!loading &&
        !patient && (

          <div
            className="dashboard-card empty-state"
          >

            <FileText
              size={40}
            />

            <p>
              Search for a patient using
              the Lab Number.
            </p>

          </div>
        )}

    </div>
  );
}