/* ==========================================================
   PEFA LAB
   ABO BLOOD GROUP, RHESUS FACTOR & GENOTYPE — RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/ABOBloodGroupResultEntry.jsx

   ARCHITECTURE:

   LaboratoryResultEntry.jsx
          ↓
   SpecialLaboratoryResultEntryResolver.jsx
          ↓
   ABOBloodGroupResultEntry.jsx

   IMPORTANT
   ----------------------------------------------------------
   - LaboratoryResultEntry.jsx is NOT modified.
   - Does NOT use resultData / setResultData.
   - Does NOT expect abo_group column.
   - Does NOT expect rhesus_factor column.
   - Does NOT expect genotype column.
   - Uses ONLY laboratory_results.result TEXT to store the
     structured ABO/Rhesus/Genotype result.
   - Genotype is OPTIONAL.
   - If genotype is entered, it is displayed.
   - If genotype is empty, only ABO + Rhesus are displayed.
   - Reloads the authoritative laboratory_results row whenever
     the form is opened/reopened.
   - Uses maybeSingle() for the individual result row.
   - First save updates the existing laboratory_results row.
   - Uses result_status = "Performed" because the database
     constraint does NOT permit "Entered".
   - Editing uses the existing replace_laboratory_result RPC.
   - Uses the single RPC signature:
       replace_laboratory_result(text,text,jsonb,bigint)
   - Saved values are immediately retained locally.
   - Saved values are rehydrated from the database when reopened.
   - Successful save calls onSaved().
   ========================================================== */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
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

const TEST_TITLE =
  "ABO Blood Group & Rhesus Factor";

const DEPARTMENT =
  "Hematology";

const RESULT_STATUS =
  "Performed";

const EMPTY_FORM = {
  aboGroup: "",
  rhesusFactor: "",
  genotype: "",
  comment: "",
};


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const normalize = (value) =>
  String(value ?? "").trim();


const isNonEmpty = (value) =>
  Boolean(normalize(value));


/* ==========================================================
   EDITOR / PERFORMER NAME
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
    (item) => isNonEmpty(item)
  );

  return normalize(value) || "Laboratory User";
};


/* ==========================================================
   SAFE JSON PARSER
   ----------------------------------------------------------
   laboratory_results.result is TEXT.

   Example saved value:

   {
     "test": "ABO Blood Group & Rhesus Factor",
     "department": "Hematology",
     "abo_group": "O",
     "rhesus_factor": "Positive",
     "genotype": "AA",
     "result": "O Positive",
     "display_result": "O Positive | Genotype: AA",
     "comment": ""
   }

   Older records may simply contain:

     O Positive

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
    // Plain text result.
  }

  return {
    rawResult: text,
  };
};


/* ==========================================================
   NORMALIZE ABO GROUP
   ========================================================== */

const normalizeABOGroup = (value) => {
  const text = normalize(value).toUpperCase();

  if (
    text === "A" ||
    text === "B" ||
    text === "AB" ||
    text === "O"
  ) {
    return text;
  }

  return "";
};


/* ==========================================================
   NORMALIZE RHESUS
   ========================================================== */

const normalizeRhesus = (value) => {
  const text = normalize(value);

  if (!text) {
    return "";
  }

  if (
    /^positive$/i.test(text) ||
    text === "+" ||
    /^rh\s*\+$/i.test(text) ||
    /^rh-positive$/i.test(text)
  ) {
    return "Positive";
  }

  if (
    /^negative$/i.test(text) ||
    text === "-" ||
    /^rh\s*-\s*$/i.test(text) ||
    /^rh-negative$/i.test(text)
  ) {
    return "Negative";
  }

  return "";
};


/* ==========================================================
   NORMALIZE GENOTYPE
   ----------------------------------------------------------
   Genotype is OPTIONAL.

   Supported common entries:

     AA
     AS
     SS
     AC
     SC
     CC
     AD
     SD
     DD

   We deliberately allow any non-empty text as a fallback
   because some laboratories may use additional genotype
   notation.
   ========================================================== */

const normalizeGenotype = (value) => {
  const text = normalize(value).toUpperCase();

  return text;
};


/* ==========================================================
   PARSE PLAIN ABO RESULT
   ----------------------------------------------------------
   Examples:

     O Positive
     A Negative
     AB Positive
     O+
     A-
   ========================================================== */

