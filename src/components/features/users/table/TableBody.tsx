
import { TableBody } from "@/components/ui/table";
import { UserWithProfile } from "../types";
import { UserRow } from "../UserRow";
import { EmptyState } from "./EmptyState";

interface UsersTableBodyProps {
  users: UserWithProfile[];
  onEditUser: (user: UserWithProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersTableBody = ({ 
  users,
  onEditUser,
  onDeleteUser 
}: UsersTableBodyProps) => {
  return (
    <TableBody>
      {users.length === 0 ? (
        <EmptyState />
      ) : (
        users.map((user) => (
          <UserRow 
            key={user.id}
            user={user} 
            onEdit={onEditUser}
            onDelete={onDeleteUser} 
          />
        ))
      )}
    </TableBody>
  );
};
