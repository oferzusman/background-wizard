import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductData } from "../FileUpload";
import { GoogleDriveUpload } from "../GoogleDriveUpload";
import { Download, Eraser, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: ProductData;
  index: number;
  onImageProcessed: (index: number, newImageUrl: string) => void;
  onSelect: (index: number, selected: boolean) => void;
  isSelected: boolean;
  processingIndex: number | null;
  selectedColor: string;
  opacity: number;
  handleRemoveBackground: (index: number) => void;
  handleClearBackground: (index: number) => void;
  handleDownloadOriginal: (imageUrl: string, title: string) => void;
  handleDownloadWithBackground: (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => void;
}

export const ProductCard = ({
  product,
  index,
  onImageProcessed,
  onSelect,
  isSelected,
  processingIndex,
  selectedColor,
  opacity,
  handleRemoveBackground,
  handleClearBackground,
  handleDownloadOriginal,
  handleDownloadWithBackground,
}: ProductCardProps) => {
  const isProcessing = processingIndex === index;
  const hasProcessedImage = !!product.processedImageUrl;

  // Function to determine the background style
  const getBackgroundStyle = () => {
    if (!product.processedImageUrl) return {};
    
    // If the selectedColor starts with 'linear-gradient', use it directly
    if (selectedColor.startsWith('linear-gradient')) {
      return {
        background: selectedColor,
        opacity: opacity / 100
      };
    }
    
    // Otherwise, use the color with opacity
    return {
      backgroundColor: `${selectedColor}${Math.round(opacity * 2.55)
        .toString(16)
        .padStart(2, '0')}`
    };
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        {/* Background layer */}
        {hasProcessedImage && (
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={getBackgroundStyle()}
          />
        )}
        
        {/* Loading spinner */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Image layer */}
        <img
          src={product.processedImageUrl || product["image link"]}
          alt={product.title}
          className="w-full h-full object-contain relative z-10"
        />

        {/* Checkbox layer */}
        <div className="absolute top-2 left-2 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(index, checked as boolean)}
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-sm mb-1 truncate" title={product.title}>
          {product.title}
        </h3>
        {product.product_type && (
          <p className="text-sm text-slate-500 mb-4">{product.product_type}</p>
        )}
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleRemoveBackground(index)}
            disabled={isProcessing}
          >
            <Eraser className="w-4 h-4 mr-2" />
            {isProcessing ? "Processing..." : "Remove Background"}
          </Button>

          {hasProcessedImage && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleClearBackground(index)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Background
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  handleDownloadWithBackground(
                    product.processedImageUrl!,
                    product.title,
                    selectedColor,
                    opacity
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download with Background
              </Button>

              <GoogleDriveUpload 
                imageUrl={product.processedImageUrl} 
                fileName={`${product.title}_processed.png`}
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};