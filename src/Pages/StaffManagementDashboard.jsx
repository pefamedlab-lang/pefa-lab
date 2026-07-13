import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/staffManagement.css";

export default function StaffManagement() {

const user =
  JSON.parse(
    localStorage.getItem(
      "pefa_user"
    )
  ) || {};
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState(null);

  const initialForm = {
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    role: "Scientist",
    department: "",
    branch: "",
    profile_photo: "",
    signature_url: "",
    status: "Active",
  };

  const [formData, setFormData] =
    useState(initialForm);

  const roles = [
    "Admin",
    "Director",
    "Manager",
    "Scientist",
    "Receptionist",
    "Account Officer",
    "Radiologist",
    "Sonographer",
  ];

  useEffect(() => {
    loadStaff();
  }, []);

const logActivity = async (
  action,
  module,
  description
) => {

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    ) || {};

  await supabase
    .from("audit_logs")
    .insert([
      {
        user_name:
          currentUser.full_name,

        user_role:
          currentUser.role,

        action,

        module,

        description,
      },
    ]);

};

  const loadStaff = async () => {

  const { data, error } =
    await supabase
      .from("staff_users")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.log(error);
    return;
  }

  setStaff(data || []);
};

const uploadPhoto = async (file) => {
  const fileName =
    Date.now() + "_" + file.name;

  const { error } =
    await supabase.storage
      .from("staff-photos")
      .upload(fileName, file);

  if (error) {
    alert(error.message);
    return;
  }

  const { data } =
    supabase.storage
      .from("staff-photos")
      .getPublicUrl(fileName);

  setFormData((prev) => ({
    ...prev,
    profile_photo:
      data.publicUrl,
  }));
};

const uploadSignature = async (file) => {
  const fileName =
    Date.now() + "_" + file.name;

  const { error } =
    await supabase.storage
      .from("signatures")
      .upload(fileName, file);

  if (error) {
    alert(error.message);
    return;
  }

  const { data } =
    supabase.storage
      .from("signatures")
      .getPublicUrl(fileName);

  setFormData((prev) => ({
    ...prev,
    signature_url:
      data.publicUrl,
  }));
};

const saveStaff = async () => {
  try {
    setLoading(true);

if (!editingStaff) {

  const {
    data: existing,
  } = await supabase
    .from("staff_users")
    .select("id")
    .eq(
      "username",
      formData.username
    )
    .maybeSingle();

  if (existing) {

    alert(
      "Username already exists"
    );

    return;

  }

}

   if (editingStaff) {

  const {
    id,
    created_at,
    ...updateData
  } = formData;

  const { error } =
    await supabase
      .from("staff_users")
      .update(updateData)
      .eq(
        "id",
        editingStaff.id
      );

      if (error)
        throw error;

await logActivity(
  "Staff Updated",
  "Staff Management",
  `Updated ${formData.full_name}`
);

      alert(
        "Staff Updated Successfully"
      );
    } else {
      const { error } =
        await supabase
          .from("staff_users")
          .insert([
            formData,
          ]);

      if (error)
        throw error;


await logActivity(
  "Staff Created",
  "Staff Management",
  `Created ${formData.full_name}`
);

      alert(
        "Staff Created Successfully"
      );
    }

    setShowModal(false);
    setEditingStaff(null);
    setFormData(initialForm);

    loadStaff();
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};


const deleteStaff = async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete Staff?"
    );

  if (!confirmDelete) {
    return;
  }

  try {

    const { error } =
      await supabase
        .from("staff_users")
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    await logActivity(
      "Staff Deleted",
      "Staff Management",
      `Deleted Staff ID ${id}`
    );

    alert(
      "Staff Deleted Successfully"
    );

    loadStaff();

  } catch (error) {

    console.log(error);

    alert(
      error.message
    );

  }

};


const toggleStatus =
  async (staff) => {

    const status =
      staff.status ===
      "Active"
        ? "Disabled"
        : "Active";

    await supabase
      .from("staff_users")
      .update({
        status,
      })
      .eq(
        "id",
        staff.id
      );

    loadStaff();
await logActivity(
  status === "Active"
    ? "Staff Activated"
    : "Staff Disabled",
  "Staff Management",
  `${staff.full_name} account ${status}`
);

};

