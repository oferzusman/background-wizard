import { useState } from "react";
import { FileUpload, ProductData } from "@/components/FileUpload";
import { ProductGrid } from "@/components/ProductGrid";
import { StepNavigation } from "@/components/StepNavigation";
import { CloudUpload } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);

  const steps = [
    {
      title: "Upload Product Images",
      description: "Upload your product images to get started",
    },
    {
      title: "Process Images",
      description: "Process your images to remove backgrounds",
    },
    {
      title: "Upload to Cloud",
      description: "Store your processed images in the cloud",
    },
  ];

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleDataParsed = (data: ProductData[]) => {
    setProducts(data);
    setCompletedSteps((prev) => [...prev, 1]);
    setCurrentStep(2);
  };

  const handleImageProcessed = (index: number, newImageUrl: string) => {
    setProducts(prevProducts => {
      const newProducts = [...prevProducts];
      newProducts[index] = {
        ...newProducts[index],
        processedImageUrl: newImageUrl
      };
      return newProducts;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <StepNavigation
        currentStep={currentStep}
        steps={steps}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <FileUpload onDataParsed={handleDataParsed} />
        )}
        {currentStep === 2 && (
          <ProductGrid 
            products={products}
            onImageProcessed={handleImageProcessed}
          />
        )}
        {currentStep === 3 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CloudUpload className="h-16 w-16 text-violet-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cloud Upload Feature
            </h2>
            <p className="text-gray-600">
              Coming soon! You'll be able to upload your processed images directly to the cloud.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;