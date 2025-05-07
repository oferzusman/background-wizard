
import React from 'react';
import { Eraser } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Checkbox } from "@/components/ui/checkbox";
import { getBackgroundStyle } from "../utils/backgroundUtils";
import { LoadingOverlay } from "./LoadingOverlay";

interface ProductImageProps {
  imageUrl: string;
  processedImageUrl?: string;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  selectedColor: string;
  opacity: number;
  processingIndex: number | null;
  currentIndex: number;
  topPadding?: number;
  bottomPadding?: number;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl,
  processedImageUrl,
  isSelected,
  onSelect,
  selectedColor,
  opacity,
  processingIndex,
  currentIndex,
  topPadding = 40,
  bottomPadding = 40
}) => {
  const isProcessing = processingIndex === currentIndex;
  
  const paddingStyle = {
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`
  };
  
  // Create a combined style object for the background container
  const containerStyle = processedImageUrl ? {
    ...getBackgroundStyle(selectedColor, opacity),
    ...paddingStyle
  } : paddingStyle;
  
  return (
    <div className="relative">
      <AspectRatio ratio={1} topMargin={0} bottomMargin={0}>
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
          />
        </div>
        
        {processedImageUrl && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Eraser className="w-4 h-4 text-green-600" />
            </div>
          </div>
        )}
        
        {processedImageUrl ? (
          <div
            className="w-full h-full relative"
            style={containerStyle}
          >
            <img
              src={processedImageUrl}
              alt="Product"
              className="w-full h-full object-contain absolute inset-0 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div 
            className="w-full h-full"
            style={paddingStyle}
          >
            <img
              src={imageUrl}
              alt="Product"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <LoadingOverlay isVisible={isProcessing} />
      </AspectRatio>
    </div>
  );
};
