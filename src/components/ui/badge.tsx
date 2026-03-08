import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-cream-200 text-brown-700",
  primary: "bg-terracotta-500/10 text-terracotta-600",
  success: "bg-success-500/10 text-success-600",
  warning: "bg-warning-500/10 text-warning-600",
  error: "bg-error-500/10 text-error-600",
  info: "bg-info-500/10 text-info-600",
  olive: "bg-olive-500/10 text-olive-600",

  // Solid product tag variants (from branding kit)
  popular: "bg-brown-900 text-white",
  available: "bg-success-500 text-white",
  "sold-out": "bg-error-500 text-white",
  "new-tag": "bg-gold-400 text-white",
  spicy: "bg-terracotta-500 text-white",
  vegan: "bg-olive-500 text-white",

  // Order / Reservation status specific
  new: "bg-info-500/10 text-info-600",
  preparing: "bg-warning-500/10 text-warning-600",
  ready: "bg-olive-500/10 text-olive-600",
  delivered: "bg-success-500/10 text-success-600",
  cancelled: "bg-error-500/10 text-error-600",
  active: "bg-success-500/10 text-success-600",
  disabled: "bg-error-500/10 text-error-600",
  pending: "bg-warning-500/10 text-warning-600",
  confirmed: "bg-success-500/10 text-success-600",
  seated: "bg-info-500/10 text-info-600",
  completed: "bg-success-500/10 text-success-600",
  refunded: "bg-brown-500/10 text-brown-600",
  failed: "bg-error-500/10 text-error-600",
  draft: "bg-cream-300 text-brown-600",
  closed: "bg-brown-500/10 text-brown-600",
};

export type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
