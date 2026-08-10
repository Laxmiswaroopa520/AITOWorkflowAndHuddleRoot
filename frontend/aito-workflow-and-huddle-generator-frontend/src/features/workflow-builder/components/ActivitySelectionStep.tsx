import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Filter,
  FolderOpen,
  Loader2,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";

import {
  useMemo,
} from "react";
import { Link } from "react-router";

import {
  Button,
} from "@/components/ui/button";

import {
  ErrorState,
} from "@/components/feedback/ErrorState";

import type {
  Activity,
} from "../types/activity.types";

import type {
  AiTool,
} from "../types/aiTool.types";

import type {
  Role,
} from "../types/role.types";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

import type {
  WorkflowFilters,
} from "../types/workflowBuilder.types";

import {
  useFilteredActivities,
} from "../hooks/useFilteredActivities";

import {
  groupActivitiesByBucket,
} from "../utils/groupActivitiesByBucket";

import {
  WorkflowBucketList,
} from "./WorkflowBucketList";

interface ActivitySelectionStepProps {
  role: Role;
  activities: Activity[];
  aiTools: AiTool[];
  workflowBuckets: WorkflowBucket[];

  isLoading: boolean;
  error: Error | null;

  filters: WorkflowFilters;

  selectedActivities: Activity[];
  selectedActivityIds: Set<number>;

  expandedActivityId: number | null;
  totalDuration: number;

  onBack: () => void;
  onRetry: () => void;

  onFiltersChange: (
    filters: WorkflowFilters,
  ) => void;

  onClearFilters: () => void;

  onToggleActivity: (
    activity: Activity,
  ) => void;

  onToggleDetails: (
    activityId: number,
  ) => void;

  onSelectActivities: (
    activities: Activity[],
  ) => void;

  onDeselectActivities: (
    activityIds: number[],
  ) => void;

  onRemoveActivity: (
    activityId: number,
  ) => void;

  onClearActivities: () => void;
  onBuild: () => void;
}

export function ActivitySelectionStep({
  role,
  activities,
  aiTools,
  workflowBuckets,
  isLoading,
  error,
  filters,
  selectedActivities,
  selectedActivityIds,
  expandedActivityId,
  onBack,
  onRetry,
  onFiltersChange,
  onClearFilters,
  onToggleActivity,
  onToggleDetails,
  onSelectActivities,
  onDeselectActivities,
  onBuild,
}: ActivitySelectionStepProps) {
  const filteredActivities =
    useFilteredActivities({
      activities,
      filters,
    });

  const groups = useMemo(
    () =>
      groupActivitiesByBucket(
        filteredActivities,
        workflowBuckets,
      ),
    [
      filteredActivities,
      workflowBuckets,
    ],
  );

  const allFilteredSelected = filteredActivities.length > 0 && filteredActivities.every(activity => selectedActivityIds.has(activity.id));
  const selectedByCategory = useMemo(() => selectedActivities.reduce<Record<string, number>>((counts, activity) => { counts[activity.category] = (counts[activity.category] ?? 0) + 1; return counts; }, {}), [selectedActivities]);
  const updateFilter = <K extends keyof WorkflowFilters>(key: K, value: WorkflowFilters[K]) => onFiltersChange({ ...filters, [key]: value });
  const toggleAll = () => allFilteredSelected ? onDeselectActivities(filteredActivities.map(activity => activity.id)) : onSelectActivities(filteredActivities);

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <Loader2
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              text-primary
            "
            aria-hidden="true"
          />

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            Loading activities for{" "}
            {role.name}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Activities could not be loaded"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  /*
   * This means the API itself returned no
   * activities for the selected role.
   *
   * This is different from filters hiding
   * otherwise available activities.
   */
  if (activities.length === 0) {
    return (
      <section
        className="
          mx-auto
          flex
          min-h-[60vh]
          w-full
          max-w-xl
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            w-full
            rounded-2xl
            border
            border-dashed
            border-border
            bg-card
            px-6
            py-12
            text-center
          "
        >
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            No activities are configured
            for this role
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Select another role or ask
            the administrator to configure
            activities for {role.name}.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={onBack}
          >
            Select another role
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto w-full max-w-[1800px] px-4 pb-10 pt-3 lg:px-10 xl:px-16"
    >
      <Button
        type="button"
        variant="ghost"
        className="gap-2"
        onClick={onBack}
      >
        <ArrowLeft
          className="h-4 w-4"
          aria-hidden="true"
        />

        Change role
      </Button>

      <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4"><span className="rounded-xl bg-primary/10 p-3"><Sparkles className="h-6 w-6 text-primary" /></span><div><h1 className="text-lg font-bold">Select Your Activities</h1><p className="text-sm text-muted-foreground">Choose the activities you want to focus on. These will build your personalized schedule.</p></div><button type="button" onClick={toggleAll} className={`ml-2 flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold shadow-sm transition ${allFilteredSelected ? "border-primary bg-primary text-white" : "border-primary/40 bg-primary/10 text-primary"}`}>{allFilteredSelected ? <><CheckCircle2 className="h-4 w-4" />Deselect All</> : <><Plus className="h-4 w-4" />Select All</>}</button></div>
        <div className="flex flex-wrap items-center gap-3"><label className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><select aria-label="AI tool filter" value={filters.aiToolId} onChange={event => updateFilter("aiToolId", event.target.value)} className="h-10 w-40 rounded-md border bg-background pl-9 pr-3 text-sm"><option value="all">All AI Tools</option>{aiTools.map(tool => <option key={tool.externalId} value={tool.externalId}>{tool.name}</option>)}</select></label><label className="relative"><Timer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><select aria-label="Duration filter" value={filters.duration} onChange={event => updateFilter("duration", event.target.value as WorkflowFilters["duration"])} className="h-10 w-36 rounded-md border bg-background pl-9 pr-3 text-sm"><option value="all">Any duration</option><option value="short">15 min or less</option><option value="medium">16–30 min</option><option value="long">Over 30 min</option></select></label></div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap items-center gap-3"><span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm ${selectedActivities.length ? "bg-primary/10 text-primary" : "bg-secondary"}`}><Check className="mr-1.5 h-3.5 w-3.5" />{selectedActivities.length} selected</span>{Object.entries(selectedByCategory).map(([category,count]) => <span key={category} className="rounded-full border px-2.5 py-1 text-xs">{category}: {count}</span>)}</div><div className="flex items-center gap-3"><Link to="/workflows" className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium"><FolderOpen className="h-4 w-4" />My Workflows</Link><Button type="button" size="lg" disabled={!selectedActivities.length} onClick={onBuild} className="gap-2">Build My Day <ArrowRight className="h-4 w-4" /></Button></div></div>

      <div className="mt-5">
        <WorkflowBucketList
          groups={groups}
          selectedActivityIds={
            selectedActivityIds
          }
          expandedActivityId={
            expandedActivityId
          }
          onToggleActivity={
            onToggleActivity
          }
          onToggleDetails={
            onToggleDetails
          }
          onSelectActivities={
            onSelectActivities
          }
          onDeselectActivities={
            onDeselectActivities
          }
          onClearFilters={
            onClearFilters
          }
        />
      </div>
    </section>
  );
}

