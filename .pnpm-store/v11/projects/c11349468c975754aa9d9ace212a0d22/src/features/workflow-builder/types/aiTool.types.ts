export interface AiTool {
  id: number;
  externalId: string;
  name: string;
  description: string | null;
  color: string | null;
  iconKey: string | null;
  sortOrder: number;
}