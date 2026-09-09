
import React from "react";

import DropdownField from "../fields/DropdownField";
import MeasurementField from "../fields/MeasurementField";
import CheckboxField from "../fields/CheckboxField";

export default function KidneySection({
  side = "Right",
  data,
  onChange,
}) {

  const prefix =
    side.toLowerCase();

  return (

    <div className="scan-section">

      <h2>{side} Kidney</h2>

      <div className="scan-grid">

        <MeasurementField
          label="Length"
          value={data[`${prefix}_kidney_length`]}
          unit={
            data[`${prefix}_kidney_length_unit`] ||
            "mm"
          }
          units={["mm","cm"]}
          onValueChange={(value)=>
            onChange(
              `${prefix}_kidney_length`,
              value
            )
          }
          onUnitChange={(value)=>
            onChange(
              `${prefix}_kidney_length_unit`,
              value
            )
          }
        />

        <DropdownField
          label="Size"
          value={data[`${prefix}_kidney_size`]}
          options={[
            "Normal",
            "Enlarged",
            "Small",
            "Atrophic"
          ]}
          onChange={(value)=>
            onChange(
              `${prefix}_kidney_size`,
              value
            )
          }
        />

        <DropdownField
          label="Cortical Thickness"
          value={data[`${prefix}_cortex`]}
          options={[
            "Normal",
            "Mildly Thin",
            "Moderately Thin",
            "Severely Thin"
          ]}
          onChange={(value)=>
            onChange(
              `${prefix}_cortex`,
              value
            )
          }
        />

        <DropdownField
          label="Corticomedullary Differentiation"
          value={data[`${prefix}_cmd`]}
          options={[
            "Preserved",
            "Reduced",
            "Lost"
          ]}
          onChange={(value)=>
            onChange(
              `${prefix}_cmd`,
              value
            )
          }
        />

        <DropdownField
          label="Echogenicity"
          value={data[`${prefix}_echo`]}
          options={[
            "Normal",
            "Increased",
            "Reduced",
            "Heterogeneous"
          ]}
          onChange={(value)=>
            onChange(
              `${prefix}_echo`,
              value
            )
          }
        />

        <DropdownField
          label="Pelvicalyceal System"
          value={data[`${prefix}_pcs`]}
          options={[
            "Normal",
            "Mild Dilatation",
            "Moderate Dilatation",
            "Severe Dilatation"
          ]}
          onChange={(value)=>
            onChange(
              `${prefix}_pcs`,
              value
            )
          }
        />

      </div>

      <div className="checkbox-grid">

        <CheckboxField
          label="Hydronephrosis"
          checked={
            data[`${prefix}_hydronephrosis`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_hydronephrosis`,
              value
            )
          }
        />

        <CheckboxField
          label="Renal Calculus"
          checked={
            data[`${prefix}_calculus`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_calculus`,
              value
            )
          }
        />

        <CheckboxField
          label="Simple Cyst"
          checked={
            data[`${prefix}_simple_cyst`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_simple_cyst`,
              value
            )
          }
        />

        <CheckboxField
          label="Complex Cyst"
          checked={
            data[`${prefix}_complex_cyst`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_complex_cyst`,
              value
            )
          }
        />

        <CheckboxField
          label="Solid Mass"
          checked={
            data[`${prefix}_mass`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_mass`,
              value
            )
          }
        />

        <CheckboxField
          label="Perinephric Collection"
          checked={
            data[`${prefix}_collection`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_collection`,
              value
            )
          }
        />

        <CheckboxField
          label="Cortical Scar"
          checked={
            data[`${prefix}_scar`] || false
          }
          onChange={(value)=>
            onChange(
              `${prefix}_scar`,
              value
            )
          }
        />

      </div>

    </div>

  );

}
