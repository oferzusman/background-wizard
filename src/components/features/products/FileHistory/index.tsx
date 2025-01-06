import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { parseFileContent } from "@/lib/utils/fileParser";
import { useNavigate } from "react-router-dom";
import { ProductData } from "../FileUpload";

interface FileHistoryProps {
  onDataParsed: (data: ProductData[]) => void;
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
    console.log("Reloading entry:", entry);

    try {
      const response = await fetch(entry.file_url);
      const content = await response.text();
      const parsedData = await parseFileContent(content, entry.file_type);
      onDataParsed(parsedData);
      toast.success("File reloaded successfully!");
      navigate('/'); // Redirect to main view after successful reload
    } catch (error) {
      console.error("Error reloading file:", error);
      toast.error(error instanceof Error ? error.message : "Error processing file");
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
