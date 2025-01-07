import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already logged in, redirecting to dashboard");
        navigate("/");
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in successfully");
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setError(null);
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      }
    });

    checkUser();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("Invalid login credentials")) {
            return "Invalid email or password. Please check your credentials and try again.";
          }
          return "Invalid request. Please check your input and try again.";
        case 422:
          return "Invalid email format. Please enter a valid email address.";
        default:
          return error.message;
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to your account
          </p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8b5cf6',
                  brandAccent: '#7c3aed'
                }
              }
            }
          }}
          providers={[]}
          onError={(error) => {
            console.error("Auth error:", error);
            const message = getErrorMessage(error);
            setError(message);
            toast.error(message);
          }}
        />

        {error && (
          <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;