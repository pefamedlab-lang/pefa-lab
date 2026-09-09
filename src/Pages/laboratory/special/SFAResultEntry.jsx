/* ==========================================================
   PEFA LAB
   SFA RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/SFAResultEntry.jsx

   PURPOSE:
   - Seminal Fluid Analysis result entry
   - Self-contained styling
   - No external CSS import
   - Structured laboratory fields
   - Parent-controlled persistence
   - Independent special-test component
   ========================================================== */

import React, { useMemo, useState } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  RefreshCw,
} from "lucide-react";

/* ==========================================================
   INITIAL FORM
   ========================================================== */

const INITIAL_FORM = {
  collection_date: "",
  collection_time: "",
  received_date: "",
  received_time: "",
  processed_date: "",
  processed_time: "",
  examined_date: "",
  examined_time: "",

  abstinence_days: "",

  appearance: "",
  liquefaction: "",
  viscosity: "",

  volume: "",
  ph: "",

  sperm_concentration: "",
  total_sperm_count: "",

  progressive_motility: "",
  non_progressive_motility: "",
  immotile: "",

  normal_morphology: "",
  abnormal_morphology: "",

  vitality: "",

  pus_cells: "",
  epithelial_cells: "",
  red_blood_cells: "",

  agglutination: "",
  aggregation: "",

  fructose: "",
  sperm_debris: "",

  remarks: "",
  interpretation: "",
};

/* ==========================================================
   OPTIONS
   ========================================================== */

const APPEARANCE_OPTIONS = [
  "Greyish White",
  "Opalescent",
  "Yellowish",
  "Reddish",
  "Brownish",
  "Clear",
  "Other",
];

const LIQUEFACTION_OPTIONS = [
  "Complete",
  "Incomplete",
  "Not Complete",
];

const VISCOSITY_OPTIONS = [
  "Normal",
  "Increased",
  "Reduced",
];

const AGGLUTINATION_OPTIONS = [
  "Absent",
  "Present",
];

const AGGREGATION_OPTIONS = [
  "Absent",
  "Present",
];

const FRUCTOSE_OPTIONS = [
  "Positive",
  "Negative",
];

/* ==========================================================
   STYLE SYSTEM
   ----------------------------------------------------------
   All styles are intentionally kept inside this file.
   No external CSS dependency.
   ========================================================== */

const COLORS = {
  primary: "#0f766e",
  primaryDark: "#115e59",
  primaryLight: "#ccfbf1",

  text: "#172033",
  textSoft: "#64748b",
  textMuted: "#94a3b8",

  border: "#e2e8f0",
  borderDark: "#cbd5e1",

  background: "#f8fafc",
  white: "#ffffff",

  success: "#15803d",
  successBg: "#f0fdf4",

  danger: "#dc2626",
  dangerBg: "#fef2f2",

  warning: "#b45309",
  warningBg: "#fffbeb",
};

