import { useCallback, useMemo, useRef, useState, type ElementType } from "react";
import { Briefcase, Building2, Check, ChevronDown, Cpu, Handshake, Layers, Loader2, Plus, Shield, Target, Users2, Wrench } from "lucide-react";
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
   * reset are all keyed to one role. "multi" filters All Topics by several.
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
  /**
   * Small explanatory line shown under the trigger, e.g. when the current selection was
   * inherited from elsewhere rather than chosen here directly -- so the reader understands
   * why a role is already showing instead of "Select Audience".
   */
  note?: string | null;
  /** Segment to start on, so a parent-held segment survives this picker remounting (e.g. a tab switch). */
  initialSegment?: string | null;
  /** Told whenever the reader picks a segment (null = All Segments). */
  onSegmentChange?: (segment: string | null) => void;
}

function roleIcon(externalId: string): ElementType {
  return ROLE_ICONS[externalId] ?? Briefcase;
}

function roleSegment(role: HuddleRoleResponse): string {
  return role.segment ?? "Other";
}

export function HuddleAudienceSelect({ roles, mode = "single", selectedIds, onChange, loading = false, errorMessage = null, note = null, initialSegment = null, onSegmentChange }: HuddleAudienceSelectProps) {
  const [open, setOpen] = useState(false);
  const [segmentOpen, setSegmentOpen] = useState(false);
  /** The segment picked in the first dropdown. null means "not chosen yet" (single) or "All Segments" (multi). */
  const [chosenSegment, setChosenSegment] = useState<string | null>(initialSegment);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const segmentContainerRef = useRef<HTMLDivElement | null>(null);
  const multi = mode === "multi";

  useDismissOnOutside(open, containerRef, useCallback(() => setOpen(false), []));
  useDismissOnOutside(segmentOpen, segmentContainerRef, useCallback(() => setSegmentOpen(false), []));

  // Segments keep first-appearance order so Enterprise leads, matching the reference design.
  // "All Roles" is pulled out of the segment groups and rendered as its own separate entry at
  // the end of the list instead. Sorted in with the named roles it landed alphabetically between
  // two of them, which read as a data error rather than the "every role" option it actually is.
  const allRolesRole = useMemo(() => roles.find((role) => role.name === "All Roles") ?? null, [roles]);
  const segments = useMemo(() => {
    const grouped = new Map<string, HuddleRoleResponse[]>();
    roles.forEach((role) => {
      if (role.name === "All Roles") return;
      const segment = roleSegment(role);
      const bucket = grouped.get(segment);
      if (bucket) bucket.push(role);
      else grouped.set(segment, [role]);
    });
    return [...grouped.entries()];
  }, [roles]);

  const selected = roles.filter((role) => selectedIds.includes(role.externalId));

  // The selection can arrive from outside (a saved Role Path role, or All Topics inheriting it),
  // so the segment follows the selection whenever the picked segment no longer contains it.
  // Otherwise the Segment dropdown would read one segment while the Role dropdown shows a role
  // from another.
  const selectedSegments = [...new Set(selected.filter((role) => role.name !== "All Roles").map(roleSegment))];
  const derivedSegment = selectedSegments.length === 1 ? selectedSegments[0] : null;
  const chosenSegmentFitsSelection = chosenSegment !== null && selected.every((role) => role.name !== "All Roles" && roleSegment(role) === chosenSegment);
  const activeSegment = chosenSegmentFitsSelection ? chosenSegment : selected.length === 0 ? chosenSegment : derivedSegment;

  // Roles offered in the second dropdown: only the active segment's, or every group when
  // multi-select is on "All Segments".
  const visibleSegments = activeSegment ? segments.filter(([segment]) => segment === activeSegment) : multi ? segments : [];
  const visibleRoles = [...visibleSegments.flatMap(([, segmentRoles]) => segmentRoles), ...(allRolesRole && !activeSegment ? [allRolesRole] : [])];
  const allSelected = visibleRoles.length > 0 && visibleRoles.every((role) => selectedIds.includes(role.externalId));
  const roleDisabled = !multi && !activeSegment;

  const chooseSegment = (segment: string | null) => {
    setChosenSegment(segment);
    onSegmentChange?.(segment);
    setSegmentOpen(false);
    // Drop any selected role outside the new segment, so the Role dropdown never holds a
    // role the reader can no longer see in its list.
    if (segment !== null) {
      const kept = selected.filter((role) => role.name !== "All Roles" && roleSegment(role) === segment).map((role) => role.externalId);
      if (kept.length !== selectedIds.length) onChange(kept);
      // Role Path needs a role next, so move straight on to the role list.
      if (!multi) setOpen(true);
    } else if (selectedIds.length > 0) {
      // "All Segments" resets the audience. Keeping the roles would also snap the Segment
      // dropdown straight back to their segment (see activeSegment above).
      onChange([]);
    }
  };

  /** Renders the trigger icon. A helper (like renderRole below) rather than a JSX-tag
   * variable, since the icon can switch between different components as the selection
   * changes. */
  const renderTriggerIcon = () => {
    const Icon = selected.length === 1 ? roleIcon(selected[0].externalId) : Briefcase;
    return <Icon className="h-4 w-4 flex-none text-[#0F6CBD]" />;
  };

  const toggle = (externalId: string) => {
    if (!multi) {
      onChange([externalId]);
      setOpen(false);
      return;
    }
    onChange(selectedIds.includes(externalId) ? selectedIds.filter((id) => id !== externalId) : [...selectedIds, externalId]);
  };

  /** One selectable role row. Shared by the segment groups and the standalone "All Roles" entry. */
  const renderRole = (role: HuddleRoleResponse) => {
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
  };

  return (
    <div className={cn("w-full min-w-0", !multi && "max-w-[540px]")}>
      <div className="grid grid-cols-2 gap-3">
        <div ref={segmentContainerRef} className="relative min-w-0">
          <span className="mb-1.5 block text-xs font-medium text-[#424242]">Segment</span>
          <button
            type="button"
            role="combobox"
            aria-expanded={segmentOpen}
            aria-haspopup="listbox"
            aria-label="Segment"
            onClick={() => setSegmentOpen((value) => !value)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F6CBD]/25",
              activeSegment ? "border-[#0F6CBD]/60" : "border-input",
            )}
          >
            {activeSegment ? (
              <span className="flex min-w-0 items-center gap-2"><Layers className="h-4 w-4 flex-none text-[#0F6CBD]" /><span className="truncate">{activeSegment}</span></span>
            ) : (
              <span className="flex min-w-0 items-center gap-2 font-normal text-muted-foreground"><Layers className="h-4 w-4 flex-none" /><span className="truncate">{multi ? "All Segments" : "Select Segment"}</span></span>
            )}
            <ChevronDown className={cn("ml-2 h-4 w-4 flex-none text-muted-foreground transition-transform", segmentOpen && "rotate-180")} />
          </button>

          {segmentOpen && (
            <div role="listbox" aria-label="Segment" className="absolute left-0 top-full z-30 mt-1 max-h-72 w-full min-w-[200px] overflow-y-auto rounded-lg border bg-white py-1 shadow-xl">
              {loading && segments.length === 0 && (
                <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin text-[#0F6CBD]" />Loading segments...</p>
              )}
              {!loading && errorMessage && <p className="px-3 py-2 text-sm text-[#A80000]" role="alert">{errorMessage}</p>}
              {!loading && !errorMessage && segments.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No segments available.</p>}
              {multi && segments.length > 0 && (
                <button type="button" role="option" aria-selected={activeSegment === null} onClick={() => chooseSegment(null)} className={cn("block w-full px-3 py-2 text-left text-sm", activeSegment === null ? "bg-[#E8F2FF] font-semibold text-[#0F6CBD]" : "hover:bg-[#F5F9FF]")}>
                  All Segments
                </button>
              )}
              {segments.map(([segment, segmentRoles]) => (
                <button
                  key={segment}
                  type="button"
                  role="option"
                  aria-selected={segment === activeSegment}
                  onClick={() => chooseSegment(segment)}
                  className={cn("flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm", segment === activeSegment ? "bg-[#E8F2FF] font-semibold text-[#0F6CBD]" : "hover:bg-[#F5F9FF]")}
                >
                  <span className="truncate">{segment}</span>
                  <span className="flex-none text-[11px] font-normal text-muted-foreground">{segmentRoles.length} role{segmentRoles.length === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

    <div ref={containerRef} className="relative min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-[#424242]">Role <span aria-hidden="true">&#9432;</span></span>

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Role"
        disabled={roleDisabled}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F6CBD]/25 disabled:cursor-not-allowed disabled:bg-muted/40",
          selected.length > 0 ? "border-[#0F6CBD]/60" : "border-input",
        )}
      >
        {roleDisabled && !loading ? (
          <span className="flex min-w-0 items-center gap-2 font-normal text-muted-foreground"><Briefcase className="h-4 w-4 flex-none" /><span className="truncate">Select a segment first</span></span>
        ) : selected.length === 0 && loading ? (
          <span className="flex items-center gap-2 font-normal text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-[#0F6CBD]" />Loading audience...</span>
        ) : selected.length === 0 ? (
          <span className="flex items-center gap-2 font-normal text-muted-foreground"><Briefcase className="h-4 w-4 flex-none" /><span className="truncate">Select Role</span></span>
        ) : selected.length === 1 ? (
          // A single selected role always reads by its full name here, in both single- and
          // multi-select mode -- the abbreviation ("AE") only appears once two or more roles are
          // selected and space is genuinely tight (see the chip row just below).
          <span className="flex min-w-0 items-center gap-2">{renderTriggerIcon()}<span className="truncate">{selected[0].name}</span></span>
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
            <p className="text-base font-semibold">Select Role</p>
            <p className="text-xs text-muted-foreground">
              {multi ? "Choose one or more" : "Choose one"} {activeSegment ? `${activeSegment} ` : "audience "}role{multi ? "s" : ""} for the Huddle
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              {multi ? (
                <button
                  type="button"
                  disabled={loading || visibleRoles.length === 0}
                  onClick={() => {
                    // Scoped to the roles in view, so Select All inside one segment does not also pick every other segment's roles.
                    const visibleIds = visibleRoles.map((role) => role.externalId);
                    onChange(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedIds, ...visibleIds])]);
                  }}
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
            {!loading && !errorMessage && visibleRoles.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">No audience roles available.</p>}
            {visibleSegments.map(([segment, segmentRoles]) => (
              <div key={segment} className="mb-3 last:mb-0">
                {/* The Segment dropdown already names a single segment; the badge only helps when every segment is listed. */}
                {!activeSegment && (
                  <div className="mb-1 px-2 py-1.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", SEGMENT_STYLES[segment] ?? "border-input bg-muted text-muted-foreground")}>{segment}</span>
                  </div>
                )}

                {segmentRoles.map((role) => renderRole(role))}
              </div>
            ))}
            {allRolesRole && !activeSegment && (
              <div className="mt-1 border-t pt-3">
                <div className="mb-1 px-2 py-1.5">
                  <span className="rounded-full border border-input bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Every role</span>
                </div>
                {renderRole(allRolesRole)}
              </div>
            )}
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
      </div>
      {note && <p className="mt-1 text-[11px] italic text-muted-foreground">{note}</p>}
    </div>
  );
}
