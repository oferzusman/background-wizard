import { useState } from "react";
import { FileUpload, type ProductData } from "@/components/FileUpload";
import { ProductGrid } from "@/components/ProductGrid";

const Index = () => {
  const [products, setProducts] = useState<ProductData[]>([]);

  const handleDataParsed = (data: ProductData[]) => {
    console.log("Data parsed in Index:", data);
    setProducts(data);
  };

  const handleImageProcessed = (index: number, processedImageUrl: string) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, processedImageUrl } : product
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Product Background Manager</h1>
        
        {products.length === 0 ? (
          <FileUpload onDataParsed={handleDataParsed} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">
                {products.length} Products Loaded
              </h2>
              <button
                onClick={() => setProducts([])}
                className="text-slate-600 hover:text-slate-900"
              >
                Upload New File
              </button>
            </div>
            <ProductGrid 
              products={products}
              onImageProcessed={handleImageProcessed}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;