import { Routes, Route } from "react-router-dom";
import Index from "@/pages/dashboard";
import Login from "@/pages/login";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
  </Routes>
);

export default AppPage;