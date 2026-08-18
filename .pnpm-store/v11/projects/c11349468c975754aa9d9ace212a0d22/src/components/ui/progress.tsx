import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Progress({ className, value = 0, ...props }: HTMLAttributes<HTMLDivElement> & { value?: number }) { return <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[#CFE7F5]", className)} {...props}><div className="h-full bg-[#0A6BBA] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
