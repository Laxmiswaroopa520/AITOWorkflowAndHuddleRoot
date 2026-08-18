import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(
    "inline-flex w-fit shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium",
    variant === "default" && "border-transparent",
    className,
  )} {...props} />;
}
