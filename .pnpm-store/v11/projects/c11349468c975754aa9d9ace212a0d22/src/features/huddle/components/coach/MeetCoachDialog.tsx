import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Check, ExternalLink, Loader2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookCoach, useCoachAvailability, useCoaches } from "../../hooks";
import type { CoachAvailabilitySlotResponse, CoachResponse } from "../../types";
import { dateKey, formatCoachDateTime, formatCoachTime, getBrowserTimeZone, getSupportedTimeZones } from "./coachTimeZone";

type Step = "coach" | "availability" | "review" | "confirmation";
interface MeetCoachDialogProps { open: boolean; huddleExternalId: string; huddleName: string; onClose: () => void }

function availabilityWindow() {
  const start = new Date();
  start.setUTCSeconds(0, 0);
  start.setUTCMinutes(Math.ceil(start.getUTCMinutes() / 15) * 15);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 14);
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
}

export function MeetCoachDialog({ open, huddleExternalId, huddleName, onClose }: MeetCoachDialogProps) {
  const [step, setStep] = useState<Step>("coach");
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [duration, setDuration] = useState(30);
  const [timeZone, setTimeZone] = useState(getBrowserTimeZone);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<CoachAvailabilitySlotResponse | null>(null);
  const [question, setQuestion] = useState("");
  const [bookingRequestId, setBookingRequestId] = useState(() => crypto.randomUUID());
  const [window] = useState(availabilityWindow);
  const [zones] = useState(getSupportedTimeZones);
  const coaches = useCoaches(huddleExternalId, open);
  const availability = useCoachAvailability(coach?.externalId ?? null, window.startUtc, window.endUtc, duration, open && Boolean(coach));
  const booking = useBookCoach();
  const groupedSlots = useMemo(() => {
    const groups = new Map<string, CoachAvailabilitySlotResponse[]>();
    for (const item of availability.data?.slots ?? []) {
      const key = dateKey(item.startUtc, timeZone);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return groups;
  }, [availability.data?.slots, timeZone]);

  if (!open) return null;
  const selectCoach = (value: CoachResponse) => { setCoach(value); setSlot(null); setSelectedDate(null); setStep("availability"); };
  const selectSlot = (value: CoachAvailabilitySlotResponse) => { setSlot(value); setBookingRequestId(crypto.randomUUID()); };
  const confirm = async () => {
    if (!coach || !slot) return;
    await booking.mutateAsync({ coachExternalId: coach.externalId, huddleExternalId, startUtc: slot.startUtc, endUtc: slot.endUtc, displayTimeZone: timeZone, question: question.trim() || null, bookingRequestId });
    setStep("confirmation");
  };

  return <div role="dialog" aria-modal="true" aria-label="Meet with a Coach" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-3 sm:p-6">
    <div className="flex max-h-[94vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b px-5 py-4"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5 text-[#0F6CBD]"/>Meet with a Coach</h2><p className="mt-1 text-xs text-muted-foreground">Get practical guidance for “{huddleName}”.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Coach booking"><X className="h-4 w-4"/></Button></header>
      {step !== "confirmation" && <div className="border-b bg-[#F5F9FF] px-5 py-3"><div className="mx-auto flex max-w-xl items-center justify-between text-xs font-semibold">{["Coach", "Availability", "Review"].map((label, index) => { const active = ["coach", "availability", "review"].indexOf(step) >= index; return <span key={label} className={cn("flex items-center gap-2", active ? "text-[#0F6CBD]" : "text-muted-foreground")}><span className={cn("flex h-7 w-7 items-center justify-center rounded-full border", active && "border-[#0F6CBD] bg-[#0F6CBD] text-white")}>{index + 1}</span>{label}</span>; })}</div></div>}
      <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        {step === "coach" && <CoachStep data={coaches.data} loading={coaches.isLoading} error={coaches.error} onRetry={() => void coaches.refetch()} onSelect={selectCoach}/>} 
        {step === "availability" && coach && <section><h3 className="text-xl font-semibold">Choose a time with {coach.displayName}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Duration<select className="mt-1 h-10 w-full rounded-md border bg-white px-3" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSlot(null); }}><option value={30}>30 minutes</option><option value={60}>60 minutes</option></select></label><label className="text-sm font-medium">Display time zone<select className="mt-1 h-10 w-full rounded-md border bg-white px-3" value={timeZone} onChange={(event) => { setTimeZone(event.target.value); setSlot(null); setSelectedDate(null); }}>{zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label></div><AvailabilityBody loading={availability.isLoading} error={availability.error} groups={groupedSlots} selectedDate={selectedDate} timeZone={timeZone} slot={slot} onDate={setSelectedDate} onSlot={selectSlot} onRetry={() => void availability.refetch()}/></section>}
        {step === "review" && coach && slot && <section className="mx-auto max-w-2xl space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#0F6CBD]">Review</p><h3 className="mt-1 text-xl font-semibold">Confirm your coaching session</h3></div><div className="rounded-xl border bg-[#F5F9FF] p-5"><p className="font-semibold">{huddleName}</p><p className="mt-3 text-sm"><strong>Coach:</strong> {coach.displayName}</p><p className="mt-2 text-sm"><strong>When:</strong> {formatCoachDateTime(slot.startUtc, timeZone)}</p><p className="mt-2 text-sm"><strong>Duration:</strong> {duration} minutes</p></div><label className="block text-sm font-medium">Question or context (optional)<textarea value={question} maxLength={2000} onChange={(event) => setQuestion(event.target.value)} className="mt-1 min-h-28 w-full rounded-md border p-3" placeholder="What would you like guidance on?"/></label>{booking.error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{booking.error.message}</p>}</section>}
        {step === "confirmation" && booking.data && <section className="mx-auto max-w-xl py-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700"><Check className="h-7 w-7"/></span><h3 className="mt-4 text-2xl font-semibold">Your coaching session is booked</h3><p className="mt-2 text-muted-foreground">The real calendar event was created successfully.</p><div className="mt-5 rounded-xl border bg-[#F5F9FF] p-5 text-left"><p className="font-semibold">{booking.data.coachDisplayName}</p><p className="mt-2 text-sm">{formatCoachDateTime(booking.data.startUtc, timeZone)}</p></div>{booking.data.joinUrl && <Button asChild className="mt-5 bg-[#0F6CBD] hover:bg-[#115EA3]"><a href={booking.data.joinUrl} target="_blank" rel="noreferrer">Open Teams meeting<ExternalLink className="ml-2 h-4 w-4"/></a></Button>}</section>}
      </main>
      <footer className="flex justify-between border-t px-5 py-3">{step !== "coach" && step !== "confirmation" ? <Button variant="ghost" onClick={() => setStep(step === "review" ? "availability" : "coach")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button> : <span/>}{step === "availability" && <Button disabled={!slot} onClick={() => setStep("review")} className="bg-[#0F6CBD] hover:bg-[#115EA3]">Review<ArrowRight className="ml-2 h-4 w-4"/></Button>}{step === "review" && <Button disabled={booking.isPending} onClick={() => void confirm()} className="bg-[#0F6CBD] hover:bg-[#115EA3]">{booking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Book session</Button>}{step === "confirmation" && <Button onClick={onClose}>Done</Button>}</footer>
    </div>
  </div>;
}

function CoachStep({ data, loading, error, onRetry, onSelect }: { data: CoachResponse[] | undefined; loading: boolean; error: Error | null; onRetry: () => void; onSelect: (coach: CoachResponse) => void }) {
  if (loading) return <State icon={<Loader2 className="h-6 w-6 animate-spin"/>} title="Loading approved Coaches" body="Retrieving the Coach directory…"/>;
  if (error) return <State icon={<UserRound className="h-6 w-6"/>} title="Coach scheduling unavailable" body={error.message} action={<Button variant="outline" onClick={onRetry}>Retry</Button>}/>;
  if (!data?.length) return <State icon={<UserRound className="h-6 w-6"/>} title="No Coaches are available" body="No approved Coach is configured for this Huddle."/>;
  return <section><h3 className="text-xl font-semibold">Choose a Coach</h3><p className="mt-1 text-sm text-muted-foreground">Only approved, active Coaches are shown.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{data.map((coach) => <button key={coach.externalId} type="button" onClick={() => onSelect(coach)} className="rounded-xl border p-5 text-left hover:border-[#0F6CBD] hover:bg-[#F5F9FF]"><div className="flex gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F2FF] font-semibold text-[#0F6CBD]">{coach.displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="font-semibold">{coach.displayName}</p>{coach.jobTitle && <p className="text-sm text-muted-foreground">{coach.jobTitle}</p>}</div></div>{coach.biography && <p className="mt-3 text-sm leading-6 text-[#616161]">{coach.biography}</p>}<div className="mt-3 flex flex-wrap gap-1">{coach.expertise.map((item) => <span key={item} className="rounded bg-[#E8F2FF] px-2 py-1 text-xs text-[#0F6CBD]">{item}</span>)}</div></button>)}</div></section>;
}

function AvailabilityBody({ loading, error, groups, selectedDate, timeZone, slot, onDate, onSlot, onRetry }: { loading: boolean; error: Error | null; groups: Map<string, CoachAvailabilitySlotResponse[]>; selectedDate: string | null; timeZone: string; slot: CoachAvailabilitySlotResponse | null; onDate: (date: string) => void; onSlot: (slot: CoachAvailabilitySlotResponse) => void; onRetry: () => void }) {
  if (loading) return <State icon={<Loader2 className="h-6 w-6 animate-spin"/>} title="Checking both calendars" body="Finding mutually available times…"/>;
  if (error) return <State icon={<CalendarClock className="h-6 w-6"/>} title="Availability unavailable" body={error.message} action={<Button variant="outline" onClick={onRetry}>Retry</Button>}/>;
  if (!groups.size) return <State icon={<CalendarClock className="h-6 w-6"/>} title="No mutual availability" body="Try another Coach or duration."/>;
  const dates = [...groups.keys()]; const activeDate = selectedDate ?? dates[0];
  return <div className="mt-5"><div className="flex gap-2 overflow-x-auto pb-2">{dates.map((date) => <button key={date} onClick={() => onDate(date)} className={cn("flex-shrink-0 rounded-lg border px-3 py-2 text-sm", activeDate === date ? "border-[#0F6CBD] bg-[#E8F2FF] text-[#0F6CBD]" : "bg-white")}>{new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(new Date(groups.get(date)![0].startUtc))}</button>)}</div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{(groups.get(activeDate) ?? []).map((item) => <button key={item.startUtc} onClick={() => onSlot(item)} className={cn("rounded-lg border px-3 py-2 text-sm", slot?.startUtc === item.startUtc ? "border-[#0F6CBD] bg-[#0F6CBD] text-white" : "hover:border-[#0F6CBD] hover:bg-[#F5F9FF]")}>{formatCoachTime(item.startUtc, timeZone)}</button>)}</div></div>;
}

function State({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) { return <div className="mx-auto my-8 max-w-xl rounded-xl border border-dashed p-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F2FF] text-[#0F6CBD]">{icon}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{body}</p>{action && <div className="mt-4">{action}</div>}</div>; }
