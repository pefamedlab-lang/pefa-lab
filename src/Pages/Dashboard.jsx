import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
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
  Building2,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  UnlockKeyhole,
  RefreshCw,
} from "lucide-react";
import "../styles/dashboard.css";

const text = (value) => String(value ?? "").trim();

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, includeTime
    ? {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
};

const formatMoney = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const statusText = (row) =>
  text(row?.release_status || row?.authorization_status || row?.result_status || row?.status || "Pending");

const normalizeWorkflowStatus = (row) => {
  const raw = statusText(row).toLowerCase().replace(/[_-]+/g, " ").trim();

  if (raw.includes("release")) return "released";
  if (raw.includes("authoriz")) return "authorized";
  if (raw.includes("verif")) return "verified";
  if (raw.includes("enter")) return "entered";

  // Some older rows use a numeric/implicit workflow.
  if (row?.released_at) return "released";
  if (row?.authorized_at) return "authorized";
  if (row?.verified_at) return "verified";

  return raw || "entered";
};

const normalizeBranch = (row) =>
  text(
    row?.branch ||
    row?.branch_name ||
    row?.branchName ||
    row?.location ||
    "Unassigned Branch"
  ) || "Unassigned Branch";

const getPaymentDate = (row) =>
  row?.created_at ||
  row?.payment_date ||
  row?.paid_at ||
  row?.transaction_date ||
  null;

const isWithin = (value, startIso) => {
  if (!value) return false;
  const d = new Date(value);
  const start = new Date(startIso);
  return !Number.isNaN(d.getTime()) && d >= start;
};

