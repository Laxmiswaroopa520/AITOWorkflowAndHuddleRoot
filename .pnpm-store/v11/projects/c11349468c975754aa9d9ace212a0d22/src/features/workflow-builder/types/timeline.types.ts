export type TimelineView = "day" | "week" | "month" | "quarter" | "year";

export const TIMELINE_OPTIONS: ReadonlyArray<{ value: TimelineView; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

export const TIMELINE_LABELS: Record<TimelineView, string> = {
  day: "Your Day",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
};
