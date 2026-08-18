import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-[#0A6BBA] focus:ring-2 focus:ring-[#0A6BBA]/20 disabled:opacity-50", className)} {...props} />; }
