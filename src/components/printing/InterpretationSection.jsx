import { generateInterpretation } from "../../utils/interpretation";

/* ==========================================================
   INTERPRETATION ROW
========================================================== */

function InterpretationRow({ label, value }) {
  if (!value?.trim()) return null;

  return (
    <div className="interpretation-row">

      <span className="interpretation-label">
        {label}
      </span>

      <span className="interpretation-value">
        {value.trim()}
      </span>

    </div>
  );
}

/* ==========================================================
   INTERPRETATION SECTION
========================================================== */

export default function InterpretationSection({
  report = {},
  results = [],
}) {

  const output =
    generateInterpretation(report, results);

  if (
    !output ||
    (
      !output.interpretation &&
      !output.impression &&
      !output.comment &&
      !output.recommendation
    )
  ) {
    return null;
  }

  return (

    <section className="interpretation-section">

      <div className="section-title">

        Interpretation & Clinical Comments

      </div>

      <InterpretationRow
        label="Interpretation"
        value={output.interpretation}
      />

      <InterpretationRow
        label="Impression"
        value={output.impression}
      />

      <InterpretationRow
        label="Laboratory Comment"
        value={
          output.comment ||
          report.comment
        }
      />

      <InterpretationRow
        label="Recommendation"
        value={output.recommendation}
      />

    </section>

  );

}