import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/dashboard";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
);

export default AppPage;