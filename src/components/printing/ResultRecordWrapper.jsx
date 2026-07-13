export default function ResultRecordWrapper({

  children,

}) {

  return (

    <div className="result-record-page">

      {/* ======================
          EMPTY LETTERHEAD SPACE
      ====================== */}

      <div className="result-record-header-space" />

      {/* ======================
          REPORT CONTENT
      ====================== */}

      <div className="result-record-content">

        {children}

      </div>

      {/* ======================
          EMPTY FOOTER SPACE
      ====================== */}

      <div className="result-record-footer-space" />

    </div>

  );

}