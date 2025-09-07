import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-custom hover:shadow-custom-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-custom hover:shadow-custom-lg",
        outline:
          "border border-card-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-card-hover hover:border-border-hover shadow-custom",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-custom hover:shadow-custom-md",
        ghost: "hover:bg-card-hover hover:text-foreground transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        glass: "bg-card/30 backdrop-blur-xl border border-card-border text-foreground hover:bg-card-hover hover:border-border-hover shadow-custom hover:shadow-glow-primary",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-custom hover:shadow-glow-accent hover:-translate-y-0.5",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-custom hover:shadow-custom-lg",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-custom hover:shadow-custom-lg",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }