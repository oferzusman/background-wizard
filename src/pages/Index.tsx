import { useState } from "react";
import { FileUpload, type ProductData } from "@/components/FileUpload";
import { ProductGrid } from "@/components/ProductGrid";
import { motion, AnimatePresence } from "framer-motion";
import { StepNavigation } from "@/components/StepNavigation";

const steps = [
  {
    title: "Upload Products",
    description: "Upload your product data via file or URL",
  },
  {
    title: "Manage Products",
    description: "Filter and process your product images",
  },
];

const Index = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleDataParsed = (data: ProductData[]) => {
    console.log("Data parsed in Index:", data);
    setProducts(data);
    setCompletedSteps((prev) => [...new Set([...prev, 1])]);
    setCurrentStep(2);
  };

  const handleImageProcessed = (index: number, processedImageUrl: string) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, processedImageUrl } : product
      )
    );
  };

  const handleStepClick = (step: number) => {
    if (step === 2 && products.length === 0) {
      return; // Can't go to step 2 without products
    }
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-4">
            Product Background Manager
          </h1>
          <p className="text-slate-600 text-center max-w-2xl mx-auto">
            Upload your product data, remove backgrounds, and manage your product
            images with ease.
          </p>
        </motion.div>

        <StepNavigation
          currentStep={currentStep}
          steps={steps}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-effect rounded-xl p-8 backdrop-blur-sm">
                <FileUpload onDataParsed={handleDataParsed} />
              </div>
            </motion.div>
          ) : (
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
                  onClick={() => {
                    setProducts([]);
                    setCurrentStep(1);
                    setCompletedSteps([]);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 transition-all duration-200 shadow-sm backdrop-blur-sm"
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;