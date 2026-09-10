import {
  useState,
  useMemo,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  ChevronDown,
  ChevronRight,
  Search,
  LayoutDashboard,
  UserPlus,
  FlaskConical,
  ShieldCheck,
  ScanLine,
  Wallet,
  Package,
  UsersRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import "../styles/sidebar.css";

export default function DashboardSidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const location = useLocation();

  const user =
    JSON.parse(
      localStorage.getItem("pefa_user")
    ) || {};

  const [search, setSearch] = useState("");

  const [sections, setSections] =
    useState({
      reception: true,
      laboratory: true,
      quality: false,
      radiology: false,
      finance: false,
      inventory: false,
      referrals: false,
      admin: false,
    });

  const toggleSection = (name) => {
    setSections((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  const logout = () => {
    localStorage.removeItem("pefa_user");
    window.location.href = "/login";
  };

  const menuData = useMemo(
    () => [
      {
        section: "Reception",
        key: "reception",
        icon: <UserPlus size={18} />,
        roles: [
          "Receptionist",
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Registration",
            path: "/registration",
          },
          {
            label: "Payment Portal",
            path: "/payment-portal",
          },
          {
            label: "Registration Records",
            path: "/registration-records",
          },
        ],
      },
      {
        section: "Laboratory",
        key: "laboratory",
        icon: <FlaskConical size={18} />,
        roles: [
          "Scientist",
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Result Entry",
            path: "/laboratory-result-entry",
          },
          {
            label: "Result Dashboard",
            path: "/result-dashboard",
          },
          {
            label: "Specimen Tracking",
            path: "/specimen-tracking",
          },
          {
            label: "Patient Result Portal",
            path: "/patient-results",
          },
          {
            label: "Test Control",
            path: "/test-control",
          },
        ],
      },
      {
        section: "Quality & Monitoring",
        key: "quality",
        icon: <ShieldCheck size={18} />,
        roles: [
          "Scientist",
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Temperature Monitoring",
            path: "/temperature-monitoring",
          },
          {
            label: "Quality Control",
            path: "/quality-control",
          },
          {
            label: "Equipment Management",
            path: "/equipment",
          },
          {
            label: "Maintenance History",
            path: "/maintenance-history",
          },
        ],
      },
      {
        section: "Radiology",
        key: "radiology",
        icon: <ScanLine size={18} />,
        roles: [
          "Radiologist",
          "Sonographer",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Ultrasound Registration",
            path: "/ultrasound-registration",
          },
          {
            label: "Ultrasound Results",
            path: "/ultrasound-results",
          },
          {
            label: "Ultrasound Records",
            path: "/ultrasound-records",
          },
          {
            label: "Print Reports",
            path: "/ultrasound-report",
          },
          {
            label: "Ultrasound Analytics",
            path: "/ultrasound-analytics",
          },
        ],
      },
      {
        section: "Finance",
        key: "finance",
        icon: <Wallet size={18} />,
        roles: [
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Finance Overview",
            path: "/finance",
          },
          {
            label: "Income",
            path: "/income",
          },
          {
            label: "Expenses",
            path: "/expenses",
          },
          {
            label: "Financial Reports",
            path: "/financial-reports",
          },
          {
            label: "Finance Analytics",
            path: "/finance-analytics",
          },
          {
            label: "Payment History",
            path: "/payment-history",
          },
          {
            label: "Patient Finance History",
            path: "/patient-finance-history",
          },
        ],
      },
      {
        section: "Inventory",
        key: "inventory",
        icon: <Package size={18} />,
        roles: [
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Inventory",
            path: "/inventory",
          },
          {
            label: "Inventory Transactions",
            path: "/inventory-transactions",
          },
        ],
      },
      {
        section: "Referrals",
        key: "referrals",
        icon: <UsersRound size={18} />,
        roles: [
          "Manager",
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Referral Dashboard",
            path: "/referrals",
          },
        ],
      },
      {
        section: "Administration",
        key: "admin",
        icon: <Settings size={18} />,
        roles: [
          "Director",
          "Admin",
        ],
        items: [
          {
            label: "Audit Trail",
            path: "/audit-trail",
          },
          {
            label: "Staff Management",
            path: "/staff-management",
          },
          {
            label: "Letter Head Printing",
            path: "/letterhead",
          },
          {
            label: "Role Permissions",
            path: "/role-permissions",
          },
        ],
      },
    ],
    []
  );

  const normalizedSearch =
    search.trim().toLowerCase();

  const closeAfterNavigation = () => {
    onClose();
  };

  return (
    <div
      className={`sidebar ${
        mobileOpen
          ? "sidebar-mobile-open"
          : ""
      }`}
      aria-label="PEFA navigation"
    >
      <div className="sidebar-mobile-header">
        <div>
          <strong>PEFA LIS</strong>
          <span>Enterprise</span>
        </div>

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
          title="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      <div className="sidebar-logo">
        <img
          src="/logo.png"
          alt="PEFA"
          className="sidebar-brand-logo"
        />

        <span className="sidebar-version">
          Enterprise v1.0
        </span>

        <h2>PEFA Enterprise LIS</h2>
      </div>

      <div className="sidebar-user-card">
        {user.profile_photo ? (
          <img
            src={user.profile_photo}
            alt=""
            className="sidebar-avatar"
          />
        ) : (
          <div className="sidebar-avatar-placeholder">
            {user.full_name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>
        )}

        <h4>{user.full_name}</h4>
        <p>{user.role}</p>

        <span className="user-status">
          ● Active
        </span>
      </div>

      <div className="sidebar-search">
        <Search size={16} />

        <input
          type="search"
          placeholder="Search Menu..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          aria-label="Search menu"
        />
      </div>

      <div className="sidebar-content">
        <Link
          to="/dashboard"
          onClick={closeAfterNavigation}
          className={`sidebar-link ${
            location.pathname === "/dashboard"
              ? "active-sidebar-link"
              : ""
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        {menuData.map((group) => {
          if (
            !group.roles.includes(user.role)
          ) {
            return null;
          }

          const visibleItems =
            group.items.filter(
              (item) =>
                !normalizedSearch ||
                item.label
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
            );

          if (
            normalizedSearch &&
            visibleItems.length === 0
          ) {
            return null;
          }

          return (
            <div
              key={group.key}
              className="sidebar-menu-group"
            >
              <button
                type="button"
                className="sidebar-group"
                onClick={() =>
                  toggleSection(group.key)
                }
                aria-expanded={
                  !!sections[group.key]
                }
              >
                <div>
                  {group.icon}
                  <span>
                    {group.section}
                  </span>
                </div>

                {sections[group.key] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {sections[group.key] && (
                <div className="sidebar-submenu">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={
                        closeAfterNavigation
                      }
                      className={
                        location.pathname ===
                        item.path
                          ? "active-sidebar-link"
                          : ""
                      }
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="logout-btn"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
