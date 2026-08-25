import { useCallback, useMemo, useRef, useState, type ElementType } from "react";
import { Briefcase, Building2, Check, ChevronDown, Cpu, Handshake, Loader2, Plus, Shield, Target, Users2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import type { HuddleRoleResponse } from "../../types";

/** Icons for the governed roles, keyed by the seeded role external IDs. */
const ROLE_ICONS: Record<string, ElementType> = {
  "ae-ent": Briefcase,
  "ce-ent": Building2,
  "ats-ent": Cpu,
  "ssp-ent": Target,
  "se-ent": Wrench,
  "csa-ces": Shield,
  "csam-ces": Users2,
  "sm-mgr": Handshake,
};

const SEGMENT_STYLES: Record<string, string> = {
  Enterprise: "border-[#0F6CBD]/20 bg-[#0F6CBD]/10 text-[#115EA3]",
  "CE&S": "border-[#0E7C66]/25 bg-[#0E7C66]/10 text-[#0B5F4E]",
  Manager: "border-[#D83B01]/30 bg-[#FFF4CE] text-[#8A4B08]",
};

interface HuddleAudienceSelectProps {
  roles: HuddleRoleResponse[];
  /**
   * "single" keeps exactly one role, because the Role Path, its saved plan, and its
   * reset are all keyed to one role. "multi" filters Additional Topics by several.
   */
  mode?: "single" | "multi";
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  /**
   * The roles are still being read. An empty list means two different things to a reader, so
   * loading has to say so rather than claiming there are no roles.
   */
  loading?: boolean;
  /** Shown in place of the list when the read failed, so a failure is not read as an empty result. */
  errorMessage?: string | null;
}

function roleIcon(externalId: string): ElementType {
  return ROLE_ICONS[externalId] ?? Briefcase;
}

export function HuddleAudienceSelect({ roles, mode = "single", selectedIds, onChange, loading = false, errorMessage = null }: HuddleAudienceSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const multi = mode === "multi";

  useDismissOnOutside(open, containerRef, useCallback(() => setOpen(false), []));

  // Segments keep first-appearance order so Enterprise leads, matching the reference design.
  const segments = useMemo(() => {
    const grouped = new Map<string, HuddleRoleResponse[]>();
    roles.forEach((role) => {
      const segment = role.segment ?? "Other";
      const bucket = grouped.get(segment);
      if (bucket) bucket.push(role);
      else grouped.set(segment, [role]);
    });
    return [...grouped.entries()];
  }, [roles]);

  const selected = roles.filter((role) => selectedIds.includes(role.externalId));
  const allSelected = roles.length > 0 && selected.length === roles.length;
  const TriggerIcon = selected.length === 1 ? roleIcon(selected[0].externalId) : Briefcase;

  const toggle = (externalId: string) => {
    if (!multi) {
      onChange([externalId]);
      setOpen(false);
      return;
    }
    onChange(selectedIds.includes(externalId) ? selectedIds.filter((id) => id !== externalId) : [...selectedIds, externalId]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[260px]">
      <span className="mb-1.5 block text-xs font-medium text-[#424242]">Audience <span aria-hidden="true">&#9432;</span></span>

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F6CBD]/25",
          selected.length > 0 ? "border-[#0F6CBD]/60" : "border-input",
        )}
      >
        {selected.length === 0 && loading ? (
          <span className="flex items-center gap-2 font-normal text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-[#0F6CBD]" />Loading audience...</span>
        ) : selected.length === 0 ? (
          <span className="flex items-center gap-2 font-normal text-muted-foreground"><Briefcase className="h-4 w-4" />Select Audience</span>
        ) : selected.length === 1 ? (
          <span className="flex min-w-0 items-center gap-2"><TriggerIcon className="h-4 w-4 flex-none text-[#0F6CBD]" /><span className="truncate">{multi ? selected[0].abbreviation : selected[0].name}</span></span>
        ) : (
          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            {selected.slice(0, 2).map((role) => <span key={role.externalId} className="rounded-full border border-[#0F6CBD]/20 bg-[#0F6CBD]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#115EA3]">{role.abbreviation}</span>)}
            {selected.length > 2 && <span className="text-[10px] font-semibold text-[#115EA3]">+{selected.length - 2}</span>}
          </span>
        )}
        <ChevronDown className={cn("ml-2 h-4 w-4 flex-none text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" aria-multiselectable={multi} className="absolute left-0 z-30 mt-1 w-80 overflow-hidden rounded-xl border bg-white shadow-xl">
          <div className="border-b p-3">
            <p className="text-base font-semibold">Select Audience</p>
            <p className="text-xs text-muted-foreground">{multi ? "Choose one or more audience roles for the Huddle" : "Choose one audience role for the Huddle"}</p>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              {multi ? (
                <button
                  type="button"
                  disabled={loading || roles.length === 0}
                  onClick={() => onChange(allSelected ? [] : roles.map((role) => role.externalId))}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                    allSelected ? "border-[#0F6CBD] bg-[#0F6CBD] text-white hover:bg-[#115EA3]" : "border-[#0F6CBD]/30 bg-[#0F6CBD]/[0.08] text-[#115EA3] hover:bg-[#0F6CBD]/[0.16]",
                  )}
                >
                  {allSelected ? <><Check className="h-3.5 w-3.5" />Deselect All</> : <><Plus className="h-3.5 w-3.5" />Select All</>}
                </button>
              ) : (
                <span />
              )}
              {selected.length > 0 && (
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{selected.length} selected</span>
                  <button type="button" onClick={() => onChange([])} className="text-[11px] font-semibold text-[#0F6CBD] hover:underline">Clear</button>
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && (
              <p className="flex items-center justify-center gap-2 px-2 py-6 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-[#0F6CBD]" />Loading audience roles...
              </p>
            )}
            {!loading && errorMessage && <p className="px-2 py-6 text-center text-sm text-[#A80000]" role="alert">{errorMessage}</p>}
            {!loading && !errorMessage && segments.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">No audience roles available.</p>}
            {segments.map(([segment, segmentRoles]) => (
              <div key={segment} className="mb-3 last:mb-0">
                <div className="mb-1 px-2 py-1.5">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", SEGMENT_STYLES[segment] ?? "border-input bg-muted text-muted-foreground")}>{segment}</span>
                </div>

                {segmentRoles.map((role) => {
                  const Icon = roleIcon(role.externalId);
                  const isChecked = selectedIds.includes(role.externalId);

                  return (
                    <button
                      key={role.externalId}
                      type="button"
                      role="option"
                      aria-selected={isChecked}
                      onClick={() => toggle(role.externalId)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        isChecked ? "border-[#0F6CBD]/25 bg-[#0F6CBD]/[0.08]" : "border-transparent hover:bg-[#F5F9FF]",
                      )}
                    >
                      {multi && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          tabIndex={-1}
                          onChange={() => toggle(role.externalId)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Select ${role.name}`}
                          className="mt-1 h-4 w-4 flex-none cursor-pointer rounded accent-[#0F6CBD]"
                        />
                      )}
                      <span className={cn("flex-none rounded-lg p-2", isChecked ? "bg-[#0F6CBD]/15" : "bg-muted")}>
                        <Icon className={cn("h-4 w-4", isChecked ? "text-[#0F6CBD]" : "text-muted-foreground")} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", isChecked ? "text-[#115EA3]" : "text-foreground")}>{role.name}</span>
                          {!multi && isChecked && <Check className="h-4 w-4 flex-none text-[#0F6CBD]" />}
                        </span>
                        {/* Always rendered: a collapsed row hides whether the copy is missing or the field is. */}
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{role.description ?? "Description unavailable."}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {multi && (
            <div className="border-t p-3">
              <button type="button" onClick={() => setOpen(false)} className="w-full rounded-lg bg-[#0F6CBD] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#115EA3]">
                {selected.length === 0 ? "Done" : `Done — ${selected.length} role${selected.length > 1 ? "s" : ""} selected`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
