export default function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder = "",
  readOnly = false,
}) {
  return (
    <div className="scan-field">
      <label>{label}</label>

      <textarea
        rows={rows}
        value={value || ""}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => {
          if (!readOnly && onChange) {
            onChange(e.target.value);
          }
        }}
      />
    </div>
  );
}