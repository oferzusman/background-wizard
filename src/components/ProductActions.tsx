import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Eraser, Image } from "lucide-react";

interface ProductActionsProps {
  hasProcessedImage: boolean;
  isProcessing: boolean;
  onRemoveBackground: () => Promise<void>;
  onDownloadOriginal: () => void;
  onDownloadWithBackground: () => Promise<void>;
}

export const ProductActions = ({
  hasProcessedImage,
  isProcessing,
  onRemoveBackground,
  onDownloadOriginal,
  onDownloadWithBackground,
}: ProductActionsProps) => {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onRemoveBackground}
        disabled={isProcessing}
        className="group"
      >
        <Eraser className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
        Remove Background
      </Button>
      {hasProcessedImage && (
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
                onClick={onDownloadOriginal}
                variant="outline"
                className="group"
              >
                <Image className="w-4 h-4 mr-2 text-slate-500 group-hover:text-violet-600" />
                Download with Transparent Background
              </Button>
              <Button
                onClick={onDownloadWithBackground}
                variant="default"
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Image className="w-4 h-4 mr-2" />
                Download with Custom Background
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};