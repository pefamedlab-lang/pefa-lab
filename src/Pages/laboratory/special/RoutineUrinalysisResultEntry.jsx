
/* ==========================================================
   PEFA LAB
   ROUTINE URINALYSIS — RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/RoutineUrinalysisResultEntry.jsx

   PEFA LAB SPECIAL RESULT ENTRY STANDARD
   ----------------------------------------------------------
   - Premium uniform UI shared with other special forms.
   - Does NOT modify LaboratoryResultEntry.jsx.
   - Does NOT require resultData / setResultData.
   - Uses laboratory_results.result as the authoritative
     structured result storage.
   - Does NOT write unsupported ABO/urinalysis columns.
   - Initial save uses updateLaboratoryResult().
   - Editing uses replace_laboratory_result RPC.
   - Uses result_status = "Performed" because the database
     constraint permits:
       Pending
       Performed
       Verified
       Authorized
   - Structured urinalysis is serialized into result TEXT.
   ========================================================== */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FlaskConical,
  Loader2,
  Save,
  X,
} from "lucide-react";

import { supabase } from "../../../supabase";

import {
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";


/* ==========================================================
   CONSTANTS
   ========================================================== */

const TEST_TITLE = "Routine Urinalysis";
const DEPARTMENT = "Clinical Chemistry";

const RESULT_STATUS = "Performed";
const AUTHORIZATION_STATUS = "Pending";
const RELEASE_STATUS = "Pending";


/* ==========================================================
   OPTION LISTS
   ========================================================== */

const CHEMISTRY_OPTIONS = [
  "",
  "Negative",
  "Trace",
  "+",
  "++",
  "+++",
  "++++",
];

const NITRITE_OPTIONS = [
  "",
  "Negative",
  "Positive",
];

const UROBILINOGEN_OPTIONS = [
  "",
  "Normal",
  "Increased",
  "Markedly Increased",
];

const PHYSICAL_OPTIONS = {
  colour: [
    "",
    "Pale Yellow",
    "Straw",
    "Yellow",
    "Deep Yellow",
    "Amber",
    "Orange",
    "Red",
    "Brown",
    "Green",
    "Black",
  ],

  appearance: [
    "",
    "Clear",
    "Slightly Hazy",
"Slightly Turbid",
    "Hazy",
    "Cloudy",
    "Turbid",
    "Milky",
  ],
};

const MICROSCOPY_OPTIONS = {
  pusCells: [
    "",
    "Nil",
    "0–2 /HPF",
    "3–5 /HPF",
    "6–10 /HPF",
    "11–20 /HPF",
    "Numerous",
  ],

  rbc: [
    "",
    "Nil",
    "0–2 /HPF",
    "3–5 /HPF",
    "6–10 /HPF",
    "Numerous",
  ],

  epithelialCells: [
    "",
    "Nil",
    "+",
    "++",
 "+++",
    "Numerous",
  ],

  casts: [
    "",
    "Nil",
    "Hyaline Casts Present",
    "Granular Casts Present",
    "Few Casts Seen",
  ],

  crystals: [
    "",
    "Nil",
    "Calcium Oxalate",
    "Uric Acid",
    "Triple Phosphate",
    "Amorphous Urates",
  ],

  yeastCells: [
    "",
    "Nil",
    "+",
    "++",
 "+++",
    "Numerous",
  ],

  bacteria: [
    "",
     "Nil",
    "+",
    "++",
 "+++",
    "Numerous",
  ],

  parasites: [
    "",
    "Nil",
    "Schistosoma haematobium Seen",
    "Trichomonas vaginalis Seen",
  ],
};


/* ==========================================================
   EMPTY FORM
   ========================================================== */

const EMPTY_FORM = {
  colour: "",
  appearance: "",
  specificGravity: "",
  ph: "",

  protein: "",
  glucose: "",
  ketone: "",
  bilirubin: "",
  leucocyte: "",
  nitrite: "",
  blood: "",
  urobilinogen: "",

  pusCells: "",
  rbc: "",
  epithelialCells: "",
  casts: "",
  crystals: "",
  yeastCells: "",
  bacteria: "",
  parasites: "",

  comment: "",
  impression: "",
};


/* ==========================================================
   LABEL MAP
   ========================================================== */

const FIELD_LABELS = {
  pusCells: "Pus Cells",
  rbc: "RBC",
  epithelialCells: "Epithelial Cells",
  casts: "Casts",
  crystals: "Crystals",
  yeastCells: "Yeast Cells",
  bacteria: "Bacteria",
  parasites: "Parasites",
};


/* ==========================================================
   HELPERS
   ========================================================== */

const normalize = (value) =>
  String(value ?? "").trim();


/* ==========================================================
   EDITOR NAME
   ========================================================== */

const getEditorName = () => {
  if (typeof window === "undefined") {
    return "Laboratory User";
  }

  const candidates = [
    localStorage.getItem("editor_name"),
    localStorage.getItem("entered_by"),
    localStorage.getItem("performed_by"),
    localStorage.getItem("user_name"),
    localStorage.getItem("username"),
    localStorage.getItem("full_name"),
    localStorage.getItem("staff_name"),
    localStorage.getItem("current_user_name"),
  ];

  const value = candidates.find(
    (item) => normalize(item)
  );

  return normalize(value) || "Laboratory User";
};


/* ==========================================================
   SAFE RESULT PARSER
   ========================================================== */

const parseSavedResult = (value) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  const text = normalize(value);

  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch {
    // Plain text / legacy result.
  }

  return {
    rawResult: text,
  };
};


