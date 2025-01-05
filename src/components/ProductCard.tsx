import { useState } from "react";
import { ProductData } from "./FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Eraser } from "lucide-react";
import { ProductImageDialog } from "./ProductImageDialog";
import { ProductActions } from "./ProductActions";

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
  onSelect,
  isSelected,
  processingIndex,
  selectedColor,
  opacity,
  handleRemoveBackground,
  handleDownloadOriginal,
  handleDownloadWithBackground,
}: ProductCardProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const getBackgroundStyle = () => {
    if (!product.processedImageUrl) return {};
    
    if (selectedColor.includes('gradient')) {
      return {
        background: selectedColor,
      };
    }
    
    return {
      backgroundColor: `${selectedColor}${Math.round(opacity[0] * 2.55)
        .toString(16)
        .padStart(2, "0")}`,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all duration-200 ${
        isSelected ? "border-violet-400 ring-2 ring-violet-100" : "border-transparent hover:border-slate-200"
      }`}
    >
      <div className="relative aspect-square group">
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

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <div className="w-full h-full cursor-pointer">
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
            </div>
          </DialogTrigger>

          <ProductImageDialog
            isOpen={isImageDialogOpen}
            onOpenChange={setIsImageDialogOpen}
            product={product}
            selectedColor={selectedColor}
            opacity={opacity}
          />
        </Dialog>

        {processingIndex === index && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
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
          <p className="text-sm text-slate-500 text-center">ID: {product.id}</p>
        )}

        <div className="flex flex-col gap-2">
          <ProductActions
            hasProcessedImage={!!product.processedImageUrl}
            isProcessing={processingIndex === index}
            onRemoveBackground={() => handleRemoveBackground(index)}
            onDownloadOriginal={() => handleDownloadOriginal(product.processedImageUrl!, product.title)}
            onDownloadWithBackground={() =>
              handleDownloadWithBackground(
                product.processedImageUrl!,
                product.title,
                selectedColor,
                opacity[0]
              )
            }
          />
        </div>
      </div>
    </motion.div>
  );
};