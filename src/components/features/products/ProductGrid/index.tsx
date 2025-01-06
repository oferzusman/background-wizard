import { useState } from "react";
import { ProductData } from "../FileUpload";
import { ProductCard } from "../ProductCard";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { ProductSidebar } from "../ProductSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState([100]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleRemoveBackground = async (index: number) => {
    setProcessingIndex(index);
    const product = products[index];
    
    try {
      console.log('Starting background removal for:', product.title);
      
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { imageUrl: product["image link"] }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data?.processedUrl) {
        throw new Error("No processed image URL returned");
      }

      console.log('Successfully processed image for:', product.title);
      
      onImageProcessed(index, data.processedUrl);
      
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(error instanceof Error ? error.message : "Error processing image");
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleDownloadOriginal = (imageUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title}-processed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWithBackground = async (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = backgroundColor + Math.round(opacity * 2.55).toString(16).padStart(2, '0');
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${title}-with-background.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error creating image with background:', error);
      toast.error('Failed to download image with background');
    }
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts(selected ? products.map((_, index) => index) : []);
  };

  const handleSelectProduct = (index: number, selected: boolean) => {
    setSelectedProducts((prev) =>
      selected ? [...prev, index] : prev.filter((i) => i !== index)
    );
  };

  const filteredProducts = products.filter((product) => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value || value === "all") return true;
      const productValue = String(product[field as keyof ProductData] || "").toLowerCase();
      return productValue.includes(value.toLowerCase());
    });
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ProductSidebar
          products={products}
          onFilterChange={setFilters}
          filteredCount={filteredProducts.length}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          opacity={opacity}
          setOpacity={setOpacity}
        />
        
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => handleSelectAll(selectedProducts.length !== products.length)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 rounded-lg transition-colors"
              >
                {selectedProducts.length === products.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  index={index}
                  onImageProcessed={onImageProcessed}
                  onSelect={handleSelectProduct}
                  isSelected={selectedProducts.includes(index)}
                  processingIndex={processingIndex}
                  selectedColor={selectedColor}
                  opacity={opacity[0]}
                  handleRemoveBackground={handleRemoveBackground}
                  handleDownloadOriginal={handleDownloadOriginal}
                  handleDownloadWithBackground={handleDownloadWithBackground}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
