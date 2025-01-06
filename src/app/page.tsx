import { Routes, Route } from "react-router-dom";
import Index from "@/pages/dashboard";

const AppPage = () => (
  <Routes>
    <Route path="/" element={<Index />} />
  </Routes>
);

export default AppPage;