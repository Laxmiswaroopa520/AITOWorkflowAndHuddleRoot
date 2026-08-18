import {
  motion,
} from "motion/react";

import {
  cn,
} from "@/lib/utils";

import {
  SEGMENT_STYLES,
} from "../constants/workflowStyles";

interface SegmentTabsProps {
  segments: string[];
  selectedSegment: string;
  onSelect: (
    segment: string,
  ) => void;
}

export function SegmentTabs({
  segments,
  selectedSegment,
  onSelect,
}: SegmentTabsProps) {
  const allSegments = [
    "All",
    ...segments,
  ];

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
      role="tablist"
      aria-label="Role segments"
    >
      {allSegments.map(segment => {
        const isSelected =
          selectedSegment === segment;

        const style =
          SEGMENT_STYLES[segment];

        return (
          <motion.button
            key={segment}
            type="button"
            role="tab"
            aria-selected={
              isSelected
            }
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className={cn(
              `
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-medium
                transition-all
              `,

              isSelected &&
                segment === "All" &&
                `
                  border-primary
                  bg-primary
                  text-primary-foreground
                  shadow-sm
                `,

              !isSelected &&
                segment === "All" &&
                `
                  border-border
                  bg-card
                  text-muted-foreground
                  hover:border-primary/40
                  hover:text-foreground
                `,

              isSelected &&
                style?.pillActive,

              isSelected &&
                style?.pillBorder,

              !isSelected &&
                segment !== "All" &&
                `
                  border-border
                  bg-card
                  text-muted-foreground
                  hover:text-foreground
                `,
            )}
            onClick={() =>
              onSelect(segment)
            }
          >
            {segment}
          </motion.button>
        );
      })}
    </div>
  );
}