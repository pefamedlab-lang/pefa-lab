import LetterHeadDocument from "./LetterHeadDocument";
import BlankHeader from "./BlankHeader";
import GroupedPrintRenderer from "./GroupedPrintRenderer";
import ReportFooter from "./ReportFooter";

export default function ReportLayout({
  patient,
  results = [],
  useLetterhead = true,
}) {
  return (
    <div className="report-layout">

      {/* ==========================================
          HEADER
      ========================================== */}

      {useLetterhead ? (
        <LetterHeadDocument />
      ) : (
        <BlankHeader />
      )}

      {/* ==========================================
          REPORT BODY
      ========================================== */}

      <GroupedPrintRenderer
        results={results}
        patient={patient}
        printMode="result-record"
        showVerification={false}
        showFooter={false}
      />

      {/* ==========================================
          REPORT FOOTER
      ========================================== */}

      <ReportFooter
        result={patient}
      />

    </div>
  );
}