import { useState } from "react";
import { ProductData } from "../FileUpload";
import { ProductCard } from "../ProductCard";
import { ProductSidebar } from "../ProductSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Eraser, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  
  console.log("Rendering ProductGrid with products:", products);

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

  const handleBulkUploadToGoogleDrive = async () => {
    const processedProducts = products.filter((product, index) => 
      selectedProducts.includes(index) && product.processedImageUrl
    );

    if (processedProducts.length === 0) {
      toast.error("Please select products with processed images first");
      return;
    }

    setIsBulkUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const product of processedProducts) {
        try {
          const { error } = await supabase.functions.invoke('google-drive', {
            body: { 
              imageUrl: product.processedImageUrl,
              fileName: `${product.title}_with_background.png`
            }
          });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Error uploading to Google Drive:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} images to Google Drive`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} images`);
      }
    } finally {
      setIsBulkUploading(false);
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
      if (!value) return true;
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
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => handleSelectAll(selectedProducts.length !== products.length)}
              >
                {selectedProducts.length === products.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBulkUploadToGoogleDrive}
                    disabled={isBulkUploading}
                    className="group"
                  >
                    <CloudUpload className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                    {isBulkUploading 
                      ? `Uploading ${selectedProducts.length} images...` 
                      : `Upload ${selectedProducts.length} images to Drive`
                    }
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkRemoveBackground}
                    disabled={isBulkProcessing}
                    className="group"
                  >
                    <Eraser className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                    Remove Background ({selectedProducts.length})
                  </Button>
                </div>
              )}
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
