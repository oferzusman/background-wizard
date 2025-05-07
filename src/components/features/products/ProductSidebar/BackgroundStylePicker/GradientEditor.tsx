import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GradientEditorProps {
  onSave: (gradient: string) => void;
}

export const GradientEditor = ({ onSave }: GradientEditorProps) => {
  const [colors, setColors] = useState(['#ffffff', '#000000']);
  const [angle, setAngle] = useState(90);

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const getCurrentGradient = () => {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  };

  const saveGradient = async () => {
    try {
      const gradient = getCurrentGradient();
      const { error } = await supabase
        .from('gradient_presets')
        .insert({ 
          gradient,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        });

      if (error) throw error;
      onSave(gradient);
    } catch (error) {
      console.error('Error saving gradient:', error);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/50 rounded-lg">
      <div className="flex gap-2">
        {colors.map((color, index) => (
          <Input
            key={index}
            type="color"
            value={color}
            onChange={(e) => updateColor(index, e.target.value)}
            className="w-12 h-12"
          />
        ))}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-slate-600 block">
          Angle: {angle}°
        </label>
        <Slider
          value={[angle]}
          onValueChange={(value) => setAngle(value[0])}
          max={360}
          step={1}
        />
      </div>

      <div className="h-20 rounded-lg border"
        style={{ background: getCurrentGradient() }}
      />

      <Button onClick={saveGradient} className="w-full">
        Save Gradient
      </Button>
    </div>
  );
};
