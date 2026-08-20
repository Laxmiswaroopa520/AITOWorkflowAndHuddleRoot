import { useCallback, useRef, useState } from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";

interface ReplacementOption {
  externalId: string;
  name: string;
}

interface RolePathWeekMenuProps {
  week: number;
  weeks: readonly number[];
  replacements: readonly ReplacementOption[];
  isCustomized: boolean;
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveToWeek: (week: number) => void;
  onReplace: (externalId: string) => void;
  onReset: () => void;
}

type Submenu = "week" | "huddle";

const ROW =
  "flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-[#F5F9FF] disabled:pointer-events-none disabled:opacity-40";
const SUBMENU_PANEL =
  "absolute left-full top-[-5px] z-50 ml-1 rounded-lg border border-[#E1DFDD] bg-white p-1 shadow-xl";
const SUBMENU_ITEM =
  "block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#F5F9FF] disabled:pointer-events-none disabled:opacity-40";

/**
 * "Move to week" and "Replace Huddle" live in flyout submenus rather than inline
 * selects, so the panel stays short and the long Huddle list scrolls in its own
 * column. Submenus fly out to the right of the panel.
 */
export function RolePathWeekMenu(props: RolePathWeekMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [submenu, setSubmenu] = useState<Submenu | null>(null);

  const { onOpenChange } = props;
  const close = useCallback(() => {
    setSubmenu(null);
    onOpenChange(false);
  }, [onOpenChange]);
  useDismissOnOutside(props.open, containerRef, close);

  const toggleSubmenu = (next: Submenu) => setSubmenu(submenu === next ? null : next);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => {
          setSubmenu(null);
          props.onOpenChange(!props.open);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-muted-foreground hover:bg-[#E8F2FF] disabled:opacity-40"
        aria-label={`Manage Week ${props.week}`}
        aria-haspopup="menu"
        aria-expanded={props.open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {props.open && (
        <div role="menu" className="absolute right-0 z-50 mt-1 w-60 rounded-lg border border-[#E1DFDD] bg-white p-1 shadow-xl">
          <p className="px-3 py-2 text-sm font-semibold">Manage Week {props.week}</p>

          <div className="relative" onMouseEnter={() => setSubmenu("week")}>
            <button
              type="button"
              onClick={() => toggleSubmenu("week")}
              className={cn(ROW, submenu === "week" && "bg-[#F5F9FF]")}
              aria-haspopup="menu"
              aria-expanded={submenu === "week"}
            >
              <span>Move to week</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {submenu === "week" && (
              <div role="menu" className={cn(SUBMENU_PANEL, "w-40")}>
                {props.weeks.map((weekOption) => (
                  <button
                    key={weekOption}
                    type="button"
                    disabled={weekOption === props.week}
                    onClick={() => {
                      props.onMoveToWeek(weekOption);
                      close();
                    }}
                    className={SUBMENU_ITEM}
                  >
                    Week {weekOption}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => setSubmenu("huddle")}>
            <button
              type="button"
              onClick={() => toggleSubmenu("huddle")}
              className={cn(ROW, submenu === "huddle" && "bg-[#F5F9FF]")}
              aria-haspopup="menu"
              aria-expanded={submenu === "huddle"}
            >
              <span>Replace Huddle</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {submenu === "huddle" && (
              <div role="menu" className={cn(SUBMENU_PANEL, "max-h-80 w-80 overflow-y-auto")}>
                {props.replacements.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Every Huddle is already on this path.</p>
                ) : (
                  props.replacements.map((candidate) => (
                    <button
                      key={candidate.externalId}
                      type="button"
                      onClick={() => {
                        props.onReplace(candidate.externalId);
                        close();
                      }}
                      className={SUBMENU_ITEM}
                    >
                      {candidate.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="my-1 h-px bg-[#E1DFDD]" />

          <button
            type="button"
            disabled={!props.isCustomized}
            onClick={() => {
              props.onReset();
              close();
            }}
            className={SUBMENU_ITEM}
          >
            Reset this week
          </button>
        </div>
      )}
    </div>
  );
}
