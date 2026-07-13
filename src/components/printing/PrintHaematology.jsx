
import {

  getFullTestName,

} from "../../utils/fullTestName";

import DepartmentTitle from "./DepartmentTitle";
import TestTitle from "./TestTitle";

export default function PrintHaematology({

  results = [],

}) {

  if (!results.length) {

    return null;

  }

  return (

    <div className="haematology-report">

      {/* ==========================
    REPORT HEADER
========================== */}

<DepartmentTitle
  title="HAEMATOLOGY REPORT"
/>

<TestTitle
  title={

    getFullTestName(

      results[0]?.test_type ||

      results[0]?.test_name ||

      "FBC"

    )

  }
  department="haematology"
/>

      {results.map((test, index) => {

        let data =

  test.result_data ||

  test.result ||

  {};

if (

  typeof data === "string"

) {

  try {

    data = JSON.parse(data);

  } catch {

    data = {};

  }

}

const rows = Object.entries(data);

const getCBCInterpretation = () => {

  const getFlag = (name) =>
    rows.find(([p]) => p === name)?.[1]?.flag;

  const getResult = (name) =>
    Number(
      rows.find(([p]) => p === name)?.[1]?.result
    );

  const diagnosis = [];
  const impression = [];

  /* =========================
     ERYTHROCYTE SERIES
  ========================= */

  const hb = getResult("Hemoglobin");

  const anaemia =
    getFlag("Hemoglobin") === "Low" ||
    getFlag("PCV") === "Low" ||
    getFlag("RBC") === "Low";

  const microcytic =
    getFlag("MCV") === "Low";

  const macrocytic =
    getFlag("MCV") === "High";

  const hypochromic =
    getFlag("MCH") === "Low" ||
    getFlag("MCHC") === "Low";

  const hyperchromic =
    getFlag("MCHC") === "High";

  let severity = "";

  if (!isNaN(hb)) {
    if (hb < 7) severity = "Severe";
    else if (hb < 10) severity = "Moderate";
    else if (hb < 13) severity = "Mild";
  }

  if (
    anaemia &&
    microcytic &&
    hypochromic
  ) {

    diagnosis.push(
      `${severity} microcytic hypochromic anaemia suggestive of iron deficiency anaemia`
    );

    impression.push(
      "Iron deficiency anaemia"
    );
  }

  else if (
    anaemia &&
    macrocytic
  ) {

    diagnosis.push(
      `${severity} macrocytic anaemia. Consider Vitamin B12/Folate deficiency`
    );

    impression.push(
      "Macrocytic anaemia"
    );
  }

  else if (
    anaemia
  ) {

    diagnosis.push(
      `${severity} normocytic anaemia`
    );

    impression.push(
      "Normocytic anaemia"
    );
  }

  if (hyperchromic) {

    diagnosis.push(
      "Hyperchromia present"
    );
  }

  if (
    getFlag("Hemoglobin") === "High" ||
    getFlag("PCV") === "High"
  ) {

    diagnosis.push(
      "Erythrocytosis/polycythaemia pattern"
    );

    impression.push(
      "Polycythaemia"
    );
  }

  /* =========================
     LEUCOCYTE SERIES
  ========================= */

  const wbc = getResult("WBC");

  let infectionSeverity = "";

  if (!isNaN(wbc)) {
    if (wbc >= 30)
      infectionSeverity = "Marked";
    else if (wbc >= 20)
      infectionSeverity = "Moderate";
    else if (wbc > 11)
      infectionSeverity = "Mild";
  }

  if (
    getFlag("WBC") === "High" &&
    getFlag("Neutrophils") === "High"
  ) {

    diagnosis.push(
      `${infectionSeverity} neutrophilic leukocytosis suggestive of bacterial infection`
    );

    impression.push(
      "Bacterial infection"
    );
  }

  if (
    getFlag("WBC") === "High" &&
    getFlag("Lymphocytes") === "High"
  ) {

    diagnosis.push(
      "Lymphocytic leukocytosis suggestive of viral infection"
    );

    impression.push(
      "Possible viral infection"
    );
  }

  if (
    getFlag("WBC") === "Low"
  ) {

    diagnosis.push(
      "Leukopenia present"
    );

    impression.push(
      "Leukopenia"
    );
  }

  if (
    getFlag("Neutrophils") === "Low"
  ) {

    diagnosis.push(
      "Neutropenia present"
    );
  }

  if (
    getFlag("Lymphocytes") === "Low"
  ) {

    diagnosis.push(
      "Lymphopenia present"
    );
  }

  if (
    getFlag("Monocytes") === "High"
  ) {

    diagnosis.push(
      "Monocytosis present"
    );
  }

  if (
    getFlag("Eosinophils") === "High"
  ) {

    diagnosis.push(
      "Eosinophilia suggestive of allergic disorder or parasitic infestation"
    );

    impression.push(
      "Allergic/parasitic condition"
    );
  }

  if (
    getFlag("Basophils") === "High"
  ) {

    diagnosis.push(
      "Basophilia present"
    );
  }

  /* =========================
     PLATELET SERIES
  ========================= */

  if (
    getFlag("Platelets") === "Low"
  ) {

    diagnosis.push(
      "Thrombocytopenia present"
    );

    impression.push(
      "Thrombocytopenia"
    );
  }

  if (
    getFlag("Platelets") === "High"
  ) {

    diagnosis.push(
      "Reactive thrombocytosis present"
    );

    impression.push(
      "Thrombocytosis"
    );
  }

  /* =========================
     CYTOPENIA CHECK
  ========================= */

  const lowCount = [
    anaemia,
    getFlag("WBC") === "Low",
    getFlag("Platelets") === "Low",
  ].filter(Boolean).length;

  if (lowCount === 2) {

    diagnosis.push(
      "Bicytopenia detected"
    );

    impression.push(
      "Bicytopenia"
    );
  }

  if (lowCount === 3) {

    diagnosis.push(
      "Pancytopenia detected. Consider bone marrow suppression or infiltrative disorders"
    );

    impression.push(
      "Pancytopenia"
    );
  }

  /* =========================
     NORMAL REPORT
  ========================= */

  if (
    diagnosis.length === 0
  ) {

    return {
      interpretation:
        "Full blood count parameters are within normal limits.",
      impression:
        "No significant abnormality detected.",
    };
  }

  return {
    interpretation:
      diagnosis.join(". ") + ".",
    impression:
      [...new Set(impression)].join(
        " with "
      ) + ".",
  };
};
        return (

          <div

            key={index}

            className="haem-section"

          >

         

            <table className="premium-table">

            <thead>

  <tr>

    <th>Parameter</th>

    <th>Result</th>

    <th>Unit</th>

    <th>Reference Range</th>

    <th>Flag</th>

  </tr>

</thead>

            <tbody>

  {/* ERYTHROCYTE SERIES */}

  <tr>

    <td
      colSpan="5"
      className="series-header"
    >

      ERYTHROCYTE SERIES

    </td>

  </tr>

  {rows
    .filter(([p]) =>
      [
        "RBC",
        "Hemoglobin",
        "PCV",
        "MCV",
        "MCH",
        "MCHC",
      ].includes(p)
    )
    .map(([parameter, item]) => (

      <tr key={parameter}>

        <td>{parameter}</td>

        <td
          className={
            item?.flag === "High"
              ? "result-high"
              : item?.flag === "Low"
              ? "result-low"
              : "result-normal"
          }
        >
          {item?.result}
        </td>

        <td>{item?.unit}</td>

        <td>{item?.reference_range}</td>

        <td>

          <span
            className={
              item?.flag === "High"
                ? "flag-high"
                : item?.flag === "Low"
                ? "flag-low"
                : "flag-normal"
            }
          >

            {item?.flag}

          </span>

        </td>

      </tr>

    ))}


  {/* LEUCOCYTE SERIES */}

  <tr>

    <td
      colSpan="5"
      className="series-header"
    >

      LEUCOCYTE SERIES

    </td>

  </tr>

  {rows
    .filter(([p]) =>
      [
        "WBC",
        "Neutrophils",
        "Lymphocytes",
        "Monocytes",
        "Eosinophils",
        "Basophils",
      ].includes(p)
    )
    .map(([parameter, item]) => (

      <tr key={parameter}>

        <td>{parameter}</td>

        <td
          className={
            item?.flag === "High"
              ? "result-high"
              : item?.flag === "Low"
              ? "result-low"
              : "result-normal"
          }
        >
          {item?.result}
        </td>

        <td>{item?.unit}</td>

        <td>{item?.reference_range}</td>

        <td>

          <span
            className={
              item?.flag === "High"
                ? "flag-high"
                : item?.flag === "Low"
                ? "flag-low"
                : "flag-normal"
            }
          >

            {item?.flag}

          </span>

        </td>

      </tr>

    ))}

  {/* PLATELET SERIES */}

  <tr>

    <td
      colSpan="5"
      className="series-header"
    >

      PLATELET SERIES

    </td>

  </tr>

  {rows
    .filter(([p]) =>
      [
        "Platelets",
      ].includes(p)
    )
    .map(([parameter, item]) => (

      <tr key={parameter}>

        <td>{parameter}</td>

        <td
          className={
            item?.flag === "High"
              ? "result-high"
              : item?.flag === "Low"
              ? "result-low"
              : "result-normal"
          }
        >
          {item?.result}
        </td>

        <td>{item?.unit}</td>

        <td>{item?.reference_range}</td>

        <td>

          <span
            className={
              item?.flag === "High"
                ? "flag-high"
                : item?.flag === "Low"
                ? "flag-low"
                : "flag-normal"
            }
          >

            {item?.flag}

          </span>

        </td>

      </tr>

    ))}

</tbody>

           </table>

{/* ==========================
    HAEMATOLOGY COMMENT
========================== */}

<div className="laboratory-comment">

  {(() => {

    const report =
      getCBCInterpretation();

    return (

      <>

        <div className="comment-line">

          <span className="comment-label">

            Interpretation:

          </span>

          <span className="comment-value">

            {report.interpretation}

          </span>

        </div>

        <div className="comment-line">

          <span className="comment-label">

            Impression:

          </span>

          <span className="comment-value">

            {report.impression}

          </span>

        </div>

      </>

    );

  })()}


    
 
</div>

</div>

        );

      })}
    </div>

  );

}