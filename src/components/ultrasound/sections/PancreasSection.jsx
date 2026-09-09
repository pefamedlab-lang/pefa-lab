

import DropdownField from "../fields/DropdownField";
import NumberField from "../fields/NumberField";

export default function PancreasSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h3>Pancreas</h3>

      <div className="scan-grid">

        <DropdownField
          label="Visualisation"
          value={data.pancreas_visualisation}
          options={[
            "Complete",
            "Partial",
            "Obscured by Bowel Gas",
          ]}
          onChange={(value) =>
            onChange("pancreas_visualisation", value)
          }
        />

        <DropdownField
          label="Size"
          value={data.pancreas_size}
          options={[
            "Normal",
            "Enlarged",
            "Atrophic",
          ]}
          onChange={(value) =>
            onChange("pancreas_size", value)
          }
        />

        <DropdownField
          label="Contour"
          value={data.pancreas_contour}
          options={[
            "Smooth",
            "Lobulated",
            "Irregular",
          ]}
          onChange={(value) =>
            onChange("pancreas_contour", value)
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
          onChange={(value) =>
            onChange("pancreas_echo", value)
          }
        />

        <DropdownField
          label="Mass"
          value={data.pancreas_mass}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("pancreas_mass", value)
          }
        />

        <DropdownField
          label="Calcification"
          value={data.pancreas_calcification}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("pancreas_calcification", value)
          }
        />

        <DropdownField
          label="Peripancreatic Fluid"
          value={data.peripancreatic_fluid}
          options={[
            "Absent",
            "Present",
          ]}
          onChange={(value) =>
            onChange("peripancreatic_fluid", value)
          }
        />

        <NumberField
          label="Main Pancreatic Duct"
          unit="mm"
          value={data.pancreatic_duct}
          onChange={(value) =>
            onChange("pancreatic_duct", value)
          }
        />

      </div>

    </div>
  );
}
        <DropdownField
          label="Size"
          value={data.pancreas_size}
          options={[
            "Normal",
            "Enlarged",
            "Atrophic"
          ]}
          onChange={(value)=>
            onChange("pancreas_size", value)
          }
        />

        <DropdownField
          label="Contour"
          value={data.pancreas_contour}
          options={[
            "Smooth",
            "Lobulated",
            "Irregular"
          ]}
          onChange={(value)=>
            onChange("pancreas_contour", value)
          }
        />

        <DropdownField
          label="Echogenicity"
          value={data.pancreas_echo}
          options={[
            "Normal",
            "Hypoechoic",
            "Hyperechoic",
            "Heterogeneous"
          ]}
          onChange={(value)=>
            onChange("pancreas_echo", value)
          }
        />

        <MeasurementField
          label="Pancreatic Duct"
          value={data.pancreatic_duct}
          unit={data.pancreatic_duct_unit || "mm"}
          units={["mm"]}
          onValueChange={(value)=>
            onChange("pancreatic_duct", value)
          }
          onUnitChange={(value)=>
            onChange("pancreatic_duct_unit", value)
          }
        />

        <DropdownField
          label="Mass Lesion"
          value={data.pancreatic_mass}
          options={[
            "None",
            "Cyst",
            "Solid Mass",
            "Mixed Lesion"
          ]}
          onChange={(value)=>
            onChange("pancreatic_mass", value)
          }
        />

      </div>

      <div className="checkbox-grid">

        <CheckboxField
          label="Acute Pancreatitis"
          checked={data.acute_pancreatitis || false}
          onChange={(value)=>
            onChange("acute_pancreatitis", value)
          }
        />

        <CheckboxField
          label="Chronic Pancreatitis"
          checked={data.chronic_pancreatitis || false}
          onChange={(value)=>
            onChange("chronic_pancreatitis", value)
          }
        />

        <CheckboxField
          label="Pancreatic Calcification"
          checked={data.pancreatic_calcification || false}
          onChange={(value)=>
            onChange("pancreatic_calcification", value)
          }
        />

        <CheckboxField
          label="Peripancreatic Fluid"
          checked={data.peripancreatic_fluid || false}
          onChange={(value)=>
            onChange("peripancreatic_fluid", value)
          }
        />

        <CheckboxField
          label="Tail Obscured By Bowel Gas"
          checked={data.pancreatic_tail_obscured || false}
          onChange={(value)=>
            onChange("pancreatic_tail_obscured", value)
          }
        />

      </div>

    </div>
  );
}
