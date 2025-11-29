import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"
import { buttonVariants } from "./button"

const progressVariants = cva(
  "relative overflow-hidden pt-2.5 pb-2.5",
  {
    variants: {
      variant: {
        default: "[&_.progress-bar]:bg-primary-foreground",
        destructive: "[&_.progress-bar]:bg-destructive-foreground",
        outline: "[&_.progress-bar]:bg-foreground",
        secondary: "[&_.progress-bar]:bg-secondary-foreground",
        ghost: "[&_.progress-bar]:bg-foreground",
        link: "[&_.progress-bar]:bg-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ProgressBaseProps extends VariantProps<typeof buttonVariants> {
  min?: number
  max?: number
  value: number
  asChild?: boolean
}

interface ProgressPrimitiveProps extends ProgressBaseProps {
  as?: "button" | "a" | "div"
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  [key: string]: any
}

const ProgressPrimitive = forwardRef<HTMLElement, ProgressPrimitiveProps>(
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
      as = "div",
      disabled,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)
    const Comp = asChild ? Slot : as

    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size }),
            progressVariants({ variant }),
            className
          )}
          {...props}
        >
          <div>
            <span className="flex items-center gap-2">{children}</span>
            {max !== -1 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 md:h-0.5 bg-black/10 dark:bg-white/10">
                <div
                  className="progress-bar h-full transition-all duration-300 ease-in-out"
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
        ref={ref as any}
        className={cn(
          buttonVariants({ variant, size }),
          progressVariants({ variant }),
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">{children}</span>
        {max !== -1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 md:h-0.5 bg-black/10 dark:bg-white/10">
            <div
              className="progress-bar h-full transition-all duration-300 ease-in-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </Comp>
    )
  },
)

ProgressPrimitive.displayName = "ProgressPrimitive"

interface ProgressButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'>, ProgressBaseProps {}

const ProgressButton = forwardRef<HTMLButtonElement, ProgressButtonProps>(
  (
    {
      min = 0,
      max = 100,
      value,
      disabled,
      variant,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || (max !== -1 && value >= max)

    return (
      <ProgressPrimitive
        ref={ref as any}
        as="button"
        min={min}
        max={max}
        value={value}
        variant={variant}
        size={size}
        className={className}
        disabled={isDisabled}
        {...props}
      />
    )
  },
)

ProgressButton.displayName = "ProgressButton"

interface ProgressLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'value'>, ProgressBaseProps {}

const ProgressLink = forwardRef<HTMLAnchorElement, ProgressLinkProps>(
  (
    {
      min = 0,
      max = 100,
      value,
      variant,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = max !== -1 && value >= max

    return (
      <ProgressPrimitive
        ref={ref as any}
        as="a"
        min={min}
        max={max}
        value={value}
        variant={variant}
        size={size}
        className={cn(
          isDisabled && "pointer-events-none opacity-50",
          className
        )}
        aria-disabled={isDisabled}
        {...props}
      />
    )
  },
)

ProgressLink.displayName = "ProgressLink"

export { ProgressButton, ProgressLink, ProgressPrimitive, progressVariants }