const parsePlainABOResult = (value) => {
  const text = normalize(value);

  if (!text) {
    return {
      aboGroup: "",
      rhesusFactor: "",
    };
  }

  const match = text.match(
    /^\s*(A|B|AB|O)\s*(?:GROUP)?\s*(POSITIVE|NEGATIVE|\+|\-)\s*$/i
  );

  if (!match) {
    return {
      aboGroup: "",
      rhesusFactor: "",
    };
  }

  const aboGroup =
    normalizeABOGroup(match[1]);

  const rhesusFactor =
    normalizeRhesus(match[2]);

  return {
    aboGroup,
    rhesusFactor,
  };
};


/* ==========================================================
   PARSE LEGACY / HUMAN-READABLE GENOTYPE
   ----------------------------------------------------------
   Examples:

     O Positive | Genotype: AA
     O Positive - AA
     O Positive (AA)
   ========================================================== */

const parseGenotypeFromText = (value) => {
  const text = normalize(value);

  if (!text) {
    return "";
  }

  const explicitMatch =
    text.match(
      /genotype\s*[:\-]\s*([A-Za-z0-9+\-]+)/i
    );

  if (explicitMatch) {
    return normalizeGenotype(
      explicitMatch[1]
    );
  }

  return "";
};


/* ==========================================================
   HYDRATE FORM FROM SAVED DATABASE ROW
   ========================================================== */

const hydrateFormFromResult = (row) => {
  if (!row) {
    return {
      ...EMPTY_FORM,
    };
  }

  const saved =
    parseSavedResult(row.result);

  let aboGroup =
    saved.abo_group ??
    saved.aboGroup ??
    "";

  let rhesusFactor =
    saved.rhesus_factor ??
    saved.rhesusFactor ??
    saved.rh_factor ??
    saved.rhFactor ??
    "";

  let genotype =
    saved.genotype ??
    saved.Genotype ??
    "";

  let comment =
    saved.comment ??
    row.comment ??
    "";

  /* --------------------------------------------------------
     Plain result fallback.
     -------------------------------------------------------- */

  const rawText =
    saved.rawResult ||
    saved.result ||
    row.result ||
    "";

  if (
    !aboGroup ||
    !rhesusFactor
  ) {
    const parsedPlain =
      parsePlainABOResult(rawText);

    aboGroup =
      aboGroup ||
      parsedPlain.aboGroup;

    rhesusFactor =
      rhesusFactor ||
      parsedPlain.rhesusFactor;
  }

  /* --------------------------------------------------------
     Genotype fallback from display text.
     -------------------------------------------------------- */

  if (!genotype) {
    genotype =
      parseGenotypeFromText(
        saved.display_result ||
        saved.result ||
        saved.rawResult ||
        row.result
      );
  }

  return {
    aboGroup:
      normalizeABOGroup(aboGroup),

    rhesusFactor:
      normalizeRhesus(rhesusFactor),

    genotype:
      normalizeGenotype(genotype),

    comment:
      normalize(comment),
  };
};


/* ==========================================================
   BUILD ABO + RH RESULT
   ========================================================== */

const buildABORhesusText = (form) => {
  const abo =
    normalize(form?.aboGroup);

  const rhesus =
    normalize(form?.rhesusFactor);

  if (!abo || !rhesus) {
    return "";
  }

  return `${abo} ${rhesus}`;
};


/* ==========================================================
   BUILD FINAL DISPLAY RESULT
   ----------------------------------------------------------
   WITHOUT GENOTYPE:

     O Positive

   WITH GENOTYPE:

     O Positive | Genotype: AA
   ========================================================== */

const buildDisplayResult = (form) => {
  const aboResult =
    buildABORhesusText(form);

  if (!aboResult) {
    return "";
  }

  const genotype =
    normalizeGenotype(
      form?.genotype
    );

  if (!genotype) {
    return aboResult;
  }

  return `${aboResult} | Genotype: ${genotype}`;
};


/* ==========================================================
   BUILD STRUCTURED RESULT
   ----------------------------------------------------------
   Everything is stored inside laboratory_results.result.
   ========================================================== */

