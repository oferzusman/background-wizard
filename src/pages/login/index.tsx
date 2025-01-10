import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session check error:", sessionError);
          throw sessionError;
        }
        if (session && mounted) {
          console.log("Valid session found, redirecting to dashboard");
          navigate('/');
        }
      } catch (err) {
        console.error("Auth error during session check:", err);
        if (err instanceof AuthError) {
          setError(getErrorMessage(err));
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed - Event:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in successful, redirecting to dashboard");
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        console.log("Sign out detected, clearing error state");
        setError(null);
      } else if (event === 'USER_UPDATED') {
        console.log("User update detected, rechecking session");
        checkUser();
      }
    });

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.log("Processing auth error:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes('Email not confirmed')) {
            return 'Please verify your email address before signing in.';
          }
          if (error.message.includes('Invalid login credentials')) {
            return 'The email or password you entered is incorrect. Please try again.';
          }
          return 'Invalid login attempt. Please check your credentials and try again.';
        case 422:
          return 'Please enter a valid email address.';
        case 429:
          return 'Too many login attempts. Please wait a moment before trying again.';
        default:
          return `Authentication error: ${error.message}`;
      }
    }
    return `Unexpected error: ${error.message}`;
  };

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

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
              },
            }}
            theme="default"
            providers={["google"]}
          />

          <div className="mt-6 text-center text-sm text-slate-500 space-x-4">
            <a 
              href="/CHANGELOG.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-violet-600 transition-colors"
            >
              Changelog
            </a>
            <span>•</span>
            <a 
              href="/ROADMAP.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-violet-600 transition-colors"
            >
              Roadmap
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;