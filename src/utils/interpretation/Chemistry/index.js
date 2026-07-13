import defaultInterpretation from "./defaultInterpretation";

import interpretLiver from "./liver";
import interpretBilirubin from "./bilirubin";
import interpretElectrolytes from "./electrolytes";
import interpretDiabetes from "./diabetes";
import interpretLipid from "./lipid";
import interpretMinerals from "./minerals";
import interpretPancreas from "./pancreas";
import interpretProteins from "./proteins";
import interpretCardiac from "./cardiac";
import interpretThyroid from "./thyroid";
import interpretIronStudies from "./ironStudies";
import interpretInflammatory from "./inflammatory";
import interpretTumorMarkers from "./tumorMarkers";

/* ==========================================================
   CHEMISTRY MASTER DISPATCHER
========================================================== */

export default function interpretChemistry(

  report = {},

  resultMap = {}

) {

  const engine = (

    report.interpretation_engine ||

    report.engine ||

    ""

  ).trim().toLowerCase();

  switch (engine) {

    case "liver":

      return interpretLiver(

        report,

        resultMap

      );

    case "bilirubin":

      return interpretBilirubin(

        report,

        resultMap

      );

    case "electrolytes":

      return interpretElectrolytes(

        report,

        resultMap

      );

    case "diabetes":

      return interpretDiabetes(

        report,

        resultMap

      );

    case "lipid":

      return interpretLipid(

        report,

        resultMap

      );

    case "minerals":

      return interpretMinerals(

        report,

        resultMap

      );

    case "pancreas":

      return interpretPancreas(

        report,

        resultMap

      );

    case "proteins":

      return interpretProteins(

        report,

        resultMap

      );

    case "cardiac":

      return interpretCardiac(

        report,

        resultMap

      );

    case "thyroid":

      return interpretThyroid(

        report,

        resultMap

      );

    case "iron":

      return interpretIronStudies(

        report,

        resultMap

      );

    case "inflammatory":

      return interpretInflammatory(

        report,

        resultMap

      );

    case "tumor":

      return interpretTumorMarkers(

        report,

        resultMap

      );

    default:

      return defaultInterpretation(

        report,

        resultMap

      );

  }

}