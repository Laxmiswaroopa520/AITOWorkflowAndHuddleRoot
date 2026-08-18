import type { HuddleRoleResponse } from "../../types";
import { BriefcaseBusiness } from "lucide-react";

interface HuddleAudienceSelectProps {
  roles: HuddleRoleResponse[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function HuddleAudienceSelect({ roles, value, onChange }: HuddleAudienceSelectProps) {
  return (
    <label className="block w-full max-w-[220px]">
      <span className="mb-1.5 block text-xs font-medium text-[#424242]">Audience <span aria-hidden="true">ⓘ</span></span>
      <span className="relative block"><BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F6CBD]" /><select value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} className="h-11 w-full appearance-auto rounded-lg border border-[#0F6CBD]/60 bg-white pl-9 pr-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F6CBD]/25">
        <option value="">Select an audience</option>
        {roles.map((role) => <option key={role.externalId} value={role.externalId}>{role.name}</option>)}
      </select></span>
    </label>
  );
}
