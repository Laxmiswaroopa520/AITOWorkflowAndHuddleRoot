import { useState } from "react";
import { Download, MoreHorizontal, RefreshCcw, Route } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import type { HuddleCatalogItemResponse, HuddlePlanResponse, HuddleVoteResponse } from "../../types";
import { RecommendedPathCard } from "./RecommendedPathCard";

const PATH_WEEKS = [2, 3, 4, 5, 6, 7, 8] as const;

interface RecommendedPathProps {
  data?: HuddlePlanResponse;
  catalog: HuddleCatalogItemResponse[];
  isLoading: boolean;
  error: Error | null;
  mutationError: Error | null;
  selectedExternalId: string | null;
  hasRole: boolean;
  votes: Map<string, HuddleVoteResponse>;
  votePending: boolean;
  savePending: boolean;
  onSelect: (externalId: string) => void;
  onVote: (externalId: string, value: -1 | 1 | null) => void;
  onSave: (plan: HuddlePlanResponse) => void;
  onReset: () => void;
  onRetry: () => void;
}

async function exportPlan(plan: HuddlePlanResponse): Promise<void> {
  const { exportLearningPlanHtml } = await import("../../exports/html");
  exportLearningPlanHtml(plan);
}

export function RecommendedPath(props: RecommendedPathProps) {
  const [menuWeek, setMenuWeek] = useState<number | null>(null);

  if (!props.hasRole) {
    return <div className="rounded-xl border border-dashed border-[#8A8886] bg-white px-6 py-10 text-center"><Route className="mx-auto h-8 w-8 text-[#0F6CBD]" /><h3 className="mt-3 text-lg font-semibold">Select an audience to build the Recommended Path</h3><p className="mt-1 text-sm text-muted-foreground">Seven recommended Huddles will appear in Week 2–8 order.</p></div>;
  }
  if (props.isLoading) return <LoadingSpinner message="Loading recommended path..." />;
  if (props.error) return <ErrorState title="Unable to load Role Path" message={props.error.message} onRetry={props.onRetry} />;
  if (!props.data) return null;

  const update = (week: number, action: "up" | "down" | "reset", targetWeek?: number, replacement?: string) => {
    const ordered = [...props.data!.items].sort((left, right) => left.week - right.week);
    const recommendedByPosition = ordered.map((item) => item.recommendedHuddleExternalId);
    const index = ordered.findIndex((item) => item.week === week);
    if (index < 0) return;

    if (action === "reset") {
      const expected = recommendedByPosition[index];
      const huddle = props.catalog.find((item) => item.externalId === (replacement ?? expected));
      if (!huddle) return;
      ordered[index] = { ...ordered[index], huddle };
    } else {
      const targetIndex = targetWeek === undefined ? index + (action === "up" ? -1 : 1) : targetWeek - PATH_WEEKS[0];
      if (targetIndex < 0 || targetIndex >= ordered.length) return;
      const [moved] = ordered.splice(index, 1);
      ordered.splice(targetIndex, 0, moved);
    }

    const items = ordered.map((item, position) => ({
      ...item,
      week: PATH_WEEKS[position],
      recommendedHuddleExternalId: recommendedByPosition[position],
      isCustomized: item.huddle.externalId !== recommendedByPosition[position],
    }));
    props.onSave({ ...props.data!, isCustomized: items.some((item) => item.isCustomized), items });
    setMenuWeek(null);
  };

  return <section className="space-y-4 [font-family:'Segoe_UI_Variable','Segoe_UI',Arial,sans-serif]">
    <div className="flex flex-col gap-3 rounded-xl border border-[#C7E0F4] bg-[#F5F9FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Route className="h-5 w-5 text-[#0F6CBD]" /><h2 className="text-xl font-bold">Recommended Path</h2>{props.data.isCustomized && <span className="rounded-md bg-[#FFF4CE] px-2 py-1 text-xs font-semibold text-[#8A4B08]">Customized</span>}</div><p className="mt-1 text-sm text-muted-foreground">{props.data.roleExternalId} · Weeks 2–8 · 7 Huddles · 30 minutes each</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={!props.data.isCustomized || props.savePending} onClick={props.onReset} className="inline-flex h-9 items-center rounded-md border bg-white px-3 text-sm font-semibold hover:bg-[#E8F2FF] disabled:opacity-40"><RefreshCcw className="mr-2 h-4 w-4" />Reset</button><button type="button" onClick={() => void exportPlan(props.data!)} className="inline-flex h-9 items-center rounded-md bg-[#0F6CBD] px-3 text-sm font-semibold text-white hover:bg-[#115EA3]"><Download className="mr-2 h-4 w-4" />Export Learning Plan</button></div>
    </div>
    {props.mutationError && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{props.mutationError.message} Refresh the plan before trying again.</p>}
    <div className="space-y-3">{props.data.items.map((item, index) => <RecommendedPathCard key={`${item.week}-${item.huddle.externalId}`} week={item.week} huddle={item.huddle} customized={item.isCustomized} selected={props.selectedExternalId === item.huddle.externalId} vote={props.votes.get(item.huddle.externalId)} votePending={props.votePending} onSelect={props.onSelect} onVote={props.onVote} managementMenu={
      <div className="relative"><button type="button" disabled={props.savePending} onClick={() => setMenuWeek(menuWeek === item.week ? null : item.week)} className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-muted-foreground hover:bg-[#E8F2FF] disabled:opacity-40" aria-label={`Manage Week ${item.week}`} aria-expanded={menuWeek === item.week}><MoreHorizontal className="h-4 w-4" /></button>{menuWeek === item.week && <div className="absolute right-0 z-50 mt-1 w-64 rounded-lg border bg-white p-1 shadow-xl"><p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Manage Week {item.week}</p><button disabled={index === 0} onClick={() => update(item.week, "up")} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#F5F9FF] disabled:opacity-40">Move Up</button><button disabled={index === PATH_WEEKS.length - 1} onClick={() => update(item.week, "down")} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#F5F9FF] disabled:opacity-40">Move Down</button><label className="block px-3 py-2 text-sm">Move to week<select value={item.week} onChange={(event) => update(item.week, "up", Number(event.target.value))} className="mt-1 h-9 w-full rounded border bg-white px-2">{PATH_WEEKS.map((weekOption) => <option key={weekOption} value={weekOption}>Week {weekOption}</option>)}</select></label><label className="block px-3 py-2 text-sm">Replace Huddle<select value="" onChange={(event) => update(item.week, "reset", undefined, event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="" disabled>Select Huddle</option>{props.catalog.filter((candidate) => !props.data!.items.some((existing) => existing.huddle.externalId === candidate.externalId)).map((candidate) => <option key={candidate.externalId} value={candidate.externalId}>{candidate.name}</option>)}</select></label><button disabled={!item.isCustomized} onClick={() => update(item.week, "reset")} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#F5F9FF] disabled:opacity-40">Reset this week</button></div>}</div>
    } />)}</div>
  </section>;
}
