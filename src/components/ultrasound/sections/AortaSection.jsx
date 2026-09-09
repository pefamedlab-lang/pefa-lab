
import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function AortaSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Abdominal Aorta</h3>

      <div className="scan-grid">

        <NumberField
          label="Maximum Diameter"
          unit="mm"
          value={data.aorta_diameter}
          onChange={(value) =>
            onChange("aorta_diameter", value)
          }
        />

        <DropdownField
          label="Calibre"
          value={data.aorta_calibre}
          options={[
            "Normal",
            "Ectatic",
            "Aneurysmal",
          ]}
          onChange={(value) =>
            onChange("aorta_calibre", value)
          }
        />

        <DropdownField
          label="Wall"
          value={data.aorta_wall}
          options={[
            "Normal",
            "Calcified",
            "Irregular",
          ]}
          onChange={(value) =>
            onChange("aorta_wall", value)
          }
        />

        <DropdownField
          label="Lumen"
          value={data.aorta_lumen}
          options={[
            "Patent",
            "Partially Occluded",
            "Occluded",
          ]}
          onChange={(value) =>
            onChange("aorta_lumen", value)
          }
        />

        <DropdownField
          label="Dissection"
          value={data.aorta_dissection}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("aorta_dissection", value)
          }
        />

        <DropdownField
          label="Thrombus"
          value={data.aorta_thrombus}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("aorta_thrombus", value)
          }
        />

      </div>

    </div>
  );
}
