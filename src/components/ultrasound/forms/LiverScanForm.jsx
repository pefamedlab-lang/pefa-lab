import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generateLiverReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateLiverImpression,
  generateLiverRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function LiverScanForm({
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
      generateLiverReport(data);

    const impression =
      generateLiverImpression(data);

    const recommendation =
      generateLiverRecommendation(data);

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
          LIVER
      ====================================== */}

      <section className="scan-section">

        <h2>Liver</h2>

        <TextAreaField
          label="Liver Size"
          rows={2}
          value={data.liverSize || ""}
          onChange={(value) =>
            setValue("liverSize", value)
          }
        />

        <TextAreaField
          label="Liver Echotexture"
          rows={2}
          value={data.liverEchotexture || ""}
          onChange={(value) =>
            setValue(
              "liverEchotexture",
              value
            )
          }
        />

        <TextAreaField
          label="Liver Margins"
          rows={2}
          value={data.liverMargins || ""}
          onChange={(value) =>
            setValue(
              "liverMargins",
              value
            )
          }
        />

        <TextAreaField
          label="Focal Lesions"
          rows={3}
          value={data.focalLesions || ""}
          onChange={(value) =>
            setValue(
              "focalLesions",
              value
            )
          }
        />

      </section>

      {/* ======================================
          BILIARY SYSTEM
      ====================================== */}

      <section className="scan-section">

        <h2>Biliary System</h2>

        <TextAreaField
          label="Intrahepatic Bile Ducts"
          rows={2}
          value={data.intrahepaticBileDucts || ""}
          onChange={(value) =>
            setValue(
              "intrahepaticBileDucts",
              value
            )
          }
        />

        <TextAreaField
          label="Gall Bladder"
          rows={3}
          value={data.gallBladder || ""}
          onChange={(value) =>
            setValue(
              "gallBladder",
              value
            )
          }
        />

        <TextAreaField
          label="Common Bile Duct"
          rows={2}
          value={data.commonBileDuct || ""}
          onChange={(value) =>
            setValue(
              "commonBileDuct",
              value
            )
          }
        />

      </section>

      {/* ======================================
          VASCULAR STRUCTURES
      ====================================== */}

      <section className="scan-section">

        <h2>Vascular Structures</h2>

        <TextAreaField
          label="Portal Vein"
          rows={2}
          value={data.portalVein || ""}
          onChange={(value) =>
            setValue(
              "portalVein",
              value
            )
          }
        />

        <TextAreaField
          label="Hepatic Veins"
          rows={2}
          value={data.hepaticVeins || ""}
          onChange={(value) =>
            setValue(
              "hepaticVeins",
              value
            )
          }
        />

      </section>

      {/* ======================================
          ASSOCIATED FINDINGS
      ====================================== */}

      <section className="scan-section">

        <h2>Associated Findings</h2>

        <TextAreaField
          label="Ascites"
          rows={2}
          value={data.ascites || ""}
          onChange={(value) =>
            setValue(
              "ascites",
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