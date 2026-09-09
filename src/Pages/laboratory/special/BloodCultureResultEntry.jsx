/* ==========================================================
   PEFA LAB
   BLOOD CULTURE RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/BloodCultureResultEntry.jsx

   PURPOSE:
   - Blood Culture result entry
   - Structured microbiology workflow
   - View saved result
   - Edit saved result
   - Save new result
   - Save changes to existing result
   - Organism identification
   - Antimicrobial susceptibility
   - Interpretation and comments

   EDIT ARCHITECTURE:
   ----------------------------------------------------------
   NEW RESULT
      ↓
   Editable Form
      ↓
   Save Result

   EXISTING RESULT
      ↓
   Read-only / View Mode
      ↓
   Edit Result
      ↓
   Editable Form
      ↓
   Save Changes
      OR
   Cancel Edit
      ↓
   Restore Original Result

   DATABASE PAYLOAD:
   ----------------------------------------------------------
   Existing payload structure is preserved.

   Payload remains:

      {
        ...form,
        interpretation,
        organisms
      }

   No database field names have been changed.
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
  FlaskConical,
  Lock,
} from "lucide-react";

/* ==========================================================
   CONSTANTS
   ========================================================== */

const CULTURE_OPTIONS = [
  "No Growth",
  "Growth",
  "Contaminated",
  "Pending",
];

const BOTTLE_OPTIONS = [
  "Aerobic",
  "Anaerobic",
  "Aerobic + Anaerobic",
  "Pediatric",
];

const GRAM_STAIN_OPTIONS = [
  "Not Done",
  "No Organism Seen",
  "Gram Positive Cocci",
  "Gram Positive Bacilli",
  "Gram Negative Cocci",
  "Gram Negative Bacilli",
  "Mixed Gram Positive and Gram Negative Organisms",
  "Yeast Cells",
];

const ORGANISM_OPTIONS = [
  "Escherichia coli",
  "Klebsiella pneumoniae",
  "Pseudomonas aeruginosa",
  "Proteus mirabilis",
  "Proteus vulgaris",
  "Enterobacter species",
  "Citrobacter species",
  "Serratia species",
  "Staphylococcus aureus",
  "Coagulase-negative Staphylococcus",
  "Streptococcus species",
  "Enterococcus species",
  "Candida species",
  "Other",
];

const SUSCEPTIBILITY_OPTIONS = [
  "",
  "S",
  "I",
  "R",
];

