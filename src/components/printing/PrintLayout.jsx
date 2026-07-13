import LetterHead from "./LetterHead";
import PrintFooter from "./PrintFooter";


export default function PrintLayout({

  children,

  compact = false

}) {


return (

<div className="print-document">


    {/* =========================
        GLOBAL LETTER HEAD
    ========================== */}

    <LetterHead
      compact={compact}
    />



    {/* =========================
        DOCUMENT CONTENT
    ========================== */}

    <main className="print-content">

      {children}

    </main>



    {/* =========================
        GLOBAL FOOTER
    ========================== */}

    <PrintFooter />


</div>

);


}