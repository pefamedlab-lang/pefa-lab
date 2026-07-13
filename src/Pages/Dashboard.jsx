import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../supabase";

import {
  Users,
  CalendarDays,
  FlaskConical,
  CheckCircle2,
  Package,
  ShieldAlert,
  Wrench,
  Thermometer,
  DollarSign,
  Bell,
} from "lucide-react";

import "../styles/dashboard.css";

export default function Dashboard() {

  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
  stats,
  setStats,
] = useState({

  patients: 0,

  todayPatients: 0,

  pendingResults: 0,

  releasedResults: 0,

  lowStock: 0,

  qcFailures: 0,

  maintenanceDue: 0,

  temperatureAlerts: 0,

  revenueToday: 0,

});

  const [
    notifications,
    setNotifications,
  ] = useState([]);

const [
  recentPatients,
  setRecentPatients,
] = useState([]);

const [
  recentResults,
  setRecentResults,
] = useState([]);

  const [
    recentActivity,
    setRecentActivity,
  ] = useState([]);

  useEffect(() => {

    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "pefa_user"
        )
      );

    setUser(
      currentUser
    );

    loadDashboard();

  }, []);

  const loadDashboard =
  async () => {

    await loadStats();

    await loadNotifications();

    await loadActivity();

    await loadRecentPatients();

await loadRecentResults();

  };

  async function loadStats() {

    try {

      const {
        count: patients,
      } = await supabase

        .from(
          "patient_results"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        );

async function loadRecentPatients() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "patient_results"
    )

    .select("*")

    .order(
      "created_at",
      {
        ascending: false,
      }
    )

    .limit(10);

  if (!error) {

    setRecentPatients(
      data || []
    );

  }

}

async function loadRecentResults() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "patient_results"
    )

    .select("*")

    .eq(
      "release_status",
      "Released"
    )

    .order(
      "created_at",
      {
        ascending: false,
      }
    )

    .limit(10);

  if (!error) {

    setRecentResults(
      data || []
    );

  }

}

const today =
  new Date()
    .toISOString()
    .split("T")[0];

const firstDayOfMonth =
  new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString();

const {
  data: todayPayments,
} = await supabase

  .from(
    "payments"
  )

  .select(
    "amount_paid"
  )

  .gte(
    "created_at",
    today
  );

const {
  count: todayPatients,
} = await supabase

  .from(
    "patient_results"
  )

  .select(
    "*",
    {
      count: "exact",
      head: true,
    }
  )

  .gte(
    "created_at",
    today
  );

const {
  data: monthPayments,
} = await supabase

  .from(
    "payments"
  )

  .select(
    "amount_paid"
  )

  .gte(
    "created_at",
    firstDayOfMonth
  );

      const {
        count: pendingResults,
      } = await supabase

        .from(
          "patient_results"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "result_status",
          "Draft"
        );

      const {
        count: releasedResults,
      } = await supabase

        .from(
          "patient_results"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "release_status",
          "Released"
        );

      const {
        count: lowStock,
      } = await supabase

        .from(
          "inventory"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "status",
          "Low Stock"
        );

      const {
        count: qcFailures,
      } = await supabase

        .from(
          "quality_control"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "status",
          "FAIL"
        );

      const {
        count: maintenanceDue,
      } = await supabase

        .from(
          "equipment"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "status",
          "Under Maintenance"
        );

      const {
        count: temperatureAlerts,
      } = await supabase

        .from(
          "temperature_logs"
        )

        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )

        .eq(
          "status",
          "Out of Range"
        );

const revenueToday =

  (todayPayments || [])
    .reduce(
      (
        total,
        item
      ) =>

        total +
        Number(
          item.amount_paid || 0
        ),

      0
    );

const revenueMonth =

  (monthPayments || [])
    .reduce(
      (
        total,
        item
      ) =>

        total +
        Number(
          item.amount_paid || 0
        ),

      0
    );


      setStats({

        patients:
          patients || 0,

        pendingResults:
          pendingResults || 0,

        releasedResults:
          releasedResults || 0,

        lowStock:
          lowStock || 0,

        qcFailures:
          qcFailures || 0,

        maintenanceDue:
          maintenanceDue || 0,

        temperatureAlerts:
          temperatureAlerts || 0,

        todayPatients:
  todayPatients || 0,

      revenueToday:
  revenueToday || 0,

revenueMonth:
  revenueMonth || 0,

      });

    } catch (error) {

      console.log(error);

    }

  }

  async function loadNotifications() {

    setNotifications([

      {
        type:
          "warning",

        message:
          "Review pending results awaiting authorization.",
      },

      {
        type:
          "danger",

        message:
          "Check low stock inventory items.",
      },

    ]);

  }

  async function loadActivity() {

    const {
      data,
    } = await supabase

      .from(
        "audit_logs"
      )

      .select("*")

      .order(
        "created_at",
        {
          ascending: false,
        }
      )

      .limit(10);

    setRecentActivity(
      data || []
    );

  }

  if (!user) {

    return (
      <div className="page">
        Loading...
      </div>
    );

  }



  const cards = [

    {
  title: "Total Patients",
  value: stats.patients,
  icon: <Users size={22} />,
  className: "success",
},

{
  title:
    "Today's Patients",

  value:
    stats.todayPatients,

  icon:
    <CalendarDays size={22} />,
},

    {
  title: "Pending Results",
  value: stats.pendingResults,
  icon: <FlaskConical size={22} />,
  className: "warning",
},

    {
      title:
        "Released Results",

      value:
        stats.releasedResults,

      icon:
        <CheckCircle2 size={22} />,
    },

    {
      title:
        "Low Stock",

      value:
        stats.lowStock,

      icon:
        <Package size={22} />,
    },

    {
  title: "QC Failures",
  value: stats.qcFailures,
  icon: <ShieldAlert size={22} />,
  className: "danger",
},

    {
      title:
        "Maintenance",

      value:
        stats.maintenanceDue,

      icon:
        <Wrench size={22} />,
    },

    {
      title:
        "Temperature Alerts",

      value:
        stats.temperatureAlerts,

      icon:
        <Thermometer size={22} />,
    },

    {
  title:
    "Revenue Today",

  value:
    `₦${Number(
      stats.revenueToday
    ).toLocaleString()}`,

  icon:
    <DollarSign size={22} />,
},

{
  title:
    "Revenue This Month",

  value:
    `₦${Number(
      stats.revenueMonth
    ).toLocaleString()}`,

  icon:
    <DollarSign size={22} />,
},

  ];

