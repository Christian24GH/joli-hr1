import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-gray-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        checked && "bg-blue-600 border-blue-600 text-white",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          handleClick()
        }
      }}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center h-full w-full">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
