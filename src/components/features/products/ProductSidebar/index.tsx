import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ProductFilters } from "../ProductFilters";
import { Palette } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ProductSidebarProps {
  products: any[];
  onFilterChange: (filters: Record<string, string>) => void;
  filteredCount: number;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number[];
  setOpacity: (opacity: number[]) => void;
}

export function ProductSidebar({
  products,
  onFilterChange,
  filteredCount,
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
}: ProductSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Product Counter */}
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-4 bg-white/50 rounded-lg">
              <span className="text-2xl font-bold text-violet-600">{filteredCount}</span>
              <span className="text-sm text-slate-600 ml-2">products found</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Filters */}
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <ProductFilters
              products={products}
              onFilterChange={onFilterChange}
              filteredCount={filteredCount}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Color Picker */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Background Color
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4 p-4 bg-white/50 rounded-lg">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <label className="text-sm text-slate-600 mb-1 block">
                    Opacity: {opacity[0]}%
                  </label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}