import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { ProductData } from "./FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageControlsSidebarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number[];
  setOpacity: (opacity: number[]) => void;
  onBackgroundImageSelect?: (file: File) => void;
  gradientPresets: string[];
  onFilterChange: (filters: Record<string, string>) => void;
  products: ProductData[];
  filteredCount: number;
}

export const ImageControlsSidebar = ({
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
  onBackgroundImageSelect,
  gradientPresets,
  onFilterChange,
  products,
  filteredCount,
}: ImageControlsSidebarProps) => {
  const [isGradient, setIsGradient] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onBackgroundImageSelect?.(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  // Get unique product types and count products for each type
  const productTypes = Array.from(
    products.reduce((acc, product) => {
      const type = product.product_type?.toString() || "Uncategorized";
      acc.set(type, (acc.get(type) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  );

  // Get unique fields from products, excluding specific fields
  const fields = Array.from(
    new Set(
      products.flatMap((product) =>
        Object.keys(product).filter(
          (key) => !["processedImageUrl", "image link", "product_type", "link"].includes(key)
        )
      )
    )
  );

  return (
    <Sidebar className="w-80 border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-600">
                {filteredCount} products
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Select
                  onValueChange={(value) => onFilterChange({ product_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {productTypes.map(([type, count]) => (
                      <SelectItem key={type} value={type}>
                        {type} ({count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field}</Label>
                  <Input
                    id={field}
                    placeholder={`Filter by ${field}`}
                    onChange={(e) => onFilterChange({ [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Background Settings</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Background Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={!isGradient ? "default" : "outline"}
                  onClick={() => setIsGradient(false)}
                  size="sm"
                >
                  Solid Color
                </Button>
                <Button
                  variant={isGradient ? "default" : "outline"}
                  onClick={() => setIsGradient(true)}
                  size="sm"
                >
                  Gradient
                </Button>
              </div>
            </div>

            {!isGradient ? (
              <div className="space-y-2">
                <Label htmlFor="colorPicker">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="colorPicker"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-12 h-12 p-1"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Gradient Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {gradientPresets.map((gradient, index) => (
                    <button
                      key={index}
                      className="h-12 rounded-md"
                      style={{ background: gradient }}
                      onClick={() => setSelectedColor(gradient)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Upload Background Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bgImageUpload"
                />
                <Label
                  htmlFor="bgImageUpload"
                  className="flex items-center gap-2 cursor-pointer bg-secondary hover:bg-secondary/80 h-10 px-4 py-2 rounded-md"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Opacity</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-right">
                {opacity[0]}%
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};