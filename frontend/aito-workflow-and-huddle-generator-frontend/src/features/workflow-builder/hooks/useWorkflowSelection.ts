import {
  useCallback,
} from "react";

import {
  useAtom,
  useAtomValue,
} from "jotai";

import type {
  Activity,
} from "../types/activity.types";

import {
  currentWorkflowStepAtom,
  editingWorkflowAtom,
  expandedActivityIdAtom,
  saveAsWorkflowAtom,
  selectedActivitiesAtom,
  selectedRoleIdAtom,
  selectedSegmentAtom,
  workflowFiltersAtom,
  type EditingWorkflowState,
  type SaveAsWorkflowState,
} from "../store/workflowAtoms";

import {
  selectedActivityCountAtom,
  selectedActivityIdsAtom,
  totalDurationAtom,
} from "../store/workflowSelectors";

import {
  defaultWorkflowFilters,
} from "../types/workflowBuilder.types";

export type RestoreWorkflowMode =
  | "open"
  | "edit"
  | "save-as";

interface RestoreWorkflowOptions {
  mode: RestoreWorkflowMode;

  editingWorkflow?: EditingWorkflowState;

  saveAsWorkflow?: SaveAsWorkflowState;
}

export function useWorkflowSelection() {
  const [
    currentStep,
    setCurrentStep,
  ] = useAtom(
    currentWorkflowStepAtom,
  );

  const [
    selectedSegment,
    setSelectedSegment,
  ] = useAtom(
    selectedSegmentAtom,
  );

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useAtom(
    selectedRoleIdAtom,
  );

  const [
    selectedActivities,
    setSelectedActivities,
  ] = useAtom(
    selectedActivitiesAtom,
  );

  const [
    filters,
    setFilters,
  ] = useAtom(
    workflowFiltersAtom,
  );

  const [
    expandedActivityId,
    setExpandedActivityId,
  ] = useAtom(
    expandedActivityIdAtom,
  );

  const [
    editingWorkflow,
    setEditingWorkflow,
  ] = useAtom(
    editingWorkflowAtom,
  );

  const [
    saveAsWorkflow,
    setSaveAsWorkflow,
  ] = useAtom(
    saveAsWorkflowAtom,
  );

  const selectedActivityIds =
    useAtomValue(
      selectedActivityIdsAtom,
    );

  const selectedActivityCount =
    useAtomValue(
      selectedActivityCountAtom,
    );

  const totalDuration =
    useAtomValue(
      totalDurationAtom,
    );

  const selectRole = (
    roleId: string,
  ): void => {
    if (
      selectedRoleId &&
      selectedRoleId !== roleId
    ) {
      setSelectedActivities([]);
    }

    /*
     * Changing the role means the user
     * modified the saved workflow.
     * Keep editing metadata so Update
     * remains available.
     */
    setSelectedRoleId(roleId);
  };

  const goToActivities =
    (): boolean => {
      if (!selectedRoleId) {
        return false;
      }

      setCurrentStep("customize");

      return true;
    };

  const goToSummary =
    (): boolean => {
      if (
        selectedActivities.length ===
        0
      ) {
        return false;
      }

      setCurrentStep("generate");

      return true;
    };

  const goBack = (): void => {
    if (
      currentStep === "generate"
    ) {
      setCurrentStep("customize");
      return;
    }

    if (
      currentStep === "customize"
    ) {
      setCurrentStep("discover");
    }
  };

  const toggleActivity = (
    activity: Activity,
  ): void => {
    setSelectedActivities(
      currentActivities => {
        const exists =
          currentActivities.some(
            selected =>
              selected.id ===
              activity.id,
          );

        if (exists) {
          return currentActivities.filter(
            selected =>
              selected.id !==
              activity.id,
          );
        }

        return [
          ...currentActivities,
          activity,
        ];
      },
    );
  };

  const selectActivities = (
    activities: Activity[],
  ): void => {
    setSelectedActivities(
      currentActivities => {
        const existingIds =
          new Set(
            currentActivities.map(
              activity =>
                activity.id,
            ),
          );

        const newActivities =
          activities.filter(
            activity =>
              !existingIds.has(
                activity.id,
              ),
          );

        return [
          ...currentActivities,
          ...newActivities,
        ];
      },
    );
  };

  const deselectActivities = (
    activityIds: number[],
  ): void => {
    const ids =
      new Set(activityIds);

    setSelectedActivities(
      currentActivities =>
        currentActivities.filter(
          activity =>
            !ids.has(activity.id),
        ),
    );
  };

  const removeActivity = (
    activityId: number,
  ): void => {
    setSelectedActivities(
      currentActivities =>
        currentActivities.filter(
          activity =>
            activity.id !==
            activityId,
        ),
    );
  };

  const clearActivities =
    (): void => {
      setSelectedActivities([]);
    };

  const clearFilters =
    (): void => {
      setFilters({
        ...defaultWorkflowFilters,
      });
    };

  const clearPersistenceContext =
    useCallback((): void => {
      setEditingWorkflow(null);
      setSaveAsWorkflow(null);
    }, [
      setEditingWorkflow,
      setSaveAsWorkflow,
    ]);

  /*
   * Restores a SQL-backed saved workflow
   * into the temporary Workflow Builder state.
   */
  const restoreWorkflow =
    useCallback(
      (
        roleExternalId: string,
        activities: Activity[],
        options: RestoreWorkflowOptions,
      ): void => {
        setSelectedSegment("All");

        setSelectedRoleId(
          roleExternalId,
        );

        setSelectedActivities(
          activities,
        );

        setCurrentStep("generate");

        setExpandedActivityId(null);

        setFilters({
          ...defaultWorkflowFilters,
        });

        if (
          options.mode === "edit"
        ) {
          setEditingWorkflow(
            options.editingWorkflow ??
              null,
          );

          setSaveAsWorkflow(null);

          return;
        }

        if (
          options.mode === "save-as"
        ) {
          setEditingWorkflow(null);

          setSaveAsWorkflow(
            options.saveAsWorkflow ??
              null,
          );

          return;
        }

        /*
         * Open mode restores the workflow
         * as a temporary workflow.
         */
        setEditingWorkflow(null);
        setSaveAsWorkflow(null);
      },
      [
        setCurrentStep,
        setEditingWorkflow,
        setExpandedActivityId,
        setFilters,
        setSaveAsWorkflow,
        setSelectedActivities,
        setSelectedRoleId,
        setSelectedSegment,
      ],
    );

  const restartWorkflow =
    (): void => {
      setCurrentStep("discover");
      setSelectedSegment("All");
      setSelectedRoleId(null);
      setSelectedActivities([]);

      setFilters({
        ...defaultWorkflowFilters,
      });

      setExpandedActivityId(null);
      setEditingWorkflow(null);
      setSaveAsWorkflow(null);
    };

  return {
    currentStep,
    selectedSegment,
    selectedRoleId,
    selectedActivities,
    selectedActivityIds,
    selectedActivityCount,
    totalDuration,
    filters,
    expandedActivityId,

    editingWorkflow,
    saveAsWorkflow,

    setCurrentStep,
    setSelectedSegment,
    setFilters,
    setExpandedActivityId,
    setEditingWorkflow,
    setSaveAsWorkflow,

    selectRole,
    toggleActivity,
    selectActivities,
    deselectActivities,
    removeActivity,
    clearActivities,
    clearFilters,
    clearPersistenceContext,

    restoreWorkflow,

    goToActivities,
    goToSummary,
    goBack,
    restartWorkflow,
  };
}

