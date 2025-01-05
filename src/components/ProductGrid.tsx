import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductData } from "./FileUpload";
import { ProductFilters } from "./ProductFilters";
import { ImageControlsSidebar } from "./ImageControlsSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { removeBackground } from "@/lib/imageProcessing";
import { toast } from "sonner";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

const gradientPresets = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #2193b0, #6dd5ed)",
  "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
  "linear-gradient(to right, #00b4db, #0083b0)",
];

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState([100]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSelect = (index: number, selected: boolean) => {
    setSelectedProducts((prev) =>
      selected ? [...prev, index] : prev.filter((i) => i !== index)
    );
  };

  const handleRemoveBackground = async (index: number) => {
    try {
      setProcessingIndex(index);
      console.log("Starting background removal for product:", products[index]);
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = products[index]["image link"];
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(new Error("Failed to load image"));
        };
      });

      console.log("Image loaded successfully, starting background removal");
      const processedBlob = await removeBackground(img);
      console.log("Background removed successfully, creating URL");
      
      const processedUrl = URL.createObjectURL(processedBlob);
      onImageProcessed(index, processedUrl);
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleDownloadOriginal = (imageUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title}-transparent.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWithBackground = async (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      if (backgroundColor.includes("gradient")) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        const colors = backgroundColor.match(/#[a-f\d]{6}/gi) || ["#ffffff", "#ffffff"];
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = `${backgroundColor}${Math.round(opacity * 2.55)
          .toString(16)
          .padStart(2, "0")}`;
      }
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `${title}-with-background.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const filteredProducts = products.filter((product) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true;
      const productValue = product[key as keyof ProductData];
      return productValue?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ImageControlsSidebar
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          opacity={opacity}
          setOpacity={setOpacity}
          gradientPresets={gradientPresets}
          onBackgroundImageSelect={(file) => {
            const url = URL.createObjectURL(file);
            setSelectedColor(`url(${url})`);
          }}
        />
        <div className="flex-1 p-6">
          <ProductFilters
            onFilterChange={handleFilterChange}
            products={products}
            filteredCount={filteredProducts.length}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                index={index}
                onImageProcessed={onImageProcessed}
                onSelect={handleSelect}
                isSelected={selectedProducts.includes(index)}
                processingIndex={processingIndex}
                selectedColor={selectedColor}
                opacity={opacity}
                handleRemoveBackground={handleRemoveBackground}
                handleDownloadOriginal={handleDownloadOriginal}
                handleDownloadWithBackground={handleDownloadWithBackground}
              />
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};