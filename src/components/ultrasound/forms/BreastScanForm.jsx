import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generateBreastReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateBreastImpression,
  generateBreastRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function BreastScanForm({
  data = {},
  onChange,
}) {

  /* ==========================================
      AUTO GENERATE REPORT & IMPRESSION
  ========================================== */

  useEffect(() => {

    const report =
      generateBreastReport(data);

    const impression =
      generateBreastImpression(data);

    const recommendation =
      generateBreastRecommendation(data);

    // Report
    if (report !== (data.report_text || "")) {
      onChange("report_text", report);
    }

    // Impression
    if (
      JSON.stringify(impression) !==
      JSON.stringify(data.impression || [])
    ) {
      onChange(
        "impression",
        impression
      );
    }

    // Recommendation
    if (
      JSON.stringify(recommendation) !==
      JSON.stringify(data.recommendation || [])
    ) {
      onChange(
        "recommendation",
        recommendation
      );
    }

  }, [data, onChange]);

  const setValue = (key, value) => {
    onChange(key, value);
  };

  return (

    <div className="scan-form-grid">

      {/* ======================================
          BREAST EXAMINATION
      ====================================== */}

      <section className="scan-section">

        <h2>Breast Examination</h2>

        <h3>Right Breast</h3>

        <TextAreaField
          rows={3}
          placeholder="Right breast findings..."
          value={data.rightBreast || ""}
          onChange={(value) =>
            setValue("rightBreast", value)
          }
        />

        <h3>Left Breast</h3>

        <TextAreaField
          rows={3}
          placeholder="Left breast findings..."
          value={data.leftBreast || ""}
          onChange={(value) =>
            setValue("leftBreast", value)
          }
        />

        <h3>Fibroglandular Tissue</h3>

        <TextAreaField
          rows={3}
          placeholder="Fibroglandular tissue findings..."
          value={data.fibroglandularTissue || ""}
          onChange={(value) =>
            setValue("fibroglandularTissue", value)
          }
        />

        <h3>Masses / Nodules</h3>

        <TextAreaField
          rows={3}
          placeholder="Masses or nodules..."
          value={data.masses || ""}
          onChange={(value) =>
            setValue("masses", value)
          }
        />

        <h3>Calcifications</h3>

        <TextAreaField
          rows={2}
          placeholder="Calcifications..."
          value={data.calcifications || ""}
          onChange={(value) =>
            setValue("calcifications", value)
          }
        />

      </section>

      {/* ======================================
          REGIONAL STRUCTURES
      ====================================== */}

      <section className="scan-section">

        <h2>Regional Structures</h2>

        <h3>Retroareolar Region</h3>

        <TextAreaField
          rows={2}
          placeholder="Retroareolar findings..."
          value={data.retroareolarRegion || ""}
          onChange={(value) =>
            setValue("retroareolarRegion", value)
          }
        />

        <h3>Skin Thickness</h3>

        <TextAreaField
          rows={2}
          placeholder="Skin findings..."
          value={data.skinThickness || ""}
          onChange={(value) =>
            setValue("skinThickness", value)
          }
        />

        <h3>Ducts</h3>

        <TextAreaField
          rows={2}
          placeholder="Ductal findings..."
          value={data.ducts || ""}
          onChange={(value) =>
            setValue("ducts", value)
          }
        />

        <h3>Axillary Lymph Nodes</h3>

        <TextAreaField
          rows={2}
          placeholder="Axillary lymph nodes..."
          value={data.axillaryNodes || ""}
          onChange={(value) =>
            setValue("axillaryNodes", value)
          }
        />

      </section>

      {/* ======================================
          GENERATED FINDINGS
      ====================================== */}

      <TextAreaField
        label="Generated Findings"
        rows={18}
        value={data.report_text || ""}
        readOnly
      />

      {/* ======================================
          IMPRESSION
      ====================================== */}

      <TextAreaField
        label="Impression"
        rows={6}
        value={
          Array.isArray(data.impression)
            ? data.impression.join("\n")
            : data.impression || ""
        }
        readOnly
      />

      {/* ======================================
          RECOMMENDATION
      ====================================== */}

      <TextAreaField
        label="Recommendation"
        rows={5}
        value={
          Array.isArray(data.recommendation)
            ? data.recommendation.join("\n")
            : data.recommendation || ""
        }
        readOnly
      />

    </div>

  );

}