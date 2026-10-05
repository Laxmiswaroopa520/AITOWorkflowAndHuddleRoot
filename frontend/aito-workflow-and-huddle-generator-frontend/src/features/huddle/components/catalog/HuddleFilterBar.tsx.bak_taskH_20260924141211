import { useCallback, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { HuddleAudienceSelect } from "../audience";
import type { HuddleRoleResponse } from "../../types";

export interface HuddleFilterOption { value: string; label: string }

interface HuddleFilterBarProps {
  filters: { focusArea: string; agent: string; sort: string; search: string };
  options: { focusAreas: HuddleFilterOption[]; agents: HuddleFilterOption[] };
  /** Full role list backing the audience popover. */
  roles: HuddleRoleResponse[];
  /** The role list is still loading, so the audience popover says so instead of showing empty. */
  rolesLoading?: boolean;
  rolesErrorMessage?: string | null;
  audienceRoleIds: string[];
  onAudienceChange: (selectedIds: string[]) => void;
  /** Small explanatory line under the Audience picker, e.g. when its selection was inherited rather than chosen here. */
  audienceNote?: string | null;
  onFilterChange: (name: "focusArea" | "agent" | "sort" | "search", value: string) => void;
}

const SORT_OPTIONS: HuddleFilterOption[] = [
  { value: "role-relevance", label: "Role relevance" },
  { value: "most-upvoted", label: "Most upvoted" },
  { value: "default", label: "Default order" },
];

/**
 * A hand-rolled listbox rather than a native <select>. The browser positions a native
 * popup itself and flips long lists (Focus Area) upward over the page header, so the
 * panel is placed here instead and always opens downward with its own scroll.
 */
function FilterSelect({ label, value, options, allLabel, showAllOption = true, onChange }: { label: string; value: string; options: HuddleFilterOption[]; allLabel: string; showAllOption?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useDismissOnOutside(open, containerRef, useCallback(() => setOpen(false), []));

  const selectedLabel = options.find((option) => option.value === value)?.label ?? allLabel;
  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground">{label}</span>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 text-left text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={cn("ml-2 h-4 w-4 flex-none text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" aria-label={label} className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border bg-white py-1 shadow-xl">
          {(showAllOption ? [{ value: "", label: allLabel }, ...options] : options).map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => choose(option.value)}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm",
                option.value === value ? "bg-[#E8F2FF] font-semibold text-[#0F6CBD]" : "hover:bg-[#F5F9FF]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sits above the main content grid so the filters span the full page width, matching
 * the governed reference layout, rather than being confined to the topic column.
 */
export function HuddleFilterBar({ filters, options, roles, rolesLoading = false, rolesErrorMessage = null, audienceRoleIds, onAudienceChange, audienceNote = null, onFilterChange }: HuddleFilterBarProps) {
  return (
    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-5">
      <HuddleAudienceSelect mode="multi" roles={roles} loading={rolesLoading} errorMessage={rolesErrorMessage} selectedIds={audienceRoleIds} onChange={onAudienceChange} note={audienceNote} />
      <FilterSelect label="Focus Area" value={filters.focusArea} options={options.focusAreas} allLabel="All Focus Areas" onChange={(value) => onFilterChange("focusArea", value)} />
      <FilterSelect label="AI Tool" value={filters.agent} options={options.agents} allLabel="All AI Tools" onChange={(value) => onFilterChange("agent", value)} />
      <FilterSelect label="Sort" value={filters.sort} options={SORT_OPTIONS} allLabel="Default order" showAllOption={false} onChange={(value) => onFilterChange("sort", value)} />
      <label className="block min-w-0"><span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground">Search</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} placeholder="Search Huddles" className="h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]" /></span></label>
    </div>
  );
}
