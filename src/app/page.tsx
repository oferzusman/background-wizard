import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/login" element={<Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppPage;