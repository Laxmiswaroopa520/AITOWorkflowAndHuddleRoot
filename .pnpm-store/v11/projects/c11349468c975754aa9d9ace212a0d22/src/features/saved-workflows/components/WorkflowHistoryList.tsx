import {
  FolderOpen,
} from "lucide-react";

import {
  LoadingSpinner,
} from "@/components/feedback/LoadingSpinner";

import {
  ErrorState,
} from "@/components/feedback/ErrorState";

import type {
  SavedWorkflowSummary,
} from "../types/savedWorkflow.types";

import {
  WorkflowHistoryCard,
} from "./WorkflowHistoryCard";

interface WorkflowHistoryListProps {
  workflows:
    SavedWorkflowSummary[];

  isLoading: boolean;
  error: Error | null;

  favoritePendingId:
    string | null;

  onRetry: () => void;

  onOpen: (
    workflow:
      SavedWorkflowSummary,
  ) => void;

  onEdit: (
    workflow:
      SavedWorkflowSummary,
  ) => void;

  onSaveAs: (
    workflow:
      SavedWorkflowSummary,
  ) => void;

  onDelete: (
    workflow:
      SavedWorkflowSummary,
  ) => void;

  onToggleFavorite: (
    workflow:
      SavedWorkflowSummary,
  ) => void;
}

export function WorkflowHistoryList({
  workflows,
  isLoading,
  error,
  favoritePendingId,
  onRetry,
  onOpen,
  onEdit,
  onSaveAs,
  onDelete,
  onToggleFavorite,
}: WorkflowHistoryListProps) {
  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading saved workflows..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Saved workflows could not be loaded"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (workflows.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-border
          bg-muted/20
          px-6
          py-14
          text-center
        "
      >
        <FolderOpen
          className="
            mx-auto
            h-10
            w-10
            text-muted-foreground
          "
        />

        <h2
          className="
            mt-4
            text-lg
            font-semibold
          "
        >
          No saved workflows
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Build and save a workflow
          to see it here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-4
        md:grid-cols-2
        lg:grid-cols-3
      "
    >
      {workflows.map(workflow => (
        <WorkflowHistoryCard
          key={workflow.id}
          workflow={workflow}
          favoritePending={
            favoritePendingId ===
            workflow.id
          }
          onOpen={() =>
            onOpen(workflow)
          }
          onEdit={() =>
            onEdit(workflow)
          }
          onSaveAs={() =>
            onSaveAs(workflow)
          }
          onDelete={() =>
            onDelete(workflow)
          }
          onToggleFavorite={() =>
            onToggleFavorite(
              workflow,
            )
          }
        />
      ))}
    </div>
  );
}
