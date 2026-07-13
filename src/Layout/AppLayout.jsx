import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Bell,
  Clock3,
  Search,
  AlertTriangle,
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  Activity,
  Users,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import "../styles/appLayout.css";

import { supabase } from "../supabase";

import {
  RESULT_STATUS,
} from "../Utils/resultStatusEngine";

export default function AppLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );

  const [
    globalSearch,
    setGlobalSearch,
  ] = useState("");

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  /* =========================
     LIVE CLOCK
  ========================= */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () =>
      clearInterval(
        timer
      );
  }, []);

  /* =========================
     NOTIFICATIONS
  ========================= */

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications =
    async () => {
      const {
        data,
      } = await supabase
        .from(
          "patient_results"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(5);

      const items =
        [];

      data?.forEach(
        (item) => {
          if (
            item.authorization_status ===
            RESULT_STATUS.PENDING
          ) {
            items.push({
              message: `${item.patient_name} pending review.`,
            });
          }

          if (
            item.authorization_status ===
            RESULT_STATUS.AUTHORIZED
          ) {
            items.push({
              message: `${item.patient_name} authorized.`,
            });
          }

          if (
            item.result_data?.hb <
              6 ||
            item.result_data
              ?.platelet <
              20
          ) {
            items.push({
              message: `Critical CBC alert for ${item.patient_name}.`,
            });
          }
        }
      );

      setNotifications(
        items
      );
    };

  /* =========================
     SEARCH
  ========================= */

  const handleSearch =
    (e) => {
      e.preventDefault();

      if (
        !globalSearch.trim()
      )
        return;

      navigate(
        `/dashboard/results?search=${globalSearch}`
      );
    };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout =
    () => {
      navigate("/");
    };

  /* =========================
     ACTIVE LINK
  ========================= */

  const isActive =
    (path) =>
      location.pathname ===
      path;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}

      <aside className="sidebar">
        {/* TOP */}

        <div>
          {/* LOGO */}

          <div className="sidebar-logo">
            <h2>
              PEFA LIS
            </h2>

            <p>
              Enterprise
              Edition
            </p>

            <img
              src="/logo.png"
              alt="PEFA Logo"
              className="sidebar-image"
            />
          </div>

          {/* NAVIGATION */}

          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className={
                isActive(
                  "/dashboard"
                )
                  ? "active-link"
                  : ""
              }
            >
              <LayoutDashboard
                size={18}
              />

              Dashboard
            </Link>

            <Link
              to="/dashboard/registration"
              className={
                isActive(
                  "/dashboard/registration"
                )
                  ? "active-link"
                  : ""
              }
            >
              <UserPlus
                size={18}
              />

              Registration
            </Link>

            <Link
              to="/dashboard/results"
              className={
                isActive(
                  "/dashboard/results"
                )
                  ? "active-link"
                  : ""
              }
            >
              <ClipboardList
                size={18}
              />

              Results
            </Link>

            <Link
              to="/dashboard/hematology-report"
              className={
                isActive(
                  "/dashboard/hematology-report"
                )
                  ? "active-link"
                  : ""
              }
            >
              <Activity
                size={18}
              />

              Hematology
            </Link>

            <Link
              to="/dashboard/staff-manager"
              className={
                isActive(
                  "/dashboard/staff-manager"
                )
                  ? "active-link"
                  : ""
              }
            >
              <Users
                size={18}
              />

              Staff Manager
            </Link>

            <Link
              to="/patient-portal"
            >
              Patient Portal
            </Link>
          </nav>
        </div>

        {/* LOGOUT */}

        <button
          className="logout-btn"
          onClick={
            handleLogout
          }
        >
          <LogOut size={18} />

          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        {/* TOPBAR */}

        <div className="topbar">
          {/* SEARCH */}

          <form
            className="global-search"
            onSubmit={
              handleSearch
            }
          >
            <Search size={18} />

            <input
              type="text"
              placeholder="Search patient, lab number..."
              value={
                globalSearch
              }
              onChange={(e) =>
                setGlobalSearch(
                  e.target.value
                )
              }
            />
          </form>

          {/* RIGHT */}

          <div className="topbar-right">
            {/* CLOCK */}

            <div className="topbar-clock">
              <Clock3 size={16} />

              <span>
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            {/* NOTIFICATIONS */}

            <div className="notification-wrapper">
              <div
                className="topbar-bell"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >
                <Bell size={18} />

                {notifications.length >
                  0 && (
                  <div className="notification-count">
                    {
                      notifications.length
                    }
                  </div>
                )}
              </div>

              {/* DROPDOWN */}

              {showNotifications && (
                <div className="notification-dropdown">
                  <h4>
                    Notifications
                  </h4>

                  {notifications.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="notification-item"
                      >
                        <AlertTriangle
                          size={
                            16
                          }
                        />

                        <span>
                          {
                            item.message
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <Outlet />
      </main>
    </div>
  );
}