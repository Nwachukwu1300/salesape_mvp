import * as React from "react"

import { cn } from "@/lib/utils"

type ColorPickerProps = React.ComponentProps<"input"> & { value?: string }

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="color"
        value={value}
        className={cn("w-12 h-10 rounded-md border border-input p-0 bg-transparent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", className)}
        {...props}
      />
    )
  }
)
ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
