import { ChevronLeft, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HuddlePresentationFacilitatorGuide } from "../../types";

interface HuddleTalkTrackPanelProps {
  guide: HuddlePresentationFacilitatorGuide | null;
  onClose: () => void;
}

export function HuddleTalkTrackPanel({ guide, onClose }: HuddleTalkTrackPanelProps) {
  return (
    <aside aria-label="Facilitator Talk Track" className="absolute inset-y-0 right-0 z-10 flex w-full max-w-xl flex-col border-l border-[#e1e4e8] bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b bg-[#f5f9ff] p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><MessageSquare className="h-5 w-5 text-[#0f6cbd]" />Facilitator Talk Track</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Talk Track"><X className="h-4 w-4" /></Button>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 text-sm leading-6">
        {!guide && <Unavailable />}
        {guide && <>
          <TalkTrackSection title="Session introduction" value={guide.sessionIntroduction} />
          <TalkTrackList title="Key talking points" values={guide.keyTalkingPoints} />
          <TalkTrackList title="Discussion questions" values={guide.discussionQuestions} />
          <TalkTrackList title="Suggested transitions" values={guide.suggestedTransitions} />
          <TalkTrackSection title="Wrap-up guidance" value={guide.wrapUpGuidance} />
        </>}
      </div>
      <footer className="flex flex-shrink-0 items-center border-t border-[#e1e4e8] bg-white px-6 py-3">
        <Button variant="ghost" onClick={onClose}><ChevronLeft className="mr-2 h-4 w-4" />Back to Huddle</Button>
      </footer>
    </aside>
  );
}

function TalkTrackSection({ title, value }: { title: string; value: string | null }) {
  return <section><h3 className="font-semibold">{title}</h3>{value ? <p className="mt-1 text-[#616161]">{value}</p> : <p className="mt-1 text-[#707070]">Content unavailable</p>}</section>;
}

function TalkTrackList({ title, values }: { title: string; values: readonly string[] }) {
  return <section><h3 className="font-semibold">{title}</h3>{values.length > 0 ? <ul className="mt-1 list-disc space-y-1 pl-5 text-[#616161]">{values.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul> : <p className="mt-1 text-[#707070]">Content unavailable</p>}</section>;
}

function Unavailable() {
  return <div className="rounded-xl border border-dashed border-[#d1d1d1] p-6 text-center"><p className="font-semibold">Facilitator guidance</p><p className="mt-1 text-[#707070]">Content unavailable</p></div>;
}

