import { useEffect } from "react";

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";
import TextAreaField from "../fields/TextAreaField";

import UltrasoundImageUploader from "../UltrasoundImageUploader";

import {
  generateObstetricReport,
} from "../../../utils/ultrasound/reportGenerators";

import {
  generateObstetricImpression,
  generateObstetricRecommendation,
} from "../../../utils/ultrasound/impressionGenerator";
export default function OBSForm({
  data = {},
  onChange,
}) {

  const setValue = (key, value) => {
    onChange(key, value);
  };

  useEffect(() => {

    const report =
      generateObstetricReport(data);

    const impression =
      generateObstetricImpression(data);

    const recommendation =
      generateObstetricRecommendation(data);

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
    PREGNANCY DETAILS
====================================== */}

<section className="scan-section">

  <h2>Pregnancy Details</h2>

  <div className="scan-grid">

    <NumberField
      label="Gestational Age"
      unit="weeks"
      value={data.gestational_age}
      onChange={(value) =>
        setValue("gestational_age", value)
      }
    />

    <DropdownField
      label="Number of Fetuses"
      value={data.number_of_fetuses}
      options={[
        "Singleton",
        "Twins",
        "Triplets",
        "Multiple",
      ]}
      onChange={(value) =>
        setValue("number_of_fetuses", value)
      }
    />

    <DropdownField
      label="Presentation"
      value={data.presentation}
      options={[
        "Cephalic",
        "Breech",
        "Transverse",
        "Oblique",
        "Variable",
      ]}
      onChange={(value) =>
        setValue("presentation", value)
      }
    />

    <DropdownField
      label="Lie"
      value={data.lie}
      options={[
        "Longitudinal",
        "Transverse",
        "Oblique",
      ]}
      onChange={(value) =>
        setValue("lie", value)
      }
    />

    <DropdownField
      label="Fetal Heart Activity"
      value={data.fetal_heart_activity}
      options={[
        "Present",
        "Absent",
      ]}
      onChange={(value) =>
        setValue("fetal_heart_activity", value)
      }
    />

    <NumberField
      label="Fetal Heart Rate"
      unit="bpm"
      value={data.fetal_heart_rate}
      onChange={(value) =>
        setValue("fetal_heart_rate", value)
      }
    />

    <input
      type="date"
      value={data.edd || ""}
      onChange={(e) =>
        setValue("edd", e.target.value)
      }
    />

  </div>

  <TextAreaField
    label="Pregnancy Notes"
    rows={3}
    value={data.pregnancy_notes || ""}
    onChange={(value) =>
      setValue("pregnancy_notes", value)
    }
  />

</section>

    

{/* ======================================
    FETAL BIOMETRY
====================================== */}

<section className="scan-section">

  <h2>Fetal Biometry</h2>

  <div className="scan-grid">

    <NumberField
      label="BPD"
      unit="mm"
      value={data.bpd}
      onChange={(value) =>
        setValue("bpd", value)
      }
    />

    <NumberField
      label="Head Circumference (HC)"
      unit="mm"
      value={data.hc}
      onChange={(value) =>
        setValue("hc", value)
      }
    />

    <NumberField
      label="Abdominal Circumference (AC)"
      unit="mm"
      value={data.ac}
      onChange={(value) =>
        setValue("ac", value)
      }
    />

    <NumberField
      label="Femur Length (FL)"
      unit="mm"
      value={data.fl}
      onChange={(value) =>
        setValue("fl", value)
      }
    />

    <NumberField
      label="Humerus Length (HL)"
      unit="mm"
      value={data.hl}
      onChange={(value) =>
        setValue("hl", value)
      }
    />

    <NumberField
      label="Estimated Fetal Weight"
      unit="g"
      value={data.estimated_weight}
      onChange={(value) =>
        setValue("estimated_weight", value)
      }
    />

    <NumberField
      label="Gestational Age by Scan"
      unit="weeks"
      value={data.scan_ga}
      onChange={(value) =>
        setValue("scan_ga", value)
      }
    />

  </div>

  <TextAreaField
    label="Additional Biometry Findings"
    rows={3}
    value={data.biometry_notes || ""}
    onChange={(value) =>
      setValue("biometry_notes", value)
    }
  />

</section>

{/* ======================================
    FETAL ASSESSMENT
====================================== */}

<section className="scan-section">

  <h2>Fetal Assessment</h2>

  <div className="scan-grid">

    <DropdownField
      label="Fetal Movements"
      value={data.fetal_movements}
      options={[
        "Present",
        "Reduced",
        "Absent",
      ]}
      onChange={(value) =>
        setValue("fetal_movements", value)
      }
    />

    <DropdownField
      label="Fetal Tone"
      value={data.fetal_tone}
      options={[
        "Normal",
        "Reduced",
        "Absent",
      ]}
      onChange={(value) =>
        setValue("fetal_tone", value)
      }
    />

    <DropdownField
      label="Fetal Breathing Movements"
      value={data.fetal_breathing}
      options={[
        "Present",
        "Absent",
      ]}
      onChange={(value) =>
        setValue("fetal_breathing", value)
      }
    />

    <DropdownField
      label="Cardiac Activity"
      value={data.cardiac_activity}
      options={[
        "Normal",
        "Abnormal",
      ]}
      onChange={(value) =>
        setValue("cardiac_activity", value)
      }
    />

    <DropdownField
      label="Fetal Anatomy"
      value={data.fetal_anatomy}
      options={[
        "Normal",
        "Abnormal",
        "Limited Assessment",
      ]}
      onChange={(value) =>
        setValue("fetal_anatomy", value)
      }
    />

    <DropdownField
      label="Congenital Anomalies"
      value={data.congenital_anomalies}
      options={[
        "None Seen",
        "Suspected",
        "Present",
      ]}
      onChange={(value) =>
        setValue(
          "congenital_anomalies",
          value
        )
      }
    />

    <DropdownField
      label="Overall Fetal Wellbeing"
      value={data.fetal_wellbeing}
      options={[
        "Reassuring",
        "Non-Reassuring",
      ]}
      onChange={(value) =>
        setValue(
          "fetal_wellbeing",
          value
        )
      }
    />

  </div>

  <TextAreaField
    label="Additional Fetal Findings"
    rows={4}
    value={data.fetal_notes || ""}
    onChange={(value) =>
      setValue(
        "fetal_notes",
        value
      )
    }
  />

</section>

{/* ======================================
    PLACENTA & AMNIOTIC FLUID
====================================== */}

<section className="scan-section">

  <h2>Placenta & Amniotic Fluid</h2>

  <div className="scan-grid">

    <DropdownField
      label="Placental Location"
      value={data.placenta_location}
      options={[
        "Anterior",
        "Posterior",
        "Fundal",
        "Lateral",
        "Low Lying",
        "Placenta Previa",
      ]}
      onChange={(value) =>
        setValue("placenta_location", value)
      }
    />

    <DropdownField
      label="Placental Grade"
      value={data.placenta_grade}
      options={[
        "Grade 0",
        "Grade I",
        "Grade II",
        "Grade III",
      ]}
      onChange={(value) =>
        setValue("placenta_grade", value)
      }
    />

    <DropdownField
      label="Placental Appearance"
      value={data.placenta_appearance}
      options={[
        "Normal",
        "Calcified",
        "Thickened",
        "Succenturiate",
      ]}
      onChange={(value) =>
        setValue("placenta_appearance", value)
      }
    />

    <DropdownField
      label="Placenta Previa"
      value={data.placenta_previa}
      options={[
        "Absent",
        "Present",
      ]}
      onChange={(value) =>
        setValue("placenta_previa", value)
      }
    />

    <DropdownField
      label="Retroplacental Hematoma"
      value={data.retroplacental_hematoma}
      options={[
        "Absent",
        "Present",
      ]}
      onChange={(value) =>
        setValue("retroplacental_hematoma", value)
      }
    />

    <NumberField
      label="AFI"
      unit="cm"
      value={data.afi}
      onChange={(value) =>
        setValue("afi", value)
      }
    />

    <DropdownField
      label="Liquor Volume"
      value={data.liquor_volume}
      options={[
        "Normal",
        "Polyhydramnios",
        "Oligohydramnios",
      ]}
      onChange={(value) =>
        setValue("liquor_volume", value)
      }
    />

    <DropdownField
      label="Membranes"
      value={data.membranes}
      options={[
        "Intact",
        "Ruptured",
      ]}
      onChange={(value) =>
        setValue("membranes", value)
      }
    />

  </div>

  <TextAreaField
    label="Additional Placental / Liquor Findings"
    rows={4}
    value={data.placenta_notes || ""}
    onChange={(value) =>
      setValue("placenta_notes", value)
    }
  />

</section>

{/* ======================================
    CERVIX & MATERNAL FINDINGS
====================================== */}

<section className="scan-section">

  <h2>Cervix & Maternal Findings</h2>

  <div className="scan-grid">

    <NumberField
      label="Cervical Length"
      unit="cm"
      value={data.cervical_length}
      onChange={(value) =>
        setValue("cervical_length", value)
      }
    />

    <DropdownField
      label="Internal Os"
      value={data.internal_os}
      options={[
        "Closed",
        "Open",
        "Funneling",
      ]}
      onChange={(value) =>
        setValue("internal_os", value)
      }
    />

    <DropdownField
      label="Cervical Competence"
      value={data.cervical_competence}
      options={[
        "Competent",
        "Incompetent",
      ]}
      onChange={(value) =>
        setValue(
          "cervical_competence",
          value
        )
      }
    />

    <DropdownField
      label="Lower Uterine Segment"
      value={data.lower_uterine_segment}
      options={[
        "Normal",
        "Thin",
        "Scar Seen",
      ]}
      onChange={(value) =>
        setValue(
          "lower_uterine_segment",
          value
        )
      }
    />

    <DropdownField
      label="Uterus"
      value={data.maternal_uterus}
      options={[
        "Normal",
        "Fibroids",
        "Adenomyosis",
        "Scarred",
      ]}
      onChange={(value) =>
        setValue(
          "maternal_uterus",
          value
        )
      }
    />

    <DropdownField
      label="Right Adnexa"
      value={data.right_adnexa}
      options={[
        "Normal",
        "Cyst",
        "Mass",
        "Not Visualized",
      ]}
      onChange={(value) =>
        setValue(
          "right_adnexa",
          value
        )
      }
    />

    <DropdownField
      label="Left Adnexa"
      value={data.left_adnexa}
      options={[
        "Normal",
        "Cyst",
        "Mass",
        "Not Visualized",
      ]}
      onChange={(value) =>
        setValue(
          "left_adnexa",
          value
        )
      }
    />

    <DropdownField
      label="Free Fluid"
      value={data.free_fluid}
      options={[
        "Absent",
        "Minimal",
        "Moderate",
        "Large",
      ]}
      onChange={(value) =>
        setValue("free_fluid", value)
      }
    />

  </div>

  <TextAreaField
    label="Maternal Findings"
    rows={4}
    value={data.maternal_notes || ""}
    onChange={(value) =>
      setValue(
        "maternal_notes",
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
    label="Additional Obstetric Findings"
    rows={5}
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
    ULTRASOUND IMAGES
====================================== */}

<section className="scan-section">

  <h2>Ultrasound Images</h2>

  <UltrasoundImageUploader
    images={data.images || []}
    onChange={(images) =>
      setValue("images", images)
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