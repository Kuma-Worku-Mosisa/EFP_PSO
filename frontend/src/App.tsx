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
            <Route path="/dashboard/*" element={<AgencyDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route
              path="/field-reviewer/*"
              element={<FieldReviewerDashboard />}
            />
            <Route
              path="/licensing-authority/*"
              element={<LicensingAuthorityDashboard />}
            />
            <Route
              path="/org-hr-manager/*"
              element={<OrgHrManagerDashboard />}
            />
            <Route path="/system-admin/*" element={<SystemAdminDashboard />} />
            <Route
              path="/super-admin/dashboard/*"
              element={<SuperAdminDashboard />}
            />
            <Route
              path="/super-admin/profile"
              element={<Navigate replace to="/super-admin/dashboard/profile" />}
            />
            <Route
              path="/super-admin/applications"
              element={
                <Navigate replace to="/super-admin/dashboard/admin-apps" />
              }
            />
            <Route
              path="/super-admin/formal-requests"
              element={
                <Navigate replace to="/super-admin/dashboard/formal-requests" />
              }
            />
            <Route
              path="/super-admin/inspections"
              element={
                <Navigate replace to="/super-admin/dashboard/inspections" />
              }
            />
            <Route
              path="/super-admin/address-approvals"
              element={
                <Navigate
                  replace
                  to="/super-admin/dashboard/address-approvals"
                />
              }
            />
            <Route
              path="/super-admin/personnel-change-approvals"
              element={
                <Navigate
                  replace
                  to="/super-admin/dashboard/personnel-change-approvals"
                />
              }
            />
            <Route
              path="/super-admin/positions"
              element={
                <Navigate replace to="/super-admin/dashboard/positions" />
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