const styles = {
  page: {
    width: "100%",
    boxSizing: "border-box",
    padding: "20px",
    background: COLORS.background,
    color: COLORS.text,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  container: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "20px 22px",
    marginBottom: "16px",
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    boxShadow: "0 3px 14px rgba(15, 23, 42, 0.06)",
  },

  headerMain: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: 0,
  },

  headerIcon: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: COLORS.primaryLight,
    color: COLORS.primary,
  },

  eyebrow: {
    display: "block",
    marginBottom: "3px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: COLORS.primary,
  },

  title: {
    margin: 0,
    fontSize: "19px",
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: COLORS.text,
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: COLORS.textSoft,
  },

  headerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    borderRadius: "999px",
    background: "#f0fdfa",
    border: `1px solid #99f6e4`,
    color: COLORS.primaryDark,
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "14px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
  },

  patientCard: {
    background:
      "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
  },

  cardTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "17px",
    paddingBottom: "12px",
    borderBottom: `1px solid ${COLORS.border}`,
  },

  sectionEyebrow: {
    display: "block",
    marginBottom: "3px",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.13em",
    color: COLORS.primary,
    textTransform: "uppercase",
  },

  cardHeading: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: COLORS.text,
  },

  patientGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },

  patientItem: {
    padding: "12px 13px",
    borderRadius: "9px",
    background: "#f8fafc",
    border: `1px solid ${COLORS.border}`,
  },

  patientLabel: {
    display: "block",
    marginBottom: "4px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: COLORS.textMuted,
  },

  patientValue: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: COLORS.text,
    wordBreak: "break-word",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "15px",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "15px",
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "15px",
  },

  field: {
    minWidth: 0,
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "10px",
    fontWeight: 750,
    color: "#334155",
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
  },

  input: {
    width: "100%",
    height: "38px",
    boxSizing: "border-box",
    padding: "0 11px",
    border: `1px solid ${COLORS.borderDark}`,
    borderRadius: "8px",
    outline: "none",
    background: COLORS.white,
    color: COLORS.text,
    fontSize: "12px",
    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease",
  },

  inputWithUnit: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputUnit: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    paddingLeft: "5px",
    background: COLORS.white,
    color: COLORS.textSoft,
    fontSize: "10px",
    fontWeight: 700,
    pointerEvents: "none",
  },

  inputWithUnitField: {
    paddingRight: "75px",
  },

  select: {
    width: "100%",
    height: "38px",
    boxSizing: "border-box",
    padding: "0 10px",
    border: `1px solid ${COLORS.borderDark}`,
    borderRadius: "8px",
    outline: "none",
    background: COLORS.white,
    color: COLORS.text,
    fontSize: "12px",
    cursor: "pointer",
  },

  totalBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "80px",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  validBadge: {
    background: COLORS.successBg,
    color: COLORS.success,
    border: `1px solid #bbf7d0`,
  },

  invalidBadge: {
    background: COLORS.dangerBg,
    color: COLORS.danger,
    border: `1px solid #fecaca`,
  },

  textareaGroup: {
    marginBottom: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border: `1px solid ${COLORS.borderDark}`,
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    minHeight: "90px",
    background: COLORS.white,
    color: COLORS.text,
    fontSize: "12px",
    lineHeight: 1.55,
  },

  generateButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.borderDark}`,
    background: COLORS.white,
    color: COLORS.primaryDark,
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  message: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 13px",
    marginBottom: "14px",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: 650,
  },

  errorMessage: {
    background: COLORS.dangerBg,
    border: `1px solid #fecaca`,
    color: COLORS.danger,
  },

  successMessage: {
    background: COLORS.successBg,
    border: `1px solid #bbf7d0`,
    color: COLORS.success,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "9px",
    padding: "14px 0 4px",
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    minHeight: "38px",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid transparent",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
    transition:
      "transform 0.12s ease, opacity 0.12s ease",
  },

  primaryButton: {
    background: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.white,
  },

  secondaryButton: {
    background: COLORS.white,
    borderColor: COLORS.borderDark,
    color: "#334155",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  sectionSpacing: {
    marginTop: "15px",
  },

  responsiveNote: {
    marginTop: "5px",
    fontSize: "9px",
    color: COLORS.textMuted,
  },
};

/* ==========================================================
   HELPERS
   ========================================================== */

const getToday = () =>
  new Date().toISOString().slice(0, 10);

