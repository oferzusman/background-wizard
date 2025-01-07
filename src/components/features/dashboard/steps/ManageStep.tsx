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
      <ProductGrid products={products} onImageProcessed={onImageProcessed} />
    </motion.div>
  );
};