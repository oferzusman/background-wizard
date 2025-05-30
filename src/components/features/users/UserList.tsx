
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserDialog } from "./EditUserDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { UserListHeader } from "./UserListHeader";
import { UserTable } from "./UserTable";
import { UserWithProfile } from "./types";

// Define an interface for the RPC response type
interface RPCResponse<T> {
  data: T;
  error: Error | null;
}

export const UserList = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Use the correct response type for the RPC call
      const response = await supabase.rpc(
        'get_users_with_roles_and_profiles'
      ) as RPCResponse<UserWithProfile[]>;

      if (response.error) throw response.error;
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: UserWithProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <UserListHeader onRefresh={fetchUsers} />
      <UserTable 
        users={users}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      <EditUserDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};
