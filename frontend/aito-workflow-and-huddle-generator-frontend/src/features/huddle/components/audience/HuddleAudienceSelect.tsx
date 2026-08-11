import type { HuddleRoleResponse } from "../../types";

interface HuddleAudienceSelectProps {
  roles: HuddleRoleResponse[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function HuddleAudienceSelect({ roles, value, onChange }: HuddleAudienceSelectProps) {
  return (
    <label className="block max-w-[360px]">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground">Audience</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]">
        <option value="">Select an audience</option>
        {roles.map((role) => <option key={role.externalId} value={role.externalId}>{role.name}</option>)}
      </select>
    </label>
  );
}
