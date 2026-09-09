import React from "react";

export default function RadioGroupField({
  label,
  value,
  options = [],
  onChange,
}) {
  return (
    <div className="field">

      <label>{label}</label>

      <div className="radio-group">

        {options.map((option) => (

          <label
            key={option}
            className="radio-option"
          >

            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
            />

            <span>{option}</span>

          </label>

        ))}

      </div>

    </div>
  );
}