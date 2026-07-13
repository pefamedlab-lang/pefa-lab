import { useState } from "react";

export default function WidalForm({

  resultData,

  setResultData,

}) {

  const [
    form,
    setForm,
  ] = useState({

    typhiO: "",
    typhiH: "",

    paraAO: "",
    paraAH: "",

    paraBO: "",
    paraBH: "",

    paraCO: "",
    paraCH: "",

  });

  const isSignificant = (

  value

) => {

  const num =

    Number(

      String(value)

        .replace("1:", "")

    );

  return num >= 160;

};

const generateInterpretation = (

  data

) => {

  const significant = [];

  if (

    isSignificant(
      data.typhiO
    ) ||

    isSignificant(
      data.typhiH
    )

  ) {

    significant.push(
      "Salmonella Typhi"
    );

  }

  if (

    isSignificant(
      data.paraAO
    ) ||

    isSignificant(
      data.paraAH
    )

  ) {

    significant.push(
      "Salmonella Paratyphi A"
    );

  }

  if (

    isSignificant(
      data.paraBO
    ) ||

    isSignificant(
      data.paraBH
    )

  ) {

    significant.push(
      "Salmonella Paratyphi B"
    );

  }

  if (

    isSignificant(
      data.paraCO
    ) ||

    isSignificant(
      data.paraCH
    )

  ) {

    significant.push(
      "Salmonella Paratyphi C"
    );

  }

  if (

    significant.length === 0

  ) {

    return {

      interpretation:

        "No significant Widal titre detected.",

      impression:

        "Serological evidence of enteric fever was not demonstrated. Clinical correlation and culture are advised where necessary.",

    };

  }

  return {

    interpretation:

      `Significant antibody titre detected against ${significant.join(", ")}.`,

    impression:

      "Findings may be suggestive of enteric fever. Correlate clinically and with stool/blood culture where indicated.",

  };

};

const updateField = (

  field,

  value

) => {

  const updated = {

    ...form,

    [field]: value,

  };

  const autoComment =

    generateInterpretation(
      updated
    );

  const finalData = {

    ...updated,

    interpretation:

      autoComment
        .interpretation,

    impression:

      autoComment
        .impression,

  };

  setForm(
    finalData
  );

  setResultData(
    finalData
  );

};

const titreOptions = [

  "",

  "1:20",

  "1:40",

  "1:80",

  "1:160",

  "1:320",

];

  return (

    <div>

      <h3>
        Widal Test
      </h3>

      <table className="result-table">

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

    <td>
      Typhi
    </td>

    <td>

      <select
        value={form.typhiO}
        onChange={(e)=>
          updateField(
            "typhiO",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

    <td>

      <select
        value={form.typhiH}
        onChange={(e)=>
          updateField(
            "typhiH",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

  </tr>

  <tr>

    <td>
      Paratyphi A
    </td>

    <td>

      <select
        value={form.paraAO}
        onChange={(e)=>
          updateField(
            "paraAO",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

    <td>

      <select
        value={form.paraAH}
        onChange={(e)=>
          updateField(
            "paraAH",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

  </tr>

  <tr>

    <td>
      Paratyphi B
    </td>

    <td>

      <select
        value={form.paraBO}
        onChange={(e)=>
          updateField(
            "paraBO",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

    <td>

      <select
        value={form.paraBH}
        onChange={(e)=>
          updateField(
            "paraBH",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

  </tr>

  <tr>

    <td>
      Paratyphi C
    </td>

    <td>

      <select
        value={form.paraCO}
        onChange={(e)=>
          updateField(
            "paraCO",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

    <td>

      <select
        value={form.paraCH}
        onChange={(e)=>
          updateField(
            "paraCH",
            e.target.value
          )
        }
      >

        {titreOptions.map(
          (item) => (

            <option
              key={item}
              value={item}
            >

              {item || "Select"}

            </option>

          )
        )}

      </select>

    </td>

  </tr>

</tbody>

</table>

<div className="auto-comment-box">

  <label>

    Interpretation

  </label>

  <textarea

    readOnly

    className="auto-comment"

    value={

      form.interpretation ||

      ""

    }

  />

</div>

<div className="auto-comment-box">

  <label>

    Impression

  </label>

  <textarea

    readOnly

    className="auto-comment"

    value={

      form.impression ||

      ""

    }

  />

</div>

<textarea

  placeholder="Scientist Remark"

  value={
    form.scientistRemark || ""
  }

  onChange={(e)=>
    updateField(
      "scientistRemark",
      e.target.value
    )
  }

/>

    </div>

  );

}