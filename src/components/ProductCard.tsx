
import { useState } from "react";
import { ProductData } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Eraser, Image } from "lucide-react";

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
  const getBackgroundStyle = () => {
    if (selectedColor.startsWith('linear-gradient')) {
      return { background: selectedColor };
    } else if (selectedColor.startsWith('url')) {
      return {
        backgroundImage: selectedColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else {
      // Regular color with opacity
      const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
      return { backgroundColor: `${selectedColor}${opacityHex}` };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border transition-all duration-200 h-full flex flex-col"
      style={{
        borderColor: isSelected ? "rgb(167, 139, 250)" : "transparent",
        boxShadow: isSelected ? "0 0 0 2px rgb(237, 233, 254)" : "",
      }}
    >
      <div className="relative">
        <AspectRatio ratio={1}>
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(index, checked as boolean)}
              className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
            />
          </div>
          {product.processedImageUrl && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-green-100 p-1.5 rounded-full">
                <Eraser className="w-4 h-4 text-green-600" />
              </div>
            </div>
          )}
          {product.processedImageUrl ? (
            <div
              className="w-full h-full relative"
              style={getBackgroundStyle()}
            >
              <img
                src={product.processedImageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-4 absolute inset-0 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <img
              src={product["image link"]}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {processingIndex === index && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="p-4 space-y-3 flex-grow">
        <h3 className="font-medium text-slate-900 text-center truncate">
          {product.title}
        </h3>
        {product.product_type && (
          <p className="text-sm text-slate-600 text-center">{product.product_type}</p>
        )}
        {product.id && (
          <p className="text-sm text-slate-500 text-center">ID: {product.id}</p>
        )}

        <div className="flex gap-2 justify-center mt-auto pt-3">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="group">
                  <Download className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
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
                    className="group"
                  >
                    <Image className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                    Download with Transparent Background
                  </Button>
                  <Button
                    onClick={() =>
                      handleDownloadWithBackground(
                        product.processedImageUrl!,
                        product.title,
                        selectedColor,
                        opacity
                      )
                    }
                    variant="default"
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Download with Custom Background
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </motion.div>
  );
};