/*import {
  useAtom,
  useAtomValue,
} from "jotai";

import type {
  Activity,
} from "../types/activity.types";

import {
  currentWorkflowStepAtom,
  expandedActivityIdAtom,
  selectedActivitiesAtom,
  selectedRoleIdAtom,
  selectedSegmentAtom,
  workflowFiltersAtom,
} from "../store/workflowAtoms";

import {
  selectedActivityCountAtom,
  selectedActivityIdsAtom,
  totalDurationAtom,
} from "../store/workflowSelectors";

import {
  defaultWorkflowFilters,
} from "../types/workflowBuilder.types";

export function useWorkflowSelection() {
  const [
    currentStep,
    setCurrentStep,
  ] = useAtom(
    currentWorkflowStepAtom,
  );

  const [
    selectedSegment,
    setSelectedSegment,
  ] = useAtom(
    selectedSegmentAtom,
  );

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useAtom(
    selectedRoleIdAtom,
  );

  const [
    selectedActivities,
    setSelectedActivities,
  ] = useAtom(
    selectedActivitiesAtom,
  );

  const [
    filters,
    setFilters,
  ] = useAtom(
    workflowFiltersAtom,
  );

  const [
    expandedActivityId,
    setExpandedActivityId,
  ] = useAtom(
    expandedActivityIdAtom,
  );

  const selectedActivityIds =
    useAtomValue(
      selectedActivityIdsAtom,
    );

  const selectedActivityCount =
    useAtomValue(
      selectedActivityCountAtom,
    );

  const totalDuration =
    useAtomValue(
      totalDurationAtom,
    );

  const selectRole = (
    roleId: string,
  ): void => {
    if (
      selectedRoleId &&
      selectedRoleId !== roleId
    ) {
      setSelectedActivities([]);
    }

    setSelectedRoleId(roleId);
  };

  const goToActivities = (): boolean => {
    if (!selectedRoleId) {
      return false;
    }

    setCurrentStep("customize");

    return true;
  };

  const goToSummary = (): boolean => {
    if (
      selectedActivities.length === 0
    ) {
      return false;
    }

    setCurrentStep("generate");

    return true;
  };

  const goBack = (): void => {
    if (currentStep === "generate") {
      setCurrentStep("customize");
      return;
    }

    if (currentStep === "customize") {
      setCurrentStep("discover");
    }
  };

  const toggleActivity = (
    activity: Activity,
  ): void => {
    setSelectedActivities(
      currentActivities => {
        const exists =
          currentActivities.some(
            selected =>
              selected.id ===
              activity.id,
          );

        if (exists) {
          return currentActivities.filter(
            selected =>
              selected.id !==
              activity.id,
          );
        }

        return [
          ...currentActivities,
          activity,
        ];
      },
    );
  };

  const selectActivities = (
    activities: Activity[],
  ): void => {
    setSelectedActivities(
      currentActivities => {
        const existingIds =
          new Set(
            currentActivities.map(
              activity =>
                activity.id,
            ),
          );

        const newActivities =
          activities.filter(
            activity =>
              !existingIds.has(
                activity.id,
              ),
          );

        return [
          ...currentActivities,
          ...newActivities,
        ];
      },
    );
  };

  const deselectActivities = (
    activityIds: number[],
  ): void => {
    const ids =
      new Set(activityIds);

    setSelectedActivities(
      currentActivities =>
        currentActivities.filter(
          activity =>
            !ids.has(activity.id),
        ),
    );
  };

  const removeActivity = (
    activityId: number,
  ): void => {
    setSelectedActivities(
      currentActivities =>
        currentActivities.filter(
          activity =>
            activity.id !== activityId,
        ),
    );
  };

  const clearActivities = (): void => {
    setSelectedActivities([]);
  };

  const clearFilters = (): void => {
    setFilters({
      ...defaultWorkflowFilters,
    });
  };

  const restartWorkflow = (): void => {
    setCurrentStep("discover");
    setSelectedSegment("All");
    setSelectedRoleId(null);
    setSelectedActivities([]);
    setFilters({
      ...defaultWorkflowFilters,
    });
    setExpandedActivityId(null);
  };

  return {
    currentStep,
    selectedSegment,
    selectedRoleId,
    selectedActivities,
    selectedActivityIds,
    selectedActivityCount,
    totalDuration,
    filters,
    expandedActivityId,

    setCurrentStep,
    setSelectedSegment,
    setFilters,
    setExpandedActivityId,

    selectRole,
    toggleActivity,
    selectActivities,
    deselectActivities,
    removeActivity,
    clearActivities,
    clearFilters,
    goToActivities,
    goToSummary,
    goBack,
    restartWorkflow,
  };
}
*/