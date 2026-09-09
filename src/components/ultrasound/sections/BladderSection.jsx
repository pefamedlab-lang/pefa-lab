import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function BladderSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Urinary Bladder</h3>

      <div className="scan-grid">

        <DropdownField
          label="Bladder Filling"
          value={data.bladder_filling}
          options={[
            "Well Distended",
            "Partially Distended",
            "Poorly Distended",
            "Collapsed",
          ]}
          onChange={(value) =>
            onChange("bladder_filling", value)
          }
        />

        <DropdownField
          label="Wall Thickness"
          value={data.bladder_wall}
          options={[
            "Normal",
            "Thickened",
            "Trabeculated",
          ]}
          onChange={(value) =>
            onChange("bladder_wall", value)
          }
        />

        <DropdownField
          label="Contents"
          value={data.bladder_contents}
          options={[
            "Clear",
            "Debris",
            "Blood Clots",
            "Mass",
            "Stone",
          ]}
          onChange={(value) =>
            onChange("bladder_contents", value)
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
            onChange("bladder_stone", value)
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
            onChange("bladder_mass", value)
          }
        />

        <NumberField
          label="Wall Thickness"
          unit="mm"
          value={data.bladder_wall_mm}
          onChange={(value) =>
            onChange("bladder_wall_mm", value)
          }
        />

        <NumberField
          label="Pre-Void Volume"
          unit="ml"
          value={data.pre_void_volume}
          onChange={(value) =>
            onChange("pre_void_volume", value)
          }
        />

        <NumberField
          label="Post-Void Residual"
          unit="ml"
          value={data.post_void_residual}
          onChange={(value) =>
            onChange("post_void_residual", value)
          }
        />

      </div>

    </div>
  );
}