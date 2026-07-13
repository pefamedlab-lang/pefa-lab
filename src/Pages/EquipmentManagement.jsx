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

import "../styles/equipment.css";

export default function EquipmentManagement() {

  const [
    equipment,
    setEquipment,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({

    equipment_name: "",

    model: "",

    serial_number: "",

    department: "",

    installation_date: "",

    last_maintenance: "",

    next_maintenance: "",

    engineer: "",

    status: "Active",

  });

  useEffect(() => {

    loadEquipment();

  }, []);



const loadEquipment =
  async () => {

    const {
      data,
      error,
    } = await supabase

      .from(
        "equipment"
      )

      .select("*")

      .order(
        "created_at",
        {
          ascending:false,
        }
      );

    if (!error) {

      setEquipment(
        data || []
      );

    }

  };


const saveEquipment =
  async () => {

    const {
      error,
    } = await supabase

      .from(
        "equipment"
      )

     

    if (error) {

      alert(
        error.message
      );

await supabase

  .from(
    "equipment"
  )

  .update({

    last_maintenance:

      new Date()
        .toISOString()
        .split("T")[0],

  })

  .eq(
    "id",
    item.id
  );

      return;

    }

    await logAudit({

      action:
        "ADD EQUIPMENT",

      module:
        "Equipment",

      description:
        form.equipment_name,

    });

    await loadEquipment();

    alert(
      "Equipment Saved"
    );

  };

const filteredEquipment =

  equipment.filter(
    (item) =>

      item.equipment_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.model
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.serial_number
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.department
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

  );

const editEquipment =
  (item) => {

    setForm({

      id:
        item.id,

      equipment_name:
        item.equipment_name,

      model:
        item.model,

      serial_number:
        item.serial_number,

      department:
        item.department,

      installation_date:
        item.installation_date,

      last_maintenance:
        item.last_maintenance,

      next_maintenance:
        item.next_maintenance,

      engineer:
        item.engineer,

      status:
        item.status,

    });

  };

const deleteEquipment =
  async (id) => {

    if (
      !window.confirm(
        "Delete Equipment?"
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase

      .from(
        "equipment"
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
        "DELETE EQUIPMENT",

      module:
        "Equipment",

      description:
        `Equipment ID ${id}`,

    });

    loadEquipment();

  };

const addMaintenance =
  async (item) => {

    const activity =
      prompt(
        "Maintenance Activity"
      );

    if (
      !activity
    ) {
      return;
    }

    const user =
      JSON.parse(
        localStorage.getItem(
          "pefa_user"
        ) || "{}"
      );

    const {
      error,
    } = await supabase

      .from(
        "equipment_maintenance"
      )

      .insert([

        {

          equipment_id:
            item.id,

          maintenance_date:
            new Date()
              .toISOString()
              .split("T")[0],

          engineer:
            user.full_name,

          activity,

          remarks:
            "",

        },

      ]);

    if (error) {

      alert(
        error.message
      );

      return;

    }

    await logAudit({

      action:
        "MAINTENANCE UPDATE",

      module:
        "Equipment",

      description:
        `${item.equipment_name} - ${activity}`,

    });

    alert(
      "Maintenance Recorded"
    );

  };

return (

    <div className="page">

      <h1>
        Equipment Management
      </h1>

<h1>
  Equipment Management
</h1>

<div className="equipment-card">

  <h3>
    Maintenance Due
  </h3>

  <p>

    {

      equipment.filter(
        item =>

          item.next_maintenance &&

          new Date(
            item.next_maintenance
          ) <=

          new Date()

      ).length

    }

  </p>

</div>

<div className="equipment-form">

  <input
    placeholder="Equipment Name"
    value={form.equipment_name}
    onChange={(e)=>
      setForm({
        ...form,
        equipment_name:
          e.target.value,
      })
    }
  />

  <input
    placeholder="Model"
    value={form.model}
    onChange={(e)=>
      setForm({
        ...form,
        model:
          e.target.value,
      })
    }
  />

  <input
    placeholder="Serial Number"
    value={form.serial_number}
    onChange={(e)=>
      setForm({
        ...form,
        serial_number:
          e.target.value,
      })
    }
  />

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
      Department
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
      Ultrasound
    </option>

  </select>

  <div>

  <label>
    Installation Date
  </label>

  <input
    type="date"
    value={form.installation_date}
    onChange={(e)=>
      setForm({
        ...form,
        installation_date:
          e.target.value,
      })
    }
  />

</div>

 <div>

  <label>
    Last Maintenance Date
  </label>

 <div>

  <label>
    Last Maintenance Date
  </label>

  <input
    type="date"
    value={form.last_maintenance}
    onChange={(e)=>
      setForm({
        ...form,
        last_maintenance:
          e.target.value,
      })
    }
  />

</div>

</div>

  <div>

  <label>
    Next Maintenance Date
  </label>

  <input
    type="date"
    value={form.next_maintenance}
    onChange={(e)=>
      setForm({
        ...form,
        next_maintenance:
          e.target.value,
      })
    }
  />

</div>

  <input
    placeholder="Engineer"
    value={form.engineer}
    onChange={(e)=>
      setForm({
        ...form,
        engineer:
          e.target.value,
      })
    }
  />

  <select
    value={form.status}
    onChange={(e)=>
      setForm({
        ...form,
        status:
          e.target.value,
      })
    }
  >

    <option>
      Active
    </option>

    <option>
      Under Maintenance
    </option>

    <option>
      Out of Service
    </option>

    <option>
      Retired
    </option>

  </select>

<button
  onClick={
    saveEquipment
  }
>

  Save Equipment

</button>

</div>


<div className="equipment-search">

  <input
    type="text"
    placeholder="Search Equipment, Model, Serial Number or Department..."
    value={search}
    onChange={(e)=>
      setSearch(
        e.target.value
      )
    }
  />

</div>

<table className="equipment-table">

  <thead>

    <tr>

      <th>Equipment</th>

      <th>Model</th>

      <th>Serial No.</th>

      <th>Department</th>

      <th>Status</th>

      <th>Next Maintenance</th>

<th>
  Action
</th>

    </tr>

  </thead>

  <tbody>

    {

      filteredEquipment.map(
        (item) => (

          <tr
            key={item.id}
          >

            <td>
              {item.equipment_name}
            </td>

            <td>
              {item.model}
            </td>

            <td>
              {item.serial_number}
            </td>

            <td>
              {item.department}
            </td>

            <td>
              {item.status}
            </td>

            <td>
              {
                item.next_maintenance ||
                "-"
              }
            </td>

<td>

  <button
    className="edit-btn"
    onClick={() =>
      editEquipment(
        item
      )
    }
  >
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() =>
      deleteEquipment(
        item.id
      )
    }
  >
    Delete
  </button>

<button
  className="stockin-btn"
  onClick={() =>
    addMaintenance(
      item
    )
  }
>

  Maintenance

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