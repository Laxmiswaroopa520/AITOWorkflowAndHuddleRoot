import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import { CalendarDays, Library, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { HuddleAudienceSelect } from "../components/audience";
import { HuddleCatalog, HuddleDownvoteDialog, HuddleFilterBar } from "../components/catalog";
import { HuddleDetailPanel, HuddleHtmlExportDialog, HuddlePreviewDialog, HuddleWorkspace } from "../components/generated";
import { MeetCoachDialog } from "../components/coach";
import { HuddleOnboardingExperience } from "../components/onboarding";
import { HuddleResourcesRepository } from "../components/resources";
import { RecommendedPath } from "../components/progress";
import { useCompleteHuddleSession, useCustomLearningPlan, useHuddleById, useHuddleCatalog, useHuddleSession, useHuddleVotes, useIncompleteHuddleSessions, useLegacyHuddlePlanMigration, useMyHuddlePlan, useResetHuddlePlan, useSaveHuddlePlan, useSaveHuddleSession, useSetHuddleActivityCompletion, useSetHuddleVote } from "../hooks";
import { huddlePersonaAtom, huddleViewModeAtom, selectedHuddleExternalIdAtom, selectedHuddleRoleExternalIdAtom, type HuddleViewMode } from "../store";
import type { HuddlePlanResponse, HuddleRoleResponse, HuddleVoteResponse } from "../types";
import type { HuddlePersona } from "../types/huddlePersona.types";
import { createHuddlePresentationModel } from "../mappers";

/** The first tab is named for the persona: Team Members get Orientation, the rest Onboarding. */
function buildNavigationItems(persona: HuddlePersona | null): { id: HuddleViewMode; label: string }[] {
  return [
    { id: "orientation", label: persona === "team-member" ? "Orientation" : "Onboarding" },
    { id: "guided", label: "Role Path" },
    { id: "evergreen", label: "Additional Topics" },
  ];
}

const initialFilters = { focusArea: "", agent: "", sort: "default", search: "" };

export function HuddlePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useAtom(huddleViewModeAtom);
  const [selectedExternalId, setSelectedExternalId] = useAtom(selectedHuddleExternalIdAtom);
  const [selectedRoleExternalId, setSelectedRoleExternalId] = useAtom(selectedHuddleRoleExternalIdAtom);
  const [filters, setFilters] = useState(initialFilters);
  const [audienceRoleIds, setAudienceRoleIds] = useState<string[]>([]);
  const [downvoteTarget, setDownvoteTarget] = useState<{ id: string; name: string } | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [htmlExportOpen, setHtmlExportOpen] = useState(false);
  const [htmlExportPending, setHtmlExportPending] = useState(false);
  const [coachContext, setCoachContext] = useState<{ externalId: string; name: string } | null>(null);
  const [persona, setPersona] = useAtom(huddlePersonaAtom);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const navigationItems = useMemo(() => buildNavigationItems(persona), [persona]);
  const [exportPending, setExportPending] = useState(false);

  const referenceCatalogQuery = useHuddleCatalog({});
  const evergreenQuery = useHuddleCatalog({
    type: "Prescriptive",
    roleExternalId: audienceRoleIds.length === 1 ? audienceRoleIds[0] : undefined,
    focusAreaExternalId: filters.focusArea || undefined,
    agentExternalId: filters.agent || undefined,
    search: filters.search || undefined,
    sort: (filters.sort || "default") as "default" | "most-upvoted" | "role-relevance",
  });
  const detailQuery = useHuddleById(selectedExternalId);
  const sessionQuery = useHuddleSession(selectedExternalId);
  const incompleteSessionsQuery = useIncompleteHuddleSessions();
  const customLearningPlan = useCustomLearningPlan(persona);
  const personaLabel = persona === "team-member" ? "Team Member" : persona ? `${persona[0].toUpperCase()}${persona.slice(1)}` : null;
  const saveSessionMutation = useSaveHuddleSession();
  const activityCompletionMutation = useSetHuddleActivityCompletion();
  const completeSessionMutation = useCompleteHuddleSession();
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
    return { focusAreas: sortOptions([...focusAreas]), agents: sortOptions([...agents]) };
  }, [referenceCatalogQuery.data]);

  const filterKey = `${audienceRoleIds.join(",")}|${filters.focusArea}|${filters.agent}|${filters.sort}|${filters.search}`;
  const votes = useMemo(() => new Map<string, HuddleVoteResponse>((votesQuery.data ?? []).map((vote) => [vote.huddleExternalId, vote])), [votesQuery.data]);
  const presentationAudience = useMemo(() => {
    const roleExternalId = viewMode === "guided" ? selectedRoleExternalId : audienceRoleIds.length === 1 ? audienceRoleIds[0] : null;
    return { roleExternalId, roleName: roles.find((role) => role.externalId === roleExternalId)?.name ?? null };
  }, [audienceRoleIds, roles, selectedRoleExternalId, viewMode]);
  const presentationModel = useMemo(() => detailQuery.data ? createHuddlePresentationModel(detailQuery.data, presentationAudience) : null, [detailQuery.data, presentationAudience]);
  const sessionError = sessionQuery.error ?? saveSessionMutation.error ?? activityCompletionMutation.error ?? completeSessionMutation.error;
  const saveSession = (currentPhaseExternalId: string | null, facilitatorNotes: string | null) => saveSessionMutation.mutateAsync({ externalId: selectedExternalId!, request: { currentPhaseExternalId, facilitatorNotes, rowVersion: sessionQuery.data?.rowVersion ?? null } });
  const setActivityCompletion = async (activityExternalId: string, isCompleted: boolean, currentPhaseExternalId: string | null, facilitatorNotes: string | null) => {
    const current = sessionQuery.data ?? await saveSessionMutation.mutateAsync({ externalId: selectedExternalId!, request: { currentPhaseExternalId, facilitatorNotes, rowVersion: null } });
    return activityCompletionMutation.mutateAsync({ externalId: selectedExternalId!, activityExternalId, request: { isCompleted, rowVersion: current.rowVersion } });
  };
  const completeSession = () => completeSessionMutation.mutateAsync({ externalId: selectedExternalId!, request: { rowVersion: sessionQuery.data!.rowVersion } });
  const continueLearning = (externalId: string) => { setSelectedExternalId(externalId); setWorkspaceOpen(true); };
  const savePlan = (plan: HuddlePlanResponse) => savePlanMutation.mutate({ optimisticPlan: plan, request: { roleExternalId: plan.roleExternalId, rowVersion: recommendedPathQuery.data?.rowVersion ?? null, items: plan.items.map((item) => ({ week: item.week, huddleExternalId: item.huddle.externalId })) } });
  const resetPlan = () => {
    const plan = recommendedPathQuery.data;
    if (!plan) return;
    const items = plan.items.map((item) => ({ ...item, isCustomized: false, huddle: referenceCatalogQuery.data?.find((candidate) => candidate.externalId === item.recommendedHuddleExternalId) ?? item.huddle }));
    resetPlanMutation.mutate({ roleExternalId: plan.roleExternalId, optimisticPlan: { ...plan, rowVersion: null, isCustomized: false, items } });
  };
  const changeViewMode = (mode: HuddleViewMode) => { setViewMode(mode); setSelectedExternalId(null); setWorkspaceOpen(false); setPreviewOpen(false); };
  const selectPersona = (nextPersona: HuddlePersona) => {
    setPersona(nextPersona);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const changePersona = () => {
    setPersona(null);
    setViewMode("orientation");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const changeFilter = (name: "focusArea" | "agent" | "sort" | "search", value: string) => setFilters((current) => ({ ...current, [name]: value }));
  const setVote = (externalId: string, value: -1 | 1 | null) => {
    if (value === -1) {
      const huddle = referenceCatalogQuery.data?.find((item) => item.externalId === externalId);
      setDownvoteTarget({ id: externalId, name: huddle?.name ?? "this Huddle" });
      return;
    }
    voteMutation.mutate({ externalId, request: value === null ? null : { value, downvoteReasons: null, comment: null } });
  };

  const exportSelectedHuddleHtml = async (facilitatorNotes: string | null) => {
    if (!presentationModel) return;
    setHtmlExportPending(true);
    try {
      const { exportHuddleHtml } = await import("../exports/html");
      exportHuddleHtml(presentationModel, { facilitatorNotes });
      setHtmlExportOpen(false);
    } finally {
      setHtmlExportPending(false);
    }
  };
  const exportSelectedHuddlePowerPoint = async () => {
    if (!presentationModel || exportPending) return;
    setExportPending(true);
    try {
      const { exportHuddlePowerPoint } = await import("../exports/powerpoint");
      await exportHuddlePowerPoint(presentationModel);
    } finally {
      setExportPending(false);
    }
  };

  const detailPanel = <HuddleDetailPanel data={detailQuery.data} isLoading={detailQuery.isLoading} error={detailQuery.error} hasSelection={Boolean(selectedExternalId)} exportPending={exportPending} onRetry={() => void detailQuery.refetch()} onOpenWorkspace={() => setWorkspaceOpen(true)} onPreview={() => setPreviewOpen(true)} onExportHtml={() => setHtmlExportOpen(true)} onExportPowerPoint={() => void exportSelectedHuddlePowerPoint()} onMeetCoach={() => detailQuery.data && setCoachContext({ externalId: detailQuery.data.externalId, name: detailQuery.data.name })} />;

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 p-4 [font-family:'Segoe_UI_Variable','Segoe_UI',Arial,sans-serif] lg:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-3"><span className="rounded-xl bg-[#E8F2FF] p-2"><Users className="h-6 w-6 text-[#0F6CBD]" /></span><h1 className="text-2xl font-bold lg:text-3xl">Run a Huddle</h1></div><p className="text-muted-foreground">Discover and run guided Huddles that help your team apply AI to real workflows.</p></div><div className="flex flex-wrap items-center gap-2">{persona === "manager" && <button type="button" data-tour="huddle-launch-planner" onClick={() => navigate("/huddle/launch-planner")} className="inline-flex h-10 items-center rounded-lg border border-[#0A6BBA] bg-white px-4 text-sm font-semibold text-[#0A6BBA] hover:bg-[#E2F1F9]"><CalendarDays className="mr-2 h-4 w-4" />Launch Planner</button>}<button type="button" data-tour="huddle-resources" onClick={() => setResourcesOpen(true)} className="inline-flex h-10 items-center rounded-lg border bg-white px-4 text-sm font-semibold hover:bg-muted"><Library className="mr-2 h-4 w-4" />Resources</button>{viewMode !== "orientation" && <span className="inline-flex h-10 items-center rounded-lg border border-[#0F6CBD]/25 bg-[#E8F2FF] px-3 text-sm font-semibold text-[#0F6CBD]">{selectedExternalId ? "1 selected" : "0 selected"}</span>}{selectedExternalId && <button type="button" data-tour="huddle-generate" onClick={() => setWorkspaceOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-[#0F6CBD] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0F6CBD]/20 hover:bg-[#115EA3]"><Sparkles className="mr-2 h-4 w-4" />Generate Huddle</button>}</div></header>
      {persona && <div className="space-y-4"><nav data-tour="huddle-sections" aria-label="Huddle sections" className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border/80 bg-muted/40 p-1.5 shadow-sm">{navigationItems.map((item) => <button key={item.id} type="button" onClick={() => changeViewMode(item.id)} className={cn("rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200", viewMode === item.id ? "border border-[#0F6CBD] bg-[#0F6CBD] text-white shadow-md shadow-[#0F6CBD]/20" : "text-muted-foreground hover:bg-white/80 hover:text-foreground")}>{item.label}</button>)}</nav>{viewMode === "guided" && <div data-tour="huddle-audience"><HuddleAudienceSelect mode="single" roles={roles} selectedIds={selectedRoleExternalId ? [selectedRoleExternalId] : []} onChange={(selectedIds) => { setSelectedRoleExternalId(selectedIds[0] ?? null); setSelectedExternalId(null); }} /></div>}{viewMode === "evergreen" && <div data-tour="huddle-filters"><HuddleFilterBar filters={filters} options={options} roles={roles} audienceRoleIds={audienceRoleIds} onAudienceChange={setAudienceRoleIds} onFilterChange={changeFilter} /></div>}</div>}

      {viewMode === "orientation" && <HuddleOnboardingExperience key={persona ?? "choose-experience"} persona={persona} onSelectPersona={selectPersona} onChangePersona={changePersona} onStartRolePath={() => changeViewMode("guided")} onAdditionalTopics={() => changeViewMode("evergreen")} />}
      {persona && viewMode !== "orientation" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"><div data-tour="huddle-list" className="min-w-0">{viewMode === "guided" ? <RecommendedPath data={recommendedPathQuery.data} roleName={presentationAudience.roleName} catalog={referenceCatalogQuery.data ?? []} isLoading={recommendedPathQuery.isLoading} error={recommendedPathQuery.error} mutationError={savePlanMutation.error ?? resetPlanMutation.error} selectedExternalId={selectedExternalId} hasRole={Boolean(selectedRoleExternalId)} votes={votes} votePending={voteMutation.isPending} savePending={savePlanMutation.isPending || resetPlanMutation.isPending} onSelect={setSelectedExternalId} onVote={setVote} onSave={savePlan} onReset={resetPlan} onRetry={() => void recommendedPathQuery.refetch()} /> : <HuddleCatalog data={evergreenQuery.data} isLoading={evergreenQuery.isLoading} error={evergreenQuery.error} selectedExternalId={selectedExternalId} audienceRoleIds={audienceRoleIds} filterKey={filterKey} votes={votes} votePending={voteMutation.isPending} continueLearning={incompleteSessionsQuery.data} plan={customLearningPlan} planAudienceLabel={personaLabel} onSelect={setSelectedExternalId} onVote={setVote} onRetry={() => void evergreenQuery.refetch()} onContinue={continueLearning} onCloseDetails={() => setSelectedExternalId(null)} />}</div><div data-tour="huddle-detail">{detailPanel}</div></div>}
      {downvoteTarget && <HuddleDownvoteDialog huddleName={downvoteTarget.name} onCancel={() => setDownvoteTarget(null)} onSubmit={(downvoteReasons, comment) => { voteMutation.mutate({ externalId: downvoteTarget.id, request: { value: -1, downvoteReasons, comment } }); setDownvoteTarget(null); }} />}
      {workspaceOpen && presentationModel && !sessionQuery.isLoading && <HuddleWorkspace key={presentationModel.identity.externalId} model={presentationModel} session={sessionQuery.data} sessionLoading={sessionQuery.isLoading} sessionError={sessionError} mutationPending={saveSessionMutation.isPending || activityCompletionMutation.isPending || completeSessionMutation.isPending} onRefreshSession={async () => (await sessionQuery.refetch()).data} onSaveSession={saveSession} onSetActivityCompletion={setActivityCompletion} onCompleteSession={completeSession} onMeetCoach={() => setCoachContext({ externalId: presentationModel.identity.externalId, name: presentationModel.identity.name })} onPreviewSlides={() => setPreviewOpen(true)} onClose={() => setWorkspaceOpen(false)} />}
      {previewOpen && presentationModel && <HuddlePreviewDialog open model={presentationModel} onClose={() => setPreviewOpen(false)} />}
      {presentationModel && <HuddleHtmlExportDialog open={htmlExportOpen} pending={htmlExportPending} initialNotes={sessionQuery.data?.facilitatorNotes} onCancel={() => setHtmlExportOpen(false)} onDownload={(notes) => void exportSelectedHuddleHtml(notes)} />}
      {coachContext && <MeetCoachDialog open huddleExternalId={coachContext.externalId} huddleName={coachContext.name} onClose={() => setCoachContext(null)} />}
      <HuddleResourcesRepository open={resourcesOpen} catalog={referenceCatalogQuery.data ?? []} onClose={() => setResourcesOpen(false)} />
    </div>
  );
}
