
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseFileContent } from "@/utils/fileParser";
import { useNavigate } from "react-router-dom";

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
}

export const FileHistory = ({ onDataParsed }: FileHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      loadHistory();
    };

    checkSession();
  }, [navigate]);

  const loadHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from("file_history")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load history");
      if (error.code === "42501") { // RLS error code
        navigate('/login');
      }
      return;
    }

    setHistory(data || []);
  };

  const handleReload = async (entry: HistoryEntry) => {
    setIsLoading(true);
    setLoadingId(entry.id);
    console.log("Reloading entry:", entry);

    try {
      // If the entry has a file_url, fetch it
      if (entry.file_url) {
        const response = await fetch(entry.file_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        
        const content = await response.text();
        console.log(`Fetched content for ${entry.file_type} file, length: ${content.length}`);
        
        // Normalize file type to lowercase and handle special cases
        const fileType = entry.file_type.toLowerCase();
        console.log("Using file type for parsing:", fileType);
        
        // Special handling for TSV/CSV files
        if (fileType === 'csv' || fileType === 'tsv') {
          try {
            const parsedData = await parseFileContent(content, fileType);
            console.log("Successfully parsed data:", parsedData.length, "items");
            
            if (parsedData.length === 0) {
              throw new Error("No products found in the file");
            }
            
            onDataParsed(parsedData);
            toast.success(`Successfully loaded ${parsedData.length} products!`);
          } catch (parseError) {
            console.error("Error parsing file content:", parseError);
            toast.error(`Error parsing ${fileType.toUpperCase()} file. Please check the file format.`);
          }
        } else if (fileType === 'json') {
          try {
            const jsonData = JSON.parse(content);
            const parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
            console.log("Successfully parsed JSON data:", parsedData.length, "items");
            
            onDataParsed(parsedData);
            toast.success(`Successfully loaded ${parsedData.length} products!`);
          } catch (parseError) {
            console.error("Error parsing JSON content:", parseError);
            toast.error("Invalid JSON format");
          }
        } else {
          throw new Error(`Unsupported file type: ${fileType}`);
        }
      } else {
        throw new Error("No file URL available");
      }
    } catch (error) {
      console.error("Error reloading file:", error);
      toast.error(error instanceof Error ? error.message : "Error processing file");
    } finally {
      setIsLoading(false);
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">File History</h3>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No upload history found</p>
      ) : (
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
                <p className="text-xs text-gray-400">
                  Type: {entry.file_type.toUpperCase()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleReload(entry)}
                disabled={isLoading}
              >
                {loadingId === entry.id ? "Loading..." : "Reload"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