const filteredStaff =
  staff.filter(
    (item) =>
      item.full_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      item.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      item.role
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );


if (
  ![
    "Admin",
    "Director",
  ].includes(
    user.role
  )
) {

  return (

    <div className="page">

      <h2>
        Access Denied
      </h2>

      <p>
        You do not have
        permission to
        access this page.
      </p>

    </div>

  );

}


return (
  <div className="page">

<div className="test-header">

  <div>

   <h1>
  Staff Management
  ({staff.length})
</h1>

    <p>
      Manage Staff Accounts,
      Roles and Access
    </p>

  </div>

  <button
    className="save-test-btn"
    onClick={() => {

      setEditingStaff(null);

      setFormData(initialForm);

      setShowModal(true);

    }}
  >

    Create Staff

  </button>

</div>

<div className="search-box">

  <input
    type="text"
    placeholder="Search Staff..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
  />

</div>

<div className="stats-grid">

  <div className="stat-card">

    <h3>Total Staff</h3>

    <p>{staff.length}</p>

  </div>

  <div className="stat-card">

    <h3>Active Staff</h3>

    <p>
      {
        staff.filter(
          s =>
            s.status ===
            "Active"
        ).length
      }
    </p>

  </div>

  <div className="stat-card">

    <h3>Managers</h3>

    <p>
      {
        staff.filter(
          s =>
            s.role ===
            "Manager"
        ).length
      }
    </p>

  </div>

  <div className="stat-card">

    <h3>Scientists</h3>

    <p>
      {
        staff.filter(
          s =>
            s.role ===
            "Scientist"
        ).length
      }
    </p>

  </div>

  <div className="stat-card">

    <h3>Radiology Team</h3>

    <p>
      {
        staff.filter(
          s =>
            s.role ===
              "Radiologist" ||
            s.role ===
              "Sonographer"
        ).length
      }
    </p>

  </div>

</div>



<table className="staff-table">
 <thead>
  <tr>
    <th>Photo</th>
<th>ID</th>
    <th>Name</th>
    <th>Username</th>
    <th>Role</th>
    <th>Department</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>

  <tbody>
    {filteredStaff.map(
      (s) => (
        <tr key={s.id}>

  <td>

    {s.profile_photo ? (

      <img
        src={s.profile_photo}
        alt=""
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

    ) : (

      "N/A"

    )}

  </td>

<td>
  {s.id}
</td>


  <td>
    {s.full_name}
  </td>

          <td>
            {s.username}
          </td>

         <td>

  <span
    style={{
      background:
  s.role === "Admin"
    ? "#fee2e2"
    : s.role ===
      "Director"
    ? "#dcfce7"
    : s.role ===
      "Manager"
    ? "#fef3c7"
    : "#eef2ff",
      padding:
        "6px 10px",
      borderRadius:
        "20px",
      fontSize:
        "12px",
      fontWeight:
        "600",
    }}
  >

    {s.role}

  </span>

</td>

          <td>
            {s.department}
          </td>

          <td>
            {s.status}
          </td>

         <td>

  <button
    className="edit-btn"
    onClick={() => {

     setEditingStaff(s);

setFormData({

  username:
    s.username || "",

  password:
    s.password || "",

  full_name:
    s.full_name || "",

  email:
    s.email || "",

  phone:
    s.phone || "",

  role:
    s.role || "Scientist",

  department:
    s.department || "",

  branch:
    s.branch || "",

  profile_photo:
    s.profile_photo || "",

  signature_url:
    s.signature_url || "",

  status:
    s.status || "Active",

});

setShowModal(true);

    }}
  >

    Edit

  </button>

  <button
    className="action-btn"
    onClick={() =>
      toggleStatus(s)
    }
  >

    {s.status ===
    "Active"
      ? "Disable"
      : "Activate"}

  </button>

  <button
    className="delete-btn"
    onClick={() =>
      deleteStaff(s.id)
    }
  >

    Delete

  </button>

</td>

<button
  className="action-btn"
  onClick={async () => {

    const newPassword =
      prompt(
        "Enter New Password"
      );

    if (!newPassword)
      return;

    await supabase
      .from("staff_users")
      .update({
        password:
          newPassword,
      })
      .eq(
        "id",
        s.id
      );

    alert(
      "Password Reset Successfully"
    );

  }}
>

  Reset Password

</button>

        </tr>
      )
    )}
  </tbody>
</table>

{showModal && (

  <div className="result-record-modal-overlay">

    <div className="result-record-modal">

      <div className="modal-header">

        <h2>
          {editingStaff
            ? "Edit Staff"
            : "Create Staff"}
        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setShowModal(false)
          }
        >
          ×
        </button>

<button
  className="save-test-btn"
  onClick={saveStaff}
>
  {editingStaff
    ? "Update Staff"
    : "Create Staff"}
</button>

      </div>

     
      <div className="test-grid">

<select
  value={formData.role}
  onChange={(e) => {

    const role =
      e.target.value;

    let department = "";

    switch (role) {

      case "Scientist":
        department =
          "Laboratory";
        break;

      case "Receptionist":
        department =
          "Reception";
        break;

      case "Manager":
        department =
          "Administration";
        break;

      case "Director":
        department =
          "Administration";
        break;

      case "Admin":
        department =
          "Administration";
        break;

      case "Radiologist":
        department =
          "Radiology";
        break;

      case "Sonographer":
        department =
          "Ultrasound";
        break;

      case "Account Officer":
        department =
          "Accounts";
        break;

      default:
        department = "";
    }

    setFormData({
      ...formData,
      role,
      department,
    });

  }}
>

  {roles.map((role) => (
    <option
      key={role}
      value={role}
    >
      {role}
    </option>
  ))}
</select>

        <input
          placeholder="Full Name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              full_name:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({
              ...formData,
           username:
  e.target.value
    .toLowerCase(),
            })
          }
        />

        <input
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              phone:
                e.target.value,
            })
          }
        />

