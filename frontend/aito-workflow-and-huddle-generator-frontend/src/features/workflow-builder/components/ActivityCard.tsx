import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
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
import {
  ActivityDetails,
} from "./ActivityDetails";

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
  isExpanded,
  onToggle,
  onToggleDetails,
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
          overflow-hidden
          rounded-xl
          border
          bg-card
          transition-all
          duration-200
        `,

        isSelected
          ? `
              border-primary
              bg-primary/[0.025]
              shadow-md
              ring-1
              ring-primary/20
            `
          : `
              border-border
              hover:border-primary/30
              hover:shadow-md
            `,
      )}
    >
      <button
        type="button"
        aria-pressed={isSelected}
        className="
          absolute
          right-3
          top-3
          z-10
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

      <div className="p-4 pr-12">
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-1.5
          "
        >
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

        <h3
          className="
            mt-3
            text-sm
            font-semibold
            leading-5
            text-foreground
          "
        >
          {activity.title}
        </h3>

        {activity.description && (
          <p
            className={cn(
              `
                mt-2
                text-xs
                leading-5
                text-muted-foreground
              `,
              !isExpanded &&
                "line-clamp-2",
            )}
          >
            {activity.description}
          </p>
        )}

        <div
          className="
            mt-3
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

        <button
          type="button"
          className="
            mt-3
            inline-flex
            items-center
            gap-1
            text-xs
            font-medium
            text-primary
            hover:underline
          "
          onClick={
            onToggleDetails
          }
        >
          {isExpanded
            ? "Hide details"
            : "View details"}

          {isExpanded ? (
            <ChevronUp
              className="h-3 w-3"
            />
          ) : (
            <ChevronDown
              className="h-3 w-3"
            />
          )}
        </button>
      </div>
{/*
      {isExpanded && (
        <div
          className="
            border-t
            border-border
            bg-muted/20
            px-4
            py-4
          "
        >
          {activity.businessOutcome && (
            <DetailSection
              title="Business outcome"
              content={
                activity.businessOutcome
              }
            />
          )}

          {activity.beginnerPrompt && (
            <DetailSection
              title="Beginner prompt"
              content={
                activity.beginnerPrompt
              }
            />
          )}

          {activity.advancedPrompt && (
            <DetailSection
              title="Advanced prompt"
              content={
                activity.advancedPrompt
              }
            />
          )}

          {activity.suggestedOutputs && (
            <DetailSection
              title="Suggested outputs"
              content={
                activity.suggestedOutputs
              }
            />
          )}
        </div>
      )}*/}
      {isExpanded && (
  <motion.div
    initial={{
      opacity: 0,
      height: 0,
    }}
    animate={{
      opacity: 1,
      height: "auto",
    }}
    exit={{
      opacity: 0,
      height: 0,
    }}
    className="
      border-t
      border-border
      bg-muted/20
      px-4
      py-4
    "
  >
    <ActivityDetails
      activity={activity}
    />
  </motion.div>
)}
    </motion.article>
  );
}

interface DetailSectionProps {
  title: string;
  content: string;
}

function DetailSection({
  title,
  content,
}: DetailSectionProps) {
  return (
    <div className="mb-3 last:mb-0">
      <p
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          whitespace-pre-wrap
          text-xs
          leading-5
          text-foreground
        "
      >
        {content}
      </p>
    </div>
  );
}