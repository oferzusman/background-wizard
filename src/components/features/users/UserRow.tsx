
import { useState } from "react";
import { User, UserCog, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserWithProfile } from "./types";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface UserRowProps {
  user: UserWithProfile;
  onEdit: (user: UserWithProfile) => void;
  onDelete: (userId: string) => void;
}

export const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => {
  return (
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
            onClick={() => onEdit(user)}
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
            <DeleteConfirmationDialog userId={user.id} onDelete={onDelete} />
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};
