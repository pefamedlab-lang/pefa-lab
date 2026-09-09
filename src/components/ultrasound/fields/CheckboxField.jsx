import React from "react";

export default function CheckboxField({
  label,
  checked = false,
  onChange,
}) {
  return (
    <label className="checkbox-field">

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
      />

      <span>{label}</span>

    </label>
  );
}