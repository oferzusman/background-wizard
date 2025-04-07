
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eraser } from "lucide-react";
import { ProductData } from "@/types/product.types";
import { ProductImage } from "./components/ProductImage";
import { DownloadOptions } from "./components/DownloadOptions";

interface ProductCardProps {
  product: ProductData;
  index: number;
  onImageProcessed: (index: number, newImageUrl: string) => void;
  onSelect: (index: number, selected: boolean) => void;
  isSelected: boolean;
  processingIndex: number | null;
  selectedColor: string;
  opacity: number;
  handleRemoveBackground: (index: number) => Promise<void>;
  handleClearBackground: (index: number) => void;
  handleDownloadOriginal: (imageUrl: string, title: string) => void;
  handleDownloadWithBackground: (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number,
    topPadding?: number,
    bottomPadding?: number
  ) => Promise<void>;
  topPadding?: number;
  bottomPadding?: number;
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
  topPadding = 40,
  bottomPadding = 40
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all duration-200 ${
        isSelected ? "border-violet-400 ring-2 ring-violet-100" : "border-transparent hover:border-slate-200"
      }`}
    >
      <ProductImage 
        imageUrl={product["image link"]}
        processedImageUrl={product.processedImageUrl}
        isSelected={isSelected}
        onSelect={(selected) => onSelect(index, selected)}
        selectedColor={selectedColor}
        opacity={opacity}
        processingIndex={processingIndex}
        currentIndex={index}
        topPadding={topPadding}
        bottomPadding={bottomPadding}
      />

      <div className="p-4 space-y-3">
        <h3 className="font-medium text-slate-900 text-center truncate">
          {product.title}
        </h3>
        {product.product_type && (
          <p className="text-sm text-slate-600 text-center">{product.product_type}</p>
        )}
        {product.id && (
          <p className="text-sm text-slate-500 text-center">ID: {product.id}</p>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveBackground(index)}
            disabled={processingIndex === index}
            className="group"
          >
            <Eraser className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
            Remove Background
          </Button>
          
          {product.processedImageUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearBackground(index)}
                className="group"
              >
                <Eraser className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" />
                Clear
              </Button>
              
              <DownloadOptions 
                processedImageUrl={product.processedImageUrl}
                title={product.title}
                selectedColor={selectedColor}
                opacity={opacity}
                handleDownloadOriginal={handleDownloadOriginal}
                handleDownloadWithBackground={handleDownloadWithBackground}
                topPadding={topPadding}
                bottomPadding={bottomPadding}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
