
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import UserManagement from "@/pages/users";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="/users" element={<UserManagement />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppPage;
