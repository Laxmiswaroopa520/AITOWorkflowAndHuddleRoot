import { motion } from "motion/react";
import { Users, Workflow } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";

/** Switches between the two application modules using the reference animated indicator. */
export function ModeToggle() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname.startsWith("/huddle") ? "huddle" : "workflow";
  return <div className="flex items-center rounded-xl border border-border bg-muted/50 p-1">
    {([{ id: "workflow", label: "Workflow", icon: Workflow }, { id: "huddle", label: "Huddle", icon: Users }] as const).map(item => {
      const Icon = item.icon;
      const selected = item.id === mode;
      return <button key={item.id} type="button" aria-current={selected ? "page" : undefined} onClick={() => navigate(item.id === "workflow" ? "/workflow" : "/huddle")} className={cn("relative flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors", selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
        {selected && <motion.span layoutId="application-mode-indicator" className={cn("absolute inset-0 rounded-lg", item.id === "huddle" ? "bg-[#0F6CBD]" : "bg-primary")} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
        <Icon className="relative z-10 h-4 w-4" /><span className="relative z-10 hidden sm:inline">{item.label}</span>
      </button>;
    })}
  </div>;
}
