import type {
  MyWorkflowFilters,
} from "../types/savedWorkflow.types";

export const savedWorkflowKeys = {
  all: [
    "saved-workflows",
  ] as const,

  lists: () =>
    [
      ...savedWorkflowKeys.all,
      "list",
    ] as const,

  list: (
    filters: MyWorkflowFilters,
  ) =>
    [
      ...savedWorkflowKeys.lists(),
      filters,
    ] as const,

  details: () =>
    [
      ...savedWorkflowKeys.all,
      "detail",
    ] as const,

  detail: (
    workflowId: string,
  ) =>
    [
      ...savedWorkflowKeys.details(),
      workflowId,
    ] as const,
};