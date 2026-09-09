
/* ==========================================================
   PEFA LAB
   MCS RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/MCSResultEntry.jsx

   PURPOSE:
   - Premium / standardized Microbiology MCS result-entry form
   - Supports CREATE, EDIT and VIEW-ONLY modes
   - Parent-controlled persistence
   - Structured result entry
   - Safe editing with Cancel Edit
   - Self-contained styling
   - No external CSS dependency
   - Does NOT save directly to Supabase
   - Does NOT depend on legacy Dashboard / ResultEntry services

   MODES:
   ----------------------------------------------------------
   mode="create"
      New result entry.

   mode="edit"
      Existing result can be modified.
      Shows EDIT MODE.
      Cancel restores the original value.

   readOnly={true}
      View-only mode.
      All controls are disabled.

   IMPORTANT:
   ----------------------------------------------------------
   The parent component remains responsible for persistence.

   onChange(updatedResult)
      Receives the current result state.

   onEditSave(updatedResult)
      Optional callback when the user clicks Save Changes.

   onCancelEdit()
      Optional callback when the user cancels editing.

   ========================================================== */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlaskConical,
  Microscope,
  Plus,
  Trash2,
  ChevronRight,
  Pencil,
  Save,
  X,
  RotateCcw,
} from "lucide-react";

/* ==========================================================
   OPTIONS
   ========================================================== */

const SPECIMEN_OPTIONS = [
  "Urine",
  "Stool",
  "Semen",
  "Wound Swab",
  "High Vaginal Swab",
  "Endocervical Swab",
  "Urethral Swab",
  "Sputum",
  "Ear Swab",
  "Throat Swab",
  "Blood",
  "Other",
];

const APPEARANCE_OPTIONS = [
  "Clear",
  "Slightly Cloudy",
  "Cloudy",
  "Turbid",
  "Mucoid",
  "Bloody",
  "Other",
];

const COLOUR_OPTIONS = [
  "Pale Yellow",
  "Yellow",
  "Dark Yellow",
  "Amber",
  "Brown",
  "Red",
  "Green",
  "Colourless",
  "Other",
];

const CONSISTENCY_OPTIONS = [
  "Liquid",
  "Semi-solid",
  "Solid",
  "Mucoid",
  "Watery",
  "Other",
];

const ODOUR_OPTIONS = [
  "Normal",
  "Offensive",
  "Foul",
  "Other",
];

const MICROSCOPY_OPTIONS = [
  "Not Seen",
  "Few",
  "Occasional",
  "Moderate",
  "Many",
  "Numerous",
  "Plenty",
];

const PUS_CELL_OPTIONS = [
  "Nil",
  "0–2 /HPF",
  "3–5 /HPF",
  "6–10 /HPF",
  "11–20 /HPF",
  ">20 /HPF",
  "Numerous",
];

const RBC_OPTIONS = [
  "Nil",
  "0–2 /HPF",
  "3–5 /HPF",
  "6–10 /HPF",
  "11–20 /HPF",
  ">20 /HPF",
  "Numerous",
];

const EPITHELIAL_OPTIONS = [
  "Nil",
  "+",
  "++",
  "+++",
  "Numerous",
];

const YEAST_CELL_OPTIONS = [
  "Nil",
  "+",
  "++",
  "+++",
  "Numerous",
];

const CRYSTAL_OPTIONS = [
  "Nil",
  "+",
  "++",
  "+++",
  "Numerous",
];

const CAST_OPTIONS = [
  "Not Seen",
  "Few",
  "Moderate",
  "Many",
  "Hyaline",
  "Granular",
  "Other",
];

const PARASITE_OPTIONS = [
  "Not Seen",
  "Seen",
  "Other",
];

const CULTURE_OPTIONS = [
  "No Growth",
  "Scanty Growth",
  "Moderate Growth",
  "Heavy Growth",
  "Significant Growth",
];

const ORGANISM_OPTIONS = [
  "Not Isolated",
  "Escherichia coli",
  "Klebsiella species",
  "Proteus species",
  "Pseudomonas species",
  "Staphylococcus aureus",
  "Coagulase-negative Staphylococci",
  "Streptococcus species",
  "Enterococcus species",
  "Candida species",
  "Other",
];

const GRAM_STAIN_OPTIONS = [
  "Not Done",
  "No Organism Seen",
  "Gram Positive Cocci",
  "Gram Positive Bacilli",
  "Gram Negative Cocci",
  "Gram Negative Bacilli",
  "Mixed Organisms",
  "Other",
];

const GRAM_REACTION_OPTIONS = [
  "Gram Positive",
  "Gram Negative",
  "Mixed",
  "Not Applicable",
  "Not Done",
];

const YES_NO_OPTIONS = [
  "Not Done",
  "Negative",
  "Positive",
];

const SENSITIVITY_OPTIONS = [
  "Sensitive",
  "Intermediate",
  "Resistant",
];

