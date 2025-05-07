
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { ImageLibrary } from "./ImageLibrary";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    console.log('Starting image upload process');
    
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Authentication error:', sessionError);
        toast.error('Please log in to upload images');
        return;
      }

      console.log('User is authenticated, proceeding with upload');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Processing file:', file.name);

        // Upload to Supabase Storage
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        console.log('Uploading to storage with filename:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('merchant_saas')
          .upload(`${session.user.id}/${fileName}`, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('merchant_saas')
          .getPublicUrl(`${session.user.id}/${fileName}`);

        console.log('Generated public URL:', publicUrl);

        // Save reference to database
        const { error: dbError } = await supabase
          .from('background_images')
          .insert({
            url: publicUrl,
            user_id: session.user.id
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        }

        console.log('Database record created successfully');

        // Call the original onImageUpload
        onImageUpload(file);
        toast.success(`Uploaded ${file.name} successfully`);
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageUpload}
        multiple
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </Button>
      <ImageLibrary onSelectImage={(url) => {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "image.jpg", { type: "image/jpeg" });
            onImageUpload(file);
          })
          .catch(error => {
            console.error('Error converting URL to file:', error);
            toast.error('Failed to load image');
          });
      }} />
    </div>
  );
};
