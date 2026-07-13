import QualitativeForm from "./QualitativeForm";
import WidalForm from "./WidalForm";

import HaematologySingleForm from "./HaematologySingleForm";
import EndocrinologySingleForm from "./EndocrinologySingleForm";
import ChemistrySingleForm from "./ChemistrySingleForm";

import UrinalysisForm from "./UrinalysisForm";
import SFAForm from "./SFAForm";
import DrugScreenForm from "./DrugScreenForm";

import StoolAnalysisForm
from "./StoolAnalysisForm";

import GroupingCrossMatchForm
from "./GroupingCrossMatchForm";

import DonorScreeningForm
from "./DonorScreeningForm";

import MCSForm from "./MCSForm";

import ChemistryPanelForm
from "./ChemistryPanelForm";

import CBCPanel from "./CBCPanel";

export default function ResultTemplateRenderer({

  test = {},

  patient = {},

  resultData,

  setResultData,

}) {

  const testName = (

    test.test_name ||

    ""

  ).toLowerCase();

  const templateType = (

    test.template_type ||

    ""

  ).toLowerCase();

  /* ==========================
     QUALITATIVE TESTS
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

  /* ==========================
     HAEMATOLOGY SINGLES
  ========================== */

  const haematologySingles = [

    "pcv",

    "haemoglobin",

    "hemoglobin",

    "wbc",

    "total wbc",

    "platelet count",

    "platelets",

    "esr",

    "reticulocyte count",

  ];

  /* ==========================
     ENDOCRINOLOGY SINGLES
  ========================== */

  const endocrinologySingles = [

    "tsh",

    "ft3",

    "ft4",

    "prolactin",

    "progesterone",

    "testosterone",

    "fsh",

    "lh",

    "estradiol",

    "amh",

    "beta hcg",

    "cortisol",

    "insulin",

    "c-peptide",

    "psa",

    "ferritin",

    "vitamin d",

  ];

  /* ==========================
     WIDAL
  ========================== */

  if (

    testName.includes(

      "widal"

    )

  ) {

    return (

      <WidalForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     QUALITATIVE
  ========================== */

  if (

    qualitativeTests.includes(

      testName

    )

  ) {

    return (

      <QualitativeForm

        test={test}

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     HAEMATOLOGY SINGLE
  ========================== */

  if (

    haematologySingles.includes(

      testName

    )

  ) {

    return (

      <HaematologySingleForm

        test={test}

        patient={patient}

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     ENDOCRINOLOGY SINGLE
  ========================== */

  if (

    endocrinologySingles.includes(

      testName

    )

  ) {

    return (

      <EndocrinologySingleForm

        test={test}

        patient={patient}

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     URINALYSIS
  ========================== */

  if (

    testName.includes(

      "urinalysis"

    )

  ) {

    return (

      <UrinalysisForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

 /* ==========================
   STOOL ANALYSIS
========================== */

if (

  templateType ===

  "stool_analysis"

) {

  return (

    <StoolAnalysisForm

      resultData={resultData}

      setResultData={setResultData}

    />

  );

}

/* ==========================
   SEMINAL FLUID ANALYSIS
========================== */


if (

  templateType ===

  "sfa"

) {

  return (

    <SFAForm

      resultData={resultData}

      setResultData={setResultData}

    />

  );

}


  /* ==========================
     DRUG SCREEN
  ========================== */

  if (

    testName.includes(

      "drug"

    )

  ) {

    return (

      <DrugScreenForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     CROSS MATCH
  ========================== */

  if (

    testName.includes(

      "cross"

    )

  ) {

    return (

      <GroupingCrossMatchForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     DONOR SCREENING
  ========================== */

  if (

    testName.includes(

      "donor"

    )

  ) {

    return (

      <DonorScreeningForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     MCS
  ========================== */

  if (

    testName.includes(

      "mcs"

    )

  ) {

    return (

      <MCSForm

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

/* ==========================
   CBC / FBC PANEL
========================== */

if (

  [

    "fbc",

    "cbc",

    "full_blood_count"

  ].includes(

    templateType

  )

) {

  return (

    <CBCPanel

      resultData={resultData}

      setResultData={setResultData}

    />

  );

}


  /* ==========================
     CHEMISTRY PANELS
  ========================== */

 if (

  [

    "liver_function_test",

    "lft",

    "kidney_function_test",

    "kft",

    "lipid_profile",

    "hormonal_profile",

    "free_tft",

    "total_tft",

  ].includes(

    templateType

  )

) {

    return (

      <ChemistryPanelForm

        test={test}

        patient={patient}

        resultData={resultData}

        setResultData={setResultData}

      />

    );

  }

  /* ==========================
     DEFAULT
  ========================== */

  return (

    <ChemistrySingleForm

      test={test}

      patient={patient}

      resultData={resultData}

      setResultData={setResultData}

    />

  );

}