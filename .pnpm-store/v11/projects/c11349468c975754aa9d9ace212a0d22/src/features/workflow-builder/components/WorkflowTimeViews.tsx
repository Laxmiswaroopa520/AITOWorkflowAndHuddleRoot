import { CalendarDays, Clock3, GripVertical, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Activity } from "../types/activity.types";
import { DaySchedule } from "./DaySchedule";

type Horizon = "day" | "week" | "month" | "quarter" | "year";
const horizons: {id:Horizon;label:string;copy:string}[] = [
  {id:"day",label:"Day",copy:"Plan today in focused work blocks"},
  {id:"week",label:"Week",copy:"Spread activities across a working week"},
  {id:"month",label:"Month",copy:"Organize recurring work across four weeks"},
  {id:"quarter",label:"Quarter",copy:"Sequence priorities across three months"},
  {id:"year",label:"Year",copy:"See an annual rhythm for AI-assisted work"},
];
const buckets: Record<Exclude<Horizon,"day">, string[]> = {
  week:["Monday","Tuesday","Wednesday","Thursday","Friday"],
  month:["Week 1","Week 2","Week 3","Week 4"],
  quarter:["Month 1","Month 2","Month 3"],
  year:["Q1","Q2","Q3","Q4"],
};

function distribute(items: Activity[], count: number) { return Array.from({length:count},(_,index)=>items.filter((_,i)=>i%count===index)); }
function duration(items: Activity[]) { const minutes=items.reduce((sum,item)=>sum+item.durationMinutes,0); const h=Math.floor(minutes/60); const m=minutes%60; return h ? `${h}h${m?` ${m}m`:""}` : `${m}m`; }

export function WorkflowTimeViews({activities}:{activities:Activity[]}) {
  const [horizon,setHorizon]=useState<Horizon>("day");
  const current=horizons.find(x=>x.id===horizon)!;
  const groups=useMemo(()=>horizon==="day"?[]:distribute(activities,buckets[horizon].length),[activities,horizon]);
  return <div className="space-y-4">
    <div className="rounded-2xl border border-[#D7E4EC] bg-white p-2 shadow-sm"><div className="flex gap-1 overflow-x-auto">{horizons.map(item=><button key={item.id} onClick={()=>setHorizon(item.id)} className={`min-w-[88px] flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${horizon===item.id?"bg-[#0A6BBA] text-white shadow-sm":"text-[#52677A] hover:bg-[#EEF5F9]"}`}>{item.label}</button>)}</div></div>
    <div className="flex flex-wrap items-center justify-between gap-3 px-1"><div><h2 className="text-xl font-semibold text-[#1E3252]">{current.label} view</h2><p className="mt-1 text-sm text-[#66798C]">{current.copy}. Use the schedule controls to move activities into the right rhythm.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#E3F1ED] px-3 py-1.5 text-xs font-semibold text-[#184448]"><Layers3 className="h-3.5 w-3.5"/>{activities.length} activities</span></div>
    {horizon==="day" ? <DaySchedule activities={activities}/> : <div className={`grid gap-4 ${horizon==="week"?"xl:grid-cols-5 md:grid-cols-2":"md:grid-cols-2 xl:grid-cols-4"}`}>{buckets[horizon].map((label,index)=><section key={label} className="min-h-[240px] rounded-2xl border border-[#D7E4EC] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#0A6BBA]"/><h3 className="text-sm font-bold text-[#1E3252]">{label}</h3></div><span className="text-xs font-semibold text-[#7A8B99]">{duration(groups[index])}</span></div><div className="mt-4 space-y-2">{groups[index].length===0?<div className="rounded-xl border border-dashed border-[#D7E4EC] p-5 text-center text-xs text-[#7A8B99]">Open capacity</div>:groups[index].map(activity=><article key={activity.id} className="rounded-xl border border-[#E1E9EF] bg-[#FBFDFE] p-3"><div className="flex items-start gap-2"><GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-[#A0AFBA]"/><div className="min-w-0"><p className="text-sm font-semibold leading-5 text-[#1E3252]">{activity.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#66798C]"><Clock3 className="h-3 w-3"/>{activity.durationMinutes} min</p>{activity.aiTools[0]&&<span className="mt-2 inline-block rounded-full bg-[#E2F1F9] px-2 py-1 text-[11px] font-semibold text-[#0A6BBA]">{activity.aiTools[0].name}</span>}</div></div></article>)}</div></section>)}</div>}
  </div>;
}
