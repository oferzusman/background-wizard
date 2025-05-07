
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check if user has admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        
        setIsAdmin(roles?.some(r => r.role === 'admin' || r.role === 'super_admin') || false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Check if user has admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        
        setIsAdmin(roles?.some(r => r.role === 'admin' || r.role === 'super_admin') || false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            AppName
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              
              {isAdmin && (
                <Link to="/user-management" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  <Users className="h-4 w-4" />
                  User Management
                </Link>
              )}
            </nav>
          )}
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};
