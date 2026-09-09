
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./Pages/ProtectedRoute";
import DashboardLayout from "./Pages/DashboardLayout";

// ============================================================
// PUBLIC
// ============================================================

import HomePage from "./Pages/HomePage";
import LoginPortal from "./Pages/LoginPortal";
import PatientResultPortal from "./Pages/PatientResultPortal";

// ============================================================
// MAIN DASHBOARD
// ============================================================

import Dashboard from "./Pages/Dashboard";

// ============================================================
// REGISTRATION / PAYMENT / INVOICE
// ============================================================

import RegistrationPortal from "./Pages/RegistrationPortal";
import PaymentPortal from "./Pages/PaymentPortal";
import InvoicePrint from "./Pages/InvoicePrint";
import RegistrationRecords from "./Pages/RegistrationRecords";


// ============================================================
// LABORATORY
// ============================================================

import LaboratoryResultDashboard from "./pages/laboratory/LaboratoryResultDashboard";
import LaboratoryResultEntry from "./pages/laboratory/LaboratoryResultEntry";
import TestControlPortal from "./Pages/TestControlPortal";
import SpecimenTracking from "./Pages/SpecimenTracking";

// ============================================================
// QUALITY / EQUIPMENT
// ============================================================

import AuditTrail from "./Pages/AuditTrail";
import InventoryTransactions from "./Pages/InventoryTransactions";
import QualityControl from "./Pages/QualityControl";
import EquipmentManagement from "./Pages/EquipmentManagement";
import TemperatureMonitoring from "./Pages/TemperatureMonitoring";
import MaintenanceHistory from "./Pages/MaintenanceHistory";

// ============================================================
// FINANCE
// ============================================================

import FinanceDashboard from "./Pages/FinanceDashboard";
import PaymentHistory from "./Pages/PaymentHistory";
import PatientFinanceHistory from "./Pages/PatientFinanceHistory";
import LetterHeadPortal from "./Pages/LetterHeadPortal";
import ExpensePortal from "./Pages/ExpensePortal";
import IncomePortal from "./Pages/IncomePortal";
import FinancialReports from "./Pages/FinancialReports";
import FinanceAnalytics from "./Pages/FinanceAnalytics";

// ============================================================
// ULTRASOUND
// ============================================================

import UltrasoundResultDashboard from "./Pages/UltrasoundResultDashboard";
import UltrasoundRecords from "./Pages/UltrasoundRecords";
import UltrasoundAnalytics from "./Pages/UltrasoundAnalytics";
import UltrasoundReportPrint from "./Pages/UltrasoundReportPrint";

// ============================================================
// ENTERPRISE
// ============================================================

import ReferralDashboard from "./Pages/ReferralDashboard";
import InventoryDashboard from "./Pages/InventoryDashboard";
import StaffManagementDashboard from "./Pages/StaffManagementDashboard";
import RolePermissionManager from "./Pages/RolePermissionManager";

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ======================================================
            PUBLIC ROUTES
        ====================================================== */}

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

        {/* ======================================================
            PROTECTED APPLICATION
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* ====================================================
              DASHBOARD
          ==================================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ====================================================
              REGISTRATION
          ==================================================== */}

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

          {/* ====================================================
              PAYMENT PORTAL
              
              RegistrationPortal should navigate to:
              /payment-portal?order_id=ORDER_ID
          ==================================================== */}

          <Route
            path="/payment-portal"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Receptionist",
                  "Cashier",
                  "Manager",
                  "Director",
                  "Admin",
                ]}
              >
                <PaymentPortal />
              </ProtectedRoute>
            }
          />

          {/* ====================================================
              INVOICE
          ==================================================== */}

          <Route
            path="/invoice"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Receptionist",
                  "Cashier",
                  "Manager",
                  "Director",
                  "Admin",
                ]}
              >
                <InvoicePrint />
              </ProtectedRoute>
            }
          />

          {/* ====================================================
              REGISTRATION RECORDS
          ==================================================== */}

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

        {/* ====================================================
    LABORATORY RESULT DASHBOARD
==================================================== */}

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
      <LaboratoryResultDashboard />
    </ProtectedRoute>
  }
/>

{/* Backward-compatible legacy route */}
<Route
  path="/laboratory-results"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <LaboratoryResultDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/laboratory-result-entry"
  element={
    <ProtectedRoute
      allowedRoles={[
        "Scientist",
        "Manager",
        "Director",
        "Admin",
      ]}
    >
      <LaboratoryResultEntry />
    </ProtectedRoute>
  }
/>

         

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

          {/* ====================================================
              ULTRASOUND
          ==================================================== */}

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
                  "Sonographer",
                  "Director",
                  "Admin",
                ]}
              >
                <UltrasoundRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ultrasound-report"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Radiologist",
                  "Director",
                  "Admin",
                ]}
              >
                <UltrasoundReportPrint />
              </ProtectedRoute>
            }
          />

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

          {/* ====================================================
              FINANCE
          ==================================================== */}

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

          {/* ====================================================
              REFERRALS
          ==================================================== */}

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

          {/* ====================================================
              INVENTORY
          ==================================================== */}

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

          {/* ====================================================
              STAFF MANAGEMENT
          ==================================================== */}

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

          <Route
            path="/role-permissions"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <RolePermissionManager />
              </ProtectedRoute>
            }
          />

          {/* ====================================================
              AUDIT
          ==================================================== */}

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

          {/* ====================================================
              QUALITY / EQUIPMENT
          ==================================================== */}

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

        </Route>

        {/* ======================================================
            FALLBACK
        ====================================================== */}

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
