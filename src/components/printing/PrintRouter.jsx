import PrintEngine from "./PrintEngine";
import PrintWidal from "./PrintWidal";
import PrintQualitative from "./PrintQualitative";

import PrintChemistryTable from "./PrintChemistryTable";
import PrintEndocrinologySingle from "./PrintEndocrinologySingle";
import PrintEndocrinologyPanel
from "./PrintEndocrinologyPanel";

import PrintHaematology from "./PrintHaematology";
import PrintHaematologySingle from "./PrintHaematologySingle";

import PrintUrinalysis from "./PrintUrinalysis";
import PrintSFA from "./PrintSFA";
import PrintDrugScreen from "./PrintDrugScreen";
import PrintGroupingCrossMatch from "./PrintGroupingCrossMatch";
import PrintDonorScreening from "./PrintDonorScreening";
import PrintMicrobiologyMCS from "./PrintMicrobiologyMCS";
import PrintStoolAnalysis
from "./PrintStoolAnalysis";

import PrintRadiology from "./PrintRadiology";
import PrintHistology from "./PrintHistology";

import PrintOBS
from "./radiology/PrintOBS";

import PrintPelvicScan
from "./radiology/PrintPelvicScan";

import PrintAbdominalScan
from "./radiology/PrintAbdominalScan";

import PrintAbdominoPelvicScan
from "./radiology/PrintAbdominoPelvicScan";

import PrintBreastScan
from "./radiology/PrintBreastScan";

import PrintScrotalScan
from "./radiology/PrintScrotalScan";

import PrintKidneyScan
from "./radiology/PrintKidneyScan";

import PrintLiverScan
from "./radiology/PrintLiverScan";

import PrintThyroidScan
from "./radiology/PrintThyroidScan";

import PrintProstateScan
from "./radiology/PrintProstateScan";

import PrintSoftTissueScan
from "./radiology/PrintSoftTissueScan";

