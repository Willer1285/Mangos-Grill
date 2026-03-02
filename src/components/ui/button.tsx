"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    primary:
      "bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 shadow-sm",
    secondary:
      "border border-brown-600 text-brown-700 bg-transparent hover:bg-cream-200 active:bg-cream-300",
    cta: "bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-600 shadow-sm",
    ghost: "text-brown-700 hover:bg-cream-200 active:bg-cream-300",
    destructive: "bg-error-500 text-white hover:bg-error-600 active:bg-error-600 shadow-sm",
    link: "text-terracotta-500 underline-offset-4 hover:underline",
    icon: "text-brown-700 hover:bg-cream-200 active:bg-cream-300",
  },
  size: {
    sm: "h-8 px-3 text-sm rounded-md gap-1.5",
    md: "h-10 px-5 text-sm rounded-md gap-2",
    lg: "h-12 px-6 text-base rounded-md gap-2",
    icon: "h-10 w-10 rounded-md",
    "icon-sm": "h-8 w-8 rounded-md",
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, loading = false, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-[var(--transition-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
