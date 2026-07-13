import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./Pages/ProtectedRoute";

/* =====================================================
   LAYOUT
===================================================== */

import DashboardLayout from "./Pages/DashboardLayout";

/* =====================================================
   PUBLIC PAGES
===================================================== */

import HomePage from "./Pages/HomePage";
import LoginPortal from "./Pages/LoginPortal";
import PatientResultPortal from "./Pages/PatientResultPortal";

/* =====================================================
   MAIN DASHBOARD
===================================================== */

import Dashboard from "./Pages/Dashboard";

/* =====================================================
   LAB MODULES
===================================================== */

import RegistrationPortal from "./Pages/RegistrationPortal";
import PaymentPortal from "./Pages/PaymentPortal";
import ResultDashboard from "./Pages/ResultDashboard";
import ResultRecords from "./Pages/ResultRecords";
import RegistrationRecords from "./Pages/RegistrationRecords";
import TestControlPortal from "./Pages/TestControlPortal";
import HematologyDashboard from "./Pages/HematologyDashboard";
import ChemistryDashboard from "./Pages/ChemistryDashboard";
import MicrobiologyDashboard from "./Pages/MicrobiologyDashboard";
import SpecimenTracking from "./Pages/SpecimenTracking";
import AuditTrail
from "./Pages/AuditTrail";
import InventoryTransactions
from "./Pages/InventoryTransactions";
import QualityControl
from "./Pages/QualityControl";
import EquipmentManagement
from "./Pages/EquipmentManagement";
import TemperatureMonitoring
from "./Pages/TemperatureMonitoring";
import MaintenanceHistory
from "./Pages/MaintenanceHistory";
import FinanceDashboard
from "./Pages/FinanceDashboard";
import PaymentHistory
from "./Pages/PaymentHistory";
import PatientFinanceHistory
from "./Pages/PatientFinanceHistory";
import LetterHeadPortal
from "./Pages/LetterHeadPortal";


/* =====================================================
   ULTRASOUND
===================================================== */

import UltrasoundRegistration
from "./Pages/UltrasoundRegistration";
import UltrasoundResultDashboard from "./Pages/UltrasoundResultDashboard";
import UltrasoundRecords
from "./Pages/UltrasoundRecords";
import UltrasoundAnalytics
from "./Pages/UltrasoundAnalytics";

/* =====================================================
   ENTERPRISE MODULES
===================================================== */

import ReferralDashboard from "./Pages/ReferralDashboard";
import InventoryDashboard from "./Pages/InventoryDashboard";
import StaffManagementDashboard from "./Pages/StaffManagementDashboard";

import ExpensePortal
from "./Pages/ExpensePortal";

import IncomePortal
from "./Pages/IncomePortal";

import FinancialReports
from "./Pages/FinancialReports";

import FinanceAnalytics
from "./Pages/FinanceAnalytics";

import RolePermissionManager
from "./Pages/RolePermissionManager";



