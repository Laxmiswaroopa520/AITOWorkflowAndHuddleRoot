import {
  Search,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface WorkflowHistoryFiltersProps {
  search: string;
  favoritesOnly: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onFavoritesOnlyChange: (
    value: boolean,
  ) => void;

  onClear: () => void;
}

export function WorkflowHistoryFilters({
  search,
  favoritesOnly,
  onSearchChange,
  onFavoritesOnlyChange,
  onClear,
}: WorkflowHistoryFiltersProps) {
  const hasFilters =
    Boolean(search.trim()) ||
    favoritesOnly;

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-3
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
      "
    >
      <label
        className="
          relative
          min-w-[240px]
          flex-1
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
          value={search}
          type="search"
          placeholder="Search workflows..."
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
            focus:border-primary
            focus:ring-2
            focus:ring-primary/20
          "
          onChange={event =>
            onSearchChange(
              event.target.value,
            )
          }
        />
      </label>

      <label
        className="
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-border
          bg-background
          px-3
          py-2
          text-sm
        "
      >
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={event =>
            onFavoritesOnlyChange(
              event.target.checked,
            )
          }
        />

        Favorites only
      </label>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={onClear}
        >
          <X
            className="h-4 w-4"
          />

          Clear
        </Button>
      )}
    </div>
  );
}