import { useState } from "react";
import { BookOpen, Clock, Download, ExternalLink, Eye, FileDown, Layers3, ListChecks, Presentation, Sparkles, UserRound } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { HuddleDetailResponse } from "../../types";

type DetailTab = "overview" | "resources" | "takeaways";

interface HuddleDetailPanelProps {
  data: HuddleDetailResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  hasSelection: boolean;
  exportPending?: boolean;
  onRetry: () => void;
  onOpenWorkspace: () => void;
  onPreview: () => void;
  onExportHtml: () => void;
  onExportPowerPoint: () => void;
  onMeetCoach: () => void;
}

export function HuddleDetailPanel({ data, isLoading, error, hasSelection, exportPending = false, onRetry, onOpenWorkspace: openWorkspace, onPreview, onExportHtml, onExportPowerPoint, onMeetCoach }: HuddleDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const onOpenWorkspace = openWorkspace;

  if (!hasSelection) {
    return <aside className="w-full self-start rounded-xl border bg-white px-6 py-10 text-center shadow-sm"><span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F2F1]"><Presentation className="h-5 w-5 text-[#605E5C]" /></span><p className="font-semibold">Select a Huddle</p><p className="mx-auto mt-1 max-w-[230px] text-sm leading-5 text-muted-foreground">Review the outcome, resources, and actions before generating your session.</p></aside>;
  }

  if (isLoading) return <aside className="rounded-xl border bg-white"><LoadingSpinner message="Loading Huddle details..." /></aside>;
  if (error) return <aside><ErrorState title="Unable to load Huddle" message={error.message} onRetry={onRetry} /></aside>;
  if (!data) return null;

  const activityCount = data.phases.reduce((total, phase) => total + phase.activities.length, 0);
  const tools = [...data.primaryAgents, ...data.secondaryAgents];
  const resources = [...data.topicResources, ...data.phases.flatMap((phase) => phase.activities.flatMap((activity) => activity.resources))]
    .filter((resource, index, all) => all.findIndex((candidate) => candidate.externalId === resource.externalId) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const takeaways = [data.keyTakeaway, data.reflectionPrompt, data.commitmentPrompt].filter((value): value is string => Boolean(value));

  return <aside className="w-full self-start overflow-visible rounded-xl border bg-white shadow-sm [font-family:'Segoe_UI_Variable','Segoe_UI',Arial,sans-serif]">
    <header className="space-y-4 rounded-t-xl border-b bg-gradient-to-br from-[#F8FBFF] via-white to-[#F3FAF3] p-5">
      <div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">Selected Huddle</span></div><h2 className="text-xl font-bold leading-7 text-[#242424]">{data.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{data.description ?? "Description unavailable."}</p></div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{data.durationMinutes ?? 30} min</span><span className="flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" />{data.phases.length} phases</span><span className="flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" />{activityCount} activities</span></div>
    </header>

    <div className="flex border-b px-3 pt-2" role="tablist" aria-label="Huddle details">{(["overview", "resources", "takeaways"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={cn("relative px-3 py-2.5 text-sm font-medium capitalize transition-colors", activeTab === tab ? "text-[#0F6CBD]" : "text-muted-foreground hover:text-foreground")}>{tab}{activeTab === tab && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#0F6CBD]" />}</button>)}</div>

    <div className="min-h-[245px] p-4">
      {activeTab === "overview" && <div className="space-y-4"><section><p className="text-xs font-medium uppercase tracking-wide text-[#424242]">Outcome</p><p className="mt-1 text-sm leading-6">{data.desiredOutcome ?? "Content unavailable"}</p></section><section><p className="text-xs font-medium uppercase tracking-wide text-[#424242]">Today's objective</p><p className="mt-1 text-sm leading-6">{data.todayObjective ?? "Content unavailable"}</p></section><section><p className="text-xs font-medium uppercase tracking-wide text-[#424242]">AI tools</p>{tools.length ? <div className="mt-2 flex flex-wrap gap-2">{tools.map((tool) => <span key={`${tool.usageType}-${tool.externalId}`} className="rounded-full border border-[#0F6CBD]/25 bg-[#F5F9FF] px-2.5 py-1 text-xs font-medium text-[#0F6CBD]">{tool.name}</span>)}</div> : <p className="mt-1 text-sm text-muted-foreground">Content unavailable</p>}</section></div>}
      {activeTab === "resources" && <div className="space-y-2"><p className="mb-3 text-sm text-muted-foreground">Approved links open in a new tab.</p>{resources.length ? resources.map((resource) => resource.url ? <a key={resource.externalId} href={resource.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-[#0F6CBD]/40 hover:bg-[#F5F9FF]"><span className="rounded-md bg-[#E8F2FF] p-2 text-[#0F6CBD]"><BookOpen className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{resource.title}</strong>{resource.description && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{resource.description}</span>}</span><ExternalLink className="mt-1 h-4 w-4 text-muted-foreground" /></a> : <div key={resource.externalId} className="rounded-lg border p-3 text-sm"><strong>{resource.title}</strong><p className="mt-1 text-xs text-muted-foreground">Link not yet available.</p></div>) : <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">No approved resources are mapped yet.</div>}</div>}
      {activeTab === "takeaways" && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">After this Huddle</p>{takeaways.length ? <ul className="mt-3 space-y-2">{takeaways.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#0F6CBD]" />{item}</li>)}</ul> : <div className="mt-3 rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Content unavailable</div>}</div>}
    </div>

    <footer className="border-t p-3"><button type="button" onClick={onOpenWorkspace} className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0F6CBD] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#115EA3]"><Sparkles className="mr-2 h-4 w-4" />Generate Huddle</button><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={onPreview} className="inline-flex h-9 items-center justify-center rounded-md border bg-white text-sm font-semibold hover:bg-[#F5F9FF]"><Eye className="mr-1.5 h-4 w-4" />Preview</button><button type="button" disabled={exportPending} onClick={onExportPowerPoint} className="inline-flex h-9 items-center justify-center rounded-md border bg-white text-sm font-semibold hover:bg-[#F5F9FF] disabled:opacity-50"><Download className="mr-1.5 h-4 w-4" />PPT</button><button type="button" onClick={onExportHtml} className="inline-flex h-9 items-center justify-center rounded-md border bg-white text-sm font-semibold hover:bg-[#F5F9FF]"><FileDown className="mr-1.5 h-4 w-4" />HTML</button><button type="button" onClick={onMeetCoach} className="inline-flex h-9 items-center justify-center rounded-md border bg-white text-sm font-semibold hover:bg-[#F5F9FF]"><UserRound className="mr-1.5 h-4 w-4" />Coach</button></div></footer>
  </aside>;
}
