import { ArrowLeft, ArrowRight, LayoutDashboard, ListChecks, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAtom } from "jotai";
import { useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { huddlePersonaAtom, huddleViewModeAtom } from "@/features/huddle/store";
import { resolveLayoutSteps, resolvePageSteps, type TourStep } from "./tourSteps";

interface TargetRect { top: number; left: number; width: number; height: number }
interface TourChoice { layout: TourStep[]; page: TourStep[] }

const EMPTY_CHOICE: TourChoice = { layout: [], page: [] };

function describe(count: number, summary: string): string {
  return count === 0 ? "Nothing to show on this page yet." : `${summary} ${count} ${count === 1 ? "tip" : "tips"}.`;
}

/** Renders the spotlight tour, preceded by a picker so the user chooses what to be shown. */
export function LayoutTour() {
  const location = useLocation();
  const [persona] = useAtom(huddlePersonaAtom);
  const [viewMode] = useAtom(huddleViewModeAtom);
  const [choice, setChoice] = useState<TourChoice>(EMPTY_CHOICE);
  const [choosing, setChoosing] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const step = steps[index];
  const isHuddleRoute = location.pathname.startsWith("/huddle");

  const run = useCallback((selected: TourStep[]) => {
    if (selected.length === 0) return;
    setSteps(selected);
    setIndex(0);
    setChoosing(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => { setOpen(false); setChoosing(false); }, []);

  useEffect(() => {
    const start = () => {
      // Filtered against the DOM on open, so conditional controls (Launch Planner,
      // Generate Huddle) never leave a step pointing at nothing.
      const onPage = (candidate: TourStep) => document.querySelector(`[data-tour="${candidate.target}"]`) !== null;
      const next: TourChoice = {
        layout: resolveLayoutSteps({ isHuddleRoute, persona, viewMode }).filter(onPage),
        page: resolvePageSteps({ isHuddleRoute, persona, viewMode }).filter(onPage),
      };
      if (next.layout.length + next.page.length === 0) return;
      setChoice(next);
      setOpen(false);
      setChoosing(true);
    };
    window.addEventListener("aito:start-layout-tour", start);
    return () => window.removeEventListener("aito:start-layout-tour", start);
  }, [isHuddleRoute, persona, viewMode, run]);

  useEffect(() => {
    if (!open && !choosing) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, choosing, close]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    const update = () => {
      const element = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!element) { setRect(null); return; }
      if (!element.closest("header")) element.scrollIntoView({ block: "center", behavior: "smooth" });
      const value = element.getBoundingClientRect();
      setRect({ top: value.top, left: value.left, width: value.width, height: value.height });
    };
    update();
    const timeout = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.clearTimeout(timeout); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open, step]);

  if (choosing) {
    const options = [
      { key: "page", icon: ListChecks, title: "Page tips", detail: describe(choice.page.length, "What is on this page, written for your role."), steps: choice.page },
      { key: "layout", icon: LayoutDashboard, title: "Layout tips", detail: describe(choice.layout.length, "Navigation, mode switching, and search."), steps: choice.layout },
      { key: "all", icon: Sparkles, title: "Everything", detail: describe(choice.layout.length + choice.page.length, "The full walkthrough."), steps: [...choice.layout, ...choice.page] },
    ];

    return createPortal(<motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button type="button" aria-label="Close tips" className="absolute inset-0 cursor-default bg-black/60" onClick={close} />
      <motion.section role="dialog" aria-modal="true" aria-label="Choose tips" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button type="button" aria-label="Close tips" onClick={close} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        <h2 className="font-semibold text-foreground">What would you like tips on?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a walkthrough. You can reopen this any time from the help control.</p>
        <div className="mt-4 space-y-2">
          {options.map((option) => (
            <button key={option.key} type="button" disabled={option.steps.length === 0} onClick={() => run(option.steps)} className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent">
              <span className="flex-none rounded-lg bg-primary/10 p-2 text-primary"><option.icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{option.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>, document.body);
  }

  if (!open || !step) return null;
  const cardWidth = Math.min(320, window.innerWidth - 32);
  const desiredLeft = rect ? rect.left + rect.width / 2 - cardWidth / 2 : window.innerWidth / 2 - cardWidth / 2;
  const left = Math.max(16, Math.min(desiredLeft, window.innerWidth - cardWidth - 16));
  const below = rect ? rect.top + rect.height + 16 : 96;
  const top = below + 220 < window.innerHeight ? below : Math.max(80, (rect?.top ?? 300) - 236);

  return createPortal(<motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <svg className="pointer-events-none absolute inset-0 h-full w-full"><defs><mask id="aito-layout-tour-mask"><rect width="100%" height="100%" fill="white" />{rect && <rect x={rect.left - 8} y={rect.top - 8} width={rect.width + 16} height={rect.height + 16} rx="12" fill="black" />}</mask></defs><rect width="100%" height="100%" fill="rgba(0,0,0,.62)" mask="url(#aito-layout-tour-mask)" /></svg>
    {rect && <div className="pointer-events-none absolute rounded-xl ring-2 ring-primary" style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }} />}
    <button type="button" aria-label="Close tour" className="absolute inset-0 cursor-default" onClick={close} />
    <motion.section key={index} role="dialog" aria-modal="true" aria-label="Application tour" className="absolute rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl" style={{ width: cardWidth, top, left }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={event => event.stopPropagation()}>
      <button type="button" aria-label="Close tour" onClick={close} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      <p className="mb-1 text-xs font-semibold text-primary">Step {index + 1} of {steps.length}</p>
      <h2 className="mb-1.5 font-semibold text-foreground">{step.title}</h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{step.content}</p>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setChoosing(true)} className="text-xs text-muted-foreground hover:text-foreground">Change tips</button>
        <div className="flex gap-2">{index > 0 && <Button type="button" variant="outline" size="sm" onClick={() => setIndex(value => value - 1)}><ArrowLeft className="h-3.5 w-3.5" />Back</Button>}<Button type="button" size="sm" onClick={() => index === steps.length - 1 ? close() : setIndex(value => value + 1)}>{index === steps.length - 1 ? "Done" : "Next"}{index < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}</Button></div>
      </div>
    </motion.section>
  </motion.div>, document.body);
}
