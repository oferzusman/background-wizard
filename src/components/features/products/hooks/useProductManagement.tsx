
import { useState } from "react";
import { ProductData } from "../FileUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import JSZip from "jszip";

interface UseProductManagementProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

export function useProductManagement({ products, onImageProcessed }: UseProductManagementProps) {
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

  return {
    processingIndex,
    selectedColor,
    setSelectedColor,
    opacity,
    setOpacity,
    selectedProducts,
    setSelectedProducts,
    filters,
    setFilters,
    isBulkProcessing,
    isDownloading,
    setIsDownloading,
    handleRemoveBackground,
    handleBulkRemoveBackground,
    handleClearBackground,
    handleBulkClearBackground,
    handleSelectAll,
    handleSelectProduct,
    filteredProducts
  };
}
