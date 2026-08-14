import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { FolderOpen, LogOut, Menu, Users, Workflow } from "lucide-react";
import { NavLink } from "react-router";
import { useState } from "react";
import { useCurrentUser } from "@/auth/useCurrentUser";
import { loginRequest } from "@/auth/msalConfig";
import { cn } from "@/lib/utils";
import aitoLogo from "@/assets/AITO New Logo.png";

const navigationItems = [
  { label: "Workflow", path: "/workflow", icon: Workflow },
  { label: "My Workflows", path: "/workflows", icon: FolderOpen },
  { label: "Huddle", path: "/huddle", icon: Users },
];

export function Header() {
  const { instance, inProgress } = useMsal();
  const currentUserQuery = useCurrentUser();
  const account = instance.getActiveAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = currentUserQuery.data?.displayName ?? currentUserQuery.data?.email ?? account?.name ?? "Signed-in user";

  const signIn = async () => instance.loginRedirect(loginRequest);
  const signOut = async () => instance.logoutRedirect({ account: account ?? undefined, postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI });

  return <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 lg:px-6">
      <NavLink to="/" className="flex items-center gap-2.5 text-foreground no-underline">
        <img src={aitoLogo} alt="AITO" className="h-11 w-11 object-contain" />
        <span className="hidden leading-none sm:flex sm:flex-col"><strong className="text-lg tracking-tight">AITO</strong><span className="mt-1 whitespace-nowrap text-[10px] font-medium tracking-wide text-muted-foreground">Workflow &amp; Huddle Generator</span></span>
      </NavLink>

      <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
        {navigationItems.map(item => { const Icon=item.icon; return <NavLink key={item.path} to={item.path} className={({isActive}) => cn("inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950", isActive && "bg-blue-50 text-primary") }><Icon className="h-4 w-4" /><span>{item.label}</span></NavLink>; })}
      </nav>

      <div className="flex items-center gap-2">
        {account && <><div className="hidden text-right lg:block"><p className="max-w-[180px] truncate text-sm font-semibold">{displayName}</p><p className="text-[11px] text-muted-foreground">Microsoft account</p></div><button type="button" onClick={() => void signOut()} className="hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"><LogOut className="h-4 w-4" /> Sign out</button></>}
        {!account && inProgress === InteractionStatus.None && <button type="button" onClick={() => void signIn()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Sign in</button>}
        <button type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"><Menu className="h-5 w-5" /></button>
      </div>
    </div>
    {menuOpen && <nav className="grid gap-1 border-t bg-white p-3 md:hidden">{navigationItems.map(item => { const Icon=item.icon; return <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={({isActive}) => cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-blue-50 text-primary" : "text-slate-600") }><Icon className="h-4 w-4" />{item.label}</NavLink>; })}</nav>}
  </header>;
}
