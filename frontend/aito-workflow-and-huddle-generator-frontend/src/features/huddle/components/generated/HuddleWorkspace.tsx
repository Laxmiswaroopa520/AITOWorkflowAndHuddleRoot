import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileDown,
  FileText,
  Home,
  Layers,
  ListChecks,
  MessageSquare,
  PanelLeftClose,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  HuddlePresentationActivity,
  HuddlePresentationModel,
  HuddlePresentationResource,
  HuddleSessionResponse,
} from "../../types";
import { HuddleTalkTrackPanel } from "../talk-track";
import { createHuddleSessionProgressSummary } from "../progress/huddleSessionProgress";

type WorkspaceSection = "overview" | "activities" | "resources";

interface HuddleWorkspaceProps {
  model: HuddlePresentationModel;
  session: HuddleSessionResponse | null | undefined;
  sessionLoading: boolean;
  sessionError: Error | null;
  mutationPending: boolean;
  onRefreshSession: () => Promise<HuddleSessionResponse | null | undefined>;
  onSaveSession: (currentPhaseExternalId: string | null, facilitatorNotes: string | null) => Promise<HuddleSessionResponse>;
  onSetActivityCompletion: (activityExternalId: string, isCompleted: boolean, currentPhaseExternalId: string | null, facilitatorNotes: string | null) => Promise<HuddleSessionResponse>;
  onCompleteSession: () => Promise<HuddleSessionResponse>;
  onMeetCoach: () => void;
  onClose: () => void;
}

function OptionalContent({ value }: { value: string | null }) {
  return value ? <p className="mt-2 text-sm leading-6 text-[#424242]">{value}</p> : <p className="mt-2 text-sm text-[#707070]">Content unavailable</p>;
}

function ResourceLink({ resource }: { resource: HuddlePresentationResource }) {
  const content = <><BookOpen className="h-4 w-4" /><span>{resource.title}</span>{resource.url && <ExternalLink className="h-3.5 w-3.5" />}</>;
  const className = "inline-flex items-center gap-2 rounded-md border border-[#d1d1d1] bg-white px-3 py-2 text-sm text-[#0f6cbd] hover:bg-[#f5f9ff]";
  return resource.url ? <a className={className} href={resource.url} target="_blank" rel="noreferrer">{content}</a> : <span className={cn(className, "cursor-default text-[#616161] hover:bg-white")}>{content}</span>;
}

