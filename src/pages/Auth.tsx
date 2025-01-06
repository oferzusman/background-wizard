import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createSuperUser = async () => {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'ofer@polpo-digital.com',
        password: '123456ofer'
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Insert the super_admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            { user_id: authData.user.id, role: 'super_admin' }
          ]);

        if (roleError) throw roleError;

        toast.success("Superuser created successfully!");
      }
    } catch (error) {
      console.error('Error creating superuser:', error);
      toast.error("Failed to create superuser. Check console for details.");
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
          <Button 
            variant="outline" 
            onClick={createSuperUser}
            className="w-full"
          >
            Create Initial Superuser
          </Button>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
}