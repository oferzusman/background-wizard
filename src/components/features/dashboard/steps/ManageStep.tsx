import { motion } from "framer-motion";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import type { ProductData } from "@/components/features/products/FileUpload";

interface ManageStepProps {
  products: ProductData[];
  onImageProcessed: (index: number, processedImageUrl: string) => void;
  onReset: () => void;
}

export const ManageStep = ({ products, onImageProcessed, onReset }: ManageStepProps) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="glass-effect rounded-xl p-6 flex justify-between items-center backdrop-blur-sm">
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
          {products.length} Products Loaded
        </h2>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 transition-all duration-200 shadow-sm backdrop-blur-sm"
        >
          Upload New File
        </button>
      </div>
      <ProductGrid products={products} onImageProcessed={onImageProcessed} />
    </motion.div>
  );
};