const buildStructuredResult = (form) => {
  const aboRhesus =
    buildABORhesusText(form);

  const displayResult =
    buildDisplayResult(form);

  return {
    test: TEST_TITLE,
    department: DEPARTMENT,

    abo_group:
      normalizeABOGroup(
        form?.aboGroup
      ),

    rhesus_factor:
      normalizeRhesus(
        form?.rhesusFactor
      ),

    /*
     * IMPORTANT:
     * Empty genotype is stored as an empty string,
     * not as a required field.
     */
    genotype:
      normalizeGenotype(
        form?.genotype
      ),

    result:
      aboRhesus,

    display_result:
      displayResult,

    comment:
      normalize(form?.comment),
  };
};


/* ==========================================================
   SERIALIZE FOR laboratory_results.result TEXT COLUMN
   ========================================================== */

const serializeResult = (form) => {
  return JSON.stringify(
    buildStructuredResult(form)
  );
};


/* ==========================================================
   DETERMINE WHETHER A SAVED ABO RESULT EXISTS
   ========================================================== */

const hasABOResult = (row) => {
  if (!row?.id) {
    return false;
  }

  const saved =
    parseSavedResult(row.result);

  if (
    isNonEmpty(saved.abo_group) &&
    isNonEmpty(saved.rhesus_factor)
  ) {
    return true;
  }

  const parsedPlain =
    parsePlainABOResult(
      saved.rawResult ||
      saved.result ||
      row.result
    );

  return Boolean(
    parsedPlain.aboGroup &&
    parsedPlain.rhesusFactor
  );
};


/* ==========================================================
   COMPONENT
   ========================================================== */

