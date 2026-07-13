import { generateInterpretation } from "../../utils/interpretation";

/* ==========================================================
   BLOCK
========================================================== */

function ReportBlock({

  title,

  text,

}) {

  if (!text?.trim()) {

    return null;

  }

  return (

    <div className="report-block">

      <div className="report-block-title">

        {title}

      </div>

      <div className="report-block-body">

        {text.trim()}

      </div>

    </div>

  );

}

/* ==========================================================
   COMPONENT
========================================================== */

export default function InterpretationSection({

  report = {},

  results = [],

}) {

  const output =

    generateInterpretation(

      report,

      results

    );

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

    <section className="report-interpretation">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="report-interpretation-header">

        <span className="report-header-line" />

        <span className="report-header-title">

          INTERPRETATION & CLINICAL COMMENTS

        </span>

        <span className="report-header-line" />

      </div>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="report-interpretation-body">

        <ReportBlock

          title="INTERPRETATION"

          text={output.interpretation}

        />

        <ReportBlock

          title="IMPRESSION"

          text={output.impression}

        />

        <ReportBlock

          title="LABORATORY COMMENT"

          text={

            output.comment ||

            report.comment

          }

        />

        <ReportBlock

          title="RECOMMENDATION"

          text={output.recommendation}

        />

      </div>

    </section>

  );

}