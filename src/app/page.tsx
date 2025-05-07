
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import UserManagementDashboard from "@/pages/user-management";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="/user-management" element={<UserManagementDashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppPage;
