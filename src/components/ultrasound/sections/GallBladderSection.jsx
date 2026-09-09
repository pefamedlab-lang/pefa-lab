
import React from "react";

import DropdownField from "../fields/DropdownField";
import MeasurementField from "../fields/MeasurementField";
import CheckboxField from "../fields/CheckboxField";

export default function GallBladderSection({
  data,
  onChange,
}) {
  return (
    <div className="scan-section">

      <h2>Gall Bladder</h2>

      <div className="scan-grid">

        <DropdownField
          label="Distension"
          value={data.gb_distension}
          options={[
            "Well Distended",
            "Partially Distended",
            "Contracted"
          ]}
          onChange={(value) =>
            onChange("gb_distension", value)
          }
        />

        <MeasurementField
          label="Wall Thickness"
          value={data.gb_wall}
          unit={data.gb_wall_unit || "mm"}
          units={["mm"]}
          onValueChange={(value) =>
            onChange("gb_wall", value)
          }
          onUnitChange={(value) =>
            onChange("gb_wall_unit", value)
          }
        />

        <DropdownField
          label="Lumen"
          value={data.gb_lumen}
          options={[
            "Clear",
            "Sludge",
            "Mixed Echoes"
          ]}
          onChange={(value) =>
            onChange("gb_lumen", value)
          }
        />

        <DropdownField
          label="Calculi"
          value={data.gb_calculi}
          options={[
            "Absent",
            "Single",
            "Multiple"
          ]}
          onChange={(value) =>
            onChange("gb_calculi", value)
          }
        />

        <DropdownField
          label="Common Bile Duct"
          value={data.cbd}
          options={[
            "Normal",
            "Mildly Dilated",
            "Moderately Dilated",
            "Severely Dilated"
          ]}
          onChange={(value) =>
            onChange("cbd", value)
          }
        />

      </div>

      <div className="checkbox-grid">

        <CheckboxField
          label="Acoustic Shadowing"
          checked={data.gb_shadowing || false}
          onChange={(value) =>
            onChange("gb_shadowing", value)
          }
        />

        <CheckboxField
          label="Gall Bladder Polyp"
          checked={data.gb_polyp || false}
          onChange={(value) =>
            onChange("gb_polyp", value)
          }
        />

        <CheckboxField
          label="Pericholecystic Fluid"
          checked={data.gb_fluid || false}
          onChange={(value) =>
            onChange("gb_fluid", value)
          }
        />

        <CheckboxField
          label="Positive Murphy Sign"
          checked={data.gb_murphy || false}
          onChange={(value) =>
            onChange("gb_murphy", value)
          }
        />

        <CheckboxField
          label="Wall Edema"
          checked={data.gb_edema || false}
          onChange={(value) =>
            onChange("gb_edema", value)
          }
        />

      </div>

    </div>
  );
}
