import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface SidebarHeaderProps {
  totalProducts: number;
  onReset?: () => void;
}

export const SidebarHeader = ({ totalProducts, onReset }: SidebarHeaderProps) => {
  return (
    <div className="p-4 flex items-center justify-between bg-white/50 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-violet-600">{totalProducts}</span>
        <span className="text-sm text-slate-600">Products Loaded</span>
      </div>
      {onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload New File
        </Button>
      )}
    </div>
  );
};