/* ==========================================================
   FORM HYDRATION
   ========================================================== */

const createInitialForm = (result) => {
  const row = result || {};

  const saved = parseSavedResult(
    row.result
  );

  /*
   * laboratory_results.result is the authoritative source.
   *
   * We deliberately do not depend on result_data here.
   */

  const source =
    saved &&
    typeof saved === "object"
      ? saved
      : {};

  const form = {
    ...EMPTY_FORM,
    ...source,
  };


  /* --------------------------------------------------------
     Legacy snake_case compatibility
     -------------------------------------------------------- */

  const aliases = {
    specificGravity: [
      source.specific_gravity,
    ],

    epithelialCells: [
      source.epithelial_cells,
    ],

    yeastCells: [
      source.yeast_cells,
    ],

    pusCells: [
      source.pus_cells,
    ],

    comment: [
      source.comment,
      row.comment,
    ],

    impression: [
      source.impression,
    ],
  };


  Object.entries(aliases).forEach(
    ([field, values]) => {

      const value = values.find(
        (item) =>
          item !== null &&
          item !== undefined &&
          normalize(item) !== ""
      );

      if (value !== undefined) {
        form[field] = value;
      }
    }
  );


  return Object.fromEntries(
    Object.keys(EMPTY_FORM).map(
      (key) => [
        key,
        normalize(form[key]),
      ]
    )
  );
};


/* ==========================================================
   AUTOMATIC INTERPRETATION
   ========================================================== */

const generateComment = (data) => {

  const protein =
    normalize(data.protein);

  const glucose =
    normalize(data.glucose);

  const leucocyte =
    normalize(data.leucocyte);

  const pusCells =
    normalize(data.pusCells);

  const rbc =
    normalize(data.rbc);

  const bacteria =
    normalize(data.bacteria);

  const blood =
    normalize(data.blood);


  /* --------------------------------------------------------
     UTI / INFLAMMATION
     -------------------------------------------------------- */

  const significantLeucocyte =
    ["+", "++", "+++", "++++"]
      .includes(leucocyte);

  const significantPusCells =
    pusCells === "Numerous" ||
    pusCells === "11–20 /HPF";

  const significantBacteria =
    bacteria === "Numerous";


  if (
    significantPusCells ||
    significantBacteria ||
    significantLeucocyte
  ) {

    return {
      comment:
        "Urinalysis shows findings suggestive of urinary tract inflammation/infection.",

      impression:
        "Findings may be consistent with urinary tract infection. Clinical correlation is advised.",
    };
  }


  /* --------------------------------------------------------
     GLYCOSURIA
     -------------------------------------------------------- */

  if (
    ["+", "++", "+++", "++++"]
      .includes(glucose)
  ) {

    return {
      comment:
        "Glucose is detected in the urine.",

      impression:
        "Glycosuria detected. Correlation with blood glucose assessment is recommended.",
    };
  }


  /* --------------------------------------------------------
     PROTEINURIA
     -------------------------------------------------------- */

  if (
    ["+", "++", "+++", "++++"]
      .includes(protein)
  ) {

    return {
      comment:
        "Protein is detected in the urine.",

      impression:
        "Proteinuria detected. Renal assessment and clinical correlation are recommended.",
    };
  }


  /* --------------------------------------------------------
     HAEMATURIA
     -------------------------------------------------------- */

  const significantBlood =
    Boolean(blood) &&
    blood !== "Negative";

  const significantRbc =
    Boolean(rbc) &&
    rbc !== "Nil" &&
    rbc !== "0–2 /HPF";


  if (
    significantBlood ||
    significantRbc
  ) {

    return {
      comment:
        "Blood/red blood cells are detected in the urine.",

      impression:
        "Haematuria present. Clinical correlation is advised.",
    };
  }


  /* --------------------------------------------------------
     NORMAL FINDINGS
     -------------------------------------------------------- */

  const normalProtein =
    protein === "Negative";

  const normalGlucose =
    glucose === "Negative";

  const normalPus =
    pusCells === "Nil" ||
    pusCells === "0–2 /HPF";

  const normalRbc =
    rbc === "Nil" ||
    rbc === "0–2 /HPF";

  const normalBacteria =
    bacteria === "Nil";

  const normalLeucocyte =
    leucocyte === "" ||
    leucocyte === "Negative";


  if (
    normalProtein &&
    normalGlucose &&
    normalPus &&
    normalRbc &&
    normalBacteria &&
    normalLeucocyte
  ) {

    return {
      comment:
        "Urinalysis findings are within normal limits.",

      impression:
        "No significant abnormality detected.",
    };
  }


  return {
    comment: "",
    impression: "",
  };
};


/* ==========================================================
   STRUCTURED RESULT
   ========================================================== */

