import { useState } from "react";
import type { ProductData } from "@/components/features/products/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, processedImageUrl: string) => void;
}

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const handleProcessImage = async (imageUrl: string, index: number) => {
    setProcessingIndex(index);
    
    try {
      // Simulate image processing for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      const processedUrl = imageUrl; // Replace with actual processing
      onImageProcessed(index, processedUrl);
      toast.success("Image processed successfully");
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image");
    } finally {
      setProcessingIndex(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-effect rounded-xl overflow-hidden"
        >
          <div className="aspect-square relative">
            <img
              src={product.processedImageUrl || product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1 truncate">
              {product.title}
            </h3>
            {product.product_type && (
              <p className="text-sm text-gray-500 mb-3">{product.product_type}</p>
            )}
            
            <Button
              onClick={() => handleProcessImage(product.image_url, index)}
              disabled={!!product.processedImageUrl || processingIndex === index}
              className="w-full"
            >
              {processingIndex === index ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : product.processedImageUrl ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Processed
                </>
              ) : (
                "Process Image"
              )}
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};