const ANTIBIOTIC_OPTIONS = [
  "Amoxicillin",
  "Amoxicillin/Clavulanate",
  "Ampicillin",
  "Cefuroxime",
  "Ceftriaxone",
  "Ceftazidime",
  "Cefixime",
  "Ciprofloxacin",
  "Levofloxacin",
  "Ofloxacin",
  "Gentamicin",
  "Amikacin",
  "Meropenem",
  "Imipenem",
  "Nitrofurantoin",
  "Trimethoprim/Sulfamethoxazole",
  "Tetracycline",
  "Doxycycline",
  "Erythromycin",
  "Azithromycin",
  "Clindamycin",
  "Vancomycin",
  "Linezolid",
  "Metronidazole",
  "Other",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

const createAntibiotic = () => ({
  id: createId(),
  antibiotic: "",
  sensitivity: "",
});

/* ==========================================================
   EMPTY FORM
   ========================================================== */

const EMPTY_FORM = {
  specimen: "",

  /* Macroscopy */
  appearance: "",
  colour: "",
  consistency: "",
  odour: "",

  /* Microscopy */
  gram_stain: "",
  pus_cells: "",
  rbc: "",
  epithelial_cells: "",
  yeast_cells: "",
  bacteria: "",
  crystals: "",
  casts: "",
  parasites: "",

  /* Culture */
  culture_result: "",
  organism: "",
  organism_2: "",
  colony_count: "",
  gram_reaction: "",
  organism_comment: "",

  /* Additional findings */
  motility: "",
  special_test: "",

  /* AST */
  sensitivity: [],

  /* Report */
  interpretation: "",
  comments: "",
};

/* ==========================================================
   FORM NORMALIZER
   ========================================================== */

const normalizeForm = (source) => {
  const input =
    source &&
    typeof source === "object"
      ? source
      : {};

  const sensitivity = Array.isArray(
    input.sensitivity
  )
    ? input.sensitivity.map((item) => ({
        ...createAntibiotic(),
        ...(item || {}),
        id:
          item?.id ||
          createId(),
      }))
    : [];

  return {
    ...EMPTY_FORM,
    ...input,
    sensitivity,
  };
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function MCSResultEntry({
  value = null,
  onChange,

  disabled = false,
  readOnly = false,

  /*
   * create = new result
   * edit   = edit existing result
   */
  mode = "create",

  /*
   * Optional callbacks controlled by parent.
   */
  onEditSave,
  onCancelEdit,
}) {
  const isEditMode = mode === "edit";
  const isReadOnly = readOnly === true;
  const isDisabled =
    disabled || isReadOnly;

  /* ========================================================
     INTERNAL FORM
     ======================================================== */

  const [internalForm, setInternalForm] =
    useState(() =>
      normalizeForm(value)
    );

  /*
   * Original snapshot used by Cancel Edit.
   */
  const [originalForm, setOriginalForm] =
    useState(() =>
      normalizeForm(value)
    );

  /*
   * Tracks whether the user has changed
   * anything during editing.
   */
  const [isDirty, setIsDirty] =
    useState(false);

  /* ========================================================
     FORM SOURCE
     ======================================================== */

  const form = useMemo(() => {
    /*
     * In parent-controlled mode, value is authoritative.
     */
    if (
      value &&
      typeof value === "object"
    ) {
      return normalizeForm(value);
    }

    return internalForm;
  }, [value, internalForm]);

  /* ========================================================
     SYNC EXISTING VALUE
     ======================================================== */

  useEffect(() => {
    /*
     * When parent loads another result,
     * reset the internal edit snapshot.
     */
    const normalized =
      normalizeForm(value);

    setInternalForm(normalized);
    setOriginalForm(normalized);
    setIsDirty(false);
  }, [value]);

  /* ========================================================
     * UPDATE FORM
     * ======================================================== */

  const updateForm = useCallback(
    (field, fieldValue) => {
      if (isDisabled) {
        return;
      }

      const next = {
        ...form,
        [field]: fieldValue,
      };

      /*
       * Keep local state when the parent does
       * not provide a controlled value.
       */
      if (!value) {
        setInternalForm(next);
      }

      setIsDirty(true);

      onChange?.(next);
    },
    [
      form,
      isDisabled,
      onChange,
      value,
    ]
  );

  /* ========================================================
     ANTIBIOTIC UPDATE
     ======================================================== */

  const updateAntibiotic = useCallback(
    (
      antibioticId,
      field,
      fieldValue
    ) => {
      if (isDisabled) {
        return;
      }

      const nextSensitivity = (
        form.sensitivity || []
      ).map((item) =>
        item.id === antibioticId
          ? {
              ...item,
              [field]: fieldValue,
            }
          : item
      );

      updateForm(
        "sensitivity",
        nextSensitivity
      );
    },
    [
      form.sensitivity,
      isDisabled,
      updateForm,
    ]
  );

  /* ========================================================
     ADD ANTIBIOTIC
     ======================================================== */

  const addAntibiotic = useCallback(() => {
    if (isDisabled) {
      return;
    }

    updateForm("sensitivity", [
      ...(form.sensitivity || []),
      createAntibiotic(),
    ]);
  }, [
    form.sensitivity,
    isDisabled,
    updateForm,
  ]);

  /* ========================================================
     REMOVE ANTIBIOTIC
     ======================================================== */

  const removeAntibiotic = useCallback(
    (id) => {
      if (isDisabled) {
        return;
      }

      updateForm(
        "sensitivity",
        (form.sensitivity || []).filter(
          (item) =>
            item.id !== id
        )
      );
    },
    [
      form.sensitivity,
      isDisabled,
      updateForm,
    ]
  );

  /* ========================================================
     SAVE EDIT
     ======================================================== */

  const handleSaveEdit = useCallback(() => {
    if (!isEditMode || isReadOnly) {
      return;
    }

    const normalized =
      normalizeForm(form);

    /*
     * Notify parent first.
     */
    onChange?.(normalized);

    /*
     * Optional explicit save callback.
     */
    onEditSave?.(normalized);

    /*
     * Current state becomes the new
     * edit baseline.
     */
    setOriginalForm(normalized);
    setInternalForm(normalized);
    setIsDirty(false);
  }, [
    form,
    isEditMode,
    isReadOnly,
    onChange,
    onEditSave,
  ]);

  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const handleCancelEdit = useCallback(() => {
    if (!isEditMode || isReadOnly) {
      return;
    }

    const restored =
      normalizeForm(originalForm);

    setInternalForm(restored);
    setOriginalForm(restored);
    setIsDirty(false);

    /*
     * Tell parent to restore its
     * controlled value.
     */
    onChange?.(restored);

    onCancelEdit?.(restored);
  }, [
    isEditMode,
    isReadOnly,
    onChange,
    onCancelEdit,
    originalForm,
  ]);

  /* ========================================================
     MODE INFORMATION
     ======================================================== */

  const modeLabel = isReadOnly
    ? "View Only"
    : isEditMode
      ? "Edit Mode"
      : "New Result";

  const modeClass = isReadOnly
    ? "pefa-mcs__badge pefa-mcs__badge--readonly"
    : isEditMode
      ? "pefa-mcs__badge pefa-mcs__badge--edit"
      : "pefa-mcs__badge";

  /* ========================================================
     FIELD COMPONENTS
     ======================================================== */

  const SelectField = ({
    label,
    field,
    options,
    placeholder = "Select",
    required = false,
  }) => {
    const inputId =
      `mcs-${field}`;

    return (
      <div className="pefa-mcs__field">
        <label htmlFor={inputId}>
          <span>{label}</span>

          {required && (
            <span className="pefa-mcs__required">
              *
            </span>
          )}
        </label>

        <select
          id={inputId}
          value={form[field] || ""}
          disabled={isDisabled}
          autoComplete="off"
          onChange={(event) =>
            updateForm(
              field,
              event.target.value
            )
          }
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const TextField = ({
    label,
    field,
    placeholder = "",
  }) => {
    const inputId =
      `mcs-${field}`;

    return (
      <div className="pefa-mcs__field">
        <label htmlFor={inputId}>
          {label}
        </label>

        <input
          id={inputId}
          type="text"
          value={form[field] || ""}
          disabled={isDisabled}
          autoComplete="off"
          placeholder={placeholder}
          onChange={(event) =>
            updateForm(
              field,
              event.target.value
            )
          }
        />
      </div>
    );
  };

  const TextAreaField = ({
    label,
    field,
    placeholder = "",
    rows = 4,
  }) => {
    const inputId =
      `mcs-${field}`;

    return (
      <div className="pefa-mcs__field pefa-mcs__field--full">
        <label htmlFor={inputId}>
          {label}
        </label>

        <textarea
          id={inputId}
          value={form[field] || ""}
          disabled={isDisabled}
          autoComplete="off"
          placeholder={placeholder}
          rows={rows}
          onChange={(event) =>
            updateForm(
              field,
              event.target.value
            )
          }
        />
      </div>
    );
  };

  /* ========================================================
     SECTION HEADER
     ======================================================== */

  const SectionHeader = ({
    icon,
    title,
    description,
    number,
  }) => (
    <div className="pefa-mcs__section-header">

      <div className="pefa-mcs__section-number">
        {number}
      </div>

      <div className="pefa-mcs__section-icon">
        {icon}
      </div>

      <div className="pefa-mcs__section-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <ChevronRight
        size={18}
        className="pefa-mcs__section-chevron"
      />
    </div>
  );

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      <style>{`

        /* =====================================================
           PEFA LAB — STANDARD FORM SYSTEM
           MCS RESULT ENTRY
           ===================================================== */

        .pefa-mcs {
          --pefa-primary: #0f766e;
          --pefa-primary-dark: #115e59;
          --pefa-primary-soft: #ecfdf5;
          --pefa-primary-border: #a7f3d0;

          --pefa-text: #172033;
          --pefa-muted: #64748b;
          --pefa-label: #334155;

          --pefa-border: #dbe3ea;
          --pefa-border-light: #e8edf2;

          --pefa-surface: #ffffff;
          --pefa-surface-soft: #f8fafc;
          --pefa-background: #f4f7f9;

          --pefa-danger: #dc2626;
          --pefa-danger-soft: #fef2f2;

          --pefa-blue: #2563eb;
          --pefa-blue-soft: #eff6ff;
          --pefa-blue-border: #bfdbfe;

          --pefa-radius: 12px;
          --pefa-radius-sm: 8px;

          width: 100%;
          box-sizing: border-box;

          color: var(--pefa-text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .pefa-mcs *,
        .pefa-mcs *::before,
        .pefa-mcs *::after {
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .pefa-mcs__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;

          padding: 20px 22px;
          margin-bottom: 18px;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fafc 100%
            );

          border: 1px solid var(--pefa-border);
          border-radius: var(--pefa-radius);

          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 8px 24px rgba(15, 23, 42, 0.05);
        }

        .pefa-mcs__header-main {
          display: flex;
          align-items: center;
          gap: 14px;

          min-width: 0;
          flex: 1;
        }

        .pefa-mcs__header-icon {
          width: 46px;
          height: 46px;

          flex: 0 0 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: var(--pefa-primary);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 11px;
        }

        .pefa-mcs__eyebrow {
          margin-bottom: 3px;

          color:
            var(--pefa-primary);

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .pefa-mcs__title {
          margin: 0;

          color:
            var(--pefa-text);

          font-size: 21px;
          line-height: 1.25;
          font-weight: 750;

          letter-spacing: -0.015em;
        }

        .pefa-mcs__subtitle {
          margin: 4px 0 0;

          color:
            var(--pefa-muted);

          font-size: 12px;
          line-height: 1.45;
        }

        /* =====================================================
           MODE BADGE
           ===================================================== */

        .pefa-mcs__badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          flex: 0 0 auto;

          min-height: 34px;

          padding: 7px 11px;

          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 999px;

          font-size: 11px;
          font-weight: 750;

          white-space: nowrap;
        }

        .pefa-mcs__badge--edit {
          color:
            var(--pefa-blue);

          background:
            var(--pefa-blue-soft);

          border-color:
            var(--pefa-blue-border);
        }

        .pefa-mcs__badge--readonly {
          color: #475569;

          background: #f1f5f9;

          border-color: #cbd5e1;
        }

        /* =====================================================
           EDIT TOOLBAR
           ===================================================== */

        .pefa-mcs__edit-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          margin-bottom: 16px;
          padding: 12px 14px;

          background:
            linear-gradient(
              135deg,
              #eff6ff 0%,
              #f8fafc 100%
            );

          border:
            1px solid
            #dbeafe;

          border-radius:
            var(--pefa-radius);

          box-shadow:
            0 1px 2px
            rgba(15, 23, 42, 0.03);
        }

        .pefa-mcs__edit-status {
          display: flex;
          align-items: center;
          gap: 9px;

          min-width: 0;
        }

        .pefa-mcs__edit-status-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 32px;
          height: 32px;

          flex: 0 0 32px;

          color:
            var(--pefa-blue);

          background:
            #ffffff;

          border:
            1px solid
            var(--pefa-blue-border);

          border-radius: 8px;
        }

        .pefa-mcs__edit-status-text {
          min-width: 0;
        }

        .pefa-mcs__edit-status-title {
          margin: 0;

          color:
            #1e3a8a;

          font-size: 11px;
          font-weight: 800;
        }

        .pefa-mcs__edit-status-description {
          margin: 2px 0 0;

          color:
            #64748b;

          font-size: 10px;
        }

        .pefa-mcs__edit-actions {
          display: flex;
          align-items: center;
          gap: 8px;

          flex: 0 0 auto;
        }

        .pefa-mcs__action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          min-height: 35px;

          padding: 0 12px;

          border-radius: 8px;

          font-family: inherit;
          font-size: 11px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .pefa-mcs__action:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .pefa-mcs__action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pefa-mcs__action--save {
          color: #ffffff;

          background:
            var(--pefa-primary);

          border:
            1px solid
            var(--pefa-primary);
        }

        .pefa-mcs__action--save:hover:not(:disabled) {
          background:
            var(--pefa-primary-dark);

          border-color:
            var(--pefa-primary-dark);

          box-shadow:
            0 4px 12px
            rgba(15, 118, 110, 0.18);
        }

        .pefa-mcs__action--cancel {
          color: #475569;

          background: #ffffff;

          border:
            1px solid #cbd5e1;
        }

        .pefa-mcs__action--cancel:hover:not(:disabled) {
          background: #f8fafc;

          border-color:
            #94a3b8;
        }

        /* =====================================================
           SECTIONS
           ===================================================== */

        .pefa-mcs__section {
          margin-bottom: 16px;

          overflow: hidden;

          background:
            var(--pefa-surface);

          border:
            1px solid
            var(--pefa-border);

          border-radius:
            var(--pefa-radius);

          box-shadow:
            0 1px 2px
            rgba(15, 23, 42, 0.03),

            0 5px 18px
            rgba(15, 23, 42, 0.035);
        }

        .pefa-mcs__section-header {
          display: flex;
          align-items: center;
          gap: 11px;

          min-height: 66px;

          padding:
            13px 17px;

          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #fafcfd 100%
            );

          border-bottom:
            1px solid
            var(--pefa-border-light);
        }

        .pefa-mcs__section-number {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 26px;
          height: 26px;

          flex: 0 0 26px;

          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 7px;

          font-size: 11px;
          font-weight: 800;
        }

        .pefa-mcs__section-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          color:
            var(--pefa-primary);

          background:
            #f0fdfa;

          border-radius: 8px;
        }

        .pefa-mcs__section-heading {
          min-width: 0;
          flex: 1;
        }

        .pefa-mcs__section-heading h3 {
          margin: 0;

          color:
            var(--pefa-text);

          font-size: 14px;
          line-height: 1.3;
          font-weight: 750;
        }

        .pefa-mcs__section-heading p {
          margin: 3px 0 0;

          color:
            var(--pefa-muted);

          font-size: 11px;
          line-height: 1.4;
        }

        .pefa-mcs__section-chevron {
          color:
            #94a3b8;

          flex: 0 0 auto;
        }

        /* =====================================================
           FORM BODY
           ===================================================== */

        .pefa-mcs__grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 14px;

          padding: 17px;
        }

        .pefa-mcs__grid--single {
          grid-template-columns: 1fr;
        }

        .pefa-mcs__field {
          min-width: 0;
        }

        .pefa-mcs__field--full {
          grid-column: 1 / -1;
        }

        .pefa-mcs__field label {
          display: flex;
          align-items: center;
          gap: 3px;

          margin:
            0 0 6px;

          color:
            var(--pefa-label);

          font-size: 11px;
          line-height: 1.35;
          font-weight: 700;
        }

        .pefa-mcs__required {
          color:
            var(--pefa-danger);

          font-weight: 800;
        }

        .pefa-mcs__field input,
        .pefa-mcs__field select,
        .pefa-mcs__field textarea {
          width: 100%;

          color:
            var(--pefa-text);

          background:
            #ffffff;

          border:
            1px solid #cfd8e3;

          border-radius:
            var(--pefa-radius-sm);

          font-family: inherit;
          font-size: 12px;

          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease;
        }

        .pefa-mcs__field input,
        .pefa-mcs__field select {
          height: 39px;

          padding:
            0 11px;
        }

        .pefa-mcs__field textarea {
          min-height: 94px;

          padding:
            10px 11px;

          resize: vertical;

          line-height: 1.5;
        }

        .pefa-mcs__field input::placeholder,
        .pefa-mcs__field textarea::placeholder {
          color:
            #a0aec0;
        }

        .pefa-mcs__field select {
          cursor: pointer;
        }

        .pefa-mcs__field input:focus,
        .pefa-mcs__field select:focus,
        .pefa-mcs__field textarea:focus {
          outline: none;

          border-color:
            var(--pefa-primary);

          box-shadow:
            0 0 0 3px
            rgba(
              15,
              118,
              110,
              0.10
            );
        }

        .pefa-mcs__field input:disabled,
        .pefa-mcs__field select:disabled,
        .pefa-mcs__field textarea:disabled {
          color:
            #64748b;

          background:
            #f8fafc;

          cursor:
            not-allowed;

          opacity:
            0.82;
        }

        /* =====================================================
           ANTIMICROBIAL SENSITIVITY
           ===================================================== */

        .pefa-mcs__sensitivity {
          padding: 17px;
        }

        .pefa-mcs__sensitivity-head {
          display: grid;

          grid-template-columns:
            42px
            minmax(0, 1.5fr)
            minmax(0, 1fr)
            42px;

          align-items: center;

          gap: 9px;

          padding:
            9px 10px;

          color:
            #64748b;

          background:
            #f8fafc;

          border:
            1px solid
            var(--pefa-border-light);

          border-radius:
            8px 8px 0 0;

          font-size: 9px;
          font-weight: 800;

          letter-spacing:
            0.07em;

          text-transform:
            uppercase;
        }

        .pefa-mcs__sensitivity-head span:first-child {
          text-align: center;
        }

        .pefa-mcs__sensitivity-empty {
          padding:
            18px 12px;

          color:
            #94a3b8;

          background:
            #ffffff;

          border:
            1px solid
            var(--pefa-border-light);

          border-top:
            0;

          text-align:
            center;

          font-size: 11px;
        }

        .pefa-mcs__sensitivity-row {
          display: grid;

          grid-template-columns:
            42px
            minmax(0, 1.5fr)
            minmax(0, 1fr)
            42px;

          align-items: center;

          gap: 9px;

          padding:
            9px 10px;

          background:
            #ffffff;

          border:
            1px solid
            var(--pefa-border-light);

          border-top:
            0;
        }

        .pefa-mcs__sensitivity-index {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 26px;
          height: 26px;

          margin: auto;

          color:
            #64748b;

          background:
            #f8fafc;

          border:
            1px solid #e2e8f0;

          border-radius: 7px;

          font-size: 10px;
          font-weight: 800;
        }

        .pefa-mcs__sensitivity-row select {
          width: 100%;
          height: 38px;

          padding:
            0 10px;

          color:
            var(--pefa-text);

          background:
            #ffffff;

          border:
            1px solid #cfd8e3;

          border-radius: 8px;

          font-family: inherit;
          font-size: 11px;

          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .pefa-mcs__sensitivity-row select:focus {
          outline: none;

          border-color:
            var(--pefa-primary);

          box-shadow:
            0 0 0 3px
            rgba(
              15,
              118,
              110,
              0.10
            );
        }

        .pefa-mcs__sensitivity-row select:disabled {
          background:
            #f8fafc;

          cursor:
            not-allowed;
        }

        .pefa-mcs__remove {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          margin: auto;

          color:
            #dc2626;

          background:
            #fff7f7;

          border:
            1px solid #fecaca;

          border-radius: 8px;

          cursor:
            pointer;

          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.16s ease;
        }

        .pefa-mcs__remove:hover:not(:disabled) {
          background:
            #fef2f2;

          border-color:
            #fca5a5;

          transform:
            translateY(-1px);
        }

        .pefa-mcs__remove:disabled {
          opacity:
            0.45;

          cursor:
            not-allowed;
        }

        .pefa-mcs__add {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          min-height: 36px;

          margin-top: 12px;

          padding:
            0 13px;

          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 8px;

          font-family: inherit;
          font-size: 11px;
          font-weight: 750;

          cursor:
            pointer;

          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.16s ease;
        }

        .pefa-mcs__add:hover:not(:disabled) {
          background:
            #dff8ee;

          border-color:
            #6ee7b7;

          transform:
            translateY(-1px);
        }

        .pefa-mcs__add:disabled {
          opacity:
            0.5;

          cursor:
            not-allowed;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 760px) {

          .pefa-mcs__header {
            align-items:
              flex-start;
          }

          .pefa-mcs__badge {
            display:
              none;
          }

          .pefa-mcs__edit-toolbar {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .pefa-mcs__edit-actions {
            width: 100%;
          }

          .pefa-mcs__action {
            flex: 1;
          }

          .pefa-mcs__grid {
            grid-template-columns:
              1fr;
          }

          .pefa-mcs__field--full {
            grid-column:
              auto;
          }

          .pefa-mcs__sensitivity {
            overflow-x:
              auto;
          }

          .pefa-mcs__sensitivity-head,
          .pefa-mcs__sensitivity-row {
            min-width:
              650px;
          }
        }

        @media (max-width: 480px) {

          .pefa-mcs__header {
            padding:
              15px;
          }

          .pefa-mcs__header-icon {
            width:
              40px;

            height:
              40px;

            flex-basis:
              40px;
          }

          .pefa-mcs__title {
            font-size:
              18px;
          }

          .pefa-mcs__section-header {
            padding:
              12px;
          }

          .pefa-mcs__grid,
          .pefa-mcs__sensitivity {
            padding:
              12px;
          }

          .pefa-mcs__section-number {
            display:
              none;
          }

          .pefa-mcs__edit-status-description {
            display:
              none;
          }
        }

      `}</style>

      <div
        className="pefa-mcs"
        aria-label="Microbiology MCS Result Entry"
      >

        {/* ==================================================
            FORM HEADER
           ================================================== */}

        <header className="pefa-mcs__header">

          <div className="pefa-mcs__header-main">

            <div className="pefa-mcs__header-icon">
              {isEditMode ? (
                <Pencil size={21} />
              ) : (
                <FlaskConical size={21} />
              )}
            </div>

            <div>

              <div className="pefa-mcs__eyebrow">
                MICROBIOLOGY
              </div>

              <h2 className="pefa-mcs__title">
                {isReadOnly
                  ? "MCS Result"
                  : isEditMode
                    ? "Edit MCS Result"
                    : "MCS Result Entry"}
              </h2>

              <p className="pefa-mcs__subtitle">
                {isReadOnly
                  ? "Review microscopy, culture and antimicrobial susceptibility findings."
                  : isEditMode
                    ? "Modify the existing microscopy, culture and antimicrobial susceptibility result."
                    : "Microscopy, culture and antimicrobial susceptibility"}
              </p>

            </div>

          </div>

          <div className={modeClass}>
            {isReadOnly ? (
              <Microscope size={15} />
            ) : isEditMode ? (
              <Pencil size={15} />
            ) : (
              <FlaskConical size={15} />
            )}

            <span>
              {modeLabel}
            </span>
          </div>

        </header>

        {/* ==================================================
            EDIT TOOLBAR
           ================================================== */}

        {isEditMode &&
          !isReadOnly && (
            <div className="pefa-mcs__edit-toolbar">

              <div className="pefa-mcs__edit-status">

                <div className="pefa-mcs__edit-status-icon">
                  <Pencil size={15} />
                </div>

                <div className="pefa-mcs__edit-status-text">

                  <p className="pefa-mcs__edit-status-title">
                    Editing Existing MCS Result
                  </p>

                  <p className="pefa-mcs__edit-status-description">
                    {isDirty
                      ? "Unsaved changes are present."
                      : "No changes have been made."}
                  </p>

                </div>

              </div>

              <div className="pefa-mcs__edit-actions">

                <button
                  type="button"
                  className="pefa-mcs__action pefa-mcs__action--cancel"
                  disabled={
                    !isDirty
                  }
                  onClick={
                    handleCancelEdit
                  }
                  title="Discard unsaved changes"
                >
                  <RotateCcw size={14} />
                  <span>
                    Cancel
                  </span>
                </button>

                <button
                  type="button"
                  className="pefa-mcs__action pefa-mcs__action--save"
                  disabled={
                    !isDirty
                  }
                  onClick={
                    handleSaveEdit
                  }
                  title="Save changes"
                >
                  <Save size={14} />
                  <span>
                    Save Changes
                  </span>
                </button>

              </div>

            </div>
          )}

        {/* ==================================================
            SPECIMEN INFORMATION
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="01"
            icon={
              <FlaskConical
                size={18}
              />
            }
            title="Specimen Information"
            description="Record the specimen received and its macroscopic characteristics."
          />

          <div className="pefa-mcs__grid">

            <SelectField
              label="Specimen"
              field="specimen"
              options={
                SPECIMEN_OPTIONS
              }
              placeholder="Select specimen"
              required
            />

            <SelectField
              label="Appearance"
              field="appearance"
              options={
                APPEARANCE_OPTIONS
              }
              placeholder="Select appearance"
            />

            <SelectField
              label="Colour"
              field="colour"
              options={
                COLOUR_OPTIONS
              }
              placeholder="Select colour"
            />

            <SelectField
              label="Consistency"
              field="consistency"
              options={
                CONSISTENCY_OPTIONS
              }
              placeholder="Select consistency"
            />

            <SelectField
              label="Odour"
              field="odour"
              options={
                ODOUR_OPTIONS
              }
              placeholder="Select odour"
            />

          </div>

        </section>

        {/* ==================================================
            MICROSCOPY
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="02"
            icon={
              <Microscope
                size={18}
              />
            }
            title="Microscopy"
            description="Record microscopic findings observed during examination."
          />

          <div className="pefa-mcs__grid">

            <SelectField
              label="Gram Stain"
              field="gram_stain"
              options={
                GRAM_STAIN_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Pus Cells"
              field="pus_cells"
              options={
                PUS_CELL_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="RBC"
              field="rbc"
              options={
                RBC_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Epithelial Cells"
              field="epithelial_cells"
              options={
                EPITHELIAL_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Yeast Cells"
              field="yeast_cells"
              options={
                YEAST_CELL_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Bacteria"
              field="bacteria"
              options={
                MICROSCOPY_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Crystals"
              field="crystals"
              options={
                CRYSTAL_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Casts"
              field="casts"
              options={
                CAST_OPTIONS
              }
              placeholder="Select finding"
            />

            <SelectField
              label="Parasites"
              field="parasites"
              options={
                PARASITE_OPTIONS
              }
              placeholder="Select finding"
            />

          </div>

        </section>

        {/* ==================================================
            CULTURE
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="03"
            icon={
              <FlaskConical
                size={18}
              />
            }
            title="Culture"
            description="Document culture growth and organism identification."
          />

          <div className="pefa-mcs__grid">

            <SelectField
              label="Culture Result"
              field="culture_result"
              options={
                CULTURE_OPTIONS
              }
              placeholder="Select culture result"
            />

            <SelectField
              label="Organism Isolated"
              field="organism"
              options={
                ORGANISM_OPTIONS
              }
              placeholder="Select organism"
            />

            <SelectField
              label="Second Organism"
              field="organism_2"
              options={
                ORGANISM_OPTIONS
              }
              placeholder="Select organism"
            />

            <TextField
              label="Colony Count"
              field="colony_count"
              placeholder="e.g. 10⁵ CFU/mL"
            />

            <SelectField
              label="Gram Reaction"
              field="gram_reaction"
              options={
                GRAM_REACTION_OPTIONS
              }
              placeholder="Select reaction"
            />

            <TextAreaField
              label="Organism Comment"
              field="organism_comment"
              placeholder="Additional organism identification details..."
              rows={3}
            />

          </div>

        </section>

        {/* ==================================================
            ADDITIONAL FINDINGS
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="04"
            icon={
              <Microscope
                size={18}
              />
            }
            title="Additional Findings"
            description="Record additional microbiological observations or tests."
          />

          <div className="pefa-mcs__grid">

            <SelectField
              label="Motility"
              field="motility"
              options={
                YES_NO_OPTIONS
              }
              placeholder="Select"
            />

            <SelectField
              label="Special Test"
              field="special_test"
              options={[
                "Not Done",
                "Negative",
                "Positive",
                "Other",
              ]}
              placeholder="Select"
            />

          </div>

        </section>

        {/* ==================================================
            ANTIMICROBIAL SENSITIVITY
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="05"
            icon={
              <FlaskConical
                size={18}
              />
            }
            title="Antimicrobial Sensitivity"
            description="Record antimicrobial susceptibility for the isolated organism."
          />

          <div className="pefa-mcs__sensitivity">

            <div className="pefa-mcs__sensitivity-head">
              <span>
                No.
              </span>

              <span>
                Antibiotic
              </span>

              <span>
                Interpretation
              </span>

              <span
                aria-hidden="true"
              />
            </div>

            {form.sensitivity
              ?.length === 0 && (
              <div className="pefa-mcs__sensitivity-empty">
                No antimicrobial agents
                have been added.
              </div>
            )}

            {(form.sensitivity || [])
              .map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="pefa-mcs__sensitivity-row"
                    key={
                      item.id ||
                      `antibiotic-${index}`
                    }
                  >

                    <div className="pefa-mcs__sensitivity-index">
                      {index + 1}
                    </div>

                    <select
                      value={
                        item.antibiotic ||
                        ""
                      }
                      disabled={
                        isDisabled
                      }
                      autoComplete="off"
                      onChange={(
                        event
                      ) =>
                        updateAntibiotic(
                          item.id,
                          "antibiotic",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select antibiotic
                      </option>

                      {ANTIBIOTIC_OPTIONS.map(
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

                    <select
                      value={
                        item.sensitivity ||
                        ""
                      }
                      disabled={
                        isDisabled
                      }
                      autoComplete="off"
                      onChange={(
                        event
                      ) =>
                        updateAntibiotic(
                          item.id,
                          "sensitivity",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select interpretation
                      </option>

                      {SENSITIVITY_OPTIONS.map(
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

                    <button
                      type="button"
                      className="pefa-mcs__remove"
                      disabled={
                        isDisabled
                      }
                      onClick={() =>
                        removeAntibiotic(
                          item.id
                        )
                      }
                      title="Remove antibiotic"
                      aria-label="Remove antibiotic"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>
                )
              )}

            <button
              type="button"
              className="pefa-mcs__add"
              disabled={
                isDisabled
              }
              onClick={
                addAntibiotic
              }
            >
              <Plus size={16} />

              <span>
                Add Antibiotic
              </span>
            </button>

          </div>

        </section>

        {/* ==================================================
            INTERPRETATION
           ================================================== */}

        <section className="pefa-mcs__section">

          <SectionHeader
            number="06"
            icon={
              <FlaskConical
                size={18}
              />
            }
            title="Interpretation & Comments"
            description="Provide the final laboratory interpretation and any relevant comments."
          />

          <div className="pefa-mcs__grid pefa-mcs__grid--single">

            <TextAreaField
              label="Interpretation"
              field="interpretation"
              placeholder="Enter laboratory interpretation..."
              rows={4}
            />

            <TextAreaField
              label="Comments"
              field="comments"
              placeholder="Enter additional laboratory comments..."
              rows={4}
            />

          </div>

        </section>

        {/* ==================================================
            EDIT ACTIONS — BOTTOM
           ================================================== */}

        {isEditMode &&
          !isReadOnly && (
            <div className="pefa-mcs__edit-toolbar">

              <div className="pefa-mcs__edit-status">

                <div className="pefa-mcs__edit-status-icon">
                  <Pencil size={15} />
                </div>

                <div className="pefa-mcs__edit-status-text">

                  <p className="pefa-mcs__edit-status-title">
                    {isDirty
                      ? "Changes not yet saved"
                      : "No unsaved changes"}
                  </p>

                  <p className="pefa-mcs__edit-status-description">
                    Review the result before saving.
                  </p>

                </div>

              </div>

              <div className="pefa-mcs__edit-actions">

                <button
                  type="button"
                  className="pefa-mcs__action pefa-mcs__action--cancel"
                  disabled={
                    !isDirty
                  }
                  onClick={
                    handleCancelEdit
                  }
                >
                  <X size={14} />

                  <span>
                    Cancel Edit
                  </span>
                </button>

                <button
                  type="button"
                  className="pefa-mcs__action pefa-mcs__action--save"
                  disabled={
                    !isDirty
                  }
                  onClick={
                    handleSaveEdit
                  }
                >
                  <Save size={14} />

                  <span>
                    Save Changes
                  </span>
                </button>

              </div>

            </div>
          )}

      </div>
    </>
  );
}

/* ==========================================================
   PUBLIC OPTIONS
   ========================================================== */

export {
  EMPTY_FORM,
  normalizeForm,

  SPECIMEN_OPTIONS,
  APPEARANCE_OPTIONS,
  COLOUR_OPTIONS,
  CONSISTENCY_OPTIONS,
  ODOUR_OPTIONS,

  MICROSCOPY_OPTIONS,
  PUS_CELL_OPTIONS,
  RBC_OPTIONS,
  EPITHELIAL_OPTIONS,
  YEAST_CELL_OPTIONS,
  CRYSTAL_OPTIONS,
  CAST_OPTIONS,
  PARASITE_OPTIONS,

  CULTURE_OPTIONS,
  ORGANISM_OPTIONS,
  GRAM_STAIN_OPTIONS,
  GRAM_REACTION_OPTIONS,

  YES_NO_OPTIONS,

  ANTIBIOTIC_OPTIONS,
  SENSITIVITY_OPTIONS,
};