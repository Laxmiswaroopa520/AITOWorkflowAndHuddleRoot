import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  Button,
} from "@/components/ui/button";

import {
  useActivities,
} from "@/features/workflow-builder/hooks/useActivities";

import {
  useWorkflowSelection,
  type RestoreWorkflowMode,
} from "@/features/workflow-builder/hooks/useWorkflowSelection";

import type {
  Activity,
} from "@/features/workflow-builder/types/activity.types";

import {
  DeleteWorkflowDialog,
} from "../components/DeleteWorkflowDialog";

import {
  WorkflowHistoryFilters,
} from "../components/WorkflowHistoryFilters";

import {
  WorkflowHistoryList,
} from "../components/WorkflowHistoryList";

import {
  useDeleteWorkflow,
} from "../hooks/useDeleteWorkflow";

import {
  useMyWorkflows,
} from "../hooks/useMyWorkflows";

import {
  useToggleFavorite,
} from "../hooks/useToggleFavorite";

import {
  useWorkflowById,
} from "../hooks/useWorkflowById";

import type {
  SavedWorkflowSummary,
} from "../types/savedWorkflow.types";

export function SavedWorkflowsPage() {
  const navigate =
    useNavigate();

  const {
    restoreWorkflow,
  } = useWorkflowSelection();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);

  const [
    selectedWorkflowId,
    setSelectedWorkflowId,
  ] = useState<string | null>(
    null,
  );

  const [
    restoreMode,
    setRestoreMode,
  ] =
    useState<RestoreWorkflowMode>(
      "open",
    );

  const [
    restoreError,
    setRestoreError,
  ] = useState<string | null>(
    null,
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<
    SavedWorkflowSummary | null
  >(null);

  const [
    favoritePendingId,
    setFavoritePendingId,
  ] = useState<string | null>(
    null,
  );

  const workflowsQuery =
    useMyWorkflows({
      search:
        search.trim() ||
        undefined,

      isFavorite:
        favoritesOnly
          ? true
          : undefined,
    });

  const workflowQuery =
    useWorkflowById(
      selectedWorkflowId,
    );

  /*
   * The current Activity objects are
   * loaded so the saved external IDs can
   * be restored into the Part 6 state.
   */
  const allActivitiesQuery =
    useActivities(
      {},
      Boolean(
        selectedWorkflowId,
      ),
    );

  const deleteMutation =
    useDeleteWorkflow();

  const favoriteMutation =
    useToggleFavorite();

  useEffect(() => {
    if (
      !selectedWorkflowId ||
      !workflowQuery.data ||
      !allActivitiesQuery.data
    ) {
      return;
    }

    const savedWorkflow =
      workflowQuery.data;

    const savedOrder =
      new Map<string, number>(
        savedWorkflow.activities.map(
          activity => [
            activity.externalId,
            activity.sortOrder,
          ],
        ),
      );

    const restoredActivities:
      Activity[] =
        allActivitiesQuery.data
          .filter(activity =>
            savedOrder.has(
              activity.externalId,
            ),
          )
          .sort(
            (left, right) =>
              (
                savedOrder.get(
                  left.externalId,
                ) ?? 0
              ) -
              (
                savedOrder.get(
                  right.externalId,
                ) ?? 0
              ),
          );

    if (
      restoredActivities.length !==
      savedWorkflow.activities.length
    ) {
      setRestoreError(
        "Some activities in this saved workflow are no longer available.",
      );

      setSelectedWorkflowId(null);

      return;
    }

    if (
      restoreMode === "edit"
    ) {
      restoreWorkflow(
        savedWorkflow.roleExternalId,
        restoredActivities,
        {
          mode: "edit",

          editingWorkflow: {
            id: savedWorkflow.id,
            name: savedWorkflow.name,
            description:
              savedWorkflow.description,
            rowVersion:
              savedWorkflow.rowVersion,
          },
        },
      );
    } else if (
      restoreMode === "save-as"
    ) {
      restoreWorkflow(
        savedWorkflow.roleExternalId,
        restoredActivities,
        {
          mode: "save-as",

          saveAsWorkflow: {
            suggestedName:
              `Copy of ${savedWorkflow.name}`,

            description:
              savedWorkflow.description,
          },
        },
      );
    } else {
      restoreWorkflow(
        savedWorkflow.roleExternalId,
        restoredActivities,
        {
          mode: "open",
        },
      );
    }

    setSelectedWorkflowId(null);
    setRestoreError(null);

    navigate("/workflow");
  }, [
    allActivitiesQuery.data,
    navigate,
    restoreMode,
    restoreWorkflow,
    selectedWorkflowId,
    workflowQuery.data,
  ]);

  const beginRestore = (
    workflow:
      SavedWorkflowSummary,
    mode: RestoreWorkflowMode,
  ): void => {
    setRestoreError(null);
    setRestoreMode(mode);

    setSelectedWorkflowId(
      workflow.id,
    );
  };

  const handleDelete =
    (): void => {
      if (!deleteTarget) {
        return;
      }

      deleteMutation.mutate(
        deleteTarget.id,
        {
          onSuccess: () => {
            setDeleteTarget(null);
          },
        },
      );
    };

  const handleToggleFavorite = (
    workflow:
      SavedWorkflowSummary,
  ): void => {
    setFavoritePendingId(
      workflow.id,
    );

    favoriteMutation.mutate(
      {
        id: workflow.id,

        isFavorite:
          !workflow.isFavorite,

        rowVersion:
          workflow.rowVersion,
      },
      {
        onSettled: () => {
          setFavoritePendingId(
            null,
          );
        },
      },
    );
  };

  const workflowListError =
    workflowsQuery.error
      instanceof Error
      ? workflowsQuery.error
      : null;

  const restoreQueryError =
    workflowQuery.error
      instanceof Error
      ? workflowQuery.error
      : allActivitiesQuery.error
          instanceof Error
        ? allActivitiesQuery.error
        : null;

  const isRestoring =
    Boolean(
      selectedWorkflowId,
    ) &&
    (
      workflowQuery.isPending ||
      allActivitiesQuery.isPending
    );

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        pb-12
        pt-5
      "
    >
      <div>
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.14em]
            text-primary
          "
        >
          Workflow history
        </p>

        <h1
          className="
            mt-1
            text-3xl
            font-bold
            tracking-tight
          "
        >
          My workflows
        </h1>

        <p
          className="
            mt-2
            text-muted-foreground
          "
        >
          Open, favorite, update, copy,
          or delete workflows you have
          saved.
        </p>
      </div>

      {restoreError && (
        <div
          role="alert"
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-destructive/30
            bg-destructive/10
            px-4
            py-3
            text-sm
            text-destructive
          "
        >
          <AlertTriangle
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
            "
            aria-hidden="true"
          />

          <div className="flex-1">
            <p className="font-medium">
              Workflow could not be
              restored
            </p>

            <p className="mt-1">
              {restoreError}
            </p>
          </div>

          <button
            type="button"
            className="
              text-xs
              font-medium
              underline
            "
            onClick={() =>
              setRestoreError(null)
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {restoreQueryError &&
        selectedWorkflowId && (
          <div
            role="alert"
            className="
              mt-6
              rounded-xl
              border
              border-destructive/30
              bg-destructive/10
              px-4
              py-3
              text-sm
              text-destructive
            "
          >
            <p className="font-medium">
              Saved workflow could not
              be loaded
            </p>

            <p className="mt-1">
              {
                restoreQueryError.message
              }
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                setSelectedWorkflowId(
                  null,
                )
              }
            >
              Close
            </Button>
          </div>
        )}

      <div className="mt-6">
        <WorkflowHistoryFilters
          search={search}
          favoritesOnly={
            favoritesOnly
          }
          onSearchChange={
            setSearch
          }
          onFavoritesOnlyChange={
            setFavoritesOnly
          }
          onClear={() => {
            setSearch("");
            setFavoritesOnly(false);
          }}
        />
      </div>

      <div className="mt-6">
        <WorkflowHistoryList
          workflows={
            workflowsQuery.data ??
            []
          }
          isLoading={
            workflowsQuery.isPending
          }
          error={
            workflowListError
          }
          favoritePendingId={
            favoritePendingId
          }
          onRetry={() => {
            void workflowsQuery
              .refetch();
          }}
          onOpen={workflow => {
            beginRestore(
              workflow,
              "open",
            );
          }}
          onEdit={workflow => {
            beginRestore(
              workflow,
              "edit",
            );
          }}
          onSaveAs={workflow => {
            beginRestore(
              workflow,
              "save-as",
            );
          }}
          onDelete={
            setDeleteTarget
          }
          onToggleFavorite={
            handleToggleFavorite
          }
        />
      </div>

      {isRestoring && (
        <div
          className="
            fixed
            inset-0
            z-40
            flex
            items-center
            justify-center
            bg-black/45
            px-4
            backdrop-blur-sm
          "
          role="status"
          aria-live="polite"
        >
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-border
              bg-card
              px-5
              py-4
              shadow-2xl
            "
          >
            <Loader2
              className="
                h-5
                w-5
                animate-spin
                text-primary
              "
              aria-hidden="true"
            />

            Restoring workflow...
          </div>
        </div>
      )}

      <DeleteWorkflowDialog
        open={
          deleteTarget !== null
        }
        workflowName={
          deleteTarget?.name ?? ""
        }
        isDeleting={
          deleteMutation.isPending
        }
        errorMessage={
          deleteMutation.error
            instanceof Error
            ? deleteMutation
                .error.message
            : null
        }
        onClose={() => {
          if (
            !deleteMutation.isPending
          ) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={
          handleDelete
        }
      />
    </section>
  );
}
