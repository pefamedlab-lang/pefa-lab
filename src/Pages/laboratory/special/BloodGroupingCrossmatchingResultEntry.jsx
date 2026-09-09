
/* ==========================================================
   PEFA LAB
   BLOOD GROUPING & CROSSMATCHING RESULT ENTRY
   ----------------------------------------------------------
   PURPOSE:
   - ABO Blood Grouping
   - Rh(D) Typing
   - Forward Grouping
   - Reverse Grouping
   - Antibody Screen
   - Crossmatching
   - Compatibility interpretation
   - Blood unit / donor details
   - Independent special-test result entry
   - Supports NEW RESULT and EDIT EXISTING RESULT
   ----------------------------------------------------------
   IMPORTANT:
   - Existing database payload structure is preserved.
   - No direct Supabase persistence.
   - Parent controls persistence through onSave().
   ========================================================== */

import React, { useMemo, useState } from "react";
import {
  Save,
  Loader2,
  Droplets,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  X,
  RotateCcw,
} from "lucide-react";

/* ==========================================================
   CONSTANTS
   ========================================================== */

const INITIAL_CROSSMATCH = {
  donorUnit: "",
  donorBloodGroup: "",
  donorRh: "",
  majorPhase: "",
  minorPhase: "",
  immediateSpin: "",
  antiglobulin: "",
  compatibility: "",
  remarks: "",
};

const BLOOD_GROUPS = [
  "A",
  "B",
  "AB",
  "O",
];

const RH_OPTIONS = [
  "Positive",
  "Negative",
];

const REACTION_OPTIONS = [
  "Negative",
  "1+",
  "2+",
  "3+",
  "4+",
];

const COMPATIBILITY_OPTIONS = [
  "Compatible",
  "Incompatible",
  "Not Tested",
];

