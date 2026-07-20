import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/login/Login";
import { AgencyDashboard } from "./pages/AgencyDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { FieldReviewerDashboard } from "./pages/FieldReviewerDashboard";
import { LicensingAuthorityDashboard } from "./pages/LicensingAuthorityDashboard";
import SystemAdminDashboard from "./pages/systemAdmin/SystemAdminDashboard";
import { OrgHrManagerDashboard } from "./pages/HRmanagement/OrgHrManagerDashboard";
import { Requirements } from "./pages/Requirements";
import { Services } from "./pages/Services";
import { FAQ } from "./pages/FAQ";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/auth/register/Register";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFound } from "./pages/NotFound";
import { AccessDenied } from "./pages/AccessDenied";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes with Layout */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Layout>
                  <Login />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout>
                  <Register />
                </Layout>
              }
            />
            <Route
              path="/requirements"
              element={
                <Layout>
                  <Requirements />
                </Layout>
              }
            />
            <Route
              path="/services"
              element={
                <Layout>
                  <Services />
                </Layout>
              }
            />
            <Route
              path="/faq"
              element={
                <Layout>
                  <FAQ />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <Contact />
                </Layout>
              }
            />

            {/* Dashboard Routes (No Layout as they have their own) */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["agency"]}>
                  <AgencyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/field-reviewer/*"
              element={
                <ProtectedRoute allowedRoles={["field_reviewer"]}>
                  <FieldReviewerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/licensing-authority/*"
              element={
                <ProtectedRoute allowedRoles={["licensing_authority"]}>
                  <LicensingAuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org-hr-manager/*"
              element={
                <ProtectedRoute allowedRoles={["org_hr_manager"]}>
                  <OrgHrManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/*"
              element={
                <ProtectedRoute allowedRoles={["system_admin"]}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/profile"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate replace to="/super-admin/dashboard/profile" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/applications"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate replace to="/super-admin/dashboard/admin-apps" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/formal-requests"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate
                    replace
                    to="/super-admin/dashboard/formal-requests"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/inspections"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate replace to="/super-admin/dashboard/inspections" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/address-approvals"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate
                    replace
                    to="/super-admin/dashboard/address-approvals"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/personnel-change-approvals"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate
                    replace
                    to="/super-admin/dashboard/personnel-change-approvals"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/positions"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <Navigate replace to="/super-admin/dashboard/positions" />
                </ProtectedRoute>
              }
            />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