const isManagerOrDirector = (user) =>
  ["Manager", "Director"].includes(text(user?.role));

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardError, setDashboardError] = useState("");

  const [stats, setStats] = useState({
    patients: 0,
    todayPatients: 0,
    pendingResults: 0,
    awaitingVerification: 0,
    awaitingAuthorization: 0,
    awaitingRelease: 0,
    releasedResults: 0,
    lowStock: 0,
    qcFailures: 0,
    maintenanceDue: 0,
    temperatureAlerts: 0,
    revenueToday: 0,
    revenueMonth: 0,
  });

  const [branchRevenue, setBranchRevenue] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    setDashboardError("");

    const today = startOfToday();
    const month = startOfMonth();

    try {
      /*
       * IMPORTANT:
       * Revenue is read from payment_transactions, because Payment Portal
       * records each actual payment there. registrations.amount_paid is a
       * cumulative balance field and must not be treated as a transaction
       * ledger.
       */
      const [
        registrationsResult,
        resultsResult,
        lowStockResult,
        qcResult,
        maintenanceResult,
        temperatureResult,
        paymentsResult,
        activityResult,
      ] = await Promise.all([
        supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(2000),

        supabase
          .from("laboratory_results")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(2000),

        supabase
          .from("inventory")
          .select("*", { count: "exact", head: true })
          .eq("status", "Low Stock"),

        supabase
          .from("quality_control")
          .select("*", { count: "exact", head: true })
          .eq("status", "FAIL"),

        supabase
          .from("equipment")
          .select("*", { count: "exact", head: true })
          .eq("status", "Under Maintenance"),

        supabase
          .from("temperature_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "Out of Range"),

        supabase
          .from("payment_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5000),

        supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const registrations = Array.isArray(registrationsResult.data)
        ? registrationsResult.data
        : [];

      const results = Array.isArray(resultsResult.data)
        ? resultsResult.data
        : [];

      const payments = Array.isArray(paymentsResult.data)
        ? paymentsResult.data
        : [];

      if (registrationsResult.error) {
        console.warn("[PEFA DASHBOARD] Registration load:", registrationsResult.error);
      }

      if (resultsResult.error) {
        console.warn("[PEFA DASHBOARD] Laboratory result load:", resultsResult.error);
      }

      if (paymentsResult.error) {
        console.error("[PEFA DASHBOARD] Payment transaction load:", paymentsResult.error);
        setDashboardError(
          "Revenue could not be loaded from the payment transaction ledger. Please check the payment_transactions table/RLS."
        );
      }

      if (activityResult.error) {
        console.warn("[PEFA DASHBOARD] Activity load:", activityResult.error);
      }

      const todayDate = new Date(today);

      const todayPatients = registrations.filter((row) => {
        const value = row?.created_at || row?.registration_date;
        return value && new Date(value) >= todayDate;
      }).length;

      const workflow = results.map(normalizeWorkflowStatus);

      const releasedResults = workflow.filter((s) => s === "released").length;
      const awaitingVerification = workflow.filter((s) => s === "entered").length;
      const awaitingAuthorization = workflow.filter((s) => s === "verified").length;
      const awaitingRelease = workflow.filter((s) => s === "authorized").length;

      const pendingResults =
        awaitingVerification +
        awaitingAuthorization +
        awaitingRelease;

      /*
       * Payment ledger.
       * Each payment row represents one payment event, so partial payments
       * are counted correctly without double-counting registrations.amount_paid.
       */
      const validPayments = payments.filter((row) => {
        const amount = Number(row?.amount || row?.amount_paid || 0);
        return Number.isFinite(amount) && amount > 0;
      });

      const revenueToday = validPayments
        .filter((row) => isWithin(getPaymentDate(row), today))
        .reduce(
          (sum, row) => sum + Number(row?.amount || row?.amount_paid || 0),
          0
        );

      const revenueMonth = validPayments
        .filter((row) => isWithin(getPaymentDate(row), month))
        .reduce(
          (sum, row) => sum + Number(row?.amount || row?.amount_paid || 0),
          0
        );

      /*
       * Branch revenue:
       * Prefer payment_transactions.branch when available.
       * Otherwise resolve the payment's lab_number through registrations.
       */
      const registrationByLab = new Map(
        registrations
          .filter((row) => text(row?.lab_number))
          .map((row) => [text(row.lab_number), row])
      );

      const branchTotals = new Map();

      validPayments
        .filter((row) => isWithin(getPaymentDate(row), month))
        .forEach((payment) => {
          const linkedRegistration = registrationByLab.get(
            text(payment?.lab_number)
          );

          const branch = normalizeBranch({
            ...linkedRegistration,
            ...payment,
          });

          const current = branchTotals.get(branch) || {
            branch,
            today: 0,
            month: 0,
            transactions: 0,
          };

          const amount = Number(
            payment?.amount || payment?.amount_paid || 0
          );

          current.month += amount;
          current.transactions += 1;

          if (isWithin(getPaymentDate(payment), today)) {
            current.today += amount;
          }

          branchTotals.set(branch, current);
        });

      setStats({
        patients: registrations.length,
        todayPatients,
        pendingResults,
        awaitingVerification,
        awaitingAuthorization,
        awaitingRelease,
        releasedResults,
        lowStock: lowStockResult.count || 0,
        qcFailures: qcResult.count || 0,
        maintenanceDue: maintenanceResult.count || 0,
        temperatureAlerts: temperatureResult.count || 0,
        revenueToday,
        revenueMonth,
      });

      setBranchRevenue(
        [...branchTotals.values()].sort((a, b) => b.month - a.month)
      );

      setRecentPatients(registrations.slice(0, 10));

      const recentReleased = results
        .filter((row) => normalizeWorkflowStatus(row) === "released")
        .slice(0, 10);

      const labs = [
        ...new Set(
          recentReleased
            .map((row) => text(row?.lab_number))
            .filter(Boolean)
        ),
      ];

      let patientMap = new Map();

      if (labs.length) {
        const { data, error } = await supabase
          .from("registrations")
          .select("lab_number, full_name, patient_name")
          .in("lab_number", labs);

        if (!error) {
          patientMap = new Map(
            (data || []).map((row) => [text(row.lab_number), row])
          );
        }
      }

      setRecentResults(
        recentReleased.map((row) => ({
          ...row,
          patient_name:
            row.patient_name ||
            row.full_name ||
            patientMap.get(text(row.lab_number))?.full_name ||
            patientMap.get(text(row.lab_number))?.patient_name ||
            "—",
        }))
      );

      setRecentActivity(
        Array.isArray(activityResult.data) ? activityResult.data : []
      );

      const nextNotifications = [];

      if (awaitingVerification > 0) {
        nextNotifications.push({
          type: "verification",
          icon: <ShieldCheck size={17} />,
          title: "Results Awaiting Verification",
          message: `${awaitingVerification} result${awaitingVerification === 1 ? "" : "s"} require verification.`,
          action: () => navigate("/laboratory-results"),
        });
      }

      if (awaitingAuthorization > 0) {
        nextNotifications.push({
          type: "authorization",
          icon: <LockKeyhole size={17} />,
          title: "Results Awaiting Authorization",
          message: `${awaitingAuthorization} verified result${awaitingAuthorization === 1 ? "" : "s"} require authorization.`,
          action: () => navigate("/laboratory-results"),
        });
      }

      if (awaitingRelease > 0) {
        nextNotifications.push({
          type: "release",
          icon: <UnlockKeyhole size={17} />,
          title: "Results Awaiting Release",
          message: `${awaitingRelease} authorized result${awaitingRelease === 1 ? "" : "s"} are ready for release.`,
          action: () => navigate("/laboratory-results"),
        });
      }

      if ((lowStockResult.count || 0) > 0) {
        nextNotifications.push({
          type: "inventory",
          icon: <Package size={17} />,
          title: "Low Stock Alert",
          message: `${lowStockResult.count} inventory item${lowStockResult.count === 1 ? "" : "s"} require attention.`,
          action: () => navigate("/inventory"),
        });
      }

      if ((qcResult.count || 0) > 0) {
        nextNotifications.push({
          type: "qc",
          icon: <ShieldAlert size={17} />,
          title: "Quality Control Alert",
          message: `${qcResult.count} QC failure${qcResult.count === 1 ? "" : "s"} require review.`,
          action: () => navigate("/quality-control"),
        });
      }

      if ((maintenanceResult.count || 0) > 0) {
        nextNotifications.push({
          type: "maintenance",
          icon: <Wrench size={17} />,
          title: "Maintenance Alert",
          message: `${maintenanceResult.count} equipment item${maintenanceResult.count === 1 ? "" : "s"} are under maintenance.`,
          action: () => navigate("/equipment"),
        });
      }

      if ((temperatureResult.count || 0) > 0) {
        nextNotifications.push({
          type: "temperature",
          icon: <Thermometer size={17} />,
          title: "Temperature Alert",
          message: `${temperatureResult.count} temperature log${temperatureResult.count === 1 ? "" : "s"} are out of range.`,
          action: () => navigate("/temperature-monitoring"),
        });
      }

      if (!nextNotifications.length) {
        nextNotifications.push({
          type: "success",
          icon: <CheckCircle2 size={17} />,
          title: "System Status",
          message: "No outstanding dashboard alerts.",
          action: null,
        });
      }

      setNotifications(nextNotifications);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("[PEFA DASHBOARD] Load failed:", error);
      setDashboardError(error?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("pefa_user") || "null"
    );

    setUser(currentUser);

    if (!isManagerOrDirector(currentUser)) {
      navigate("/login", { replace: true });
      return undefined;
    }

    loadDashboard();

    const interval = window.setInterval(loadDashboard, 60000);
    const onFocus = () => loadDashboard();

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [navigate]);

  const cards = useMemo(
    () => [
      {
        title: "Total Patients",
        value: stats.patients,
        icon: <Users size={22} />,
        className: "success",
      },
      {
        title: "Today's Patients",
        value: stats.todayPatients,
        icon: <CalendarDays size={22} />,
      },
      {
        title: "Awaiting Verification",
        value: stats.awaitingVerification,
        icon: <ShieldCheck size={22} />,
        className: "warning",
      },
      {
        title: "Awaiting Authorization",
        value: stats.awaitingAuthorization,
        icon: <LockKeyhole size={22} />,
        className: "warning",
      },
      {
        title: "Awaiting Release",
        value: stats.awaitingRelease,
        icon: <UnlockKeyhole size={22} />,
        className: "warning",
      },
      {
        title: "Released Results",
        value: stats.releasedResults,
        icon: <CheckCircle2 size={22} />,
        className: "success",
      },
      {
        title: "Low Stock",
        value: stats.lowStock,
        icon: <Package size={22} />,
      },
      {
        title: "QC Failures",
        value: stats.qcFailures,
        icon: <ShieldAlert size={22} />,
        className: "danger",
      },
      {
        title: "Maintenance",
        value: stats.maintenanceDue,
        icon: <Wrench size={22} />,
      },
      {
        title: "Temperature Alerts",
        value: stats.temperatureAlerts,
        icon: <Thermometer size={22} />,
      },
      {
        title: "Revenue Today",
        value: formatMoney(stats.revenueToday),
        icon: <DollarSign size={22} />,
        className: "revenue",
      },
      {
        title: "Revenue This Month",
        value: formatMoney(stats.revenueMonth),
        icon: <DollarSign size={22} />,
        className: "revenue",
      },
    ],
    [stats]
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (!user) {
    return <div className="page">Loading Dashboard...</div>;
  }

  if (!isManagerOrDirector(user)) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-eyebrow">
            PEFA MANAGEMENT CONTROL CENTRE
          </div>
          <h1>
            {greeting}, {user.full_name}
          </h1>
          <p>
            {user.role} • PEFA Medical Diagnostic Services • Management Dashboard
          </p>
          {lastUpdated && (
            <span className="dashboard-last-updated">
              Live data · Updated {formatDate(lastUpdated, true)}
            </span>
          )}
        </div>

        <div className="dashboard-header-right">
          <button
            type="button"
            className="dashboard-refresh"
            onClick={loadDashboard}
            disabled={loading}
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={loading ? "dashboard-spin" : ""} />
            Refresh
          </button>

          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt=""
              className="dashboard-avatar"
            />
          ) : (
            <div className="dashboard-avatar-placeholder">
              {user.full_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {dashboardError && (
        <div className="dashboard-error" role="alert">
          <strong>Dashboard data warning:</strong> {dashboardError}
        </div>
      )}

      <div className="dashboard-grid">
        {cards.map((item) => (
          <div
            key={item.title}
            className={`dashboard-card ${item.className || ""}`}
          >
            <div className="card-icon">{item.icon}</div>
            <h4>{item.title}</h4>
            <h2>{loading ? "…" : item.value}</h2>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="dashboard-panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button type="button" onClick={() => navigate("/registration")}>
              Registration
            </button>
            <button
              type="button"
              onClick={() => navigate("/laboratory-result-entry")}
            >
              Enter Result
            </button>
            <button type="button" onClick={() => navigate("/payment-portal")}>
              Payment
            </button>
            <button type="button" onClick={() => navigate("/referrals")}>
              Referrals
            </button>
          </div>
        </div>

        <div className="dashboard-panel">
          <h3>
            <Bell size={18} /> Management Notifications
          </h3>

          <div className="dashboard-notification-list">
            {notifications.map((item, index) => (
              <button
                key={`${item.type}-${index}`}
                type="button"
                className={`notification notification-clickable ${item.type}`}
                onClick={item.action || undefined}
                disabled={!item.action}
              >
                <span className="notification-icon">{item.icon}</span>
                <span className="notification-copy">
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                </span>
                {item.action && (
                  <ArrowRight size={16} className="notification-arrow" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-panel">
          <h3>
            <Building2 size={18} /> Branch Revenue — This Month
          </h3>

          <div className="branch-revenue-wrap">
            {branchRevenue.length ? (
              <table className="dashboard-table branch-revenue-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Today</th>
                    <th>This Month</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchRevenue.map((branch) => (
                    <tr key={branch.branch}>
                      <td>
                        <span className="branch-name">
                          <Building2 size={14} />
                          {branch.branch}
                        </span>
                      </td>
                      <td>{formatMoney(branch.today)}</td>
                      <td>
                        <strong>{formatMoney(branch.month)}</strong>
                      </td>
                      <td>{branch.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dashboard-empty">
                No payment transactions recorded for this month.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel dashboard-revenue-summary">
          <h3>
            <DollarSign size={18} /> Revenue Overview
          </h3>

          <div className="revenue-summary-card revenue-summary-today">
            <span>Today's Revenue</span>
            <strong>{formatMoney(stats.revenueToday)}</strong>
          </div>

          <div className="revenue-summary-card revenue-summary-month">
            <span>Month-to-Date</span>
            <strong>{formatMoney(stats.revenueMonth)}</strong>
          </div>

          <button
            type="button"
            className="revenue-history-link"
            onClick={() => navigate("/payment-history")}
          >
            Open Payment History <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-panel">
          <h3>Recent Patients</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Lab No</th>
                <th>Branch</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    {patient.patient_name || patient.full_name || "—"}
                  </td>
                  <td>{patient.lab_number || "—"}</td>
                  <td>{normalizeBranch(patient)}</td>
                  <td>
                    {formatDate(patient.created_at || patient.registration_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-panel">
          <h3>Recent Results</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.patient_name || "—"}</td>
                  <td>
                    <span className="status-success">{statusText(result)}</span>
                  </td>
                  <td>
                    {formatDate(result.updated_at || result.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-panel">
        <h3>Recent Activity</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((log) => (
              <tr key={log.id}>
                <td>{log.user_name || "—"}</td>
                <td>{log.action || "—"}</td>
                <td>{log.module || "—"}</td>
                <td>{formatDate(log.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
