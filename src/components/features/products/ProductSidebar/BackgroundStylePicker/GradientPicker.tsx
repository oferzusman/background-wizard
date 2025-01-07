import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GradientEditor } from "./GradientEditor";
import { supabase } from "@/lib/supabase/client";

interface GradientPickerProps {
  onSelect: (gradient: string) => void;
}

export const GradientPicker = ({ onSelect }: GradientPickerProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [gradients, setGradients] = useState<string[]>([]);

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
      setGradients(data?.map(p => p.gradient) || []);
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
        <div className="grid grid-cols-2 gap-2">
          {gradients.map((gradient, index) => (
            <button
              key={index}
              onClick={() => onSelect(gradient)}
              className="h-12 rounded-lg cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
              style={{ background: gradient }}
            />
          ))}
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