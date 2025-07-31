
import * as React from "react"
import { cn } from "@/lib/utils"
import { usePWAInput } from "@/hooks/usePWAInput"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { isPWA } = usePWAInput();
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isPWA && "!text-base !bg-white !text-black focus:!bg-white focus:!text-black !border-gray-300 focus:!border-blue-500",
          className
        )}
        ref={ref}
        {...(isPWA && {
          style: {
            fontSize: '16px',
            WebkitAppearance: 'none',
            backgroundColor: 'white',
            color: 'black',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            userSelect: 'text',
            WebkitUserSelect: 'text',
            cursor: 'text'
          },
          autoComplete: props.autoComplete || 'off',
          inputMode: type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'
        })}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
