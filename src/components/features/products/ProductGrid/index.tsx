
import { toast } from "sonner";
import { ProductData } from "../FileUpload";
import { ProductSidebar } from "../ProductSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useProductManagement } from "../hooks/useProductManagement";
import { BulkActions } from "../components/BulkActions";
import { Grid } from "./components/Grid";
import { SelectionControls } from "./components/SelectionControls";
import { 
  handleDownloadOriginal, 
  handleDownloadWithBackground,
  handleBulkDownloadWithBackground
} from "../utils/imageProcessingUtils";

interface ProductGridProps {
  products: ProductData[];
  onImageProcessed: (index: number, newImageUrl: string) => void;
}

export const ProductGrid = ({ products, onImageProcessed }: ProductGridProps) => {
  const {
    processingIndex,
    selectedColor,
    setSelectedColor,
    opacity,
    setOpacity,
    selectedProducts,
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
  } = useProductManagement({ products, onImageProcessed });

  const handleBulkDownload = async () => {
    try {
      const { successCount, errorCount } = await handleBulkDownloadWithBackground(
        selectedProducts,
        products,
        selectedColor,
        opacity,
        setIsDownloading
      );
      
      if (successCount > 0) {
        toast.success(`Downloaded ${successCount} images with CSV data`);
      } else {
        toast.warning('No images were included in the download');
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} images`);
      }
    } catch (error) {
      console.error('Error creating bulk download:', error);
      toast.error(`Failed to create bulk download: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ProductSidebar
          products={products}
          onFilterChange={setFilters}
          filteredCount={filteredProducts.length}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          opacity={opacity}
          setOpacity={setOpacity}
        />
        
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SelectionControls 
                selectedProductsCount={selectedProducts.length}
                totalProductsCount={products.length}
                onSelectAll={handleSelectAll}
              />

              <BulkActions
                selectedProductsCount={selectedProducts.length}
                isBulkProcessing={isBulkProcessing}
                isDownloading={isDownloading}
                onBulkRemoveBackground={handleBulkRemoveBackground}
                onBulkClearBackground={handleBulkClearBackground}
                onBulkDownload={handleBulkDownload}
              />
            </div>

            <Grid 
              filteredProducts={filteredProducts}
              processingIndex={processingIndex}
              selectedColor={selectedColor}
              opacity={opacity[0]}
              selectedProducts={selectedProducts}
              handleSelectProduct={handleSelectProduct}
              handleRemoveBackground={handleRemoveBackground}
              handleClearBackground={handleClearBackground}
              handleDownloadOriginal={handleDownloadOriginal}
              handleDownloadWithBackground={handleDownloadWithBackground}
              onImageProcessed={onImageProcessed}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