const RESULT_OPTIONS = [
  "Negative",
  "Positive",
  "Reactive",
  "Non-Reactive",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const createEmptyCrossmatch = () => ({
  ...INITIAL_CROSSMATCH,
});

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function BloodGroupingCrossmatchingResultEntry({
  registration = null,
  result = null,
  onSave,
  saving: externalSaving = false,
}) {
  /* ========================================================
     PATIENT INFORMATION
     ======================================================== */

  const patient = useMemo(
    () => ({
      patientId:
        registration?.patient_id ||
        result?.patient_id ||
        "",

      labNumber:
        registration?.lab_number ||
        result?.lab_number ||
        "",

      patientName:
        registration?.full_name ||
        registration?.patient_name ||
        result?.patient_name ||
        "",

      sex:
        registration?.sex ||
        result?.sex ||
        "",

      age:
        registration?.age ||
        result?.age ||
        "",

      clinicalHistory:
        registration?.clinical_history ||
        result?.clinical_history ||
        "",
    }),
    [registration, result]
  );

  /* ========================================================
     INITIAL FORM STATE
     ======================================================== */

  const getInitialForm = () => ({
    aboGroup:
      result?.abo_group || "",

    rhType:
      result?.rh_type || "",

    forwardAntiA:
      result?.forward_anti_a || "",

    forwardAntiB:
      result?.forward_anti_b || "",

    forwardAntiAB:
      result?.forward_anti_ab || "",

    forwardAntiD:
      result?.forward_anti_d || "",

    reverseA1Cells:
      result?.reverse_a1_cells || "",

    reverseBCells:
      result?.reverse_b_cells || "",

    reverseOCells:
      result?.reverse_o_cells || "",

    antibodyScreen:
      result?.antibody_screen || "",

    directAntiglobulinTest:
      result?.direct_antiglobulin_test || "",

    autoControl:
      result?.auto_control || "",

    crossmatches:
      Array.isArray(result?.crossmatches) &&
      result.crossmatches.length
        ? result.crossmatches.map((item) => ({
            ...INITIAL_CROSSMATCH,
            ...item,
          }))
        : [
            createEmptyCrossmatch(),
          ],

    generalRemarks:
      result?.remarks || "",
  });

  /* ========================================================
     STATE
     ======================================================== */

  const [form, setForm] = useState(
    getInitialForm
  );

  /*
   * Existing results begin in VIEW MODE.
   * New results are editable immediately.
   */
  const [isEditing, setIsEditing] = useState(
    !result
  );

  const [localSaving, setLocalSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const saving =
    externalSaving || localSaving;

  const hasExistingResult =
    Boolean(result);

  /* ========================================================
     UPDATE FIELD
     ======================================================== */

  const updateField = (
    field,
    value
  ) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  /* ========================================================
     ADD CROSSMATCH
     ======================================================== */

  const addCrossmatch = () => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,

      crossmatches: [
        ...(current.crossmatches || []),
        createEmptyCrossmatch(),
      ],
    }));

    setSuccess("");
    setError("");
  };

  /* ========================================================
     REMOVE CROSSMATCH
     ======================================================== */

  const removeCrossmatch = (
    index
  ) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => {
      const currentItems =
        current.crossmatches || [];

      if (currentItems.length === 1) {
        return current;
      }

      return {
        ...current,

        crossmatches:
          currentItems.filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
      };
    });

    setSuccess("");
    setError("");
  };

  /* ========================================================
     UPDATE CROSSMATCH
     ======================================================== */

  const updateCrossmatch = (
    index,
    field,
    value
  ) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,

      crossmatches:
        (current.crossmatches || []).map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));

    setSuccess("");
    setError("");
  };

  /* ========================================================
     EDIT RESULT
     ======================================================== */

  const handleEdit = () => {
    if (!hasExistingResult) {
      return;
    }

    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const handleCancelEdit = () => {
    /*
     * Restore the exact result received
     * from the parent.
     */
    setForm({
      aboGroup:
        result?.abo_group || "",

      rhType:
        result?.rh_type || "",

      forwardAntiA:
        result?.forward_anti_a || "",

      forwardAntiB:
        result?.forward_anti_b || "",

      forwardAntiAB:
        result?.forward_anti_ab || "",

      forwardAntiD:
        result?.forward_anti_d || "",

      reverseA1Cells:
        result?.reverse_a1_cells || "",

      reverseBCells:
        result?.reverse_b_cells || "",

      reverseOCells:
        result?.reverse_o_cells || "",

      antibodyScreen:
        result?.antibody_screen || "",

      directAntiglobulinTest:
        result?.direct_antiglobulin_test ||
        "",

      autoControl:
        result?.auto_control || "",

      crossmatches:
        Array.isArray(
          result?.crossmatches
        ) &&
        result.crossmatches.length
          ? result.crossmatches.map(
              (item) => ({
                ...INITIAL_CROSSMATCH,
                ...item,
              })
            )
          : [
              createEmptyCrossmatch(),
            ],

      generalRemarks:
        result?.remarks || "",
    });

    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  /* ========================================================
     COMPATIBILITY CLASS
     ======================================================== */

  const getCompatibilityClass =
    (value) => {
      if (
        value === "Compatible"
      ) {
        return "is-compatible";
      }

      if (
        value === "Incompatible"
      ) {
        return "is-incompatible";
      }

      return "";
    };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.aboGroup) {
      setError(
        "Please select the ABO blood group."
      );
      return;
    }

    if (!form.rhType) {
      setError(
        "Please select the Rh(D) type."
      );
      return;
    }

    /*
     * IMPORTANT:
     * This payload intentionally preserves
     * the existing database structure.
     */
    const payload = {
      patient_id:
        patient.patientId || null,

      lab_number:
        patient.labNumber || null,

      patient_name:
        patient.patientName || null,

      abo_group:
        form.aboGroup,

      rh_type:
        form.rhType,

      forward_anti_a:
        form.forwardAntiA,

      forward_anti_b:
        form.forwardAntiB,

      forward_anti_ab:
        form.forwardAntiAB,

      forward_anti_d:
        form.forwardAntiD,

      reverse_a1_cells:
        form.reverseA1Cells,

      reverse_b_cells:
        form.reverseBCells,

      reverse_o_cells:
        form.reverseOCells,

      antibody_screen:
        form.antibodyScreen,

      direct_antiglobulin_test:
        form.directAntiglobulinTest,

      auto_control:
        form.autoControl,

      crossmatches:
        form.crossmatches,

      remarks:
        form.generalRemarks,

      result_status:
        "Entered",
    };

    try {
      setLocalSaving(true);

      if (
        typeof onSave ===
        "function"
      ) {
        await onSave(payload);
      }

      setSuccess(
        hasExistingResult
          ? "Blood grouping and crossmatching result updated successfully."
          : "Blood grouping and crossmatching result saved successfully."
      );

      /*
       * After a successful save/update,
       * return existing results to VIEW MODE.
       */
      if (hasExistingResult) {
        setIsEditing(false);
      }
    } catch (saveError) {
      console.error(
        "BloodGroupingCrossmatchingResultEntry save:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save blood grouping and crossmatching result."
      );
    } finally {
      setLocalSaving(false);
    }
  };

  /* ========================================================
     RENDER SELECT
     ======================================================== */

  const renderSelect = (
    value,
    onChange,
    options,
    placeholder = "Select"
  ) => (
    <select
      value={value || ""}
      disabled={!isEditing || saving}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
    >
      <option value="">
        {placeholder}
      </option>

      {options.map(
        (option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        )
      )}
    </select>
  );

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="blood-grouping-crossmatch">

      {/* ====================================================
          HEADER
         ==================================================== */}

      <div className="blood-grouping-crossmatch__header">

        <div className="blood-grouping-crossmatch__header-icon">
          <Droplets size={24} />
        </div>

        <div className="blood-grouping-crossmatch__header-content">
          <div className="blood-grouping-crossmatch__eyebrow">
            PEFA LABORATORY
          </div>

          <h1>
            Blood Grouping & Crossmatching
          </h1>

          <p>
            ABO/Rh typing, antibody
            screening and compatibility
            testing
          </p>
        </div>

        {/* ==================================================
            EDITING CONTROLS
           ================================================== */}

        <div className="blood-grouping-crossmatch__header-actions">

          {hasExistingResult &&
            !isEditing && (
              <button
                type="button"
                className="blood-grouping-crossmatch__edit-button"
                onClick={
                  handleEdit
                }
                disabled={saving}
              >
                <Pencil
                  size={17}
                />
                Edit Result
              </button>
            )}

          {hasExistingResult &&
            isEditing && (
              <button
                type="button"
                className="blood-grouping-crossmatch__cancel-edit-button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                <X size={17} />
                Cancel Edit
              </button>
            )}

        </div>
      </div>

      {/* ====================================================
          EDIT MODE INDICATOR
         ==================================================== */}

      {hasExistingResult && (
        <div
          className={`blood-grouping-crossmatch__mode ${
            isEditing
              ? "blood-grouping-crossmatch__mode--editing"
              : "blood-grouping-crossmatch__mode--viewing"
          }`}
        >
          {isEditing ? (
            <>
              <Pencil
                size={15}
              />
              <span>
                EDIT MODE — You are modifying the saved result.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2
                size={15}
              />
              <span>
                SAVED RESULT — Click "Edit Result" to make changes.
              </span>
            </>
          )}
        </div>
      )}

      {/* ====================================================
          PATIENT INFORMATION
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-title">
          <span>
            Patient Information
          </span>
        </div>

        <div className="blood-grouping-crossmatch__patient-grid">

          <div>
            <label>
              Patient Name
            </label>

            <strong>
              {patient.patientName ||
                "—"}
            </strong>
          </div>

          <div>
            <label>
              Patient ID
            </label>

            <strong>
              {patient.patientId ||
                "—"}
            </strong>
          </div>

          <div>
            <label>
              Lab Number
            </label>

            <strong>
              {patient.labNumber ||
                "—"}
            </strong>
          </div>

          <div>
            <label>
              Sex
            </label>

            <strong>
              {patient.sex ||
                "—"}
            </strong>
          </div>

          <div>
            <label>
              Age
            </label>

            <strong>
              {patient.age ||
                "—"}
            </strong>
          </div>

          <div className="blood-grouping-crossmatch__patient-history">
            <label>
              Clinical History
            </label>

            <strong>
              {patient.clinicalHistory ||
                "—"}
            </strong>
          </div>

        </div>
      </section>

      {/* ====================================================
          MESSAGES
         ==================================================== */}

      {error && (
        <div className="blood-grouping-crossmatch__message blood-grouping-crossmatch__message--error">
          <AlertCircle size={18} />
          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="blood-grouping-crossmatch__message blood-grouping-crossmatch__message--success">
          <CheckCircle2 size={18} />
          <span>
            {success}
          </span>
        </div>
      )}

      {/* ====================================================
          ABO / RH
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              01
            </span>

            <div>
              <h2>
                ABO & Rh(D) Blood Grouping
              </h2>

              <p>
                Determine the patient's ABO
                and Rh blood group.
              </p>
            </div>
          </div>

        </div>

        <div className="blood-grouping-crossmatch__primary-result">

          <div className="blood-grouping-crossmatch__result-box">
            <label>
              ABO Group
            </label>

            {renderSelect(
              form.aboGroup,
              (value) =>
                updateField(
                  "aboGroup",
                  value
                ),
              BLOOD_GROUPS,
              "Select ABO group"
            )}
          </div>

          <div className="blood-grouping-crossmatch__result-box">
            <label>
              Rh(D)
            </label>

            {renderSelect(
              form.rhType,
              (value) =>
                updateField(
                  "rhType",
                  value
                ),
              RH_OPTIONS,
              "Select Rh type"
            )}
          </div>

          <div className="blood-grouping-crossmatch__blood-group-display">

            <span>
              FINAL BLOOD GROUP
            </span>

            <strong>
              {form.aboGroup
                ? `${form.aboGroup}${
                    form.rhType ===
                    "Positive"
                      ? "+"
                      : form.rhType ===
                          "Negative"
                        ? "−"
                        : ""
                  }`
                : "—"}
            </strong>

          </div>

        </div>
      </section>

      {/* ====================================================
          FORWARD GROUPING
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              02
            </span>

            <div>
              <h2>
                Forward Grouping
              </h2>

              <p>
                Cell grouping using antisera.
              </p>
            </div>
          </div>

        </div>

        <div className="blood-grouping-crossmatch__table-wrapper">

          <table className="blood-grouping-crossmatch__table">

            <thead>
              <tr>
                <th>
                  REAGENT
                </th>

                <th>
                  REACTION
                </th>

                <th>
                  INTERPRETATION
                </th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  <strong>
                    Anti-A
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.forwardAntiA,
                    (value) =>
                      updateField(
                        "forwardAntiA",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>

                <td>
                  {form.forwardAntiA ||
                    "—"}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    Anti-B
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.forwardAntiB,
                    (value) =>
                      updateField(
                        "forwardAntiB",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>

                <td>
                  {form.forwardAntiB ||
                    "—"}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    Anti-AB
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.forwardAntiAB,
                    (value) =>
                      updateField(
                        "forwardAntiAB",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>

                <td>
                  {form.forwardAntiAB ||
                    "—"}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    Anti-D
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.forwardAntiD,
                    (value) =>
                      updateField(
                        "forwardAntiD",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>

                <td>
                  {form.forwardAntiD ||
                    "—"}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================
          REVERSE GROUPING
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              03
            </span>

            <div>
              <h2>
                Reverse Grouping
              </h2>

              <p>
                Serum/plasma testing with
                reagent red cells.
              </p>
            </div>
          </div>

        </div>

        <div className="blood-grouping-crossmatch__table-wrapper">

          <table className="blood-grouping-crossmatch__table">

            <thead>
              <tr>
                <th>
                  REAGENT CELLS
                </th>

                <th>
                  REACTION
                </th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  <strong>
                    A1 Cells
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.reverseA1Cells,
                    (value) =>
                      updateField(
                        "reverseA1Cells",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    B Cells
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.reverseBCells,
                    (value) =>
                      updateField(
                        "reverseBCells",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    O Cells
                  </strong>
                </td>

                <td>
                  {renderSelect(
                    form.reverseOCells,
                    (value) =>
                      updateField(
                        "reverseOCells",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================
          ANTIBODY TESTING
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              04
            </span>

            <div>
              <h2>
                Antibody Testing
              </h2>

              <p>
                Record antibody screening and
                antiglobulin findings.
              </p>
            </div>
          </div>

        </div>

        <div className="blood-grouping-crossmatch__form-grid">

          <div className="blood-grouping-crossmatch__field">
            <label>
              Antibody Screen
            </label>

            {renderSelect(
              form.antibodyScreen,
              (value) =>
                updateField(
                  "antibodyScreen",
                  value
                ),
              RESULT_OPTIONS
            )}
          </div>

          <div className="blood-grouping-crossmatch__field">
            <label>
              Direct Antiglobulin Test (DAT)
            </label>

            {renderSelect(
              form.directAntiglobulinTest,
              (value) =>
                updateField(
                  "directAntiglobulinTest",
                  value
                ),
              RESULT_OPTIONS
            )}
          </div>

          <div className="blood-grouping-crossmatch__field">
            <label>
              Auto Control
            </label>

            {renderSelect(
              form.autoControl,
              (value) =>
                updateField(
                  "autoControl",
                  value
                ),
              RESULT_OPTIONS
            )}
          </div>

        </div>
      </section>

      {/* ====================================================
          CROSSMATCHING
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              05
            </span>

            <div>
              <h2>
                Crossmatching
              </h2>

              <p>
                Record donor unit testing and
                compatibility.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="blood-grouping-crossmatch__add-button"
            onClick={
              addCrossmatch
            }
            disabled={
              !isEditing ||
              saving
            }
          >
            <Plus size={16} />
            Add Blood Unit
          </button>

        </div>

        {(
          form.crossmatches ||
          []
        ).map(
          (
            crossmatch,
            index
          ) => (
            <div
              className="blood-grouping-crossmatch__crossmatch"
              key={`crossmatch-${index}`}
            >

              <div className="blood-grouping-crossmatch__crossmatch-header">

                <div>
                  <span>
                    BLOOD UNIT{" "}
                    {index + 1}
                  </span>

                  <strong>
                    {crossmatch.donorUnit ||
                      "Unassigned Unit"}
                  </strong>
                </div>

                {(
                  form.crossmatches ||
                  []
                ).length > 1 && (
                  <button
                    type="button"
                    className="blood-grouping-crossmatch__remove-button"
                    onClick={() =>
                      removeCrossmatch(
                        index
                      )
                    }
                    disabled={
                      !isEditing ||
                      saving
                    }
                    title="Remove blood unit"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                )}

              </div>

              <div className="blood-grouping-crossmatch__form-grid">

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Donor Unit Number
                  </label>

                  <input
                    type="text"
                    value={
                      crossmatch.donorUnit ||
                      ""
                    }
                    placeholder="Enter unit number"
                    disabled={
                      !isEditing ||
                      saving
                    }
                    onChange={(
                      event
                    ) =>
                      updateCrossmatch(
                        index,
                        "donorUnit",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Donor ABO Group
                  </label>

                  {renderSelect(
                    crossmatch.donorBloodGroup,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "donorBloodGroup",
                        value
                      ),
                    BLOOD_GROUPS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Donor Rh(D)
                  </label>

                  {renderSelect(
                    crossmatch.donorRh,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "donorRh",
                        value
                      ),
                    RH_OPTIONS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Immediate Spin
                  </label>

                  {renderSelect(
                    crossmatch.immediateSpin,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "immediateSpin",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Major Phase
                  </label>

                  {renderSelect(
                    crossmatch.majorPhase,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "majorPhase",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Minor Phase
                  </label>

                  {renderSelect(
                    crossmatch.minorPhase,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "minorPhase",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Antiglobulin Phase
                  </label>

                  {renderSelect(
                    crossmatch.antiglobulin,
                    (value) =>
                      updateCrossmatch(
                        index,
                        "antiglobulin",
                        value
                      ),
                    REACTION_OPTIONS
                  )}
                </div>

                <div className="blood-grouping-crossmatch__field">
                  <label>
                    Compatibility
                  </label>

                  <select
                    className={getCompatibilityClass(
                      crossmatch.compatibility
                    )}
                    value={
                      crossmatch.compatibility ||
                      ""
                    }
                    disabled={
                      !isEditing ||
                      saving
                    }
                    onChange={(
                      event
                    ) =>
                      updateCrossmatch(
                        index,
                        "compatibility",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select compatibility
                    </option>

                    {COMPATIBILITY_OPTIONS.map(
                      (
                        option
                      ) => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              <div className="blood-grouping-crossmatch__field blood-grouping-crossmatch__field--full">

                <label>
                  Unit Remarks
                </label>

                <textarea
                  rows="2"
                  value={
                    crossmatch.remarks ||
                    ""
                  }
                  placeholder="Enter relevant crossmatching remarks"
                  disabled={
                    !isEditing ||
                    saving
                  }
                  onChange={(
                    event
                  ) =>
                    updateCrossmatch(
                      index,
                      "remarks",
                      event.target.value
                    )
                  }
                />

              </div>

            </div>
          )
        )}
      </section>

      {/* ====================================================
          REMARKS
         ==================================================== */}

      <section className="blood-grouping-crossmatch__card">

        <div className="blood-grouping-crossmatch__section-heading">

          <div>
            <span className="blood-grouping-crossmatch__section-number">
              06
            </span>

            <div>
              <h2>
                Final Remarks
              </h2>

              <p>
                Additional laboratory comments.
              </p>
            </div>
          </div>

        </div>

        <textarea
          className="blood-grouping-crossmatch__remarks"
          rows="4"
          value={
            form.generalRemarks ||
            ""
          }
          placeholder="Enter final laboratory remarks..."
          disabled={
            !isEditing ||
            saving
          }
          onChange={(
            event
          ) =>
            updateField(
              "generalRemarks",
              event.target.value
            )
          }
        />

      </section>

      {/* ====================================================
          ACTIONS
         ==================================================== */}

      <div className="blood-grouping-crossmatch__actions">

        <div className="blood-grouping-crossmatch__status">

          <span>
            Result Status
          </span>

          <strong>
            {isEditing
              ? hasExistingResult
                ? "Editing"
                : "New Result"
              : "Entered"}
          </strong>

        </div>

        <div className="blood-grouping-crossmatch__action-buttons">

          {hasExistingResult &&
            isEditing && (
              <button
                type="button"
                className="blood-grouping-crossmatch__cancel-button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                <RotateCcw
                  size={17}
                />
                Cancel Edit
              </button>
            )}

          {isEditing && (
            <button
              type="button"
              className="blood-grouping-crossmatch__save"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="blood-grouping-crossmatch__spin"
                />
              ) : (
                <Save
                  size={18}
                />
              )}

              {saving
                ? "Saving..."
                : hasExistingResult
                  ? "Save Changes"
                  : "Save Result"}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}