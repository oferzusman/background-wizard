
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRow } from "./UserRow";
import { UserWithProfile } from "./types";

interface UserTableProps {
  users: UserWithProfile[];
  onEditUser: (user: UserWithProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ users, onEditUser, onDeleteUser }: UserTableProps) => {
  return (
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
              <UserRow 
                key={user.id}
                user={user} 
                onEdit={onEditUser}
                onDelete={onDeleteUser} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
