import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ColorPresetsProps {
  onSelectColor: (color: string) => void;
}

export const ColorPresets = ({ onSelectColor }: ColorPresetsProps) => {
  const [presets, setPresets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('color_presets')
        .select('color')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data?.map(p => p.color) || []);
    } catch (error) {
      console.error('Error loading color presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreset = async (color: string) => {
    try {
      const { error } = await supabase
        .from('color_presets')
        .insert({ color, user_id: (await supabase.auth.getUser()).data.user?.id });

      if (error) throw error;
      loadPresets();
    } catch (error) {
      console.error('Error saving color preset:', error);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {presets.map((color, index) => (
          <button
            key={index}
            onClick={() => onSelectColor(color)}
            className="w-6 h-6 rounded-full border border-gray-200 hover:ring-2 hover:ring-violet-400 transition-all"
            style={{ backgroundColor: color }}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          className="w-6 h-6 rounded-full"
          onClick={() => savePreset(document.querySelector<HTMLInputElement>('input[type="color"]')?.value || '#ffffff')}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
