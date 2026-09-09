

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function SpleenSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Spleen</h3>

      <div className="scan-grid">

        <NumberField
          label="Length"
          unit="cm"
          value={data.spleen_length}
          onChange={(value) =>
            onChange("spleen_length", value)
          }
        />

        <DropdownField
          label="Size"
          value={data.spleen_size}
          options={[
            "Normal",
            "Enlarged",
            "Small",
          ]}
          onChange={(value) =>
            onChange("spleen_size", value)
          }
        />

        <DropdownField
          label="Shape"
          value={data.spleen_shape}
          options={[
            "Normal",
            "Lobulated",
            "Irregular",
          ]}
          onChange={(value) =>
            onChange("spleen_shape", value)
          }
        />

        <DropdownField
          label="Echotexture"
          value={data.spleen_echo}
          options={[
            "Homogeneous",
            "Heterogeneous",
            "Hypoechoic",
            "Hyperechoic",
          ]}
          onChange={(value) =>
            onChange("spleen_echo", value)
          }
        />

        <DropdownField
          label="Focal Lesion"
          value={data.spleen_lesion}
          options={[
            "Absent",
            "Cyst",
            "Solid Mass",
            "Abscess",
            "Infarct",
          ]}
          onChange={(value) =>
            onChange("spleen_lesion", value)
          }
        />

        <DropdownField
          label="Calcification"
          value={data.spleen_calcification}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("spleen_calcification", value)
          }
        />

        <DropdownField
          label="Splenic Hilum"
          value={data.splenic_hilum}
          options={[
            "Normal",
            "Prominent",
            "Mass Present",
          ]}
          onChange={(value) =>
            onChange("splenic_hilum", value)
          }
        />

        <DropdownField
          label="Perisplenic Fluid"
          value={data.perisplenic_fluid}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("perisplenic_fluid", value)
          }
        />

      </div>

    </div>
  );
}