import groupResultsForPrinting
from "../../utils/groupResultsForPrinting";

import PrintRouter
from "./PrintRouter";

export default function GroupedPrintRenderer({

  results = [],

  patient = {},

  printMode = "internal",

}) {

console.log(

  "GROUPED RENDERER RESULTS:",

  results

);

  const grouped =

    groupResultsForPrinting(

      results

    );

  return (

    <>

      {/* =========================
          CHEMISTRY SINGLES
      ========================= */}

      {grouped.chemistrySingles.length >

        0 && (

        <PrintRouter

          department="Chemistry"

          results={
            grouped.chemistrySingles
          }

          patient={patient}

          printMode={printMode}

        />

      )}

      {/* =========================
          CHEMISTRY PANELS
      ========================= */}

      {grouped.chemistryPanels.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`chem-panel-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          HAEMATOLOGY SINGLES
      ========================= */}

      {grouped.haematologySingles.length >

        0 && (

        <PrintRouter

          department="Haematology"

          results={
            grouped.haematologySingles
          }

          patient={patient}

          printMode={printMode}

        />

      )}

      {/* =========================
          HAEMATOLOGY PANELS
      ========================= */}

      {grouped.haematologyPanels.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`haem-panel-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          QUALITATIVE
      ========================= */}

      {grouped.qualitative.length >

        0 && (

        <PrintRouter

          department="Serology"

          results={
            grouped.qualitative
          }

          patient={patient}

          printMode={printMode}

        />

      )}

      {/* =========================
          ENDOCRINOLOGY SINGLES
      ========================= */}

      {grouped.endocrinologySingles.length >

        0 && (

        <PrintRouter

          department="Endocrinology"

          results={
            grouped.endocrinologySingles
          }

          patient={patient}

          printMode={printMode}

        />

      )}

      {/* =========================
          ENDOCRINOLOGY PANELS
      ========================= */}

      {grouped.endocrinologyPanels.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`endo-panel-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          SPECIAL TESTS
      ========================= */}

      {grouped.specialTests.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`special-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          MICROBIOLOGY
      ========================= */}

      {grouped.microbiology.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`micro-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          RADIOLOGY
      ========================= */}

      {grouped.radiology.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`radio-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

      {/* =========================
          HISTOLOGY
      ========================= */}

      {grouped.histology.map(

        (

          report,

          index

        ) => (

          <PrintRouter

            key={`histo-${index}`}

            department={
              report.department
            }

            results={[report]}

            patient={patient}

            printMode={printMode}

          />

        )

      )}

    </>

  );

}