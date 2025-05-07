
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserWithProfile } from "../types";
import { UserForm } from "./UserForm";
import { UserFormValues } from "./types";
import { updateUser } from "../services/userService";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile | null;
  onUserUpdated: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDefaultValues, setFormDefaultValues] = useState<UserFormValues>({
    firstName: "",
    lastName: "",
    avatarUrl: "",
    role: "user"
  });
  
  // Update form values when user changes
  useEffect(() => {
    if (user) {
      const userRole = user.role as UserFormValues["role"];
      
      setFormDefaultValues({
        firstName: user.profile?.first_name || "",
        lastName: user.profile?.last_name || "",
        avatarUrl: user.profile?.avatar_url || "",
        role: userRole
      });
    }
  }, [user]);

  const handleSubmit = async (values: UserFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(user, values);
      onUserUpdated();
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
          <UserForm
            defaultValues={formDefaultValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            userEmail={user.email}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
