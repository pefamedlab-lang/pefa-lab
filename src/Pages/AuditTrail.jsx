import "../styles/audit.css";


import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

export default function AuditTrail() {

  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    actionFilter,
    setActionFilter,
  ] = useState("All");

  /* =========================
     AUDIT STATISTICS
  ========================= */

  const totalLogs =
    logs.length;

  const paymentLogs =
    logs.filter(
      log =>
        log.action
          ?.toLowerCase()
          .includes("payment")
    ).length;

  const referralLogs =
    logs.filter(
      log =>
        log.action
          ?.toLowerCase()
          .includes("referral")
    ).length;

  const resultLogs =
    logs.filter(
      log =>
        log.action
          ?.toLowerCase()
          .includes("result")
    ).length;

  /* =========================
     FILTERED LOGS
  ========================= */

  const filteredLogs =
    logs.filter((log) => {

      const matchesSearch =

        log.full_name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        log.action
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      if (!matchesSearch)
        return false;

      if (
        actionFilter !== "All"
      ) {

        return (
          log.action ===
          actionFilter
        );

      }

      return true;

    });

  useEffect(() => {

    fetchLogs();

  }, []);

  const fetchLogs =
    async () => {

      const {
        data,
        error,
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
        );

      if (!error) {

        setLogs(
          data || []
        );

      }

    };

const loginLogs =
  logs.filter(
    log =>
      log.action ===
      "User Login"
  ).length;

const staffLogs =
  logs.filter(
    log =>
      log.action?.includes(
        "Staff"
      )
  ).length;

  return (

    <div className="page">
<div className="audit-header">

  <h1>
    Audit Trail
  </h1>

  <p>
    Monitor all activities performed within PEFA Enterprise LIS.
  </p>

</div>

<div className="audit-stats">

  <div className="audit-stat-card">

   <span>
  📊 Total Logs
</span>

    <h2>
      {totalLogs}
    </h2>

  </div>

  <div className="audit-stat-card">

   <span>
  💰 Payments
</span>

    <h2>
      {paymentLogs}
    </h2>

  </div>

  <div className="audit-stat-card">

    <span>
  🤝 Referrals
</span>

    <h2>
      {referralLogs}
    </h2>

  </div>

  <div className="audit-stat-card">

    <span>
  🧪 Results
</span>

    <h2>
      {resultLogs}
    </h2>

  </div>

</div>

<div className="audit-toolbar">

  <input
    type="text"
    placeholder="Search user or action..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    className="audit-search"
  />

  <select
    value={actionFilter}
    onChange={(e) =>
      setActionFilter(
        e.target.value
      )
    }
  >

    <option value="All">
      All Actions
    </option>

    <option value="Created Referral">
      Created Referral
    </option>

    <option value="Viewed Referral">
      Viewed Referral
    </option>

    <option value="Recorded Payment">
      Recorded Payment
    </option>

    <option value="Commission Payment">
      Commission Payment
    </option>

    <option value="Generated Invoice">
      Generated Invoice
    </option>

    <option value="Printed Receipt">
      Printed Receipt
    </option>

    <option value="Printed Commission Receipt">
      Printed Commission Receipt
    </option>

<option value="Patient Registration">
  Patient Registration
</option>

<option value="Result Entry">
  Result Entry
</option>

<option value="Result Released">
  Result Released
</option>

<option value="Temperature Entry">
  Temperature Entry
</option>

<option value="Inventory Added">
  Inventory Added
</option>

<option value="Inventory Issued">
  Inventory Issued
</option>

<option value="QC Entry">
  QC Entry
</option>

<option value="QC Failure">
  QC Failure
</option>

<option value="Maintenance Recorded">
  Maintenance Recorded
</option>

<option value="Equipment Added">
  Equipment Added
</option>

<option value="Staff Created">
  Staff Created
</option>

<option value="Staff Updated">
  Staff Updated
</option>

<option value="Staff Deleted">
  Staff Deleted
</option>

<option value="Staff Activated">
  Staff Activated
</option>

<option value="Staff Disabled">
  Staff Disabled
</option>

<option value="User Login">
  User Login
</option>

<option value="User Logout">
  User Logout
</option>

  </select>

</div>

      <table
        className="result-table"
      >

        <thead>

          <tr>

            <th>
              Date
            </th>

            <th>
              User
            </th>

            <th>
              Role
            </th>

            <th>
              Action
            </th>

            <th>
              Module
            </th>

            <th>
              Description
            </th>

          </tr>

        </thead>

        <tbody>

          {
            filteredLogs.map(
              (log) => (

                <tr
                  key={log.id}
                >

                  <td>

                   <div>

  <strong>

    {new Date(
      log.created_at
    ).toLocaleDateString()}

  </strong>

  <br />

  <small
    style={{
      color:"#64748b"
    }}
  >

    {new Date(
      log.created_at
    ).toLocaleTimeString()}

  </small>

</div>

                  </td>

                  <td>
                    {
                      log.user_name
                    }
                  </td>

                 <td>

  <span
    className={`role-badge role-${(
      log.user_role || ""
    ).toLowerCase()}`}
  >
    {log.user_role}
  </span>

</td>

<td>

  <span
    className={
      log.action?.includes("Payment")
        ? "action-badge action-success"
        : log.action?.includes("Invoice")
        ? "action-badge action-info"
        : log.action?.includes("Referral")
        ? "action-badge action-warning"
        : "action-badge action-danger"
    }
  >
    {log.action}
  </span>

</td>

                  <td>
                    {
                      log.module
                    }
                  </td>

                  <td>
                    {
                      log.description
                    }
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