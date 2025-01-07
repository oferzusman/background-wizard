import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Palette, Paintbrush, Image } from "lucide-react";
import { useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { GradientPicker } from "./GradientPicker";
import { ImageUploader } from "./ImageUploader";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";

interface BackgroundStylePickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number[];
  setOpacity: (opacity: number[]) => void;
}

export const BackgroundStylePicker = ({
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
}: BackgroundStylePickerProps) => {
  const [activeTab, setActiveTab] = useState("solid");

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setSelectedColor(`url(${result})`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background Style
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-4 p-4 bg-white/50 rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="solid" className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Solid
              </TabsTrigger>
              <TabsTrigger value="gradient" className="flex-1">
                <Paintbrush className="w-4 h-4 mr-2" />
                Gradient
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1">
                <Image className="w-4 h-4 mr-2" />
                Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solid" className="mt-4">
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            </TabsContent>

            <TabsContent value="gradient" className="mt-4">
              <GradientPicker onSelect={setSelectedColor} />
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <ImageUploader onImageUpload={handleImageUpload} />
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <label className="text-sm text-slate-600 block">
              Opacity: {opacity[0]}%
            </label>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};