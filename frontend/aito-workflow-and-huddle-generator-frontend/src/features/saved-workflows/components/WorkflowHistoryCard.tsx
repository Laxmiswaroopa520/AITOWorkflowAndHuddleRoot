import {
  Clock,
  Copy,
  Edit3,
  FolderOpen,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  SavedWorkflowSummary,
} from "../types/savedWorkflow.types";

import {
  FavoriteButton,
} from "./FavoriteButton";

interface WorkflowHistoryCardProps {
  workflow:
    SavedWorkflowSummary;

  favoritePending: boolean;

  onOpen: () => void;
  onEdit: () => void;
  onSaveAs: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function WorkflowHistoryCard({
  workflow,
  favoritePending,
  onOpen,
  onEdit,
  onSaveAs,
  onDelete,
  onToggleFavorite,
}: WorkflowHistoryCardProps) {
  return (
    <article
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        shadow-sm
        transition
        hover:border-primary/30
        hover:shadow-md
      "
    >
      <div className="p-5">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-primary
              "
            >
              {
                workflow.roleAbbreviation
              }
            </p>

            <h2
              className="
                mt-1
                truncate
                text-lg
                font-semibold
              "
            >
              {workflow.name}
            </h2>
          </div>

          <FavoriteButton
            isFavorite={
              workflow.isFavorite
            }
            disabled={
              favoritePending
            }
            onToggle={
              onToggleFavorite
            }
          />
        </div>

        {workflow.description && (
          <p
            className="
              mt-3
              line-clamp-2
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            {workflow.description}
          </p>
        )}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <span
            className="
              rounded-full
              bg-secondary
              px-2.5
              py-1
              text-xs
            "
          >
            {
              workflow.activityCount
            }{" "}
            activities
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-secondary
              px-2.5
              py-1
              text-xs
            "
          >
            <Clock
              className="h-3 w-3"
            />

            {formatDuration(
              workflow
                .totalDurationMinutes,
            )}
          </span>
        </div>

        <p
          className="
            mt-4
            text-xs
            text-muted-foreground
          "
        >
          Updated{" "}
          {formatDate(
            workflow.updatedAtUtc ??
              workflow.createdAtUtc,
          )}
        </p>
      </div>

      <footer
        className="
          grid
          grid-cols-2
          gap-2
          border-t
          border-border
          bg-muted/20
          p-3
          sm:grid-cols-4
        "
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onOpen}
        >
          <FolderOpen
            className="h-3.5 w-3.5"
          />

          Open
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onEdit}
        >
          <Edit3
            className="h-3.5 w-3.5"
          />

          Edit
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onSaveAs}
        >
          <Copy
            className="h-3.5 w-3.5"
          />

          Save As
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="
            gap-1.5
            text-destructive
            hover:text-destructive
          "
          onClick={onDelete}
        >
          <Trash2
            className="h-3.5 w-3.5"
          />

          Delete
        </Button>
      </footer>
    </article>
  );
}

function formatDuration(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  return remaining === 0
    ? `${hours} hr`
    : `${hours} hr ${remaining} min`;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}