import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";

interface FileUploadProps {
  onDataParsed: (data: ProductData[]) => void;
}

export interface ProductData {
  name: string;
  imageUrl: string;
  processedImageUrl?: string;
}

export const FileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const parsedData = results.data as ProductData[];
          if (!parsedData[0]?.name || !parsedData[0]?.imageUrl) {
            toast.error("File must contain 'name' and 'imageUrl' columns");
            return;
          }
          onDataParsed(parsedData);
          toast.success("File uploaded successfully!");
        },
        error: (error) => {
          console.error("Error parsing file:", error);
          toast.error("Error parsing file. Please check the format.");
        },
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg border-slate-300 bg-slate-50">
      <p className="text-slate-600">Upload your product data (CSV)</p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button disabled={isLoading} asChild>
          <span>
            {isLoading ? "Processing..." : "Choose File"}
          </span>
        </Button>
      </label>
    </div>
  );
};