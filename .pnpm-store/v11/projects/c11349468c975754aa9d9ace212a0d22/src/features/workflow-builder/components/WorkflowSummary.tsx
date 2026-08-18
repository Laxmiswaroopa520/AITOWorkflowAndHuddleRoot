import {
  ArrowLeftRight,
  Clock,
  Copy,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  SaveWorkflowDialog,
} from "@/features/saved-workflows/components/SaveWorkflowDialog";

import {
  useSaveWorkflow,
} from "@/features/saved-workflows/hooks/useSaveWorkflow";

import {
  useMyWorkflows,
} from "@/features/saved-workflows/hooks/useMyWorkflows";

import {
  useUpdateWorkflow,
} from "@/features/saved-workflows/hooks/useUpdateWorkflow";

import type {
  Activity,
} from "../types/activity.types";

import type {
  Role,
} from "../types/role.types";

import {
  BUCKET_ICONS,
} from "../constants/workflowStyles";

import {
  groupActivitiesByBucket,
} from "../utils/groupActivitiesByBucket";

import {
  useWorkflowSelection,
} from "../hooks/useWorkflowSelection";

import {
  DaySchedule,
} from "./DaySchedule";

import { TimelineBucketView } from "./TimelineBucketView";
import { TimelineToggle } from "./TimelineToggle";
import type { TimelineView } from "../types/timeline.types";
import { TIMELINE_LABELS } from "../types/timeline.types";
import { filterActivitiesByTimeline } from "../utils/filterActivitiesByTimeline";

import {
  WorkflowNavigation,
} from "./WorkflowNavigation";

type SaveDialogMode =
  | "save"
  | "save-as";

interface WorkflowSummaryProps {
  role: Role;
  activities: Activity[];
  totalDuration: number;
  onBack: () => void;
  onRestart: () => void;
}

