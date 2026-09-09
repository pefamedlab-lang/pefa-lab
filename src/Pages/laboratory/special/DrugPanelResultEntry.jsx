
/* ==========================================================
   PEFA LAB
   DRUG PANEL / TOXICOLOGY RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/DrugPanelResultEntry.jsx

   PURPOSE
   ----------------------------------------------------------
   - Structured toxicology / drug panel result entry
   - FULL EDIT-MODE ARCHITECTURE
   - Loads existing laboratory result by result ID
   - Supports View Mode / Edit Mode
   - Uses laboratoryResultService
   - Supports individual analytes
   - Supports qualitative screening results
   - Supports specimen information
   - Supports interpretation and comments
   - Saves structured result_data
   - Standalone component
   - ALL STYLING EMBEDDED IN THIS FILE

   WORKFLOW
   ----------------------------------------------------------
   Registration
        ↓
   Result Entry
        ↓
   Drug Panel / Toxicology
        ↓
   Save
        ↓
   LaboratoryResultDashboard
        ↓
   Verify → Authorize → Release

   EDIT ARCHITECTURE
   ----------------------------------------------------------
   Existing Result
        ↓
   Load by resultId
        ↓
   View Mode
        ↓
   Edit Result
        ↓
   Modify
        ↓
   Save Changes
        ↓
   LaboratoryResultService
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Beaker,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  FlaskConical,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getLaboratoryResultById,
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";

/* ==========================================================
   CONSTANTS
   ========================================================== */

const DEFAULT_DRUGS = [
  {
    key: "amphetamine",
    name: "Amphetamine",
    abbreviation: "AMP",
  },
  {
    key: "barbiturates",
    name: "Barbiturates",
    abbreviation: "BAR",
  },
  {
    key: "benzodiazepines",
    name: "Benzodiazepines",
    abbreviation: "BZO",
  },
  {
    key: "cannabinoids",
    name: "Cannabinoids",
    abbreviation: "THC",
  },
  {
    key: "cocaine",
    name: "Cocaine",
    abbreviation: "COC",
  },
  {
    key: "methamphetamine",
    name: "Methamphetamine",
    abbreviation: "MET",
  },
  {
    key: "methadone",
    name: "Methadone",
    abbreviation: "MTD",
  },
  {
    key: "opiates",
    name: "Opiates",
    abbreviation: "OPI",
  },
  {
    key: "oxycodone",
    name: "Oxycodone",
    abbreviation: "OXY",
  },
  {
    key: "phencyclidine",
    name: "Phencyclidine",
    abbreviation: "PCP",
  },
  {
    key: "tricyclic_antidepressants",
    name: "Tricyclic Antidepressants",
    abbreviation: "TCA",
  },
  {
    key: "buprenorphine",
    name: "Buprenorphine",
    abbreviation: "BUP",
  },
];

const RESULT_OPTIONS = [
  "",
  "Negative",
  "Positive",
  "Invalid",
  "Not Detected",
  "Detected",
];

const SPECIMEN_TYPES = [
  "Urine",
  "Blood",
  "Serum",
  "Plasma",
  "Saliva",
  "Hair",
  "Other",
];

const SPECIMEN_APPEARANCE = [
  "Normal",
  "Clear",
  "Slightly Turbid",
  "Turbid",
  "Abnormal",
];

const VALIDITY_OPTIONS = [
  "",
  "Valid",
  "Invalid",
  "Suspected Dilution",
  "Suspected Adulteration",
];

const OVERALL_OPTIONS = [
  "",
  "Negative",
  "Positive",
  "Invalid",
  "Presumptive Positive",
  "No Drug Detected",
  "Interpretation Pending",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getQueryValue = (
  searchParams,
  keys = []
) => {
  for (const key of keys) {
    const value = searchParams.get(key);

    if (
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};

const createInitialDrugResults = () =>
  DEFAULT_DRUGS.reduce(
    (accumulator, drug) => {
      accumulator[drug.key] = {
        result: "",
        cutoff: "",
        value: "",
        comment: "",
      };

      return accumulator;
    },
    {}
  );

const normalizeDrugResults = (
  source
) => {
  const initial =
    createInitialDrugResults();

  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    return initial;
  }

  DEFAULT_DRUGS.forEach((drug) => {
    const current =
      source[drug.key];

    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      initial[drug.key] = {
        result:
          current.result ?? "",
        cutoff:
          current.cutoff ?? "",
        value:
          current.value ?? "",
        comment:
          current.comment ?? "",
      };

      return;
    }

    /*
     * Legacy support:
     *
     * If an older result_data stored the analyte
     * directly as a string, preserve it.
     */
    if (
      typeof current === "string"
    ) {
      initial[drug.key] = {
        result: current,
        cutoff: "",
        value: "",
        comment: "",
      };
    }
  });

  return initial;
};

const getStoredData = (
  result
) => {
  if (!result) {
    return {};
  }

  const candidates = [
    result.result_data,
    result.result_json,
    result.structured_result,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate;
    }
  }

  return {};
};

/* ==========================================================
   INITIAL FORM
   ========================================================== */

