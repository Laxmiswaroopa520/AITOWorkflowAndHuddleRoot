import { useState } from "react";
import { X } from "lucide-react";

const reasons = ["Already know this", "Not relevant to my role", "Content is outdated", "Too basic", "Too advanced", "Other"];

interface HuddleDownvoteDialogProps {
  huddleName: string;
  onCancel: () => void;
  onSubmit: (reasons: string[], comment: string | null) => void;
}

export function HuddleDownvoteDialog({ huddleName, onCancel, onSubmit }: HuddleDownvoteDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const toggleReason = (reason: string) => setSelectedReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section role="dialog" aria-modal="true" aria-labelledby="downvote-title" className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="downvote-title" className="text-lg font-bold">Tell us why</h2><p className="mt-1 text-sm text-muted-foreground">Your feedback helps improve {huddleName}.</p></div><button type="button" onClick={onCancel} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{reasons.map((reason) => <label key={reason} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => toggleReason(reason)} className="accent-[#0F6CBD]" />{reason}</label>)}</div><label className="mt-4 block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Additional comments (optional)</span><textarea value={comment} maxLength={2000} onChange={(event) => setComment(event.target.value)} rows={3} className="w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="button" disabled={selectedReasons.length === 0} onClick={() => onSubmit(selectedReasons, comment.trim() || null)} className="h-10 rounded-lg bg-[#0F6CBD] px-4 text-sm font-semibold text-white hover:bg-[#115EA3] disabled:opacity-50">Submit feedback</button></div></section></div>;
}
