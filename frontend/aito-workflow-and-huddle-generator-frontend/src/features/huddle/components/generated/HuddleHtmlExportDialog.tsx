import { useEffect, useState } from "react";
import { FileDown, X } from "lucide-react";

interface HuddleHtmlExportDialogProps {
  open: boolean;
  pending: boolean;
  initialNotes?: string | null;
  onCancel: () => void;
  onDownload: (facilitatorNotes: string | null) => void;
}

/** Collects optional facilitator notes before creating the self-contained HTML package. */
export function HuddleHtmlExportDialog({ open, pending, initialNotes, onCancel, onDownload }: HuddleHtmlExportDialogProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !pending) onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onCancel, open, pending]);

  if (!open) return null;

  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onCancel(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="html-export-dialog-title" className="w-full max-w-xl rounded-xl border bg-white shadow-2xl [font-family:var(--aito-font-sans)]">
      <header className="flex items-start justify-between gap-4 px-6 pb-3 pt-5"><div><h2 id="html-export-dialog-title" className="text-xl font-semibold text-[#242424]">Include Facilitator Notes</h2><p className="mt-1 text-sm leading-6 text-[#616161]">Would you like to include notes, observations, follow-up actions, or discussion insights in the exported Huddle package?</p></div><button type="button" disabled={pending} onClick={onCancel} aria-label="Close" className="rounded-md p-1.5 text-[#424242] hover:bg-[#F5F9FF] disabled:opacity-50"><X className="h-4 w-4" /></button></header>
      <div className="px-6 pb-5"><label htmlFor="export-facilitator-notes" className="text-sm font-semibold text-[#242424]">Facilitator Notes</label><textarea id="export-facilitator-notes" rows={8} autoFocus value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={"Enter any notes you would like included in the exported Huddle package.\n\nExamples:\nKey discussion points\nTeam observations\nFollow-up actions\nDecisions made\nAdditional context"} className="mt-1 w-full resize-y rounded-xl border border-[#8A8886] bg-white p-3 text-sm leading-5 outline-none transition focus:border-[#0A6BBA] focus:ring-2 focus:ring-[#0A6BBA]" /></div>
      <footer className="flex justify-end gap-2 border-t px-6 py-4"><button type="button" disabled={pending} onClick={onCancel} className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-semibold text-[#242424] hover:bg-[#F5F9FF] disabled:opacity-50">Cancel</button><button type="button" disabled={pending} onClick={() => onDownload(notes.trim() || null)} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0A6BBA] px-4 text-sm font-semibold text-white hover:bg-[#115EA3] disabled:opacity-50"><FileDown className="mr-2 h-4 w-4" />{pending ? "Downloading..." : "Download HTML"}</button></footer>
    </section>
  </div>;
}
