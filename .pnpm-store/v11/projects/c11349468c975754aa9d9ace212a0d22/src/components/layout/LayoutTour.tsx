import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface TourStep { target: string; title: string; content: string }
interface TargetRect { top: number; left: number; width: number; height: number }

const tourSteps: TourStep[] = [
  { target: "brand", title: "AITO home", content: "Return to the application landing page from anywhere." },
  { target: "mode-toggle", title: "Choose your mode", content: "Switch between Workflow and Huddle while each module keeps its own experience." },
  { target: "saved-workflows", title: "My Workflows", content: "Open, update, copy, favorite, or delete workflows you saved." },
  { target: "global-search", title: "Search", content: "Find activities, prompts, and tools from the current experience." },
  { target: "help", title: "Help and guided tour", content: "Use this control to open the layout tour again at any time." },
  { target: "workflow-progress", title: "Workflow steps", content: "Move through role selection, activity selection, and your generated workflow." },
  { target: "role-selection", title: "Choose your role", content: "Filter the API-backed role catalog by segment and select the role that matches your work." },
  { target: "workflow-benefits", title: "What you will get", content: "Review how AITO builds relevant activities, AI-tool guidance, and a balanced schedule." },
];

/** Renders the reference spotlight tour as temporary UI state. */
export function LayoutTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const step = tourSteps[index];

  useEffect(() => {
    const start = () => { setIndex(0); setOpen(true); };
    window.addEventListener("aito:start-layout-tour", start);
    return () => window.removeEventListener("aito:start-layout-tour", start);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
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

  if (!open) return null;
  const cardWidth = Math.min(320, window.innerWidth - 32);
  const desiredLeft = rect ? rect.left + rect.width / 2 - cardWidth / 2 : window.innerWidth / 2 - cardWidth / 2;
  const left = Math.max(16, Math.min(desiredLeft, window.innerWidth - cardWidth - 16));
  const below = rect ? rect.top + rect.height + 16 : 96;
  const top = below + 220 < window.innerHeight ? below : Math.max(80, (rect?.top ?? 300) - 236);

  return createPortal(<motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <svg className="pointer-events-none absolute inset-0 h-full w-full"><defs><mask id="aito-layout-tour-mask"><rect width="100%" height="100%" fill="white" />{rect && <rect x={rect.left - 8} y={rect.top - 8} width={rect.width + 16} height={rect.height + 16} rx="12" fill="black" />}</mask></defs><rect width="100%" height="100%" fill="rgba(0,0,0,.62)" mask="url(#aito-layout-tour-mask)" /></svg>
    {rect && <div className="pointer-events-none absolute rounded-xl ring-2 ring-primary" style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }} />}
    <button type="button" aria-label="Close tour" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} />
    <motion.section key={index} role="dialog" aria-modal="true" aria-label="Application tour" className="absolute rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl" style={{ width: cardWidth, top, left }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={event => event.stopPropagation()}>
      <button type="button" aria-label="Close tour" onClick={() => setOpen(false)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      <p className="mb-1 text-xs font-semibold text-primary">Step {index + 1} of {tourSteps.length}</p>
      <h2 className="mb-1.5 font-semibold text-foreground">{step.title}</h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{step.content}</p>
      <div className="flex items-center justify-between"><button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Skip tour</button><div className="flex gap-2">{index > 0 && <Button type="button" variant="outline" size="sm" onClick={() => setIndex(value => value - 1)}><ArrowLeft className="h-3.5 w-3.5" />Back</Button>}<Button type="button" size="sm" onClick={() => index === tourSteps.length - 1 ? setOpen(false) : setIndex(value => value + 1)}>{index === tourSteps.length - 1 ? "Done" : "Next"}{index < tourSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}</Button></div></div>
    </motion.section>
  </motion.div>, document.body);
}
