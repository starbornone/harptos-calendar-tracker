import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Adapted from the shadcn/ui Radix Nova Button registry component.
export function Button({
  className,
  type = "button",
  variant = "default",
  ...props
}: ComponentProps<"button"> & { variant?: "default" | "outline" }) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50",
        variant === "default"
          ? "bg-primary text-primary-foreground hover:bg-primary/85"
          : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