const buildStructuredResult = (form) => ({
  test: TEST_TITLE,

  colour:
    normalize(form.colour),

  appearance:
    normalize(form.appearance),

  specificGravity:
    normalize(form.specificGravity),

  ph:
    normalize(form.ph),

  protein:
    normalize(form.protein),

  glucose:
    normalize(form.glucose),

  ketone:
    normalize(form.ketone),

  bilirubin:
    normalize(form.bilirubin),

  leucocyte:
    normalize(form.leucocyte),

  nitrite:
    normalize(form.nitrite),

  blood:
    normalize(form.blood),

  urobilinogen:
    normalize(form.urobilinogen),

  pusCells:
    normalize(form.pusCells),

  rbc:
    normalize(form.rbc),

  epithelialCells:
    normalize(form.epithelialCells),

  casts:
    normalize(form.casts),

  crystals:
    normalize(form.crystals),

  yeastCells:
    normalize(form.yeastCells),

  bacteria:
    normalize(form.bacteria),

  parasites:
    normalize(form.parasites),

  comment:
    normalize(form.comment),

  impression:
    normalize(form.impression),
});


/* ==========================================================
   SERIALIZE RESULT
   ========================================================== */

const serializeResult = (form) =>
  JSON.stringify(
    buildStructuredResult(form)
  );


/* ==========================================================
   COMPONENT
   ========================================================== */

