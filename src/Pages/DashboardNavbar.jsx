import {
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  ClipboardList,
  Menu,
} from "lucide-react";

import { supabase } from "../supabase";
import "../styles/dashboardNavbar.css";

export default function DashboardNavbar({
  onMenuToggle,
}) {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const user =
    JSON.parse(
      localStorage.getItem("pefa_user")
    ) || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase
        .from("audit_logs")
        .insert([
          {
            user_name: user.full_name,
            user_role: user.role,
            action: "User Logout",
            module: "Authentication",
            description:
              `${user.full_name} logged out`,
          },
        ]);
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("pefa_user");
    navigate("/login");
  };

  return (
    <div className="premium-navbar">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        title="Menu"
      >
        <Menu size={22} />
      </button>

      <div className="navbar-brand">
        <div className="brand-accent" />

        <div className="navbar-brand-copy">
          <h2>PEFA Enterprise LIS</h2>
          <p>
            Medical Diagnostic Services
          </p>
        </div>
      </div>

      <div className="navbar-center">
        <div>
          {currentTime.toLocaleDateString(
            "en-GB",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </div>
        <div>
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="icon-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="icon-btn desktop-settings-btn"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="profile-wrapper">
          <button
            type="button"
            className="profile-card"
            onClick={() =>
              setShowMenu(
                (previous) => !previous
              )
            }
            aria-expanded={showMenu}
            aria-haspopup="menu"
          >
            {user.profile_photo ? (
              <img
                src={user.profile_photo}
                alt="Profile"
                className="profile-avatar"
              />
            ) : (
              <div className="profile-placeholder">
                {user.full_name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            )}

            <div className="profile-info">
              <h4>
                {user.full_name ||
                  "Staff User"}
              </h4>
              <p>
                {user.role || "User"}
              </p>
            </div>

            <ChevronDown size={18} />
          </button>

          {showMenu && (
            <div
              className="profile-dropdown"
              role="menu"
            >
              <button type="button" role="menuitem">
                <User size={16} />
                My Profile
              </button>

              <button type="button" role="menuitem">
                <Settings size={16} />
                Settings
              </button>

              <button type="button" role="menuitem">
                <ClipboardList size={16} />
                Activity Log
              </button>

              <button
                type="button"
                role="menuitem"
                className="logout-dropdown"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
