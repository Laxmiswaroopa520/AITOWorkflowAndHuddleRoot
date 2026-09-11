import { useMsal } from "@azure/msal-react";
import { ChevronDown, LogOut, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/auth/useCurrentUser";
import { cn } from "@/lib/utils";

/** Presents the current MSAL account using the reference user dropdown. */
export function UserMenu({ isWorkflowMode }: { isWorkflowMode: boolean }) {
  const { instance } = useMsal();
  const currentUser = useCurrentUser();
  const account = instance.getActiveAccount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = currentUser.data?.displayName ?? account?.name ?? "User";
  //const name = "User";
  const email = currentUser.data?.email ?? account?.username ?? "";
  useEffect(() => { const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  if (!account) return null;
  return <div ref={rootRef} className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} className={cn("flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent", open && "bg-accent")}>
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium", isWorkflowMode ? "bg-primary/10 text-primary" : "bg-[#0F6CBD]/10 text-[#0F6CBD]")}>{name.trim().charAt(0).toUpperCase() || "U"}</span>
      <span className="hidden text-sm font-medium sm:inline">{name.split(" ")[0]}</span><ChevronDown className={cn("hidden h-3.5 w-3.5 text-muted-foreground transition-transform sm:block", open && "rotate-180")} />
    </button>
    {open && <div className="absolute right-0 top-[calc(100%+8px)] z-[90] w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
      <div className="border-b border-border px-4 py-3"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-muted-foreground">{email}</p></div>
      <button type="button" className="flex w-full items-center gap-2.5 border-b border-border px-4 py-2.5 text-left text-sm hover:bg-accent"><MessageCircle className="h-4 w-4 text-muted-foreground" />Send feedback</button>
      <button type="button" onClick={() => void instance.logoutRedirect({ account, postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI })} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-accent"><LogOut className="h-4 w-4 text-muted-foreground" />Sign out</button>
    </div>}
  </div>;
}
