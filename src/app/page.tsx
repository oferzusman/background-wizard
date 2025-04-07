
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppPage;
