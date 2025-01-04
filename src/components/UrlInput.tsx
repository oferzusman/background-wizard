import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseFileContent } from "@/utils/fileParser";
import { Link } from "lucide-react";

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
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log("Received content length:", content.length);
      
      // For XML feeds, don't rely on extension
      const fileType = url.toLowerCase().includes('xml') || content.trim().startsWith('<?xml') ? 'xml' : 
                      url.toLowerCase().endsWith('csv') ? 'csv' : 
                      url.toLowerCase().endsWith('tsv') ? 'tsv' : 'xml';
      
      console.log("Detected file type:", fileType);

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

      const parsedData = await parseFileContent(content, fileType);
      console.log("Successfully parsed data:", parsedData.length, "items");
      
      onDataParsed(parsedData);
      toast.success(`Successfully loaded ${parsedData.length} products from URL!`);
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error(error instanceof Error ? error.message : "Error processing URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="url"
          placeholder="Enter file URL (CSV, TSV, or XML)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pr-10"
        />
        <Link className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      </div>
      <Button 
        onClick={handleUrlSubmit} 
        disabled={isLoading || !url}
        className="min-w-[120px]"
      >
        {isLoading ? "Processing..." : "Load URL"}
      </Button>
    </div>
  );
};