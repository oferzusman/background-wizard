import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Drive } from "lucide-react";

interface GoogleDriveUploadProps {
  imageUrl: string;
  fileName?: string;
}

export const GoogleDriveUpload = ({ imageUrl, fileName }: GoogleDriveUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-drive', {
        body: { imageUrl, fileName },
      });

      if (error) throw error;

      toast.success('Successfully uploaded to Google Drive!');
      console.log('Google Drive upload response:', data);
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      toast.error('Failed to upload to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUpload}
      disabled={isUploading}
      className="w-full mt-2"
    >
      <Drive className="w-4 h-4 mr-2" />
      {isUploading ? 'Uploading...' : 'Save to Google Drive'}
    </Button>
  );
};