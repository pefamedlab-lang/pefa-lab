import { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";

import "../styles/dashboardLayout.css";

export default function DashboardLayout() {
  const user =
    JSON.parse(localStorage.getItem("pefa_user"));

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div
      className={`dashboard-container ${
        mobileMenuOpen ? "mobile-menu-open" : ""
      }`}
    >
      <div
        className="mobile-sidebar-overlay"
        aria-hidden={!mobileMenuOpen}
        onClick={closeMobileMenu}
      />

      <aside
        className={`sidebar-wrapper ${
          mobileMenuOpen ? "sidebar-wrapper-open" : ""
        }`}
      >
        <DashboardSidebar
          mobileOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
        />
      </aside>

      <div className="content-panel">
        <header className="topbar">
          <DashboardNavbar
            onMenuToggle={() =>
              setMobileMenuOpen(
                (previous) => !previous
              )
            }
          />
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
