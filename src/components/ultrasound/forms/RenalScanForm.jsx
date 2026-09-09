import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generateRenalReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateRenalImpression,
  generateRenalRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function RenalScanForm({
  data = {},
  onChange,
}) {

  /* ==========================================
      AUTO GENERATE REPORT & IMPRESSION
  ========================================== */

  useEffect(() => {

    const report =
      generateRenalReport(data);

    const impression =
      generateRenalImpression(data);

    const recommendation =
      generateRenalRecommendation(data);

    // Report
    if (
      report !== (data.report_text || "")
    ) {
      onChange(
        "report_text",
        report
      );
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

  const setValue = (
    key,
    value
  ) => {

    onChange(
      key,
      value
    );

  };

  return (

    <div className="scan-form">

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