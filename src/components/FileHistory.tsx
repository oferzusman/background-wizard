import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseFileContent } from "@/utils/fileParser";

interface FileHistoryProps {
  onDataParsed: (data: any[]) => void;
}

interface HistoryEntry {
  id: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  is_url: boolean;
  original_filename: string;
  status: string;
  file_content?: any;
}

export const FileHistory = ({ onDataParsed }: FileHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    // First get history entries from file_history
    const { data: historyData, error: historyError } = await supabase
      .from("file_history")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (historyError) {
      console.error("Error loading history:", historyError);
      toast.error("Failed to load history");
      return;
    }

    // Then get corresponding file_uploads data
    const { data: uploadsData, error: uploadsError } = await supabase
      .from("file_uploads")
      .select("*");

    if (uploadsError) {
      console.error("Error loading file uploads:", uploadsError);
      toast.error("Failed to load file data");
      return;
    }

    // Merge the data from both tables
    const mergedHistory = historyData.map((historyEntry) => {
      const fileUpload = uploadsData.find(
        (upload) => upload.file_url === historyEntry.file_url
      );
      return {
        ...historyEntry,
        file_content: fileUpload?.file_content,
      };
    });

    setHistory(mergedHistory);
  };

  const handleReload = async (entry: HistoryEntry) => {
    setIsLoading(true);
    console.log("Reloading entry:", entry);

    try {
      let parsedData;
      
      // If we have file_content stored, use it directly
      if (entry.file_content) {
        console.log("Using stored file content:", entry.file_content);
        parsedData = entry.file_content;
      } else if (entry.file_url) {
        // Otherwise fetch and parse the file
        console.log("Fetching file from URL:", entry.file_url);
        const response = await fetch(entry.file_url);
        const content = await response.text();
        parsedData = await parseFileContent(content, entry.file_type);
      } else {
        throw new Error("No file content or URL available");
      }

      console.log("Parsed data:", parsedData);
      onDataParsed(parsedData);
      toast.success("File reloaded successfully!");
    } catch (error) {
      console.error("Error reloading file:", error);
      toast.error("Failed to reload file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">File History</h3>
      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow"
          >
            <div>
              <p className="font-medium">
                {entry.original_filename || entry.file_url}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(entry.uploaded_at).toLocaleString()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleReload(entry)}
              disabled={isLoading}
            >
              Reload
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
