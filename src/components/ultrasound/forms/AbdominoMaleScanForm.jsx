import { useEffect } from "react";

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";
import TextAreaField from "../fields/TextAreaField";

import {
  generateAbdominoMaleReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateAbdominoMaleImpression,
  generateAbdominoMaleRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function AbdominoMaleScanForm({
  data = {},
  onChange,
}) {

  /* ==========================================
     AUTO GENERATE REPORT
  ========================================== */

  useEffect(() => {

    const report =
      generateAbdominoMaleReport(data);

    const impression =
      generateAbdominoMaleImpression(data);

    const recommendation =
      generateAbdominoMaleRecommendation(data);

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

    <div className="scan-form">

      {/* ALL YOUR EXISTING FORM FIELDS GO HERE */}

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