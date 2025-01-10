import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { UploadStep } from "@/components/features/dashboard/steps/UploadStep";
import { ManageStep } from "@/components/features/dashboard/steps/ManageStep";
import { CloudUploadStep } from "@/components/features/dashboard/steps/CloudUploadStep";
import type { ProductData } from "@/components/features/products/FileUpload";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<ProductData[]>([]);
  const navigate = useNavigate();

  const handleDataParsed = (data: ProductData[]) => {
    setProducts(data);
    setCurrentStep(2);
  };

  const handleImageProcessed = (index: number, processedImageUrl: string) => {
    setProducts(prevProducts => {
      const newProducts = [...prevProducts];
      newProducts[index] = {
        ...newProducts[index],
        processedImageUrl,
      };
      return newProducts;
    });
  };

  const handleReset = () => {
    setProducts([]);
    setCurrentStep(1);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <DashboardHeader />

        <div className="mt-12 space-y-8">
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={currentStep === 1 ? "default" : "outline"}
              onClick={() => setCurrentStep(1)}
              disabled={currentStep === 1}
            >
              Upload
            </Button>
            <Button
              variant={currentStep === 2 ? "default" : "outline"}
              onClick={() => setCurrentStep(2)}
              disabled={products.length === 0 || currentStep === 2}
            >
              Manage
            </Button>
            <Button
              variant={currentStep === 3 ? "default" : "outline"}
              onClick={() => setCurrentStep(3)}
              disabled={products.length === 0 || currentStep === 3}
            >
              Cloud Upload
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <UploadStep onDataParsed={handleDataParsed} />
            )}
            {currentStep === 2 && (
              <ManageStep
                products={products}
                onImageProcessed={handleImageProcessed}
                onReset={handleReset}
              />
            )}
            {currentStep === 3 && (
              <CloudUploadStep />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;