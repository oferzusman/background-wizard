
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserList } from "@/components/features/users/UserList";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { UserStats } from "@/components/features/users/stats/UserStats";

const UserManagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in and has admin role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the user management dashboard");
        navigate("/login");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Error fetching user roles:", error);
        toast.error("An error occurred while checking permissions");
        navigate("/dashboard");
        return;
      }

      const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
      
      if (!isAdmin) {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions for your application.
          </p>
        </div>

        <UserStats />
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagementDashboard;
