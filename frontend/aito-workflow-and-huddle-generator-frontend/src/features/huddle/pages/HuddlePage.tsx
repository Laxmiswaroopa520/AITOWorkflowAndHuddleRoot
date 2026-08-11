import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { HuddleAudienceSelect } from "../components/audience";
import { HuddleCatalog, HuddleDownvoteDialog } from "../components/catalog";
import { HuddleDetailPanel, HuddleOrientation } from "../components/generated";
import { RecommendedPath } from "../components/progress";
import { useHuddleById, useHuddleCatalog, useHuddleVotes, useLegacyHuddlePlanMigration, useMyHuddlePlan, useResetHuddlePlan, useSaveHuddlePlan, useSetHuddleVote } from "../hooks";
import { huddleViewModeAtom, selectedHuddleExternalIdAtom, selectedHuddleRoleExternalIdAtom, type HuddleViewMode } from "../store";
import type { HuddlePlanResponse, HuddleRoleResponse, HuddleVoteResponse } from "../types";

const navigationItems: { id: HuddleViewMode; label: string }[] = [
  { id: "foundation", label: "Orientation" },
  { id: "guided", label: "Role Path" },
  { id: "evergreen", label: "Additional Topics" },
];

const initialFilters = { role: "", focusArea: "", agent: "", sort: "default", search: "" };

