import { Bell, HelpCircle, Menu, Search, X } from "lucide-react";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import aitoLogo from "@/assets/AITO New Logo.png";
import { Button } from "@/components/ui/button";
import { HuddleExperienceSelector } from "@/features/huddle/components/onboarding";
import { huddlePersonaAtom, huddleViewModeAtom } from "@/features/huddle/store";
import type { HuddlePersona } from "@/features/huddle/types/huddlePersona.types";
import { ModeToggle } from "./ModeToggle";
import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./GlobalSearch";

/** Renders the responsive reference application navigation shell. */
export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [huddlePersona, setHuddlePersona] = useAtom(huddlePersonaAtom);
  const [, setHuddleViewMode] = useAtom(huddleViewModeAtom);
  const isHuddleRoute = location.pathname.startsWith("/huddle");

  const changeHuddleExperience = (value: string) => {
    setHuddlePersona(value as HuddlePersona);
    setHuddleViewMode("orientation");
    setMobileMenuOpen(false);
    navigate("/huddle");
  };

  return <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 lg:px-6">
      <button data-tour="brand" type="button" onClick={() => navigate("/")} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
        <img src={aitoLogo} alt="AITO" className="h-12 w-12 shrink-0 object-contain" />
        <span className="hidden text-left sm:flex"><strong className="whitespace-nowrap text-[16px] font-extrabold tracking-tight">Frontier Accelerator App</strong></span>
      </button>

      <div className="hidden items-center gap-3 md:flex">
        <div data-tour="mode-toggle"><ModeToggle /></div>
        {/* Rendered on every route (not just Huddle) so this slot always reserves the same width; this keeps the Workflow/Huddle switcher's horizontal position identical between Workflow and Huddle mode. Hidden visually (but still occupying layout space) outside Huddle via `invisible`. */}
        <div data-tour="huddle-role" className={isHuddleRoute ? undefined : "invisible"}><HuddleExperienceSelector value={huddlePersona} onChange={changeHuddleExperience} className="hidden lg:block" /></div>
      </div>

      <div className="flex items-center gap-1">
        <div data-tour="global-search" className="mx-2 hidden w-[274px] xl:block"><GlobalSearch /></div>
        <Button type="button" variant="ghost" size="icon" className="xl:hidden" aria-label="Toggle search" onClick={() => setSearchOpen(value => !value)}>{searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}</Button>
        <Button data-tour="help" type="button" variant="ghost" size="icon" aria-label="Help and tips" title="Help and tips" onClick={() => window.dispatchEvent(new Event("aito:start-layout-tour"))}><HelpCircle className="h-5 w-5" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Notifications" title="Notifications" className="relative"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" /></Button>
        <UserMenu isWorkflowMode={!isHuddleRoute} />
        <Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen(value => !value)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
      </div>
    </div>
    <AnimatePresence>{searchOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-visible px-4 pb-3 xl:hidden"><GlobalSearch autoFocus onNavigate={() => setSearchOpen(false)} /></motion.div>}</AnimatePresence>
    <AnimatePresence>{mobileMenuOpen && <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute inset-x-0 top-full border-b border-border bg-background p-4 shadow-xl md:hidden"><div className="space-y-3"><ModeToggle />{isHuddleRoute && <HuddleExperienceSelector value={huddlePersona} onChange={changeHuddleExperience} className="w-full [&>button]:w-full" />}</div></motion.nav>}</AnimatePresence>
  </header>;
}
