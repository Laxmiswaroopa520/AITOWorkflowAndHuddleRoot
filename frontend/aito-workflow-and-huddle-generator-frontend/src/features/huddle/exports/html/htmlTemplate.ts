import { escapeHtml } from "./htmlSanitizer";
import { huddleHtmlStyles } from "./htmlStyles";

/**
 * Wraps body markup in a standalone document. The Huddle guide passes its own
 * stylesheet; the Role Path and custom learning plan exports keep the default.
 */
export function createHtmlDocument(title: string, body: string, styles: string = huddleHtmlStyles): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title><style>${styles}</style></head><body>${body}</body></html>`;
}

export function downloadHtmlFile(html: string, fileName: string): void {
  const objectUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
