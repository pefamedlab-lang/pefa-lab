import LetterHead from "./LetterHead";
import PrintFooter from "./PrintFooter";

import "../../styles/printing/printing.css";
import "../../styles/LetterHeadPortal.css";

export default function LetterHeadDocument({
  children,
  showHeader = true,
  showFooter = true,
}) {
  return (
    <article className="letterhead-document">

      {/* ======================================================
          LETTERHEAD
      ====================================================== */}

      {showHeader && (
        <header className="letterhead-document__header">
          <LetterHead />
        </header>
      )}

      {/* ======================================================
          DOCUMENT BODY
      ====================================================== */}

      <main className="letterhead-document__body">

        <div className="letterhead-document__content">
          {children}
        </div>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      {showFooter && (
        <footer className="letterhead-document__footer">
          <PrintFooter />
        </footer>
      )}

    </article>
  );
}