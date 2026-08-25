import {
  useMemo,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  useActivities,
} from "../hooks/useActivities";

import {
  useAiTools,
} from "../hooks/useAiTools";

import {
  useRoles,
} from "../hooks/useRoles";

import {
  useWorkflowBuckets,
} from "../hooks/useWorkflowBuckets";

import {
  useWorkflowSelection,
} from "../hooks/useWorkflowSelection";

import {
  ActivitySelectionStep,
} from "../components/ActivitySelectionStep";

import {
  RoleSelector,
} from "../components/RoleSelector";

import {
  WorkflowProgress,
} from "../components/WorkflowProgress";

import {
  WorkflowSummary,
} from "../components/WorkflowSummary";

export function WorkflowPage() {
  const workflow =
    useWorkflowSelection();

  const rolesQuery =
    useRoles();

  const aiToolsQuery =
    useAiTools();

  const bucketsQuery =
    useWorkflowBuckets();

  /*
   * selectedRoleId already contains the API
   * role external ID, such as:
   *
   * ae
   * ats
   * ssp
   * se
   * ce
   * csam
   * csa
   * manager
   */
  const apiRoleId =
    workflow.selectedRoleId ??
    undefined;

  const activitiesQuery =
    useActivities(
      {
        roleId: apiRoleId,
      },
      Boolean(apiRoleId),
    );

  const selectedRole =
    useMemo(
      () =>
        rolesQuery.data?.find(
          role =>
            role.externalId ===
            apiRoleId,
        ) ?? null,
      [
        apiRoleId,
        rolesQuery.data,
      ],
    );

  const selectedRoleIsMissing =
    workflow.currentStep !==
      "discover" &&
    !rolesQuery.isPending &&
    !selectedRole;

  const handleToggleDetails = (
    activityId: number,
  ): void => {
    workflow.setExpandedActivityId(
      workflow.expandedActivityId ===
        activityId
        ? null
        : activityId,
    );
  };

  const pageError =
    rolesQuery.error ??
    aiToolsQuery.error ??
    bucketsQuery.error ??
    activitiesQuery.error ??
    null;

  const refetchReferenceData =
    async (): Promise<void> => {
      const requests: Array<
        Promise<unknown>
      > = [
        rolesQuery.refetch(),
        aiToolsQuery.refetch(),
        bucketsQuery.refetch(),
      ];

      if (apiRoleId) {
        requests.push(
          activitiesQuery.refetch(),
        );
      }

      await Promise.all(requests);
    };

  return (
    <div
      className="
        min-h-full
        bg-background
      "
    >
      <WorkflowProgress
        currentStep={
          workflow.currentStep
        }
        canOpenActivities={
          Boolean(
            workflow.selectedRoleId,
          )
        }
        canOpenWorkflow={
          workflow.selectedActivities
            .length > 0
        }
        onStepChange={step => {
          workflow.goToStep(step);
        }}
      />

      {selectedRoleIsMissing && (
        <div
          className="
            mx-auto
            flex
            min-h-[55vh]
            max-w-lg
            items-center
            justify-center
            px-4
          "
        >
          <div
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-card
              p-6
              text-center
              shadow-sm
            "
          >
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              Select your role again
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              The previously selected role
              is no longer available.
            </p>

            <Button
              type="button"
              className="mt-5"
              onClick={
                workflow.restartWorkflow
              }
            >
              Return to role selection
            </Button>
          </div>
        </div>
      )}

      {!selectedRoleIsMissing &&
        workflow.currentStep ===
          "discover" && (
          <RoleSelector
            roles={
              rolesQuery.data ?? []
            }
            isLoading={
              rolesQuery.isPending
            }
            error={
              rolesQuery.error
            }
            selectedRoleId={
              workflow.selectedRoleId
            }
            selectedSegment={
              workflow.selectedSegment
            }
            onSelectRole={
              workflow.selectRole
            }
            onSelectSegment={
              workflow.setSelectedSegment
            }
            onContinue={() => {
              workflow.goToActivities();
            }}
            onRetry={() => {
              void rolesQuery.refetch();
            }}
          />
        )}

      {!selectedRoleIsMissing &&
        workflow.currentStep ===
          "customize" &&
        selectedRole && (
          <ActivitySelectionStep
            role={selectedRole}
            activities={
              activitiesQuery.data ??
              []
            }
            aiTools={
              aiToolsQuery.data ?? []
            }
            workflowBuckets={
              bucketsQuery.data ?? []
            }
            isLoading={
              activitiesQuery.isPending ||
              aiToolsQuery.isPending ||
              bucketsQuery.isPending
            }
            error={pageError}
            filters={
              workflow.filters
            }
            selectedActivities={
              workflow
                .selectedActivities
            }
            selectedActivityIds={
              workflow
                .selectedActivityIds
            }
            expandedActivityId={
              workflow
                .expandedActivityId
            }
            totalDuration={
              workflow.totalDuration
            }
            onBack={
              workflow.goBack
            }
            onRetry={() => {
              void refetchReferenceData();
            }}
            onFiltersChange={
              workflow.setFilters
            }
            onClearFilters={
              workflow.clearFilters
            }
            onToggleActivity={
              workflow.toggleActivity
            }
            onToggleDetails={
              handleToggleDetails
            }
            onSelectActivities={
              workflow.selectActivities
            }
            onDeselectActivities={
              workflow
                .deselectActivities
            }
            onRemoveActivity={
              workflow.removeActivity
            }
            onClearActivities={
              workflow.clearActivities
            }
            onBuild={() => {
              workflow.goToSummary();
            }}
          />
        )}

      {!selectedRoleIsMissing &&
        workflow.currentStep ===
          "generate" &&
        selectedRole && (
          <WorkflowSummary
            role={selectedRole}
            activities={
              workflow
                .selectedActivities
            }
            totalDuration={
              workflow.totalDuration
            }
            onBack={
              workflow.goBack
            }
            onRestart={
              workflow.restartWorkflow
            }
          />
        )}
    </div>
  );
}
