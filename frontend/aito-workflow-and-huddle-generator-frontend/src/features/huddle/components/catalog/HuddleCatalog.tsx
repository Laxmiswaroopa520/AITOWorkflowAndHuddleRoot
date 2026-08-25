import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { mapHuddleCatalogItemToCard } from "../../mappers";
import type { HuddleCatalogItemResponse, HuddleVoteResponse } from "../../types";
import type { IncompleteHuddleSessionResponse } from "../../types";
import { HuddleCatalogCard } from "./HuddleCatalogCard";
import { CustomLearningPlanCard } from "./CustomLearningPlanCard";
import { CustomLearningPlanDialog } from "./CustomLearningPlanDialog";
import { ContinueLearningList } from "../progress";
import { exportCustomLearningPlanHtml } from "../../exports/html/exportCustomLearningPlanHtml";
import type { CustomLearningPlanState } from "../../hooks/useCustomLearningPlan";

interface HuddleCatalogProps {
  data: HuddleCatalogItemResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  selectedExternalId: string | null;
  audienceRoleIds: string[];
  /** Changes whenever any filter changes, so paging can restart at page one. */
  filterKey: string;
  /**
   * Whether a focus area, AI tool or search term is narrowing the list. Decides which empty state
   * to show: "nothing matches your filter" versus "this audience has no additional content".
   */
  filtersActive?: boolean;
  votes: Map<string, HuddleVoteResponse>;
  votePending: boolean;
  onSelect: (externalId: string) => void;
  onVote: (externalId: string, value: -1 | 1 | null) => void;
  onRetry: () => void;
  /** Every in-progress session; the list shows the latest and can expand to the rest. */
  continueLearning?: IncompleteHuddleSessionResponse[];
  onContinue: (externalId: string) => void;
  /** Custom learning plan state. Omit to hide the multi-select experience entirely. */
  plan?: CustomLearningPlanState;
  /** Human-readable persona shown on the exported plan. */
  planAudienceLabel?: string | null;
  onCloseDetails?: () => void;
}

const PAGE_SIZE = 10;


export function HuddleCatalog({ data, isLoading, error, selectedExternalId, audienceRoleIds, filterKey, filtersActive = false, votes, votePending, continueLearning, plan, planAudienceLabel, onSelect, onVote, onRetry, onContinue, onCloseDetails }: HuddleCatalogProps) {
  const [page, setPage] = useState(1);
  const [planOpen, setPlanOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  // The catalog endpoint filters by one role only. With several selected we request every
  // role and narrow client-side, which keeps the server contract unchanged.
  const visible = useMemo(() => {
    if (audienceRoleIds.length <= 1) return data ?? [];
    return (data ?? []).filter((item) => item.roles.some((role) => audienceRoleIds.includes(role.externalId)));
  }, [data, audienceRoleIds]);
  const cards = useMemo(() => visible.map(mapHuddleCatalogItemToCard), [visible]);

  // Resolve the plan sequence against the full API payload so a topic stays in the plan
  // even when the current filters or page would hide its card.
  const planHuddles = useMemo(() => {
    if (!plan) return [];
    const byExternalId = new Map((data ?? []).map((item) => [item.externalId, item]));
    return plan.sequence.map((externalId) => byExternalId.get(externalId)).filter((item): item is HuddleCatalogItemResponse => Boolean(item));
  }, [data, plan]);

  const exportPlan = () => {
    setPlanError(null);
    setExporting(true);
    try {
      exportCustomLearningPlanHtml(planHuddles, { personaLabel: planAudienceLabel ?? null });
    } catch (exportFailure) {
      setPlanError(exportFailure instanceof Error ? exportFailure.message : "Unable to export the learning plan.");
    } finally {
      setExporting(false);
    }
  };

  const clearPlan = () => {
    plan?.clear();
    setPlanOpen(false);
    setPlanError(null);
  };
  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedCards = cards.slice(pageStart, pageStart + PAGE_SIZE);

  // Filters live above this component now, so restart paging when they change.
  useEffect(() => { setPage(1); }, [filterKey]);

  if (isLoading) return <LoadingSpinner message="Loading Huddles..." />;
  if (error) return <ErrorState title="Unable to load Huddles" message={error.message} onRetry={onRetry} />;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-bold">Additional Topics</h2><p className="mt-1 text-sm text-muted-foreground">Build your own learning plan from additional workflows, tools, and role-relevant Huddles.</p></div>
        <div className="flex items-center gap-2">
          {plan && plan.selectedIds.length > 0 && <span className="rounded-full bg-[#E8F2FF] px-2.5 py-1 text-xs font-semibold text-[#0F6CBD]">{plan.selectedIds.length} {plan.selectedIds.length === 1 ? "topic" : "topics"} selected</span>}
          {selectedExternalId && onCloseDetails && <Button variant="ghost" size="sm" onClick={onCloseDetails}>Close details</Button>}
        </div>
      </div>
      <ContinueLearningList items={continueLearning} onContinue={onContinue} />
      {plan && plan.selectedIds.length > 0 && <CustomLearningPlanCard selectedCount={plan.selectedIds.length} exporting={exporting} onBuild={() => setPlanOpen(true)} onExport={exportPlan} onClear={clearPlan} />}
      {planError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{planError}</p>}
      <div className="space-y-3">{pagedCards.map((huddle) => <HuddleCatalogCard showManagementMenu key={huddle.id} huddle={huddle} selected={selectedExternalId === huddle.id} vote={votes.get(huddle.id)} votePending={votePending} primaryAccessUrl={huddle.primaryAccessUrl} planChecked={plan?.isSelected(huddle.id) ?? false} onTogglePlan={plan ? plan.toggle : undefined} onSelect={onSelect} onVote={onVote} />)}</div>
      {/* A role can have a Role Path and no additional content, which is the mirror of All Roles
          having additional content and no Role Path. Say which of the two happened. */}
      {cards.length === 0 && <div className="rounded-xl border border-dashed bg-white py-10 text-center text-sm text-muted-foreground">{filtersActive ? "No Huddles match this filter." : "No Additional Topics are configured for this audience."}</div>}
      {cards.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 pt-1"><p className="text-xs text-muted-foreground">Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, cards.length)} of {cards.length} Huddles</p>{totalPages > 1 && <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span className="min-w-16 text-center text-xs font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span><Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button></div>}</div>}
      {plan && planOpen && <CustomLearningPlanDialog huddles={planHuddles} exporting={exporting} onMove={plan.move} onRemove={plan.remove} onClear={clearPlan} onExport={exportPlan} onClose={() => setPlanOpen(false)} />}
    </section>
  );
}
