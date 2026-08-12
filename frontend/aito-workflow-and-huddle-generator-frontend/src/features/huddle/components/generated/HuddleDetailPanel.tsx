import { Presentation } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import type { HuddleDetailResponse } from "../../types";

interface HuddleDetailPanelProps {
  data: HuddleDetailResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  hasSelection: boolean;
  onRetry: () => void;
  onOpenWorkspace: () => void;
}

export function HuddleDetailPanel({ data, isLoading, error, hasSelection, onRetry, onOpenWorkspace }: HuddleDetailPanelProps) {
  if (!hasSelection) {
    return <aside className="w-full self-start rounded-xl border bg-white p-10 text-center shadow-sm lg:sticky lg:top-24"><span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F2F1]"><Presentation className="h-5 w-5 text-[#605E5C]" /></span><p className="font-semibold">Select a Huddle</p><p className="mx-auto mt-1 max-w-[230px] text-sm text-muted-foreground">Review the outcome, resources, and actions before generating your session.</p></aside>;
  }

  if (isLoading) return <aside className="rounded-xl border bg-white"><LoadingSpinner message="Loading Huddle details..." /></aside>;
  if (error) return <aside><ErrorState title="Unable to load Huddle" message={error.message} onRetry={onRetry} /></aside>;
  if (!data) return null;

  return (
    <aside className="w-full self-start overflow-hidden rounded-xl border bg-white shadow-sm lg:sticky lg:top-24">
      <div className="border-b bg-[#F5F9FF] p-5"><span className="rounded border border-[#0F6CBD]/20 bg-[#E8F2FF] px-2 py-1 text-[10px] font-semibold text-[#0F6CBD]">{data.type}</span><h2 className="mt-3 text-xl font-bold">{data.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{data.description ?? "Description unavailable."}</p></div>
      <div className="space-y-5 p-5">
        <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today's Objective</p><p className="mt-1 text-sm">{data.todayObjective ?? "Unavailable"}</p></section>
        <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Desired Outcome</p><p className="mt-1 text-sm">{data.desiredOutcome ?? "Unavailable"}</p></section>
        <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Huddle Flow</p><p className="mt-1 text-sm">{data.phases.length} phases · {data.phases.reduce((total, phase) => total + phase.activities.length, 0)} activities</p></section>
        {data.contentAvailability.missingFields.length > 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Some client content is not yet available. Missing fields remain intentionally empty.</p>}
        <Button type="button" onClick={onOpenWorkspace} className="w-full bg-[#0F6CBD] text-white hover:bg-[#115EA3]">Open Huddle Workspace</Button>
      </div>
    </aside>
  );
}
