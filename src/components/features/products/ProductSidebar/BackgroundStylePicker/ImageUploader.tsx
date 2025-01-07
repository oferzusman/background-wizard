import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Upload } from "lucide-react";
import { useRef } from "react";
import { ImageLibrary } from "./ImageLibrary";
import { supabase } from "@/lib/supabase/client";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Upload to Supabase Storage
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('background-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('background-images')
          .getPublicUrl(fileName);

        // Save reference to database
        const { error: dbError } = await supabase
          .from('background_images')
          .insert({
            url: publicUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;

        // Call the original onImageUpload
        onImageUpload(file);
      } catch (error) {
        console.error('Error uploading image:', error);
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
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Images
      </Button>
      <ImageLibrary onSelectImage={(url) => {
        // Create a File object from the URL
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "image.jpg", { type: "image/jpeg" });
            onImageUpload(file);
          });
      }} />
    </div>
  );
};