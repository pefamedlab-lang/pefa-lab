import LetterHead from "./LetterHead";
import PrintFooter from "./PrintFooter";

export default function LetterHeadDocument() {

  return (

    <div className="letterhead-document">

      {/* TOP LETTER HEAD */}
      <LetterHead />


      {/* WRITING AREA */}
      <main className="letterhead-body">

      </main>


      {/* FOOTER */}
      <PrintFooter />

    </div>

  );

}