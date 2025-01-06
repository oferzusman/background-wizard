import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ProductFilters } from "../ProductFilters";
import { Palette, Gradient, Image } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

interface ProductSidebarProps {
  products: any[];
  onFilterChange: (filters: Record<string, string>) => void;
  filteredCount: number;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number[];
  setOpacity: (opacity: number[]) => void;
}

const gradients = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #2193b0, #6dd5ed)",
  "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
  "linear-gradient(to right, #00b4db, #0083b0)",
  "linear-gradient(to right, #ad5389, #3c1053)",
  "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
];

export function ProductSidebar({
  products,
  onFilterChange,
  filteredCount,
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
}: ProductSidebarProps) {
  const [activeTab, setActiveTab] = useState("solid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGradientSelect = (gradient: string) => {
    setSelectedColor(gradient);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setSelectedColor(`url(${result})`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
              Background Style
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4 p-4 bg-white/50 rounded-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="solid" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Solid
                  </TabsTrigger>
                  <TabsTrigger value="gradient" className="flex-1">
                    <Gradient className="w-4 h-4 mr-2" />
                    Gradient
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex-1">
                    <Image className="w-4 h-4 mr-2" />
                    Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="solid" className="mt-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={selectedColor.startsWith('#') ? selectedColor : '#ffffff'}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="gradient" className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {gradients.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => handleGradientSelect(gradient)}
                        className="h-12 rounded-lg cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                        style={{ background: gradient }}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-4">
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <label className="text-sm text-slate-600 block">
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}