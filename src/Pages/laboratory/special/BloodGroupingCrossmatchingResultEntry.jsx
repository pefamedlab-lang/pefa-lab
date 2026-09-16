import React, { useMemo, useState } from "react";
import { Save, Loader2, Pencil, X, CheckCircle2, AlertCircle } from "lucide-react";

/*
  PEFA LAB — SIMPLE GROUPING & CROSS MATCHING RESULT ENTRY

  Designed to match the simple PEFA report format:
  - Recipient blood group
  - HIV status
  - Donor blood group
  - Donor blood bag number
  - HBsAg
  - HCV
  - VDRL
  - RVS
  - Expiry date
  - Crossmatching compatibility

  IMPORTANT:
  - Parent component remains responsible for database persistence through onSave().
  - Existing detailed Blood Bank payload fields are preserved when an older
    result is edited.
  - Simple fields are added without removing the existing payload fields.
*/

const BLOOD_GROUP_OPTIONS = [
  { value: "A Positive", abo: "A", rh: "Positive" },
  { value: "A Negative", abo: "A", rh: "Negative" },
  { value: "B Positive", abo: "B", rh: "Positive" },
  { value: "B Negative", abo: "B", rh: "Negative" },
  { value: "AB Positive", abo: "AB", rh: "Positive" },
  { value: "AB Negative", abo: "AB", rh: "Negative" },
  { value: "O Positive", abo: "O", rh: "Positive" },
  { value: "O Negative", abo: "O", rh: "Negative" },
];

const SCREENING_OPTIONS = ["Negative", "Positive", "Reactive", "Non-Reactive"];
const COMPATIBILITY_OPTIONS = ["Compatible", "Incompatible", "Not Tested"];

const firstNonEmpty = (...values) =>
  values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  ) ?? "";

const normalizeBloodGroup = (abo, rh) => {
  const group = String(abo || "").trim().toUpperCase();
  const rhesus = String(rh || "").trim().toLowerCase();

  if (!group) return "";

  if (rhesus === "positive" || rhesus === "pos" || rhesus === "+") {
    return `${group} Positive`;
  }

  if (rhesus === "negative" || rhesus === "neg" || rhesus === "−" || rhesus === "-") {
    return `${group} Negative`;
  }

  return group;
};

const parseBloodGroup = (value) => {
  const raw = String(value || "").trim().toUpperCase();

  const option = BLOOD_GROUP_OPTIONS.find(
    (item) => item.value.toUpperCase() === raw
  );

  if (option) return { abo: option.abo, rh: option.rh };

  const aboMatch = raw.match(/^(AB|A|B|O)\b/);
  const abo = aboMatch?.[1] || "";

  let rh = "";
  if (raw.includes("POSITIVE") || raw.includes("POS") || raw.endsWith("+")) {
    rh = "Positive";
  } else if (
    raw.includes("NEGATIVE") ||
    raw.includes("NEG") ||
    raw.endsWith("-") ||
    raw.endsWith("−")
  ) {
    rh = "Negative";
  }

  return { abo, rh };
};

const extractNestedResult = (result) => {
  const nested = result?.result;

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested;
  }

  return {};
};

const buildInitialForm = (resultData) => {
  const crossmatches = Array.isArray(resultData?.crossmatches)
    ? resultData.crossmatches
    : [];

  const firstCrossmatch = crossmatches[0] || {};

  const recipientAbo = firstNonEmpty(
    resultData?.recipient_abo_group,
    resultData?.abo_group
  );

  const recipientRh = firstNonEmpty(
    resultData?.recipient_rh_type,
    resultData?.rh_type
  );

  const donorAbo = firstNonEmpty(
    resultData?.donor_abo_group,
    firstCrossmatch?.donorBloodGroup
  );

  const donorRh = firstNonEmpty(
    resultData?.donor_rh_type,
    firstCrossmatch?.donorRh
  );

  return {
    recipientBloodGroup: normalizeBloodGroup(recipientAbo, recipientRh),

    hivStatus: firstNonEmpty(
      resultData?.hiv_status,
      resultData?.hiv,
      resultData?.HIV_status
    ),

    donorBloodGroup: normalizeBloodGroup(donorAbo, donorRh),

    donorBagNo: firstNonEmpty(
      resultData?.donor_bag_no,
      resultData?.donor_blood_bag_no,
      firstCrossmatch?.donorUnit
    ),

    hbsag: firstNonEmpty(
      resultData?.hbsag,
      resultData?.HBsAg,
      resultData?.hbsAg
    ),

    hcv: firstNonEmpty(resultData?.hcv, resultData?.HCV),

    vdrl: firstNonEmpty(resultData?.vdrl, resultData?.VDRL),

    rvs: firstNonEmpty(
      resultData?.rvs,
      resultData?.RVS,
      resultData?.hiv_status_rvs
    ),

    expiryDate: firstNonEmpty(
      resultData?.expiry_date,
      resultData?.expiryDate,
      firstCrossmatch?.expiryDate
    ),

    crossmatching: firstNonEmpty(
      resultData?.crossmatching,
      resultData?.cross_match,
      firstCrossmatch?.compatibility
    ),

    remarks: firstNonEmpty(resultData?.remarks),
  };
};

