import { Check, ChevronDown, Handshake, Presentation, UserRound, Users2 } from "lucide-react";
import { useEffect, useRef, useState, type ElementType } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HuddlePersona } from "../../types/huddlePersona.types";

interface HuddleExperienceSelectorProps {
  value: HuddlePersona | null;
  onChange: (value: HuddlePersona) => void;
  className?: string;
}

const experiences: Array<{ id: HuddlePersona; name: string; description: string; icon: ElementType }> = [
  { id: "manager", name: "Manager", icon: Handshake, description: "Lead the session, align the team, review outcomes, and confirm next actions." },
  { id: "team-member", name: "Team Member", icon: UserRound, description: "Participate in the session, contribute examples, and complete agreed actions." },
  { id: "facilitator", name: "Facilitator", icon: Presentation, description: "Guide the discussion, keep the session on track, and ensure everyone participates." },
];

/** Reproduces the V5 top-navigation Huddle experience selector. */
export function HuddleExperienceSelector({ value, onChange, className }: HuddleExperienceSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = experiences.find(item => item.id === value) ?? null;
  const SelectedIcon = selected?.icon ?? Users2;

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <div ref={rootRef} className={cn("relative", className)}>
    <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-controls="huddle-experience-options" onClick={() => setOpen(current => !current)} className={cn("h-11 min-w-[228px] justify-between rounded-md", selected && "border-[#0F6CBD]/50 bg-[#0F6CBD]/[0.03]")}>
      {selected ? <div className="flex min-w-0 items-center gap-2"><SelectedIcon className="h-4 w-4 shrink-0 text-[#0F6CBD]" /><span className="max-w-[180px] truncate text-sm font-medium">{selected.name}</span></div> : <div className="flex items-center gap-2 text-muted-foreground"><Users2 className="h-4 w-4" /><span>Select Huddle role...</span></div>}
      <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
    </Button>

    {open && <div id="huddle-experience-options" role="listbox" className="absolute left-0 top-[calc(100%+8px)] z-[80] w-[min(21.5rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-white text-foreground shadow-xl">
      <div className="border-b border-border p-3"><p className="text-base font-semibold">Select Your Huddle Role</p><p className="text-xs text-muted-foreground">Choose one role for how you will participate in the Huddle</p></div>
      <div className="space-y-1 p-2">{experiences.map(experience => { const Icon = experience.icon; const isSelected = experience.id === value; return <button type="button" role="option" aria-selected={isSelected} key={experience.id} onClick={() => { onChange(experience.id); setOpen(false); }} className={cn("flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors", isSelected ? "border-[#0F6CBD]/25 bg-[#0F6CBD]/[0.08]" : "border-transparent hover:bg-accent")}><div className={cn("shrink-0 rounded-lg p-2", isSelected ? "bg-[#0F6CBD]/15" : "bg-muted")}><Icon className={cn("h-4 w-4", isSelected ? "text-[#0F6CBD]" : "text-muted-foreground")} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={cn("text-sm font-medium", isSelected ? "text-[#115EA3]" : "text-foreground")}>{experience.name}</span>{isSelected && <Check className="h-4 w-4 text-[#0F6CBD]" />}</div><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{experience.description}</p></div></button>; })}</div>
    </div>}
  </div>;
}
