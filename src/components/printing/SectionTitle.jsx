/* ==========================================================
   SECTION TITLE
   PEFA Medical Diagnostic Services
========================================================== */

export default function SectionTitle({

  title = "",

  color = "primary",

  uppercase = true,

  className = "",

}) {

  const text = String(title ?? "").trim();

  return (

    <div
      className={`section-title ${color} ${className}`.trim()}
    >

      <span className="section-title-dot" />

      <span className="section-title-text">

        {uppercase
          ? text.toUpperCase()
          : text}

      </span>

      <div className="section-title-line" />

    </div>

  );

}