/* ==========================================================
   MASTER LABORATORY INTERPRETATION ENGINE

   PEFA Medical Diagnostic Services

   This engine routes every laboratory report to the
   appropriate departmental interpretation engine.

   Departments Supported

   • Clinical Chemistry
   • Endocrinology
   • Diabetes
   • Haematology
   • Serology
   • Microbiology
   • Histopathology
   • Parasitology
========================================================== */

import interpretChemistry
from "./chemistry";

import interpretHaematology
from "./hematology";

import interpretMicrobiology
from "./microbiology";

import interpretSerology
from "./serology";

import interpretHistopathology
from "./histopathology";

import interpretParasitology
from "./parasitology";

/* ==========================================================
   MASTER INTERPRETER
========================================================== */

export default function masterInterpreter(

  report = {},

  resultMap = {}

) {

  const department = (

    report.department ||

    report.test_department ||

    ""

  ).trim();

  switch (department) {

    case "Chemical Pathology":

    case "Clinical Chemistry":

    case "Chemistry":

      return interpretChemistry(

        report,

        resultMap

      );

    case "Haematology":

      return interpretHaematology(

        report,

        resultMap

      );

    case "Microbiology":

      return interpretMicrobiology(

        report,

        resultMap

      );

    case "Serology":

      return interpretSerology(

        report,

        resultMap

      );

    case "Histopathology":

      return interpretHistopathology(

        report,

        resultMap

      );

    case "Parasitology":

      return interpretParasitology(

        report,

        resultMap

      );

    default:

      return {

        interpretation: "",

        impression: "",

        recommendation: "",

      };

  }

}