const hour =
  new Date().getHours();

let greeting =
  "Good Evening";

if (hour < 12) {

  greeting =
    "Good Morning";

} else if (hour < 17) {

  greeting =
    "Good Afternoon";

}



  return (

    <div className="dashboard-page">

      {/* HEADER */}

<div className="dashboard-header">

  <div className="dashboard-header-left">

    <h1>

      {greeting},
      {" "}
      {user.full_name}

    </h1>

    <p>

      {user.role}
      {" "}
      •
      {" "}
      PEFA Medical Diagnostic Services

    </p>

  </div>

  <div className="dashboard-header-right">

    {user.profile_photo ? (

      <img
        src={user.profile_photo}
        alt=""
        className="dashboard-avatar"
      />

    ) : (

      <div className="dashboard-avatar-placeholder">

        {user.full_name
          ?.charAt(0)
          ?.toUpperCase()}

      </div>

    )}

  </div>

</div>

      {/* KPI */}

      <div className="dashboard-grid">

        {cards.map(
          (
            item,
            index
          ) => (

            <div
  key={index}
  className={`dashboard-card ${item.className || ""}`}
>

              <div className="card-icon">

                {item.icon}

              </div>

              <h4>

                {item.title}

              </h4>

              <h2>

                {item.value}

              </h2>

            </div>

          )
        )}

      </div>

     {/* QUICK ACTIONS + NOTIFICATIONS */}

<div className="dashboard-row">

  <div className="dashboard-panel">

    <h3>
      Quick Actions
    </h3>

    <div className="quick-actions">

      <button
        onClick={() =>
          navigate("/registration")
        }
      >
        Registration
      </button>

      <button
        onClick={() =>
          navigate("/result-dashboard")
        }
      >
        Enter Result
      </button>

      <button
        onClick={() =>
          navigate("/payment-portal")
        }
      >
        Payment
      </button>

      <button
        onClick={() =>
          navigate("/referrals")
        }
      >
        Referrals
      </button>

    </div>

  </div>

  <div className="dashboard-panel">

    <h3>

      <Bell size={18} />

      Notifications

    </h3>

    {notifications.map(
      (
        item,
        index
      ) => (

        <div
          key={index}
          className={`notification ${item.type}`}
        >

          {item.message}

        </div>

      )
    )}

  </div>

</div>

{/* RECENT PATIENTS + RESULTS */}

<div className="dashboard-row">

  <div className="dashboard-panel">

    <h3>
      Recent Patients
    </h3>

    <table className="dashboard-table">

      <thead>

        <tr>

          <th>Patient</th>

          <th>Lab No</th>

          <th>Date</th>

        </tr>

      </thead>

      <tbody>

        {recentPatients.map(
          (patient) => (

            <tr key={patient.id}>

              <td>
                {patient.full_name}
              </td>

              <td>
                {patient.lab_number}
              </td>

              <td>

                {new Date(
                  patient.created_at
                ).toLocaleDateString()}

              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

  <div className="dashboard-panel">

    <h3>
      Recent Results
    </h3>

    <table className="dashboard-table">

      <thead>

        <tr>

          <th>Patient</th>

          <th>Status</th>

          <th>Date</th>

        </tr>

      </thead>

      <tbody>

        {recentResults.map(
          (result) => (

            <tr key={result.id}>

              <td>
                {result.patient_name}
              </td>

              <td>

                <span className="status-success">

                  Released

                </span>

              </td>

              <td>

                {new Date(
                  result.created_at
                ).toLocaleDateString()}

              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

</div>

      {/* ACTIVITY */}

      <div className="dashboard-panel">

        <h3>
          Recent Activity
        </h3>

        <table className="dashboard-table">

          <thead>

            <tr>

              <th>
                User
              </th>

              <th>
                Action
              </th>

              <th>
                Module
              </th>

              <th>
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {recentActivity.map(
              (
                log
              ) => (

                <tr
                  key={log.id}
                >

                  <td>
                    {log.user_name}
                  </td>

                  <td>
                    {log.action}
                  </td>

                  <td>
                    {log.module}
                  </td>

                  <td>

                    {new Date(
                      log.created_at
                    ).toLocaleString()}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}