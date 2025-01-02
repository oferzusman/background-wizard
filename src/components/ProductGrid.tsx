import { useState } from "react";
import { ProductData } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { removeBackground } from "@/lib/imageProcessing";
import { toast } from "sonner";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const handleRemoveBackground = async (index: number) => {
    setProcessingIndex(index);
    const product = products[index];
    
    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = product.imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Process the image
      const processedBlob = await removeBackground(img);
      const processedUrl = URL.createObjectURL(processedBlob);
      
      onImageProcessed(index, processedUrl);
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleDownload = (imageUrl: string, productName: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${productName}-processed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={product.processedImageUrl || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {processingIndex === index && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-slate-900 mb-2">{product.name}</h3>
            <div className="flex gap-2">
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
                  onClick={() => handleDownload(product.processedImageUrl!, product.name)}
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