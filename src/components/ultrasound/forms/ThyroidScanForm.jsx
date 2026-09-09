import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generateThyroidReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateThyroidImpression,
  generateThyroidRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function ThyroidScanForm({
  data = {},
  onChange,
}) {

  /* ==========================================
      AUTO GENERATE REPORT & IMPRESSION
  ========================================== */

  useEffect(() => {

    const report =
      generateThyroidReport(data);

    const impression =
      generateThyroidImpression(data);

    const recommendation =
      generateThyroidRecommendation(data);

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
          THYROID GLAND
      ====================================== */}

      <section className="scan-section">

        <h2>Thyroid Gland</h2>

        <h3>Right Thyroid Lobe</h3>

        <TextAreaField
          rows={3}
          placeholder="Right thyroid lobe findings..."
          value={data.rightLobe || ""}
          onChange={(value) =>
            setValue("rightLobe", value)
          }
        />

        <h3>Left Thyroid Lobe</h3>

        <TextAreaField
          rows={3}
          placeholder="Left thyroid lobe findings..."
          value={data.leftLobe || ""}
          onChange={(value) =>
            setValue("leftLobe", value)
          }
        />

        <h3>Isthmus</h3>

        <TextAreaField
          rows={2}
          placeholder="Isthmus findings..."
          value={data.isthmus || ""}
          onChange={(value) =>
            setValue("isthmus", value)
          }
        />

        <h3>Thyroid Echotexture</h3>

        <TextAreaField
          rows={2}
          placeholder="Thyroid echotexture..."
          value={data.echotexture || ""}
          onChange={(value) =>
            setValue("echotexture", value)
          }
        />

        <h3>Nodules</h3>

        <TextAreaField
          rows={3}
          placeholder="Nodules and measurements..."
          value={data.nodules || ""}
          onChange={(value) =>
            setValue("nodules", value)
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

        <h3>Vascularity</h3>

        <TextAreaField
          rows={2}
          placeholder="Doppler vascularity findings..."
          value={data.vascularity || ""}
          onChange={(value) =>
            setValue("vascularity", value)
          }
        />

      </section>

      {/* ======================================
          REGIONAL ASSESSMENT
      ====================================== */}

      <section className="scan-section">

        <h2>Regional Assessment</h2>

        <h3>Cervical Lymph Nodes</h3>

        <TextAreaField
          rows={2}
          placeholder="Cervical lymph nodes..."
          value={data.cervicalNodes || ""}
          onChange={(value) =>
            setValue("cervicalNodes", value)
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