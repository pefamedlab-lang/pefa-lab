
import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import {
  logAudit,
} from "../utils/auditLogger";

import "../styles/temperature.css";

export default function TemperatureMonitoring() {

  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({

    location: "",

    morning_temp: "",

    evening_temp: "",

    log_date: "",

    remarks: "",

  });

  useEffect(() => {

    loadLogs();

  }, []);

  const loadLogs =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "temperature_logs"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false,
          }
        );

      setLogs(
        data || []
      );

    };


const saveLog =
  async () => {

    const morning =
      Number(
        form.morning_temp
      );

    const evening =
      Number(
        form.evening_temp
      );

    const status =

      morning >= 2 &&
      morning <= 8 &&

      evening >= 2 &&
      evening <= 8

        ? "Normal"

        : "Out of Range";

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
          "temperature_logs"
        )

        .update({

          location:
            form.location,

          morning_temp:
            form.morning_temp,

          evening_temp:
            form.evening_temp,

          log_date:
            form.log_date,

          remarks:
            form.remarks,

          status,

         
        })

        .eq(
          "id",
          form.id
        )

    : supabase

        .from(
          "temperature_logs"
        )

        .insert([

          {

            ...form,

            status,

            recorded_by:
              user.full_name,

          },

        ]);

const {
  error,
} = await query;

    if (error) {

await logActivity(
  "Maintenance Recorded",
  equipmentName
);

      alert(
        error.message
      );

      return;

    }

    await logAudit({

     action:

  form.id

    ? "UPDATE TEMPERATURE LOG"

    : "ADD TEMPERATURE LOG",

      module:
        "Temperature",

      description:
        `${form.location} - ${status}`,

    });

    loadLogs();

    alert(
      "Temperature Log Saved"
    );

  };

const filteredLogs =

  logs.filter(
    item =>

      item.location
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

const editLog =
  (item) => {

    setForm({

      id:
        item.id,

      location:
        item.location,

      morning_temp:
        item.morning_temp,

      evening_temp:
        item.evening_temp,

      log_date:
        item.log_date,

      remarks:
        item.remarks,

    });

  };

const deleteLog =
  async (id) => {

    if (
      !window.confirm(
        "Delete Temperature Log?"
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase

      .from(
        "temperature_logs"
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
        "DELETE TEMPERATURE LOG",

      module:
        "Temperature",

      description:
        `Log ID ${id}`,

    });

    loadLogs();

  };

  return (

    <div className="page">

      <h1>
        Temperature Monitoring
      </h1>

<div className="temperature-summary">

  <div className="temperature-card">

    <h3>
      Total Logs
    </h3>

    <p>
      {logs.length}
    </p>

  </div>

  <div className="temperature-card">

    <h3>
      Normal
    </h3>

    <p>

      {

        logs.filter(
          item =>
            item.status ===
            "Normal"
        ).length

      }

    </p>

  </div>

  <div className="temperature-card">

    <h3>
      Out of Range
    </h3>

    <p className="temp-danger">

      {

        logs.filter(
          item =>
            item.status ===
            "Out of Range"
        ).length

      }

    </p>

  </div>

</div>

<div className="temperature-search">

  <input
    type="text"
    placeholder="Search Location..."
    value={search}
    onChange={(e)=>
      setSearch(
        e.target.value
      )
    }
  />

</div>


<div className="temperature-form">

  <select
    value={form.location}
    onChange={(e)=>
      setForm({
        ...form,
        location:
          e.target.value,
      })
    }
  >

    <option value="">
      Select Location
    </option>

    <option>
      Chemistry Refrigerator
    </option>

    <option>
      Sample Refrigerator
    </option>

    <option>
      Blood Bank Refrigerator
    </option>

    <option>
      Freezer
    </option>

    <option>
      Incubator
    </option>

    <option>
      Cold Room
    </option>

    <option>
      Water Bath
    </option>

  </select>


  <input
    type="number"
    step="0.1"
    placeholder="Morning Temperature"
    value={form.morning_temp}
    onChange={(e)=>
      setForm({
        ...form,
        morning_temp:
          e.target.value,
      })
    }
  />

  <input
    type="number"
    step="0.1"
    placeholder="Evening Temperature"
    value={form.evening_temp}
    onChange={(e)=>
      setForm({
        ...form,
        evening_temp:
          e.target.value,
      })
    }
  />

  <input
    type="date"
    value={form.log_date}
    onChange={(e)=>
      setForm({
        ...form,
        log_date:
          e.target.value,
      })
    }
  />

  <input
    placeholder="Remarks"
    value={form.remarks}
    onChange={(e)=>
      setForm({
        ...form,
        remarks:
          e.target.value,
      })
    }
  />

<button
  onClick={saveLog}
>

  {

    form.id

      ? "Update Log"

      : "Save Log"

  }

</button>

</div>

<table className="temperature-table">

  <thead>

    <tr>

      <th>Date</th>

      <th>Location</th>

      <th>Morning</th>

      <th>Evening</th>

      <th>Status</th>

      <th>Recorded By</th>

<th>
  Action
</th>

    </tr>

  </thead>

  <tbody>

    {

      filteredLogs.map(
        (item) => (

          <tr
            key={item.id}
          >

            <td>
              {item.log_date}
            </td>

            <td>
              {item.location}
            </td>

            <td
  className={

    item.morning_temp < 2 ||

    item.morning_temp > 8

      ? "temp-high"

      : ""

  }
>

  {item.morning_temp}°C

</td>

           <td
  className={

    item.evening_temp < 2 ||

    item.evening_temp > 8

      ? "temp-high"

      : ""

  }
>

  {item.evening_temp}°C

</td>
 
            <td>

              <span
                className={
                  item.status ===
                  "Normal"

                    ? "temp-normal"

                    : "temp-alert"
                }
              >

                {
                  item.status
                }

              </span>

            </td>

            <td>
              {
                item.recorded_by
              }
            </td>

<td>

  <button
    className="edit-btn"
    onClick={() =>
      editLog(item)
    }
  >
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() =>
      deleteLog(item.id)
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