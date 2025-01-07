import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ProductFilters } from "../ProductFilters";
import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { FilteredProductsCounter } from "./FilteredProductsCounter";
import { BackgroundStylePicker } from "./BackgroundStylePicker";

interface ProductSidebarProps {
  products: any[];
  onFilterChange: (filters: Record<string, string>) => void;
  filteredCount: number;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number[];
  setOpacity: (opacity: number[]) => void;
  onReset?: () => void;
}

export function ProductSidebar({
  products,
  onFilterChange,
  filteredCount,
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
  onReset,
}: ProductSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader totalProducts={products.length} onReset={onReset} />
        <FilteredProductsCounter filteredCount={filteredCount} />
        
        {/* Filters */}
        <ProductFilters
          products={products}
          onFilterChange={onFilterChange}
          filteredCount={filteredCount}
        />

        {/* Background Style Picker */}
        <BackgroundStylePicker
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          opacity={opacity}
          setOpacity={setOpacity}
        />
      </SidebarContent>
    </Sidebar>
  );
}