
import { TableCell, TableRow } from "@/components/ui/table";

export const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
        No users found
      </TableCell>
    </TableRow>
  );
};
