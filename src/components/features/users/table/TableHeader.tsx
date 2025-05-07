
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const UsersTableHeader = () => {
  return (
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
  );
};
