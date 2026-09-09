import React from "react";

export default function MultiSelectField({
  label,
  values = [],
  options = [],
  onChange,
}) {
  const toggleOption = (option) => {
    let updated;

    if (values.includes(option)) {
      updated = values.filter(
        (item) => item !== option
      );
    } else {
      updated = [...values, option];
    }

    onChange(updated);
  };

  return (
    <div className="field">

      <label>{label}</label>

      <div className="multi-select">

        {options.map((option) => (

          <label
            key={option}
            className="multi-option"
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() =>
                toggleOption(option)
              }
            />

            <span>{option}</span>

          </label>

        ))}

      </div>

    </div>
  );
}