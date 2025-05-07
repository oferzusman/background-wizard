
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile | null;
  onUserUpdated: () => void;
}

type FormValues = {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: string;
};

export const EditUserDialog = ({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      avatarUrl: "",
      role: ""
    }
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.profile?.first_name || "",
        lastName: user.profile?.last_name || "",
        avatarUrl: user.profile?.avatar_url || "",
        role: user.role || ""
      });
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName || null,
          last_name: values.lastName || null,
          avatar_url: values.avatarUrl || null
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update role if changed
      if (values.role !== user.role) {
        // Delete existing role
        const { error: deleteRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        if (deleteRoleError) throw deleteRoleError;
        
        // Add new role
        const { error: addRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: values.role
          });
        
        if (addRoleError) throw addRoleError;
      }
      
      toast.success("User updated successfully");
      onUserUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and role
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-sm text-slate-500 mb-4">
                Email: <span className="font-medium text-slate-700">{user.email}</span>
              </div>
              
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
