
import { Table } from "@/components/ui/table";
import { UserWithProfile } from "./types";
import { UsersTableHeader } from "./table/TableHeader";
import { UsersTableBody } from "./table/TableBody";

interface UserTableProps {
  users: UserWithProfile[];
  onEditUser: (user: UserWithProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ users, onEditUser, onDeleteUser }: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <UsersTableHeader />
        <UsersTableBody 
          users={users}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />
      </Table>
    </div>
  );
};