const hasMeaningfulValue = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

export default function BloodGroupingCrossmatchingResultEntry({
  registration = null,
  result = null,
  onSave,
  saving: externalSaving = false,
}) {
  /*
    The saved Blood Bank values may arrive either directly on the laboratory
    result row or inside laboratory_results.result JSON.
  */
  const resultData = useMemo(() => {
    const nested = extractNestedResult(result);

    return {
      ...nested,
      ...result,
      ...nested,
    };
  }, [result]);

  const patient = useMemo(
    () => ({
      patientId: firstNonEmpty(
        registration?.patient_id,
        resultData?.patient_id
      ),

      labNumber: firstNonEmpty(
        registration?.lab_number,
        resultData?.lab_number
      ),

      patientName: firstNonEmpty(
        registration?.full_name,
        registration?.patient_name,
        resultData?.patient_name
      ),

      sex: firstNonEmpty(registration?.sex, resultData?.sex),

      age: firstNonEmpty(registration?.age, resultData?.age),

      clinicalHistory: firstNonEmpty(
        registration?.clinical_history,
        resultData?.clinical_history
      ),
    }),
    [registration, resultData]
  );

  const initialForm = useMemo(
    () => buildInitialForm(resultData),
    [resultData]
  );

  const hasSavedPayload = useMemo(() => {
    const crossmatches = Array.isArray(resultData?.crossmatches)
      ? resultData.crossmatches
      : [];

    const firstCrossmatch = crossmatches[0] || {};

    return Boolean(
      result &&
        (
          hasMeaningfulValue(resultData?.abo_group) ||
          hasMeaningfulValue(resultData?.rh_type) ||
          hasMeaningfulValue(resultData?.recipient_abo_group) ||
          hasMeaningfulValue(resultData?.recipient_rh_type) ||
          hasMeaningfulValue(resultData?.hiv_status) ||
          hasMeaningfulValue(resultData?.hiv) ||
          hasMeaningfulValue(resultData?.donor_abo_group) ||
          hasMeaningfulValue(resultData?.donor_rh_type) ||
          hasMeaningfulValue(resultData?.donor_bag_no) ||
          hasMeaningfulValue(resultData?.hbsag) ||
          hasMeaningfulValue(resultData?.hcv) ||
          hasMeaningfulValue(resultData?.vdrl) ||
          hasMeaningfulValue(resultData?.rvs) ||
          hasMeaningfulValue(resultData?.expiry_date) ||
          hasMeaningfulValue(resultData?.crossmatching) ||
          hasMeaningfulValue(resultData?.remarks) ||
          hasMeaningfulValue(firstCrossmatch?.donorUnit) ||
          hasMeaningfulValue(firstCrossmatch?.compatibility)
        )
    );
  }, [result, resultData]);

  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(!hasSavedPayload);
  const [localSaving, setLocalSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const saving = externalSaving || localSaving;

  const updateField = (field, value) => {
    if (!isEditing) return;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm(buildInitialForm(resultData));
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.recipientBloodGroup) {
      setError("Please select the recipient's blood group.");
      return;
    }

    if (!form.hivStatus) {
      setError("Please enter/select the HIV status.");
      return;
    }

    if (!form.donorBloodGroup) {
      setError("Please select the donor's blood group.");
      return;
    }

    if (!form.donorBagNo.trim()) {
      setError("Please enter the donor blood bag number.");
      return;
    }

    if (!form.hbsag) {
      setError("Please enter/select the HBsAg result.");
      return;
    }

    if (!form.hcv) {
      setError("Please enter/select the HCV result.");
      return;
    }

    if (!form.vdrl) {
      setError("Please enter/select the VDRL result.");
      return;
    }

    if (!form.rvs) {
      setError("Please enter/select the RVS result.");
      return;
    }

    if (!form.expiryDate) {
      setError("Please enter the blood unit expiry date.");
      return;
    }

    if (!form.crossmatching) {
      setError("Please select the crossmatching result.");
      return;
    }

    const recipient = parseBloodGroup(form.recipientBloodGroup);
    const donor = parseBloodGroup(form.donorBloodGroup);

    const oldCrossmatches = Array.isArray(resultData?.crossmatches)
      ? resultData.crossmatches
      : [];

    const oldFirstCrossmatch = oldCrossmatches[0] || {};

    const updatedFirstCrossmatch = {
      ...oldFirstCrossmatch,
      donorUnit: form.donorBagNo.trim(),
      donorBloodGroup: donor.abo,
      donorRh: donor.rh,
      compatibility: form.crossmatching,
      expiryDate: form.expiryDate,
    };

    const crossmatches =
      oldCrossmatches.length > 0
        ? [updatedFirstCrossmatch, ...oldCrossmatches.slice(1)]
        : [updatedFirstCrossmatch];

    /*
      Keep the existing detailed payload fields while adding the simple
      report fields required by PEFA's current Grouping & Cross Matching form.
    */
    /*
      CRITICAL DATABASE PERSISTENCE RULE
      ----------------------------------
      The PEFA dashboard determines whether a laboratory result is saved by
      reading laboratory_results.result (or one of the scalar result columns).

      This is a structured Blood Bank result, so ALL Blood Bank fields must be
      stored inside the `result` JSON column. Sending these fields only as
      top-level columns can make the save callback succeed while the dashboard
      still sees result = null and therefore hides the record.

      Keep the existing detailed payload fields, but make the structured object
      the actual `result` value.
    */
    const structuredResult = {
      ...resultData,

      patient_id: patient.patientId || null,
      lab_number: patient.labNumber || null,
      patient_name: patient.patientName || null,
      sex: patient.sex || null,
      age: patient.age || null,
      clinical_history: patient.clinicalHistory || null,

      abo_group: recipient.abo,
      rh_type: recipient.rh,

      recipient_abo_group: recipient.abo,
      recipient_rh_type: recipient.rh,

      hiv_status: form.hivStatus,
      donor_abo_group: donor.abo,
      donor_rh_type: donor.rh,
      donor_bag_no: form.donorBagNo.trim(),

      hbsag: form.hbsag,
      hcv: form.hcv,
      vdrl: form.vdrl,
      rvs: form.rvs,

      expiry_date: form.expiryDate,
      crossmatching: form.crossmatching,

      crossmatches,

      remarks: form.remarks.trim(),
    };

    /* Never nest the previous laboratory_results.result inside itself. */
    delete structuredResult.result;

    const payload = {
      result: structuredResult,
      result_value: null,
      result_numeric: null,
      value: null,
    };

    try {
      setLocalSaving(true);

      if (typeof onSave === "function") {
        await onSave(payload);
      }

      setSuccess(
        hasSavedPayload
          ? "Grouping and crossmatching result updated successfully."
          : "Grouping and crossmatching result saved successfully."
      );

      if (hasSavedPayload) {
        setIsEditing(false);
      }
    } catch (saveError) {
      console.error(
        "BloodGroupingCrossmatchingResultEntry save:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save grouping and crossmatching result."
      );
    } finally {
      setLocalSaving(false);
    }
  };

  const selectStyle = {
    width: "100%",
    minHeight: 42,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 11px",
    background: isEditing ? "#ffffff" : "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 600,
    outline: "none",
    boxSizing: "border-box",
  };

  const inputStyle = {
    ...selectStyle,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: ".02em",
  };

  const fieldStyle = {
    minWidth: 0,
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #dbe3ec",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  };

  const sectionTitleStyle = {
    padding: "10px 14px",
    background: "#f1f5f9",
    borderBottom: "1px solid #dbe3ec",
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
        boxSizing: "border-box",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          padding: "14px 16px",
          borderRadius: 10,
          background: "#ffffff",
          border: "1px solid #dbe3ec",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#64748b",
              letterSpacing: ".08em",
            }}
          >
            PEFA LABORATORY
          </div>

          <h1
            style={{
              margin: "3px 0 0",
              fontSize: 21,
              lineHeight: 1.2,
              fontWeight: 900,
            }}
          >
            GROUPING AND CROSS MATCHING
          </h1>
        </div>

        {hasSavedPayload && !isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: 0,
              borderRadius: 8,
              padding: "9px 12px",
              background: "#0f766e",
              color: "#fff",
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <Pencil size={15} />
            Edit
          </button>
        )}

        {hasSavedPayload && isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "9px 12px",
              background: "#fff",
              color: "#334155",
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <X size={15} />
            Cancel
          </button>
        )}
      </div>

      {/* PATIENT INFORMATION */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Patient Information</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
            gap: 12,
            padding: 14,
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>Patient Name</label>
            <strong>{patient.patientName || "—"}</strong>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Lab Number</label>
            <strong>{patient.labNumber || "—"}</strong>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Sex</label>
            <strong>{patient.sex || "—"}</strong>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Age</label>
            <strong>{patient.age || "—"}</strong>
          </div>

          <div
            style={{
              ...fieldStyle,
              gridColumn: "1 / -1",
            }}
          >
            <label style={labelStyle}>Clinical History</label>
            <strong>{patient.clinicalHistory || "—"}</strong>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#047857",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {/* RECIPIENT */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Recipient</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 14,
            padding: 14,
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>Recipient's Blood Group</label>
            <select
              value={form.recipientBloodGroup}
              disabled={!isEditing || saving}
              onChange={(e) =>
                updateField("recipientBloodGroup", e.target.value)
              }
              style={selectStyle}
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUP_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>HIV Status</label>
            <select
              value={form.hivStatus}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("hivStatus", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select result</option>
              {SCREENING_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DONOR */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Donor / Blood Unit</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            padding: 14,
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>Donor's Blood Group</label>
            <select
              value={form.donorBloodGroup}
              disabled={!isEditing || saving}
              onChange={(e) =>
                updateField("donorBloodGroup", e.target.value)
              }
              style={selectStyle}
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUP_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Donor's Blood Bag No.</label>
            <input
              type="text"
              value={form.donorBagNo}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("donorBagNo", e.target.value)}
              placeholder="e.g. GSD 035"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>HBsAg</label>
            <select
              value={form.hbsag}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("hbsag", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select result</option>
              {SCREENING_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>HCV</label>
            <select
              value={form.hcv}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("hcv", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select result</option>
              {SCREENING_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>VDRL</label>
            <select
              value={form.vdrl}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("vdrl", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select result</option>
              {SCREENING_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>RVS</label>
            <select
              value={form.rvs}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("rvs", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select result</option>
              {SCREENING_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              disabled={!isEditing || saving}
              onChange={(e) => updateField("expiryDate", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* CROSSMATCH */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Cross Matching</div>

        <div style={{ padding: 14 }}>
          <div style={{ maxWidth: 360 }}>
            <label style={labelStyle}>Cross Matching Result</label>

            <select
              value={form.crossmatching}
              disabled={!isEditing || saving}
              onChange={(e) =>
                updateField("crossmatching", e.target.value)
              }
              style={{
                ...selectStyle,
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              <option value="">Select result</option>
              {COMPATIBILITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* OPTIONAL REMARKS */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Remarks (Optional)</div>

        <div style={{ padding: 14 }}>
          <textarea
            value={form.remarks}
            disabled={!isEditing || saving}
            onChange={(e) => updateField("remarks", e.target.value)}
            rows={2}
            placeholder="Optional laboratory remark"
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* ACTION */}
      {isEditing && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 2,
          }}
        >
          {hasSavedPayload && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                minHeight: 44,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#334155",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              <X size={17} />
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 44,
              padding: "0 18px",
              borderRadius: 8,
              border: 0,
              background: "#0f766e",
              color: "#fff",
              fontWeight: 900,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 3px 10px rgba(15, 118, 110, .18)",
            }}
          >
            {saving ? <Loader2 size={18} /> : <Save size={18} />}
            {saving
              ? "Saving..."
              : hasSavedPayload
                ? "Save Changes"
                : "Save Result"}
          </button>
        </div>
      )}
    </div>
  );
}
