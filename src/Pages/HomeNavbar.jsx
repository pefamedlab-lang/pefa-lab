import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function HomeNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Check Result",
      to: "/patient-results",
    },
    {
      label: "Patient Registration",
      to: "/registration",
    },
    {
      label: "Dashboard Access",
      to: "/login",
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <header className="home-navbar">

      <div className="home-navbar-container">

        {/* =====================================================
            LOGO / BRAND
        ===================================================== */}

        <Link
          to="/"
          className="home-brand"
          onClick={() => setMobileOpen(false)}
        >

          <img
            src="/logo.png"
            alt="PEFA Medical Diagnostic Services"
            className="home-brand-logo"
          />

          <div className="home-brand-name">

            <div className="brand-line">
              <span className="brand-blue">
                PEFA MEDICAL
              </span>

              <span className="brand-red">
                {" "}DIAGNOSTIC
              </span>
            </div>

            <div className="brand-services">
              SERVICES
            </div>

          </div>

        </Link>


        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <nav className="home-navigation">

          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`home-nav-link ${
                isActive(item.to)
                  ? "active"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

        </nav>


        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMobileOpen((previous) => !previous)
          }
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <div
        className={`mobile-navigation ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >

        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`mobile-nav-link ${
              isActive(item.to)
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMobileOpen(false)
            }
          >
            {item.label}
          </Link>
        ))}

      </div>

    </header>
  );
}