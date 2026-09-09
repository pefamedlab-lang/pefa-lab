import { useEffect } from "react";

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";
import TextAreaField from "../fields/TextAreaField";

import {
  generateProstateReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateProstateImpression,
  generateProstateRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function ProstateScanForm({
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
      generateProstateReport(data);

    const impression =
      generateProstateImpression(data);

    const recommendation =
      generateProstateRecommendation(data);

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
      onChange("recommendation", recommendation);
    }

  }, [data, onChange]);

  return (

    <div className="scan-form-grid">

      {/* ======================================
          PROSTATE
      ====================================== */}

      <section className="scan-section">

        <h2>Prostate</h2>

        <div className="scan-grid">

          <NumberField
            label="Length"
            unit="cm"
            value={data.length}
            onChange={(value) =>
              setValue("length", value)
            }
          />

          <NumberField
            label="Width"
            unit="cm"
            value={data.width}
            onChange={(value) =>
              setValue("width", value)
            }
          />

          <NumberField
            label="Height"
            unit="cm"
            value={data.height}
            onChange={(value) =>
              setValue("height", value)
            }
          />

          <NumberField
            label="Volume"
            unit="ml"
            value={data.volume}
            onChange={(value) =>
              setValue("volume", value)
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.echotexture}
            options={[
              "Homogeneous",
              "Heterogeneous",
            ]}
            onChange={(value) =>
              setValue("echotexture", value)
            }
          />

          <DropdownField
            label="Capsule"
            value={data.capsule}
            options={[
              "Intact",
              "Irregular",
            ]}
            onChange={(value) =>
              setValue("capsule", value)
            }
          />

          <DropdownField
            label="Median Lobe"
            value={data.median_lobe}
            options={[
              "Normal",
              "Enlarged",
            ]}
            onChange={(value) =>
              setValue("median_lobe", value)
            }
          />

          <DropdownField
            label="Seminal Vesicles"
            value={data.seminal_vesicles}
            options={[
              "Normal",
              "Enlarged",
              "Asymmetrical",
              "Dilated",
              "Absent",
            ]}
            onChange={(value) =>
              setValue("seminal_vesicles", value)
            }
          />

          <DropdownField
            label="Calcification"
            value={data.calcification}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value) =>
              setValue("calcification", value)
            }
          />

          <DropdownField
            label="Prostate Nodule"
            value={data.prostate_nodule}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value) =>
              setValue("prostate_nodule", value)
            }
          />

        </div>

      </section>

      {/* ======================================
          URINARY BLADDER
      ====================================== */}

      <section className="scan-section">

        <h2>Urinary Bladder</h2>

        <div className="scan-grid">

          <DropdownField
            label="Distension"
            value={data.bladder_distension}
            options={[
              "Well Distended",
              "Partially Distended",
              "Poorly Distended",
            ]}
            onChange={(value) =>
              setValue("bladder_distension", value)
            }
          />

          <DropdownField
            label="Wall Thickness"
            value={data.bladder_wall}
            options={[
              "Normal",
              "Thickened",
            ]}
            onChange={(value) =>
              setValue("bladder_wall", value)
            }
          />

          <DropdownField
            label="Stone"
            value={data.bladder_stone}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value) =>
              setValue("bladder_stone", value)
            }
          />

          <DropdownField
            label="Mass"
            value={data.bladder_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value) =>
              setValue("bladder_mass", value)
            }
          />

          <NumberField
            label="Post-Void Residual"
            unit="ml"
            value={data.residual_urine}
            onChange={(value) =>
              setValue("residual_urine", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Bladder Findings"
          rows={3}
          value={data.bladder_notes || ""}
          onChange={(value) =>
            setValue("bladder_notes", value)
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
            setValue("additional_findings", value)
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