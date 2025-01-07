import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GradientEditor } from "./GradientEditor";
import { supabase } from "@/lib/supabase/client";

interface GradientPickerProps {
  onSelect: (gradient: string) => void;
}

const PRESET_GRADIENTS = [
  "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
  "linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)",
  "linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)",
  "linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)",
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to top, #accbee 0%, #e7f0fd 100%)",
  "linear-gradient(to top, #d299c2 0%, #fef9d7 100%)",
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)"
];

export const GradientPicker = ({ onSelect }: GradientPickerProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [savedGradients, setSavedGradients] = useState<string[]>([]);

  useEffect(() => {
    loadGradients();
  }, []);

  const loadGradients = async () => {
    try {
      const { data, error } = await supabase
        .from('gradient_presets')
        .select('gradient')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedGradients(data?.map(p => p.gradient) || []);
    } catch (error) {
      console.error('Error loading gradients:', error);
    }
  };

  const handleSaveGradient = (gradient: string) => {
    onSelect(gradient);
    setShowEditor(false);
    loadGradients();
  };

  return (
    <div className="space-y-4">
      {showEditor ? (
        <GradientEditor onSave={handleSaveGradient} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GRADIENTS.map((gradient, index) => (
              <button
                key={`preset-${index}`}
                onClick={() => onSelect(gradient)}
                className="h-12 rounded-lg cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                style={{ background: gradient }}
              />
            ))}
          </div>
          
          {savedGradients.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {savedGradients.map((gradient, index) => (
                <button
                  key={`saved-${index}`}
                  onClick={() => onSelect(gradient)}
                  className="h-12 rounded-lg cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                  style={{ background: gradient }}
                />
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => setShowEditor(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Gradient
          </Button>
        </div>
      )}
    </div>
  );
};