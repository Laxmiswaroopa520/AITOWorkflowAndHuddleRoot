import { useEffect } from "react";
import { Download, X } from "lucide-react";

interface HuddleGuideImageDialogProps {
  title: string;
  imageSrc: string;
  onClose: () => void;
  /** When set, a Download button saves the image under this name. The Role Path week popup leaves it out, since that click already downloads the PNG. */
  downloadFileName?: string;
}

/** Shows the persona's one-page Huddle guide, from a Role Path week's HTML download or the onboarding HTML Walkthrough. */
export function HuddleGuideImageDialog({ title, imageSrc, onClose, downloadFileName }: HuddleGuideImageDialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="huddle-guide-image-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border bg-white shadow-2xl [font-family:var(--aito-font-sans)]">
      <header className="flex items-center justify-between gap-4 border-b px-5 py-3"><h2 id="huddle-guide-image-title" className="text-lg font-semibold text-[#242424]">{title}</h2><div className="flex items-center gap-2">{downloadFileName && <a href={imageSrc} download={downloadFileName} className="inline-flex h-9 items-center rounded-lg bg-[#0A6BBA] px-3 text-sm font-semibold text-white hover:bg-[#115EA3]"><Download className="mr-2 h-4 w-4" />Download</a>}<button type="button" onClick={onClose} aria-label="Close" autoFocus className="rounded-md p-1.5 text-[#424242] hover:bg-[#F5F9FF]"><X className="h-4 w-4" /></button></div></header>
      <div className="min-h-0 overflow-auto p-4"><img src={imageSrc} alt={title} className="mx-auto h-auto w-full" /></div>
    </section>
  </div>;
}
