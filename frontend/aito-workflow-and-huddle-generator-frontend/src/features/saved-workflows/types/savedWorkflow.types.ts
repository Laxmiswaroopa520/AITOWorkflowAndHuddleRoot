export interface SavedWorkflowActivity {
  id: number;
  externalId: string;
  title: string;
  description: string | null;

  workflowBucketExternalId:
    string;

  workflowBucketName: string;

  category: string;
  frequency: string;
  priority: string;

  durationMinutes: number;
  sortOrder: number;
}

export interface SavedWorkflowSummary {
  id: string;
  name: string;
  description: string | null;

  roleExternalId: string;
  roleName: string;
  roleAbbreviation: string;

  activityCount: number;
  totalDurationMinutes: number;

  isFavorite: boolean;

  createdAtUtc: string;
  updatedAtUtc: string | null;

  rowVersion: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string | null;

  ownerObjectId: string;
  ownerEmail: string;
  ownerDisplayName: string;

  roleExternalId: string;
  roleName: string;
  roleAbbreviation: string;

  totalDurationMinutes: number;
  isFavorite: boolean;

  createdAtUtc: string;
  updatedAtUtc: string | null;

  rowVersion: string;

  activities:
    SavedWorkflowActivity[];
}

export interface SaveWorkflowInput {
  name: string;
  description: string | null;
  roleExternalId: string;

  activityExternalIds:
    string[];
}

export interface UpdateWorkflowInput
  extends SaveWorkflowInput {
  id: string;
  rowVersion: string;
}

export interface ToggleFavoriteInput {
  id: string;
  isFavorite: boolean;
  rowVersion: string;
}

export interface MyWorkflowFilters {
  search?: string;
  isFavorite?: boolean;
}