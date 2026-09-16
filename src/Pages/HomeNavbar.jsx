import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  ClipboardList,
  ShieldCheck,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

export default function HomeNavbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Wellness", to: "/wellness-packages", accent: true },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="home-navbar">
      <div className="navbar-shell">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-mark">
            <img
              src="/logo.png"
              alt="PEFA Medical Diagnostic Services"
            />
          </span>

          <span className="brand-copy">
            <strong>PEFA</strong>
            <span>MEDICAL DIAGNOSTIC SERVICES</span>
          </span>
        </Link>

        <nav className={`navbar-nav ${open ? "is-open" : ""}`}>
          <div className="nav-links">
            {navItems.map((item) =>
              item.to ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `nav-link ${item.accent ? "nav-link-accent" : ""} ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  {item.label}
                  {item.accent && <HeartPulse size={15} />}
                </NavLink>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          <div className="navbar-actions">
            <Link
              to="/patient-results"
              className="nav-action nav-result"
              onClick={closeMenu}
            >
              <FileText size={16} />
              Check Result
            </Link>

            <Link
              to="/login"
              className="nav-action nav-staff"
              onClick={closeMenu}
            >
              <ShieldCheck size={16} />
              Staff Login
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="mobile-quick-actions">
          <Link to="/test-request" onClick={closeMenu}>
            <ClipboardList size={17} />
            Submit Test Request
            <ChevronRight size={16} />
          </Link>

          <a href="https://wa.me/2348086618621" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            Book via WhatsApp
            <ChevronRight size={16} />
          </a>
        </div>
      )}
    </header>
  );
}
