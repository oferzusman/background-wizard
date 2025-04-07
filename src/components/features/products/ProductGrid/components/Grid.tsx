
import React from "react";
import { ProductData } from "@/types/product.types";
import { ProductCard } from "../../ProductCard";

interface GridProps {
  filteredProducts: ProductData[];
  processingIndex: number | null;
  selectedColor: string;
  opacity: number;
  selectedProducts: number[];
  handleSelectProduct: (index: number, selected: boolean) => void;
  handleRemoveBackground: (index: number) => Promise<void>;
  handleClearBackground: (index: number) => void;
  handleDownloadOriginal: (imageUrl: string, title: string) => void;
  handleDownloadWithBackground: (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => Promise<void>;
  onImageProcessed: (index: number, newImageUrl: string) => void;
  topPadding?: number;
  bottomPadding?: number;
}

export const Grid: React.FC<GridProps> = ({
  filteredProducts,
  processingIndex,
  selectedColor,
  opacity,
  selectedProducts,
  handleSelectProduct,
  handleRemoveBackground,
  handleClearBackground,
  handleDownloadOriginal,
  handleDownloadWithBackground,
  onImageProcessed,
  topPadding = 40,
  bottomPadding = 40
}) => {
  return (
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
          opacity={opacity}
          handleRemoveBackground={handleRemoveBackground}
          handleClearBackground={handleClearBackground}
          handleDownloadOriginal={handleDownloadOriginal}
          handleDownloadWithBackground={handleDownloadWithBackground}
          topPadding={topPadding}
          bottomPadding={bottomPadding}
        />
      ))}
    </div>
  );
};
