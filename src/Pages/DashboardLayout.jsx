import { Outlet } from "react-router-dom";

import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";

import "../styles/dashboardLayout.css";

export default function DashboardLayout() {

  const user =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    );

  if (!user) {

    window.location.href =
      "/login";

    return null;

  }

  return (

    <div className="dashboard-container">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar-wrapper">

        <DashboardSidebar />

      </aside>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="content-panel">

        {/* NAVBAR */}

        <header className="topbar">

          <DashboardNavbar />

        </header>

        {/* PAGE CONTENT */}

        <main className="page-content">

          <Outlet />

        </main>

      </div>

    </div>

  );

}