export function HuddlePage() {
  const [viewMode, setViewMode] = useAtom(huddleViewModeAtom);
  const [selectedExternalId, setSelectedExternalId] = useAtom(selectedHuddleExternalIdAtom);
  const [selectedRoleExternalId, setSelectedRoleExternalId] = useAtom(selectedHuddleRoleExternalIdAtom);
  const [filters, setFilters] = useState(initialFilters);
  const [downvoteTarget, setDownvoteTarget] = useState<{ id: string; name: string } | null>(null);

  const referenceCatalogQuery = useHuddleCatalog({});
  const evergreenQuery = useHuddleCatalog({
    type: "Prescriptive",
    roleExternalId: filters.role || undefined,
    focusAreaExternalId: filters.focusArea || undefined,
    agentExternalId: filters.agent || undefined,
    search: filters.search || undefined,
    sort: (filters.sort || "default") as "default" | "most-upvoted" | "role-relevance",
  });
  const detailQuery = useHuddleById(selectedExternalId);
  const recommendedPathQuery = useMyHuddlePlan(selectedRoleExternalId);
  const savePlanMutation = useSaveHuddlePlan();
  const resetPlanMutation = useResetHuddlePlan();
  const votesQuery = useHuddleVotes();
  const voteMutation = useSetHuddleVote();
  useLegacyHuddlePlanMigration(selectedRoleExternalId, recommendedPathQuery.data, referenceCatalogQuery.data);

  const roles = useMemo(() => {
    const byExternalId = new Map<string, HuddleRoleResponse>();
    referenceCatalogQuery.data?.forEach((huddle) => huddle.roles.forEach((role) => byExternalId.set(role.externalId, role)));
    return [...byExternalId.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [referenceCatalogQuery.data]);

  const options = useMemo(() => {
    const focusAreas = new Map<string, string>();
    const agents = new Map<string, string>();
    referenceCatalogQuery.data?.forEach((huddle) => {
      if (huddle.focusAreaExternalId && huddle.focusAreaName) focusAreas.set(huddle.focusAreaExternalId, huddle.focusAreaName);
      [...huddle.primaryAgents, ...huddle.secondaryAgents].forEach((agent) => agents.set(agent.externalId, agent.name));
    });
    const sortOptions = (entries: [string, string][]) => entries.sort((left, right) => left[1].localeCompare(right[1])).map(([value, label]) => ({ value, label }));
    return { roles: roles.map((role) => ({ value: role.externalId, label: role.name })), focusAreas: sortOptions([...focusAreas]), agents: sortOptions([...agents]) };
  }, [referenceCatalogQuery.data, roles]);

  const votes = useMemo(() => new Map<string, HuddleVoteResponse>((votesQuery.data ?? []).map((vote) => [vote.huddleExternalId, vote])), [votesQuery.data]);
  const savePlan = (plan: HuddlePlanResponse) => savePlanMutation.mutate({ optimisticPlan: plan, request: { roleExternalId: plan.roleExternalId, rowVersion: recommendedPathQuery.data?.rowVersion ?? null, items: plan.items.map((item) => ({ week: item.week, huddleExternalId: item.huddle.externalId })) } });
  const resetPlan = () => {
    const plan = recommendedPathQuery.data;
    if (!plan) return;
    const items = plan.items.map((item) => ({ ...item, isCustomized: false, huddle: referenceCatalogQuery.data?.find((candidate) => candidate.externalId === item.recommendedHuddleExternalId) ?? item.huddle }));
    resetPlanMutation.mutate({ roleExternalId: plan.roleExternalId, optimisticPlan: { ...plan, rowVersion: null, isCustomized: false, items } });
  };
  const changeViewMode = (mode: HuddleViewMode) => { setViewMode(mode); setSelectedExternalId(null); };
  const changeFilter = (name: "role" | "focusArea" | "agent" | "sort" | "search", value: string) => setFilters((current) => ({ ...current, [name]: value }));
  const setVote = (externalId: string, value: -1 | 1 | null) => {
    if (value === -1) {
      const huddle = referenceCatalogQuery.data?.find((item) => item.externalId === externalId);
      setDownvoteTarget({ id: externalId, name: huddle?.name ?? "this Huddle" });
      return;
    }
    voteMutation.mutate({ externalId, request: value === null ? null : { value, downvoteReasons: null, comment: null } });
  };

  const detailPanel = <HuddleDetailPanel data={detailQuery.data} isLoading={detailQuery.isLoading} error={detailQuery.error} hasSelection={Boolean(selectedExternalId)} onRetry={() => void detailQuery.refetch()} />;

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 p-4 lg:p-6">
      <header><div className="mb-2 flex items-center gap-3"><span className="rounded-xl bg-[#E8F2FF] p-2"><Users className="h-6 w-6 text-[#0F6CBD]" /></span><h1 className="text-2xl font-bold lg:text-3xl">Run a Huddle</h1></div><p className="text-muted-foreground">Discover and run guided Huddles that help your team apply AI to real workflows.</p></header>
      <div className="space-y-4"><nav aria-label="Huddle sections" className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border/80 bg-muted/40 p-1.5 shadow-sm">{navigationItems.map((item) => <button key={item.id} type="button" onClick={() => changeViewMode(item.id)} className={cn("rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200", viewMode === item.id ? "border border-[#0F6CBD] bg-[#0F6CBD] text-white shadow-md shadow-[#0F6CBD]/20" : "text-muted-foreground hover:bg-white/80 hover:text-foreground")}>{item.label}</button>)}</nav>{viewMode === "guided" && <HuddleAudienceSelect roles={roles} value={selectedRoleExternalId} onChange={(value) => { setSelectedRoleExternalId(value); setSelectedExternalId(null); }} />}</div>

      {viewMode === "foundation" && <HuddleOrientation onStartRolePath={() => changeViewMode("guided")} />}
      {viewMode !== "foundation" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"><div className="min-w-0">{viewMode === "guided" ? <RecommendedPath data={recommendedPathQuery.data} catalog={referenceCatalogQuery.data ?? []} isLoading={recommendedPathQuery.isLoading} error={recommendedPathQuery.error} mutationError={savePlanMutation.error ?? resetPlanMutation.error} selectedExternalId={selectedExternalId} hasRole={Boolean(selectedRoleExternalId)} votes={votes} votePending={voteMutation.isPending} savePending={savePlanMutation.isPending || resetPlanMutation.isPending} onSelect={setSelectedExternalId} onVote={setVote} onSave={savePlan} onReset={resetPlan} onRetry={() => void recommendedPathQuery.refetch()} /> : <HuddleCatalog data={evergreenQuery.data} isLoading={evergreenQuery.isLoading} error={evergreenQuery.error} selectedExternalId={selectedExternalId} filters={filters} options={options} votes={votes} votePending={voteMutation.isPending} onFilterChange={changeFilter} onSelect={setSelectedExternalId} onVote={setVote} onRetry={() => void evergreenQuery.refetch()} />}</div>{detailPanel}</div>}
      {downvoteTarget && <HuddleDownvoteDialog huddleName={downvoteTarget.name} onCancel={() => setDownvoteTarget(null)} onSubmit={(downvoteReasons, comment) => { voteMutation.mutate({ externalId: downvoteTarget.id, request: { value: -1, downvoteReasons, comment } }); setDownvoteTarget(null); }} />}
    </div>
  );
}
