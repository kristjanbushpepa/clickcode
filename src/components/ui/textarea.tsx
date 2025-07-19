
import * as React from "react"
import { cn } from "@/lib/utils"
import { usePWAInput } from "@/hooks/usePWAInput"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const { isPWA } = usePWAInput();
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isPWA && "!text-base !bg-white !text-black focus:!bg-white focus:!text-black",
          className
        )}
        ref={ref}
        style={isPWA ? {
          fontSize: '16px',
          WebkitAppearance: 'none',
          backgroundColor: 'white',
          color: 'black'
        } : undefined}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
