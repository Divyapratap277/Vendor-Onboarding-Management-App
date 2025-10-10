// frontend/src/components/ui/badge.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // Assuming you have a utility for combining class names

// Define the variants for the badge using class-variance-authority
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Standard Shadcn/UI variants often include these:
        success: "border-transparent bg-green-500 text-white hover:bg-green-600", // Added
        warning: "border-transparent bg-orange-500 text-white hover:bg-orange-600", // Added

        // Custom variants for PO/Bill status
        pending: "border-transparent bg-yellow-500/20 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300",
        approved: "border-transparent bg-green-500/20 text-green-800 dark:bg-green-400/20 dark:text-green-300",
        rejected: "border-transparent bg-red-500/20 text-red-800 dark:bg-red-400/20 dark:text-red-300",
        completed: "border-transparent bg-blue-500/20 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300",
        billed: "border-transparent bg-purple-500/20 text-purple-800 dark:bg-purple-400/20 dark:text-purple-300",
        issued: "border-transparent bg-indigo-500/20 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-300",
        paid: "border-transparent bg-emerald-500/20 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300",
        unpaid: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
