import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Check, Copy, Presentation, Target, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HuddlePresentationActivity, HuddlePresentationModel } from "../../types";

const sections = ["Overview", "AI Tools", "Benefits", "Activities", "Steps", "Resources"] as const;

interface HuddlePreviewDialogProps { open: boolean; model: HuddlePresentationModel; onClose: () => void; }

/** Displays the API-backed Huddle as the six-slide V5 preview experience. */
export function HuddlePreviewDialog({ open, model, onClose }: HuddlePreviewDialogProps) {
  const [slide, setSlide] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const activities = useMemo(() => model.phases.flatMap((phase) => phase.activities), [model.phases]);
  const primaryAgent = model.agents.primary[0] ?? activities.flatMap((activity) => activity.agents)[0] ?? null;
  const resources = useMemo(() => {
    const values = [...model.resources, ...activities.flatMap((activity) => activity.resources), ...(primaryAgent?.resources ?? [])];
    return [...new Map(values.map((resource) => [resource.externalId, resource])).values()].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [activities, model.resources, primaryAgent]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [model.identity.externalId, onClose, open]);

  if (!open) return null;
  const copyPrompt = async (activity: HuddlePresentationActivity) => {
    if (!activity.prompt) return;
    await navigator.clipboard.writeText(activity.prompt);
    setCopiedPrompt(activity.externalId);
    window.setTimeout(() => setCopiedPrompt(null), 1500);
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="huddle-preview-title" className="flex h-[650px] max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-white shadow-2xl [font-family:'Segoe_UI_Variable','Segoe_UI',Arial,sans-serif]">
      <header className="flex flex-shrink-0 items-center gap-2 border-b px-6 py-4"><Presentation className="h-5 w-5 flex-shrink-0 text-[#0F6CBD]" /><h2 id="huddle-preview-title" className="min-w-0 truncate text-lg font-semibold">{model.identity.name}</h2><span className="ml-1 whitespace-nowrap text-sm text-[#616161]">— slide {slide + 1} of {sections.length}</span><button type="button" onClick={onClose} aria-label="Close preview" className="ml-auto rounded-md p-1.5 hover:bg-[#F5F9FF]"><X className="h-4 w-4" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-20 pt-6"><article key={slide} className="flex min-h-full flex-col gap-4 rounded-xl border border-[#0F6CBD]/20 bg-gradient-to-br from-[#0F6CBD]/[0.05] to-transparent p-5"><span className="w-fit rounded-lg bg-[#0F6CBD] px-3 py-1 text-sm font-semibold text-white">{model.identity.name}</span>{slide === 0 && <OverviewSlide model={model} />}{slide === 1 && <AgentSlide model={model} agent={primaryAgent} />}{slide === 2 && <BenefitsSlide benefits={primaryAgent?.keyBenefits ?? []} />}{slide === 3 && <ActivitiesSlide activities={activities} copiedPrompt={copiedPrompt} onCopy={copyPrompt} />}{slide === 4 && <StepsSlide agentName={primaryAgent?.displayLabel ?? primaryAgent?.name ?? null} />}{slide === 5 && <ResourcesSlide model={model} resources={resources} />}</article></div>
      <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t bg-white px-6 py-3"><button type="button" disabled={slide === 0} onClick={() => setSlide((value) => Math.max(0, value - 1))} className="h-9 rounded-md border px-4 text-sm font-semibold hover:bg-[#F5F9FF] disabled:opacity-40">Previous</button><div className="min-w-0 overflow-x-auto"><div className="flex items-center gap-1 border-b-4 border-[#D7E9FA] px-1">{sections.map((section, index) => <button key={section} type="button" onClick={() => setSlide(index)} className={cn("whitespace-nowrap rounded-t px-2 py-1 text-xs", slide === index ? "bg-[#0F6CBD] font-semibold text-white" : "text-[#616161] hover:text-[#242424]")}>{section}</button>)}</div></div><button type="button" disabled={slide === sections.length - 1} onClick={() => setSlide((value) => Math.min(sections.length - 1, value + 1))} className="h-9 rounded-md border px-4 text-sm font-semibold hover:bg-[#F5F9FF] disabled:opacity-40">Next</button></footer>
    </section>
  </div>;
}

function SlideTitle({ children }: { children: string }) { return <h3 className="text-xl font-bold">{children}</h3>; }
function Unavailable() { return <p className="text-sm text-[#616161]">Content unavailable.</p>; }
function OverviewSlide({ model }: { model: HuddlePresentationModel }) { const first = model.phases.flatMap((phase) => phase.activities)[0]; return <><SlideTitle>Overview</SlideTitle><div className="space-y-4"><PreviewSection icon={<Users className="h-4 w-4" />} title="Use Case / Activity" value={model.narrative.useCase} detail={first?.name ?? null} /><PreviewSection icon={<Check className="h-4 w-4" />} title="Why it matters" value={model.narrative.whyItMatters} /><PreviewSection icon={<Target className="h-4 w-4" />} title="Desired Outcome" value={model.narrative.desiredOutcome} /></div></>; }
function PreviewSection({ icon, title, value, detail }: { icon: ReactNode; title: string; value: string | null; detail?: string | null }) { return <section className="border-b pb-4 last:border-0 last:pb-0"><div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F6CBD]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F2FF]">{icon}</span>{title}</div>{detail && <p className="mb-1 text-sm font-semibold">{detail}</p>}{value ? <p className="text-sm leading-relaxed">{value}</p> : <Unavailable />}</section>; }
function AgentSlide({ model, agent }: { model: HuddlePresentationModel; agent: HuddlePresentationModel["agents"]["primary"][number] | null }) { return <><SlideTitle>{agent?.displayLabel ?? agent?.name ?? "AI Tools"}</SlideTitle>{agent ? <div className="space-y-4"><TextBlock title="What it is" value={agent.whatItIs} /><TextBlock title="What it helps you do" value={agent.whatItHelpsYouDo} /><TextBlock title="When to use it" value={agent.whenToUseIt} /></div> : <Unavailable />}{model.agents.secondary.length > 0 && <TextBlock title="Supporting AI tools" value={model.agents.secondary.map((item) => item.displayLabel ?? item.name).join(", ")} />}</>; }
function TextBlock({ title, value }: { title: string; value: string | null }) { return <section className="border-b pb-4 last:border-0"><h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#616161]">{title}</h4>{value ? <p className="text-sm leading-relaxed">{value}</p> : <Unavailable />}</section>; }
function BenefitsSlide({ benefits }: { benefits: readonly string[] }) { return <><SlideTitle>Key Benefits</SlideTitle>{benefits.length ? <ul className="space-y-2">{benefits.map((benefit, index) => <li key={`${benefit}-${index}`} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F6CBD]" />{benefit}</li>)}</ul> : <Unavailable />}</>; }
function ActivitiesSlide({ activities, copiedPrompt, onCopy }: { activities: readonly HuddlePresentationActivity[]; copiedPrompt: string | null; onCopy: (activity: HuddlePresentationActivity) => void }) { return <><SlideTitle>Activities &amp; Recommended Prompts</SlideTitle>{activities.length ? <div className="space-y-3">{activities.map((activity) => <section key={activity.externalId} className="rounded-lg border bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{activity.name}</p>{activity.description && <p className="mt-1 text-xs leading-relaxed text-[#616161]">{activity.description}</p>}</div>{activity.agents[0] && <span className="flex-shrink-0 rounded-full border px-2 py-1 text-[10px]">{activity.agents[0].displayLabel ?? activity.agents[0].name}</span>}</div>{activity.prompt && <div className="mt-3 overflow-hidden rounded-lg border border-zinc-700"><div className="flex items-center justify-between border-b border-zinc-700 bg-black px-3 py-2"><span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Recommended Prompt</span><button type="button" onClick={() => void onCopy(activity)} aria-label={`Copy prompt for ${activity.name}`} className="rounded p-1 text-white hover:bg-zinc-800">{copiedPrompt === activity.externalId ? <Check className="h-3.5 w-3.5 text-[#8DC8E8]" /> : <Copy className="h-3.5 w-3.5" />}</button></div><p className="whitespace-pre-wrap bg-black px-3 py-3 text-sm leading-relaxed text-white">{activity.prompt}</p></div>}</section>)}</div> : <Unavailable />}</>; }
function StepsSlide({ agentName }: { agentName: string | null }) { return <><SlideTitle>Steps to Get Started</SlideTitle>{agentName && <p className="-mt-2 text-sm text-[#616161]">Tool: <span className="font-medium text-[#242424]">{agentName}</span></p>}<Unavailable /><p className="text-xs text-[#616161]">Steps remain empty until the approved semantic source is available.</p></>; }
function ResourcesSlide({ model, resources }: { model: HuddlePresentationModel; resources: readonly HuddlePresentationModel["resources"][number][] }) { return <><SlideTitle>Resources &amp; Looking Forward</SlideTitle>{resources.length ? <div className="grid gap-3 sm:grid-cols-2">{resources.map((resource) => <section key={resource.externalId} className="rounded-lg border bg-white/60 p-3"><p className="text-sm font-semibold text-[#0F6CBD]">{resource.title}</p>{resource.description && <p className="mt-1 text-xs leading-relaxed text-[#616161]">{resource.description}</p>}{resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0F6CBD] hover:underline">{resource.linkLabel ?? "Open resource"}<ArrowRight className="h-3 w-3" /></a>}</section>)}</div> : <Unavailable />}<TextBlock title="Reflect" value={model.reflectionPrompt} /><TextBlock title="Commit" value={model.commitmentPrompt} /></>; }