const COMMON_ANTIBIOTICS = [
  "Amikacin",
  "Amoxicillin",
  "Amoxicillin/Clavulanate",
  "Ampicillin",
  "Azithromycin",
  "Cefepime",
  "Cefixime",
  "Cefotaxime",
  "Ceftazidime",
  "Ceftriaxone",
  "Cefuroxime",
  "Ciprofloxacin",
  "Clindamycin",
  "Gentamicin",
  "Imipenem",
  "Levofloxacin",
  "Meropenem",
  "Metronidazole",
  "Nitrofurantoin",
  "Piperacillin/Tazobactam",
  "Tetracycline",
  "Trimethoprim/Sulfamethoxazole",
  "Vancomycin",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const generateId = (prefix = "row") =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

const createAntibioticRow = () => ({
  id: generateId("antibiotic"),
  antibiotic: "",
  result: "",
});

const createOrganismRow = () => ({
  id: generateId("organism"),
  organism: "",
  identification: "",
  comment: "",
  antibiotics: [createAntibioticRow()],
});

/* ==========================================================
   DATA NORMALIZATION
   ----------------------------------------------------------
   Ensures previously saved rows that may not contain an id
   can still be safely edited.
   ========================================================== */

const normalizeOrganisms = (items) => {
  if (!Array.isArray(items) || !items.length) {
    return [createOrganismRow()];
  }

  return items.map((organism) => ({
    id: organism?.id || generateId("organism"),

    organism:
      organism?.organism || "",

    identification:
      organism?.identification || "",

    comment:
      organism?.comment || "",

    antibiotics:
      Array.isArray(organism?.antibiotics) &&
      organism.antibiotics.length
        ? organism.antibiotics.map(
            (antibiotic) => ({
              id:
                antibiotic?.id ||
                generateId("antibiotic"),

              antibiotic:
                antibiotic?.antibiotic || "",

              result:
                antibiotic?.result || "",
            })
          )
        : [createAntibioticRow()],
  }));
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function BloodCultureResultEntry({
  patient = {},
  registration = {},
  initialData = {},
  onSave,
  onCancel,
}) {
  /* ========================================================
     DETERMINE EXISTING RESULT
     ======================================================== */

  const hasExistingResult = useMemo(() => {
    if (!initialData) {
      return false;
    }

    return Object.keys(initialData).some(
      (key) => {
        const value =
          initialData[key];

        if (
          value === null ||
          value === undefined
        ) {
          return false;
        }

        if (
          typeof value === "string" &&
          value.trim() === ""
        ) {
          return false;
        }

        if (
          Array.isArray(value) &&
          value.length === 0
        ) {
          return false;
        }

        return true;
      }
    );
  }, [initialData]);

  /* ========================================================
     FORM STATE
     ======================================================== */

  const createFormFromInitialData = () => ({
    specimenType:
      initialData?.specimenType ||
      "Blood",

    bottleType:
      initialData?.bottleType ||
      "Aerobic",

    collectionDate:
      initialData?.collectionDate ||
      "",

    collectionTime:
      initialData?.collectionTime ||
      "",

    receivedDate:
      initialData?.receivedDate ||
      "",

    receivedTime:
      initialData?.receivedTime ||
      "",

    incubationStart:
      initialData?.incubationStart ||
      "",

    gramStain:
      initialData?.gramStain ||
      "Not Done",

    cultureResult:
      initialData?.cultureResult ||
      "Pending",

    finalReport:
      initialData?.finalReport ||
      "",

    interpretation:
      initialData?.interpretation ||
      "",

    comments:
      initialData?.comments ||
      "",
  });

  const [form, setForm] = useState(
    createFormFromInitialData
  );

  const [organisms, setOrganisms] =
    useState(() =>
      normalizeOrganisms(
        initialData?.organisms
      )
    );

  /* ========================================================
     EDIT STATE
     ======================================================== */

  const [isEditing, setIsEditing] =
    useState(!hasExistingResult);

  const [originalForm, setOriginalForm] =
    useState(() =>
      createFormFromInitialData()
    );

  const [originalOrganisms, setOriginalOrganisms] =
    useState(() =>
      normalizeOrganisms(
        initialData?.organisms
      )
    );

  /* ========================================================
     UI STATE
     ======================================================== */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ========================================================
     KEEP FORM SYNCHRONIZED WHEN RESULT CHANGES
     ======================================================== */

  useEffect(() => {
    const nextForm = {
      specimenType:
        initialData?.specimenType ||
        "Blood",

      bottleType:
        initialData?.bottleType ||
        "Aerobic",

      collectionDate:
        initialData?.collectionDate ||
        "",

      collectionTime:
        initialData?.collectionTime ||
        "",

      receivedDate:
        initialData?.receivedDate ||
        "",

      receivedTime:
        initialData?.receivedTime ||
        "",

      incubationStart:
        initialData?.incubationStart ||
        "",

      gramStain:
        initialData?.gramStain ||
        "Not Done",

      cultureResult:
        initialData?.cultureResult ||
        "Pending",

      finalReport:
        initialData?.finalReport ||
        "",

      interpretation:
        initialData?.interpretation ||
        "",

      comments:
        initialData?.comments ||
        "",
    };

    const nextOrganisms =
      normalizeOrganisms(
        initialData?.organisms
      );

    setForm(nextForm);
    setOrganisms(nextOrganisms);

    setOriginalForm(nextForm);
    setOriginalOrganisms(nextOrganisms);

    setIsEditing(
      !(
        initialData &&
        Object.keys(initialData).length
      )
    );

    setError("");
    setSuccess("");
  }, [initialData]);

  /* ========================================================
     PATIENT DISPLAY
     ======================================================== */

  const patientName =
    patient?.full_name ||
    patient?.patient_name ||
    registration?.full_name ||
    registration?.patient_name ||
    "—";

  const patientId =
    patient?.patient_id ||
    registration?.patient_id ||
    "—";

  const labNumber =
    registration?.lab_number ||
    patient?.lab_number ||
    "—";

  const registrationNumber =
    registration?.registration_number ||
    patient?.registration_number ||
    "—";

  /* ========================================================
     UPDATE FORM
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

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ORGANISM MANAGEMENT
     ======================================================== */

  const updateOrganism = (
    organismId,
    field,
    value
  ) => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) =>
      current.map((organism) =>
        organism.id === organismId
          ? {
              ...organism,
              [field]: value,
            }
          : organism
      )
    );

    setError("");
    setSuccess("");
  };

  const addOrganism = () => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) => [
      ...current,
      createOrganismRow(),
    ]);

    setError("");
    setSuccess("");
  };

  const removeOrganism = (
    organismId
  ) => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (organism) =>
          organism.id !== organismId
      );
    });

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ANTIBIOTIC MANAGEMENT
     ======================================================== */

  const addAntibiotic = (
    organismId
  ) => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) =>
      current.map((organism) =>
        organism.id === organismId
          ? {
              ...organism,
              antibiotics: [
                ...(organism.antibiotics ||
                  []),
                createAntibioticRow(),
              ],
            }
          : organism
      )
    );

    setError("");
    setSuccess("");
  };

  const removeAntibiotic = (
    organismId,
    antibioticId
  ) => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) =>
      current.map((organism) => {
        if (
          organism.id !==
          organismId
        ) {
          return organism;
        }

        const antibiotics =
          organism.antibiotics ||
          [];

        if (
          antibiotics.length ===
          1
        ) {
          return organism;
        }

        return {
          ...organism,
          antibiotics:
            antibiotics.filter(
              (item) =>
                item.id !==
                antibioticId
            ),
        };
      })
    );

    setError("");
    setSuccess("");
  };

  const updateAntibiotic = (
    organismId,
    antibioticId,
    field,
    value
  ) => {
    if (!isEditing) {
      return;
    }

    setOrganisms((current) =>
      current.map((organism) => {
        if (
          organism.id !==
          organismId
        ) {
          return organism;
        }

        return {
          ...organism,

          antibiotics: (
            organism.antibiotics ||
            []
          ).map((item) =>
            item.id ===
            antibioticId
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
          ),
        };
      })
    );

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ORGANISM COUNT
     ======================================================== */

  const selectedOrganisms =
    useMemo(
      () =>
        organisms.filter(
          (item) =>
            String(
              item.organism || ""
            ).trim()
        ),
      [organisms]
    );

  /* ========================================================
     AUTO INTERPRETATION
     ======================================================== */

  const calculatedInterpretation =
    useMemo(() => {
      if (
        form.cultureResult ===
        "No Growth"
      ) {
        return "No bacterial or fungal growth detected under the conditions of incubation.";
      }

      if (
        form.cultureResult ===
        "Contaminated"
      ) {
        return "Growth pattern is suggestive of possible contamination. Clinical correlation and repeat blood culture may be considered where appropriate.";
      }

      if (
        form.cultureResult ===
          "Growth" &&
        selectedOrganisms.length >
          0
      ) {
        return `${
          selectedOrganisms.length
        } organism${
          selectedOrganisms.length ===
          1
            ? ""
            : "s"
        } identified. Review organism identification and antimicrobial susceptibility results before final authorization.`;
      }

      return "";
    }, [
      form.cultureResult,
      selectedOrganisms.length,
    ]);

  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = () => {
    if (!form.specimenType) {
      return "Specimen type is required.";
    }

    if (!form.cultureResult) {
      return "Culture result is required.";
    }

    if (
      form.cultureResult ===
        "Growth" &&
      selectedOrganisms.length ===
        0
    ) {
      return "Add at least one organism for a positive blood culture.";
    }

    return "";
  };

  /* ========================================================
     ENTER EDIT MODE
     ======================================================== */

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setOriginalForm({
      ...form,
    });

    setOriginalOrganisms(
      normalizeOrganisms(
        organisms
      )
    );

    setIsEditing(true);
  };

  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const handleCancelEdit = () => {
    setForm({
      ...originalForm,
    });

    setOrganisms(
      normalizeOrganisms(
        originalOrganisms
      )
    );

    setError("");
    setSuccess(
      "Changes discarded. Original result restored."
    );

    setIsEditing(false);
  };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    /*
     * IMPORTANT:
     * Existing payload structure is preserved.
     */

    const payload = {
      ...form,

      interpretation:
        form.interpretation ||
        calculatedInterpretation,

      organisms:
        organisms.map(
          (organism) => ({
            ...organism,

            antibiotics:
              organism.antibiotics ||
              [],
          })
        ),
    };

    try {
      setSaving(true);

      if (
        typeof onSave ===
        "function"
      ) {
        await onSave(payload);
      }

      /*
       * After successful save, the current
       * form becomes the new original state.
       */

      setOriginalForm({
        ...form,
      });

      setOriginalOrganisms(
        normalizeOrganisms(
          organisms
        )
      );

      setSuccess(
        hasExistingResult
          ? "Blood culture result updated successfully."
          : "Blood culture result saved successfully."
      );

      /*
       * Existing result returns to
       * protected/view mode.
       */
      setIsEditing(false);
    } catch (saveError) {
      console.error(
        "BloodCultureResultEntry save failed:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save blood culture result."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     INPUT CLASS
     ======================================================== */

  const inputClass = isEditing
    ? "bc-input"
    : "bc-input bc-input--readonly";

  const selectClass = isEditing
    ? "bc-select"
    : "bc-select bc-select--readonly";

  const textareaClass =
    isEditing
      ? "bc-textarea"
      : "bc-textarea bc-textarea--readonly";

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      <style>{`
        /* =====================================================
           PEFA LAB
           BLOOD CULTURE RESULT ENTRY
           INLINE STYLES
           ===================================================== */

        .blood-culture-result-entry {
          --bc-primary: #075985;
          --bc-primary-dark: #0c4a6e;
          --bc-primary-soft: #e0f2fe;
          --bc-accent: #0891b2;
          --bc-success: #15803d;
          --bc-success-soft: #dcfce7;
          --bc-danger: #b91c1c;
          --bc-danger-soft: #fee2e2;
          --bc-warning: #b45309;
          --bc-warning-soft: #fef3c7;
          --bc-text: #172033;
          --bc-muted: #64748b;
          --bc-border: #dbe3ec;
          --bc-bg: #f4f7fb;
          --bc-card: #ffffff;

          width: 100%;
          min-height: 100%;
          padding: 28px;
          background:
            linear-gradient(
              180deg,
              #f8fbff 0%,
              var(--bc-bg) 100%
            );
          color: var(--bc-text);
          box-sizing: border-box;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .blood-culture-result-entry *,
        .blood-culture-result-entry *::before,
        .blood-culture-result-entry *::after {
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .bc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
          padding: 24px 26px;
          border: 1px solid #d9e4ef;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f0f9ff 100%
            );
          box-shadow:
            0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .bc-header-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .bc-header-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bc-primary-soft);
          color: var(--bc-primary);
        }

        .bc-eyebrow {
          margin-bottom: 6px;
          color: var(--bc-primary);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .bc-header h1 {
          margin: 0;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 800;
          color: #0f172a;
        }

        .bc-header p {
          margin: 8px 0 0;
          color: var(--bc-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .bc-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        /* =====================================================
           BUTTONS
           ===================================================== */

        .bc-button {
          min-height: 40px;
          padding: 0 15px;
          border-radius: 9px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .bc-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .bc-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .bc-button--primary {
          background: var(--bc-primary);
          color: #ffffff;
          box-shadow:
            0 4px 12px rgba(7, 89, 133, 0.18);
        }

        .bc-button--primary:hover:not(:disabled) {
          background: var(--bc-primary-dark);
          box-shadow:
            0 6px 16px rgba(7, 89, 133, 0.24);
        }

        .bc-button--secondary {
          background: #ffffff;
          color: #334155;
          border-color: #cbd5e1;
        }

        .bc-button--secondary:hover:not(:disabled) {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .bc-button--edit {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fed7aa;
        }

        .bc-button--edit:hover:not(:disabled) {
          background: #ffedd5;
          border-color: #fdba74;
        }

        .bc-button--danger {
          background: #ffffff;
          color: var(--bc-danger);
          border-color: #fecaca;
        }

        .bc-button--danger:hover:not(:disabled) {
          background: var(--bc-danger-soft);
        }

        /* =====================================================
           MODE BAR
           ===================================================== */

        .bc-mode-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 17px;
          margin-bottom: 18px;
          border-radius: 12px;
          border: 1px solid var(--bc-border);
          background: #ffffff;
        }

        .bc-mode-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .bc-mode-status svg {
          color: var(--bc-primary);
        }

        .bc-mode-status--edit svg {
          color: #c2410c;
        }

        .bc-mode-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* =====================================================
           PATIENT CARD
           ===================================================== */

        .bc-patient-card {
          display: grid;
          grid-template-columns:
            1.5fr
            1fr
            1fr
            1.2fr;
          gap: 1px;
          margin-bottom: 18px;
          overflow: hidden;
          border: 1px solid var(--bc-border);
          border-radius: 15px;
          background: var(--bc-border);
          box-shadow:
            0 4px 16px rgba(15, 23, 42, 0.04);
        }

        .bc-patient-item {
          min-width: 0;
          padding: 15px 17px;
          background: #ffffff;
        }

        .bc-patient-item span {
          display: block;
          margin-bottom: 5px;
          color: var(--bc-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .bc-patient-item strong {
          display: block;
          overflow: hidden;
          color: #1e293b;
          font-size: 13px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* =====================================================
           ALERTS
           ===================================================== */

        .bc-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          margin-bottom: 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 650;
        }

        .bc-alert--error {
          color: var(--bc-danger);
          background: var(--bc-danger-soft);
          border: 1px solid #fecaca;
        }

        .bc-alert--success {
          color: var(--bc-success);
          background: var(--bc-success-soft);
          border: 1px solid #bbf7d0;
        }

        /* =====================================================
           CARDS
           ===================================================== */

        .bc-card {
          margin-bottom: 18px;
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          background: var(--bc-card);
          box-shadow:
            0 5px 18px rgba(15, 23, 42, 0.045);
          overflow: hidden;
        }

        .bc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 1px solid #e8edf3;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #fbfdff 100%
            );
        }

        .bc-card-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
        }

        .bc-card-header p {
          margin: 4px 0 0;
          color: var(--bc-muted);
          font-size: 12px;
        }

        .bc-section {
          padding: 20px;
        }

        /* =====================================================
           GRID
           ===================================================== */

        .bc-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .bc-grid--two {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .bc-field {
          min-width: 0;
        }

        .bc-field--wide {
          grid-column: span 2;
        }

        .bc-label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 7px;
          color: #334155;
          font-size: 11px;
          font-weight: 800;
        }

        .bc-required {
          color: var(--bc-danger);
          font-size: 13px;
        }

        /* =====================================================
           INPUTS
           ===================================================== */

        .bc-input,
        .bc-select,
        .bc-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #172033;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .bc-input,
        .bc-select {
          height: 40px;
          padding: 0 11px;
        }

        .bc-textarea {
          min-height: 105px;
          padding: 10px 11px;
          resize: vertical;
          line-height: 1.55;
        }

        .bc-input:focus,
        .bc-select:focus,
        .bc-textarea:focus {
          border-color: #38bdf8;
          box-shadow:
            0 0 0 3px rgba(
              14,
              165,
              233,
              0.12
            );
        }

        .bc-input--readonly,
        .bc-select--readonly,
        .bc-textarea--readonly {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #475569;
          cursor: default;
        }

        .bc-input--readonly:focus,
        .bc-select--readonly:focus,
        .bc-textarea--readonly:focus {
          border-color: #e2e8f0;
          box-shadow: none;
        }

        /* =====================================================
           INTERPRETATION
           ===================================================== */

        .bc-interpretation {
          margin-bottom: 18px;
          padding: 15px 17px;
          border: 1px solid #bae6fd;
          border-left: 4px solid #0284c7;
          border-radius: 10px;
          background: #f0f9ff;
        }

        .bc-interpretation-label {
          margin-bottom: 6px;
          color: var(--bc-primary);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .bc-interpretation p {
          margin: 0;
          color: #334155;
          font-size: 13px;
          line-height: 1.6;
        }

        /* =====================================================
           ORGANISM
           ===================================================== */

        .bc-organism {
          margin-bottom: 18px;
          border: 1px solid #dbe5ef;
          border-radius: 13px;
          overflow: hidden;
          background: #fbfdff;
        }

        .bc-organism:last-child {
          margin-bottom: 0;
        }

        .bc-organism-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 15px;
          border-bottom: 1px solid #e5ebf2;
          background: #f8fafc;
        }

        .bc-organism-title {
          min-width: 0;
        }

        .bc-organism-title span {
          display: block;
          margin-bottom: 3px;
          color: var(--bc-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .bc-organism-title strong {
          display: block;
          overflow: hidden;
          color: #0f172a;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bc-icon-button {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #ffffff;
          color: var(--bc-danger);
          cursor: pointer;
        }

        .bc-icon-button:hover:not(:disabled) {
          background: var(--bc-danger-soft);
        }

        .bc-icon-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* =====================================================
           SUSCEPTIBILITY
           ===================================================== */

        .bc-susceptibility-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 20px;
          margin-bottom: 10px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .bc-susceptibility-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 13px;
          font-weight: 800;
        }

        .bc-susceptibility-header p {
          margin: 4px 0 0;
          color: var(--bc-muted);
          font-size: 11px;
        }

        .bc-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .bc-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
        }

        .bc-table th {
          padding: 10px 12px;
          text-align: left;
          color: #475569;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .bc-table td {
          padding: 9px 10px;
          border-bottom: 1px solid #edf1f5;
          vertical-align: middle;
        }

        .bc-table tr:last-child td {
          border-bottom: 0;
        }

        .bc-table .bc-select {
          min-width: 150px;
        }

        /* =====================================================
           BADGES
           ===================================================== */

        .bc-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 90px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 850;
        }

        .bc-badge--empty {
          color: #94a3b8;
          background: #f1f5f9;
        }

        .bc-badge--sensitive {
          color: #166534;
          background: #dcfce7;
        }

        .bc-badge--intermediate {
          color: #92400e;
          background: #fef3c7;
        }

        .bc-badge--resistant {
          color: #991b1b;
          background: #fee2e2;
        }

        /* =====================================================
           FOOTER
           ===================================================== */

        .bc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          margin-top: 4px;
          border: 1px solid var(--bc-border);
          border-radius: 15px;
          background: #ffffff;
          box-shadow:
            0 5px 18px rgba(15, 23, 42, 0.045);
        }

        .bc-footer-status span {
          display: block;
          margin-bottom: 4px;
          color: var(--bc-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .bc-footer-status strong {
          color: #0f172a;
          font-size: 14px;
        }

        .bc-footer-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        /* =====================================================
           READ-ONLY MODE
           ===================================================== */

        .bc-readonly-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1100px) {
          .bc-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .bc-patient-card {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .blood-culture-result-entry {
            padding: 14px;
          }

          .bc-header {
            flex-direction: column;
            padding: 18px;
          }

          .bc-header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .bc-mode-bar {
            align-items: flex-start;
            flex-direction: column;
          }

          .bc-grid,
          .bc-grid--two {
            grid-template-columns: 1fr;
          }

          .bc-field--wide {
            grid-column: span 1;
          }

          .bc-patient-card {
            grid-template-columns: 1fr;
          }

          .bc-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .bc-susceptibility-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .bc-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .bc-footer-actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .bc-header h1 {
            font-size: 21px;
          }

          .bc-header-main {
            gap: 11px;
          }

          .bc-header-icon {
            width: 42px;
            height: 42px;
            min-width: 42px;
          }

          .bc-button {
            width: 100%;
          }

          .bc-header-actions,
          .bc-mode-actions,
          .bc-footer-actions {
            width: 100%;
          }
        }
      `}</style>

      <div className="blood-culture-result-entry">

        {/* ====================================================
            HEADER
           ==================================================== */}

        <header className="bc-header">

          <div className="bc-header-main">

            <div className="bc-header-icon">
              <FlaskConical size={23} />
            </div>

            <div>
              <div className="bc-eyebrow">
                PEFA LABORATORY · MICROBIOLOGY
              </div>

              <h1>
                Blood Culture Result Entry
              </h1>

              <p>
                Structured blood culture,
                organism identification and
                antimicrobial susceptibility
                entry.
              </p>
            </div>

          </div>

          <div className="bc-header-actions">

            {hasExistingResult &&
              !isEditing && (
                <button
                  type="button"
                  className="bc-button bc-button--edit"
                  onClick={handleEdit}
                  disabled={saving}
                >
                  <Edit3 size={16} />
                  Edit Result
                </button>
              )}

            {hasExistingResult &&
              isEditing && (
                <button
                  type="button"
                  className="bc-button bc-button--secondary"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}

            {onCancel && (
              <button
                type="button"
                className="bc-button bc-button--secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}

            {isEditing && (
              <button
                type="button"
                className="bc-button bc-button--primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : hasExistingResult
                    ? "Save Changes"
                    : "Save Result"}
              </button>
            )}

          </div>
        </header>

        {/* ====================================================
            MODE BAR
           ==================================================== */}

        <div className="bc-mode-bar">

          <div
            className={
              isEditing
                ? "bc-mode-status bc-mode-status--edit"
                : "bc-mode-status"
            }
          >
            {isEditing ? (
              <>
                <Edit3 size={17} />
                <span>
                  Editing result
                </span>
              </>
            ) : (
              <>
                <Lock size={17} />
                <span>
                  Result is protected in
                  view mode
                </span>
              </>
            )}
          </div>

          {!isEditing && (
            <span className="bc-readonly-note">
              <Lock size={13} />
              Click "Edit Result" to
              modify this report.
            </span>
          )}

          {isEditing &&
            hasExistingResult && (
              <div className="bc-mode-actions">
                <button
                  type="button"
                  className="bc-button bc-button--secondary"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                >
                  <X size={15} />
                  Cancel Edit
                </button>
              </div>
            )}

        </div>

        {/* ====================================================
            PATIENT INFORMATION
           ==================================================== */}

        <section className="bc-patient-card">

          <div className="bc-patient-item">
            <span>
              Patient Name
            </span>
            <strong>
              {patientName}
            </strong>
          </div>

          <div className="bc-patient-item">
            <span>
              Patient ID
            </span>
            <strong>
              {patientId}
            </strong>
          </div>

          <div className="bc-patient-item">
            <span>
              Lab Number
            </span>
            <strong>
              {labNumber}
            </strong>
          </div>

          <div className="bc-patient-item">
            <span>
              Registration Number
            </span>
            <strong>
              {registrationNumber}
            </strong>
          </div>

        </section>

        {/* ====================================================
            MESSAGES
           ==================================================== */}

        {error && (
          <div className="bc-alert bc-alert--error">
            <AlertCircle size={18} />
            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="bc-alert bc-alert--success">
            <CheckCircle2 size={18} />
            <span>
              {success}
            </span>
          </div>
        )}

        {/* ====================================================
            SPECIMEN INFORMATION
           ==================================================== */}

        <section className="bc-card">

          <div className="bc-card-header">
            <div>
              <h2>
                Specimen Information
              </h2>

              <p>
                Collection and receipt
                details.
              </p>
            </div>
          </div>

          <div className="bc-section">

            <div className="bc-grid">

              <Field
                label="Specimen Type"
                required
              >
                <input
                  className={inputClass}
                  value={
                    form.specimenType
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "specimenType",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Bottle Type">
                <select
                  className={selectClass}
                  value={
                    form.bottleType
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "bottleType",
                      event.target.value
                    )
                  }
                >
                  {BOTTLE_OPTIONS.map(
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
              </Field>

              <Field label="Collection Date">
                <input
                  className={inputClass}
                  type="date"
                  value={
                    form.collectionDate
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "collectionDate",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Collection Time">
                <input
                  className={inputClass}
                  type="time"
                  value={
                    form.collectionTime
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "collectionTime",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Received Date">
                <input
                  className={inputClass}
                  type="date"
                  value={
                    form.receivedDate
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "receivedDate",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Received Time">
                <input
                  className={inputClass}
                  type="time"
                  value={
                    form.receivedTime
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "receivedTime",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Incubation Start">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={
                    form.incubationStart
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "incubationStart",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Gram Stain">
                <select
                  className={selectClass}
                  value={
                    form.gramStain
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "gramStain",
                      event.target.value
                    )
                  }
                >
                  {GRAM_STAIN_OPTIONS.map(
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
              </Field>

            </div>

          </div>
        </section>

        {/* ====================================================
            CULTURE RESULT
           ==================================================== */}

        <section className="bc-card">

          <div className="bc-card-header">
            <div>
              <h2>
                Culture Result
              </h2>

              <p>
                Record the current or
                final culture status.
              </p>
            </div>
          </div>

          <div className="bc-section">

            <div className="bc-grid">

              <Field
                label="Culture Result"
                required
              >
                <select
                  className={selectClass}
                  value={
                    form.cultureResult
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "cultureResult",
                      event.target.value
                    )
                  }
                >
                  {CULTURE_OPTIONS.map(
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
              </Field>

              <Field label="Final Report">
                <select
                  className={selectClass}
                  value={
                    form.finalReport
                  }
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField(
                      "finalReport",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Preliminary">
                    Preliminary
                  </option>

                  <option value="Final">
                    Final
                  </option>
                </select>
              </Field>

            </div>

          </div>
        </section>

        {/* ====================================================
            ORGANISM IDENTIFICATION
           ==================================================== */}

        <section className="bc-card">

          <div className="bc-card-header">

            <div>
              <h2>
                Organism Identification
              </h2>

              <p>
                Add identified organisms
                and identification
                details.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                className="bc-button bc-button--secondary"
                onClick={
                  addOrganism
                }
              >
                <Plus size={15} />
                Add Organism
              </button>
            )}

          </div>

          <div className="bc-section">

            {organisms.map(
              (organism, index) => (
                <div
                  className="bc-organism"
                  key={
                    organism.id
                  }
                >

                  <div className="bc-organism-header">

                    <div className="bc-organism-title">

                      <span>
                        Organism{" "}
                        {index + 1}
                      </span>

                      <strong>
                        {organism.organism ||
                          "Unspecified Organism"}
                      </strong>

                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        className="bc-icon-button"
                        onClick={() =>
                          removeOrganism(
                            organism.id
                          )
                        }
                        disabled={
                          organisms.length ===
                          1
                        }
                        title="Remove organism"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    )}

                  </div>

                  <div className="bc-section">

                    <div className="bc-grid">

                      <Field label="Organism">
                        <select
                          className={
                            selectClass
                          }
                          value={
                            organism.organism
                          }
                          disabled={
                            !isEditing
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrganism(
                              organism.id,
                              "organism",
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select organism
                          </option>

                          {ORGANISM_OPTIONS.map(
                            (option) => (
                              <option
                                key={
                                  option
                                }
                                value={
                                  option
                                }
                              >
                                {
                                  option
                                }
                              </option>
                            )
                          )}
                        </select>
                      </Field>

                      <Field label="Identification">
                        <input
                          className={
                            inputClass
                          }
                          value={
                            organism.identification
                          }
                          disabled={
                            !isEditing
                          }
                          placeholder="Biochemical / automated identification"
                          onChange={(
                            event
                          ) =>
                            updateOrganism(
                              organism.id,
                              "identification",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </Field>

                      <Field
                        label="Organism Comment"
                        wide
                      >
                        <input
                          className={
                            inputClass
                          }
                          value={
                            organism.comment
                          }
                          disabled={
                            !isEditing
                          }
                          placeholder="Additional identification comment"
                          onChange={(
                            event
                          ) =>
                            updateOrganism(
                              organism.id,
                              "comment",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </Field>

                    </div>

                    {/* ============================================
                        SUSCEPTIBILITY
                       ============================================ */}

                    <div className="bc-susceptibility-header">

                      <div>
                        <h3>
                          Antimicrobial
                          Susceptibility
                        </h3>

                        <p>
                          S = Sensitive ·
                          I = Intermediate ·
                          R = Resistant
                        </p>
                      </div>

                      {isEditing && (
                        <button
                          type="button"
                          className="bc-button bc-button--secondary"
                          onClick={() =>
                            addAntibiotic(
                              organism.id
                            )
                          }
                        >
                          <Plus size={14} />
                          Add Antibiotic
                        </button>
                      )}

                    </div>

                    <div className="bc-table-wrapper">

                      <table className="bc-table">

                        <thead>
                          <tr>
                            <th>
                              Antibiotic
                            </th>

                            <th>
                              Result
                            </th>

                            <th>
                              Interpretation
                            </th>

                            {isEditing && (
                              <th>
                                Action
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody>

                          {(
                            organism.antibiotics ||
                            []
                          ).map(
                            (
                              antibiotic
                            ) => (
                              <tr
                                key={
                                  antibiotic.id
                                }
                              >

                                <td>
                                  <select
                                    className={
                                      selectClass
                                    }
                                    value={
                                      antibiotic.antibiotic
                                    }
                                    disabled={
                                      !isEditing
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateAntibiotic(
                                        organism.id,
                                        antibiotic.id,
                                        "antibiotic",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    <option value="">
                                      Select antibiotic
                                    </option>

                                    {COMMON_ANTIBIOTICS.map(
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
                                          {
                                            option
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>

                                <td>
                                  <select
                                    className={
                                      selectClass
                                    }
                                    value={
                                      antibiotic.result
                                    }
                                    disabled={
                                      !isEditing
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateAntibiotic(
                                        organism.id,
                                        antibiotic.id,
                                        "result",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    {SUSCEPTIBILITY_OPTIONS.map(
                                      (
                                        option
                                      ) => (
                                        <option
                                          key={
                                            option ||
                                            "empty"
                                          }
                                          value={
                                            option
                                          }
                                        >
                                          {option ||
                                            "Select"}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>

                                <td>
                                  <SusceptibilityBadge
                                    value={
                                      antibiotic.result
                                    }
                                  />
                                </td>

                                {isEditing && (
                                  <td>
                                    <button
                                      type="button"
                                      className="bc-icon-button"
                                      onClick={() =>
                                        removeAntibiotic(
                                          organism.id,
                                          antibiotic.id
                                        )
                                      }
                                      disabled={
                                        (
                                          organism.antibiotics ||
                                          []
                                        ).length ===
                                        1
                                      }
                                      title="Remove antibiotic"
                                    >
                                      <Trash2
                                        size={15}
                                      />
                                    </button>
                                  </td>
                                )}

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>
                </div>
              )
            )}

          </div>
        </section>

        {/* ====================================================
            INTERPRETATION & COMMENTS
           ==================================================== */}

        <section className="bc-card">

          <div className="bc-card-header">

            <div>
              <h2>
                Interpretation & Comments
              </h2>

              <p>
                Review the automatically
                prepared interpretation
                before authorization.
              </p>
            </div>

          </div>

          <div className="bc-section">

            {calculatedInterpretation && (
              <div className="bc-interpretation">

                <div className="bc-interpretation-label">
                  Suggested Interpretation
                </div>

                <p>
                  {
                    calculatedInterpretation
                  }
                </p>

              </div>
            )}

            <div className="bc-grid bc-grid--two">

              <Field label="Final Interpretation">

                <textarea
                  className={
                    textareaClass
                  }
                  value={
                    form.interpretation
                  }
                  disabled={
                    !isEditing
                  }
                  placeholder={
                    calculatedInterpretation ||
                    "Enter final interpretation"
                  }
                  onChange={(event) =>
                    updateField(
                      "interpretation",
                      event.target.value
                    )
                  }
                />

              </Field>

              <Field label="Laboratory Comments">

                <textarea
                  className={
                    textareaClass
                  }
                  value={
                    form.comments
                  }
                  disabled={
                    !isEditing
                  }
                  placeholder="Enter laboratory comments"
                  onChange={(event) =>
                    updateField(
                      "comments",
                      event.target.value
                    )
                  }
                />

              </Field>

            </div>

          </div>
        </section>

        {/* ====================================================
            FOOTER
           ==================================================== */}

        <footer className="bc-footer">

          <div className="bc-footer-status">

            <span>
              Blood Culture Result
            </span>

            <strong>
              {form.cultureResult}
            </strong>

          </div>

          <div className="bc-footer-actions">

            {hasExistingResult &&
              !isEditing && (
                <button
                  type="button"
                  className="bc-button bc-button--edit"
                  onClick={
                    handleEdit
                  }
                  disabled={saving}
                >
                  <Edit3 size={16} />
                  Edit Result
                </button>
              )}

            {hasExistingResult &&
              isEditing && (
                <button
                  type="button"
                  className="bc-button bc-button--secondary"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}

            {isEditing && (
              <button
                type="button"
                className="bc-button bc-button--primary"
                onClick={
                  handleSave
                }
                disabled={saving}
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : hasExistingResult
                    ? "Save Changes"
                    : "Save Blood Culture Result"}
              </button>
            )}

          </div>

        </footer>

      </div>
    </>
  );
}

/* ==========================================================
   FIELD
   ========================================================== */

function Field({
  label,
  required = false,
  wide = false,
  children,
}) {
  return (
    <div
      className={
        wide
          ? "bc-field bc-field--wide"
          : "bc-field"
      }
    >
      <label className="bc-label">

        {label}

        {required && (
          <span className="bc-required">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/* ==========================================================
   SUSCEPTIBILITY BADGE
   ========================================================== */

function SusceptibilityBadge({
  value,
}) {
  if (!value) {
    return (
      <span className="bc-badge bc-badge--empty">
        —
      </span>
    );
  }

  const className =
    value === "S"
      ? "bc-badge bc-badge--sensitive"
      : value === "I"
        ? "bc-badge bc-badge--intermediate"
        : "bc-badge bc-badge--resistant";

  const label =
    value === "S"
      ? "Sensitive"
      : value === "I"
        ? "Intermediate"
        : "Resistant";

  return (
    <span className={className}>
      {label}
    </span>
  );
}