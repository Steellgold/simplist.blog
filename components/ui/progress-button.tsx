import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"
import { buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

interface ProgressButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  min?: number
  max?: number
  value: number
  asChild?: boolean
}

const ProgressButton = forwardRef<HTMLButtonElement, ProgressButtonProps>(
  (
    {
      min = 0,
      max = 100,
      value,
      className,
      children,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)

    const Comp = asChild ? Slot : "button"

    const progressBarColors = {
      default: "bg-primary-foreground",
      destructive: "bg-destructive-foreground",
      outline: "bg-foreground",
      secondary: "bg-secondary-foreground",
      ghost: "bg-foreground",
      link: "bg-primary",
    }

    const progressBarColor = progressBarColors[variant as keyof typeof progressBarColors]

    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size }), "relative overflow-hidden pt-2.5 pb-2.5", className)}
          disabled={max !== -1 && value >= max}
          {...props}
        >
          <div>
            <span className="flex items-center gap-2">{children}</span>
            {max !== -1 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 md:h-0.5 bg-black/10 dark:bg-white/10">
                <div
                  className={cn("h-full transition-all duration-300 ease-in-out", progressBarColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        </Comp>
      )
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), "relative overflow-hidden pt-2.5 pb-2.5", className)}
        disabled={max !== -1 && value >= max}
        {...props}
      >
        <span className="flex items-center gap-2">{children}</span>
        {max !== -1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 md:h-0.5 bg-black/10 dark:bg-white/10">
            <div
              className={cn("h-full transition-all duration-300 ease-in-out", progressBarColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </Comp>
    )
  },
)

ProgressButton.displayName = "ProgressButton"

export { ProgressButton }