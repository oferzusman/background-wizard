
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserManagementHeader } from "@/components/features/users/UserManagementHeader";
import { UserList } from "@/components/features/users/UserList";
import { toast } from "sonner";

const UserManagement = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <UserManagementHeader />
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
