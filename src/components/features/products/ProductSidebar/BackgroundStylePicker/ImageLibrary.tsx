import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageLibraryProps {
  onSelectImage: (url: string) => void;
}

export const ImageLibrary = ({ onSelectImage }: ImageLibraryProps) => {
  const [savedImages, setSavedImages] = useState<Array<{ id: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async () => {
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('User not authenticated, skipping image load');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('background_images')
        .select('id, url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedImages(data || []);
    } catch (error) {
      console.error('Error loading saved images:', error);
      toast.error('Failed to load saved images');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('background_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Reload images after deletion
      loadSavedImages();
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      {savedImages.length === 0 ? (
        <div className="text-center text-slate-500 py-8">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>No saved images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {savedImages.map((image) => (
            <div key={image.id} className="relative group">
              <button
                onClick={() => onSelectImage(image.url)}
                className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-violet-400 transition-all"
                style={{
                  backgroundImage: `url(${image.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(image.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
