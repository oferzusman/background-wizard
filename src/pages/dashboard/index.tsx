import { useState } from "react";
import { FileUpload, type ProductData } from "@/components/features/products/FileUpload";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600">
            Product Background Manager
          </h1>
          <p className="text-slate-600 text-center max-w-2xl mx-auto">
            Upload your product data, remove backgrounds, and manage your product images with ease.
          </p>
        </motion.div>
        
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <FileUpload onDataParsed={handleDataParsed} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                {products.length} Products Loaded
              </h2>
              <button
                onClick={() => setProducts([])}
                className="text-slate-600 hover:text-slate-900 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-slate-50"
              >
                Upload New File
              </button>
            </div>
            <ProductGrid 
              products={products}
              onImageProcessed={handleImageProcessed}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;