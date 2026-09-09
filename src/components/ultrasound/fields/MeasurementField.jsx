import React from "react";

export default function MeasurementField({
  label,
  value,
  unit = "mm",
  units = ["mm"],
  onValueChange,
  onUnitChange,
  placeholder = "",
  step = "0.1",
}) {
  return (
    <div className="field">

      <label>{label}</label>

      <div className="measurement-field">

        <input
          type="number"
          value={value ?? ""}
          step={step}
          placeholder={placeholder}
          onChange={(e) =>
            onValueChange(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        />

        <select
          value={unit}
          onChange={(e) =>
            onUnitChange &&
            onUnitChange(e.target.value)
          }
        >
          {units.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

      </div>

    </div>
  );
}