export default function PrintRouter({

  department = "",

  results = [],

  patient = {},

  printMode = "internal",

}) {

  if (!results?.length) {

    return null;

  }

  const report = results[0];

  const testType = (

    report.test_type ||

    report.test_name ||

    ""

  ).toLowerCase().trim();

  const templateType = (

    report.template_type ||

    ""

  ).toLowerCase().trim();

  const dept = (

    department ||

    report.department ||

    ""

  ).toLowerCase().trim();

  /* ==========================
     MASTER LISTS
  ========================== */

  const qualitativeTests = [

    "hbsag",
    "hcv",
    "hiv",
    "hiv i & ii",
    "vdrl",
    "blood group",
    "blood grouping",
    "genotype",
    "pregnancy test",
    "malaria parasite",
    "mp",
    "rheumatoid factor",
    "rf",
    "crp qualitative",

  ];

  const haematologySingles = [

    "pcv",
    "hemoglobin",
    "haemoglobin",
    "wbc",
    "total wbc",
    "platelet count",
    "platelets",
    "esr",
    "reticulocyte count",

  ];

  const endocrinologySingles = [

  "tsh",
  "ft3",
  "ft4",

  "t3",
  "t4",

  "fsh",
  "lh",

  "prolactin",
  "progesterone",

  "testosterone",
  "estradiol",

  "amh",

  "cortisol",
  "insulin",

  "beta hcg",
  "b-hcg",

  "vitamin d",
  "c-peptide",
  "pth",

];

  const chemistrySingles = [

  "fbs",
  "rbs",
  "hba1c",

  "psa",
  "total psa",
  "free psa",

  "uric acid",
  "calcium",
  "magnesium",
  "phosphorus",

  "creatinine",
  "urea",

  "d-dimer",

];

 const chemistryPanels = [

  "kft",

  "kidney_function_test",

  "lft",

  "liver_function_test",

  "lipid profile",

  "lipid_profile",

  "free tft",

  "free_tft",

  "total tft",

  "total_tft",

  "hormonal profile",

  "hormonal_profile",

  "quantitative_panel",

];

const endocrinologyPanels = [

  "hormonal_profile",

  "hormonal profile",

  "free_tft",

  "free tft",

  "total_tft",

  "total tft",

];

  const haematologyPanels = [

    "fbc",
    "cbc",
    "full_blood_count",
    "coagulation_profile",
    "cd4_count",

  ];

 /* ==========================
   UNIVERSAL PRINT ENGINE
========================== */

const render = (Component) => (

  <PrintEngine

    printMode={printMode}

    patient={patient}

    results={results}

  >

    <Component

      results={results}

      patient={patient}

    />

  </PrintEngine>

);

  /* ==========================
     WIDAL
  ========================== */

  if (testType.includes("widal")) {

    return render(PrintWidal);

  }

  /* ==========================
     QUALITATIVE
  ========================== */

  if (

    qualitativeTests.includes(testType)

  ) {

    return render(PrintQualitative);

  }

  /* ==========================
     HAEMATOLOGY SINGLES
  ========================== */

  if (

    haematologySingles.includes(testType)

  ) {

    return render(PrintHaematologySingle);

  }

  /* ==========================
   CHEMISTRY SINGLES
========================== */

if (

  results.length > 1 &&

  results.every(item =>

    chemistrySingles.includes(

      (
        item.test_type ||

        item.test_name ||

        ""

      )

      .toLowerCase()

      .trim()

    )

  )

) {

  return render(

    PrintChemistryTable

  );

}

/* SINGLE CHEMISTRY */

if (

  chemistrySingles.includes(

    testType

  )

) {

  return render(

    PrintChemistryTable

  );

}

  /* ==========================
     ENDOCRINOLOGY SINGLES
  ========================== */

  if (

    endocrinologySingles.includes(testType)

  ) {

    return render(PrintEndocrinologySingle);

  }

/* ==========================
   ENDOCRINOLOGY PANELS
========================== */

if (

  endocrinologyPanels.includes(

    templateType

  ) ||

  endocrinologyPanels.includes(

    testType

  )

) {

  return render(

    PrintEndocrinologyPanel

  );

}

  /* ==========================
     CHEMISTRY PANELS
  ========================== */

  if (

    chemistryPanels.includes(testType) ||

    chemistryPanels.includes(templateType)

  ) {

    return render(PrintChemistryTable);

  }

  /* ==========================
     FBC / CBC
  ========================== */

  if (

    haematologyPanels.includes(templateType) ||

    testType.includes("fbc") ||

    testType.includes("cbc") ||

    testType.includes("full blood count")

  ) {

    return render(PrintHaematology);

  }

  /* ==========================
     URINALYSIS
  ========================== */

  if (

    testType.includes("urinalysis")

  ) {

    return render(PrintUrinalysis);

  }

 /* ==========================
   STOOL ANALYSIS
========================== */

if (

  testType.includes(

    "stool"

  )

) {

  return render(

    PrintStoolAnalysis

  );

}

/* ==========================
   SEMINAL FLUID ANALYSIS
========================== */

if (

  testType.includes(

    "sfa"

  ) ||

  testType.includes(

    "seminal"

  ) ||

  testType.includes(

    "semen"

  )

) {

  return render(

    PrintSFA

  );

}

  /* ==========================
     DRUG SCREENING
  ========================== */

  if (

    testType.includes("drug")

  ) {

    return render(PrintDrugScreen);

  }

  /* ==========================
     GROUPING & CROSSMATCH
  ========================== */

  if (

    testType.includes("cross") ||

    testType.includes("grouping")

  ) {

    return render(PrintGroupingCrossMatch);

  }

  /* ==========================
     DONOR SCREENING
  ========================== */

  if (

    testType.includes("donor")

  ) {

    return render(PrintDonorScreening);

  }

  /* ==========================
     MCS
  ========================== */

  if (

    testType.includes("mcs") ||

    testType.includes("culture") ||

    testType.includes("sensitivity")

  ) {

    return render(PrintMicrobiologyMCS);

  }

  /* ==========================
     DEPARTMENT FALLBACKS
  ========================== */

  if (

    dept.includes("chem")

  ) {

    return render(PrintChemistryTable);

  }

  if (

    dept.includes("haemat") ||

    dept.includes("hemat")

  ) {

    return render(PrintHaematology);

  }

  if (

    dept.includes("sero") ||

    dept.includes("immun")

  ) {

    return render(PrintQualitative);

  }

  if (

    dept.includes("micro")

  ) {

    return render(PrintMicrobiologyMCS);

  }

  if (

    dept.includes("radio")

  ) {

    return render(PrintRadiology);

  }

  if (

    dept.includes("histo")

  ) {

    return render(PrintHistology);

  }

/* ==========================
   ULTRASOUND TEMPLATES
========================== */

if (

  templateType === "obs_scan"

) {

  return render(PrintOBS);

}

if (

  templateType === "pelvic_scan"

) {

  return render(PrintPelvicScan);

}

if (

  templateType === "abdominal_scan"

) {

  return render(PrintAbdominalScan);

}

if (

  templateType === "abdominopelvic_scan"

) {

  return render(PrintAbdominoPelvicScan);

}

if (

  templateType === "breast_scan"

) {

  return render(PrintBreastScan);

}

if (

  templateType === "scrotal_scan"

) {

  return render(PrintScrotalScan);

}

if (

  templateType === "kidney_scan"

) {

  return render(PrintKidneyScan);

}

if (

  templateType === "liver_scan"

) {

  return render(PrintLiverScan);

}

if (

  templateType === "thyroid_scan"

) {

  return render(PrintThyroidScan);

}

if (

  templateType === "prostate_scan"

) {

  return render(PrintProstateScan);

}

if (

  templateType === "soft_tissue_scan"

) {

  return render(PrintSoftTissueScan);

}

console.log(
  "PRINT ROUTER:",
  {

    department,

    testType,

    templateType,

    printMode,

    resultsCount:

      results.length,

  }
);

  /* ==========================
     FINAL FALLBACK
  ========================== */

return (

  <PrintEngine

    printMode={printMode}

    patient={patient}

    results={results}

  >

    <div
      style={{
        padding: 40,
        textAlign: "center",
      }}
    >

      <h3>

        No Print Template Found

      </h3>

      <p>

        Test Type:{" "}

        <strong>

          {report.test_type || "N/A"}

        </strong>

      </p>

      <p>

        Template:{" "}

        <strong>

          {templateType || "N/A"}

        </strong>

      </p>

      <p>

        Department:{" "}

        <strong>

          {department || "N/A"}

        </strong>

      </p>

    </div>

  </PrintEngine>

);


}