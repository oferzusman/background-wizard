
import { Button } from "@/components/ui/button";

interface UserListHeaderProps {
  onRefresh: () => void;
}

export const UserListHeader = ({ onRefresh }: UserListHeaderProps) => {
  return (
    <div className="mb-4 flex justify-end">
      <Button onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  );
};
