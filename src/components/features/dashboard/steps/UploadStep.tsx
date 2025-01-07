import { motion } from "framer-motion";
import { FileUpload, type ProductData } from "@/components/features/products/FileUpload";

interface UploadStepProps {
  onDataParsed: (data: ProductData[]) => void;
}

export const UploadStep = ({ onDataParsed }: UploadStepProps) => {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-effect rounded-xl p-8 backdrop-blur-sm">
        <FileUpload onDataParsed={onDataParsed} />
      </div>
    </motion.div>
  );
};