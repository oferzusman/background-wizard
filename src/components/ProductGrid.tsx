import { useState } from "react";
import { ProductData } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  
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
      
      // Store the processed image URL
      onImageProcessed(index, data.processedUrl);
      
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(error instanceof Error ? error.message : "Error processing image. Please try again.");
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title}-processed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {products.map((product, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={product.processedImageUrl || product["image link"]}
              alt={product.title}
              className="w-full h-full object-contain p-4"
            />
            {processingIndex === index && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-medium text-slate-900 text-center truncate">{product.title}</h3>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveBackground(index)}
                disabled={processingIndex === index}
              >
                Remove Background
              </Button>
              {product.processedImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(product.processedImageUrl!, product.title)}
                >
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};