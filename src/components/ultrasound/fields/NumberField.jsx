import React from "react";

export default function NumberField({
  label,
  value,
  onChange,
  unit = "",
  min,
  max,
  step = "0.1",
  placeholder = "",
}) {
  return (
    <div className="field">

      <label>{label}</label>

      <div className="measurement-input">

        <input
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        />

        {unit && (
          <span className="measurement-unit">
            {unit}
          </span>
        )}

      </div>

    </div>
  );
}