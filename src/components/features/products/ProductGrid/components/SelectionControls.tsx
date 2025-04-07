
import React from "react";
import { Button } from "@/components/ui/button";

interface SelectionControlsProps {
  selectedProductsCount: number;
  totalProductsCount: number;
  onSelectAll: (select: boolean) => void;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedProductsCount,
  totalProductsCount,
  onSelectAll
}) => {
  const isAllSelected = selectedProductsCount === totalProductsCount;
  
  return (
    <Button
      onClick={() => onSelectAll(!isAllSelected)}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 rounded-lg transition-colors"
    >
      {isAllSelected ? "Deselect All" : "Select All"}
    </Button>
  );
};
