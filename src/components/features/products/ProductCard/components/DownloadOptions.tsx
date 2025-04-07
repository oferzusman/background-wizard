
import React from 'react';
import { Image } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

interface DownloadOptionsProps {
  processedImageUrl: string;
  title: string;
  selectedColor: string;
  opacity: number;
  handleDownloadOriginal: (imageUrl: string, title: string) => void;
  handleDownloadWithBackground: (
    imageUrl: string,
    title: string,
    backgroundColor: string,
    opacity: number
  ) => Promise<void>;
}

export const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  processedImageUrl,
  title,
  selectedColor,
  opacity,
  handleDownloadOriginal,
  handleDownloadWithBackground
}) => {
  if (!processedImageUrl) return null;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="group">
          <Download className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Download Option</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <Button
            onClick={() => handleDownloadOriginal(processedImageUrl, title)}
            variant="outline"
            className="group"
          >
            <Image className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
            Download with Transparent Background
          </Button>
          <Button
            onClick={() =>
              handleDownloadWithBackground(
                processedImageUrl,
                title,
                selectedColor,
                opacity
              )
            }
            variant="default"
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Image className="w-4 h-4 mr-2" />
            Download with Custom Background
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
