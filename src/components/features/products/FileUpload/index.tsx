import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";
import { toast } from "sonner";

export interface ProductData {
  id: string;
  title: string;
  image_url: string;
  product_type?: string;
  processedImageUrl?: string;
}

interface FileUploadProps {
  onDataParsed: (data: ProductData[]) => void;
}

export const FileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsProcessing(true);

    try {
      const file = acceptedFiles[0];
      
      if (!file) {
        throw new Error("No file selected");
      }

      if (file.type !== "text/csv") {
        throw new Error("Please upload a CSV file");
      }

      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            throw new Error("Error parsing CSV file");
          }

          const headers = results.data[0] as string[];
          const requiredHeaders = ["id", "title", "image_url"];
          
          const missingHeaders = requiredHeaders.filter(
            (header) => !headers.includes(header)
          );

          if (missingHeaders.length > 0) {
            throw new Error(
              `Missing required columns: ${missingHeaders.join(", ")}`
            );
          }

          const products = results.data.slice(1).map((row: any) => ({
            id: row[headers.indexOf("id")],
            title: row[headers.indexOf("title")],
            image_url: row[headers.indexOf("image_url")],
            product_type: row[headers.indexOf("product_type")] || undefined,
          }));

          onDataParsed(products);
          toast.success("CSV file processed successfully");
        },
        error: (error: Error) => {
          throw error;
        },
      });
    } catch (err) {
      console.error("File processing error:", err);
      setError(err instanceof Error ? err.message : "Error processing file");
      toast.error("Failed to process CSV file");
    } finally {
      setIsProcessing(false);
    }
  }, [onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors duration-200 cursor-pointer
          ${isDragActive ? "border-violet-500 bg-violet-50" : "border-gray-300"}
          hover:border-violet-500 hover:bg-violet-50
        `}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-12 h-12 mb-4 ${
            isDragActive ? "text-violet-500" : "text-gray-400"
          }`}
        />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isDragActive ? (
              "Drop the CSV file here"
            ) : (
              <>
                Drag and drop your CSV file here, or{" "}
                <span className="text-violet-600 font-medium">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Only CSV files are supported
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              CSV File Requirements
            </h3>
            <ul className="mt-2 text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>Must include columns: id, title, image_url</li>
              <li>Optional columns: product_type</li>
              <li>Image URLs must be publicly accessible</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};