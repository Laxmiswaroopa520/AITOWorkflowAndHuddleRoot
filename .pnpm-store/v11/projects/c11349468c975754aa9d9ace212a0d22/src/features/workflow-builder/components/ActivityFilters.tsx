import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  AiTool,
} from "../types/aiTool.types";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

import type {
  WorkflowFilters,
} from "../types/workflowBuilder.types";

interface ActivityFiltersProps {
  filters: WorkflowFilters;
  aiTools: AiTool[];
  workflowBuckets:
    WorkflowBucket[];
  categories: string[];
  priorities: string[];
  frequencies: string[];
  onChange: (
    filters: WorkflowFilters,
  ) => void;
  onClear: () => void;
}

export function ActivityFilters({
  filters,
  aiTools,
  workflowBuckets,
  categories,
  priorities,
  frequencies,
  onChange,
  onClear,
}: ActivityFiltersProps) {
  const updateFilter = <
    TKey extends keyof WorkflowFilters,
  >(
    key: TKey,
    value:
      WorkflowFilters[TKey],
  ): void => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.aiToolId !== "all" ||
    filters.workflowBucketId !==
      "all" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.frequency !== "all" ||
    filters.duration !== "all";

  return (
    <section
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-primary/10
              text-primary
            "
          >
            <SlidersHorizontal
              className="h-4 w-4"
            />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-semibold
              "
            >
              Filter activities
            </h2>

            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              Refine your recommended
              activities.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={onClear}
          >
            <X
              className="h-3.5 w-3.5"
            />

            Clear filters
          </Button>
        )}
      </div>

      <div
        className="
          mt-4
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <label
          className="
            relative
            md:col-span-2
          "
        >
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <input
            type="search"
            value={filters.search}
            placeholder="Search activities..."
            className="
              h-10
              w-full
              rounded-lg
              border
              border-input
              bg-background
              pl-9
              pr-3
              text-sm
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
            "
            onChange={event =>
              updateFilter(
                "search",
                event.target.value,
              )
            }
          />
        </label>

        <FilterSelect
          value={filters.aiToolId}
          label="AI tool"
          options={aiTools.map(tool => ({
            value: tool.externalId,
            label: tool.name,
          }))}
          onChange={value =>
            updateFilter(
              "aiToolId",
              value,
            )
          }
        />

        <FilterSelect
          value={
            filters.workflowBucketId
          }
          label="Workflow bucket"
          options={workflowBuckets.map(
            bucket => ({
              value:
                bucket.externalId,
              label: bucket.name,
            }),
          )}
          onChange={value =>
            updateFilter(
              "workflowBucketId",
              value,
            )
          }
        />

        <FilterSelect
          value={filters.category}
          label="Category"
          options={categories.map(
            category => ({
              value: category,
              label: category,
            }),
          )}
          onChange={value =>
            updateFilter(
              "category",
              value,
            )
          }
        />

        <FilterSelect
          value={filters.priority}
          label="Priority"
          options={priorities.map(
            priority => ({
              value: priority,
              label: priority,
            }),
          )}
          onChange={value =>
            updateFilter(
              "priority",
              value,
            )
          }
        />

        <FilterSelect
          value={filters.frequency}
          label="Frequency"
          options={frequencies.map(
            frequency => ({
              value: frequency,
              label: frequency,
            }),
          )}
          onChange={value =>
            updateFilter(
              "frequency",
              value,
            )
          }
        />

        <FilterSelect
          value={filters.duration}
          label="Duration"
          options={[
            {
              value: "short",
              label: "15 minutes or less",
            },
            {
              value: "medium",
              label: "16–30 minutes",
            },
            {
              value: "long",
              label: "More than 30 minutes",
            },
          ]}
          onChange={value =>
            updateFilter(
              "duration",
              value as WorkflowFilters["duration"],
            )
          }
        />
      </div>
    </section>
  );
}

interface FilterSelectProps {
  value: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (
    value: string,
  ) => void;
}

function FilterSelect({
  value,
  label,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="grid gap-1.5">
      <span
        className="
          text-xs
          font-medium
          text-muted-foreground
        "
      >
        {label}
      </span>

      <select
        value={value}
        className="
          h-10
          rounded-lg
          border
          border-input
          bg-background
          px-3
          text-sm
          outline-none
          transition
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
        "
        onChange={event =>
          onChange(
            event.target.value,
          )
        }
      >
        <option value="all">
          All
        </option>

        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}