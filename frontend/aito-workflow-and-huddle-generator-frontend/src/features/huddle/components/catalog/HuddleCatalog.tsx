import { useMemo } from "react";
import { Search } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { mapHuddleCatalogItemToCard } from "../../mappers";
import type { HuddleCatalogItemResponse, HuddleVoteResponse } from "../../types";
import type { IncompleteHuddleSessionResponse } from "../../types";
import { HuddleCatalogCard } from "./HuddleCatalogCard";
import { ContinueLearningCard, isContinueLearningAvailable } from "../progress";

interface FilterOption { value: string; label: string }
interface HuddleCatalogProps {
  data: HuddleCatalogItemResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  selectedExternalId: string | null;
  filters: { role: string; focusArea: string; agent: string; sort: string; search: string };
  options: { roles: FilterOption[]; focusAreas: FilterOption[]; agents: FilterOption[] };
  votes: Map<string, HuddleVoteResponse>;
  votePending: boolean;
  onFilterChange: (name: "role" | "focusArea" | "agent" | "sort" | "search", value: string) => void;
  onSelect: (externalId: string) => void;
  onVote: (externalId: string, value: -1 | 1 | null) => void;
  onRetry: () => void;
  continueLearning?: IncompleteHuddleSessionResponse;
  onContinue: (externalId: string) => void;
}

function FilterSelect({ label, value, options, allLabel, onChange }: { label: string; value: string; options: FilterOption[]; allLabel: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]"><option value="">{allLabel}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function HuddleCatalog({ data, isLoading, error, selectedExternalId, filters, options, votes, votePending, continueLearning, onFilterChange, onSelect, onVote, onRetry, onContinue }: HuddleCatalogProps) {
  const cards = useMemo(() => (data ?? []).map(mapHuddleCatalogItemToCard), [data]);
  if (isLoading) return <LoadingSpinner message="Loading Huddles..." />;
  if (error) return <ErrorState title="Unable to load Huddles" message={error.message} onRetry={onRetry} />;

  return (
    <section className="space-y-4">
      <div><h2 className="text-2xl font-bold">Additional Topics</h2><p className="mt-1 text-sm text-muted-foreground">Explore all published Huddles without restrictions.</p></div>
      {isContinueLearningAvailable(continueLearning) && <ContinueLearningCard item={continueLearning} onContinue={onContinue} />}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <FilterSelect label="Audience" value={filters.role} options={options.roles} allLabel="All Audiences" onChange={(value) => onFilterChange("role", value)} />
        <FilterSelect label="Focus Area" value={filters.focusArea} options={options.focusAreas} allLabel="All Focus Areas" onChange={(value) => onFilterChange("focusArea", value)} />
        <FilterSelect label="AI Tool" value={filters.agent} options={options.agents} allLabel="All AI Tools" onChange={(value) => onFilterChange("agent", value)} />
        <FilterSelect label="Sort" value={filters.sort} options={[{ value: "role-relevance", label: "Role relevance" }, { value: "most-upvoted", label: "Most upvoted" }, { value: "default", label: "Default order" }]} allLabel="Default order" onChange={(value) => onFilterChange("sort", value)} />
        <label className="block min-w-0"><span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground">Search</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} placeholder="Search Huddles" className="h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]" /></span></label>
      </div>
      <div className="space-y-3">{cards.map((huddle) => <HuddleCatalogCard showManagementMenu key={huddle.id} huddle={huddle} selected={selectedExternalId === huddle.id} vote={votes.get(huddle.id)} votePending={votePending} primaryAccessUrl={huddle.primaryAccessUrl} onSelect={onSelect} onVote={onVote} />)}</div>
      {cards.length === 0 && <div className="rounded-xl border border-dashed bg-white py-10 text-center text-sm text-muted-foreground">No Huddles match this filter.</div>}
    </section>
  );
}
