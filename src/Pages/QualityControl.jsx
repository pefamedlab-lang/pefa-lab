import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/qc.css";

import {
  logAudit,
} from "../utils/auditLogger";

export default function QualityControl() {

  const [
    qcData,
    setQcData,
  ] = useState([]);

const [
  search,
  setSearch,
] = useState("");

  const [
    form,
    setForm,
  ] = useState({

    department: "",

    analyte: "",

    control_level: "",

    target_value: "",

    observed_value: "",

instrument: "",
lot_number: "",

    sd: "",

    qc_date: "",

  });

  useEffect(() => {

    loadQC();

  }, []);

  const loadQC =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "quality_control"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false,
          }
        );

      setQcData(
        data || []
      );

    };

  const addQC =
    async () => {

      const target =
        Number(
          form.target_value
        );

      const observed =
        Number(
          form.observed_value
        );

      const sd =
        Number(
          form.sd
        );

      const status =

        Math.abs(
          observed -
          target
        ) <= sd

          ? "PASS"

          : "FAIL";

      const user =
        JSON.parse(
          localStorage.getItem(
            "pefa_user"
          ) || "{}"
        );

     const query =

  form.id

    ? supabase

        .from(
          "quality_control"
        )

       .update({

  department:
    form.department,

  analyte:
    form.analyte,

  control_level:
    form.control_level,

  target_value:
    form.target_value,

  observed_value:
    form.observed_value,

  sd:
    form.sd,

  qc_date:
    form.qc_date,

  status,

  scientist:
    user.full_name,

})

        .eq(
          "id",
          form.id
        )

    : supabase

        .from(
          "quality_control"
        )

        .insert([

          {

            ...form,

            status,

            scientist:
              user.full_name,

          },

        ]);

const {
  error,
} = await query;

      if (error) {

        alert(
          error.message
        );

        return;

      }

   await logAudit({

  action:

    form.id

      ? "UPDATE QC"

      : "ADD QC",

  module:
    "Quality Control",

  description:
    `${form.department} - ${form.analyte}`,

});

loadQC();

alert(
  "QC Saved"
);

    };

const editQC =
  (row) => {

    setForm({

      id:
        row.id,

      department:
        row.department,

      analyte:
        row.analyte,

      control_level:
        row.control_level,

      target_value:
        row.target_value,

      observed_value:
        row.observed_value,

      sd:
        row.sd,

      qc_date:
        row.qc_date,

    });

  };
