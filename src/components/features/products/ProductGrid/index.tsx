
import { useState } from "react";
import { ProductData } from "../FileUpload";
import { ProductCard } from "../ProductCard";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { ProductSidebar } from "../ProductSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Download, Eraser, FileDown } from "lucide-react";

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
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleBulkRemoveBackground = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products first");
      return;
    }

    setIsBulkProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const index of selectedProducts) {
      try {
        setProcessingIndex(index);
        const product = products[index];
        
        const { data, error } = await supabase.functions.invoke('remove-background', {
          body: { imageUrl: product["image link"] }
        });

        if (error) throw error;
        if (!data?.processedUrl) throw new Error("No processed image URL returned");

        onImageProcessed(index, data.processedUrl);
        successCount++;
      } catch (error) {
        console.error(`Error processing image at index ${index}:`, error);
        errorCount++;
      } finally {
        setProcessingIndex(null);
      }
    }

    setIsBulkProcessing(false);
    if (successCount > 0) {
      toast.success(`Successfully processed ${successCount} images`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to process ${errorCount} images`);
    }
  };

  const handleClearBackground = (index: number) => {
    onImageProcessed(index, "");
    toast.success("Background cleared successfully!");
  };

  const handleBulkClearBackground = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products first");
      return;
    }

    selectedProducts.forEach(index => {
      onImageProcessed(index, "");
    });
    toast.success(`Cleared background from ${selectedProducts.length} products`);
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

      // Apply background
      if (backgroundColor.startsWith('linear-gradient')) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#e2e2e2');
        ctx.fillStyle = gradient;
      } else if (backgroundColor.startsWith('url')) {
        // Handle background image
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            bgImg.src = backgroundColor.slice(4, -1).replace(/["']/g, '');
          });
          
          // Draw background image to fill canvas
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } catch (err) {
          console.error('Error applying background image:', err);
          ctx.fillStyle = `#ffffff${Math.round(opacity * 2.55).toString(16).padStart(2, "0")}`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // Regular color with opacity
        const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
        ctx.fillStyle = `${backgroundColor}${opacityHex}`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw the image on top
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

  const handleBulkDownloadWithBackground = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products first");
      return;
    }

    setIsDownloading(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const imgFolder = zip.folder("images");
      
      let csvContent = "product_id,title,filename\n";
      
      for (const index of selectedProducts) {
        try {
          const product = products[index];
          if (!product.processedImageUrl) continue;
          
          // Create a sanitized filename to avoid issues with special characters
          const sanitizedTitle = product.title
            .replace(/[^\w\s\-_.]/g, '_')  // Replace special chars with underscore
            .replace(/\s+/g, '_');         // Replace spaces with underscore
          
          const filename = `${product.id || index}_${sanitizedTitle}.png`;
          
          // Add to CSV using the original title for reference
          csvContent += `${product.id || index},"${product.title}",${filename}\n`;
          
          // Create canvas and apply background
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = product.processedImageUrl!;
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Apply background with proper handling of gradients, images and colors
          if (selectedColor.startsWith('linear-gradient')) {
            // Apply gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            
            // Extract gradient stops if possible, or use default
            try {
              const gradientMatch = selectedColor.match(/linear-gradient\(([^)]+)\)/);
              if (gradientMatch && gradientMatch[1]) {
                const parts = gradientMatch[1].split(',');
                // Handle angle and extract color stops
                let startIndex = 0;
                if (parts[0].includes('deg')) {
                  startIndex = 1; // Skip the angle part
                }
                
                // Simple extraction of two main colors
                if (parts.length > startIndex + 1) {
                  const firstColor = parts[startIndex].trim();
                  const lastColor = parts[parts.length - 1].trim();
                  
                  gradient.addColorStop(0, firstColor);
                  gradient.addColorStop(1, lastColor);
                } else {
                  // Fallback
                  gradient.addColorStop(0, '#ffffff');
                  gradient.addColorStop(1, '#e2e2e2');
                }
              } else {
                // Fallback for parsing errors
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#e2e2e2');
              }
            } catch (e) {
              console.error('Error parsing gradient:', e);
              gradient.addColorStop(0, '#ffffff');
              gradient.addColorStop(1, '#e2e2e2');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (selectedColor.startsWith('url')) {
            // Handle background image
            try {
              const bgImg = new Image();
              bgImg.crossOrigin = "anonymous";
              await new Promise((resolve, reject) => {
                bgImg.onload = resolve;
                bgImg.onerror = reject;
                bgImg.src = selectedColor.slice(4, -1).replace(/["']/g, '');
              });
              
              // Draw background image to fill canvas
              ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            } catch (err) {
              console.error('Error applying background image:', err);
              const opacityHex = Math.round(opacity[0] * 2.55).toString(16).padStart(2, "0");
              ctx.fillStyle = `#ffffff${opacityHex}`;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            // Regular color with opacity
            const opacityHex = Math.round(opacity[0] * 2.55).toString(16).padStart(2, "0");
            ctx.fillStyle = `${selectedColor}${opacityHex}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw the image on top
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob and add to zip
          const imageBlob = await new Promise<Blob>((resolve) => 
            canvas.toBlob((blob) => resolve(blob!), 'image/png')
          );
          
          imgFolder?.file(filename, imageBlob);
          successCount++;
        } catch (error) {
          console.error(`Error processing image at index ${index}:`, error);
          errorCount++;
        }
      }
      
      // Add CSV file to zip
      zip.file("product_images.csv", csvContent);
      
      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = "product_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success(`Downloaded ${successCount} images with CSV data`);
    } catch (error) {
      console.error('Error creating bulk download:', error);
      toast.error('Failed to create bulk download');
    } finally {
      setIsDownloading(false);
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
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleSelectAll(selectedProducts.length !== products.length)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 rounded-lg transition-colors"
              >
                {selectedProducts.length === products.length
                  ? "Deselect All"
                  : "Select All"}
              </button>

              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBulkRemoveBackground}
                    disabled={isBulkProcessing}
                    className="group"
                  >
                    <Eraser className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                    Remove Background ({selectedProducts.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkClearBackground}
                    className="group"
                  >
                    <Eraser className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" />
                    Clear Background ({selectedProducts.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkDownloadWithBackground}
                    disabled={isDownloading}
                    className="group"
                  >
                    <FileDown className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                    {isDownloading ? 'Creating Archive...' : `Download All (${selectedProducts.length})`}
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
                  handleClearBackground={handleClearBackground}
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
