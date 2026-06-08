import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    
    // Using manual classes instead of cva to avoid extra dependency overhead, keeping it clean
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-300"
    
    const variants = {
      default: "bg-mtc-gold text-mtc-navy hover:bg-mtc-gold-light shadow-md hover:shadow-lg hover:-translate-y-0.5",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border-2 border-mtc-gold text-mtc-gold bg-transparent hover:bg-mtc-gold hover:text-mtc-navy",
      secondary: "bg-mtc-navy text-white hover:bg-mtc-navy-light",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }
    
    const sizes = {
      default: "h-12 px-6 py-3",
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export function buttonVariants({ variant = "default", size = "default", className = "" }: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string } = {}): string {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-300";
  const variants: Record<string, string> = {
    default: "bg-mtc-gold text-mtc-navy hover:bg-mtc-gold-light shadow-md hover:shadow-lg hover:-translate-y-0.5",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border-2 border-mtc-gold text-mtc-gold bg-transparent hover:bg-mtc-gold hover:text-mtc-navy",
    secondary: "bg-mtc-navy text-white hover:bg-mtc-navy-light",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes: Record<string, string> = {
    default: "h-12 px-6 py-3",
    sm: "h-9 rounded-md px-3",
    lg: "h-14 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };
  return [baseStyles, variants[variant ?? "default"], sizes[size ?? "default"], className].filter(Boolean).join(" ");
}

export { Button }
