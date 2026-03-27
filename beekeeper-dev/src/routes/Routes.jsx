// src/routes/Routes.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Auth (eager)
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import Pricing from "../pages/Pricing.jsx";
import NotFound from "../pages/NotFound.jsx";

// App (eager)
import Dashboard from "../pages/Dashboard.jsx";

import ApiaryList from "../pages/Apiaries/ApiaryList.jsx";
import NewApiary from "../pages/Apiaries/NewApiary.jsx";
import EditApiary from "../pages/Apiaries/EditApiary.jsx";
import ApiaryMapMarkers from "../pages/Apiaries/ApiaryMapMarkers.jsx";

import HiveList from "../pages/Hives/HiveList.jsx";
import NewHive from "../pages/Hives/NewHive.jsx";
import EditHive from "../pages/Hives/EditHive.jsx";

import InspectionList from "../pages/Inspections/InspectionList.jsx";
import NewInspection from "../pages/Inspections/NewInspection.jsx";
import EditInspection from "../pages/Inspections/EditInspection.jsx";

import Logbook from "../pages/Logbook/LogEntryList.jsx";
import NewLogEntry from "../pages/Logbook/NewLogEntry.jsx";
import EditLogEntry from "../pages/Logbook/EditLogEntry.jsx";

import TodoList from "../pages/Todos/TodoList.jsx";
import NewTodo from "../pages/Todos/NewTodo.jsx";
import EditTodo from "../pages/Todos/EditTodo.jsx";

import Calendar from "../pages/Calendar.jsx";
import Weather from "../pages/Weather.jsx";
import Settings from "../pages/Settings.jsx";
import Archive from "../pages/Archive.jsx";
import Help from "../pages/Help.jsx";

import GettingStarted from "../pages/Help/GettingStarted.jsx";

import BeeHealthHelper from "../pages/BeeHealth/BeeHealthHelper.jsx";


// Step by Step Inspections
import StepByStepInspections from "../pages/step-by-step-inspections.jsx";

// Step by Step Siting Guides
import StepByStepApiarySiting from "../pages/step-by-step-apiary-siting.jsx";
import StepByStepHiveSiting from "../pages/step-by-step-hive-siting.jsx";

// Reports
import PrintReport from "../pages/Reports/PrintReport.jsx";
import ProfitLoss from "../pages/Reports/ProfitLoss.jsx";

// Contact
import Contact from "../pages/Contact.jsx";
import ContactSent from "../pages/ContactSent.jsx";

// NFC
import NFCScan from "../pages/NFCScan.jsx";
import NFCInstructions from "../pages/NFC/NFCInstructions.jsx";
import NFCTagManager from "../pages/NFC/NFCTagManager.jsx";
import NFCLinkHive from "../pages/NFC/NFCLinkHive.jsx";
import NFCOpen from "../pages/NFC/NFCOpen.jsx";
// NEW: NFC Tag Store (product page)
import NFCTagStore from "../pages/NFC/NFCTagStore.jsx";

// Inventory / Finance / Sales
import InventoryList from "../pages/Inventory/InventoryList.jsx";
import NewItem from "../pages/Inventory/NewItem.jsx";
import EditItem from "../pages/Inventory/EditItem.jsx";

// Finance
import ExpensesList from "../pages/Finance/ExpensesList.jsx";
import NewExpense from "../pages/Finance/NewExpense.jsx";
import EditExpense from "../pages/Finance/EditExpense.jsx";

// Sales
import SalesList from "../pages/Sales/SalesList.jsx";
import NewSale from "../pages/Sales/NewSale.jsx";
import EditSale from "../pages/Sales/EditSale.jsx";

// Updates (Release Notes)
import Updates from "../pages/Updates.jsx";

// Public/legal (lazy)
const PrivacyPolicy = lazy(() => import("../pages/Legal/PrivacyPolicy.jsx"));
const CookieSettings = lazy(() => import("../pages/Legal/CookieSettings.jsx"));
const Terms = lazy(() => import("../pages/Legal/Terms.jsx"));

