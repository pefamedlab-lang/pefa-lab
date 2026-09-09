import {
  AlertCircle,
  X,
} from "lucide-react";

import ResultTemplateRenderer from "./results/ResultTemplateRenderer";

/* ==========================================================
   RESULT ENTRY MODAL
   ----------------------------------------------------------
   RESPONSIBILITIES
   ----------------------------------------------------------
   - Display selected patient
   - Display selected test
   - Pass complete selected test to renderer
   - Pass resultData to renderer
   - Receive result changes from renderer
   - Provide Save / Cancel controls

   THIS COMPONENT DOES NOT:
   - Query Supabase
   - Resolve master tests
   - Query panel_tests
   - Determine panel relationships
   - Route individual forms
   - Save results
   - Handle printing
========================================================== */

export default function ResultEntryModal({
  patient = null,
  selectedTest = null,
  resultData = {},
  setResultData,
  saving = false,
  onClose,
  onSave,
}) {
  /* ========================================================
     SAFETY
  ======================================================== */

  if (!selectedTest) {
    return null;
  }

  /* ========================================================
     PATIENT HELPERS
  ======================================================== */

  const patientName =
    patient?.full_name ??
    patient?.patient_name ??
    patient?.name ??
    "Unknown Patient";

  const labNumber =
    patient?.lab_number ??
    patient?.labNumber ??
    "—";

  /* ========================================================
     TEST HELPERS
  ======================================================== */

  /*
   * For panels, panel_name is preferred for the visible
   * heading when available.
   *
   * For single tests, test_name is used.
   */
  const testName =
    selectedTest?.panel_name ??
    selectedTest?.panelName ??
    selectedTest?.test_name ??
    selectedTest?.testName ??
    selectedTest?.name ??
    "Laboratory Test";

  const department =
    selectedTest?.department ??
    "Laboratory";

  const testType =
    selectedTest?.test_type ??
    selectedTest?.testType ??
    (
      selectedTest?.is_panel ||
      selectedTest?.isPanel
        ? "Panel"
        : "Single Test"
    );

  const testCode =
    selectedTest?.test_code ??
    selectedTest?.testCode ??
    "";

  const specimen =
    selectedTest?.specimen ??
    selectedTest?.specimen_type ??
    selectedTest?.specimenType ??
    "";

  /* ========================================================
     DEBUG SELECTED TEST
     --------------------------------------------------------
     This is intentionally kept here while we repair the
     Result Entry pipeline.

     It allows us to verify that the complete enriched
     object reaches the modal before rendering.
  ======================================================== */

  console.log(
    "[ResultEntryModal] Selected test received:",
    {
      id:
        selectedTest?.id,

      registeredTestId:
        selectedTest?.registered_test_id ??
        selectedTest?.registeredTestId,

      masterTestId:
        selectedTest?.master_test_id ??
        selectedTest?.masterTestId,

      testName:
        selectedTest?.test_name ??
        selectedTest?.testName,

      panelName:
        selectedTest?.panel_name ??
        selectedTest?.panelName,

      testType:
        selectedTest?.test_type ??
        selectedTest?.testType,

      isPanel:
        selectedTest?.is_panel ??
        selectedTest?.isPanel,

      panelId:
        selectedTest?.panel_id ??
        selectedTest?.panelId,

      templateType:
        selectedTest?.template_type ??
        selectedTest?.templateType,

      parameterCount:
        Array.isArray(
          selectedTest?.parameters
        )
          ? selectedTest.parameters.length
          : 0,

      panelTestCount:
        Array.isArray(
          selectedTest?.panelTests
        )
          ? selectedTest.panelTests.length
          : 0,

      panelTestsCount:
        Array.isArray(
          selectedTest?.panel_tests
        )
          ? selectedTest.panel_tests.length
          : 0,

      groupedTestCount:
        Array.isArray(
          selectedTest?.groupedTests
        )
          ? selectedTest.groupedTests.length
          : 0,

      groupedTestsCount:
        Array.isArray(
          selectedTest?.grouped_tests
        )
          ? selectedTest.grouped_tests.length
          : 0,
    }
  );

  /* ========================================================
     RESULT CHANGE
     --------------------------------------------------------
     Supports both:

       setResultData(newValue)

     and:

       setResultData(previous => newValue)
  ======================================================== */

  const handleResultChange = (
    valueOrUpdater
  ) => {
    if (
      typeof setResultData !==
      "function"
    ) {
      return;
    }

    setResultData(
      valueOrUpdater
    );
  };

  /* ========================================================
     SAVE
  ======================================================== */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (
      typeof onSave !==
      "function"
    ) {
      console.error(
        "[ResultEntryModal] onSave is not a function."
      );

      return;
    }

    try {
      await onSave();
    } catch (error) {
      /*
       * The parent save handler owns error handling.
       * This catch prevents an unhandled promise rejection
       * if a future parent implementation throws.
       */
      console.error(
        "[ResultEntryModal] SAVE HANDLER ERROR:",
        error
      );
    }
  };

  /* ========================================================
     CLOSE
  ======================================================== */

  const handleClose = () => {
    if (saving) {
      return;
    }

    if (
      typeof onClose !==
      "function"
    ) {
      return;
    }

    onClose();
  };

  /* ========================================================
     BACKDROP
     --------------------------------------------------------
     Only a click directly on the backdrop closes the modal.
     Clicking inside the modal does not close it.
  ======================================================== */

  const handleBackdropMouseDown = (
    event
  ) => {
    if (saving) {
      return;
    }

    if (
      event.target !==
      event.currentTarget
    ) {
      return;
    }

    handleClose();
  };

  /* ========================================================
     KEYBOARD
     --------------------------------------------------------
     Escape closes the modal when it is not saving.
  ======================================================== */

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Escape" &&
      !saving
    ) {
      handleClose();
    }
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div
      className="result-modal-backdrop"
      onMouseDown={
        handleBackdropMouseDown
      }
      onKeyDown={
        handleKeyDown
      }
      role="presentation"
    >
      <div
        className="result-entry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-entry-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="result-entry-modal-header">

          <div className="result-entry-heading">

            <div>

              <span className="result-entry-department">
                {department}
              </span>

              <h2
                id="result-entry-title"
              >
                {testName}
              </h2>

              <div className="result-entry-patient-summary">

                <span>
                  Patient:{" "}
                  <strong>
                    {patientName}
                  </strong>
                </span>

                <span>
                  Lab No:{" "}
                  <strong>
                    {labNumber}
                  </strong>
                </span>

              </div>

            </div>

          </div>

          <button
            type="button"
            className="result-entry-close-button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close result entry"
            title={
              saving
                ? "Saving..."
                : "Close"
            }
          >
            <X size={22} />
          </button>

        </div>

        {/* ==================================================
            TEST INFORMATION BAR
        ================================================== */}

        <div className="result-entry-test-bar">

          <div className="result-entry-test-meta">

            <span className="result-entry-meta-label">
              Test Type
            </span>

            <span className="result-entry-meta-value">
              {testType}
            </span>

          </div>

          {testCode && (
            <div className="result-entry-test-meta">

              <span className="result-entry-meta-label">
                Test Code
              </span>

              <span className="result-entry-meta-value">
                {testCode}
              </span>

            </div>
          )}

          {specimen && (
            <div className="result-entry-test-meta">

              <span className="result-entry-meta-label">
                Specimen
              </span>

              <span className="result-entry-meta-value">
                {specimen}
              </span>

            </div>
          )}

        </div>

        {/* ==================================================
            RESULT ENTRY BODY
        ================================================== */}

        <div className="result-entry-modal-body">

          <ResultTemplateRenderer
            /*
             * CRITICAL FIX
             *
             * ResultTemplateRenderer expects:
             *
             *   selectedTest
             *
             * NOT:
             *
             *   test
             *
             * Passing the wrong prop caused the renderer's
             * safety check to receive selectedTest = null
             * and return null, which produced the blank
             * result-entry form.
             */
            selectedTest={
              selectedTest
            }

            patient={
              patient
            }

            resultData={
              resultData
            }

            setResultData={
              handleResultChange
            }

            /*
             * Also pass parameters explicitly when available.
             *
             * ResultTemplateRenderer already knows how to
             * extract parameters from selectedTest, but this
             * preserves compatibility with its parameters prop.
             */
            parameters={
              Array.isArray(
                selectedTest?.parameters
              )
                ? selectedTest.parameters
                : []
            }
          />

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="result-entry-modal-footer">

          <div className="result-entry-footer-note">

            <AlertCircle
              size={16}
            />

            <span>
              Verify the entered result before
              saving.
            </span>

          </div>

          <div className="result-entry-footer-actions">

            <button
              type="button"
              className="result-entry-cancel-button"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="result-entry-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Result"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}