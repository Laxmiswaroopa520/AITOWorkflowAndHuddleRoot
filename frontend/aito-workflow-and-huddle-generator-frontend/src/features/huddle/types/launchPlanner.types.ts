export type LaunchTaskStatus = "not-started" | "in-progress" | "complete";
export type LaunchTemplateType = "Email" | "Teams post" | "Calendar invite" | "Talking points" | "Meeting agenda";

export interface LaunchConfiguration {
  teamName: string;
  cohortName: string;
  startDate: string;
  endDate: string;
  sponsorName: string;
  managers: string;
  facilitators: string;
  programLead: string;
}

export interface LaunchTemplateDefinition {
  id: string;
  type: LaunchTemplateType;
  title: string;
  subject?: string;
  body: string;
}

export interface LaunchMilestoneDefinition {
  id: string;
  title: string;
  description: string;
  offsetDays: number;
  relativeLabel: string;
  audience: string;
  ownerRole: string;
  checklist: string[];
  templates: LaunchTemplateDefinition[];
}

export interface LaunchTaskState {
  status: LaunchTaskStatus;
  checklist: boolean[];
}

export interface HuddleLaunchPlanResponse extends LaunchConfiguration {
  taskStateJson: string;
  rowVersion: string;
}

export interface SaveHuddleLaunchPlanRequest extends LaunchConfiguration {
  taskStateJson: string;
  rowVersion: string | null;
}
