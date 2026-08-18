import { cn } from "@/lib/utils";
import { TIMELINE_OPTIONS, type TimelineView } from "../types/timeline.types";

interface TimelineToggleProps {
  value: TimelineView;
  onChange: (value: TimelineView) => void;
}

export function TimelineToggle({ value, onChange }: TimelineToggleProps) {
  return (
    <div className="flex max-w-full items-center overflow-x-auto rounded-xl border border-border bg-muted/50 p-1" aria-label="Workflow timeline">
      {TIMELINE_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
