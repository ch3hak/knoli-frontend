import React from "react";
import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'red' | 'yellow' | 'green';
  size?: 'icon' | 'sm' | 'default' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-none font-pixel border-4";
    const variantClass = {
      default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-foreground",
      outline: "bg-transparent border-foreground text-foreground",
      ghost: "bg-transparent border-transparent text-foreground",
      red: "bg-[hsl(var(--status-red))] text-white border-foreground",
      yellow: "bg-[hsl(var(--status-yellow))] text-foreground border-foreground",
      green: "bg-[hsl(var(--status-green))] text-white border-foreground",
    }[variant];

    const sizeClass = {
      icon: "h-8 w-8 p-0",
      sm: "h-8 px-3",
      default: "h-10 px-4",
      lg: "h-12 px-6",
    }[size];

    return (
      <button
        ref={ref}
        {...props}
        className={cn(base, variantClass, sizeClass, "pixel-btn", className)}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