export function WorkflowSummary({
  role,
  activities,
  onBack,
  onRestart,
}: WorkflowSummaryProps) {
  const {
    editingWorkflow,
    saveAsWorkflow,
    setEditingWorkflow,
    setSaveAsWorkflow,
    swapActivities,
  } = useWorkflowSelection();

  const [
    swapSourceActivityId,
    setSwapSourceActivityId,
  ] = useState<number | null>(null);

  const [
    saveDialogMode,
    setSaveDialogMode,
  ] =
    useState<SaveDialogMode | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  const [timelineView, setTimelineView] = useState<TimelineView>("day");

  const timelineActivities = filterActivitiesByTimeline(activities, timelineView);
  const timelineDuration = timelineActivities.reduce(
    (sum, activity) => sum + activity.durationMinutes,
    0,
  );

  const saveMutation =
    useSaveWorkflow();

  const savedWorkflowsQuery =
    useMyWorkflows();

  const updateMutation =
    useUpdateWorkflow();

  const groups =
    groupActivitiesByBucket(
      activities,
      [],
      true,
    );

  const swapSourceActivity =
    activities.find(
      activity =>
        activity.id === swapSourceActivityId,
    );

  const handleSwap = (
    activityId: number,
  ): void => {
    if (swapSourceActivityId === null) {
      setSwapSourceActivityId(activityId);
      return;
    }

    if (swapSourceActivityId === activityId) {
      setSwapSourceActivityId(null);
      return;
    }

    swapActivities(
      swapSourceActivityId,
      activityId,
    );
    setSwapSourceActivityId(null);
  };

  /*
   * Automatically open Save As when
   * the user selected Save As from
   * My Workflows.
   */
  useEffect(() => {
    if (!saveAsWorkflow) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveDialogMode("save-as");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [saveAsWorkflow]);

  const resetMessages =
    (): void => {
      setSuccessMessage(null);

      saveMutation.reset();
      updateMutation.reset();
    };

  const openSaveDialog =
    (): void => {
      resetMessages();

      setSaveDialogMode("save");
    };

  const openSaveAsDialog =
    (): void => {
      resetMessages();

      setSaveAsWorkflow({
        suggestedName:
          editingWorkflow
            ? `Copy of ${editingWorkflow.name}`
            : "Copy of workflow",

        description:
          editingWorkflow?.description ??
          null,
      });

      setSaveDialogMode("save-as");
    };

  const closeSaveDialog =
    (): void => {
      if (
        saveMutation.isPending ||
        updateMutation.isPending
      ) {
        return;
      }

      setSaveDialogMode(null);
      setSaveAsWorkflow(null);

      saveMutation.reset();
      updateMutation.reset();
    };

  const handleUpdate =
    (): void => {
      if (!editingWorkflow) {
        return;
      }

      resetMessages();

      updateMutation.mutate(
        {
          id: editingWorkflow.id,

          name:
            editingWorkflow.name,

          description:
            editingWorkflow.description,

          roleExternalId:
            role.externalId,

          activityExternalIds:
            activities.map(
              activity =>
                activity.externalId,
            ),

          rowVersion:
            editingWorkflow.rowVersion,
        },
        {
          onSuccess: workflow => {
            setEditingWorkflow({
              id: workflow.id,
              name: workflow.name,

              description:
                workflow.description,

              rowVersion:
                workflow.rowVersion,
            });

            setSuccessMessage(
              `Workflow "${workflow.name}" was updated successfully.`,
            );
          },
        },
      );
    };

  const mutationError =
    saveMutation.error
      instanceof Error
      ? saveMutation.error.message
      : updateMutation.error
          instanceof Error
        ? updateMutation.error.message
        : null;

  const isMutationPending =
    saveMutation.isPending ||
    updateMutation.isPending;

  const initialDialogName =
    saveDialogMode === "save-as"
      ? saveAsWorkflow
          ?.suggestedName ?? ""
      : "";

  const initialDialogDescription =
    saveDialogMode === "save-as"
      ? saveAsWorkflow
          ?.description ?? null
      : null;

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        pb-12
        pt-6
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        "
      >
        <WorkflowNavigation
          backLabel="Back to activities"
          showNext={false}
          showRestart
          onBack={onBack}
          onRestart={onRestart}
        />

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          {editingWorkflow ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={
                  activities.length ===
                    0 ||
                  isMutationPending
                }
                onClick={
                  openSaveAsDialog
                }
              >
                <Copy
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Save As
              </Button>

              <Button
                type="button"
                className="gap-2"
                disabled={
                  activities.length ===
                    0 ||
                  isMutationPending
                }
                onClick={
                  handleUpdate
                }
              >
                <Save
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {updateMutation.isPending
                  ? "Updating..."
                  : "Update workflow"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="gap-2"
              disabled={
                activities.length ===
                  0 ||
                isMutationPending
              }
              onClick={
                openSaveDialog
              }
            >
              <Save
                className="h-4 w-4"
                aria-hidden="true"
              />

              Save workflow
            </Button>
          )}
        </div>
      </div>

      {editingWorkflow && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-primary/20
            bg-primary/5
            px-4
            py-3
            text-sm
          "
        >
          You are editing{" "}
          <strong>
            {editingWorkflow.name}
          </strong>
          .
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="
            mt-5
            rounded-xl
            border
            border-primary/20
            bg-primary/10
            px-4
            py-3
            text-sm
            font-medium
            text-primary
          "
        >
          {successMessage}
        </div>
      )}

      {mutationError &&
        saveDialogMode === null && (
          <div
            role="alert"
            className="
              mt-5
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
            {mutationError}
          </div>
        )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{TIMELINE_LABELS[timelineView]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {timelineActivities.length} activities from {activities.length} selected · {role.name}
          </p>
        </div>
        <TimelineToggle value={timelineView} onChange={setTimelineView} />
      </div>

      <div
        className="
          mt-5
          overflow-hidden
          rounded-2xl
          border
          border-primary/20
          bg-gradient-to-br
          from-primary/10
          via-card
          to-accent/10
          p-5
          shadow-md
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-5
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-primary/10
                px-3
                py-1
                text-xs
                font-semibold
                text-primary
              "
            >
              <Sparkles
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Your AI-powered workflow
            </div>

            <h1
              className="
                mt-3
                text-2xl
                font-bold
                tracking-tight
              "
            >
              {TIMELINE_LABELS[timelineView]} is ready
            </h1>

            <p
              className="
                mt-2
                text-muted-foreground
              "
            >
              {role.name}
              {" • "}
              {timelineActivities.length}
              {" "}
              activities
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-border
              bg-card/80
              px-4
              py-3
              text-center
              backdrop-blur
            "
          >
            <Clock
              className="
                mx-auto
                h-5
                w-5
                text-primary
              "
              aria-hidden="true"
            />

            <p
              className="
                mt-2
                text-xl
                font-bold
              "
            >
              {formatDuration(
                timelineDuration,
              )}
            </p>

            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              Total duration
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {timelineView === "day" ? (
          <DaySchedule activities={timelineActivities} />
        ) : (
          <TimelineBucketView activities={timelineActivities} timeline={timelineView} />
        )}
      </div>

      <div className="hidden" aria-hidden="true">
        {groups.map(group => {
          const Icon =
            BUCKET_ICONS[group.name] ??
            Sparkles;

          return (
            <section
              key={group.id}
              className="
                rounded-2xl
                border
                border-border
                bg-card
                shadow-sm
              "
            >
              <header
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-border
                  px-5
                  py-4
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <Icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    {group.name}
                  </h2>

                  <p
                    className="
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {
                      group.activities
                        .length
                    }
                    {" "}
                    activities
                  </p>
                </div>
              </header>

              <div className="divide-y divide-border">
                {group.activities.map(
                  (
                    activity,
                    index,
                  ) => (
                    <article
                      key={activity.id}
                      className="
                        flex
                        gap-4
                        px-5
                        py-4
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-secondary
                          text-xs
                          font-semibold
                        "
                      >
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                            text-sm
                            font-semibold
                          "
                        >
                          {activity.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-muted-foreground
                          "
                        >
                          {
                            activity
                              .durationMinutes
                          }
                          {" "}
                          minutes
                          {" • "}
                          {
                            activity.category
                          }
                        </p>

                        {activity.businessOutcome && (
                          <p
                            className="
                              mt-2
                              text-xs
                              leading-5
                              text-muted-foreground
                            "
                          >
                            {
                              activity
                                .businessOutcome
                            }
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant={
                          swapSourceActivityId === activity.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleSwap(activity.id)}
                        disabled={
                          swapSourceActivity !== undefined &&
                          swapSourceActivity.workflowBucketExternalId !==
                            activity.workflowBucketExternalId
                        }
                        aria-label={
                          swapSourceActivityId === activity.id
                            ? `Cancel swapping ${activity.title}`
                            : swapSourceActivityId === null
                              ? `Swap ${activity.title}`
                              : `Swap with ${activity.title}`
                        }
                        className="shrink-0 gap-1.5"
                      >
                        {swapSourceActivityId === activity.id ? (
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowLeftRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        <span className="hidden sm:inline">
                          {swapSourceActivityId === activity.id
                            ? "Cancel"
                            : swapSourceActivityId === null
                              ? "Swap"
                              : "Swap here"}
                        </span>
                      </Button>
                    </article>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-border
          bg-muted/20
          p-5
          text-center
        "
      >
        <p
          className="
            text-sm
            font-medium
          "
        >
          Save this workflow to access
          it later from My Workflows.
        </p>

        <p
          className="
            mt-1
            text-xs
            text-muted-foreground
          "
        >
          Saved workflows are stored
          through the backend API and
          SQL database.
        </p>
      </div>

      <SaveWorkflowDialog
        key={`${saveDialogMode ?? "closed"}-${initialDialogName}`}
        open={
          saveDialogMode !== null
        }
        title={
          saveDialogMode === "save-as"
            ? "Save workflow as"
            : "Save workflow"
        }
        submitLabel={
          saveDialogMode === "save-as"
            ? "Save copy"
            : "Save workflow"
        }
        initialName={
          initialDialogName
        }
        initialDescription={
          initialDialogDescription
        }
        roleExternalId={
          role.externalId
        }
        activityExternalIds={
          activities.map(
            activity =>
              activity.externalId,
          )
        }
        isSaving={
          saveMutation.isPending
        }
        errorMessage={
          saveMutation.error
            instanceof Error
            ? saveMutation.error.message
                : null
        }
        existingWorkflowNames={
          savedWorkflowsQuery.data?.map(
            workflow => workflow.name,
          ) ?? []
        }
        onNameChange={() => {
          if (saveMutation.error) {
            saveMutation.reset();
          }
        }}
        onClose={
          closeSaveDialog
        }
        onSave={input => {
          saveMutation.mutate(
            input,
            {
              onSuccess: workflow => {
                setSaveDialogMode(null);
                setSaveAsWorkflow(null);

                setSuccessMessage(
                  `Workflow "${workflow.name}" was saved successfully.`,
                );
              },
            },
          );
        }}
      />
    </section>
  );
}

function formatDuration(
  minutes: number,
): string {
  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  if (hours === 0) {
    return `${remaining} min`;
  }

  return remaining === 0
    ? `${hours} hr`
    : `${hours} hr ${remaining} min`;
}
