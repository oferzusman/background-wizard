import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // For now, just redirect to the main page
    navigate("/");
  }, [navigate]);

  return null;
};

export default Login;