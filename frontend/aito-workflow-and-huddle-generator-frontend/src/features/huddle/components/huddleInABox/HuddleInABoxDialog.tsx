import { ArrowRight, X } from "lucide-react";

interface HuddleInABoxDialogProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

interface HuddleInABoxStep {
  title: string;
  body: string;
}

const STEPS: HuddleInABoxStep[] = [
  { title: "Open the template", body: "Open the self-contained HTML in your browser." },
  { title: "Choose how to customize it", body: "Build it with AI, create your own version, or edit it directly." },
  { title: "Review and run", body: "Make final edits, then download or present the finished Huddle with your team." },
];

/** "Create your own Huddle" entry point: explains the Huddle in a Box template and lets the
 * reader download the manager-provided HTML file unchanged. Available to every persona. */
export function HuddleInABoxDialog({ open, onClose, onDownload }: HuddleInABoxDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="huddle-in-a-box-title"
        className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl [font-family:var(--aito-font-sans)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0A6BBA]">Huddle in a Box</p>
            <h2 id="huddle-in-a-box-title" className="mt-1 text-xl font-bold text-[#242424]">Create your own Huddle</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
         Use Huddle in a Box when your team needs a huddle for a specific role, workflow, practice, or tool that is not covered by the recommended path or existing topic library.
        </p>

        <ol className="mt-5 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2F1F9] text-xs font-bold text-[#0A6BBA]">{index + 1}</span>
              <p className="text-sm leading-5 text-[#242424]">
                <span className="font-semibold">{step.title}</span>
                <br />
                <span className="text-muted-foreground">{step.body}</span>
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Close</button>
          <button type="button" onClick={onDownload} className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#0A6BBA] px-4 text-sm font-semibold text-white hover:bg-[#115EA3]">
            Download Huddle in a Box
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