export default function ABOBloodGroupResultEntry({
  test,
  result,
  registration,
  patient,
  onSaved,
  onCancel,
  onBack,
  readOnly = false,
}) {

  /* ========================================================
     AUTHORITATIVE DATABASE RESULT
     ======================================================== */

  const [
    authoritativeResult,
    setAuthoritativeResult,
  ] = useState(
    result || null
  );


  /* ========================================================
     FORM
     ======================================================== */

  const [
    form,
    setForm,
  ] = useState(
    () =>
      hydrateFormFromResult(
        result
      )
  );


  /* ========================================================
     STATE
     ======================================================== */

  const [
    loadingResult,
    setLoadingResult,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editing,
    setEditing,
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
     REF TO PREVENT STALE PARENT RESULT FROM OVERWRITING
     A SUCCESSFULLY FETCHED DATABASE RESULT
     ======================================================== */

  const authoritativeIdRef =
    useRef(
      result?.id
        ? Number(result.id)
        : null
    );


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

    return Number.isFinite(
      numericId
    )
      ? numericId
      : null;

  }, [
    authoritativeResult?.id,
    result?.id,
  ]);


  /* ========================================================
     LOAD AUTHORITATIVE DATABASE ROW
     ======================================================== */

  const loadLaboratoryResult =
    useCallback(
      async () => {

        if (!resultId) {

          setAuthoritativeResult(
            null
          );

          setForm({
            ...EMPTY_FORM,
          });

          return;
        }

        setLoadingResult(true);
        setError("");

        try {

          const {
            data,
            error: fetchError,
          } =
            await supabase
              .from(
                "laboratory_results"
              )
              .select("*")
              .eq(
                "id",
                resultId
              )
              .maybeSingle();

          if (fetchError) {
            throw fetchError;
          }

          if (!data) {
            throw new Error(
              `Laboratory result #${resultId} could not be found.`
            );
          }

          /*
           * Database row is authoritative.
           */

          authoritativeIdRef.current =
            Number(data.id);

          setAuthoritativeResult(
            data
          );

          /*
           * CRITICAL:
           * Hydrate the form from the actual database row.
           */

          const hydrated =
            hydrateFormFromResult(
              data
            );

          setForm(
            hydrated
          );

          setEditing(false);
          setEditReason("");
          setSuccess("");

        } catch (err) {

          console.error(
            "ABOBloodGroupResultEntry result loading failed:",
            err
          );

          setError(
            err?.message ||
            "Unable to load the saved laboratory result."
          );

        } finally {

          setLoadingResult(false);
        }

      },
      [resultId]
    );


  /* ========================================================
     LOAD WHEN COMPONENT OPENS / RESULT ID CHANGES
     ======================================================== */

  useEffect(() => {

    loadLaboratoryResult();

  }, [
    loadLaboratoryResult,
  ]);


  /* ========================================================
     SYNCHRONIZE PARENT RESULT CAREFULLY
     --------------------------------------------------------
     IMPORTANT FIX:

     The parent may temporarily pass an old or incomplete
     result object after save.

     We do NOT blindly replace the authoritative database row
     with whatever the parent sends.

     A result with the same ID is only accepted if it contains
     actual result information.

     Otherwise the database-loaded row remains authoritative.
     ======================================================== */

  useEffect(() => {

    if (!result?.id) {
      return;
    }

    const incomingId =
      Number(result.id);

    if (
      !Number.isFinite(
        incomingId
      )
    ) {
      return;
    }

    const currentId =
      authoritativeIdRef.current;

    /*
     * New result ID:
     * accept it and reload.
     */

    if (
      currentId !== incomingId
    ) {

      authoritativeIdRef.current =
        incomingId;

      setAuthoritativeResult(
        result
      );

      setForm(
        hydrateFormFromResult(
          result
        )
      );

      return;
    }

    /*
     * Same result ID:
     * only replace the current authoritative row if the
     * incoming parent result actually contains result data.
     */

    if (
      hasABOResult(result)
    ) {

      setAuthoritativeResult(
        result
      );

      setForm(
        hydrateFormFromResult(
          result
        )
      );
    }

  }, [
    result,
  ]);


  /* ========================================================
     UPDATE FIELD
     ======================================================== */

  const updateField =
    (field, value) => {

      setForm(
        (current) => ({
          ...current,
          [field]: value,
        })
      );

      setError("");
      setSuccess("");
    };


  /* ========================================================
     GENERATED RESULTS
     ======================================================== */

  const aboRhesusResult =
    useMemo(
      () =>
        buildABORhesusText(
          form
        ),
      [
        form,
      ]
    );


  const generatedResult =
    useMemo(
      () =>
        buildDisplayResult(
          form
        ),
      [
        form,
      ]
    );


  /* ========================================================
     SAVED RESULT STATUS
     ======================================================== */

  const hasSavedResult =
    useMemo(
      () =>
        hasABOResult(
          authoritativeResult
        ),
      [
        authoritativeResult,
      ]
    );


  /* ========================================================
     DISPLAY ONLY
     ======================================================== */

  const displayOnly =
    hasSavedResult &&
    !editing;


  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = () => {

    if (!resultId) {

      return (
        "A valid laboratory result record is required."
      );
    }

    if (!form.aboGroup) {

      return (
        "Please select the ABO blood group."
      );
    }

    if (!form.rhesusFactor) {

      return (
        "Please select the Rhesus factor."
      );
    }

    /*
     * GENOTYPE IS DELIBERATELY NOT REQUIRED.
     */

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
     INITIAL SAVE
     ======================================================== */

  const handleInitialSave =
    async () => {

      const validationError =
        validate();

      if (validationError) {

        setError(
          validationError
        );

        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {

        const performer =
          getEditorName();

        const savedResultText =
          serializeResult(
            form
          );

        /*
         * ONLY REAL laboratory_results COLUMNS ARE SENT.
         *
         * There is NO:
         *
         * abo_group
         * rhesus_factor
         * genotype
         * result_data
         */

        const saved =
          await updateLaboratoryResult(
            resultId,
            {
              result:
                savedResultText,

              /*
               * IMPORTANT:
               * "Entered" is INVALID.
               *
               * Valid DB values include:
               * Pending
               * Performed
               * Verified
               * Authorized
               */
              result_status:
                RESULT_STATUS,

              comment:
                normalize(
                  form.comment
                ) || null,

              performed_by:
                performer,

              performed_at:
                new Date().toISOString(),

              entered_by:
                performer,

              entered_at:
                new Date().toISOString(),

              authorization_status:
                "Pending",

              release_status:
                "Pending",
            }
          );


        /* ==================================================
           DETERMINE UPDATED ROW
           ================================================== */

        let updatedRow =
          Array.isArray(saved)
            ? saved[0]
            : saved;


        /*
         * Some service implementations return no row.
         * In that case immediately fetch the authoritative row.
         */

        if (
          !updatedRow ||
          typeof updatedRow !==
            "object"
        ) {

          const {
            data,
            error: reloadError,
          } =
            await supabase
              .from(
                "laboratory_results"
              )
              .select("*")
              .eq(
                "id",
                resultId
              )
              .maybeSingle();

          if (reloadError) {
            throw reloadError;
          }

          updatedRow =
            data;
        }


        /* ==================================================
           FALLBACK LOCAL ROW
           ================================================== */

        if (!updatedRow) {

          updatedRow = {
            ...(authoritativeResult || {}),
            id: resultId,
            result:
              savedResultText,
            result_status:
              RESULT_STATUS,
            comment:
              normalize(
                form.comment
              ) || null,
          };
        }


        /* ==================================================
           CRITICAL:
           RETAIN THE SAVED RESULT IN THIS COMPONENT.
           ================================================== */

        authoritativeIdRef.current =
          resultId;

        setAuthoritativeResult(
          updatedRow
        );

        setForm(
          hydrateFormFromResult(
            updatedRow
          )
        );

        setEditing(false);
        setEditReason("");

        setSuccess(
          "ABO Blood Group, Rhesus Factor and optional Genotype result saved successfully."
        );


        /* ==================================================
           NOTIFY PARENT
           ================================================== */

        if (
          typeof onSaved ===
          "function"
        ) {

          onSaved(
            updatedRow
          );
        }

      } catch (err) {

        console.error(
          "ABOBloodGroupResultEntry initial save failed:",
          err
        );

        setError(
          err?.message ||
          "Unable to save ABO Blood Group & Rhesus Factor result."
        );

      } finally {

        setSaving(false);
      }
    };


  /* ========================================================
     SAVE EDITING
     ======================================================== */

  const handleSaveEditing =
    async () => {

      const validationError =
        validate();

      if (validationError) {

        setError(
          validationError
        );

        return;
      }

      const reason =
        normalize(
          editReason
        );

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

        const savedResultText =
          serializeResult(
            form
          );


        /* ==================================================
           EXISTING RPC

           Signature:

           replace_laboratory_result(
             text,
             text,
             jsonb,
             bigint
           )
           ================================================== */

        const {
          data,
          error: rpcError,
        } =
          await supabase.rpc(
            "replace_laboratory_result",
            {
              p_edit_reason:
                reason,

              p_editor_name:
                editorName,

              p_new_result: {

                /*
                 * ONLY VALID laboratory_results columns.
                 */

                result:
                  savedResultText,

                /*
                 * "Entered" would violate:
                 *
                 * laboratory_results_status_check
                 *
                 * Therefore:
                 */

                result_status:
                  RESULT_STATUS,

                comment:
                  normalize(
                    form.comment
                  ) || null,

                performed_by:
                  editorName,

                performed_at:
                  new Date().toISOString(),

                entered_by:
                  editorName,

                entered_at:
                  new Date().toISOString(),

                authorization_status:
                  "Pending",

                release_status:
                  "Pending",
              },

              p_result_id:
                resultId,
            }
          );


        if (rpcError) {
          throw rpcError;
        }


        /* ==================================================
           RPC RETURN VALUE
           ================================================== */

        let updatedRow =
          Array.isArray(data)
            ? data[0]
            : data;


        /* ==================================================
           IMPORTANT:
           If RPC does not return a complete row, reload it.
           ================================================== */

        if (
          !updatedRow ||
          typeof updatedRow !==
            "object"
        ) {

          const {
            data: freshRow,
            error: reloadError,
          } =
            await supabase
              .from(
                "laboratory_results"
              )
              .select("*")
              .eq(
                "id",
                resultId
              )
              .maybeSingle();

          if (reloadError) {
            throw reloadError;
          }

          updatedRow =
            freshRow;
        }


        /* ==================================================
           FALLBACK
           ================================================== */

        if (!updatedRow) {

          updatedRow = {
            ...(authoritativeResult || {}),
            id: resultId,
            result:
              savedResultText,
            result_status:
              RESULT_STATUS,
            comment:
              normalize(
                form.comment
              ) || null,
          };
        }


        /* ==================================================
           RETAIN NEW AUTHORITATIVE RESULT
           ================================================== */

        authoritativeIdRef.current =
          resultId;

        setAuthoritativeResult(
          updatedRow
        );

        setForm(
          hydrateFormFromResult(
            updatedRow
          )
        );

        setEditing(false);
        setEditReason("");

        setSuccess(
          "Edited ABO Blood Group, Rhesus Factor and optional Genotype result saved successfully."
        );


        /* ==================================================
           NOTIFY PARENT
           ================================================== */

        if (
          typeof onSaved ===
          "function"
        ) {

          onSaved(
            updatedRow
          );
        }

      } catch (err) {

        console.error(
          "ABOBloodGroupResultEntry edit failed:",
          err
        );

        setError(
          err?.message ||
          "Unable to save edited ABO Blood Group & Rhesus Factor result."
        );

      } finally {

        setSaving(false);
      }
    };


  /* ========================================================
     SAVE DISPATCH
     ======================================================== */

  const handleSave = () => {

    if (editing) {
      return handleSaveEditing();
    }

    return handleInitialSave();
  };


  /* ========================================================
     START EDITING
     --------------------------------------------------------
     The database result has already been loaded.

     Before enabling editing, explicitly hydrate the form
     from the authoritative row again.
     ======================================================== */

  const startEditing = () => {

    if (!authoritativeResult) {
      return;
    }

    setForm(
      hydrateFormFromResult(
        authoritativeResult
      )
    );

    setError("");
    setSuccess("");
    setEditReason("");
    setEditing(true);
  };


  /* ========================================================
     CANCEL EDITING
     ======================================================== */

  const cancelEditing =
    async () => {

      setEditing(false);
      setEditReason("");
      setError("");
      setSuccess("");

      /*
       * Re-read from DB.
       */

      await loadLaboratoryResult();
    };


  /* ========================================================
     NO RESULT
     ======================================================== */

  if (!resultId) {

    return (
      <section
        className="abo-blood-group-result-entry"
        style={styles.container}
      >

        <div style={styles.errorBox}>

          <AlertCircle size={20} />

          <span>
            No laboratory result record is available
            for this test.
          </span>

        </div>

      </section>
    );
  }


  /* ========================================================
     LOADING
     ======================================================== */

  if (
    loadingResult &&
    !authoritativeResult
  ) {

    return (
      <section
        className="abo-blood-group-result-entry"
        style={styles.container}
      >

        <div style={styles.loadingBox}>

          <Loader2
            size={22}
            style={styles.spinner}
          />

          <span>
            Loading saved laboratory result...
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
      className="abo-blood-group-result-entry"
      style={styles.container}
    >

      {/* ==================================================
          HEADER
          ================================================== */}

      <div style={styles.header}>

        <div>

          <div style={styles.department}>
            {DEPARTMENT}
          </div>

          <h2 style={styles.title}>
            {TEST_TITLE}
          </h2>

          <div style={styles.subtitle}>
            Laboratory Result Entry
          </div>

        </div>


        {hasSavedResult &&
          !editing && (

            <div style={styles.savedBadge}>

              <CheckCircle2
                size={17}
              />

              <span>
                Result Saved
              </span>

            </div>

          )}

      </div>


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
          value={
            resultId
          }
        />

      </div>


      {/* ==================================================
          MAIN FORM
          ================================================== */}

      <div style={styles.formCard}>

        <div style={styles.formHeader}>

          <div>

            <h3 style={styles.formTitle}>
              Blood Group & Genotype Determination
            </h3>

            <p style={styles.formDescription}>
              Enter the patient's ABO blood group and
              Rhesus factor. Genotype is optional and may
              be entered when performed together with blood
              grouping.
            </p>

          </div>


          {displayOnly && (

            <span style={styles.readonlyBadge}>
              Saved Result
            </span>

          )}

        </div>


        {/* ==================================================
            ABO + RHESUS
            ================================================== */}

        <div style={styles.grid}>

          <div style={styles.field}>

            <label style={styles.label}>

              ABO Blood Group

              <span style={styles.required}>
                *
              </span>

            </label>

            <select
              value={
                form.aboGroup
              }
              disabled={
                readOnly ||
                displayOnly ||
                saving ||
                loadingResult
              }
              onChange={(event) =>
                updateField(
                  "aboGroup",
                  event.target.value
                )
              }
              style={styles.input}
            >

              <option value="">
                Select ABO Group
              </option>

              <option value="A">
                A
              </option>

              <option value="B">
                B
              </option>

              <option value="AB">
                AB
              </option>

              <option value="O">
                O
              </option>

            </select>

          </div>


          <div style={styles.field}>

            <label style={styles.label}>

              Rhesus Factor

              <span style={styles.required}>
                *
              </span>

            </label>

            <select
              value={
                form.rhesusFactor
              }
              disabled={
                readOnly ||
                displayOnly ||
                saving ||
                loadingResult
              }
              onChange={(event) =>
                updateField(
                  "rhesusFactor",
                  event.target.value
                )
              }
              style={styles.input}
            >

              <option value="">
                Select Rhesus Factor
              </option>

              <option value="Positive">
                Positive (Rh+)
              </option>

              <option value="Negative">
                Negative (Rh−)
              </option>

            </select>

          </div>

        </div>


        {/* ==================================================
            GENOTYPE
            ================================================== */}

        <div
          style={{
            ...styles.field,
            marginTop: 18,
          }}
        >

          <label style={styles.label}>

            Genotype

            <span style={styles.optional}>
              Optional
            </span>

          </label>

          <select
            value={
              form.genotype
            }
            disabled={
              readOnly ||
              displayOnly ||
              saving ||
              loadingResult
            }
            onChange={(event) =>
              updateField(
                "genotype",
                event.target.value
              )
            }
            style={styles.input}
          >

            <option value="">
              Not Entered
            </option>

            <option value="AA">
              AA
            </option>

            <option value="AS">
              AS
            </option>

            <option value="SS">
              SS
            </option>

            <option value="AC">
              AC
            </option>

            <option value="SC">
              SC
            </option>

            <option value="CC">
              CC
            </option>

            <option value="AD">
              AD
            </option>

            <option value="SD">
              SD
            </option>

            <option value="DD">
              DD
            </option>

          </select>

          <div style={styles.helperText}>
            Genotype is optional. Leaving it blank will
            display only the ABO blood group and Rhesus
            factor.
          </div>

        </div>


        {/* ==================================================
            COMMENT
            ================================================== */}

        <div
          style={{
            ...styles.field,
            marginTop: 18,
          }}
        >

          <label style={styles.label}>
            Laboratory Comment
          </label>

          <textarea
            rows={4}
            value={
              form.comment
            }
            disabled={
              readOnly ||
              displayOnly ||
              saving
            }
            onChange={(event) =>
              updateField(
                "comment",
                event.target.value
              )
            }
            placeholder="Optional laboratory comment"
            style={{
              ...styles.input,
              resize: "vertical",
              minHeight: 100,
            }}
          />

        </div>


        {/* ==================================================
            RESULT PREVIEW
            ================================================== */}

        {generatedResult && (

          <div style={styles.resultPreview}>

            <div style={styles.previewLabel}>
              REPORT RESULT
            </div>

            <div style={styles.previewResult}>
              {generatedResult}
            </div>

            <div style={styles.previewSubtext}>

              ABO Group:{" "}

              <strong>
                {form.aboGroup}
              </strong>

              {"  •  "}

              Rhesus:{" "}

              <strong>
                {form.rhesusFactor}
              </strong>

              {form.genotype && (
                <>
                  {"  •  "}
                  Genotype:{" "}

                  <strong>
                    {form.genotype}
                  </strong>
                </>
              )}

            </div>

          </div>

        )}


        {/* ==================================================
            EDIT REASON
            ================================================== */}

        {editing && (

          <div style={styles.editBox}>

            <div style={styles.editHeader}>

              <Edit3 size={18} />

              <strong>
                Editing Saved Result
              </strong>

            </div>

            <p style={styles.editWarning}>
              You are editing an already saved laboratory
              result. A reason for editing is required for
              audit purposes.
            </p>

            <label style={styles.label}>

              Reason for Editing

              <span style={styles.required}>
                *
              </span>

            </label>

            <textarea
              rows={4}
              value={
                editReason
              }
              disabled={saving}
              onChange={(event) =>
                setEditReason(
                  event.target.value
                )
              }
              placeholder="Enter the reason for editing this result..."
              style={{
                ...styles.input,
                resize: "vertical",
              }}
            />

          </div>

        )}


        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (

          <div style={styles.errorBox}>

            <AlertCircle
              size={19}
            />

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

            <CheckCircle2
              size={19}
            />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* ==================================================
            ACTIONS
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


          {/* ==================================================
              EDIT BUTTON
              ================================================== */}

          {hasSavedResult &&
            !editing &&
            !readOnly && (

              <button
                type="button"
                onClick={
                  startEditing
                }
                disabled={
                  saving ||
                  loadingResult
                }
                style={
                  styles.editButton
                }
              >

                <Edit3
                  size={17}
                />

                Edit

              </button>

            )}


          {/* ==================================================
              CANCEL EDITING
              ================================================== */}

          {editing && (

            <button
              type="button"
              onClick={
                cancelEditing
              }
              disabled={saving}
              style={
                styles.secondaryButton
              }
            >

              <X size={17} />

              Cancel Editing

            </button>

          )}


          {/* ==================================================
              SAVE
              ================================================== */}

          {!readOnly &&
            (
              !hasSavedResult ||
              editing
            ) && (

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving ||
                  loadingResult
                }
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

                  <Save
                    size={17}
                  />

                )}

                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Editing"
                    : "Save Result"}

              </button>

            )}

        </div>

      </div>


      {/* ==================================================
          RESPONSIVE + INLINE STYLE
          ================================================== */}

      <style>
        {`

          @keyframes aboSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .abo-blood-group-result-entry {
            width: 100%;
            box-sizing: border-box;
          }

          .abo-blood-group-result-entry *,
          .abo-blood-group-result-entry *::before,
          .abo-blood-group-result-entry *::after {
            box-sizing: border-box;
          }

          .abo-blood-group-result-entry
          select:focus,
          .abo-blood-group-result-entry
          textarea:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow:
              0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          .abo-blood-group-result-entry
          select:hover:not(:disabled),
          .abo-blood-group-result-entry
          textarea:hover:not(:disabled) {
            border-color: #9ca3af;
          }

          .abo-blood-group-result-entry
          button {
            font-family: inherit;
          }

          .abo-blood-group-result-entry
          button:disabled {
            cursor: not-allowed;
            opacity: 0.65;
          }

          @media (max-width: 760px) {

            .abo-blood-group-result-entry {
              padding: 16px !important;
              border-radius: 12px !important;
            }

            .abo-blood-group-result-entry
            .abo-header {
              flex-direction: column;
            }

          }

        `}
      </style>

    </section>
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
   INLINE STYLES
   ========================================================== */

