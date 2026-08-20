import { ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomLearningPlanCardProps {
  selectedCount: number;
  exporting: boolean;
  onBuild: () => void;
  onExport: () => void;
  onClear: () => void;
}

/**
 * Sticky action bar for the Additional Topics custom learning plan.
 * Rendered only while at least one topic is selected.
 */
export function CustomLearningPlanCard({ selectedCount, exporting, onBuild, onExport, onClear }: CustomLearningPlanCardProps) {
  return (
    <div className="sticky top-2 z-10 rounded-2xl border border-[#C7E0F4] bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,108,189,0.10)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[190px]">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-[#0F6CBD]" />
            <p className="font-semibold text-[#16233A]">Custom Learning Plan</p>
            <span className="rounded-full bg-[#E8F2FF] px-2 py-0.5 text-xs font-semibold text-[#0F6CBD]">{selectedCount} selected</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Arrange, export, or clear your selected topics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-[#0F6CBD] text-white hover:bg-[#115EA3]" onClick={onBuild}>Build Learning Plan</Button>
          <Button size="sm" variant="outline" disabled={exporting} onClick={onExport}>{exporting ? "Exporting..." : "Export Learning Plan"}</Button>
          <Button size="sm" variant="ghost" onClick={onClear}>Clear Selection</Button>
        </div>
      </div>
    </div>
  );
}
