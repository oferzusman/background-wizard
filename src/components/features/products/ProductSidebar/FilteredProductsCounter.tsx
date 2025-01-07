import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";

interface FilteredProductsCounterProps {
  filteredCount: number;
}

export const FilteredProductsCounter = ({ filteredCount }: FilteredProductsCounterProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Products</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="p-4 bg-white/50 rounded-lg">
          <span className="text-2xl font-bold text-violet-600">{filteredCount}</span>
          <span className="text-sm text-slate-600 ml-2">products found</span>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};