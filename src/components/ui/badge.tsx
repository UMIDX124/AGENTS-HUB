import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/25 bg-indigo-500/15 text-indigo-300",
        secondary:
          "border-white/10 bg-white/[0.06] text-white/60",
        destructive:
          "border-red-500/25 bg-red-500/15 text-red-400",
        outline:
          "border-white/15 bg-transparent text-white/60",
        success:
          "border-emerald-500/25 bg-emerald-500/15 text-emerald-400",
        warning:
          "border-amber-500/25 bg-amber-500/15 text-amber-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
