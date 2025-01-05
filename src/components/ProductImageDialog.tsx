import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { ProductData } from "./FileUpload";

interface ProductImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductData;
  selectedColor: string;
  opacity: number[];
}

export const ProductImageDialog = ({
  isOpen,
  onOpenChange,
  product,
  selectedColor,
  opacity,
}: ProductImageDialogProps) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0">
        <div className="relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-2 top-2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div 
            className="w-full h-full"
            style={product.processedImageUrl ? getBackgroundStyle() : {}}
          >
            <img
              src={product.processedImageUrl || product["image link"]}
              alt={product.title}
              className="w-full h-full object-contain"
              style={{ maxHeight: "95vh" }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};