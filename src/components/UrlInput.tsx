import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UrlInputProps {
  onDataParsed: (data: any[]) => void;
}

export const UrlInput = ({ onDataParsed }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlSubmit = async () => {
    setIsLoading(true);
    console.log("Processing URL:", url);
    
    try {
      const response = await fetch(url);
      const content = await response.text();
      const fileType = url.split(".").pop()?.toLowerCase();
      
      if (!["csv", "tsv", "xml"].includes(fileType || "")) {
        throw new Error("Unsupported file type");
      }

      // Store in file history
      const { error: historyError } = await supabase
        .from("file_history")
        .insert({
          file_url: url,
          file_type: fileType,
          is_url: true,
          status: "completed",
        });

      if (historyError) {
        console.error("Error saving to history:", historyError);
        throw historyError;
      }

      const { parseFileContent } = await import("@/utils/fileParser");
      const parsedData = await parseFileContent(content, fileType || "");
      onDataParsed(parsedData);
      toast.success("File processed successfully!");
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error(error instanceof Error ? error.message : "Error processing URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="url"
        placeholder="Enter file URL (CSV, TSV, or XML)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleUrlSubmit} disabled={isLoading || !url}>
        {isLoading ? "Processing..." : "Load URL"}
      </Button>
    </div>
  );
};