export default function RoutineUrinalysisResultEntry({
  test,
  result,
  registration,
  patient,
  onSaved,
  onCancel,
  onBack,
  readOnly = false,
}) {

  /* --------------------------------------------------------
     FORM
     -------------------------------------------------------- */

  const [
    form,
    setForm,
  ] = useState(
    () => createInitialForm(result)
  );


  /* --------------------------------------------------------
     AUTHORITATIVE RESULT
     -------------------------------------------------------- */

  const [
    authoritativeResult,
    setAuthoritativeResult,
  ] = useState(
    result || null
  );


  /* --------------------------------------------------------
     UI STATE
     -------------------------------------------------------- */

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    editReason,
    setEditReason,
  ] = useState("");


  /* ========================================================
     RESULT ID
     ======================================================== */

  const resultId = useMemo(() => {

    const id =
      authoritativeResult?.id ||
      result?.id;

    if (!id) {
      return null;
    }

    const numericId =
      Number(id);

    return Number.isFinite(numericId)
      ? numericId
      : null;

  }, [
    authoritativeResult?.id,
    result?.id,
  ]);


  /* ========================================================
     HYDRATE WHEN RESULT CHANGES
     ======================================================== */

  useEffect(() => {

    if (!result) {
      return;
    }

    setAuthoritativeResult(
      result
    );

    setForm(
      createInitialForm(result)
    );

    setEditing(false);
    setSaving(false);
    setError("");
    setSuccess("");
    setEditReason("");

  }, [
    result?.id,
    result?.updated_at,
    result?.result,
  ]);


  /* ========================================================
     GENERATED INTERPRETATION
     ======================================================== */

  const generatedReport = useMemo(
    () => generateComment(form),
    [form]
  );


  /* ========================================================
     HAS SAVED RESULT
     ======================================================== */

  const hasSavedResult = useMemo(() => {

    if (!authoritativeResult?.id) {
      return false;
    }

    const saved =
      parseSavedResult(
        authoritativeResult.result
      );

    /*
     * A structured result is considered saved when at least
     * one meaningful urinalysis value exists.
     */

    return Object.keys(
      EMPTY_FORM
    ).some((key) => {

      if (
        key === "comment" ||
        key === "impression"
      ) {
        return false;
      }

      return Boolean(
        normalize(saved?.[key])
      );
    });

  }, [
    authoritativeResult,
  ]);


  /* ========================================================
     DISPLAY STATE
     ======================================================== */

  const displayOnly =
    hasSavedResult &&
    !editing;

  const disabled =
    readOnly ||
    displayOnly ||
    saving;


  /* ========================================================
     UPDATE FIELD
     ======================================================== */

  const updateField = useCallback(
    (field, value) => {

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setError("");
      setSuccess("");

    },
    []
  );


  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = () => {

    if (!resultId) {
      return (
        "A valid laboratory result record is required."
      );
    }

    if (
      editing &&
      !normalize(editReason)
    ) {
      return (
        "Please provide a reason for editing this result."
      );
    }

    return "";
  };


  /* ========================================================
     PREPARE FORM FOR SAVE
     --------------------------------------------------------
     Automatic interpretation is used only when the user has
     not already supplied a comment/impression.

     This prevents the generated text from making the fields
     impossible to manually edit.
     ======================================================== */

  const getFormForSave = () => {

    const autoReport =
      generateComment(form);

    return {
      ...form,

      comment:
        normalize(form.comment) ||
        normalize(autoReport.comment) ||
        "",

      impression:
        normalize(form.impression) ||
        normalize(autoReport.impression) ||
        "",
    };
  };


  /* ========================================================
     INITIAL SAVE
     ======================================================== */

  const handleInitialSave =
    async () => {

      const validationError =
        validate();

      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {

        const saveForm =
          getFormForSave();

        const resultText =
          serializeResult(saveForm);

        /*
         * IMPORTANT:
         *
         * "Entered" is NOT permitted by the current
         * laboratory_results_status_check constraint.
         *
         * Valid statuses:
         * Pending
         * Performed
         * Verified
         * Authorized
         */

        const saved =
          await updateLaboratoryResult(
            resultId,
            {
              result:
                resultText,

              result_status:
                RESULT_STATUS,

              comment:
                normalize(
                  saveForm.comment
                ) || null,

              performed_by:
                getEditorName(),

              performed_at:
                new Date().toISOString(),

              authorization_status:
                AUTHORIZATION_STATUS,

              release_status:
                RELEASE_STATUS,
            }
          );


        const updatedRow =
          Array.isArray(saved)
            ? saved[0]
            : saved;


        /*
         * Keep the newly saved result authoritative.
         */

        if (
          updatedRow &&
          typeof updatedRow === "object"
        ) {

          setAuthoritativeResult(
            updatedRow
          );

        } else {

          /*
           * Preserve local saved state when the service
           * does not return a row.
           */

          setAuthoritativeResult(
            (current) => ({
              ...(current || {}),
              id: resultId,
              result: resultText,
              result_status:
                RESULT_STATUS,
              comment:
                saveForm.comment || null,
            })
          );
        }


        setForm(
          saveForm
        );

        setSuccess(
          "Routine Urinalysis result saved successfully."
        );


        if (
          typeof onSaved ===
          "function"
        ) {

          onSaved(
            updatedRow || {
              ...authoritativeResult,
              id: resultId,
              result: resultText,
              result_status:
                RESULT_STATUS,
              comment:
                saveForm.comment ||
                null,
            }
          );
        }

      } catch (err) {

        console.error(
          "RoutineUrinalysisResultEntry initial save failed:",
          err
        );

        setError(
          err?.message ||
          "Unable to save Routine Urinalysis result."
        );

      } finally {

        setSaving(false);
      }
    };


  /* ========================================================
     EDIT SAVE
     ======================================================== */

  const handleSaveEditing =
    async () => {

      const validationError =
        validate();

      if (validationError) {
        setError(validationError);
        return;
      }

      const reason =
        normalize(editReason);

      const confirmed =
        window.confirm(
          `Save this edited result?\n\nReason for editing:\n${reason}`
        );

      if (!confirmed) {
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {

        const editorName =
          getEditorName();

        const saveForm =
          getFormForSave();

        const resultText =
          serializeResult(saveForm);


        const {
          data,
          error: rpcError,
        } = await supabase.rpc(
          "replace_laboratory_result",
          {
            p_edit_reason:
              reason,

            p_editor_name:
              editorName,

            p_new_result: {
              result:
                resultText,

              result_status:
                RESULT_STATUS,

              comment:
                normalize(
                  saveForm.comment
                ) || null,

              performed_by:
                editorName,

              performed_at:
                new Date().toISOString(),

              authorization_status:
                AUTHORIZATION_STATUS,

              release_status:
                RELEASE_STATUS,
            },

            p_result_id:
              Number(resultId),
          }
        );


        if (rpcError) {
          throw rpcError;
        }


        const updatedRow =
          Array.isArray(data)
            ? data[0]
            : data;


        /*
         * Make the replacement row authoritative.
         */

        if (
          updatedRow &&
          typeof updatedRow === "object"
        ) {

          setAuthoritativeResult(
            updatedRow
          );

          setForm(
            createInitialForm(
              updatedRow
            )
          );

        } else {

          setAuthoritativeResult(
            (current) => ({
              ...(current || {}),
              id: resultId,
              result: resultText,
              result_status:
                RESULT_STATUS,
              comment:
                saveForm.comment ||
                null,
            })
          );

          setForm(
            saveForm
          );
        }


        setEditing(false);
        setEditReason("");

        setSuccess(
          "Edited Routine Urinalysis result saved successfully."
        );


        if (
          typeof onSaved ===
          "function"
        ) {

          onSaved(
            updatedRow || {
              ...authoritativeResult,
              id: resultId,
              result: resultText,
              result_status:
                RESULT_STATUS,
              comment:
                saveForm.comment ||
                null,
            }
          );
        }

      } catch (err) {

        console.error(
          "RoutineUrinalysisResultEntry edit failed:",
          err
        );

        setError(
          err?.message ||
          "Unable to save edited Routine Urinalysis result."
        );

      } finally {

        setSaving(false);
      }
    };


  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const cancelEditing = () => {

    setEditing(false);
    setEditReason("");
    setError("");
    setSuccess("");

    setForm(
      createInitialForm(
        authoritativeResult ||
        result
      )
    );
  };


  /* ========================================================
     SELECT RENDERER
     ======================================================== */

  const renderSelect = (
    field,
    options,
    placeholder = "Select Result"
  ) => {

    return (
      <select
        value={normalize(form[field])}
        disabled={disabled}
        onChange={(event) =>
          updateField(
            field,
            event.target.value
          )
        }
        style={styles.select}
      >

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option ||
                placeholder}
            </option>
          )
        )}

      </select>
    );
  };


  /* ========================================================
     INPUT RENDERER
     ======================================================== */

  const renderInput = (
    field,
    placeholder
  ) => {

    return (
      <input
        type="text"
        value={form[field]}
        disabled={disabled}
        onChange={(event) =>
          updateField(
            field,
            event.target.value
          )
        }
        placeholder={placeholder}
        style={styles.input}
      />
    );
  };


  /* ========================================================
     NO RESULT
     ======================================================== */

  if (!resultId) {

    return (
      <section style={styles.container}>

        <div style={styles.errorBox}>

          <AlertCircle size={19} />

          <span>
            No laboratory result record is available
            for this test.
          </span>

        </div>

      </section>
    );
  }


  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section
      className="routine-urinalysis-result-entry"
      style={styles.container}
    >

      {/* ==================================================
          HEADER
          ================================================== */}

      <header style={styles.header}>

        <div style={styles.headerLeft}>

          <div style={styles.departmentBadge}>
            <FlaskConical size={14} />
            {DEPARTMENT}
          </div>

          <h2 style={styles.title}>
            {TEST_TITLE}
          </h2>

          <p style={styles.subtitle}>
            Laboratory Result Entry
          </p>

        </div>


        {hasSavedResult &&
          !editing && (

            <div style={styles.savedBadge}>

              <CheckCircle2 size={17} />

              <span>
                Result Saved
              </span>

            </div>

          )}

      </header>


      {/* ==================================================
          PATIENT INFORMATION
          ================================================== */}

      <div style={styles.infoGrid}>

        <InfoItem
          label="Patient"
          value={
            patient?.patient_name ||
            patient?.name ||
            authoritativeResult?.patient_name ||
            registration?.patient_name ||
            "—"
          }
        />

        <InfoItem
          label="Lab Number"
          value={
            authoritativeResult?.lab_number ||
            registration?.lab_number ||
            registration?.labNumber ||
            "—"
          }
        />

        <InfoItem
          label="Registration Number"
          value={
            authoritativeResult?.registration_number ||
            registration?.registration_number ||
            registration?.registrationNumber ||
            "—"
          }
        />

        <InfoItem
          label="Result ID"
          value={resultId}
        />

      </div>


      {/* ==================================================
          PHYSICAL EXAMINATION
          ================================================== */}

      <ResultSection
        title="Physical Examination"
        description="Macroscopic examination of the urine specimen."
      >

        <div style={styles.twoColumnGrid}>

          <FieldGroup label="Colour">

            {renderSelect(
              "colour",
              PHYSICAL_OPTIONS.colour,
              "Select Colour"
            )}

          </FieldGroup>


          <FieldGroup label="Appearance">

            {renderSelect(
              "appearance",
              PHYSICAL_OPTIONS.appearance,
              "Select Appearance"
            )}

          </FieldGroup>


          <FieldGroup label="Specific Gravity">

            {renderInput(
              "specificGravity",
              "e.g. 1.015"
            )}

          </FieldGroup>


          <FieldGroup label="pH">

            {renderInput(
              "ph",
              "e.g. 6.0"
            )}

          </FieldGroup>

        </div>

      </ResultSection>


      {/* ==================================================
          CHEMICAL EXAMINATION
          ================================================== */}

      <ResultSection
        title="Chemical Examination"
        description="Chemical reagent-strip findings."
      >

        <div style={styles.resultGrid}>

          {[
            ["protein", "Protein"],
            ["glucose", "Glucose"],
            ["ketone", "Ketone"],
            ["bilirubin", "Bilirubin"],
            ["leucocyte", "Leucocyte Esterase"],
            ["blood", "Blood"],
            ["nitrite", "Nitrite"],
            ["urobilinogen", "Urobilinogen"],
          ].map(
            ([field, label]) => (

              <FieldGroup
                key={field}
                label={label}
              >

                {renderSelect(
                  field,
                  field === "nitrite"
                    ? NITRITE_OPTIONS
                    : field === "urobilinogen"
                      ? UROBILINOGEN_OPTIONS
                      : CHEMISTRY_OPTIONS
                )}

              </FieldGroup>

            )
          )}

        </div>

      </ResultSection>


      {/* ==================================================
          MICROSCOPY
          ================================================== */}

      <ResultSection
        title="Microscopy"
        description="Microscopic examination of urinary sediment."
      >

        <div style={styles.resultGrid}>

          {Object.entries(
            MICROSCOPY_OPTIONS
          ).map(
            ([field, options]) => (

              <FieldGroup
                key={field}
                label={
                  FIELD_LABELS[field] ||
                  field
                }
              >

                {renderSelect(
                  field,
                  options
                )}

              </FieldGroup>

            )
          )}

        </div>

      </ResultSection>


      {/* ==================================================
          INTERPRETATION
          ================================================== */}

      <ResultSection
        title="Laboratory Interpretation"
        description="Laboratory comment and impression."
      >

        <div style={styles.interpretationGrid}>

          <div style={styles.field}>

            <label style={styles.label}>
              Laboratory Comment
            </label>

            <textarea
              rows={4}
              value={form.comment}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "comment",
                  event.target.value
                )
              }
              placeholder={
                generatedReport.comment ||
                "Enter laboratory comment..."
              }
              style={
                styles.textarea
              }
            />

          </div>


          <div style={styles.field}>

            <label style={styles.label}>
              Impression
            </label>

            <textarea
              rows={4}
              value={form.impression}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "impression",
                  event.target.value
                )
              }
              placeholder={
                generatedReport.impression ||
                "Enter laboratory impression..."
              }
              style={
                styles.textarea
              }
            />

          </div>

        </div>


        {/* --------------------------------------------------
            AUTOMATIC INTERPRETATION PREVIEW
            -------------------------------------------------- */}

        {!form.comment &&
          !form.impression &&
          (
            generatedReport.comment ||
            generatedReport.impression
          ) && (

            <div
              style={
                styles.interpretationPreview
              }
            >

              <div
                style={
                  styles.previewHeader
                }
              >
                <FlaskConical
                  size={16}
                />

                Suggested Interpretation
              </div>

              {generatedReport.comment && (

                <div
                  style={
                    styles.previewRow
                  }
                >

                  <span
                    style={
                      styles.previewLabel
                    }
                  >
                    Comment
                  </span>

                  <span>
                    {generatedReport.comment}
                  </span>

                </div>

              )}

              {generatedReport.impression && (

                <div
                  style={
                    styles.previewRow
                  }
                >

                  <span
                    style={
                      styles.previewLabel
                    }
                  >
                    Impression
                  </span>

                  <span>
                    {generatedReport.impression}
                  </span>

                </div>

              )}

              <div
                style={
                  styles.previewHint
                }
              >
                This is a suggested interpretation. You may
                enter your own laboratory comment or impression
                before saving.
              </div>

            </div>

          )}

      </ResultSection>


      {/* ==================================================
          EDIT AUDIT
          ================================================== */}

      {editing && (

        <div style={styles.editCard}>

          <div style={styles.editHeader}>

            <div style={styles.editIcon}>
              <Edit3 size={17} />
            </div>

            <div>

              <div style={styles.editTitle}>
                Editing Saved Result
              </div>

              <div style={styles.editDescription}>
                A reason is required before an edited result
                can be saved.
              </div>

            </div>

          </div>


          <label style={styles.label}>
            Reason for Editing
            <span style={styles.required}>
              *
            </span>
          </label>

          <textarea
            rows={3}
            value={editReason}
            disabled={saving}
            onChange={(event) =>
              setEditReason(
                event.target.value
              )
            }
            placeholder="Enter the reason for editing this result..."
            style={styles.textarea}
          />

        </div>

      )}


      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (

        <div style={styles.errorBox}>

          <AlertCircle size={19} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==================================================
          SUCCESS
          ================================================== */}

      {success && (

        <div style={styles.successBox}>

          <CheckCircle2 size={19} />

          <span>
            {success}
          </span>

        </div>

      )}


      {/* ==================================================
          ACTION BAR
          ================================================== */}

      <div style={styles.actions}>

        {typeof onBack ===
          "function" && (

            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              style={
                styles.secondaryButton
              }
            >
              Back
            </button>

          )}


        {typeof onCancel ===
          "function" &&
          !editing && (

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              style={
                styles.secondaryButton
              }
            >

              <X size={17} />

              Close

            </button>

          )}


        {/* ------------------------------------------------
            EDIT
            ------------------------------------------------ */}

        {hasSavedResult &&
          !editing &&
          !readOnly && (

            <button
              type="button"
              onClick={() => {

                setError("");
                setSuccess("");
                setEditing(true);

              }}
              disabled={saving}
              style={
                styles.editButton
              }
            >

              <Edit3 size={17} />

              Edit

            </button>

          )}


        {/* ------------------------------------------------
            CANCEL EDIT
            ------------------------------------------------ */}

        {editing && (

          <button
            type="button"
            onClick={cancelEditing}
            disabled={saving}
            style={
              styles.secondaryButton
            }
          >

            <X size={17} />

            Cancel Editing

          </button>

        )}


        {/* ------------------------------------------------
            SAVE
            ------------------------------------------------ */}

        {!readOnly &&
          (!hasSavedResult ||
            editing) && (

            <button
              type="button"
              onClick={
                editing
                  ? handleSaveEditing
                  : handleInitialSave
              }
              disabled={saving}
              style={
                styles.primaryButton
              }
            >

              {saving ? (

                <Loader2
                  size={17}
                  style={
                    styles.spinner
                  }
                />

              ) : (

                <Save size={17} />

              )}

              {saving
                ? "Saving..."
                : editing
                  ? "Save Editing"
                  : "Save Result"}

            </button>

          )}

      </div>


      {/* ==================================================
          COMPONENT CSS
          ================================================== */}

      <style>
        {`
          @keyframes routineUrinalysisSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .routine-urinalysis-result-entry
            select:focus,
          .routine-urinalysis-result-entry
            input:focus,
          .routine-urinalysis-result-entry
            textarea:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow:
              0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          .routine-urinalysis-result-entry
            button {
            font-family: inherit;
          }

          .routine-urinalysis-result-entry
            button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .routine-urinalysis-result-entry
            button:disabled {
            cursor: not-allowed;
            opacity: 0.65;
          }

          @media (max-width: 760px) {

            .routine-urinalysis-result-entry
              .two-column-grid,
            .routine-urinalysis-result-entry
              .result-grid,
            .routine-urinalysis-result-entry
              .interpretation-grid {
              grid-template-columns: 1fr !important;
            }

            .routine-urinalysis-result-entry
              .info-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;
            }

          }

          @media (max-width: 520px) {

            .routine-urinalysis-result-entry
              .info-grid {
              grid-template-columns: 1fr !important;
            }

          }
        `}
      </style>

    </section>
  );
}


