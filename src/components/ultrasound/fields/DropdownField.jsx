import React from "react";

export default function DropdownField({
  label,
  value,
  options = [],
  onChange,
}) {
  return (
    <div className="field">

      <label>{label}</label>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}