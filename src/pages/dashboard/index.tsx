import { useState } from "react";
import { type ProductData } from "@/components/features/products/FileUpload";
import { AnimatePresence } from "framer-motion";
import { StepNavigation } from "@/components/StepNavigation";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { UploadStep } from "@/components/features/dashboard/steps/UploadStep";
import { ManageStep } from "@/components/features/dashboard/steps/ManageStep";
import { CloudUploadStep } from "@/components/features/dashboard/steps/CloudUploadStep";

const steps = [
  {
    title: "Upload Products",
    description: "Upload your product data via file or URL",
  },
  {
    title: "Manage Products",
    description: "Filter and process your product images",
  },
  {
    title: "Upload files to Cloud",
    description: "Upload your processed files to cloud storage",
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
    if (step === 3 && !products.some(p => p.processedImageUrl)) {
      return; // Can't go to step 3 without processed images
    }
    setCurrentStep(step);
  };

  const handleReset = () => {
    setProducts([]);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <DashboardHeader />

        <StepNavigation
          currentStep={currentStep}
          steps={steps}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <UploadStep onDataParsed={handleDataParsed} />
          ) : currentStep === 2 ? (
            <ManageStep
              products={products}
              onImageProcessed={handleImageProcessed}
              onReset={handleReset}
            />
          ) : (
            <CloudUploadStep />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;