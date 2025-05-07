
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to dashboard");
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        navigate('/login');
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery initiated");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
    });

    // Handle any auth errors in the URL
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (errorParam || errorDescription) {
      const errorMessage = errorDescription || `Authentication error: ${errorParam}`;
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-xl p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600">
              Sign in to continue to your account
            </p>
          </div>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {authError}
            </div>
          )}
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8b5cf6',
                    brandAccent: '#7c3aed',
                    inputBackground: 'white',
                    inputText: '#1f2937',
                    inputBorder: '#e5e7eb',
                    inputBorderHover: '#8b5cf6',
                    inputBorderFocus: '#8b5cf6',
                  },
                  space: {
                    inputPadding: '0.75rem',
                    buttonPadding: '0.75rem',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-white font-medium py-2.5 rounded-lg w-full',
                input: 'w-full px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200',
                label: 'text-sm font-medium text-slate-700 mb-1',
                message: 'text-red-600 text-sm py-1',
              },
            }}
            theme="default"
            providers={["google"]}
            redirectTo={window.location.origin + '/dashboard'}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