const getInitialForm = (
  result = null,
  registration = null
) => {
  const data =
    getStoredData(result);

  const patientName =
    result?.patient_name ||
    result?.full_name ||
    registration?.patient_name ||
    registration?.full_name ||
    data.patientName ||
    "";

  const labNumber =
    result?.lab_number ||
    registration?.lab_number ||
    data.labNumber ||
    "";

  const patientId =
    result?.patient_id ||
    registration?.patient_id ||
    data.patientId ||
    "";

  return {
    patientName,

    labNumber,

    patientId,

    panelName:
      data.panelName ||
      result?.panel_name ||
      result?.test_name ||
      "Drug Panel / Toxicology",

    specimenType:
      data.specimenType ||
      result?.specimen_type ||
      registration?.specimen_type ||
      "Urine",

    specimenAppearance:
      data.specimenAppearance ||
      result?.specimen_appearance ||
      "",

    specimenValidity:
      data.specimenValidity ||
      result?.specimen_validity ||
      "",

    collectionDate:
      data.collectionDate ||
      result?.collection_date ||
      "",

    receivedDate:
      data.receivedDate ||
      result?.received_date ||
      "",

    drugResults:
      normalizeDrugResults(
        data.drugResults ||
          result?.drug_results
      ),

    overallResult:
      data.overallResult ||
      result?.overall_result ||
      "",

    interpretation:
      data.interpretation ||
      result?.interpretation ||
      "",

    comments:
      data.comments ||
      result?.comments ||
      "",
  };
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function DrugPanelResultEntry({
  resultId = null,
  result = null,
  registration = null,
  onSaved,
  onCancel,
  onChange,
  readOnly = false,
}) {
  /* ========================================================
     RESULT ID
     ======================================================== */

  const resolvedResultId =
    useMemo(() => {
      if (
        resultId !== null &&
        resultId !== undefined
      ) {
        return (
          Number(resultId) || null
        );
      }

      if (
        typeof window !==
        "undefined"
      ) {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const id =
          getQueryValue(params, [
            "result_id",
            "resultId",
            "id",
          ]);

        return id
          ? Number(id) || null
          : null;
      }

      return null;
    }, [resultId]);

  /* ========================================================
     STATE
     ======================================================== */

  const [resultRecord, setResultRecord] =
    useState(result);

  const [form, setForm] = useState(
    () =>
      getInitialForm(
        result,
        registration
      )
  );

  const [loading, setLoading] =
    useState(
      Boolean(resolvedResultId)
    );

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(
      !resolvedResultId &&
        !readOnly
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ========================================================
     LOAD RESULT
     ======================================================== */

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      /*
       * If no result ID was supplied, this is
       * a new-entry workflow.
       */
      if (!resolvedResultId) {
        setLoading(false);

        if (!readOnly) {
          setEditing(true);
        }

        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const loaded =
          await getLaboratoryResultById(
            resolvedResultId
          );

        if (!mounted) {
          return;
        }

        if (!loaded) {
          throw new Error(
            "The drug panel laboratory result could not be found."
          );
        }

        setResultRecord(
          loaded
        );

        setForm(
          getInitialForm(
            loaded,
            registration
          )
        );

        /*
         * Existing results ALWAYS open in
         * view mode first.
         */
        setEditing(false);
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "DrugPanelResultEntry: failed to load result",
          err
        );

        setError(
          err?.message ||
            "Unable to load drug panel result."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [
    resolvedResultId,
    registration,
    readOnly,
  ]);

  /* ========================================================
     PATIENT INFORMATION
     ======================================================== */

  const patientName =
    form.patientName ||
    registration?.full_name ||
    registration?.patient_name ||
    "";

  const labNumber =
    form.labNumber ||
    registration?.lab_number ||
    "";

  const patientId =
    form.patientId ||
    registration?.patient_id ||
    "";

  /* ========================================================
     EDIT MODE
     ======================================================== */

  const canEdit =
    !readOnly && editing;

  const enterEditMode = () => {
    if (readOnly) {
      return;
    }

    setError("");
    setSuccess("");
    setEditing(true);
  };

  const cancelEdit = () => {
    /*
     * For an existing result, cancel restores
     * the last saved version.
     */
    if (resultRecord) {
      setForm(
        getInitialForm(
          resultRecord,
          registration
        )
      );

      setEditing(false);
      setError("");
      setSuccess("");
      return;
    }

    /*
     * For a new result, cancel can be delegated
     * to the parent.
     */
    if (
      typeof onCancel ===
      "function"
    ) {
      onCancel();
      return;
    }

    setForm(
      getInitialForm(
        null,
        registration
      )
    );

    setError("");
    setSuccess("");
  };

  /* ========================================================
     FORM CHANGE
     ======================================================== */

  const updateForm = (
    field,
    value
  ) => {
    if (!canEdit) {
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");

    if (
      typeof onChange ===
      "function"
    ) {
      onChange({
        ...form,
        [field]: value,
      });
    }
  };

  const updateDrugResult = (
    drugKey,
    field,
    value
  ) => {
    if (!canEdit) {
      return;
    }

    setForm((current) => ({
      ...current,

      drugResults: {
        ...current.drugResults,

        [drugKey]: {
          ...(current.drugResults[
            drugKey
          ] || {}),
          [field]: value,
        },
      },
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     STATISTICS
     ======================================================== */

  const statistics =
    useMemo(() => {
      const entries =
        Object.values(
          form.drugResults || {}
        );

      const completed =
        entries.filter(
          (item) =>
            String(
              item?.result || ""
            ).trim() !== ""
        ).length;

      const positive =
        entries.filter(
          (item) =>
            [
              "positive",
              "detected",
            ].includes(
              normalizeText(
                item?.result
              )
            )
        ).length;

      const negative =
        entries.filter(
          (item) =>
            [
              "negative",
              "not detected",
            ].includes(
              normalizeText(
                item?.result
              )
            )
        ).length;

      const invalid =
        entries.filter(
          (item) =>
            normalizeText(
              item?.result
            ) === "invalid"
        ).length;

      return {
        total:
          entries.length,

        completed,

        pending: Math.max(
          entries.length -
            completed,
          0
        ),

        positive,

        negative,

        invalid,
      };
    }, [
      form.drugResults,
    ]);

  const completionPercent =
    statistics.total > 0
      ? Math.round(
          (statistics.completed /
            statistics.total) *
            100
        )
      : 0;

  /* ========================================================
     CALCULATE OVERALL
     ======================================================== */

  const calculateOverallResult =
    () => {
      if (!canEdit) {
        return;
      }

      const entries =
        Object.values(
          form.drugResults || {}
        );

      const hasInvalid =
        entries.some(
          (item) =>
            normalizeText(
              item?.result
            ) === "invalid"
        );

      const hasPositive =
        entries.some(
          (item) =>
            [
              "positive",
              "detected",
            ].includes(
              normalizeText(
                item?.result
              )
            )
        );

      const allNegative =
        entries.length > 0 &&
        entries.every(
          (item) =>
            [
              "negative",
              "not detected",
            ].includes(
              normalizeText(
                item?.result
              )
            )
        );

      let nextResult =
        "Interpretation Pending";

      if (hasInvalid) {
        nextResult = "Invalid";
      } else if (hasPositive) {
        nextResult =
          "Presumptive Positive";
      } else if (allNegative) {
        nextResult = "Negative";
      }

      updateForm(
        "overallResult",
        nextResult
      );
    };

  /* ========================================================
     PAYLOAD
     ======================================================== */

  const buildPayload =
    () => {
      const structuredResult = {
        testType:
          "Drug Panel",

        panelName:
          form.panelName,

        specimenType:
          form.specimenType,

        specimenAppearance:
          form.specimenAppearance,

        specimenValidity:
          form.specimenValidity,

        collectionDate:
          form.collectionDate,

        receivedDate:
          form.receivedDate,

        patientName:
          patientName,

        labNumber:
          labNumber,

        patientId:
          patientId,

        drugResults:
          form.drugResults,

        overallResult:
          form.overallResult,

        interpretation:
          form.interpretation.trim(),

        comments:
          form.comments.trim(),
      };

      const compactResult =
        DEFAULT_DRUGS.map(
          (drug) => {
            const current =
              form.drugResults?.[
                drug.key
              ] || {};

            return `${drug.abbreviation}: ${
              current.result ||
              "Not done"
            }`;
          }
        ).join("; ");

      return {
        result:
          compactResult,

        result_status:
          statistics.completed ===
          statistics.total
            ? "Entered"
            : "Pending",

        result_data:
          structuredResult,

        specimen_type:
          form.specimenType,

        specimen_appearance:
          form.specimenAppearance,

        specimen_validity:
          form.specimenValidity,

        collection_date:
          form.collectionDate ||
          null,

        received_date:
          form.receivedDate ||
          null,

        drug_results:
          form.drugResults,

        overall_result:
          form.overallResult,

        interpretation:
          form.interpretation.trim(),

        comments:
          form.comments.trim(),

        panel_name:
          form.panelName,

        test_type:
          "Drug Panel",
      };
    };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave =
    async (event) => {
      event?.preventDefault();

      if (!canEdit) {
        return;
      }

      if (saving) {
        return;
      }

      setError("");
      setSuccess("");

      if (!form.specimenType) {
        setError(
          "Please select the specimen type."
        );
        return;
      }

      if (
        form.specimenValidity ===
        "Invalid"
      ) {
        setError(
          "The specimen is marked invalid. Review the specimen before saving."
        );
        return;
      }

      if (
        !resolvedResultId
      ) {
        /*
         * This component is deliberately
         * connected to the existing
         * laboratoryResultService update
         * architecture.
         *
         * A new record should normally be
         * created by the parent registration/
         * result-entry workflow.
         */
        if (
          typeof onSaved ===
          "function"
        ) {
          try {
            setSaving(true);

            const payload =
              buildPayload();

            await onSaved(
              payload
            );

            setSuccess(
              "Drug panel result saved successfully."
            );
          } catch (err) {
            setError(
              err?.message ||
                "Unable to save drug panel result."
            );
          } finally {
            setSaving(false);
          }
        }

        return;
      }

      setSaving(true);

      try {
        const payload =
          buildPayload();

        const saved =
          await updateLaboratoryResult(
            resolvedResultId,
            payload
          );

        const updatedRecord =
          saved ||
          {
            ...(resultRecord ||
              {}),
            ...payload,
          };

        setResultRecord(
          updatedRecord
        );

        /*
         * Return to view mode after
         * successful save.
         */
        setEditing(false);

        setSuccess(
          "Drug panel result updated successfully."
        );

        if (
          typeof onSaved ===
          "function"
        ) {
          onSaved(
            updatedRecord
          );
        }
      } catch (err) {
        console.error(
          "DrugPanelResultEntry: save failed",
          err
        );

        setError(
          err?.message ||
            "Unable to update drug panel result."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ========================================================
     RESET
     ======================================================== */

  const handleReset =
    () => {
      if (!canEdit) {
        return;
      }

      if (resultRecord) {
        setForm(
          getInitialForm(
            resultRecord,
            registration
          )
        );

        setError("");
        setSuccess("");
        return;
      }

      setForm(
        getInitialForm(
          null,
          registration
        )
      );

      setError("");
      setSuccess("");
    };

  /* ========================================================
     LOADING
     ======================================================== */

  if (loading) {
    return (
      <div className="drug-panel-entry">
        <style>
          {DRUG_PANEL_STYLES}
        </style>

        <div className="drug-panel-entry__loading">
          <Loader2
            size={25}
            className="drug-panel-entry__spin"
          />

          Loading drug panel result...
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section className="drug-panel-entry">
      <style>
        {DRUG_PANEL_STYLES}
      </style>

      {/* ====================================================
          HEADER
         ==================================================== */}

      <header className="drug-panel-entry__header">
        <div className="drug-panel-entry__title-area">
          <div className="drug-panel-entry__icon">
            <FlaskConical
              size={24}
            />
          </div>

          <div>
            <div className="drug-panel-entry__eyebrow">
              PEFA LABORATORY • TOXICOLOGY
            </div>

            <h2>
              Drug Panel Result Entry
            </h2>

            <p>
              Structured toxicology
              screening and result
              management
            </p>
          </div>
        </div>

        <div className="drug-panel-entry__mode">
          {editing ? (
            <>
              <Edit3 size={16} />
              EDIT MODE
            </>
          ) : (
            <>
              <Lock size={16} />
              VIEW MODE
            </>
          )}
        </div>
      </header>

      {/* ====================================================
          EDIT BAR
         ==================================================== */}

      {resultRecord && (
        <div className="drug-panel-entry__editbar">
          <div>
            {editing ? (
              <>
                <strong>
                  Editing Result
                </strong>

                <span>
                  Changes will be
                  saved to the existing
                  laboratory result.
                </span>
              </>
            ) : (
              <>
                <strong>
                  Result Locked
                </strong>

                <span>
                  This saved result is
                  currently in view mode.
                </span>
              </>
            )}
          </div>

          {!readOnly && (
            <div className="drug-panel-entry__edit-actions">
              {!editing ? (
                <button
                  type="button"
                  className="drug-panel-entry__button drug-panel-entry__button--edit"
                  onClick={
                    enterEditMode
                  }
                >
                  <Edit3
                    size={16}
                  />
                  Edit Result
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="drug-panel-entry__button drug-panel-entry__button--secondary"
                    onClick={
                      cancelEdit
                    }
                    disabled={
                      saving
                    }
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="drug-panel-entry__button drug-panel-entry__button--secondary"
                    onClick={
                      handleReset
                    }
                    disabled={
                      saving
                    }
                  >
                    <RotateCcw
                      size={16}
                    />
                    Restore
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          PATIENT
         ==================================================== */}

      <div className="drug-panel-entry__patient">
        <div>
          <span>
            PATIENT
          </span>

          <strong>
            {patientName || "—"}
          </strong>
        </div>

        <div>
          <span>
            LAB NUMBER
          </span>

          <strong>
            {labNumber || "—"}
          </strong>
        </div>

        <div>
          <span>
            PATIENT ID
          </span>

          <strong>
            {patientId || "—"}
          </strong>
        </div>

        <div>
          <span>
            STATUS
          </span>

          <strong>
            {form.overallResult ||
              "Pending"}
          </strong>
        </div>
      </div>

      {/* ====================================================
          ALERTS
         ==================================================== */}

      {error && (
        <div className="drug-panel-entry__alert drug-panel-entry__alert--error">
          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="drug-panel-entry__alert drug-panel-entry__alert--success">
          <CheckCircle2
            size={18}
          />

          <span>
            {success}
          </span>
        </div>
      )}

      {/* ====================================================
          COMPLETION
         ==================================================== */}

      <div className="drug-panel-entry__completion">
        <div>
          <span>
            PANEL COMPLETION
          </span>

          <strong>
            {statistics.completed}/
            {statistics.total}
          </strong>
        </div>

        <div className="drug-panel-entry__progress">
          <span
            style={{
              width: `${completionPercent}%`,
            }}
          />
        </div>

        <small>
          {completionPercent}% complete
        </small>
      </div>

      {/* ====================================================
          TEST INFORMATION
         ==================================================== */}

      <div className="drug-panel-entry__card">
        <div className="drug-panel-entry__section-heading">
          <div>
            <span>
              TEST INFORMATION
            </span>

            <h3>
              Panel & Specimen
            </h3>
          </div>

          <Beaker size={20} />
        </div>

        <div className="drug-panel-entry__grid">
          <div className="drug-panel-entry__field drug-panel-entry__field--wide">
            <label>
              Panel / Test Name
            </label>

            <input
              type="text"
              value={
                form.panelName
              }
              onChange={(event) =>
                updateForm(
                  "panelName",
                  event.target.value
                )
              }
              disabled={!canEdit}
            />
          </div>

          <div className="drug-panel-entry__field">
            <label>
              Specimen Type
            </label>

            <select
              value={
                form.specimenType
              }
              onChange={(event) =>
                updateForm(
                  "specimenType",
                  event.target.value
                )
              }
              disabled={!canEdit}
            >
              {SPECIMEN_TYPES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="drug-panel-entry__field">
            <label>
              Specimen Appearance
            </label>

            <select
              value={
                form.specimenAppearance
              }
              onChange={(event) =>
                updateForm(
                  "specimenAppearance",
                  event.target.value
                )
              }
              disabled={!canEdit}
            >
              <option value="">
                Select appearance
              </option>

              {SPECIMEN_APPEARANCE.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="drug-panel-entry__field">
            <label>
              Specimen Validity
            </label>

            <select
              value={
                form.specimenValidity
              }
              onChange={(event) =>
                updateForm(
                  "specimenValidity",
                  event.target.value
                )
              }
              disabled={!canEdit}
            >
              {VALIDITY_OPTIONS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item ||
                      "Select validity"}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="drug-panel-entry__field">
            <label>
              Collection Date
            </label>

            <input
              type="datetime-local"
              value={
                form.collectionDate
              }
              onChange={(event) =>
                updateForm(
                  "collectionDate",
                  event.target.value
                )
              }
              disabled={!canEdit}
            />
          </div>

          <div className="drug-panel-entry__field">
            <label>
              Received Date
            </label>

            <input
              type="datetime-local"
              value={
                form.receivedDate
              }
              onChange={(event) =>
                updateForm(
                  "receivedDate",
                  event.target.value
                )
              }
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      {/* ====================================================
          STATISTICS
         ==================================================== */}

      <div className="drug-panel-entry__summary">
        <div>
          <span>
            ANALYTES
          </span>
          <strong>
            {statistics.total}
          </strong>
        </div>

        <div>
          <span>
            COMPLETED
          </span>
          <strong>
            {statistics.completed}
          </strong>
        </div>

        <div>
          <span>
            PENDING
          </span>
          <strong>
            {statistics.pending}
          </strong>
        </div>

        <div>
          <span>
            POSITIVE
          </span>
          <strong>
            {statistics.positive}
          </strong>
        </div>

        <div>
          <span>
            NEGATIVE
          </span>
          <strong>
            {statistics.negative}
          </strong>
        </div>

        <div>
          <span>
            INVALID
          </span>
          <strong>
            {statistics.invalid}
          </strong>
        </div>
      </div>

      {/* ====================================================
          DRUG RESULTS
         ==================================================== */}

      <div className="drug-panel-entry__card">
        <div className="drug-panel-entry__section-heading">
          <div>
            <span>
              TOXICOLOGY SCREEN
            </span>

            <h3>
              Drug / Analyte Results
            </h3>
          </div>

          <span className="drug-panel-entry__count">
            {statistics.completed}/
            {statistics.total}
          </span>
        </div>

        <div className="drug-panel-entry__table-wrapper">
          <table className="drug-panel-entry__table">
            <thead>
              <tr>
                <th>
                  ANALYTE
                </th>

                <th>
                  CODE
                </th>

                <th>
                  RESULT
                </th>

                <th>
                  VALUE
                </th>

                <th>
                  CUT-OFF
                </th>

                <th>
                  COMMENT
                </th>
              </tr>
            </thead>

            <tbody>
              {DEFAULT_DRUGS.map(
                (drug) => {
                  const current =
                    form.drugResults?.[
                      drug.key
                    ] || {};

                  const entered =
                    String(
                      current.result ||
                        ""
                    ).trim() !== "";

                  const resultTone =
                    [
                      "positive",
                      "detected",
                    ].includes(
                      normalizeText(
                        current.result
                      )
                    )
                      ? "positive"
                      : [
                            "negative",
                            "not detected",
                          ].includes(
                            normalizeText(
                              current.result
                            )
                          )
                        ? "negative"
                        : "";

                  return (
                    <tr
                      key={
                        drug.key
                      }
                      className={
                        entered
                          ? "is-entered"
                          : ""
                      }
                    >
                      <td>
                        <strong>
                          {drug.name}
                        </strong>
                      </td>

                      <td>
                        <span className="drug-panel-entry__code">
                          {
                            drug.abbreviation
                          }
                        </span>
                      </td>

                      <td>
                        <div className="drug-panel-entry__result-control">
                          <select
                            value={
                              current.result ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateDrugResult(
                                drug.key,
                                "result",
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              !canEdit
                            }
                            className={
                              resultTone
                                ? `is-${resultTone}`
                                : ""
                            }
                          >
                            {RESULT_OPTIONS.map(
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
                                  {option ||
                                    "Select result"}
                                </option>
                              )
                            )}
                          </select>

                          {entered && (
                            <CheckCircle2
                              size={
                                16
                              }
                              className="drug-panel-entry__row-check"
                            />
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          value={
                            current.value ||
                            ""
                          }
                          placeholder="—"
                          onChange={(
                            event
                          ) =>
                            updateDrugResult(
                              drug.key,
                              "value",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            !canEdit
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={
                            current.cutoff ||
                            ""
                          }
                          placeholder="—"
                          onChange={(
                            event
                          ) =>
                            updateDrugResult(
                              drug.key,
                              "cutoff",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            !canEdit
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={
                            current.comment ||
                            ""
                          }
                          placeholder="Optional"
                          onChange={(
                            event
                          ) =>
                            updateDrugResult(
                              drug.key,
                              "comment",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            !canEdit
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================
          FINAL INTERPRETATION
         ==================================================== */}

      <div className="drug-panel-entry__card">
        <div className="drug-panel-entry__section-heading">
          <div>
            <span>
              FINAL INTERPRETATION
            </span>

            <h3>
              Overall Result
            </h3>
          </div>

          <ShieldCheck
            size={20}
          />
        </div>

        <div className="drug-panel-entry__interpretation-grid">
          <div className="drug-panel-entry__field">
            <label>
              Overall Result
            </label>

            <select
              value={
                form.overallResult
              }
              onChange={(event) =>
                updateForm(
                  "overallResult",
                  event.target.value
                )
              }
              disabled={!canEdit}
            >
              {OVERALL_OPTIONS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item ||
                      "Select overall result"}
                  </option>
                )
              )}
            </select>
          </div>

          {canEdit && (
            <button
              type="button"
              className="drug-panel-entry__calculate"
              onClick={
                calculateOverallResult
              }
            >
              <ClipboardCheck
                size={17}
              />

              Calculate Overall
            </button>
          )}
        </div>

        <div className="drug-panel-entry__field">
          <label>
            Interpretation
          </label>

          <textarea
            rows={4}
            value={
              form.interpretation
            }
            placeholder="Enter laboratory interpretation..."
            onChange={(event) =>
              updateForm(
                "interpretation",
                event.target.value
              )
            }
            disabled={!canEdit}
          />
        </div>

        <div className="drug-panel-entry__field">
          <label>
            Laboratory Comments
          </label>

          <textarea
            rows={3}
            value={
              form.comments
            }
            placeholder="Enter additional laboratory comments..."
            onChange={(event) =>
              updateForm(
                "comments",
                event.target.value
              )
            }
            disabled={!canEdit}
          />
        </div>
      </div>

      {/* ====================================================
          FOOTER
         ==================================================== */}

      {canEdit && (
        <div className="drug-panel-entry__footer">
          <div className="drug-panel-entry__footer-status">
            <ClipboardCheck
              size={17}
            />

            <span>
              {statistics.completed ===
              statistics.total
                ? "All toxicology parameters completed."
                : `${statistics.pending} parameter(s) still pending.`}
            </span>
          </div>

          <div className="drug-panel-entry__footer-actions">
            <button
              type="button"
              className="drug-panel-entry__button drug-panel-entry__button--secondary"
              onClick={
                cancelEdit
              }
              disabled={saving}
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              className="drug-panel-entry__button drug-panel-entry__button--primary"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="drug-panel-entry__spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                  />

                  {resolvedResultId
                    ? "Save Changes"
                    : "Save Drug Panel Result"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          VIEW MODE FOOTER
         ==================================================== */}

      {!editing &&
        resultRecord && (
          <div className="drug-panel-entry__view-footer">
            <div>
              <Lock
                size={16}
              />

              <span>
                Result is in View Mode.
                Click <strong>Edit Result</strong>
                to make changes.
              </span>
            </div>

            {!readOnly && (
              <button
                type="button"
                className="drug-panel-entry__button drug-panel-entry__button--edit"
                onClick={
                  enterEditMode
                }
              >
                <Edit3
                  size={16}
                />

                Edit Result
              </button>
            )}
          </div>
        )}
    </section>
  );
}

/* ==========================================================
   EMBEDDED STYLES
   ========================================================== */

const DRUG_PANEL_STYLES = `
.drug-panel-entry {
  --dp-border: #dfe5ec;
  --dp-border-dark: #cbd3dd;
  --dp-text: #18212f;
  --dp-muted: #667085;
  --dp-soft: #f7f9fc;
  --dp-primary: #155eef;
  --dp-primary-dark: #104dcc;
  --dp-success: #087443;
  --dp-success-soft: #ecfdf3;
  --dp-warning: #b54708;
  --dp-warning-soft: #fffaeb;
  --dp-danger: #b42318;
  --dp-danger-soft: #fef3f2;
  --dp-white: #ffffff;

  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;

  color: var(--dp-text);
  background: #f5f7fa;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  font-size: 12px;
}

.drug-panel-entry *,
.drug-panel-entry *::before,
.drug-panel-entry *::after {
  box-sizing: border-box;
}

.drug-panel-entry__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 22px 24px;

  background:
    linear-gradient(
      135deg,
      #ffffff 0%,
      #f8fbff 100%
    );

  border: 1px solid var(--dp-border);
  border-radius: 14px;

  box-shadow:
    0 4px 18px rgba(16, 24, 40, 0.05);
}

.drug-panel-entry__title-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.drug-panel-entry__icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  color: var(--dp-primary);
  background: #eef4ff;

  border: 1px solid #d9e5ff;
}

.drug-panel-entry__eyebrow {
  margin-bottom: 4px;

  color: var(--dp-primary);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.drug-panel-entry h2 {
  margin: 0;

  font-size: 20px;
  line-height: 1.2;
  font-weight: 800;
}

.drug-panel-entry__header p {
  margin: 5px 0 0;
  color: var(--dp-muted);
}

.drug-panel-entry__mode {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 8px 12px;

  border-radius: 999px;

  background: #eef4ff;
  color: var(--dp-primary);

  border: 1px solid #d9e5ff;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

/* ----------------------------------------------------------
   EDIT BAR
---------------------------------------------------------- */

.drug-panel-entry__editbar {
  margin-top: 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 13px 16px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 10px;
}

.drug-panel-entry__editbar > div:first-child {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drug-panel-entry__editbar strong {
  font-size: 12px;
}

.drug-panel-entry__editbar span {
  color: var(--dp-muted);
}

.drug-panel-entry__edit-actions {
  display: flex;
  gap: 8px;
}

/* ----------------------------------------------------------
   PATIENT
---------------------------------------------------------- */

.drug-panel-entry__patient {
  display: grid;
  grid-template-columns:
    1.5fr
    1fr
    1fr
    1fr;

  margin-top: 14px;

  background: var(--dp-white);

  border: 1px solid var(--dp-border);
  border-radius: 12px;

  overflow: hidden;
}

.drug-panel-entry__patient > div {
  padding: 13px 16px;
  border-right: 1px solid var(--dp-border);
}

.drug-panel-entry__patient > div:last-child {
  border-right: 0;
}

.drug-panel-entry__patient span {
  display: block;
  margin-bottom: 5px;

  color: var(--dp-muted);

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.drug-panel-entry__patient strong {
  display: block;

  color: var(--dp-text);

  font-size: 12px;
  font-weight: 700;
}

/* ----------------------------------------------------------
   ALERTS
---------------------------------------------------------- */

.drug-panel-entry__alert {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-top: 14px;
  padding: 12px 14px;

  border-radius: 9px;

  font-weight: 600;
}

.drug-panel-entry__alert--error {
  color: var(--dp-danger);
  background: var(--dp-danger-soft);
  border: 1px solid #fecdca;
}

.drug-panel-entry__alert--success {
  color: var(--dp-success);
  background: var(--dp-success-soft);
  border: 1px solid #abefc6;
}

/* ----------------------------------------------------------
   COMPLETION
---------------------------------------------------------- */

.drug-panel-entry__completion {
  margin-top: 14px;

  padding: 14px 16px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 11px;
}

.drug-panel-entry__completion > div:first-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drug-panel-entry__completion span {
  color: var(--dp-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.drug-panel-entry__completion strong {
  font-size: 14px;
}

.drug-panel-entry__progress {
  height: 6px;

  margin-top: 10px;

  overflow: hidden;

  background: #edf1f5;

  border-radius: 99px;
}

.drug-panel-entry__progress span {
  display: block;
  height: 100%;

  background: var(--dp-primary);

  border-radius: inherit;

  transition: width 0.25s ease;
}

.drug-panel-entry__completion small {
  display: block;
  margin-top: 6px;

  color: var(--dp-muted);
}

/* ----------------------------------------------------------
   CARDS
---------------------------------------------------------- */

.drug-panel-entry__card {
  margin-top: 14px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 2px 8px rgba(16, 24, 40, 0.025);
}

.drug-panel-entry__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 15px 18px;

  background: #fbfcfe;

  border-bottom: 1px solid var(--dp-border);
}

.drug-panel-entry__section-heading span {
  color: var(--dp-muted);

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

.drug-panel-entry__section-heading h3 {
  margin: 4px 0 0;

  font-size: 14px;
  font-weight: 800;
}

.drug-panel-entry__section-heading svg {
  color: var(--dp-primary);
}

.drug-panel-entry__count {
  padding: 5px 9px;

  border-radius: 999px;

  color: var(--dp-primary) !important;
  background: #eef4ff;

  border: 1px solid #d9e5ff;
}

/* ----------------------------------------------------------
   GRID
---------------------------------------------------------- */

.drug-panel-entry__grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 15px;

  padding: 18px;
}

.drug-panel-entry__field--wide {
  grid-column: span 2;
}

.drug-panel-entry__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drug-panel-entry__field label {
  color: #475467;

  font-size: 10px;
  font-weight: 750;
}

.drug-panel-entry input,
.drug-panel-entry select,
.drug-panel-entry textarea {
  width: 100%;

  padding: 9px 10px;

  color: var(--dp-text);
  background: #fff;

  border: 1px solid var(--dp-border-dark);
  border-radius: 7px;

  outline: none;

  font-family: inherit;
  font-size: 12px;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.drug-panel-entry textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.drug-panel-entry input:focus,
.drug-panel-entry select:focus,
.drug-panel-entry textarea:focus {
  border-color: var(--dp-primary);

  box-shadow:
    0 0 0 3px rgba(
      21,
      94,
      239,
      0.1
    );
}

.drug-panel-entry input:disabled,
.drug-panel-entry select:disabled,
.drug-panel-entry textarea:disabled {
  color: #475467;

  background: #f5f7fa;

  cursor: not-allowed;
}

/* ----------------------------------------------------------
   SUMMARY
---------------------------------------------------------- */

.drug-panel-entry__summary {
  display: grid;

  grid-template-columns:
    repeat(6, 1fr);

  gap: 10px;

  margin-top: 14px;
}

.drug-panel-entry__summary > div {
  padding: 13px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 9px;
}

.drug-panel-entry__summary span {
  display: block;

  color: var(--dp-muted);

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.drug-panel-entry__summary strong {
  display: block;

  margin-top: 5px;

  font-size: 17px;
  font-weight: 800;
}

/* ----------------------------------------------------------
   TABLE
---------------------------------------------------------- */

.drug-panel-entry__table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.drug-panel-entry__table {
  width: 100%;

  border-collapse: collapse;

  min-width: 1050px;
}

.drug-panel-entry__table th {
  padding: 10px 11px;

  color: #667085;

  background: #f8fafc;

  border-bottom: 1px solid var(--dp-border);

  text-align: left;

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.drug-panel-entry__table td {
  padding: 10px 11px;

  border-bottom: 1px solid #edf0f3;

  vertical-align: middle;
}

.drug-panel-entry__table tbody tr:last-child td {
  border-bottom: 0;
}

.drug-panel-entry__table tbody tr.is-entered {
  background: #fbfdff;
}

.drug-panel-entry__table td strong {
  font-size: 12px;
}

.drug-panel-entry__code {
  display: inline-flex;

  min-width: 38px;

  align-items: center;
  justify-content: center;

  padding: 5px 8px;

  color: #344054;

  background: #f2f4f7;

  border: 1px solid #eaecf0;

  border-radius: 5px;

  font-size: 10px;
  font-weight: 800;
}

.drug-panel-entry__result-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.drug-panel-entry__result-control select {
  min-width: 130px;
}

.drug-panel-entry__result-control select.is-positive {
  color: var(--dp-danger);
  border-color: #fda29b;
  background: #fff7f6;
  font-weight: 700;
}

.drug-panel-entry__result-control select.is-negative {
  color: var(--dp-success);
  border-color: #75e0a7;
  background: #f6fef9;
  font-weight: 700;
}

.drug-panel-entry__row-check {
  color: var(--dp-success);
  flex: 0 0 auto;
}

.drug-panel-entry__table input {
  min-width: 105px;
}

.drug-panel-entry__table td:last-child input {
  min-width: 180px;
}

/* ----------------------------------------------------------
   INTERPRETATION
---------------------------------------------------------- */

.drug-panel-entry__interpretation-grid {
  display: grid;

  grid-template-columns:
    minmax(220px, 1fr)
    auto;

  align-items: end;

  gap: 14px;

  padding: 18px 18px 0;
}

.drug-panel-entry__interpretation-grid
  + .drug-panel-entry__field {
  margin: 15px 18px 0;
}

.drug-panel-entry__interpretation-grid
  + .drug-panel-entry__field
  + .drug-panel-entry__field {
  margin: 15px 18px 18px;
}

.drug-panel-entry__calculate {
  min-height: 37px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  padding: 0 14px;

  color: var(--dp-primary);

  background: #eef4ff;

  border: 1px solid #d9e5ff;
  border-radius: 7px;

  cursor: pointer;

  font-family: inherit;
  font-size: 11px;
  font-weight: 750;
}

.drug-panel-entry__calculate:hover {
  background: #e5edff;
}

/* ----------------------------------------------------------
   BUTTONS
---------------------------------------------------------- */

.drug-panel-entry__button {
  min-height: 36px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  padding: 0 14px;

  border-radius: 7px;

  cursor: pointer;

  font-family: inherit;
  font-size: 11px;
  font-weight: 750;

  transition:
    transform 0.1s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.drug-panel-entry__button:active {
  transform: translateY(1px);
}

.drug-panel-entry__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.drug-panel-entry__button--primary {
  color: #fff;

  background: var(--dp-primary);

  border: 1px solid var(--dp-primary);
}

.drug-panel-entry__button--primary:hover:not(:disabled) {
  background: var(--dp-primary-dark);
}

.drug-panel-entry__button--secondary {
  color: #344054;

  background: #fff;

  border: 1px solid var(--dp-border-dark);
}

.drug-panel-entry__button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.drug-panel-entry__button--edit {
  color: var(--dp-primary);

  background: #eef4ff;

  border: 1px solid #d9e5ff;
}

.drug-panel-entry__button--edit:hover:not(:disabled) {
  background: #e4edff;
}

/* ----------------------------------------------------------
   FOOTER
---------------------------------------------------------- */

.drug-panel-entry__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: 14px;
  padding: 14px 16px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 11px;
}

.drug-panel-entry__footer-status {
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--dp-muted);
}

.drug-panel-entry__footer-status svg {
  color: var(--dp-primary);
}

.drug-panel-entry__footer-actions {
  display: flex;
  gap: 8px;
}

.drug-panel-entry__view-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: 14px;
  padding: 13px 16px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 10px;
}

.drug-panel-entry__view-footer > div {
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--dp-muted);
}

.drug-panel-entry__view-footer svg {
  color: var(--dp-primary);
}

/* ----------------------------------------------------------
   LOADING
---------------------------------------------------------- */

.drug-panel-entry__loading {
  min-height: 280px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  background: #fff;

  border: 1px solid var(--dp-border);
  border-radius: 12px;

  color: var(--dp-muted);

  font-weight: 700;
}

.drug-panel-entry__spin {
  animation:
    drug-panel-spin
    0.9s linear infinite;
}

@keyframes drug-panel-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ----------------------------------------------------------
   RESPONSIVE
---------------------------------------------------------- */

@media (max-width: 1100px) {
  .drug-panel-entry__patient {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .drug-panel-entry__patient > div:nth-child(2) {
    border-right: 0;
  }

  .drug-panel-entry__summary {
    grid-template-columns:
      repeat(3, 1fr);
  }

  .drug-panel-entry__grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .drug-panel-entry__field--wide {
    grid-column: span 2;
  }
}

@media (max-width: 700px) {
  .drug-panel-entry {
    padding: 12px;
  }

  .drug-panel-entry__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .drug-panel-entry__editbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .drug-panel-entry__editbar > div:first-child {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .drug-panel-entry__patient {
    grid-template-columns: 1fr;
  }

  .drug-panel-entry__patient > div {
    border-right: 0;
    border-bottom: 1px solid var(--dp-border);
  }

  .drug-panel-entry__patient > div:last-child {
    border-bottom: 0;
  }

  .drug-panel-entry__grid {
    grid-template-columns: 1fr;
  }

  .drug-panel-entry__field--wide {
    grid-column: span 1;
  }

  .drug-panel-entry__summary {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .drug-panel-entry__interpretation-grid {
    grid-template-columns: 1fr;
  }

  .drug-panel-entry__footer,
  .drug-panel-entry__view-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .drug-panel-entry__footer-actions {
    width: 100%;
  }

  .drug-panel-entry__footer-actions
    .drug-panel-entry__button {
    flex: 1;
  }
}
`;