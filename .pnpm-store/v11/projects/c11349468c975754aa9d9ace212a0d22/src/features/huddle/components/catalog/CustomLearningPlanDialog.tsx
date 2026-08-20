import { useEffect } from "react";
import { ArrowDown, ArrowUp, Bot, Clock, Target, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMcemStageLabel } from "../../mappers";
import type { HuddleCatalogItemResponse } from "../../types";

interface CustomLearningPlanDialogProps {
  /** Selected huddles already in the facilitator's chosen order. */
  huddles: readonly HuddleCatalogItemResponse[];
  exporting: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (externalId: string) => void;
  onClear: () => void;
  onExport: () => void;
  onClose: () => void;
}

function agentLabel(names: readonly string[]): string {
  return names.length === 0 ? "None" : names.join(", ");
}

export function CustomLearningPlanDialog({ huddles, exporting, onMove, onRemove, onClear, onExport, onClose }: CustomLearningPlanDialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Custom learning plan"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b bg-[#F7FAFC] p-6">
          <div>
            <h2 className="text-xl font-semibold text-[#16233A]">Custom Learning Plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Arrange the selected topics in the order you want to run or share them.</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close custom learning plan" onClick={onClose}><X className="h-4 w-4" /></Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {huddles.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white py-10 text-center text-sm text-muted-foreground">
              No topics selected yet. Tick a Huddle in Additional Topics to start a plan.
            </div>
          ) : (
            <ol className="space-y-3">
              {huddles.map((huddle, index) => (
                <li key={huddle.externalId} className="grid gap-4 rounded-2xl border border-[#E0E6ED] bg-white p-4 md:grid-cols-[42px_1fr_auto] md:items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F2FF] text-sm font-bold text-[#0F6CBD]">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#16233A]">{huddle.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{huddle.description ?? "Description unavailable."}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Bot className="h-3 w-3" />{agentLabel(huddle.primaryAgents.map((agent) => agent.name))}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{huddle.durationMinutes === null ? "Duration unavailable" : `${huddle.durationMinutes} min`}</span>
                      {formatMcemStageLabel(huddle.mcemStages ?? []) && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{formatMcemStageLabel(huddle.mcemStages ?? [])}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" title="Move up" aria-label={`Move ${huddle.name} up`} disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" title="Move down" aria-label={`Move ${huddle.name} down`} disabled={index === huddles.length - 1} onClick={() => onMove(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Remove" aria-label={`Remove ${huddle.name} from the plan`} onClick={() => onRemove(huddle.externalId)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <footer className="flex flex-wrap justify-between gap-3 border-t bg-white p-4">
          <Button variant="ghost" disabled={huddles.length === 0} onClick={onClear}>Clear Selection</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Done</Button>
            <Button className="bg-[#0F6CBD] text-white hover:bg-[#115EA3]" disabled={exporting || huddles.length === 0} onClick={onExport}>{exporting ? "Exporting..." : "Export Learning Plan"}</Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
