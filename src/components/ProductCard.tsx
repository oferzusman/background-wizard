import { useState } from "react";
import { ProductData } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductCardProps {
  product: ProductData;
  index: number;
  onImageProcessed: (index: number, newImageUrl: string) => void;
  onSelect: (index: number, selected: boolean) => void;
  isSelected: boolean;
  processingIndex: number | null;
  selectedColor: string;
  opacity: number[];
  handleRemoveBackground: (index: number) => Promise<void>;
  handleDownloadOriginal: (imageUrl: string, title: string) => void;
  handleDownloadWithBackground: (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => Promise<void>;
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
  handleDownloadOriginal,
  handleDownloadWithBackground,
}: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-square">
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(index, checked as boolean)}
          />
        </div>
        {product.processedImageUrl ? (
          <div
            className="w-full h-full relative"
            style={{
              backgroundColor: `${selectedColor}${Math.round(opacity[0] * 2.55)
                .toString(16)
                .padStart(2, "0")}`,
            }}
          >
            <img
              src={product.processedImageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-4 absolute inset-0"
            />
          </div>
        ) : (
          <img
            src={product["image link"]}
            alt={product.title}
            className="w-full h-full object-contain p-4"
          />
        )}
        {processingIndex === index && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-slate-900 text-center truncate">
          {product.title}
        </h3>
        {product.product_type && (
          <p className="text-sm text-slate-600 text-center">{product.product_type}</p>
        )}
        {product.id && (
          <p className="text-sm text-slate-600 text-center">ID: {product.id}</p>
        )}

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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose Download Option</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <Button
                    onClick={() =>
                      handleDownloadOriginal(product.processedImageUrl!, product.title)
                    }
                    variant="outline"
                  >
                    Download with Transparent Background
                  </Button>
                  <Button
                    onClick={() =>
                      handleDownloadWithBackground(
                        product.processedImageUrl!,
                        product.title,
                        selectedColor,
                        opacity[0]
                      )
                    }
                    variant="default"
                  >
                    Download with Custom Background
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};