const deleteQC =
  async (id) => {

    if (
      !window.confirm(
        "Delete QC Record?"
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase

      .from(
        "quality_control"
      )

      .delete()

      .eq(
        "id",
        id
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    await logAudit({

      action:
        "DELETE QC",

      module:
        "Quality Control",

      description:
        `QC ID ${id}`,

    });

    loadQC();

  };

const filteredQC =

  qcData.filter(
    (row) =>

      row.analyte
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      row.department
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      row.instrument
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      row.lot_number
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

  );

  return (

    <div className="page">

      <h1>
        Quality Control
      </h1>

<div className="qc-summary">

  <div className="qc-card">

    <h3>
      Total QC
    </h3>

    <p>
      {qcData.length}
    </p>

  </div>

  <div className="qc-card">

    <h3>
      Passed
    </h3>

    <p>

      {

        qcData.filter(
          item =>
            item.status ===
            "PASS"
        ).length

      }

    </p>

  </div>

  <div className="qc-card">

    <h3>
      Failed
    </h3>

    <p>

      {

        qcData.filter(
          item =>
            item.status ===
            "FAIL"
        ).length

      }

    </p>

  </div>

</div>

      <div className="qc-form">

      <select
  value={form.department}
  onChange={(e)=>
    setForm({
      ...form,
      department:
        e.target.value,
    })
  }
>

  <option value="">
    Select Department
  </option>

  <option>
    Chemistry
  </option>

  <option>
    Hematology
  </option>

  <option>
    Microbiology
  </option>

  <option>
    Serology
  </option>

  <option>
    Immunology
  </option>

  <option>
    Molecular Biology
  </option>

</select>

<input
  placeholder="Instrument"
  value={form.instrument}
  onChange={(e)=>
    setForm({
      ...form,
      instrument:
        e.target.value,
    })
  }
/>

<input
  placeholder="Lot Number"
  value={form.lot_number}
  onChange={(e)=>
    setForm({
      ...form,
      lot_number:
        e.target.value,
    })
  }
/>

        <input
          placeholder="Analyte"
          value={form.analyte}
          onChange={(e)=>
            setForm({
              ...form,
              analyte:e.target.value,
            })
          }
        />

        <input
          placeholder="Control Level"
          value={form.control_level}
          onChange={(e)=>
            setForm({
              ...form,
              control_level:e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Target Value"
          value={form.target_value}
          onChange={(e)=>
            setForm({
              ...form,
              target_value:e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Observed Value"
          value={form.observed_value}
          onChange={(e)=>
            setForm({
              ...form,
              observed_value:e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="SD"
          value={form.sd}
          onChange={(e)=>
            setForm({
              ...form,
              sd:e.target.value,
            })
          }
        />

        <input
          type="date"
          value={form.qc_date}
          onChange={(e)=>
            setForm({
              ...form,
              qc_date:e.target.value,
            })
          }
        />

        <button
          onClick={addQC}
        >

        {
  form.id

    ? "Update QC"

    : "Save QC"
}


        </button>

      </div>

<div className="qc-summary">

  <div className="qc-card">

    <h3>
      Total QC
    </h3>

   <p className="qc-fail-count">

  {

    qcData.filter(
      item =>
        item.status ===
        "FAIL"
    ).length

  }

</p>

  </div>

  <div className="qc-card">

    <h3>
      Passed
    </h3>

    <p>

      {

        qcData.filter(
          item =>
            item.status ===
            "PASS"
        ).length

      }

    </p>

  </div>

  <div className="qc-card">

    <h3>
      Failed
    </h3>

    <p>

      {

        qcData.filter(
          item =>
            item.status ===
            "FAIL"
        ).length

      }

    </p>

  </div>

  <div className="qc-card">

    <h3>
      Pass Rate
    </h3>

    <p>

      {

        qcData.length

          ? Math.round(

              (
                qcData.filter(
                  item =>
                    item.status ===
                    "PASS"
                ).length

                /

                qcData.length

              ) * 100

            )

          : 0

      }%

    </p>

  </div>

</div>

<div className="qc-search">

  <input
    type="text"
    placeholder="Search Analyte, Department, Instrument or Lot Number..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
  />

</div>

<table className="qc-table">

  <thead>

    <tr>

      <th>
        Date
      </th>

      <th>
        Department
      </th>

      <th>
        Analyte
      </th>

<th>
  Instrument
</th>

<th>
  Lot Number
</th>

      <th>
        Level
      </th>

      <th>
        Target
      </th>

      <th>
        Observed
      </th>

      <th>
        SD
      </th>

      <th>
        Status
      </th>

      <th>
        Scientist
      </th>

<th>
  Action
</th>

    </tr>

  </thead>

  <tbody>

    {

      filteredQC.map(
        (row) => (

          <tr
            key={row.id}
          >

            <td>
              {row.qc_date}
            </td>

            <td>
              {row.department}
            </td>

            <td>
              {row.analyte}
            </td>

<td>
  {row.instrument || "-"}
</td>

<td>
  {row.lot_number || "-"}
</td>

            <td>
              {row.control_level}
            </td>

            <td>
              {row.target_value}
            </td>

            <td>
              {row.observed_value}
            </td>

            <td>
              {row.sd}
            </td>

            <td>

              <span
                className={
                  row.status ===
                  "PASS"

                    ? "qc-pass"

                    : "qc-fail"
                }
              >

                {
                  row.status
                }

              </span>

            </td>

            <td>
              {
                row.scientist
              }
            </td>

<td>

  <button
    className="edit-btn"
    onClick={() =>
      editQC(row)
    }
  >

    Edit

  </button>

  <button
    className="delete-btn"
    onClick={() =>
      deleteQC(
        row.id
      )
    }
  >

    Delete

  </button>

</td>

          </tr>

        )
      )

    }

  </tbody>

</table>

    </div>

  );

}