/* ==========================================================
   RESULT SECTION
   ========================================================== */

function ResultSection({
  title,
  description,
  children,
}) {

  return (
    <section style={styles.section}>

      <div style={styles.sectionHeader}>

        <div>

          <h3 style={styles.sectionTitle}>
            {title}
          </h3>

          {description && (

            <p style={styles.sectionDescription}>
              {description}
            </p>

          )}

        </div>

      </div>

      <div>
        {children}
      </div>

    </section>
  );
}


/* ==========================================================
   FIELD GROUP
   ========================================================== */

function FieldGroup({
  label,
  children,
}) {

  return (
    <div style={styles.field}>

      <label style={styles.label}>
        {label}
      </label>

      {children}

    </div>
  );
}


/* ==========================================================
   INFORMATION ITEM
   ========================================================== */

function InfoItem({
  label,
  value,
}) {

  return (
    <div style={styles.infoItem}>

      <div style={styles.infoLabel}>
        {label}
      </div>

      <div style={styles.infoValue}>
        {value || "—"}
      </div>

    </div>
  );
}


/* ==========================================================
   PREMIUM UNIFIED FORM STYLES
   ----------------------------------------------------------
   These styles are deliberately structured so they can be
   reused across:

   - ABO Blood Group
   - Routine Urinalysis
   - Blood Culture
   - Malaria Parasite
   - MCS
   - SFA
   - Widal
   - Other special result forms
   ========================================================== */

