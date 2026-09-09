// src/components/ultrasound/sections/CommonBileDuctSection.jsx

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function CommonBileDuctSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Common Bile Duct</h3>

      <div className="scan-grid">

        <NumberField
          label="Diameter"
          unit="mm"
          value={data.cbd_diameter}
          onChange={(value) =>
            onChange("cbd_diameter", value)
          }
        />

        <DropdownField
          label="Calibre"
          value={data.cbd_calibre}
          options={[
            "Normal",
            "Dilated",
          ]}
          onChange={(value) =>
            onChange("cbd_calibre", value)
          }
        />

        <DropdownField
          label="Intraluminal Stone"
          value={data.cbd_stone}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("cbd_stone", value)
          }
        />

        <DropdownField
          label="Sludge"
          value={data.cbd_sludge}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("cbd_sludge", value)
          }
        />

        <DropdownField
          label="Wall"
          value={data.cbd_wall}
          options={[
            "Normal",
            "Thickened",
          ]}
          onChange={(value) =>
            onChange("cbd_wall", value)
          }
        />

      </div>

    </div>
  );
}