const styles = {

  container: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: 24,
    boxSizing: "border-box",
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
    color: "#111827",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    paddingBottom: 20,
    borderBottom:
      "1px solid #e5e7eb",
  },

  department: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#2563eb",
  },

  title: {
    margin: "5px 0 0",
    fontSize: 22,
    lineHeight: 1.3,
    fontWeight: 800,
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#6b7280",
  },

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
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },

  infoItem: {
    padding: 12,
    border:
      "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#6b7280",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  formCard: {
    marginTop: 20,
    border:
      "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    background: "#ffffff",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },

  formTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },

  formDescription: {
    margin:
      "5px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#6b7280",
  },

  readonlyBadge: {
    padding:
      "6px 10px",
    borderRadius: 7,
    background: "#f3f4f6",
    color: "#4b5563",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  field: {
    width: "100%",
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },

  required: {
    color: "#dc2626",
    marginLeft: 3,
  },

  optional: {
    display: "inline-block",
    marginLeft: 8,
    padding:
      "2px 6px",
    borderRadius: 5,
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    verticalAlign: "middle",
  },

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
    fontSize: 14,
    fontFamily: "inherit",
  },

  helperText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.45,
    color: "#6b7280",
  },

  resultPreview: {
    marginTop: 20,
    padding: 18,
    border:
      "1px solid #bfdbfe",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",
  },

  previewLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#2563eb",
    marginBottom: 6,
  },

  previewResult: {
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 900,
    color: "#111827",
  },

  previewSubtext: {
    marginTop: 7,
    fontSize: 12,
    color: "#6b7280",
  },

  editBox: {
    marginTop: 20,
    padding: 16,
    border:
      "1px solid #f59e0b",
    borderRadius: 11,
    background: "#fffbeb",
  },

  editHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#92400e",
    fontSize: 14,
  },

  editWarning: {
    margin:
      "8px 0 15px",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#78350f",
  },

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
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: 600,
  },

  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 180,
    color: "#4b5563",
    fontSize: 14,
  },

  spinner: {
    animation:
      "aboSpin 1s linear infinite",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 22,
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
      "8px 15px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
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
  },
};