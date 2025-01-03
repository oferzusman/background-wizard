import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UrlInput } from "./UrlInput";
import { FileHistory } from "./FileHistory";
import { parseFileContent } from "@/utils/fileParser";

interface FileUploadProps {
  onDataParsed: (data: ProductData[]) => void;
}

export interface ProductData {
  title: string;
  "image link": string;
  processedImageUrl?: string;
  product_type?: string;
  id?: string;
}

export const FileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    console.log("Starting file upload:", file.name);
    
    try {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "tsv", "xml"].includes(fileType || "")) {
        throw new Error("Unsupported file type. Please use CSV, TSV, or XML files.");
      }

      const text = await file.text();
      const parsedData = await parseFileContent(text, fileType || "");

      // Store in file history
      const { error: historyError } = await supabase
        .from("file_history")
        .insert({
          file_type: fileType,
          original_filename: file.name,
          status: "completed",
        });

      if (historyError) {
        console.error("Error saving to history:", historyError);
      }

      onDataParsed(parsedData);
      toast.success(`Successfully loaded ${parsedData.length} products!`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(error instanceof Error ? error.message : "Error processing file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg border-slate-300 bg-slate-50">
        <p className="text-slate-600">Upload your product data (CSV, TSV, or XML)</p>
        <input
          type="file"
          accept=".csv,.tsv,.xml"
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
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Or Import from URL</h3>
        <UrlInput onDataParsed={onDataParsed} />
      </div>
      
      <FileHistory onDataParsed={onDataParsed} />
    </div>
  );
};