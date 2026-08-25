import type {
  ElementType,
  ReactNode,
} from "react";

import {
  BriefcaseBusiness,
  FileText,
  Lightbulb,
  ListChecks,
  Sparkles,
} from "lucide-react";

import type {
  Activity,
} from "../types/activity.types";

interface ActivityDetailsProps {
  activity: Activity;
}

export function ActivityDetails({
  activity,
}: ActivityDetailsProps) {
  const suggestedOutputs =
    parseSuggestedOutputs(
      activity.suggestedOutputs,
    );

  const hasContent =
    Boolean(
      activity.businessOutcome,
    ) ||
    Boolean(
      activity.beginnerPrompt,
    ) ||
    Boolean(
      activity.advancedPrompt,
    ) ||
    suggestedOutputs.length > 0;

  if (!hasContent) {
    return (
      <div
        className="
          rounded-lg
          border
          border-dashed
          border-border
          bg-background/60
          px-4
          py-5
          text-center
        "
      >
        <p
          className="
            text-xs
            text-muted-foreground
          "
        >
          No additional details are
          available for this activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activity.businessOutcome && (
        <DetailBlock
          icon={BriefcaseBusiness}
          title="Business outcome"
        >
          <p
            className="
              whitespace-pre-wrap
              text-xs
              leading-5
              text-foreground
            "
          >
            {activity.businessOutcome}
          </p>
        </DetailBlock>
      )}

      {activity.beginnerPrompt && (
        <DetailBlock
          icon={Lightbulb}
          title="Beginner prompt"
        >
          <PromptBlock
            value={
              activity.beginnerPrompt
            }
          />
        </DetailBlock>
      )}

      {activity.advancedPrompt && (
        <DetailBlock
          icon={Sparkles}
          title="Advanced prompt"
        >
          <PromptBlock
            value={
              activity.advancedPrompt
            }
          />
        </DetailBlock>
      )}

      {suggestedOutputs.length > 0 && (
        <DetailBlock
          icon={ListChecks}
          title="Suggested outputs"
        >
          <ul className="space-y-1.5">
            {suggestedOutputs.map(
              output => (
                <li
                  key={output}
                  className="
                    flex
                    items-start
                    gap-2
                    text-xs
                    leading-5
                    text-foreground
                  "
                >
                  <span
                    className="
                      mt-2
                      h-1
                      w-1
                      shrink-0
                      rounded-full
                      bg-primary
                    "
                    aria-hidden="true"
                  />

                  <span>
                    {output}
                  </span>
                </li>
              ),
            )}
          </ul>
        </DetailBlock>
      )}
    </div>
  );
}

interface DetailBlockProps {
  icon: ElementType;
  title: string;
  children: ReactNode;
}

function DetailBlock({
  icon: Icon,
  title,
  children,
}: DetailBlockProps) {
  return (
    <section>
      <div
        className="
          mb-2
          flex
          items-center
          gap-2
        "
      >
        <div
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          <Icon
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </div>

        <h4
          className="
            text-xs
            font-semibold
            text-foreground
          "
        >
          {title}
        </h4>
      </div>

      {children}
    </section>
  );
}

interface PromptBlockProps {
  value: string;
}

function PromptBlock({
  value,
}: PromptBlockProps) {
  return (
    <div
      className="
        rounded-lg
        border
        border-border
        bg-background
        px-3
        py-2.5
      "
    >
      <div
        className="
          mb-1.5
          flex
          items-center
          gap-1.5
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        <FileText
          className="h-3 w-3"
          aria-hidden="true"
        />

        Prompt
      </div>

      <p
        className="
          whitespace-pre-wrap
          text-xs
          leading-5
          text-foreground
        "
      >
        {value}
      </p>
    </div>
  );
}

function parseSuggestedOutputs(
  value: string | null,
): string[] {
  if (!value?.trim()) {
    return [];
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.startsWith("[")
  ) {
    try {
      const parsed: unknown =
        JSON.parse(normalizedValue);

      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (
              item,
            ): item is string =>
              typeof item === "string",
          )
          .map(
            item => item.trim(),
          )
          .filter(Boolean);
      }
    } catch {
      // Continue with delimiter parsing.
    }
  }

  return normalizedValue
    .split(/\r?\n|;|\|/)
    .map(
      item => item.trim(),
    )
    .filter(Boolean);
}