const getCurrentTime = () =>
  new Date().toTimeString().slice(0, 5);

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function SFAResultEntry({
  registration = null,
  initialValue = null,
  onSave,
  onCancel,
}) {
  /* ========================================================
     FORM STATE
     ======================================================== */

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...(initialValue || {}),
  }));

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ========================================================
     PATIENT / REGISTRATION INFORMATION
     ======================================================== */

  const patientName =
    registration?.patient_name ||
    registration?.full_name ||
    registration?.patient?.full_name ||
    "Patient";

  const labNumber =
    registration?.lab_number ||
    registration?.laboratory_number ||
    "—";

  const patientId =
    registration?.patient_id ||
    "—";

  /* ========================================================
     CHANGE HANDLER
     ======================================================== */

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  /* ========================================================
     AUTO CALCULATIONS
     ======================================================== */

  const calculatedMotility = useMemo(() => {
    const progressive =
      Number(form.progressive_motility || 0);

    const nonProgressive =
      Number(form.non_progressive_motility || 0);

    const immotile =
      Number(form.immotile || 0);

    const total =
      progressive +
      nonProgressive +
      immotile;

    return {
      total,
      valid:
        total === 100 ||
        total === 0,
    };
  }, [
    form.progressive_motility,
    form.non_progressive_motility,
    form.immotile,
  ]);

  const calculatedMorphology = useMemo(() => {
    const normal =
      Number(form.normal_morphology || 0);

    const abnormal =
      Number(form.abnormal_morphology || 0);

    const total =
      normal + abnormal;

    return {
      total,
      valid:
        total === 100 ||
        total === 0,
    };
  }, [
    form.normal_morphology,
    form.abnormal_morphology,
  ]);

  /* ========================================================
     AUTO INTERPRETATION
     ======================================================== */

  const generateInterpretation = () => {
    const findings = [];

    if (form.appearance) {
      findings.push(
        `Appearance: ${form.appearance}.`
      );
    }

    if (form.liquefaction) {
      findings.push(
        `Liquefaction: ${form.liquefaction}.`
      );
    }

    if (form.viscosity) {
      findings.push(
        `Viscosity: ${form.viscosity}.`
      );
    }

    if (form.volume) {
      findings.push(
        `Volume: ${form.volume} mL.`
      );
    }

    if (form.ph) {
      findings.push(
        `pH: ${form.ph}.`
      );
    }

    if (form.sperm_concentration) {
      findings.push(
        `Sperm concentration: ${form.sperm_concentration}.`
      );
    }

    if (form.progressive_motility) {
      findings.push(
        `Progressive motility: ${form.progressive_motility}%.`
      );
    }

    if (form.normal_morphology) {
      findings.push(
        `Normal morphology: ${form.normal_morphology}%.`
      );
    }

    if (form.vitality) {
      findings.push(
        `Vitality: ${form.vitality}%.`
      );
    }

    if (form.pus_cells) {
      findings.push(
        `Pus cells: ${form.pus_cells}.`
      );
    }

    return findings.join(" ");
  };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /* ------------------------------------------------------
         MOTILITY VALIDATION
         ------------------------------------------------------ */

      if (
        form.progressive_motility ||
        form.non_progressive_motility ||
        form.immotile
      ) {
        if (!calculatedMotility.valid) {
          throw new Error(
            "Progressive, non-progressive and immotile motility should total 100%."
          );
        }
      }

      /* ------------------------------------------------------
         MORPHOLOGY VALIDATION
         ------------------------------------------------------ */

      if (
        form.normal_morphology ||
        form.abnormal_morphology
      ) {
        if (!calculatedMorphology.valid) {
          throw new Error(
            "Normal and abnormal morphology should total 100%."
          );
        }
      }

      /* ------------------------------------------------------
         SAVE PAYLOAD
         ------------------------------------------------------ */

      const payload = {
        ...form,

        registration_id:
          registration?.id ?? null,

        patient_id:
          registration?.patient_id ?? null,

        lab_number:
          registration?.lab_number ||
          registration?.laboratory_number ||
          null,

        patient_name:
          patientName,

        interpretation:
          form.interpretation ||
          generateInterpretation(),
      };

      if (typeof onSave === "function") {
        await onSave(payload);
      }

      setSuccess(
        "Semen analysis result saved successfully."
      );
    } catch (err) {
      console.error(
        "SFAResultEntry save failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to save SFA result."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     RESET
     ======================================================== */

  const handleReset = () => {
    setForm({
      ...INITIAL_FORM,
    });

    setError("");
    setSuccess("");
  };

  /* ========================================================
     FIELD COMPONENTS
     ======================================================== */

  const TextInput = ({
    label,
    field,
    type = "text",
    placeholder = "",
    unit = "",
  }) => (
    <div style={styles.field}>
      <label
        htmlFor={`sfa-${field}`}
        style={styles.label}
      >
        {label}
      </label>

      <div style={styles.inputWithUnit}>
        <input
          id={`sfa-${field}`}
          type={type}
          value={form[field] ?? ""}
          placeholder={placeholder}
          onChange={(event) =>
            handleChange(
              field,
              event.target.value
            )
          }
          style={{
            ...styles.input,
            ...(unit
              ? styles.inputWithUnitField
              : {}),
          }}
        />

        {unit && (
          <span style={styles.inputUnit}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  const SelectInput = ({
    label,
    field,
    options,
    placeholder = "Select",
  }) => (
    <div style={styles.field}>
      <label
        htmlFor={`sfa-${field}`}
        style={styles.label}
      >
        {label}
      </label>

      <select
        id={`sfa-${field}`}
        value={form[field] ?? ""}
        onChange={(event) =>
          handleChange(
            field,
            event.target.value
          )
        }
        style={styles.select}
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

  /* ========================================================
     CARD TITLE
     ======================================================== */

  const CardTitle = ({
    eyebrow,
    title,
    action = null,
  }) => (
    <div style={styles.cardTitle}>
      <div>
        <span style={styles.sectionEyebrow}>
          {eyebrow}
        </span>

        <h2 style={styles.cardHeading}>
          {title}
        </h2>
      </div>

      {action}
    </div>
  );

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ==================================================
            HEADER
           ================================================== */}

        <header style={styles.header}>

          <div style={styles.headerMain}>

            <div style={styles.headerIcon}>
              <FlaskConical size={21} />
            </div>

            <div>
              <span style={styles.eyebrow}>
                MICROBIOLOGY
              </span>

              <h1 style={styles.title}>
                SEMEN FLUID ANALYSIS
              </h1>

              <p style={styles.subtitle}>
                Structured seminal fluid analysis
                result entry.
              </p>
            </div>

          </div>

          <div style={styles.headerBadge}>
            <FlaskConical size={15} />
            <span>Special Test</span>
          </div>

        </header>

        {/* ==================================================
            PATIENT INFORMATION
           ================================================== */}

        <section
          style={{
            ...styles.card,
            ...styles.patientCard,
          }}
        >
          <CardTitle
            eyebrow="PATIENT INFORMATION"
            title="Examination Details"
          />

          <div style={styles.patientGrid}>

            <div style={styles.patientItem}>
              <span style={styles.patientLabel}>
                Patient Name
              </span>

              <strong style={styles.patientValue}>
                {patientName}
              </strong>
            </div>

            <div style={styles.patientItem}>
              <span style={styles.patientLabel}>
                Patient ID
              </span>

              <strong style={styles.patientValue}>
                {patientId}
              </strong>
            </div>

            <div style={styles.patientItem}>
              <span style={styles.patientLabel}>
                Lab Number
              </span>

              <strong style={styles.patientValue}>
                {labNumber}
              </strong>
            </div>

            <div style={styles.patientItem}>
              <span style={styles.patientLabel}>
                Test
              </span>

              <strong style={styles.patientValue}>
                Semen Fluid Analysis
              </strong>
            </div>

          </div>
        </section>

        {/* ==================================================
            SPECIMEN TIMELINE
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="SPECIMEN TIMELINE"
            title="Collection & Processing"
          />

          <div style={styles.grid4}>

            <TextInput
              label="Collection Date"
              field="collection_date"
              type="date"
            />

            <TextInput
              label="Collection Time"
              field="collection_time"
              type="time"
            />

            <TextInput
              label="Received Date"
              field="received_date"
              type="date"
            />

            <TextInput
              label="Received Time"
              field="received_time"
              type="time"
            />

            <TextInput
              label="Processed Date"
              field="processed_date"
              type="date"
            />

            <TextInput
              label="Processed Time"
              field="processed_time"
              type="time"
            />

            <TextInput
              label="Examined Date"
              field="examined_date"
              type="date"
            />

            <TextInput
              label="Examined Time"
              field="examined_time"
              type="time"
            />

          </div>

          <div
            style={{
              ...styles.grid4,
              ...styles.sectionSpacing,
            }}
          >
            <TextInput
              label="Abstinence"
              field="abstinence_days"
              type="number"
              unit="days"
              placeholder="e.g. 3"
            />
          </div>

        </section>

        {/* ==================================================
            MACROSCOPY
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="MACROSCOPY"
            title="Physical Examination"
          />

          <div style={styles.grid3}>

            <SelectInput
              label="Appearance"
              field="appearance"
              options={APPEARANCE_OPTIONS}
            />

            <SelectInput
              label="Liquefaction"
              field="liquefaction"
              options={LIQUEFACTION_OPTIONS}
            />

            <SelectInput
              label="Viscosity"
              field="viscosity"
              options={VISCOSITY_OPTIONS}
            />

            <TextInput
              label="Volume"
              field="volume"
              type="number"
              unit="mL"
            />

            <TextInput
              label="pH"
              field="ph"
              type="number"
              placeholder="e.g. 7.2"
            />

          </div>

        </section>

        {/* ==================================================
            SPERM COUNT
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="SPERM COUNT"
            title="Concentration & Count"
          />

          <div style={styles.grid2}>

            <TextInput
              label="Sperm Concentration"
              field="sperm_concentration"
              type="number"
              unit="million/mL"
            />

            <TextInput
              label="Total Sperm Count"
              field="total_sperm_count"
              type="number"
              unit="million"
            />

          </div>

        </section>

        {/* ==================================================
            MOTILITY
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="MOTILITY"
            title="Sperm Motility"
            action={
              <div
                style={{
                  ...styles.totalBadge,
                  ...(calculatedMotility.valid
                    ? styles.validBadge
                    : styles.invalidBadge),
                }}
              >
                Total: {calculatedMotility.total}%
              </div>
            }
          />

          <div style={styles.grid3}>

            <TextInput
              label="Progressive Motility"
              field="progressive_motility"
              type="number"
              unit="%"
            />

            <TextInput
              label="Non-Progressive"
              field="non_progressive_motility"
              type="number"
              unit="%"
            />

            <TextInput
              label="Immotile"
              field="immotile"
              type="number"
              unit="%"
            />

          </div>

          {!calculatedMotility.valid && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 10px",
                borderRadius: "7px",
                background: COLORS.dangerBg,
                color: COLORS.danger,
                fontSize: "10px",
                fontWeight: 650,
              }}
            >
              Motility percentages must total
              100%.
            </div>
          )}

        </section>

        {/* ==================================================
            MORPHOLOGY
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="MORPHOLOGY"
            title="Sperm Morphology"
            action={
              <div
                style={{
                  ...styles.totalBadge,
                  ...(calculatedMorphology.valid
                    ? styles.validBadge
                    : styles.invalidBadge),
                }}
              >
                Total: {calculatedMorphology.total}%
              </div>
            }
          />

          <div style={styles.grid2}>

            <TextInput
              label="Normal Morphology"
              field="normal_morphology"
              type="number"
              unit="%"
            />

            <TextInput
              label="Abnormal Morphology"
              field="abnormal_morphology"
              type="number"
              unit="%"
            />

          </div>

          {!calculatedMorphology.valid && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 10px",
                borderRadius: "7px",
                background: COLORS.dangerBg,
                color: COLORS.danger,
                fontSize: "10px",
                fontWeight: 650,
              }}
            >
              Normal and abnormal morphology
              must total 100%.
            </div>
          )}

        </section>

        {/* ==================================================
            VITALITY
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="VITALITY"
            title="Sperm Vitality"
          />

          <div style={styles.grid2}>

            <TextInput
              label="Vitality"
              field="vitality"
              type="number"
              unit="%"
            />

          </div>

        </section>

        {/* ==================================================
            CELLULAR FINDINGS
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="MICROSCOPY"
            title="Cellular Findings"
          />

          <div style={styles.grid3}>

            <TextInput
              label="Pus Cells"
              field="pus_cells"
              placeholder="e.g. 2–4 /HPF"
            />

            <TextInput
              label="Epithelial Cells"
              field="epithelial_cells"
              placeholder="e.g. Few"
            />

            <TextInput
              label="Red Blood Cells"
              field="red_blood_cells"
              placeholder="e.g. Nil"
            />

            <SelectInput
              label="Agglutination"
              field="agglutination"
              options={AGGLUTINATION_OPTIONS}
            />

            <SelectInput
              label="Aggregation"
              field="aggregation"
              options={AGGREGATION_OPTIONS}
            />

            <TextInput
              label="Sperm Debris"
              field="sperm_debris"
              placeholder="e.g. Few"
            />

          </div>

        </section>

        {/* ==================================================
            SPECIAL FINDINGS
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="ADDITIONAL FINDINGS"
            title="Special Tests"
          />

          <div style={styles.grid2}>

            <SelectInput
              label="Fructose"
              field="fructose"
              options={FRUCTOSE_OPTIONS}
            />

          </div>

        </section>

        {/* ==================================================
            INTERPRETATION
           ================================================== */}

        <section style={styles.card}>

          <CardTitle
            eyebrow="REPORT"
            title="Remarks & Interpretation"
            action={
              <button
                type="button"
                style={styles.generateButton}
                onClick={() =>
                  handleChange(
                    "interpretation",
                    generateInterpretation()
                  )
                }
              >
                Generate
              </button>
            }
          />

          <div style={styles.textareaGroup}>

            <label style={styles.label}>
              Remarks
            </label>

            <textarea
              rows={4}
              value={form.remarks}
              placeholder="Enter additional laboratory observations..."
              onChange={(event) =>
                handleChange(
                  "remarks",
                  event.target.value
                )
              }
              style={styles.textarea}
            />

          </div>

          <div style={{ marginBottom: 0 }}>

            <label style={styles.label}>
              Interpretation
            </label>

            <textarea
              rows={5}
              value={form.interpretation}
              placeholder="Enter or generate interpretation..."
              onChange={(event) =>
                handleChange(
                  "interpretation",
                  event.target.value
                )
              }
              style={styles.textarea}
            />

          </div>

        </section>

        {/* ==================================================
            ERROR
           ================================================== */}

        {error && (
          <div
            style={{
              ...styles.message,
              ...styles.errorMessage,
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            SUCCESS
           ================================================== */}

        {success && (
          <div
            style={{
              ...styles.message,
              ...styles.successMessage,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* ==================================================
            FOOTER ACTIONS
           ================================================== */}

        <div style={styles.footer}>

          {typeof onCancel === "function" && (
            <button
              type="button"
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                ...(saving
                  ? styles.disabledButton
                  : {}),
              }}
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(saving
                ? styles.disabledButton
                : {}),
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2
                size={17}
                style={{
                  animation:
                    "sfa-spin 1s linear infinite",
                }}
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Saving..."
              : "Save SFA Result"}
          </button>

        </div>

        {/* ==================================================
            LOCAL ANIMATION
            --------------------------------------------------
            Injected directly into the component so there
            is still no external CSS dependency.
           ================================================== */}

        <style>
          {`
            @keyframes sfa-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            input:focus,
            select:focus,
            textarea:focus {
              border-color: ${COLORS.primary} !important;
              box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.10);
            }

            input:hover,
            select:hover,
            textarea:hover {
              border-color: #94a3b8;
            }

            button:hover:not(:disabled) {
              filter: brightness(0.98);
            }

            button:active:not(:disabled) {
              transform: translateY(1px);
            }

            @media (max-width: 700px) {
              .sfa-mobile-header {
                flex-direction: column;
                align-items: flex-start;
              }
            }
          `}
        </style>

      </div>
    </div>
  );
}