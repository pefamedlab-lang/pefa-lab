

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function IVCSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Inferior Vena Cava (IVC)</h3>

      <div className="scan-grid">

        <DropdownField
          label="Visualization"
          value={data.ivc_visualization}
          options={[
            "Adequate",
            "Suboptimal",
            "Not Visualized",
          ]}
          onChange={(value) =>
            onChange("ivc_visualization", value)
          }
        />

        <NumberField
          label="Maximum Diameter"
          unit="mm"
          value={data.ivc_diameter}
          onChange={(value) =>
            onChange("ivc_diameter", value)
          }
        />

        <DropdownField
          label="Calibre"
          value={data.ivc_calibre}
          options={[
            "Normal",
            "Dilated",
            "Collapsed",
          ]}
          onChange={(value) =>
            onChange("ivc_calibre", value)
          }
        />

        <DropdownField
          label="Respiratory Collapse"
          value={data.ivc_collapse}
          options={[
            "Normal",
            ">50%",
            "<50%",
            "Absent",
          ]}
          onChange={(value) =>
            onChange("ivc_collapse", value)
          }
        />

        <DropdownField
          label="Patency"
          value={data.ivc_patency}
          options={[
            "Patent",
            "Partially Occluded",
            "Occluded",
          ]}
          onChange={(value) =>
            onChange("ivc_patency", value)
          }
        />

        <DropdownField
          label="Thrombus"
          value={data.ivc_thrombus}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("ivc_thrombus", value)
          }
        />

        <DropdownField
          label="External Compression"
          value={data.ivc_compression}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("ivc_compression", value)
          }
        />

      </div>

    </div>
  );
}