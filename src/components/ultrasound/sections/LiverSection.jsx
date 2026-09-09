import React from "react";

import DropdownField from "../fields/DropdownField";
import MeasurementField from "../fields/MeasurementField";
import CheckboxField from "../fields/CheckboxField";

export default function LiverSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h2>Liver</h2>

      <div className="scan-grid">

        <MeasurementField
          label="Craniocaudal Length"
          value={data.liver_length}
          unit={data.liver_length_unit || "mm"}
          units={["mm", "cm"]}
          onValueChange={(value)=>
            onChange("liver_length", value)
          }
          onUnitChange={(value)=>
            onChange("liver_length_unit", value)
          }
        />

        <DropdownField
          label="Size"
          value={data.liver_size}
          options={[
            "Normal",
            "Mildly Enlarged",
            "Moderately Enlarged",
            "Severely Enlarged",
            "Small"
          ]}
          onChange={(value)=>
            onChange("liver_size", value)
          }
        />

        <DropdownField
          label="Shape"
          value={data.liver_shape}
          options={[
            "Normal",
            "Rounded",
            "Irregular",
            "Nodular"
          ]}
          onChange={(value)=>
            onChange("liver_shape", value)
          }
        />

        <DropdownField
          label="Surface"
          value={data.liver_surface}
          options={[
            "Smooth",
            "Irregular",
            "Nodular"
          ]}
          onChange={(value)=>
            onChange("liver_surface", value)
          }
        />

        <DropdownField
          label="Parenchymal Echotexture"
          value={data.liver_echo}
          options={[
            "Homogeneous",
            "Coarse",
            "Heterogeneous",
            "Fatty",
            "Cirrhotic Pattern"
          ]}
          onChange={(value)=>
            onChange("liver_echo", value)
          }
        />

        <DropdownField
          label="Focal Lesion"
          value={data.liver_mass}
          options={[
            "None",
            "Simple Cyst",
            "Complex Cyst",
            "Hemangioma",
            "Abscess",
            "Metastasis",
            "Hepatoma",
            "Multiple Lesions"
          ]}
          onChange={(value)=>
            onChange("liver_mass", value)
          }
        />

        <DropdownField
          label="Portal Vein"
          value={data.portal_vein}
          options={[
            "Normal",
            "Dilated",
            "Thrombosed",
            "Compressed"
          ]}
          onChange={(value)=>
            onChange("portal_vein", value)
          }
        />

        <DropdownField
          label="Hepatic Veins"
          value={data.hepatic_veins}
          options={[
            "Normal",
            "Dilated",
            "Compressed"
          ]}
          onChange={(value)=>
            onChange("hepatic_veins", value)
          }
        />

      </div>

      <div className="checkbox-grid">

        <CheckboxField
          label="Fatty Liver"
          checked={data.fatty_liver || false}
          onChange={(value)=>
            onChange("fatty_liver", value)
          }
        />

        <CheckboxField
          label="Hepatomegaly"
          checked={data.hepatomegaly || false}
          onChange={(value)=>
            onChange("hepatomegaly", value)
          }
        />

        <CheckboxField
          label="Cirrhosis"
          checked={data.cirrhosis || false}
          onChange={(value)=>
            onChange("cirrhosis", value)
          }
        />

        <CheckboxField
          label="Portal Hypertension"
          checked={data.portal_hypertension || false}
          onChange={(value)=>
            onChange("portal_hypertension", value)
          }
        />

        <CheckboxField
          label="Calcification"
          checked={data.liver_calcification || false}
          onChange={(value)=>
            onChange("liver_calcification", value)
          }
        />

      </div>

    </div>
  );
}