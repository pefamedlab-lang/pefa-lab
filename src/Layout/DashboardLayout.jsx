import { Outlet } from "react-router-dom";

import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";

import "./dashboard.css";

export default function DashboardLayout() {

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <DashboardSidebar />

      {/* MAIN */}

      <div className="dashboard-main">

        {/* NAVBAR */}

        <DashboardNavbar />

        {/* PAGE CONTENT */}

        <div className="dashboard-content">

          <Outlet />

        </div>

      </div>

    </div>
  );
}