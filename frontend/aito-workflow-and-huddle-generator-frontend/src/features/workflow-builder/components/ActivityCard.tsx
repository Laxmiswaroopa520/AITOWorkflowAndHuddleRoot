import {
  Check,
  Clock,
} from "lucide-react";

import {
  motion,
} from "motion/react";

import {
  cn,
} from "@/lib/utils";

import type {
  Activity,
} from "../types/activity.types";

import {
  CATEGORY_STYLES,
} from "../constants/workflowStyles";

import {
  AiToolBadge,
} from "./AiToolBadge";

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleDetails: () => void;
}
export function ActivityCard({
  activity,
  isSelected,
  onToggle,
}: ActivityCardProps) {
  const categoryStyle =
    CATEGORY_STYLES[
      activity.category
    ] ??
    CATEGORY_STYLES.Admin;

  return (
    <motion.article
      layout
      whileHover={{
        y: -2,
      }}
      className={cn(
        `
          relative
          h-full cursor-pointer overflow-hidden rounded-xl
          border-2
          bg-card
          transition-all
          duration-200
        `,

        isSelected
          ? `
              border-primary bg-primary/5 shadow-lg shadow-primary/10
            `
          : `
              border-transparent
              hover:border-primary/30
              hover:shadow-md
            `,
      )}
    >
      <button
        type="button"
        aria-pressed={isSelected}
        className="
          absolute left-4 top-4 z-10
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-md
          border
          border-border
          bg-background
          transition
          hover:border-primary
        "
        onClick={onToggle}
      >
        {isSelected && (
          <span
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              rounded-[5px]
              bg-primary
              text-primary-foreground
            "
          >
            <Check
              className="h-3.5 w-3.5"
            />
          </span>
        )}
      </button>

      <div className="p-4 pl-12" onClick={onToggle}>
        <div className="hidden">
          <span
            className={cn(
              `
                rounded-full
                border
                px-2
                py-0.5
                text-[10px]
                font-medium
              `,
              categoryStyle.background,
              categoryStyle.text,
              categoryStyle.border,
            )}
          >
            {activity.category}
          </span>

          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-secondary
              px-2
              py-0.5
              text-[10px]
              font-medium
              text-secondary-foreground
            "
          >
            <Clock
              className="
                mr-1
                h-2.5
                w-2.5
              "
            />

            {activity.durationMinutes}m
          </span>

          <span
            className="
              rounded-full
              border
              border-border
              px-2
              py-0.5
              text-[10px]
              text-muted-foreground
            "
          >
            {activity.frequency}
          </span>
        </div>

        <div className="flex items-center gap-2"><h3
          className="
            text-sm
            font-semibold
            leading-5
            text-foreground
          "
        >
          {activity.title}
        </h3>{activity.priority === "High" && <span className="rounded bg-destructive/10 px-1.5 text-[10px] text-destructive">High</span>}</div>

        {activity.description && (
          <p
            className={cn(
              `
                mt-1.5
                text-xs
                leading-5
                text-muted-foreground
              `,
              "line-clamp-2",
            )}
          >
            {activity.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", categoryStyle.background, categoryStyle.text, categoryStyle.border)}>{activity.category}</span>
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"><Clock className="mr-1 h-2.5 w-2.5" />{activity.durationMinutes}m</span>
          <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{activity.frequency}</span>
        </div>

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            gap-1
          "
        >
          {activity.aiTools
            .slice(0, 2)
            .map(tool => (
              <AiToolBadge
                key={tool.id}
                name={tool.name}
                color={tool.color}
                isPrimary={
                  tool.isPrimary
                }
              />
            ))}

          {activity.aiTools.length >
            2 && (
            <span
              className="
                text-[10px]
                text-muted-foreground
              "
            >
              +
              {activity.aiTools.length -
                2}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
