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
}

export const FileHistory = ({ onDataParsed }: FileHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("file_history")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load history");
      return;
    }

    setHistory(data);
  };

  const handleReload = async (entry: HistoryEntry) => {
    setIsLoading(true);
    console.log("Reloading entry:", entry);

    try {
      const response = await fetch(entry.file_url);
      const content = await response.text();
      const parsedData = await parseFileContent(content, entry.file_type);
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