/* =====================================================
   APP
===================================================== */

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPortal />}
        />

        <Route
          path="/patient-results"
          element={<PatientResultPortal />}
        />

        {/* =====================================================
            PROTECTED DASHBOARD LAYOUT
        ===================================================== */}

        <Route
          element={

            <ProtectedRoute>

              <DashboardLayout />

            </ProtectedRoute>
          }
        >

          {/* =====================================================
              DASHBOARD
          ===================================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* =====================================================
              REGISTRATION
          ===================================================== */}

          <Route
            path="/registration"
            element={

              <ProtectedRoute
               allowedRoles={[
  "Receptionist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <RegistrationPortal />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              PAYMENT
          ===================================================== */}

          <Route
            path="/payment-portal"
            element={

              <ProtectedRoute
                allowedRoles={[
  "Receptionist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <PaymentPortal />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              REGISTRATION RECORDS
          ===================================================== */}

          <Route
            path="/registration-records"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "Receptionist",
                  "Cashier",
                  "Admin",
                ]}
              >

                <RegistrationRecords />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              RESULT DASHBOARD
          ===================================================== */}

          <Route
            path="/result-dashboard"
            element={

              <ProtectedRoute
                allowedRoles={[
  "Scientist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <ResultDashboard />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              RESULT RECORDS
          ===================================================== */}

          <Route
            path="/result-records"
            element={

              <ProtectedRoute
               allowedRoles={[
  "Scientist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <ResultRecords />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              SPECIMEN TRACKING
          ===================================================== */}

          <Route
            path="/specimen-tracking"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "Scientist",
                  "Admin",
                ]}
              >

                <SpecimenTracking />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              TEST CONTROL
          ===================================================== */}

          <Route
            path="/test-control"
            element={

              <ProtectedRoute
                allowedRoles={[
                   "Director",
                  "Admin",
                ]}
              >

                <TestControlPortal />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              HEMATOLOGY
          ===================================================== */}

          <Route
            path="/hematology"
            element={

              <ProtectedRoute
                allowedRoles={[
  "Scientist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <HematologyDashboard />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              CHEMISTRY
          ===================================================== */}

          <Route
            path="/chemistry"
            element={

              <ProtectedRoute
               allowedRoles={[
  "Scientist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <ChemistryDashboard />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              MICROBIOLOGY
          ===================================================== */}

          <Route
            path="/microbiology"
            element={

              <ProtectedRoute
                allowedRoles={[
  "Scientist",
  "Manager",
  "Director",
  "Admin",
]}
              >

                <MicrobiologyDashboard />

              </ProtectedRoute>
            }
          />

          {/* =====================================================
              ULTRASOUND REGISTRATION
          ===================================================== */}

          <Route

  path="/ultrasound-registration"

  element={

    <ProtectedRoute

      allowedRoles={[

        "Receptionist",

        "Director",

        "Admin",

      ]}

    >

      <UltrasoundRegistration />

    </ProtectedRoute>

  }

/>

          {/* =====================================================
              ULTRASOUND RESULTS
          ===================================================== */}

         <Route
  path="/ultrasound-results"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Radiologist",
        "Director",
        "Admin",
      ]}
    >
      <UltrasoundResultDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/ultrasound-records"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Radiologist",
        "Director",
        "Admin",
      ]}
    >
      <UltrasoundRecords />
    </ProtectedRoute>
  }
/>

          {/* =====================================================
              ULTRASOUND ANALYTICS
          ===================================================== */}

         <Route

  path="/ultrasound-analytics"

  element={

    <ProtectedRoute

      allowedRoles={[

        "Radiologist",
        "Director",
        "Admin",

      ]}

    >

      <UltrasoundAnalytics />

    </ProtectedRoute>

  }

/>

<Route
  path="/finance"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <FinanceDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/finance-analytics"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <FinanceAnalytics />
    </ProtectedRoute>
  }
/>

          {/* =====================================================
              REFERRAL DASHBOARD
          ===================================================== */}

        <Route
  path="/referrals"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <ReferralDashboard />
    </ProtectedRoute>
  }
/>

         
          {/* =====================================================
              INVENTORY
          ===================================================== */}

          <Route
            path="/inventory"
            element={

              <ProtectedRoute
               allowedRoles={[
  "Manager",
  "Director",
  "Admin",
]}
              >

                <InventoryDashboard />

              </ProtectedRoute>
            }
          />

<Route
  path="/payment-history"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <PaymentHistory />
    </ProtectedRoute>
  }
/>

<Route
  path="/patient-finance-history"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <PatientFinanceHistory />
    </ProtectedRoute>
  }
/>

<Route
  path="/income"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <IncomePortal />
    </ProtectedRoute>
  }
/>

<Route
  path="/expenses"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <ExpensePortal />
    </ProtectedRoute>
  }
/>

<Route
  path="/financial-reports"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <FinancialReports />
    </ProtectedRoute>
  }
/>

<Route
  path="/letterhead"
  element={<LetterHeadPortal />}
/>


 {/* =====================================================
              STAFF MANAGEMENT
          ===================================================== */}

          <Route
            path="/staff-management"
            element={

              <ProtectedRoute
                allowedRoles={[
    "Director",
  "Admin",
]}
              >

                <StaffManagementDashboard />

              </ProtectedRoute>
            }
          />

        </Route>

<Route
  path="/role-permissions"
  element={
    <RolePermissionManager />
  }
/>

<Route
  path="/audit-trail"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Director",
        "Admin",
      ]}
    >
      <AuditTrail />
    </ProtectedRoute>
  }
/>

<Route
  path="/inventory-transactions"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <InventoryTransactions />
    </ProtectedRoute>
  }
/>

<Route
  path="/quality-control"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <QualityControl />
    </ProtectedRoute>
  }
/>

<Route
  path="/equipment"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <EquipmentManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/maintenance-history"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <MaintenanceHistory />
    </ProtectedRoute>
  }
/>


<Route
  path="/temperature-monitoring"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <TemperatureMonitoring />
    </ProtectedRoute>
  }
/>

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}