<select
  value={formData.branch}
  onChange={(e) =>
    setFormData({
      ...formData,
      branch:
        e.target.value,
    })
  }
>

  <option value="">
    Select Branch
  </option>

  <option>
    Redemption City
  </option>

  <option>
    Mowe
  </option>

  <option>
    Head Office
  </option>

</select>

<input
  placeholder="Department"
  value={formData.department}
  readOnly
/>

<select
  value={formData.status}
  onChange={(e) =>
    setFormData({
      ...formData,
      status:
        e.target.value,
    })
  }
>

  <option value="Active">
    Active
  </option>

  <option value="Disabled">
    Disabled
  </option>

</select>

<div>

  <label>
    Profile Photo
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      if (
        e.target.files[0]
      ) {

        uploadPhoto(
          e.target.files[0]
        );

      }

    }}
  />

</div>

<div>

  <label>
    Signature
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      if (
        e.target.files[0]
      ) {

        uploadSignature(
          e.target.files[0]
        );

      }

    }}
  />

</div>

{formData.profile_photo && (

  <div>

    <p>
      Profile Photo
    </p>

    <img
      src={
        formData.profile_photo
      }
      alt="Profile"
      style={{
        width: "100px",
      height: "100px",
      borderRadius: "50%",
      objectFit: "cover",
      marginTop: "10px",
      }}
    />


  </div>



)}

{formData.signature_url && (

  <div>

    <p>
      Signature
    </p>

    <img
      src={
        formData.signature_url
      }
      alt="Signature"
      style={{
        width: "180px",
      }}
    />

  </div>

)}

      </div>

<button
  className="save-test-btn"
  onClick={saveStaff}
  disabled={loading}
>

  {loading
    ? "Saving..."
    : editingStaff
    ? "Update Staff"
    : "Create Staff"}

</button>

      {/* MORE FIELDS HERE */}

    </div>

  </div>

)}

</div>
);
}