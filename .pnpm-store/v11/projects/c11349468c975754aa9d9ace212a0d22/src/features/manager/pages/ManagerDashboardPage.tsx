import { BarChart3, CalendarDays, CheckCircle2, Clock3, Route, Users } from "lucide-react";
import { Link } from "react-router";
import { useHuddleCatalog, useIncompleteHuddleSessions } from "@/features/huddle/hooks";

export function ManagerDashboardPage() {
  const catalog = useHuddleCatalog();
  const sessions = useIncompleteHuddleSessions();
  const topics = catalog.data ?? [];
  const active = sessions.data ?? [];
  const rolePathCount = topics.filter(item => item.type.toLowerCase().includes("guided") || item.type.toLowerCase().includes("role")).length;
  const orientationCount = topics.filter(item => item.type.toLowerCase().includes("foundation") || item.type.toLowerCase().includes("orientation")).length;
  const additionalCount = Math.max(0, topics.length - rolePathCount - orientationCount);
  const completedActivityCount = active.reduce((sum,item)=>sum+item.session.completedActivityCount,0);
  const totalActivityCount = active.reduce((sum,item)=>sum+item.session.validActivityCount,0);
  const activityProgress = totalActivityCount ? Math.round((completedActivityCount/totalActivityCount)*100) : 0;

  return <div className="min-h-[calc(100vh-4rem)] bg-[#F3F8FC] p-4 lg:p-6"><div className="mx-auto max-w-[1500px] space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A6BBA]">Manager experience</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1E3252]">Team adoption overview</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#66798C]">A concise view of available learning, in-progress Huddles, and launch readiness. Team-level aggregation can be connected to directory/cohort membership when that source is enabled.</p></div><Link to="/launch-planner" className="inline-flex items-center gap-2 rounded-xl bg-[#0A6BBA] px-4 py-2.5 text-sm font-semibold text-white"><CalendarDays className="h-4 w-4"/>Open Launch Planner</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      [Route,"Role Path topics",rolePathCount,"Recommended learning journey"],
      [BarChart3,"Additional topics",additionalCount,"Evergreen learning library"],
      [Clock3,"In-progress Huddles",active.length,"Sessions that can be resumed"],
      [CheckCircle2,"Activity progress",`${activityProgress}%`,`${completedActivityCount} of ${totalActivityCount || 0} active-session activities`],
    ].map(([Icon,label,value,copy])=>{const I=Icon as typeof Route;return <section key={String(label)} className="rounded-2xl border border-[#D7E4EC] bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F1F9] text-[#0A6BBA]"><I className="h-5 w-5"/></div><p className="mt-5 text-3xl font-semibold text-[#1E3252]">{String(value)}</p><p className="mt-1 text-sm font-semibold text-[#31465A]">{String(label)}</p><p className="mt-2 text-xs leading-5 text-[#7A8B99]">{String(copy)}</p></section>})}</div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="rounded-3xl border border-[#D7E4EC] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A6BBA]">Current learning</p><h2 className="mt-1 text-xl font-semibold text-[#1E3252]">Huddles in progress</h2></div><Users className="h-5 w-5 text-[#0A6BBA]"/></div><div className="mt-5 space-y-3">{active.length ? active.map(item => { const pct=item.session.validActivityCount?Math.round(item.session.completedActivityCount/item.session.validActivityCount*100):0; return <article key={item.huddleExternalId} className="rounded-2xl border border-[#E0E9EF] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-[#1E3252]">{item.huddleName}</p><p className="mt-1 text-xs text-[#66798C]">{item.session.completedActivityCount} of {item.session.validActivityCount} activities complete</p></div><span className="rounded-full bg-[#E3F1ED] px-3 py-1 text-xs font-semibold text-[#184448]">{pct}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E4EDF3]"><div className="h-full bg-[#0A6BBA]" style={{width:`${pct}%`}}/></div></article>}) : <div className="rounded-2xl border border-dashed border-[#D7E4EC] p-8 text-center"><p className="font-semibold text-[#52677A]">No in-progress Huddles</p><p className="mt-1 text-sm text-[#7A8B99]">Start a Huddle from the Role Path to see progress here.</p></div>}</div></section>
      <section className="rounded-3xl border border-[#D7E4EC] bg-[#1E3252] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8DC8E8]">Manager next actions</p><h2 className="mt-2 text-2xl font-semibold">Keep the cohort moving</h2><div className="mt-6 space-y-4">{["Confirm cohort and facilitator ownership","Review Role Path before launch","Use communications calendar for key touchpoints","Review incomplete Huddles and remove blockers"].map((item,index)=><div key={item} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{index+1}</span><p className="pt-1 text-sm leading-5 text-white/80">{item}</p></div>)}</div></section>
    </div>
  </div></div>;
}
