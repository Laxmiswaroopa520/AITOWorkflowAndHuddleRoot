import { AlertTriangle, CalendarDays, Download, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAddWorkflowCalendarEvents } from "../hooks/useAddWorkflowCalendarEvents";
import type { WorkflowCalendarItem } from "../types/workflowCalendar.types";

interface CalendarReviewDialogProps { open: boolean; onOpenChange: (open: boolean) => void; items: WorkflowCalendarItem[]; }
const localInput = (iso: string) => { const date = new Date(iso); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); };
const escapeIcs = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const icsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export function CalendarReviewDialog({ open, onOpenChange, items }: CalendarReviewDialogProps) {
  const [draft, setDraft] = useState(items);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const mutation = useAddWorkflowCalendarEvents();
  const resetMutation = mutation.reset;
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => { setDraft(items); setIncluded(Object.fromEntries(items.map(item => [item.requestId, true]))); resetMutation(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [open, items, resetMutation]);
  const selected = useMemo(() => draft.filter(item => included[item.requestId]), [draft, included]);
  const totalMinutes = selected.reduce((sum, item) => sum + Math.max(0, (new Date(item.end).getTime() - new Date(item.start).getTime()) / 60000), 0);
  if (!open) return null;
  const update = (id: string, field: "subject" | "start" | "end", value: string) => setDraft(current => current.map(item => item.requestId === id ? { ...item, [field]: field === "subject" ? value : new Date(value).toISOString() } : item));
  const downloadIcs = () => {
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AITO//Workflow Schedule//EN", ...selected.flatMap(item => ["BEGIN:VEVENT", `UID:${item.requestId}@aito`, `DTSTART:${icsDate(item.start)}`, `DTEND:${icsDate(item.end)}`, `SUMMARY:${escapeIcs(item.subject)}`, `DESCRIPTION:${escapeIcs(item.body)}`, "END:VEVENT"]), "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "aito-workflow-schedule.ics"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
      <header className="flex items-start justify-between border-b px-6 py-5"><div><h2 id="calendar-title" className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="h-5 w-5 text-primary" />Add your workflow to calendar</h2><p className="mt-1 text-sm text-muted-foreground">Review each time block, adjust dates or times, then export or sync to Outlook.</p></div><button type="button" onClick={() => onOpenChange(false)} aria-label="Close"><X className="h-5 w-5" /></button></header>
      <div className="overflow-y-auto p-6">
        {totalMinutes > 480 && <div className="mb-4 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"><AlertTriangle className="h-5 w-5" /><span>This calendar plan exceeds the recommended 8-hour day.</span></div>}
        <div className="space-y-3">{draft.map(item => <article key={item.requestId} className="rounded-xl border p-4"><div className="grid gap-4 md:grid-cols-[auto_1fr_210px_210px]"><input type="checkbox" checked={Boolean(included[item.requestId])} onChange={event => setIncluded(current => ({ ...current, [item.requestId]: event.target.checked }))} aria-label={`Include ${item.subject}`} /><div><label className="text-xs font-semibold text-muted-foreground">Activity</label><input className="mt-1 w-full rounded-md border px-3 py-2 font-medium" value={item.subject} onChange={event => update(item.requestId, "subject", event.target.value)} /><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.body}</p></div><label className="text-xs font-semibold text-muted-foreground">Starts<input type="datetime-local" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-normal text-foreground" value={localInput(item.start)} onChange={event => update(item.requestId, "start", event.target.value)} /></label><label className="text-xs font-semibold text-muted-foreground">Ends<input type="datetime-local" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-normal text-foreground" value={localInput(item.end)} onChange={event => update(item.requestId, "end", event.target.value)} /></label></div></article>)}</div>
        {mutation.error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{mutation.error.message}</p>}{mutation.isSuccess && <p role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Added {mutation.data.createdCount} events to your Outlook calendar.</p>}
      </div>
      <footer className="flex flex-wrap justify-end gap-3 border-t px-6 py-4"><Button variant="outline" disabled={!selected.length || mutation.isPending} onClick={downloadIcs}><Download className="mr-2 h-4 w-4" />Export .ics</Button><Button disabled={!selected.length || mutation.isPending} onClick={() => mutation.mutate(selected)}>{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}Add to Outlook</Button></footer>
    </div>
  </div>;
}
