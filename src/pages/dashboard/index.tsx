import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload, ProductData } from "@/components/FileUpload";
import { ProductGrid } from "@/components/ProductGrid";
import { StepNavigation } from "@/components/StepNavigation";
import { CloudUpload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found in dashboard, redirecting to login");
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const steps = [
    {
      number: 1,
      title: "Upload File",
      description: "Upload your product data file",
    },
    {
      number: 2,
      title: "Process Images",
      description: "Remove backgrounds from product images",
    },
    {
      number: 3,
      title: "Upload to Cloud",
      description: "Save processed images to cloud storage",
    },
  ];

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  };

  const handleDataParsed = (data: ProductData[]) => {
    console.log("Data parsed:", data.length, "products");
    setProducts(data);
    setCompletedSteps((prev) => [...prev, 1]);
    setCurrentStep(2);
  };

  const handleImageProcessed = (index: number, newImageUrl: string) => {
    console.log("Image processed at index:", index);
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
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
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
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Upload to Cloud Storage
            </h3>
            <p className="text-sm text-slate-600">
              Your processed images will be saved to cloud storage
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;