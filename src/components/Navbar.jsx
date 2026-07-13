import "../styles/dashboard.css";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Activity,
  Microscope,
  Droplets,
  ScanLine,
  Receipt,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  UserCog,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const location =
    useLocation();

  const menu = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <LayoutDashboard size={18} />
      ),
    },

    {
      path: "/registration",
      label:
        "Registration",
      icon: (
        <Users size={18} />
      ),
    },

    {
      path: "/patients",
      label:
        "Patients",
      icon: (
        <Users size={18} />
      ),
    },

    {
      path: "/hematology",
      label:
        "Hematology",
      icon: (
        <Activity size={18} />
      ),
    },

    {
      path: "/chemistry",
      label:
        "Chemistry",
      icon: (
        <FlaskConical size={18} />
      ),
    },

    {
      path: "/microbiology",
      label:
        "Microbiology",
      icon: (
        <Microscope size={18} />
      ),
    },

    {
      path: "/blood-banking",
      label:
        "Blood Banking",
      icon: (
        <Droplets size={18} />
      ),
    },

    {
      path: "/ultrasound",
      label:
        "Ultrasound",
      icon: (
        <ScanLine size={18} />
      ),
    },

    {
      path: "/invoice",
      label:
        "Billing",
      icon: (
        <Receipt size={18} />
      ),
    },

    {
      path:
        "/result-checker",
      label:
        "Result Checker",
      icon: (
        <ClipboardList size={18} />
      ),
    },

    {
      path: "/analytics",
      label:
        "Analytics",
      icon: (
        <BarChart3 size={18} />
      ),
    },

    {
      path: "/audit-log",
      label:
        "Audit Log",
      icon: (
        <ShieldCheck size={18} />
      ),
    },

    {
      path:
        "/test-manager",
      label:
        "Test Manager",
      icon: (
        <FlaskConical size={18} />
      ),
    },

    {
      path:
        "/staff-manager",
      label:
        "Staff",
      icon: (
        <UserCog size={18} />
      ),
    },
  ];

  return (
    <div
      style={{
        width: "260px",

        height: "100vh",

        position: "fixed",

        left: 0,

        top: 0,

        background:
          "#003f6f",

        color: "white",

        padding: "25px",

        overflowY: "auto",

        boxShadow:
          "0 0 20px rgba(0,0,0,0.15)",
      }}
    >
      {/* LOGO */}

      <div
        style={{
          marginBottom:
            "35px",

          textAlign:
            "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "75px",

            marginBottom:
              "15px",
          }}
        />

        <h2
          style={{
            fontSize:
              "26px",

            fontWeight:
              "bold",
          }}
        >
          PEFA LIS
        </h2>

        <p
          style={{
            fontSize:
              "14px",

            opacity: 0.8,

            marginTop:
              "5px",
          }}
        >
          Enterprise System
        </p>
      </div>

      {/* MENU */}

      <div
        style={{
          display: "flex",

          flexDirection:
            "column",

          gap: "10px",
        }}
      >
        {menu.map(
          (
            item,
            index
          ) => (
            <Link
              key={index}
              to={item.path}
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: "12px",

                padding:
                  "14px 16px",

                borderRadius:
                  "12px",

                textDecoration:
                  "none",

                color: "white",

                background:
                  location.pathname ===
                  item.path
                    ? "#68c414"
                    : "rgba(255,255,255,0.08)",

                fontWeight:
                  "600",

                transition:
                  "0.3s",
              }}
            >
              {item.icon}

              {item.label}
            </Link>
          )
        )}
      </div>

      {/* LOGOUT */}

      <button
        onClick={() => {
          localStorage.removeItem(
            "pefa_user"
          );

          window.location.href =
            "/";
        }}
        style={{
          width: "100%",

          marginTop:
            "30px",

          border: "none",

          background:
            "#e41e26",

          color: "white",

          padding:
            "15px",

          borderRadius:
            "12px",

          fontWeight:
            "bold",

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap: "10px",

          cursor:
            "pointer",
        }}
      >
        <LogOut size={18} />

        Logout
      </button>
    </div>
  );
}