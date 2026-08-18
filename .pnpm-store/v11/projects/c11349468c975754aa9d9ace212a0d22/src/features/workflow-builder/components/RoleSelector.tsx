import { Bot, CheckCircle2, ChevronDown, Clock3, Loader2, Play, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { Role } from "../types/role.types";
import { RoleCard } from "./RoleCard";
import { SegmentTabs } from "./SegmentTabs";
import discoverHeroGraphic from "@/assets/workflow/discover-hero-graphic.png";

interface RoleSelectorProps {
  roles: Role[]; isLoading: boolean; error: Error | null;
  selectedRoleId: string | null; selectedSegment: string;
  onSelectRole: (roleId: string) => void; onSelectSegment: (segment: string) => void;
  onContinue: () => void; onRetry: () => void;
}

export function RoleSelector(props: RoleSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  const segments = useMemo(() => Array.from(new Set(props.roles.map(r => r.segment).filter((v): v is string => Boolean(v)))), [props.roles]);
  const filtered = useMemo(() => props.selectedSegment === "All" ? props.roles : props.roles.filter(r => r.segment === props.selectedSegment), [props.roles, props.selectedSegment]);
  const visible = showAll ? filtered : filtered.slice(0, 6);

  if (props.isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-sm text-muted-foreground">Loading roles...</span></div>;
  if (props.error) return <ErrorState title="Roles could not be loaded" message={props.error.message} onRetry={props.onRetry} />;

  const selectRole = (roleId: string) => { props.onSelectRole(roleId); props.onContinue(); };

  return <section className="mx-auto w-full max-w-[1800px] space-y-4 px-4 pb-8 pt-4 lg:px-10 xl:px-16">
    <div className="relative min-h-[140px] overflow-hidden rounded-2xl">
      <div className="relative z-10 max-w-2xl">
        <p className="flex items-center gap-1.5 text-sm font-bold">Welcome 👋</p>
        <h1 className="mt-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-2xl font-bold leading-tight text-transparent lg:text-[30px]">Let&apos;s build your ideal workflow.</h1>
        <p className="mt-2 hidden max-w-[560px] text-sm text-muted-foreground sm:block">Based on your role, I&apos;ll recommend the most impactful activities, AI tools, and time allocations.</p>
      </div>
      <img src={discoverHeroGraphic} alt="" className="absolute inset-y-0 right-0 hidden h-full w-[44%] object-cover opacity-75 [mask-image:linear-gradient(to_right,transparent,black_28%)] lg:block" />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      <div data-tour="role-selection" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm lg:col-span-2 lg:p-5">
        <div><div className="mb-1 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Recommended Roles</h2></div><p className="text-sm text-muted-foreground">Choose your role to get a personalized workflow experience.</p></div>
        <SegmentTabs segments={segments} selectedSegment={props.selectedSegment} onSelect={props.onSelectSegment} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{visible.map(role => <RoleCard key={role.externalId} role={role} isSelected={props.selectedRoleId === role.externalId} onSelect={selectRole} />)}</div>
        {filtered.length > 6 && <div className="flex justify-center"><button type="button" onClick={() => setShowAll(v => !v)} className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/10"><ChevronDown className={`h-4 w-4 transition ${showAll ? "rotate-180" : ""}`} />{showAll ? "Show fewer roles" : "View all roles"}</button></div>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/10 bg-primary/5 p-2.5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 shrink-0 text-primary" />Learn how top performers are driving customer impact through Frontier Accelerator resources and activities.</div><span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">Explore <Sparkles className="h-3.5 w-3.5" /></span></div>
      </div>

      <aside data-tour="workflow-benefits" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm lg:p-5">
        <div><div className="mb-1 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">What you&apos;ll get</h2></div><p className="text-sm text-muted-foreground">A personalized workflow designed to maximize your impact.</p></div>
        <div className="mt-5 space-y-4">{[[CheckCircle2,"Relevant activities","Recommendations matched to your role"],[Bot,"The right AI tools","Primary and supporting tools for each task"],[Clock3,"A balanced day","Activities arranged across morning, midday and late day"]].map(([Icon,title,copy]) => { const I=Icon as typeof CheckCircle2; return <div key={title as string} className="flex gap-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><I className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-card-foreground">{title as string}</p><p className="text-xs leading-5 text-muted-foreground">{copy as string}</p></div></div>; })}</div>
      </aside>
    </div>
    <button type="button" onClick={() => window.dispatchEvent(new Event("aito:start-layout-tour"))} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-2.5 text-left transition hover:border-primary/30 hover:bg-primary/10 lg:p-3"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-500"><Sparkles className="h-5 w-5 text-white" /></span><div><p className="text-sm font-semibold text-foreground">New here? Start with a quick tour</p><p className="text-xs text-muted-foreground">See how to choose a role, personalise your workflow, and get the most from the experience.</p></div></div><span className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Play className="h-3.5 w-3.5" />How it works</span></button>
  </section>;
}
