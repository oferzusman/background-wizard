
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditUserDialog } from "./EditUserDialog";
import { toast } from "sonner";
import { User, UserCog, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

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

      // Fix the RPC call by using correct typing approach
      const { data, error } = await supabase.rpc(
        'get_users_with_roles_and_profiles',
        {},
        { count: 'exact' }
      );

      if (error) throw error;
      setUsers(data as UserWithProfile[] || []);
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
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => fetchUsers()}>
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        {user.profile?.avatar_url ? (
                          <img 
                            src={user.profile.avatar_url} 
                            alt={`${user.profile.first_name || ''} ${user.profile.last_name || ''}`}
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                        ) : (
                          <User className="w-4 h-4 text-violet-600" />
                        )}
                      </div>
                      <span>
                        {user.profile?.first_name && user.profile?.last_name 
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : 'Unnamed User'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true }) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => handleEditUser(user)}
                      >
                        <UserCog className="h-4 w-4" />
                        <span className="sr-only">Edit User</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};
