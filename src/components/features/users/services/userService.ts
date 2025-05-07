
import { supabase } from "@/integrations/supabase/client";
import { UserFormValues } from "../dialogs/types";
import { UserWithProfile } from "../types";
import { toast } from "sonner";

export const updateUserProfile = async (
  userId: string,
  values: UserFormValues
): Promise<void> => {
  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: values.firstName || null,
      last_name: values.lastName || null,
      avatar_url: values.avatarUrl || null
    })
    .eq('id', userId);
  
  if (profileError) throw profileError;
};

export const updateUserRole = async (
  userId: string,
  currentRole: string,
  newRole: string
): Promise<void> => {
  if (newRole === currentRole) {
    return; // No role change needed
  }
  
  // Delete existing role
  const { error: deleteRoleError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
  
  if (deleteRoleError) throw deleteRoleError;
  
  // Add new role
  const { error: addRoleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: newRole
    });
  
  if (addRoleError) throw addRoleError;
};

export const updateUser = async (
  user: UserWithProfile,
  values: UserFormValues
): Promise<void> => {
  try {
    // Update profile
    await updateUserProfile(user.id, values);
    
    // Update role if changed
    if (values.role !== user.role) {
      await updateUserRole(user.id, user.role, values.role);
    }
    
    toast.success("User updated successfully");
    return Promise.resolve();
  } catch (error) {
    console.error("Error updating user:", error);
    toast.error("Failed to update user");
    return Promise.reject(error);
  }
};