const styles = {

  /* --------------------------------------------------------
     ROOT
     -------------------------------------------------------- */

  container: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: 24,
    boxSizing: "border-box",

    background: "#ffffff",

    border:
      "1px solid #e5e7eb",

    borderRadius: 16,

    boxShadow:
      "0 12px 32px rgba(15, 23, 42, 0.08)",

    color: "#111827",

    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  /* --------------------------------------------------------
     HEADER
     -------------------------------------------------------- */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,

    paddingBottom: 20,

    borderBottom:
      "1px solid #e5e7eb",
  },

  headerLeft: {
    minWidth: 0,
  },

  departmentBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,

    fontSize: 11,
    fontWeight: 800,

    letterSpacing: "0.10em",
    textTransform: "uppercase",

    color: "#2563eb",
  },

  title: {
    margin: "6px 0 0",

    fontSize: 23,
    lineHeight: 1.25,

    fontWeight: 850,

    color: "#111827",
  },

  subtitle: {
    margin: "5px 0 0",

    fontSize: 13,

    color: "#6b7280",
  },


  /* --------------------------------------------------------
     SAVED BADGE
     -------------------------------------------------------- */

  savedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,

    padding:
      "8px 13px",

    borderRadius: 999,

    background: "#ecfdf5",

    color: "#047857",

    border:
      "1px solid #a7f3d0",

    fontSize: 12,
    fontWeight: 800,

    whiteSpace: "nowrap",
  },


  /* --------------------------------------------------------
     INFORMATION GRID
     -------------------------------------------------------- */

  infoGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: 10,

    marginTop: 18,
  },

  infoItem: {
    minWidth: 0,

    padding: 12,

    border:
      "1px solid #e5e7eb",

    borderRadius: 10,

    background: "#f8fafc",
  },

  infoLabel: {
    marginBottom: 4,

    fontSize: 10,

    fontWeight: 800,

    textTransform: "uppercase",

    letterSpacing: "0.07em",

    color: "#6b7280",
  },

  infoValue: {
    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",

    fontSize: 13,

    fontWeight: 750,

    color: "#111827",
  },


  /* --------------------------------------------------------
     SECTION
     -------------------------------------------------------- */

  section: {
    marginTop: 18,

    padding: 20,

    border:
      "1px solid #e5e7eb",

    borderRadius: 14,

    background: "#ffffff",
  },

  sectionHeader: {
    display: "flex",

    alignItems: "flex-start",

    justifyContent: "space-between",

    gap: 12,

    marginBottom: 18,

    paddingBottom: 13,

    borderBottom:
      "1px solid #f1f5f9",
  },

  sectionTitle: {
    margin: 0,

    fontSize: 15,

    fontWeight: 850,

    color: "#111827",
  },

  sectionDescription: {
    margin: "4px 0 0",

    fontSize: 12,

    lineHeight: 1.5,

    color: "#6b7280",
  },


  /* --------------------------------------------------------
     GRIDS
     -------------------------------------------------------- */

  twoColumnGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: 16,
  },

  resultGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: 15,
  },

  interpretationGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: 16,
  },


  /* --------------------------------------------------------
     FIELD
     -------------------------------------------------------- */

  field: {
    width: "100%",
    minWidth: 0,
  },

  label: {
    display: "block",

    marginBottom: 7,

    fontSize: 12,

    fontWeight: 750,

    color: "#374151",
  },

  required: {
    marginLeft: 3,

    color: "#dc2626",
  },


  /* --------------------------------------------------------
     INPUTS
     -------------------------------------------------------- */

  input: {
    width: "100%",

    minHeight: 42,

    boxSizing: "border-box",

    padding:
      "9px 12px",

    border:
      "1px solid #d1d5db",

    borderRadius: 9,

    background: "#ffffff",

    color: "#111827",

    fontSize: 13,

    fontFamily: "inherit",

    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease",
  },

  select: {
    width: "100%",

    minHeight: 42,

    boxSizing: "border-box",

    padding:
      "9px 34px 9px 12px",

    border:
      "1px solid #d1d5db",

    borderRadius: 9,

    background: "#ffffff",

    color: "#111827",

    fontSize: 13,

    fontFamily: "inherit",

    cursor: "pointer",

    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease",
  },

  textarea: {
    width: "100%",

    minHeight: 105,

    boxSizing: "border-box",

    padding:
      "10px 12px",

    border:
      "1px solid #d1d5db",

    borderRadius: 9,

    background: "#ffffff",

    color: "#111827",

    fontSize: 13,

    lineHeight: 1.5,

    fontFamily: "inherit",

    resize: "vertical",

    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease",
  },


  /* --------------------------------------------------------
     INTERPRETATION PREVIEW
     -------------------------------------------------------- */

  interpretationPreview: {
    marginTop: 18,

    padding: 15,

    border:
      "1px solid #bfdbfe",

    borderRadius: 10,

    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",

    fontSize: 12,

    lineHeight: 1.5,

    color: "#374151",
  },

  previewHeader: {
    display: "flex",

    alignItems: "center",

    gap: 7,

    marginBottom: 12,

    fontSize: 12,

    fontWeight: 850,

    color: "#1d4ed8",
  },

  previewRow: {
    display: "grid",

    gridTemplateColumns:
      "90px 1fr",

    gap: 10,

    marginTop: 7,
  },

  previewLabel: {
    fontWeight: 800,

    color: "#4b5563",
  },

  previewHint: {
    marginTop: 12,

    paddingTop: 10,

    borderTop:
      "1px solid #dbeafe",

    fontSize: 11,

    color: "#6b7280",
  },


  /* --------------------------------------------------------
     EDIT CARD
     -------------------------------------------------------- */

  editCard: {
    marginTop: 18,

    padding: 17,

    border:
      "1px solid #f59e0b",

    borderRadius: 12,

    background: "#fffbeb",
  },

  editHeader: {
    display: "flex",

    alignItems: "flex-start",

    gap: 10,

    marginBottom: 14,
  },

  editIcon: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    width: 32,
    height: 32,

    flexShrink: 0,

    borderRadius: 8,

    background: "#fef3c7",

    color: "#92400e",
  },

  editTitle: {
    fontSize: 13,

    fontWeight: 850,

    color: "#92400e",
  },

  editDescription: {
    marginTop: 3,

    fontSize: 12,

    lineHeight: 1.45,

    color: "#78350f",
  },


  /* --------------------------------------------------------
     MESSAGES
     -------------------------------------------------------- */

  errorBox: {
    display: "flex",

    alignItems: "flex-start",

    gap: 9,

    marginTop: 18,

    padding: 13,

    border:
      "1px solid #fecaca",

    borderRadius: 9,

    background: "#fef2f2",

    color: "#b91c1c",

    fontSize: 12.5,

    lineHeight: 1.45,
  },

  successBox: {
    display: "flex",

    alignItems: "center",

    gap: 9,

    marginTop: 18,

    padding: 13,

    border:
      "1px solid #a7f3d0",

    borderRadius: 9,

    background: "#ecfdf5",

    color: "#047857",

    fontSize: 12.5,

    fontWeight: 650,
  },


  /* --------------------------------------------------------
     ACTIONS
     -------------------------------------------------------- */

  actions: {
    display: "flex",

    justifyContent: "flex-end",

    alignItems: "center",

    flexWrap: "wrap",

    gap: 9,

    marginTop: 20,

    paddingTop: 18,

    borderTop:
      "1px solid #e5e7eb",
  },

  primaryButton: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    minHeight: 40,

    padding:
      "8px 16px",

    border: "none",

    borderRadius: 8,

    background: "#2563eb",

    color: "#ffffff",

    fontSize: 13,

    fontWeight: 800,

    cursor: "pointer",

    transition:
      "transform 0.15s ease, box-shadow 0.15s ease",

    boxShadow:
      "0 3px 8px rgba(37, 99, 235, 0.20)",
  },

  editButton: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    minHeight: 40,

    padding:
      "8px 15px",

    border:
      "1px solid #2563eb",

    borderRadius: 8,

    background: "#eff6ff",

    color: "#1d4ed8",

    fontSize: 13,

    fontWeight: 800,

    cursor: "pointer",

    transition:
      "transform 0.15s ease",
  },

  secondaryButton: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    minHeight: 40,

    padding:
      "8px 14px",

    border:
      "1px solid #d1d5db",

    borderRadius: 8,

    background: "#ffffff",

    color: "#374151",

    fontSize: 13,

    fontWeight: 700,

    cursor: "pointer",

    transition:
      "transform 0.15s ease",
  },

  spinner: {
    animation:
      "routineUrinalysisSpin 1s linear infinite",
  },
};

