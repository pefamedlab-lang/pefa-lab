import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Menu,
  X,
} from "lucide-react";

import "../styles/navbar.css";

export default function HomeNavbar() {
  const [
    mobileMenu,
    setMobileMenu,
  ] = useState(false);

  const closeMenu =
    () => {
      setMobileMenu(
        false
      );
    };

  return (
    <nav className="home-navbar">
      <div className="navbar-container">
        {/* LOGO */}

        <Link
          to="/"
          className="navbar-logo"
        >
          <img
            src="/logo.png"
            alt="PEFA Logo"
          />

          <div className="logo-text">
            <h2>
              PEFA MEDICAL
            </h2>

            <span>
              Diagnostic
              Services
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}

        <div className="navbar-links">
          <a href="#home">
            Home
          </a>

          <a href="#about">
            About
          </a>

          <a href="#services">
            Services
          </a>

          <a href="#contact">
            Contact
          </a>

          {/* RESULT CHECKER */}

          <Link
            to="/patient-portal"
            className="result-link"
          >
            Result Checker
          </Link>

          {/* DASHBOARD */}

          <Link
            to="/dashboard"
            className="dashboard-btn"
          >
            Dashboard
          </Link>
        </div>

        {/* MOBILE BUTTON */}

        <button
          className="menu-btn"
          onClick={() =>
            setMobileMenu(
              !mobileMenu
            )
          }
        >
          {mobileMenu ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}

      {mobileMenu && (
        <div className="mobile-menu">
          <a
            href="#home"
            onClick={
              closeMenu
            }
          >
            Home
          </a>

          <a
            href="#about"
            onClick={
              closeMenu
            }
          >
            About
          </a>

          <a
            href="#services"
            onClick={
              closeMenu
            }
          >
            Services
          </a>

          <a
            href="#contact"
            onClick={
              closeMenu
            }
          >
            Contact
          </a>

          {/* RESULT CHECKER */}

          <Link
            to="/patient-portal"
            onClick={
              closeMenu
            }
          >
            Result Checker
          </Link>

          {/* DASHBOARD */}

          <Link
            to="/dashboard"
            className="mobile-dashboard-btn"
            onClick={
              closeMenu
            }
          >
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}