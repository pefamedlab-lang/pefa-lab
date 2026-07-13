import PrintChemistry from "./PrintChemistry";
import PrintHaematology from "./PrintHaematology";
import PrintMicrobiology from "./PrintMicrobiology";
import PrintBloodBank from "./PrintBloodBank";
import PrintRadiology from "./PrintRadiology";
import PrintHistology from "./PrintHistology";

export default function PrintReport({

  test,
  result,

}) {

  switch (
    test.department
  ) {

    case "Chemical Pathology":

      return (
        <PrintChemistry
          test={test}
          result={result}
        />
      );

    case "Haematology":

      return (
        <PrintHaematology
          test={test}
          result={result}
        />
      );

    case "Microbiology":

      return (
        <PrintMicrobiology
          test={test}
          result={result}
        />
      );

    case "Blood Transfusion":

      return (
        <PrintBloodBank
          test={test}
          result={result}
        />
      );

    case "Radiology":

      return (
        <PrintRadiology
          test={test}
          result={result}
        />
      );

    case "Histology":

      return (
        <PrintHistology
          test={test}
          result={result}
        />
      );

    default:

      return null;

  }

}