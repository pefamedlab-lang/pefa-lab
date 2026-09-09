import { useEffect } from "react";

import TextAreaField from "../fields/TextAreaField";

import {
  generatePelvicReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generatePelvicImpression,
  generatePelvicRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function PelvicScanForm({
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
      generatePelvicReport(data);

    const impression =
      generatePelvicImpression(data);

    const recommendation =
      generatePelvicRecommendation(data);

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

  return (

    <div className="scan-form-grid">

      {/* ======================================
          UTERUS
      ====================================== */}

      <section className="scan-section">

        <h2>Uterus</h2>

        <TextAreaField
          label="Uterus"
          rows={3}
          value={data.uterus || ""}
          onChange={(value) =>
            setValue(
              "uterus",
              value
            )
          }
        />

        <TextAreaField
          label="Endometrium"
          rows={2}
          value={data.endometrium || ""}
          onChange={(value) =>
            setValue(
              "endometrium",
              value
            )
          }
        />

        <TextAreaField
          label="Cervix"
          rows={2}
          value={data.cervix || ""}
          onChange={(value) =>
            setValue(
              "cervix",
              value
            )
          }
        />

      </section>

      {/* ======================================
          OVARIES
      ====================================== */}

      <section className="scan-section">

        <h2>Ovaries</h2>

        <TextAreaField
          label="Right Ovary"
          rows={2}
          value={data.rightOvary || ""}
          onChange={(value) =>
            setValue(
              "rightOvary",
              value
            )
          }
        />

        <TextAreaField
          label="Left Ovary"
          rows={2}
          value={data.leftOvary || ""}
          onChange={(value) =>
            setValue(
              "leftOvary",
              value
            )
          }
        />

      </section>

      {/* ======================================
          ADNEXAL STRUCTURES
      ====================================== */}

      <section className="scan-section">

        <h2>Adnexal Structures</h2>

        <TextAreaField
          label="Adnexae"
          rows={2}
          value={data.adnexae || ""}
          onChange={(value) =>
            setValue(
              "adnexae",
              value
            )
          }
        />

        <TextAreaField
          label="Pouch of Douglas"
          rows={2}
          value={data.pouchOfDouglas || ""}
          onChange={(value) =>
            setValue(
              "pouchOfDouglas",
              value
            )
          }
        />

      </section>

      {/* ======================================
          URINARY BLADDER
      ====================================== */}

      <section className="scan-section">

        <h2>Urinary Bladder</h2>

        <TextAreaField
          label="Urinary Bladder"
          rows={2}
          value={data.bladder || ""}
          onChange={(value) =>
            setValue(
              "bladder",
              value
            )
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