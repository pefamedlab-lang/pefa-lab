import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generateSoftTissueReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateSoftTissueImpression,
  generateSoftTissueRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function SoftTissueScanForm({
  data = {},
  onChange,
}) {

  const setValue = (key, value) => {
    onChange(key, value);
  };

  /* ==========================================
      AUTO GENERATE REPORT & IMPRESSION
  ========================================== */

  useEffect(() => {

    const report =
      generateSoftTissueReport(data);

    const impression =
      generateSoftTissueImpression(data);

    const recommendation =
      generateSoftTissueRecommendation(data);

    if (report !== (data.report_text || "")) {
      onChange("report_text", report);
    }

    if (
      JSON.stringify(impression) !==
      JSON.stringify(data.impression || [])
    ) {
      onChange("impression", impression);
    }

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

  return (

    <div className="scan-form-grid">

      {/* ======================================
          SITE EXAMINED
      ====================================== */}

      <section className="scan-section">

        <h2>Site Examined</h2>

        <TextAreaField
          label="Anatomical Site"
          rows={2}
          value={data.site || ""}
          onChange={(value) =>
            setValue("site", value)
          }
        />

      </section>

      {/* ======================================
          SOFT TISSUE MASS
      ====================================== */}

      <section className="scan-section">

        <h2>Soft Tissue Mass</h2>

        <TextAreaField
          label="Mass Findings"
          rows={4}
          value={data.mass || ""}
          onChange={(value) =>
            setValue("mass", value)
          }
        />

      </section>

      {/* ======================================
          FLUID COLLECTION
      ====================================== */}

      <section className="scan-section">

        <h2>Fluid Collection / Abscess</h2>

        <TextAreaField
          label="Collection Findings"
          rows={3}
          value={data.collection || ""}
          onChange={(value) =>
            setValue("collection", value)
          }
        />

      </section>

      {/* ======================================
          FOREIGN BODY
      ====================================== */}

      <section className="scan-section">

        <h2>Foreign Body</h2>

        <TextAreaField
          label="Foreign Body Findings"
          rows={3}
          value={data.foreignBody || ""}
          onChange={(value) =>
            setValue("foreignBody", value)
          }
        />

      </section>

      {/* ======================================
          VASCULARITY
      ====================================== */}

      <section className="scan-section">

        <h2>Vascularity</h2>

        <TextAreaField
          label="Colour Doppler Findings"
          rows={3}
          value={data.vascularity || ""}
          onChange={(value) =>
            setValue("vascularity", value)
          }
        />

      </section>

      {/* ======================================
          SURROUNDING TISSUES
      ====================================== */}

      <section className="scan-section">

        <h2>Surrounding Tissues</h2>

        <TextAreaField
          label="Adjacent Structures"
          rows={3}
          value={data.surroundingTissues || ""}
          onChange={(value) =>
            setValue(
              "surroundingTissues",
              value
            )
          }
        />

      </section>

      {/* ======================================
          ADDITIONAL FINDINGS
      ====================================== */}

      <section className="scan-section">

        <h2>Additional Findings</h2>

        <TextAreaField
          label="Additional Findings"
          rows={4}
          value={data.additional_findings || ""}
          onChange={(value) =>
            setValue(
              "additional_findings",
              value
            )
          }
        />

      </section>

      {/* ======================================
          GENERATED FINDINGS
      ====================================== */}

      <section className="scan-section">

        <h2>Generated Findings</h2>

        <TextAreaField
          label="Generated Report"
          rows={18}
          value={data.report_text || ""}
          readOnly
        />

      </section>

      {/* ======================================
          IMPRESSION
      ====================================== */}

      <section className="scan-section">

        <h2>Impression</h2>

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

      </section>

      {/* ======================================
          RECOMMENDATION
      ====================================== */}

      <section className="scan-section">

        <h2>Recommendation</h2>

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

      </section>

    </div>

  );

}