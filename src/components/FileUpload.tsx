import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UrlInput } from "./UrlInput";
import { FileHistory } from "./FileHistory";
import { parseFileContent } from "@/utils/fileParser";
import { motion } from "framer-motion";
import { Upload, FileType } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.files = e.dataTransfer.files;
    handleFileUpload({ target: input } as any);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`flex flex-col items-center gap-6 p-12 border-2 border-dashed rounded-xl transition-all duration-200 ${
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
          <Upload className="w-8 h-8 text-violet-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 mb-2">
            Upload your product data
          </p>
          <p className="text-sm text-slate-600">
            Drag and drop your CSV, TSV, or XML file, or click to browse
          </p>
        </div>
        <input
          type="file"
          accept=".csv,.tsv,.xml"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button disabled={isLoading} variant="outline" size="lg" asChild>
            <span className="flex items-center gap-2">
              <FileType className="w-4 h-4" />
              {isLoading ? "Processing..." : "Choose File"}
            </span>
          </Button>
        </label>
      </div>
      
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 text-slate-500">Or import from URL</span>
          </div>
        </div>
        
        <UrlInput onDataParsed={onDataParsed} />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <FileHistory onDataParsed={onDataParsed} />
      </motion.div>
    </motion.div>
  );
};