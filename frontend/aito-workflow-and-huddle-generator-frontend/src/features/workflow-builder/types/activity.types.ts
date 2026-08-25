export interface ActivityAiTool {
  id: number;
  externalId: string;
  name: string;
  description: string | null;
  color: string | null;
  iconKey: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Activity {
  id: number;
  externalId: string;
  title: string;
  description: string | null;

  roleExternalId: string;
  roleName: string;
  roleAbbreviation: string;

  workflowBucketExternalId: string;
  workflowBucketName: string;

  category: string;
  frequency: string;
  priority: string;
  toolCoverageLevel: string;
  triggerContext: string;
  mcemStage: string;

  durationMinutes: number;

  businessOutcome: string | null;
  beginnerPrompt: string | null;
  advancedPrompt: string | null;
  suggestedOutputs: string | null;

  sortOrder: number;
  aiTools: ActivityAiTool[];
}

export interface ActivityFilters {
  roleId?: string;
  workflowBucketId?: string;
  aiToolId?: string;
  category?: string;
  frequency?: string;
  priority?: string;
  toolCoverageLevel?: string;
  triggerContext?: string;
  mcemStage?: string;
  search?: string;
  includeInactive?: boolean;
}