// Wrapper to avoid repeating ProtectedRoute+Layout
const Guarded = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
      {/* Root -> login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Public/legal (lazy) wrapped in Layout */}
      <Route
        path="/legal/privacy"
        element={
          <Layout>
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <PrivacyPolicy />
            </Suspense>
          </Layout>
        }
      />
      <Route
        path="/legal/terms"
        element={
          <Layout>
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <Terms />
            </Suspense>
          </Layout>
        }
      />
      <Route
        path="/legal/cookies"
        element={
          <Layout>
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <CookieSettings />
            </Suspense>
          </Layout>
        }
      />

      {/* Protected */}
      <Route path="/dashboard" element={<Guarded><Dashboard /></Guarded>} />

      <Route path="/apiaries" element={<Guarded><ApiaryList /></Guarded>} />
      <Route path="/apiaries/new" element={<Guarded><NewApiary /></Guarded>} />
      <Route path="/apiaries/:id/edit" element={<Guarded><EditApiary /></Guarded>} />
      <Route path="/apiaries/:apiaryId/map" element={<ApiaryMapMarkers />} />

      <Route path="/hives" element={<Guarded><HiveList /></Guarded>} />
      <Route path="/hives/new" element={<Guarded><NewHive /></Guarded>} />
      <Route path="/hives/:id/edit" element={<Guarded><EditHive /></Guarded>} />

      <Route path="/inspections" element={<Guarded><InspectionList /></Guarded>} />
      <Route path="/inspections/new" element={<Guarded><NewInspection /></Guarded>} />
      <Route path="/inspections/:id/edit" element={<Guarded><EditInspection /></Guarded>} />

      <Route path="/inspections/step-by-step" element={<Guarded><StepByStepInspections /></Guarded>} />

      <Route path="/apiaries/step-by-step" element={<Guarded><StepByStepApiarySiting /></Guarded>} />
      <Route path="/hives/step-by-step" element={<Guarded><StepByStepHiveSiting /></Guarded>} />

      <Route path="/logbook" element={<Guarded><Logbook /></Guarded>} />
      <Route path="/logbook/new" element={<Guarded><NewLogEntry /></Guarded>} />
      <Route path="/logbook/:id/edit" element={<Guarded><EditLogEntry /></Guarded>} />

      <Route path="/todos" element={<Guarded><TodoList /></Guarded>} />
      <Route path="/todos/new" element={<Guarded><NewTodo /></Guarded>} />
      <Route path="/todos/:id/edit" element={<Guarded><EditTodo /></Guarded>} />

      <Route path="/calendar" element={<Guarded><Calendar /></Guarded>} />
      <Route path="/weather" element={<Guarded><Weather /></Guarded>} />
      <Route path="/settings" element={<Guarded><Settings /></Guarded>} />
      <Route path="/archive" element={<Guarded><Archive /></Guarded>} />
      <Route path="/help" element={<Guarded><Help /></Guarded>} />

      <Route path="/help/getting-started" element={<Guarded><GettingStarted /></Guarded>} />

      <Route path="/bee-health" element={<Guarded><BeeHealthHelper /></Guarded>} />

      {/* NFC scan + instructions + manager + tag store */}
      <Route path="/nfc" element={<Guarded><NFCScan /></Guarded>} />
      <Route path="/nfc/instructions" element={<Guarded><NFCInstructions /></Guarded>} />
      <Route path="/nfc/manage" element={<Guarded><NFCTagManager /></Guarded>} />
      <Route path="/nfc/tags" element={<Guarded><NFCTagStore /></Guarded>} />
      <Route path="/nfc/link" element={<Guarded><NFCLinkHive /></Guarded>} />
      <Route path="/nfc/open" element={<Guarded><NFCOpen /></Guarded>} />

      {/* Inventory */}
      <Route path="/inventory" element={<Guarded><InventoryList /></Guarded>} />
      <Route path="/inventory/new" element={<Guarded><NewItem /></Guarded>} />
      <Route path="/inventory/:id/edit" element={<Guarded><EditItem /></Guarded>} />

      {/* Finance: Expenses */}
      <Route path="/finance/expenses" element={<Guarded><ExpensesList /></Guarded>} />
      <Route path="/finance/expenses/new" element={<Guarded><NewExpense /></Guarded>} />
      <Route path="/finance/expenses/:id/edit" element={<Guarded><EditExpense /></Guarded>} />

      {/* Sales */}
      <Route path="/sales" element={<Guarded><SalesList /></Guarded>} />
      <Route path="/sales/new" element={<Guarded><NewSale /></Guarded>} />
      <Route path="/sales/:id/edit" element={<Guarded><EditSale /></Guarded>} />

      {/* Reports */}
      <Route path="/reports/pnl" element={<Guarded><ProfitLoss /></Guarded>} />
      <Route path="/reports/print" element={<Guarded><PrintReport /></Guarded>} />

      {/* Release Notes */}
      <Route path="/updates" element={<Guarded><Updates /></Guarded>} />

      {/* Contact */}
      <Route path="/contact" element={<Guarded><Contact /></Guarded>} />
      <Route path="/contact/sent" element={<Guarded><ContactSent /></Guarded>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
