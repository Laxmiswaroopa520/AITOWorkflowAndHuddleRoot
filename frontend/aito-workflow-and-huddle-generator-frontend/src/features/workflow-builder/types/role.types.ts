export interface Role {
  id: number;
  externalId: string;
  name: string;
  abbreviation: string;
  segment: string | null;
  description: string | null;
  sortOrder: number;
}