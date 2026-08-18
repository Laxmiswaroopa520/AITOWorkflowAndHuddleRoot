import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const DialogContext = createContext<(() => void) | null>(null);
export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) { if (!open) return null; return <DialogContext.Provider value={() => onOpenChange?.(false)}>{children}</DialogContext.Provider>; }
export function DialogContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) { const close = useContext(DialogContext); return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) close?.(); }}><div role="dialog" aria-modal="true" className={cn("relative w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl", className)} {...props}>{children}<button type="button" aria-label="Close" onClick={close ?? undefined} className="absolute right-4 top-4 rounded p-1 hover:bg-slate-100"><X className="h-4 w-4" /></button></div></div>; }
export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-col gap-2", className)} {...props} />; }
export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h2 className={cn("text-lg font-semibold", className)} {...props} />; }
