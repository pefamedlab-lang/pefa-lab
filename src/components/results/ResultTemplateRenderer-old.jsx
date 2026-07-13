
  /* =========================
     WIDAL
  ========================= */
console.log(
  "TEST TYPE:",
  test.template_type
);

console.log(
  "TEST NAME:",
  test.test_name
);

  if (
  test.template_type ===
  "widal"
) {

  return (
    <WidalForm
      resultData={resultData}
      setResultData={setResultData}
    />
  );
}

{

    return (

      <div>

        <h3>
          Widal Test
        </h3>

        <table
          className="result-table"
        >

          <thead>

            <tr>

              <th>
                Antigen
              </th>

              <th>
                O Titre
              </th>

              <th>
                H Titre
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>
              <td>Typhi</td>
              <td><input /></td>
              <td><input /></td>
            </tr>

            <tr>
              <td>Paratyphi A</td>
              <td><input /></td>
              <td><input /></td>
            </tr>

            <tr>
              <td>Paratyphi B</td>
              <td><input /></td>
              <td><input /></td>
            </tr>

            <tr>
              <td>Paratyphi C</td>
              <td><input /></td>
              <td><input /></td>
            </tr>

          </tbody>

        </table>

      </div>

    );
  }

  /* =========================
     MCS
  ========================= */

  if (
    test.template_type ===
    "mcs"
  ) {

    return (
  <MCSForm
    resultData={resultData}
    setResultData={setResultData}
  />
);
  }

if (
  test.template_type ===
  "sfa"
) {

 return (
  <SFAForm
    resultData={resultData}
    setResultData={setResultData}
  />
);

}

if (
  test.template_type ===
  "stool_analysis"
) {

 return (
  <StoolAnalysisForm
    resultData={resultData}
    setResultData={setResultData}
  />
);

}

  return (

    <div>

      Template Not Found

    </div>

  );
}