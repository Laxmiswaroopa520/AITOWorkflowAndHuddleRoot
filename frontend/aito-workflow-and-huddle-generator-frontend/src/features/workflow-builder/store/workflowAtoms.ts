

import {
  atom,
} from "jotai";

import type {
  Activity,
} from "../types/activity.types";

import {
  defaultWorkflowFilters,
  type WorkflowFilters,
  type WorkflowStep,
} from "../types/workflowBuilder.types";

export interface EditingWorkflowState {
  id: string;
  name: string;
  description: string | null;
  rowVersion: string;
}

export interface SaveAsWorkflowState {
  suggestedName: string;
  description: string | null;
}

export const currentWorkflowStepAtom =
  atom<WorkflowStep>("discover");

export const selectedSegmentAtom =
  atom<string>("All");

export const selectedRoleIdAtom =
  atom<string | null>(null);

export const selectedActivitiesAtom =
  atom<Activity[]>([]);

export const workflowFiltersAtom =
  atom<WorkflowFilters>({
    ...defaultWorkflowFilters,
  });

export const expandedActivityIdAtom =
  atom<number | null>(null);

/*
 * Not null when an existing saved workflow
 * is being edited.
 */
export const editingWorkflowAtom =
  atom<EditingWorkflowState | null>(
    null,
  );

/*
 * Not null when the user selected Save As
 * from My Workflows.
 */
export const saveAsWorkflowAtom =
  atom<SaveAsWorkflowState | null>(
    null,
  );






/*import {
  atom,
} from "jotai";

import type {
  Activity,
} from "../types/activity.types";

import {
  defaultWorkflowFilters,
  type WorkflowFilters,
  type WorkflowStep,
} from "../types/workflowBuilder.types";

export const currentWorkflowStepAtom =
  atom<WorkflowStep>("discover");

export const selectedSegmentAtom =
  atom<string>("All");

export const selectedRoleIdAtom =
  atom<string | null>(null);

export const selectedActivitiesAtom =
  atom<Activity[]>([]);

export const workflowFiltersAtom =
  atom<WorkflowFilters>({
    ...defaultWorkflowFilters,
  });

export const expandedActivityIdAtom =
  atom<number | null>(null);
//saved -workflow part
  export interface EditingWorkflowState {
  id: string;
  name: string;
  description: string | null;
  rowVersion: string;
}

export const editingWorkflowAtom =
  atom<
    EditingWorkflowState | null
  >(null);

  */