function ActivityCard({ activity, ordinal, completed, disabled, onToggle }: { activity: HuddlePresentationActivity; ordinal: number; completed: boolean; disabled: boolean; onToggle: () => void }) {
  const primaryAgent = activity.agents[0];
  const secondaryAgents = activity.agents.slice(1);
  return (
    <article className="rounded-xl border border-[#dfe3e8] bg-white shadow-sm">
      <div className="flex items-start gap-4 p-5">
        <button type="button" disabled={disabled} onClick={onToggle} aria-label={completed ? "Mark activity incomplete" : "Mark activity complete"} aria-pressed={completed} className={cn("group/complete mt-0.5 flex flex-shrink-0 flex-col items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60", completed ? "text-[#0F6CBD]" : "text-[#616161] hover:bg-[#F5F9FF] hover:text-[#0F6CBD]")}><span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all", completed ? "border-[#0F6CBD] bg-[#0F6CBD] text-white" : "border-[#0F6CBD] bg-white text-[#0F6CBD] group-hover/complete:bg-[#E8F2FF]")}><Check className={cn("h-4 w-4", !completed && "opacity-55")} /></span><span>{completed ? "Completed" : "Complete"}</span></button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#707070]">Activity {ordinal}</p><h4 className="text-base font-semibold text-[#242424]">{activity.name}</h4>
              <OptionalContent value={activity.description} />
            </div>
            {primaryAgent?.showAccessLink && primaryAgent.accessUrl && <Button asChild variant="outline" size="sm" className="border-[#b5d5f0] bg-[#f5f9ff] text-[#0f6cbd] hover:bg-[#e8f2ff]"><a href={primaryAgent.accessUrl} target="_blank" rel="noreferrer"><Bot className="mr-2 h-4 w-4" />Open in {primaryAgent.name}<ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#707070]">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.durationMinutes === null ? "Duration unavailable" : `${activity.durationMinutes} min`}</span>
            {primaryAgent && <span className="rounded border border-[#0f6cbd]/25 bg-[#e8f2ff] px-2 py-1 text-[#0f6cbd]">AI Tool: {primaryAgent.name}</span>}
            {secondaryAgents.map((agent) => <span key={agent.externalId} className="rounded border px-2 py-1">{agent.name}</span>)}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ActivityField label="Prompt" value={activity.prompt} featured />
            <ActivityField label="Expected output" value={activity.expectedOutput} />
            <ActivityField label="Human checkpoint" value={activity.humanCheckpoint} />
            <ActivityField label="Required context" value={activity.requiredContext} />
            <ActivityField label="Best-fit job" value={activity.bestFitJob} />
          </div>
          {activity.resources.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#616161]">Resources</p><div className="flex flex-wrap gap-2">{activity.resources.map((resource) => <ResourceLink key={resource.externalId} resource={resource} />)}</div></div>}
        </div>
      </div>
    </article>
  );
}

function ActivityField({ label, value, featured = false }: { label: string; value: string | null; featured?: boolean }) {
  if (!value) return null;
  return <section className={cn("rounded-lg border px-4 py-3", featured ? "border-[#b5d5f0] bg-[#f5f9ff] md:col-span-2" : "border-[#e1e4e8] bg-[#fbfbfb]")}><p className="text-xs font-semibold uppercase tracking-wide text-[#616161]">{label}</p><p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#242424]">{value}</p></section>;
}

export function HuddleWorkspace({ model, session, sessionLoading, sessionError, mutationPending, onRefreshSession, onSaveSession, onSetActivityCompletion, onCompleteSession, onMeetCoach, onClose }: HuddleWorkspaceProps) {
  const [section, setSection] = useState<WorkspaceSection>(model.phases.length > 0 ? "activities" : "overview");
  const [activePhaseId, setActivePhaseId] = useState<string | null>(() =>
    session?.currentPhaseExternalId && model.phases.some((phase) => phase.externalId === session.currentPhaseExternalId)
      ? session.currentPhaseExternalId
      : model.phases[0]?.externalId ?? null);
  const [guideCollapsed, setGuideCollapsed] = useState(false);
  const [notes, setNotes] = useState(session?.facilitatorNotes ?? "");
  const [talkTrackOpen, setTalkTrackOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const activePhase = model.phases.find((phase) => phase.externalId === activePhaseId) ?? model.phases[0] ?? null;
  const activityCount = useMemo(() => model.phases.reduce((total, phase) => total + phase.activities.length, 0), [model.phases]);
  const agents = useMemo(() => {
    const unique = new Map([...model.agents.primary, ...model.agents.secondary].map((agent) => [agent.externalId, agent]));
    model.phases.forEach((phase) => phase.activities.forEach((activity) => activity.agents.forEach((agent) => unique.set(agent.externalId, agent))));
    return [...unique.values()];
  }, [model]);
  const allResources = useMemo(() => {
    const unique = new Map(model.resources.map((resource) => [resource.externalId, resource]));
    model.phases.forEach((phase) => phase.activities.forEach((activity) => activity.resources.forEach((resource) => unique.set(resource.externalId, resource))));
    return [...unique.values()].sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));
  }, [model]);
  const progressSummary = useMemo(() => createHuddleSessionProgressSummary(session, activityCount), [activityCount, session]);

  const saveProgress = async () => {
    setFeedback(null);
    try {
      await onSaveSession(activePhaseId, notes || null);
      setFeedback({ kind: "success", message: "Progress saved." });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to save progress." });
    }
  };

  const toggleActivity = async (activityExternalId: string, isCompleted: boolean) => {
    setFeedback(null);
    try {
      await onSetActivityCompletion(activityExternalId, isCompleted, activePhaseId, notes || null);
      setFeedback({ kind: "success", message: isCompleted ? "Activity marked complete." : "Activity marked incomplete." });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to update the activity." });
    }
  };

  const completeHuddle = async () => {
    setFeedback(null);
    try {
      await onCompleteSession();
      setFeedback({ kind: "success", message: "Huddle completed successfully." });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to complete the Huddle." });
    }
  };

  const refreshSession = async () => {
    const refreshed = await onRefreshSession();
    if (!refreshed) return;
    setNotes(refreshed.facilitatorNotes ?? "");
    if (refreshed.currentPhaseExternalId && model.phases.some((phase) => phase.externalId === refreshed.currentPhaseExternalId)) {
      setActivePhaseId(refreshed.currentPhaseExternalId);
    }
    setFeedback({ kind: "success", message: "Progress refreshed." });
  };

  const downloadPowerPoint = async () => {
    setFeedback(null);
    setExporting(true);
    try {
      const { exportHuddlePowerPoint } = await import("../../exports/powerpoint");
      await exportHuddlePowerPoint(model);
      setFeedback({ kind: "success", message: "PowerPoint exported." });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to export the PowerPoint." });
    } finally {
      setExporting(false);
    }
  };

  const downloadHtml = async () => {
    setFeedback(null);
    setExportingHtml(true);
    try {
      const { exportHuddleHtml } = await import("../../exports/html");
      exportHuddleHtml(model);
      setFeedback({ kind: "success", message: "HTML exported." });
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Unable to export HTML." });
    } finally {
      setExportingHtml(false);
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${model.identity.name} workspace`} className="fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-hidden bg-[#f7f8fa] text-[#242424]">
      <header className="flex flex-shrink-0 items-center border-b border-[#e1e4e8] bg-white px-4 py-3 lg:px-5">
        <div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose} aria-label="Exit generated Huddle"><X className="h-4 w-4" /></Button><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold lg:text-xl">{model.identity.name}</h2><span className="rounded border border-[#0f6cbd]/25 bg-[#e8f2ff] px-2 py-1 text-xs font-semibold text-[#0f6cbd]">{model.identity.type}</span></div>{model.identity.description && <p className="hidden truncate text-sm text-[#616161] sm:block">{model.identity.description}</p>}</div></div>
        <Button size="sm" disabled={!progressSummary.canComplete || mutationPending} title={progressSummary.canComplete ? undefined : "Complete every current activity first"} onClick={() => void completeHuddle()} className="ml-auto flex-shrink-0 bg-[#0f6cbd] text-white hover:bg-[#115ea3]"><CheckCircle2 className="mr-2 h-4 w-4" />Complete Huddle</Button>
      </header>
      <div className="flex flex-shrink-0 items-center gap-2 overflow-x-auto border-b border-[#e1e4e8] bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2 overflow-x-auto">{[{ label: "Duration", value: model.identity.durationMinutes === null ? "Unavailable" : `${model.identity.durationMinutes} min`, icon: Clock }, { label: "Phases", value: String(model.phases.length), icon: Layers }, { label: "Activities", value: String(activityCount), icon: ListChecks }, { label: "AI tools", value: String(agents.length), icon: Bot }].map(({ label, value, icon: Icon }) => <div key={label} className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-[#e1e4e8] bg-white px-3 py-2"><Icon className="h-4 w-4 text-[#0f6cbd]" /><div><p className="text-sm font-semibold">{value}</p><p className="text-[10px] uppercase tracking-wide text-[#707070]">{label}</p></div></div>)}<div className="ml-2 hidden min-w-[220px] lg:block"><div className="mb-1 flex justify-between text-xs text-[#616161]"><span>{progressSummary.completedCount} of {progressSummary.totalCount} activities complete</span><span>{progressSummary.percentage}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#e8eaed]"><div className="h-full rounded-full bg-[#0f6cbd] transition-all" style={{ width: `${progressSummary.percentage}%` }} /></div></div></div>
      </div>
      <div className={cn("relative grid min-h-0 flex-1", guideCollapsed ? "lg:grid-cols-[64px_minmax(0,1fr)_300px]" : "lg:grid-cols-[232px_minmax(0,1fr)_300px]")}>
        <aside className="hidden min-h-0 flex-col border-r border-[#e1e4e8] bg-white lg:flex"><div className="flex items-center justify-between px-4 py-4">{!guideCollapsed && <p className="text-sm font-semibold">Huddle Guide</p>}<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGuideCollapsed((value) => !value)} aria-label="Toggle Huddle Guide"><PanelLeftClose className={cn("h-4 w-4 transition-transform", guideCollapsed && "rotate-180")} /></Button></div><nav className="space-y-1 px-2"><WorkspaceNavButton active={section === "overview"} collapsed={guideCollapsed} icon={<Home className="h-4 w-4" />} label="Overview" onClick={() => setSection("overview")} />{!guideCollapsed && <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-[#707070]">Huddle Flow</p>}{model.phases.map((phase, index) => <button key={phase.externalId} type="button" onClick={() => { setActivePhaseId(phase.externalId); setSection("activities"); }} className={cn("flex w-full items-start gap-3 rounded-md border-l-2 px-3 py-3 text-left transition-colors", section === "activities" && activePhase?.externalId === phase.externalId ? "border-[#0f6cbd] bg-[#eef6fc] text-[#0f6cbd]" : "border-transparent text-[#424242] hover:bg-[#f3f3f3]")}><span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold">{index + 1}</span>{!guideCollapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{phase.name}</p><p className="mt-1 text-xs text-[#707070]">{phase.durationMinutes === null ? "Duration unavailable" : `${phase.durationMinutes} min`} · {phase.activities.length}</p></div>}</button>)}</nav><div className="mt-auto border-t border-[#e1e4e8] p-2"><WorkspaceNavButton active={section === "resources"} collapsed={guideCollapsed} icon={<BookOpen className="h-4 w-4" />} label="Resources" onClick={() => setSection("resources")} /></div></aside>
        <button type="button" onClick={() => setTalkTrackOpen(true)} style={{ writingMode: "vertical-rl" }} className={cn("absolute top-10 z-20 hidden h-28 w-9 items-center justify-center gap-2 rounded-r-md border border-l-0 border-[#C7E0F4] text-xs font-semibold shadow-sm transition-colors lg:flex", guideCollapsed ? "left-16" : "left-[232px]", talkTrackOpen ? "bg-[#0F6CBD] text-white" : "bg-[#F5F9FF] text-[#0F6CBD] hover:bg-[#E8F2FF]")}><MessageSquare className="h-4 w-4" /><span>Talk Track</span></button>
        <main className="min-h-0 overflow-y-auto px-4 py-5 lg:py-6 lg:pl-12 lg:pr-7">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden"><MobileNav label="Overview" active={section === "overview"} onClick={() => setSection("overview")} /><MobileNav label="Talk Track" active={talkTrackOpen} onClick={() => setTalkTrackOpen(true)} /><MobileNav label="Activities" active={section === "activities"} onClick={() => setSection("activities")} /><MobileNav label="Resources" active={section === "resources"} onClick={() => setSection("resources")} /></div>
          {section === "overview" && <Overview model={model} />}
          {sessionError && <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><span>{"status" in sessionError && sessionError.status === 409 ? "Progress changed elsewhere. Refresh before retrying." : sessionError.message}</span><Button variant="outline" size="sm" onClick={() => void refreshSession()}>Refresh</Button></div>}
          {feedback && <div role="status" className={cn("mb-4 rounded-lg border p-3 text-sm", feedback.kind === "success" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900")}>{feedback.message}</div>}
          {(session?.removedActivityExternalIds.length ?? 0) > 0 && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{session!.removedActivityExternalIds.length} saved activity record(s) no longer belong to the current Huddle and were excluded from progress.</p>}
          {section === "activities" && <Activities model={model} activePhase={activePhase} activePhaseId={activePhaseId} completedActivityIds={progressSummary.completedActivityIds} mutationPending={mutationPending} onPhaseChange={setActivePhaseId} onToggle={(activityExternalId, isCompleted) => void toggleActivity(activityExternalId, isCompleted)} />}
          {section === "resources" && <Resources resources={allResources} />}
        </main>
        <aside className="hidden min-h-0 overflow-y-auto border-l border-[#e1e4e8] bg-[#fbfbfb] p-4 lg:block"><div className="space-y-4"><section className="rounded-xl border border-[#e1e4e8] bg-white p-4 shadow-sm"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-[#0f6cbd]" /><h3 className="font-semibold">My Notes</h3></div><span className="rounded border px-2 py-0.5 text-[10px]">Private</span></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add facilitator insights or follow-up actions..." className="min-h-[130px] w-full resize-y rounded-lg border border-[#d1d1d1] bg-[#fffdf2] p-3 text-sm outline-none focus:border-[#0f6cbd] focus:ring-1 focus:ring-[#0f6cbd]" /><p className="mt-2 text-[11px] text-[#707070]">Use Save Progress to persist these notes.</p></section>{model.keyTakeaway && <section className="rounded-xl border border-[#c7e0c9] bg-[#f3faf4] p-4"><p className="text-sm font-semibold text-[#0f6cbd]">Key takeaway</p><p className="mt-2 text-sm leading-6 text-[#424242]">{model.keyTakeaway}</p></section>}{agents.length > 0 && <section className="rounded-xl border border-[#c7e0f4] bg-[#f5f9ff] p-4"><p className="text-sm font-semibold">AI tools</p><div className="mt-3 flex flex-wrap gap-2">{agents.map((agent) => <span key={agent.externalId} className="rounded bg-white px-2 py-1 text-xs text-[#0f6cbd]">{agent.name}</span>)}</div></section>}</div></aside>
      </div>
      <footer className="flex flex-shrink-0 items-center gap-3 overflow-x-auto border-t border-[#e1e4e8] bg-white px-4 py-2.5 lg:px-5"><Button variant="ghost" className="flex-shrink-0" onClick={onClose}><ChevronLeft className="mr-2 h-4 w-4" />Exit to Huddle Library</Button><span className="ml-auto hidden flex-shrink-0 text-xs text-[#707070] xl:block">{session ? `Last saved ${new Date(session.lastSavedAtUtc).toLocaleString()}` : "Progress has not been saved yet."}</span><div className="flex flex-shrink-0 items-center gap-2"><Button variant="outline" size="sm" onClick={onMeetCoach}><UserRound className="mr-2 h-4 w-4" />Meet with a Coach</Button><Button variant="outline" size="sm" disabled={exportingHtml} onClick={() => void downloadHtml()}><FileDown className="mr-2 h-4 w-4" />{exportingHtml ? "Exporting..." : "HTML"}</Button><Button variant="outline" size="sm" disabled={exporting} onClick={() => void downloadPowerPoint()}><FileDown className="mr-2 h-4 w-4" />{exporting ? "Exporting..." : "PowerPoint"}</Button><Button variant="outline" size="sm" disabled={sessionLoading || mutationPending} onClick={() => void saveProgress()}><FileText className="mr-2 h-4 w-4" />{mutationPending ? "Saving..." : "Save Progress"}</Button></div></footer>
      {talkTrackOpen && <HuddleTalkTrackPanel guide={model.facilitatorGuide} onClose={() => setTalkTrackOpen(false)} />}
    </div>
  );
}

function WorkspaceNavButton({ active, collapsed, icon, label, onClick }: { active: boolean; collapsed: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-[#f3f3f3]", active ? "bg-[#e8f2ff] text-[#0f6cbd]" : "text-[#242424]")}>{icon}{!collapsed && <span>{label}</span>}</button>;
}

function MobileNav({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("rounded-md border px-3 py-2 text-sm", active ? "border-[#0f6cbd] bg-[#e8f2ff] text-[#0f6cbd]" : "bg-white")}>{label}</button>;
}

function Overview({ model }: { model: HuddlePresentationModel }) {
  return <div className="mx-auto max-w-4xl space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#0f6cbd]">Overview</p><h3 className="mt-1 text-2xl font-semibold">{model.identity.name}</h3><OptionalContent value={model.identity.description} /></div><div className="grid gap-4 md:grid-cols-2"><OverviewCard title="Today’s Objective" value={model.narrative.todayObjective} /><OverviewCard title="Use Case" value={model.narrative.useCase} /><OverviewCard title="Why It Matters" value={model.narrative.whyItMatters} /><OverviewCard title="Desired Outcome" value={model.narrative.desiredOutcome} /></div>{(model.audience.roleName || model.audience.audienceDescription) && <OverviewCard title="Audience" value={[model.audience.roleName, model.audience.audienceDescription].filter(Boolean).join(" — ")} />}{model.mcemStages.length > 0 && <section className="rounded-xl border border-[#dfe3e8] bg-white p-5"><h4 className="font-semibold">MCEM stages</h4><div className="mt-3 flex flex-wrap gap-2">{model.mcemStages.map((stage) => <span key={stage.externalId} className="rounded border border-[#0f6cbd]/20 bg-[#e8f2ff] px-3 py-1.5 text-sm text-[#0f6cbd]">{stage.name}</span>)}</div></section>}</div>;
}

function OverviewCard({ title, value }: { title: string; value: string | null }) {
  return <section className="min-h-[126px] rounded-xl border border-[#dfe3e8] bg-white p-5"><h4 className="font-semibold">{title}</h4><OptionalContent value={value} /></section>;
}

function Activities({ model, activePhase, activePhaseId, completedActivityIds, mutationPending, onPhaseChange, onToggle }: { model: HuddlePresentationModel; activePhase: HuddlePresentationModel["phases"][number] | null; activePhaseId: string | null; completedActivityIds: ReadonlySet<string>; mutationPending: boolean; onPhaseChange: (id: string) => void; onToggle: (activityExternalId: string, isCompleted: boolean) => void }) {
  if (!activePhase) return <Unavailable title="Huddle activities" />;
  return <div className="mx-auto max-w-4xl space-y-5"><div className="flex gap-2 overflow-x-auto lg:hidden">{model.phases.map((phase, index) => <button key={phase.externalId} type="button" onClick={() => onPhaseChange(phase.externalId)} className={cn("flex-shrink-0 rounded-full border px-3 py-1.5 text-sm", activePhaseId === phase.externalId ? "border-[#0f6cbd] bg-[#e8f2ff] text-[#0f6cbd]" : "bg-white")}>{index + 1}. {phase.name}</button>)}</div><div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f2ff] text-sm font-semibold text-[#0f6cbd]">{model.phases.findIndex((phase) => phase.externalId === activePhase.externalId) + 1}</span><h3 className="text-2xl font-semibold">{activePhase.name}</h3></div>{activePhase.description && <p className="ml-10 mt-1 text-sm text-[#616161]">{activePhase.description}</p>}</div>{activePhase.activities.length > 0 ? <div className="space-y-4">{activePhase.activities.map((activity, index) => <ActivityCard key={activity.externalId} activity={activity} ordinal={index + 1} completed={completedActivityIds.has(activity.externalId)} disabled={mutationPending} onToggle={() => onToggle(activity.externalId, !completedActivityIds.has(activity.externalId))} />)}</div> : <Unavailable title="Activities for this phase" />}</div>;
}

function Resources({ resources }: { resources: readonly HuddlePresentationResource[] }) {
  if (resources.length === 0) return <Unavailable title="Resources" />;
  return <div className="mx-auto max-w-4xl"><h3 className="text-2xl font-semibold">Resources</h3><p className="mt-1 text-sm text-[#616161]">Approved topic and activity resources for this Huddle.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{resources.map((resource) => <section key={resource.externalId} className="rounded-xl border border-[#dfe3e8] bg-white p-5"><p className="font-semibold">{resource.title}</p>{resource.description && <p className="mt-2 text-sm leading-6 text-[#616161]">{resource.description}</p>}<div className="mt-4"><ResourceLink resource={resource} /></div></section>)}</div></div>;
}

function Unavailable({ title }: { title: string }) {
  return <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-[#d1d1d1] bg-white p-10 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-[#707070]">Content unavailable</p></div>;
}
