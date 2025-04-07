
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  className?: string;
  topMargin?: number;
  bottomMargin?: number;
}

const AspectRatio = ({ 
  className,
  topMargin = 0,
  bottomMargin = 0,
  ...props 
}: AspectRatioProps) => {
  return (
    <div style={{ marginTop: topMargin, marginBottom: bottomMargin }}>
      <AspectRatioPrimitive.Root
        className={cn(className)}
        {...props}
      />
    </div>
  )
}

export { AspectRatio }
