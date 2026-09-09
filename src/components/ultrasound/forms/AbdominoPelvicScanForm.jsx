import DropdownField from "../fields/DropdownField";
import MultiSelectField from "../fields/MultiSelectField";
import TextAreaField from "../fields/TextAreaField";
import NumberField from "../fields/NumberField";


import { useEffect } from "react";

import {
  generateAbdominoPelvicReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateAbdominoPelvicImpression,
  generateAbdominoPelvicRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";

export default function AbdominoPelvicScanForm({
  data = {},
  onChange,
}) {
  const setValue = (key, value) => {
    onChange(key, value);
  };

/* ======================================
   AUTO GENERATE REPORT
====================================== */

useEffect(() => {

  const report =
    generateAbdominoPelvicReport(data);

  const impression =
    generateAbdominoPelvicImpression(data);

  const recommendation =
    generateAbdominoPelvicRecommendation(data);

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
  <div className="scan-form">


      {/* ======================================
          UPPER ABDOMEN
      ====================================== */}

      <div className="scan-section">

        <h2>Upper Abdomen</h2>

        {/* ======================================
            LIVER
        ====================================== */}

        <h3>Liver</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.liver_size}
            options={[
              "Normal",
              "Enlarged",
              "Reduced",
            ]}
            onChange={(value)=>
              setValue("liver_size", value)
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.liver_echo}
            options={[
              "Normal",
              "Increased",
              "Coarse",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue("liver_echo", value)
            }
          />

          <DropdownField
            label="Surface"
            value={data.liver_surface}
            options={[
              "Smooth",
              "Irregular",
              "Nodular",
            ]}
            onChange={(value)=>
              setValue("liver_surface", value)
            }
          />

          <DropdownField
            label="Focal Lesion"
            value={data.liver_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("liver_mass", value)
            }
          />

          <DropdownField
            label="Intrahepatic Bile Ducts"
            value={data.biliary}
            options={[
              "Absent",
              "Mild",
              "Moderate",
              "Severe",
            ]}
            onChange={(value)=>
              setValue("biliary", value)
            }
          />

          <DropdownField
            label="Portal Vein"
            value={data.portal_vein}
            options={[
              "Normal",
              "Dilated",
              "Thrombosed",
            ]}
            onChange={(value)=>
              setValue("portal_vein", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Liver Findings"
          rows={3}
          value={data.liver_notes || ""}
          onChange={(value)=>
            setValue("liver_notes", value)
          }
        />

        {/* ======================================
            GALL BLADDER
        ====================================== */}

        <h3>Gall Bladder</h3>

        <div className="scan-grid">

          <DropdownField
            label="Appearance"
            value={data.gb}
            options={[
              "Normal",
              "Stone Seen",
              "Sludge",
              "Wall Thickening",
              "Contracted",
            ]}
            onChange={(value)=>
              setValue("gb", value)
            }
          />

          <DropdownField
            label="Wall Thickness"
            value={data.gb_wall}
            options={[
              "Normal",
              "Thickened",
            ]}
            onChange={(value)=>
              setValue("gb_wall", value)
            }
          />

          <DropdownField
            label="Pericholecystic Fluid"
            value={data.gb_fluid}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("gb_fluid", value)
            }
          />

          <DropdownField
            label="Sonographic Murphy"
            value={data.gb_murphy}
            options={[
              "Negative",
              "Positive",
            ]}
            onChange={(value)=>
              setValue("gb_murphy", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Gall Bladder Findings"
          rows={3}
          value={data.gb_notes || ""}
          onChange={(value)=>
            setValue("gb_notes", value)
          }
        />

        {/* ======================================
            CBD
        ====================================== */}

        <DropdownField
          label="Common Bile Duct (CBD)"
          value={data.cbd}
          options={[
            "Normal",
            "Dilated",
            "Calculus Seen",
            "Obstructed",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue("cbd", value)
          }
        />

        <textarea
          rows={2}
          placeholder="Additional CBD findings..."
          value={data.cbdNote || ""}
          onChange={(e) =>
            setValue(
              "cbdNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            PORTAL VEIN
        ====================================== */}

        <DropdownField
          label="Portal Vein"
          value={data.portalVein}
          options={[
            "Normal",
            "Dilated",
            "Thrombosis",
            "Portal Hypertension",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue(
              "portalVein",
              value
            )
          }
        />

        <textarea
          rows={2}
          placeholder="Additional portal vein findings..."
          value={data.portalVeinNote || ""}
          onChange={(e) =>
            setValue(
              "portalVeinNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            ABDOMINAL AORTA
        ====================================== */}

        <DropdownField
          label="Abdominal Aorta"
          value={data.aorta}
          options={[
            "Normal",
            "Aneurysm",
            "Atherosclerotic",
            "Dilated",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue("aorta", value)
          }
        />

        <textarea
          rows={2}
          placeholder="Additional abdominal aorta findings..."
          value={data.aortaNote || ""}
          onChange={(e) =>
            setValue(
              "aortaNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            IVC
        ====================================== */}

        <DropdownField
          label="Inferior Vena Cava (IVC)"
          value={data.ivc}
          options={[
            "Normal",
            "Dilated",
            "Collapsed",
            "Thrombosis",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue("ivc", value)
          }
        />

        <textarea
          rows={2}
          placeholder="Additional IVC findings..."
          value={data.ivcNote || ""}
          onChange={(e) =>
            setValue(
              "ivcNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            STOMACH
        ====================================== */}

        <DropdownField
          label="Stomach"
          value={data.stomach}
          options={[
            "Normal",
            "Distended",
            "Wall Thickening",
            "Mass",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue(
              "stomach",
              value
            )
          }
        />

        <textarea
          rows={2}
          placeholder="Additional stomach findings..."
          value={data.stomachNote || ""}
          onChange={(e) =>
            setValue(
              "stomachNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            BOWEL LOOPS
        ====================================== */}

        <DropdownField
          label="Bowel Loops"
          value={data.bowelLoops}
          options={[
            "Normal",
            "Dilated",
            "Thickened",
            "Reduced Peristalsis",
            "Increased Peristalsis",
            "Mass",
            "Not Well Visualized",
          ]}
          onChange={(value) =>
            setValue(
              "bowelLoops",
              value
            )
          }
        />

        <textarea
          rows={2}
          placeholder="Additional bowel loop findings..."
          value={data.bowelLoopsNote || ""}
          onChange={(e) =>
            setValue(
              "bowelLoopsNote",
              e.target.value
            )
          }
        />

        {/* ======================================
            PANCREAS
        ====================================== */}

        <h3>Pancreas</h3>

        <div className="scan-grid">

          <DropdownField
            label="Appearance"
            value={data.pancreas}
            options={[
              "Normal",
              "Bulky",
              "Atrophic",
              "Poorly Visualized",
            ]}
            onChange={(value)=>
              setValue("pancreas", value)
            }
          />

          <DropdownField
            label="Echogenicity"
            value={data.pancreas_echo}
            options={[
              "Normal",
              "Hypoechoic",
              "Hyperechoic",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue("pancreas_echo", value)
            }
          />

          <DropdownField
            label="Mass"
            value={data.pancreas_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("pancreas_mass", value)
            }
          />

          <DropdownField
            label="Pancreatic Duct"
            value={data.pancreatic_duct}
            options={[
              "Normal",
              "Dilated",
            ]}
            onChange={(value)=>
              setValue("pancreatic_duct", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Pancreatic Findings"
          rows={3}
          value={data.pancreas_notes || ""}
          onChange={(value)=>
            setValue("pancreas_notes", value)
          }
        />

        {/* ======================================
            SPLEEN
        ====================================== */}

        <h3>Spleen</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.spleen}
            options={[
              "Normal",
              "Enlarged",
            ]}
            onChange={(value)=>
              setValue("spleen", value)
            }
          />

          <DropdownField
            label="Echotexture"
            value={data.spleen_echo}
            options={[
              "Normal",
              "Heterogeneous",
            ]}
            onChange={(value)=>
              setValue("spleen_echo", value)
            }
          />

          <DropdownField
            label="Focal Lesion"
            value={data.spleen_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("spleen_mass", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Splenic Findings"
          rows={3}
          value={data.spleen_notes || ""}
          onChange={(value)=>
            setValue("spleen_notes", value)
          }
        />

        {/* ======================================
            RIGHT KIDNEY
        ====================================== */}

        <h3>Right Kidney</h3>

        <div className="scan-grid">

          <NumberField
            label="Length"
            unit="cm"
            value={data.right_kidney_length}
            onChange={(value)=>
              setValue("right_kidney_length", value)
            }
          />

          <DropdownField
            label="Cortical Thickness"
            value={data.right_cortex}
            options={[
              "Normal",
              "Reduced",
            ]}
            onChange={(value)=>
              setValue("right_cortex", value)
            }
          />

          <DropdownField
            label="CMD"
            value={data.right_cmd}
            options={[
              "Preserved",
              "Poor",
            ]}
            onChange={(value)=>
              setValue("right_cmd", value)
            }
          />

          <DropdownField
            label="Hydronephrosis"
            value={data.right_hydro}
            options={[
              "Absent",
              "Mild",
              "Moderate",
              "Severe",
            ]}
            onChange={(value)=>
              setValue("right_hydro", value)
            }
          />

          <DropdownField
            label="Calculus"
            value={data.right_stone}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("right_stone", value)
            }
          />

          <DropdownField
            label="Mass"
            value={data.right_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("right_mass", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Right Kidney Findings"
          rows={3}
          value={data.right_kidney_notes || ""}
          onChange={(value)=>
            setValue("right_kidney_notes", value)
          }
        />

        {/* ======================================
            LEFT KIDNEY
        ====================================== */}

        <h3>Left Kidney</h3>

        <div className="scan-grid">

          <NumberField
            label="Length"
            unit="cm"
            value={data.left_kidney_length}
            onChange={(value)=>
              setValue("left_kidney_length", value)
            }
          />

          <DropdownField
            label="Cortical Thickness"
            value={data.left_cortex}
            options={[
              "Normal",
              "Reduced",
            ]}
            onChange={(value)=>
              setValue("left_cortex", value)
            }
          />

          <DropdownField
            label="CMD"
            value={data.left_cmd}
            options={[
              "Preserved",
              "Poor",
            ]}
            onChange={(value)=>
              setValue("left_cmd", value)
            }
          />

          <DropdownField
            label="Hydronephrosis"
            value={data.left_hydro}
            options={[
              "Absent",
              "Mild",
              "Moderate",
              "Severe",
            ]}
            onChange={(value)=>
              setValue("left_hydro", value)
            }
          />

          <DropdownField
            label="Calculus"
            value={data.left_stone}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("left_stone", value)
            }
          />

          <DropdownField
            label="Mass"
            value={data.left_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue("left_mass", value)
            }
          />

        </div>

        <TextAreaField
          label="Additional Left Kidney Findings"
          rows={3}
          value={data.left_kidney_notes || ""}
          onChange={(value)=>
            setValue("left_kidney_notes", value)
          }
        />

      </div>

      {/* ======================================
          PELVIS
      ====================================== */}

      <div className="scan-section">

        <h2>Pelvis</h2>

        {/* ======================================
            URINARY BLADDER
        ====================================== */}

        <h3>Urinary Bladder</h3>

        <div className="scan-grid">

          <DropdownField
            label="Distension"
            value={data.bladder_distension}
            options={[
              "Well Distended",
              "Partially Distended",
              "Poorly Distended",
            ]}
            onChange={(value)=>
              setValue(
                "bladder_distension",
                value
              )
            }
          />

          <DropdownField
            label="Wall Thickness"
            value={data.bladder_wall}
            options={[
              "Normal",
              "Thickened",
            ]}
            onChange={(value)=>
              setValue(
                "bladder_wall",
                value
              )
            }
          />

          <DropdownField
            label="Stone"
            value={data.bladder_stone}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "bladder_stone",
                value
              )
            }
          />

          <DropdownField
            label="Mass"
            value={data.bladder_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "bladder_mass",
                value
              )
            }
          />

          <NumberField
            label="Residual Urine"
            unit="ml"
            value={data.post_void}
            onChange={(value)=>
              setValue(
                "post_void",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Bladder Findings"
          rows={3}
          value={data.bladder_notes || ""}
          onChange={(value)=>
            setValue(
              "bladder_notes",
              value
            )
          }
        />

        {/* ======================================
            UTERUS
        ====================================== */}

        <h3>Uterus</h3>

        <div className="scan-grid">

          <DropdownField
            label="Position"
            value={data.uterus_position}
            options={[
              "Anteverted",
              "Retroverted",
              "Axial",
            ]}
            onChange={(value)=>
              setValue(
                "uterus_position",
                value
              )
            }
          />

          <DropdownField
            label="Size"
            value={data.uterus_size}
            options={[
              "Normal",
              "Bulky",
              "Small",
            ]}
            onChange={(value)=>
              setValue(
                "uterus_size",
                value
              )
            }
          />

          <DropdownField
            label="Myometrium"
            value={data.myometrium}
            options={[
              "Normal",
              "Heterogeneous",
              "Fibroid",
              "Adenomyosis",
            ]}
            onChange={(value)=>
              setValue(
                "myometrium",
                value
              )
            }
          />

          <DropdownField
            label="Fibroids"
            value={data.fibroid}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "fibroid",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Uterine Findings"
          rows={3}
          value={data.uterus_notes || ""}
          onChange={(value)=>
            setValue(
              "uterus_notes",
              value
            )
          }
        />

        {/* ======================================
            ENDOMETRIUM
        ====================================== */}

        <h3>Endometrium</h3>

        <div className="scan-grid">

          <NumberField
            label="Thickness"
            unit="mm"
            value={data.endometrium_thickness}
            onChange={(value)=>
              setValue(
                "endometrium_thickness",
                value
              )
            }
          />

          <DropdownField
            label="Appearance"
            value={data.endometrium}
            options={[
              "Normal",
              "Thickened",
              "Thin",
              "Fluid",
              "Polyp",
            ]}
            onChange={(value)=>
              setValue(
                "endometrium",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Endometrial Findings"
          rows={3}
          value={data.endometrium_notes || ""}
          onChange={(value)=>
            setValue(
              "endometrium_notes",
              value
            )
          }
        />

        {/* ======================================
            RIGHT OVARY
        ====================================== */}

        <h3>Right Ovary</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.right_ovary_size}
            options={[
              "Normal",
              "Enlarged",
              "Atrophic",
            ]}
            onChange={(value)=>
              setValue(
                "right_ovary_size",
                value
              )
            }
          />

          <DropdownField
            label="Appearance"
            value={data.right_ovary}
            options={[
              "Normal",
              "Polycystic",
              "Complex",
            ]}
            onChange={(value)=>
              setValue(
                "right_ovary",
                value
              )
            }
          />

          <DropdownField
            label="Cyst"
            value={data.right_ovary_cyst}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_ovary_cyst",
                value
              )
            }
          />

          <DropdownField
            label="Mass"
            value={data.right_ovary_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "right_ovary_mass",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Right Ovary Findings"
          rows={3}
          value={data.right_ovary_notes || ""}
          onChange={(value)=>
            setValue(
              "right_ovary_notes",
              value
            )
          }
        />

        {/* ======================================
            LEFT OVARY
        ====================================== */}

        <h3>Left Ovary</h3>

        <div className="scan-grid">

          <DropdownField
            label="Size"
            value={data.left_ovary_size}
            options={[
              "Normal",
              "Enlarged",
              "Atrophic",
            ]}
            onChange={(value)=>
              setValue(
                "left_ovary_size",
                value
              )
            }
          />

          <DropdownField
            label="Appearance"
            value={data.left_ovary}
            options={[
              "Normal",
              "Polycystic",
              "Complex",
            ]}
            onChange={(value)=>
              setValue(
                "left_ovary",
                value
              )
            }
          />

          <DropdownField
            label="Cyst"
            value={data.left_ovary_cyst}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_ovary_cyst",
                value
              )
            }
          />

          <DropdownField
            label="Mass"
            value={data.left_ovary_mass}
            options={[
              "Absent",
              "Present",
            ]}
            onChange={(value)=>
              setValue(
                "left_ovary_mass",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Left Ovary Findings"
          rows={3}
          value={data.left_ovary_notes || ""}
          onChange={(value)=>
            setValue(
              "left_ovary_notes",
              value
            )
          }
        />

        {/* ======================================
            POUCH OF DOUGLAS
        ====================================== */}

        <h3>Pouch of Douglas</h3>

        <div className="scan-grid">

          <DropdownField
            label="Free Fluid"
            value={data.pouchOfDouglas}
            options={[
              "Absent",
              "Minimal",
              "Moderate",
              "Large",
            ]}
            onChange={(value)=>
              setValue(
                "pouchOfDouglas",
                value
              )
            }
          />

        </div>

        <TextAreaField
          label="Additional Pelvic Findings"
          rows={4}
          value={data.pelvic_notes || ""}
          onChange={(value)=>
            setValue(
              "pelvic_notes",
              value
            )
          }
        />

      </div>

            {/* ======================================
          CONCLUSION
      ====================================== */}

      <section className="scan-section">

        <h2>Conclusion</h2>

        <MultiSelectField
          label="Overall Impression"
          value={data.impression || []}
          options={[
            "Normal Abdomino-pelvic Ultrasound",
            "Fatty Liver",
            "Hepatomegaly",
            "Liver Cirrhosis",
            "Focal Liver Lesion",
            "Cholelithiasis",
            "Acute Cholecystitis",
            "Gall Bladder Sludge",
            "Splenomegaly",
            "Acute Pancreatitis",
            "Right Renal Calculus",
            "Left Renal Calculus",
            "Hydronephrosis",
            "Simple Renal Cyst",
            "Medical Renal Disease",
            "Urinary Bladder Wall Thickening",
            "Cystitis",
            "Bulky Uterus",
            "Fibroid Uterus",
            "Thickened Endometrium",
            "Right Ovarian Cyst",
            "Left Ovarian Cyst",
            "Polycystic Ovaries",
            "Free Fluid in Pouch of Douglas",
            "Pregnancy",
            "Pelvic Inflammatory Disease",
            "No Significant Abnormality Detected",
            "Others",
          ]}
          onChange={(value) =>
            setValue("impression", value)
          }
        />

        <textarea
          rows={4}
          placeholder="Additional impression..."
          value={data.impressionNote || ""}
          onChange={(e) =>
            setValue(
              "impressionNote",
              e.target.value
            )
          }
        />

        <MultiSelectField
          label="Recommendation"
          value={data.recommendation || []}
          options={[
            "No Further Evaluation Required",
            "Clinical Correlation Advised",
            "Correlation with Laboratory Findings",
            "Follow-up Ultrasound",
            "Repeat Ultrasound After Treatment",
            "CT Scan Recommended",
            "MRI Recommended",
            "Gynaecology Review",
            "Urology Review",
            "General Surgical Review",
            "Medical Review",
            "Laboratory Investigations",
            "Histopathological Correlation",
            "Appropriate Treatment Recommended",
            "Others",
          ]}
          onChange={(value) =>
            setValue(
              "recommendation",
              value
            )
          }
        />

        <textarea
          rows={4}
          placeholder="Additional recommendation..."
          value={data.recommendationNote || ""}
          onChange={(e) =>
            setValue(
              "recommendationNote",
              e.target.value
            )
          }
        />

      </section>

    </div>

  );

}