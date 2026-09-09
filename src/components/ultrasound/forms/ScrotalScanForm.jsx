

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";
import TextAreaField from "../fields/TextAreaField";


import { useEffect } from "react";

import {
  generateScrotalReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateScrotalImpression,
  generateScrotalRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function ScrotalScanForm({
  patient,
  data = {},
  onChange,
}) {

/* ==========================================
   AUTO GENERATE REPORT & IMPRESSION
========================================== */

useEffect(() => {

  const report = generateScrotalReport(data);

  const impression = generateScrotalImpression(data);

  const recommendation =
    generateScrotalRecommendation(data);

  // Report
  if (report !== (data.report_text || "")) {
    onChange("report_text", report);
  }

  // Impression
  if (
    JSON.stringify(impression) !==
    JSON.stringify(data.impression || [])
  ) {
    onChange("impression", impression);
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

/* ==========================================
   HELPER
========================================== */

const setValue = (key, value) => {
  onChange(key, value);
};

return (

  <div className="scan-form">

    {/* ======================================
        RIGHT TESTIS
    ====================================== */}

      <div className="scan-section">

        <h3>Right Testis</h3>

        <div className="scan-grid">

          <DropdownField
            label="Position"
            value={data.right_testis_position}
            options={[
              "Normal",
              "Undescended",
              "Ectopic",
            ]}
            onChange={(value)=>
              setValue(
                "right_testis_position",
                value
              )
            }
          />

          <DropdownField
            label="Size"
            value={data.right_testis_size}
            options={[
              "Normal",
              "Enlarged",
              "Small",
            ]}
            onChange={(value)=>
              setValue(
                "right_testis_size",
                value
              )
            }
          />

          <NumberField
            label="Length"
            unit="mm"
            value={data.right_length}
            onChange={(value)=>
              setValue(
                "right_length",
                value
              )
            }
          />

          <NumberField
            label="Width"
            unit="mm"
            value={data.right_width}
            onChange={(value)=>
              setValue(
                "right_width",
                value
              )
            }
          />

          <NumberField
            label="Height"
            unit="mm"
            value={data.right_height}
            onChange={(value)=>
              setValue(
                "right_height",
                value
              )
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.right_testis_echo}
            options={[
              "Homogeneous",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue(
                "right_testis_echo",
                value
              )
            }
          />

          <DropdownField
            label="Contour"
            value={data.right_testis_contour}
            options={[
              "Smooth",
              "Irregular",
            ]}
            onChange={(value)=>
              setValue(
                "right_testis_contour",
                value
              )
            }
          />

          <DropdownField
            label="Mass"
            value={data.right_testis_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_testis_mass",
                value
              )
            }
          />

          <DropdownField
            label="Microlithiasis"
            value={data.right_microlithiasis}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_microlithiasis",
                value
              )
            }
          />

          <DropdownField
            label="Calcification"
            value={data.right_calcification}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_calcification",
                value
              )
            }
          />

          <DropdownField
            label="Vascularity"
            value={data.right_vascularity}
            options={[
              "Normal",
              "Increased",
              "Reduced",
              "Absent",
            ]}
            onChange={(value)=>
              setValue(
                "right_vascularity",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          LEFT TESTIS
      ====================================== */}

      <div className="scan-section">

        <h3>Left Testis</h3>

        <div className="scan-grid">

          <DropdownField
            label="Position"
            value={data.left_testis_position}
            options={[
              "Normal",
              "Undescended",
              "Ectopic",
            ]}
            onChange={(value)=>
              setValue(
                "left_testis_position",
                value
              )
            }
          />

          <DropdownField
            label="Size"
            value={data.left_testis_size}
            options={[
              "Normal",
              "Enlarged",
              "Small",
            ]}
            onChange={(value)=>
              setValue(
                "left_testis_size",
                value
              )
            }
          />

          <NumberField
            label="Length"
            unit="mm"
            value={data.left_length}
            onChange={(value)=>
              setValue(
                "left_length",
                value
              )
            }
          />

          <NumberField
            label="Width"
            unit="mm"
            value={data.left_width}
            onChange={(value)=>
              setValue(
                "left_width",
                value
              )
            }
          />

          <NumberField
            label="Height"
            unit="mm"
            value={data.left_height}
            onChange={(value)=>
              setValue(
                "left_height",
                value
              )
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.left_testis_echo}
            options={[
              "Homogeneous",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue(
                "left_testis_echo",
                value
              )
            }
          />

          <DropdownField
            label="Contour"
            value={data.left_testis_contour}
            options={[
              "Smooth",
              "Irregular",
            ]}
            onChange={(value)=>
              setValue(
                "left_testis_contour",
                value
              )
            }
          />


          <DropdownField
            label="Mass"
            value={data.left_testis_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_testis_mass",
                value
              )
            }
          />

          <DropdownField
            label="Microlithiasis"
            value={data.left_microlithiasis}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_microlithiasis",
                value
              )
            }
          />

          <DropdownField
            label="Calcification"
            value={data.left_calcification}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_calcification",
                value
              )
            }
          />

          <DropdownField
            label="Vascularity"
            value={data.left_vascularity}
            options={[
              "Normal",
              "Increased",
              "Reduced",
              "Absent",
            ]}
            onChange={(value)=>
              setValue(
                "left_vascularity",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          RIGHT EPIDIDYMIS
      ====================================== */}

      <div className="scan-section">

        <h3>Right Epididymis</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.right_epi_size}
            options={[
              "Normal",
              "Enlarged",
              "Atrophic",
            ]}
            onChange={(value)=>
              setValue(
                "right_epi_size",
                value
              )
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.right_epi_echo}
            options={[
              "Homogeneous",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue(
                "right_epi_echo",
                value
              )
            }
          />

          <DropdownField
            label="Cyst"
            value={data.right_epi_cyst}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_epi_cyst",
                value
              )
            }
          />

          <DropdownField
            label="Inflammation"
            value={data.right_epididymitis}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_epididymitis",
                value
              )
            }
          />

          <DropdownField
            label="Vascularity"
            value={data.right_epi_flow}
            options={[
              "Normal",
              "Increased",
              "Reduced",
            ]}
            onChange={(value)=>
              setValue(
                "right_epi_flow",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          LEFT EPIDIDYMIS
      ====================================== */}

      <div className="scan-section">

        <h3>Left Epididymis</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.left_epi_size}
            options={[
              "Normal",
              "Enlarged",
              "Atrophic",
            ]}
            onChange={(value)=>
              setValue(
                "left_epi_size",
                value
              )
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.left_epi_echo}
            options={[
              "Homogeneous",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue(
                "left_epi_echo",
                value
              )
            }
          />

          <DropdownField
            label="Cyst"
            value={data.left_epi_cyst}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_epi_cyst",
                value
              )
            }
          />

          <DropdownField
            label="Inflammation"
            value={data.left_epididymitis}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_epididymitis",
                value
              )
            }
          />

          <DropdownField
            label="Vascularity"
            value={data.left_epi_flow}
            options={[
              "Normal",
              "Increased",
              "Reduced",
            ]}
            onChange={(value)=>
              setValue(
                "left_epi_flow",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          SPERMATIC CORDS
      ====================================== */}

      <div className="scan-section">

        <h3>Spermatic Cords</h3>

        <div className="scan-grid">

          <DropdownField
            label="Right Cord"
            value={data.right_cord}
            options={[
              "Normal",
              "Thickened",
              "Twisted",
            ]}
            onChange={(value)=>
              setValue(
                "right_cord",
                value
              )
            }
          />

          <DropdownField
            label="Left Cord"
            value={data.left_cord}
            options={[
              "Normal",
              "Thickened",
              "Twisted",
            ]}
            onChange={(value)=>
              setValue(
                "left_cord",
                value
              )
            }
          />

        </div>

      </div>


      {/* ======================================
          HYDROCELE
      ====================================== */}

      <div className="scan-section">

        <h3>Hydrocele</h3>

        <div className="scan-grid">

          <DropdownField
            label="Right Hydrocele"
            value={data.right_hydrocele}
            options={[
              "Absent",
              "Small",
              "Moderate",
              "Large",
            ]}
            onChange={(value)=>
              setValue(
                "right_hydrocele",
                value
              )
            }
          />

          <DropdownField
            label="Left Hydrocele"
            value={data.left_hydrocele}
            options={[
              "Absent",
              "Small",
              "Moderate",
              "Large",
            ]}
            onChange={(value)=>
              setValue(
                "left_hydrocele",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          VARICOCELE
      ====================================== */}

      <div className="scan-section">

        <h3>Varicocele</h3>

        <div className="scan-grid">

          <DropdownField
            label="Right Varicocele"
            value={data.right_varicocele}
            options={[
              "Absent",
              "Grade I",
              "Grade II",
              "Grade III",
            ]}
            onChange={(value)=>
              setValue(
                "right_varicocele",
                value
              )
            }
          />

          <DropdownField
            label="Left Varicocele"
            value={data.left_varicocele}
            options={[
              "Absent",
              "Grade I",
              "Grade II",
              "Grade III",
            ]}
            onChange={(value)=>
              setValue(
                "left_varicocele",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          SCROTAL WALL
      ====================================== */}

      <div className="scan-section">

        <h3>Scrotal Wall</h3>

        <div className="scan-grid">

          <DropdownField
            label="Thickness"
            value={data.scrotal_wall}
            options={[
              "Normal",
              "Thickened",
              "Oedematous",
            ]}
            onChange={(value)=>
              setValue(
                "scrotal_wall",
                value
              )
            }
          />

          <DropdownField
            label="Skin"
            value={data.scrotal_skin}
            options={[
              "Normal",
              "Inflamed",
              "Cellulitis",
            ]}
            onChange={(value)=>
              setValue(
                "scrotal_skin",
                value
              )
            }
          />

        </div>

      </div>

      {/* ======================================
          SCROTAL SAC
      ====================================== */}

      <div className="scan-section">

        <h3>Scrotal Sac</h3>

        <div className="scan-grid">

          <DropdownField
            label="Fluid Collection"
            value={data.scrotal_fluid}
            options={[
              "Absent",
              "Minimal",
              "Moderate",
              "Large",
            ]}
            onChange={(value)=>
              setValue(
                "scrotal_fluid",
                value
              )
            }
          />

          <DropdownField
            label="Septations"
            value={data.scrotal_septation}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "scrotal_septation",
                value
              )
            }
          />

          <DropdownField
            label="Collection"
            value={data.scrotal_collection}
            options={[
              "None",
              "Haematoma",
              "Abscess",
            ]}
            onChange={(value)=>
              setValue(
                "scrotal_collection",
                value
              )
            }
          />

        </div>

      </div>

    {/* ======================================
          ADDITIONAL FINDINGS
      ====================================== */}

      <TextAreaField
        label="Additional Findings"
        rows={5}
        value={data.additional_findings || ""}
        onChange={(value) =>
          setValue(
            "additional_findings",
            value
          )
        }
      />

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