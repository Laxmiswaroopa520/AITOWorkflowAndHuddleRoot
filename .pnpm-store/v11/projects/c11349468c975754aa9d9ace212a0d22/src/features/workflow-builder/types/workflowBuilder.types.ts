import type {
  Activity,
} from "./activity.types";

export type WorkflowStep =
  | "discover"
  | "customize"
  | "generate";

export type DurationFilter =
  | "all"
  | "short"
  | "medium"
  | "long";

export interface WorkflowFilters {
  search: string;
  aiToolId: string;
  workflowBucketId: string;
  category: string;
  priority: string;
  frequency: string;
  duration: DurationFilter;
}

export interface WorkflowSelectionState {
  selectedSegment: string;

  selectedRoleId:
    string | null;

  selectedActivities:
    Activity[];

  currentStep:
    WorkflowStep;
}

export const defaultWorkflowFilters:
  WorkflowFilters = {
    search: "",
    aiToolId: "all",
    workflowBucketId: "all",
    category: "all",
    priority: "all",
    frequency: "all",
    duration: "all",
  };