
import { Button } from "@/components/ui/button";
import { Eraser, FileDown } from "lucide-react";

interface BulkActionsProps {
  selectedProductsCount: number;
  isBulkProcessing: boolean;
  isDownloading: boolean;
  onBulkRemoveBackground: () => Promise<void>;
  onBulkClearBackground: () => void;
  onBulkDownload: () => Promise<void>;
}

export const BulkActions = ({
  selectedProductsCount,
  isBulkProcessing,
  isDownloading,
  onBulkRemoveBackground,
  onBulkClearBackground,
  onBulkDownload
}: BulkActionsProps) => {
  if (selectedProductsCount === 0) return null;
  
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onBulkRemoveBackground}
        disabled={isBulkProcessing}
        className="group"
      >
        <Eraser className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
        Remove Background ({selectedProductsCount})
      </Button>
      <Button
        variant="outline"
        onClick={onBulkClearBackground}
        className="group"
      >
        <Eraser className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" />
        Clear Background ({selectedProductsCount})
      </Button>
      <Button
        variant="outline"
        onClick={onBulkDownload}
        disabled={isDownloading}
        className="group"
      >
        <FileDown className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
        {isDownloading ? 'Creating Archive...' : `Download All (${selectedProductsCount})`}
      </Button>
    </div>
  );
};
